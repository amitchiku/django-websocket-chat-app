from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from rest_framework.authtoken.models import Token

from .serializers import (
    UserSerializer,
    UserListSerializer,
    InterestSerializer,
    MessageSerializer,
    InterestAddSerializer,
)

from .models import User, Interest, Messages


@api_view(['GET'])
def index(request):
    return Response("API's Floating")


class Home(APIView):
    def get(self, request):
        content = {'message': 'Hello, World!'}
        return Response(content)


# 1️⃣ Signup
class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 2️⃣ Login
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("data is here", request.data.get('username'))
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'usename': str(username),
                'user_id': user.id,
                'email': user.email
            })

        return Response(
            {"detail": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )


# 3️⃣ Get all users
class AuthenticatedUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data)


# 4️⃣ Send Interest
class SendInterestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver')

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Receiver not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.id == receiver_id:
            return Response(
                {"detail": "You cannot send interest to yourself."},
                status=status.HTTP_400_BAD_REQUEST
            )

        interest_data = {
            'sender': request.user.id,
            'receiver': receiver_id,
            'status': 'pending'
        }

        existing_interest = Interest.objects.filter(
            sender=request.user.id,
            receiver=receiver_id,
        ).first()

        if existing_interest:
            serializer = InterestAddSerializer(existing_interest)
            return Response(serializer.data, status=status.HTTP_200_OK)

        serializer = InterestAddSerializer(data=interest_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 5️⃣ Recieved Interest (Original Version)
class RecievedInterestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interests = Interest.objects.filter(
            Q(receiver=request.user) |
            Q(sender=request.user)
        )

        serializer = InterestSerializer(interests, many=True)
        return Response(serializer.data)


# 6️⃣ Accept Interest
class AcceptInterestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        interest_id = request.data.get('user_id')

        try:
            interest = Interest.objects.get(
                sender=interest_id,
                receiver=request.user,
                status='pending'
            )
        except Interest.DoesNotExist:
            return Response(
                {"detail": "Interest not found or not authorized."},
                status=status.HTTP_404_NOT_FOUND
            )

        interest.status = 'accepted'
        interest.save()
        return Response({"detail": "Interest accepted."})

    def get(self, request):
        interests = Interest.objects.filter(
            Q(sender=request.user, status='accepted') |
            Q(receiver=request.user, status='accepted')
        )

        serializer = InterestSerializer(interests, many=True)
        return Response(serializer.data)


# 7️⃣ Reject Interest
class RejectInterestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        interest_id = request.data.get('user_id')

        try:
            interest = Interest.objects.get(
                sender=interest_id,
                receiver=request.user,
                status='pending'
            )
        except Interest.DoesNotExist:
            return Response(
                {"detail": "Interest not found or not authorized."},
                status=status.HTTP_404_NOT_FOUND
            )

        interest.status = 'rejected'
        interest.save()
        return Response({"detail": "Interest rejected."})


# 8️⃣ Messages
class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        receiver_id = self.kwargs['id']

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Messages.objects.none()

        return Messages.objects.filter(
            Q(sender=self.request.user, receiver=receiver) |
            Q(sender=receiver, receiver=self.request.user)
        )

    def perform_create(self, serializer):
        receiver_id = self.kwargs['id']

        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Receiver not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer.save(sender=self.request.user, receiver=receiver)


# 9️⃣ Logout
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = Token.objects.get(user=request.user)
            token.delete()
            return Response(
                {"message": "Successfully logged out."},
                status=status.HTTP_200_OK
            )
        except Token.DoesNotExist:
            return Response(
                {"error": "Token not found."},
                status=status.HTTP_400_BAD_REQUEST
            )
