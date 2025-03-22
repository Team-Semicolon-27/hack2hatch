"use client";
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { io, Socket } from "socket.io-client";

// Define types for the messages and socket data
interface Message {
  sender: string;
  content: string;
}

interface SendMessageData {
  notionId: string;
  sender: string;
  message: string;
}

export default function Chat() {
  const [notionId, setNotionId] = useState<string>(""); // Room ID
  const [sender, setSender] = useState<string>(""); // Username
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("receiveMessage", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinRoom = () => {
    if (notionId && sender) {
      socketRef.current?.emit("joinRoom", notionId);
      console.log(`User ${sender} joined room ${notionId}`);
    }
  };

  const sendMessage = () => {
    if (message.trim() && notionId && sender) {
      const messageData: SendMessageData = {
        notionId,
        sender,
        message,
      };
      socketRef.current?.emit("sendMessage", messageData);
      setMessage(""); // Clear message input after sending
    }
  };

  // Handler for input changes
  const handleSenderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSender(e.target.value);
  };

  const handleNotionIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNotionId(e.target.value);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <input
        type="text"
        placeholder="Enter your name"
        value={sender}
        onChange={handleSenderChange}
      />
      <input
        type="text"
        placeholder="Notion ID (Room ID)"
        value={notionId}
        onChange={handleNotionIdChange}
      />
      <button onClick={joinRoom}>Join Room</button>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}: </strong> {msg.content}
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Type a message"
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyPress}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
