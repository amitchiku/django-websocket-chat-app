from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
import jwt
from django.conf import settings
from urllib.parse import parse_qs


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("🔥 CONNECT CALLED 🔥")
        
        # Initialize room_group_name to avoid AttributeError in disconnect
        self.room_group_name = None
        self.user_id = None

        # Get query parameters
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)

        token = query_params.get('token', [None])[0]
        recipient_id = query_params.get('recipient', [None])[0]

        print(f"Token: {token[:20]}..." if token else "No token")
        print(f"Recipient ID: {recipient_id}")

        if not token or not recipient_id:
            print("❌ Missing token or recipient")
            await self.close()
            return

        # Decode JWT safely
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            self.user_id = user_id
            print(f"✅ Authenticated user: {user_id}")
        except jwt.ExpiredSignatureError:
            print("❌ JWT TOKEN EXPIRED")
            await self.close()
            return
        except jwt.InvalidTokenError as e:
            print(f"❌ INVALID JWT TOKEN: {e}")
            await self.close()
            return
        except Exception as e:
            print(f"❌ JWT ERROR: {e}")
            await self.close()
            return

        # Generate consistent room name
        self.room_group_name = self.get_room_name(user_id, recipient_id)

        print(f"🔗 Joining room: {self.room_group_name}")

        # Join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept connection
        await self.accept()

        # Confirmation message
        await self.send(text_data=json.dumps({
            'type': 'websocket_connected',
            'room': self.room_group_name,
            'user_id': user_id
        }))
        print(f"✅ WebSocket ACCEPTED for room: {self.room_group_name}")


    async def disconnect(self, close_code):
        print(f"❌ WebSocket disconnected with code: {close_code}")

        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f"🔓 Discarded from room: {self.room_group_name}")


    async def receive(self, text_data):
        print("📩 MESSAGE RECEIVED")

        text_data_json = json.loads(text_data)
        message = text_data_json.get('message')
        receiver_id = text_data_json.get('receiver')

        if not message or not receiver_id:
            print("Invalid message payload")
            return

        sender_id = self.user_id

        # Save message to DB
        await self.save_message(sender_id, receiver_id, message)

        # Broadcast message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender_id,
            }
        )


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
        }))


    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, message):
        from .models import User, Messages

        sender = User.objects.get(id=sender_id)
        receiver = User.objects.get(id=receiver_id)

        Messages.objects.create(
            sender=sender,
            receiver=receiver,
            message=message
        )


    def get_room_name(self, user1_id, user2_id):
        user1_id = int(user1_id)
        user2_id = int(user2_id)
        return f"chat_{min(user1_id, user2_id)}_{max(user1_id, user2_id)}"
