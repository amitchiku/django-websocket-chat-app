import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AuthGuard from '../services/AuthGuard';

const Chat = ({ recipientId }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [chatSocket, setChatSocket] = useState(null);
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        const token = userData.access;
        const socket = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}&recipient=${recipientId}`);

        socket.onopen = () => {
            console.log('WebSocket connection opened');
            setChatSocket(socket);
        };

        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'websocket_connected') {
                console.log('Connected to room:', data.room);
            } else {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            }
        };

        socket.onclose = () => {
            console.log('Chat socket closed unexpectedly');
        };

        socket.onerror = (error) => {
            console.error('WebSocket error observed:', error);
        };

        return () => {
            socket.close();
        };
    }, [recipientId]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (chatSocket && message) {
            chatSocket.send(JSON.stringify({
                'message': message,
                'receiver': recipientId
            }));
            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default AuthGuard(Chat);
