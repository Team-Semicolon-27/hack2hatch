import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import MessageModel from "./model/message.js"; // Make sure this path is correct

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

// Socket.io logic
io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  // Handle joining a room
  socket.on("joinRoom", async (notionId) => {
    socket.join(notionId);
    console.log(`👤 User ${socket.id} joined room ${notionId}`);
    
    try {
      // Fetch previous messages for the room
      const previousMessages = await MessageModel.find({ notionId })
        .sort({ createdAt: 1 })
        .lean();
      
      console.log(`📝 Fetched ${previousMessages.length} messages for room ${notionId}`);
      
      // Send old messages to the joining user
      socket.emit("loadOldMessages", previousMessages);
    } catch (error) {
      console.error("❌ Error fetching old messages:", error);
      socket.emit("error", { message: "Failed to load message history" });
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    try {
      // Create a new message document
      const newMessage = new MessageModel({
        notionId: data.notionId,
        sender: data.sender,
        content: data.message,
        createdAt: new Date()
      });
      
      // Save to database
      await newMessage.save();
      console.log("💾 Message saved to database");
      
      // Broadcast to all clients in the room except sender
      socket.to(data.notionId).emit("receiveMessage", {
        sender: data.sender,
        content: data.message,
        notionId: data.notionId,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("❌ Error saving message:", error);
      socket.emit("error", { message: "Failed to save message" });
    }
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Define a health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));