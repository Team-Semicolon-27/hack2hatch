"use client";
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface Message {
  sender: string;
  content: string;
  notionId: string;
  createdAt?: Date;
}

interface SendMessageData {
  notionId: string;
  sender: string;
  message: string;
}

export default function Chat({ notionId }: { notionId: string }) {
  const { data: session } = useSession();
  const [sender, setSender] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5000");
    
    // Set up event listeners
    socketRef.current.on("receiveMessage", (data: Message) => {
      console.log("📩 Received new message:", data);
      setMessages((prev) => [...prev, data]);
    });

    // Load old messages when joining
    socketRef.current.on("loadOldMessages", (oldMessages: Message[]) => {
      console.log("📥 Received old messages:", oldMessages);
      setMessages(oldMessages);
    });

    // Join room if we have user info and notion ID
    if (session?.user?.username && notionId) {
      setSender(session.user.username);
      socketRef.current.emit("joinRoom", notionId);
      console.log(`User ${session.user.username} joined room ${notionId}`);
    }

    // Cleanup on component unmount
    return () => {
      socketRef.current?.disconnect();
    };
  }, [session, notionId]);

  const sendMessage = () => {
    if (message.trim() && notionId && sender) {
      const messageData: SendMessageData = { notionId, sender, message };
      socketRef.current?.emit("sendMessage", messageData);
      
      // Optimistically add message to UI
      const newMessage: Message = {
        sender,
        content: message,
        notionId
      };
      setMessages((prev) => [...prev, newMessage]);
      
      setMessage("");
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Chat Room: {notionId}</h2>
      <p className="text-sm text-gray-600 mb-4">Logged in as: {sender || "Loading..."}</p>

      <div className="flex-grow overflow-auto mb-4 p-4 border rounded-lg bg-gray-50 h-96">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-2 p-2 rounded-lg ${
                msg.sender === sender 
                  ? "bg-blue-100 ml-auto max-w-xs" 
                  : "bg-gray-200 mr-auto max-w-xs"
              }`}
            >
              <div className="font-semibold text-xs text-gray-700">{msg.sender}</div>
              <div>{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyPress}
          className="flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button 
          onClick={sendMessage} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
}