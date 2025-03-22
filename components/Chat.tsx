"use client"
import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react"
import { useSession } from "next-auth/react"
import { io, type Socket } from "socket.io-client"
import { Send, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  sender: string
  content: string
  notionId: string
  createdAt?: Date
}

interface SendMessageData {
  notionId: string
  sender: string
  message: string
}

export default function Chat({ notionId }: { notionId: string }) {
  const { data: session } = useSession()
  const [sender, setSender] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Add this state to track if user is at bottom
  const [isAtBottom, setIsAtBottom] = useState(true)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Replace the existing auto-scroll effect with this improved version
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container && isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isAtBottom])

  // Add this function to handle scroll events
  const handleScroll = () => {
    const container = messagesContainerRef.current
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container
      // Consider "at bottom" if within 100px of the bottom
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100)
    }
  }

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5000")

    // Set up event listeners
    socketRef.current.on("receiveMessage", (data: Message) => {
      console.log("📩 Received new message:", data)
      setMessages((prev) => [...prev, data])
    })

    // Load old messages when joining
    socketRef.current.on("loadOldMessages", (oldMessages: Message[]) => {
      console.log("📥 Received old messages:", oldMessages)
      setMessages(oldMessages)
    })

    // Join room if we have user info and notion ID
    if (session?.user?.username && notionId) {
      setSender(session.user.username)
      socketRef.current.emit("joinRoom", notionId)
      console.log(`User ${session.user.username} joined room ${notionId}`)
    }

    // Cleanup on component unmount
    return () => {
      socketRef.current?.disconnect()
    }
  }, [session, notionId])

  const sendMessage = () => {
    if (message.trim() && notionId && sender) {
      const messageData: SendMessageData = { notionId, sender, message }
      socketRef.current?.emit("sendMessage", messageData)

      // Optimistically add message to UI
      const newMessage: Message = {
        sender,
        content: message,
        notionId,
      }
      setMessages((prev) => [...prev, newMessage])

      setMessage("")
    }
  }

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto shadow-lg border-0">
      <CardHeader className="pb-2 pt-4 px-4 border-b bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-xl font-bold">Chat Room</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-orange-50 mt-1">
          <User className="h-4 w-4" />
          <span>{sender || "Loading..."}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-0 overflow-hidden">
        <div ref={messagesContainerRef} onScroll={handleScroll} className="h-[420px] p-4 bg-gray-50 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={cn("flex", msg.sender === sender ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                      msg.sender === sender
                        ? "bg-orange-500 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-800 rounded-tl-none",
                    )}
                  >
                    <div
                      className={cn(
                        "font-medium text-xs mb-1",
                        msg.sender === sender ? "text-orange-100" : "text-gray-600",
                      )}
                    >
                      {msg.sender}
                    </div>
                    <div className="break-words">{msg.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t bg-gray-50">
        <div className="flex w-full gap-2 items-center">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyPress}
            className="flex-grow border-gray-200 focus:border-orange-300 focus:ring-orange-300"
          />
          <Button onClick={sendMessage} className="bg-orange-500 hover:bg-orange-600 text-white" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

