// api/messages/[notionId].js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import MessageModel from "../../models/message"; // Adjust path as needed

export default async function handler(req, res) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { notionId } = req.query;
  const chatType = req.query.chatType;

  if (req.method === "GET") {
    try {
      // Determine the room identifier based on chat type
      let roomIdentifier;
      
      if (chatType === "teamOwner") {
        roomIdentifier = `team_${notionId}`;
      } else if (chatType === "ownerMentor" || chatType === "mentor") {
        roomIdentifier = `mentor_${notionId}`;
      } else {
        // If no valid chatType provided, just use notionId
        roomIdentifier = notionId;
      }

      // Fetch messages from database
      const messages = await MessageModel.find({ notionId: roomIdentifier })
        .sort({ createdAt: 1 }) // Oldest first
        .lean();

      return res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}