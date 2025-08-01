import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bot, ChevronDown, ChevronUp, Database, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatResultMessageProps {
  dbmlCode: string;
  timestamp: Date;
  title?: string;
  // eslint-disable-next-line no-unused-vars
  onViewDB?: (dbmlCode: string) => void;
}

export function ChatResultMessage({
  dbmlCode,
  timestamp,
  title = "I've generated your database schema:",
  onViewDB
}: ChatResultMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex space-x-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 max-w-[85%]">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg rounded-bl-sm p-4 space-y-3">
          {/* Header with database icon and title */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</span>
          </div>

          {/* Collapsible DBML Code */}
          <div className="space-y-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left p-2 bg-slate-50 dark:bg-slate-900 rounded border hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                View database schema
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 dark:bg-slate-900 p-3 rounded border text-xs font-mono overflow-x-auto">
                <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {dbmlCode}
                </pre>
              </motion.div>
            )}
          </div>

          {/* View DB Button */}
          <div className="mt-3">
            <Button
              onClick={() => onViewDB?.(dbmlCode)}
              className="bg-blue-600 hover:bg-blue-700 text-dark dark:text-white shadow-sm dark:shadow-md transition-all duration-200">
              <GitBranch className="w-4 h-4 mr-2" />
              View DB
            </Button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}
