import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { Message, MessageType, MessageFrom } from '../types/chat.types';
import { motion } from "framer-motion";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.from === MessageFrom.USER;
  
  // Handle DBML messages - these will need integration with ER diagram component
  if (message.type === MessageType.DBML) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex space-x-3"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="inline-block p-3 rounded-lg rounded-bl-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
            <p className="text-sm mb-2">I've generated your database schema:</p>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border text-xs font-mono">
              <pre className="whitespace-pre-wrap">{message.text}</pre>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </motion.div>
    );
  }

  // Handle call to action messages
  if (message.type === MessageType.CALL_TO_ACTION) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex space-x-3"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="inline-block p-3 rounded-lg rounded-bl-sm bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100">
            <p className="text-sm font-medium">✅ Done! You can now generate backend code!</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </motion.div>
    );
  }

  // Handle error messages
  if (message.type === MessageType.ERROR) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex space-x-3"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-red-100 dark:bg-red-900">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="inline-block p-3 rounded-lg rounded-bl-sm bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100">
            <p className="text-sm">❌ {message.text}</p>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </motion.div>
    );
  }

  // Handle loading messages
  if (message.type === MessageType.LOADING) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex space-x-3"
      >
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="inline-block p-3 rounded-lg rounded-bl-sm bg-slate-100 dark:bg-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">{message.text}</span>
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
        </div>
      </motion.div>
    );
  }

  // Handle regular text messages
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
    >
      <Avatar className="w-8 h-8">
        <AvatarFallback
          className={
            isUser ? "bg-blue-100 dark:bg-blue-900" : "bg-purple-100 dark:bg-purple-900"
          }
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block p-3 rounded-lg text-sm ${
            isUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}