"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import axios from "axios"
import { useSession } from "next-auth/react"
import { MessageCircle, Send, X, Loader2, Newspaper, Bot } from "lucide-react"

interface Chat {
  userInput: string
  response: string
}

const FloatingChatbot = () => {
  const { data: session } = useSession()
  const [chat, setChat] = useState<Chat[]>([{ 
    userInput: "Hi!", 
    response: "Hello! I'm your AI assistant. I can provide you with the latest news and information. Ask me anything!" 
  }])
  const [userMessage, setUserMessage] = useState("")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const convertLinksToAnchors = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g
    return text.replace(urlPattern, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#ff9500] hover:text-orange-700 underline">${url}</a>`
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chat])

  const handleSendMessage = async () => {
    if (!userMessage.trim() || isLoading) return

    try {
      setIsLoading(true)
      // Add user message immediately
      setChat((prev) => [...prev, { userInput: userMessage, response: "..." }])

      const response = await axios.post("/api/aiChatBot", {
        query: userMessage,
      })

      // Update the last message with the actual response
      setChat((prev) => {
        const newChat = [...prev]
        newChat[newChat.length - 1].response = response.data.response
        return newChat
      })

      setUserMessage("")
    } catch (error) {
      console.error("Chat error:", error)
      // Update the last message with error
      setChat((prev) => {
        const newChat = [...prev]
        newChat[newChat.length - 1].response = "Sorry, I encountered an error retrieving the latest information. Please try again."
        return newChat
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!session) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 md:bottom-8 md:right-8">
      {!isChatOpen ? (
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 md:w-16 md:h-16 bg-[#ff9500] rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 transform duration-200 ease-in-out m-4 md:m-0"
          aria-label="Open chat"
        >
          <Bot className="text-white w-7 h-7 md:w-8 md:h-8" />
        </button>
      ) : (
        <div className="flex flex-col w-full h-screen md:h-[600px] md:w-[380px] bg-[#EEEEEE] md:rounded-2xl shadow-2xl border border-gray-300 transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-[#ff9500] text-white p-4 md:rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <Newspaper className="w-5 h-5" />
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">News & Info Assistant</h3>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-white hover:bg-orange-600 p-1.5 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#EEEEEE]">
            {chat.map((msg, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-[#ff9500] text-white p-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                    {msg.userInput}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div
                    className="bg-white text-gray-800 p-3 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm"
                    dangerouslySetInnerHTML={{
                      __html: convertLinksToAnchors(msg.response),
                    }}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-[#EEEEEE] border-t border-gray-300 md:rounded-b-2xl">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about news or startup information..."
                className="flex-1 p-3 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ff9500] placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className={`p-3 rounded-full bg-[#ff9500] text-white ${
                  isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-orange-600 active:scale-95"
                } transition-all duration-200`}
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingChatbot