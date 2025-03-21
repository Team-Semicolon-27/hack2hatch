import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import MessageModel from "./model/message.js"; // Import Model

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// WebSocket Logic
io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  // Join Room
  socket.on("joinRoom", (notionId) => {
    socket.join(notionId);
    console.log(`👤 User ${socket.id} joined room ${notionId}`);
  });

  // Handle Messages
  socket.on("sendMessage", async ({ notionId, sender, message }) => {
    console.log("📩 Message to:", notionId);
    
    const msgData = new MessageModel({ notionId, sender, content: message });

    try {
      console.log('hello');
      
      await msgData.save(); // Save to MongoDB
      io.to(notionId).emit("receiveMessage", msgData); // Emit to room
    } catch (error) {
      console.error("❌ Error saving message:", error);
    }
  });

  // Disconnect Event
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
