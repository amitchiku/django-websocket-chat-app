import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AuthGuard from "../services/AuthGuard";

function Chat() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ✅ Safe localStorage parsing
  const storedData = localStorage.getItem("user");
  const userData = storedData ? JSON.parse(storedData) : null;
  const accessToken = userData?.access;
  const userEmail = userData?.email;

  // 🔹 Fetch accepted users
  useEffect(() => {
    if (!accessToken) return;

    const fetchAcceptedUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/accept-interest/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAcceptedUsers();
  }, [accessToken]);

  // 🔹 WebSocket connection
  useEffect(() => {
    if (!selectedUserId || !accessToken) {
      console.warn("❌ Missing selectedUserId or accessToken");
      return;
    }

    // Close previous socket if exists
    if (socketRef.current) {
      socketRef.current.close();
    }

    console.log(`🔗 Connecting to WebSocket for user ${selectedUserId} with token...`);

    const ws = new WebSocket(
      `ws://localhost:8000/ws/chat/?token=${accessToken}&recipient=${selectedUserId}`
    );

    ws.onopen = () => {
      console.log("✅ WebSocket CONNECTED");
      socketRef.current = ws;
    };

    ws.onmessage = (event) => {
      console.log("📩 Message received:", event.data);
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("❌ Failed to parse message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket ERROR:", error);
      console.error("WebSocket ready state:", ws.readyState);
    };

    ws.onclose = (event) => {
      console.log(`❌ WebSocket CLOSED - Code: ${event.code}, Reason: ${event.reason}`);
      socketRef.current = null;
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [selectedUserId, accessToken]);

  // 🔹 Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Select user
  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setMessages([]);
  };

  // 🔹 Send message
  const sendMessage = (e) => {
    e.preventDefault();

    if (!socketRef.current) return;
    if (!message.trim()) return;

    socketRef.current.send(
      JSON.stringify({
        receiver: selectedUserId,
        message: message,
        sender: userEmail,
      })
    );

    setMessage("");
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#f4f6f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "950px",
          height: "600px",
          background: "#fff",
          display: "flex",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: "30%",
            borderRight: "1px solid #eee",
            padding: "20px",
            background: "#fafafa",
            overflowY: "auto",
          }}
        >
          <h4 style={{ marginBottom: "20px" }}>Chat Members</h4>

          {users.map((item, index) => {
            const isSender = item.sender.email === userEmail;
            const user = isSender ? item.receiver : item.sender;

            return (
              <div
                key={`${user.id}-${index}`}  // ✅ fixed duplicate key
                onClick={() => handleUserClick(user.id)}
                style={{
                  padding: "12px",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background:
                    selectedUserId === user.id ? "#e3f2fd" : "#ffffff",
                  border: "1px solid #e0e0e0",
                }}
              >
                <strong>{user.username}</strong>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {user.email}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Area */}
        <div
          style={{
            width: "70%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              background: "#f9fafc",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={`${msg.sender}-${msg.message}-${index}`}  // ✅ fixed duplicate key
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  flexDirection:
                    msg.sender === userEmail ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    maxWidth: "60%",
                    padding: "10px 14px",
                    borderRadius: "18px",
                    background:
                      msg.sender === userEmail
                        ? "#4CAF50"
                        : "#e0e0e0",
                    color:
                      msg.sender === userEmail ? "#fff" : "#000",
                    fontSize: "14px",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "15px",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "10px",
            }}
          >
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="2"
              style={{
                flex: 1,
                resize: "none",
                borderRadius: "8px",
                border: "1px solid #ccc",
                padding: "10px",
              }}
              placeholder="Type your message..."
            />
            <button
              onClick={sendMessage}
              style={{
                background: "#4CAF50",
                color: "#fff",
                border: "none",
                padding: "0 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthGuard(Chat);
