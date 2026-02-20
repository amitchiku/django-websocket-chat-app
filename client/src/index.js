import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './pages/login';
import Signup from './pages/signup';
import Chat from './pages/chat';
import ChatRoom from './pages/chatRoom';
import Dashboard from './pages/dashboard';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat-room" element={<ChatRoom />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
