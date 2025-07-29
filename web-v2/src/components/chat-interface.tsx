"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "assistant",
    content:
      "Hi! I'm here to help you build your task management app. I've analyzed your requirements and created an initial database schema with Users, Projects, and Tasks tables. What would you like to modify or add?",
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: "2",
    type: "user",
    content: "Can you add a comments system for tasks? Users should be able to comment on tasks and reply to comments.",
    timestamp: new Date(Date.now() - 240000),
  },
  {
    id: "3",
    type: "assistant",
    content:
      "Great idea! I'll add a Comments table with support for nested replies. The schema will include:\n\n• Comments table with task_id, user_id, content, parent_comment_id\n• Proper relationships for threaded discussions\n• Timestamps for creation and updates\n\nI'm updating the ER diagram and generating the API endpoints now.",
    timestamp: new Date(Date.now() - 180000),
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I understand your request. Let me implement that change and update the application structure accordingly. This will involve modifying the database schema and generating new API endpoints.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-slate-500">Building your app...</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex space-x-3 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className={
                    message.type === "user" ? "bg-blue-100 dark:bg-blue-900" : "bg-purple-100 dark:bg-purple-900"
                  }
                >
                  {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>

              <div className={`flex-1 max-w-[85%] ${message.type === "user" ? "text-right" : ""}`}>
                <div
                  className={`inline-block p-3 rounded-lg text-sm ${
                    message.type === "user"
                      ? "bg-blue-500 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="inline-block p-3 rounded-lg rounded-bl-sm bg-slate-100 dark:bg-slate-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe changes or ask questions..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
