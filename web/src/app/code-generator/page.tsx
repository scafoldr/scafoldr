'use client';

import React, { useState } from 'react';
import AppHeader from '@/layout/app-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Code2, MessageSquare, X } from 'lucide-react';
import { ResizableLayout } from '@/components/resizable-layout';
import { Code } from '@/features/code-editor/components/Code';
import { DynamicERDiagram } from '@/components/dynamic-er-diagram';

// Sample DBML for initial state
const sampleDbml = `
Table users {
  id integer [primary key]
  username varchar [not null]
  email varchar [unique, not null]
  created_at timestamp [default: \`now()\`]
}

Table posts {
  id integer [primary key]
  title varchar [not null]
  content text
  user_id integer [ref: > users.id]
  created_at timestamp [default: \`now()\`]
}

Table comments {
  id integer [primary key]
  content text [not null]
  post_id integer [ref: > posts.id]
  user_id integer [ref: > users.id]
  created_at timestamp [default: \`now()\`]
}
`;

export default function CodeGeneratorPage() {
  const [dbmlCode, setDbmlCode] = useState(sampleDbml);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  // Create a mock file object for the Code component
  const dbmlFile = {
    id: 'schema.dbml',
    name: 'schema.dbml',
    content: dbmlCode,
    type: 0,
    parentId: 'root',
    depth: 1
  };

  // Handle AI generation (placeholder for now)
  const handleAiGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      // For now, just append the prompt as a comment to the DBML
      setDbmlCode((prev) => `// AI Prompt: ${aiPrompt}\n${prev}`);
      setAiPrompt('');
    }, 1500);
  };

  // Handle scaffold code generation (placeholder for now)
  const handleScaffoldCode = () => {
    alert('Scaffold code functionality will be implemented in the future.');
  };

  // Toggle AI chat panel
  const toggleAiChat = () => {
    setShowAiChat(!showAiChat);
  };

  // Left panel with DBML editor and AI chat
  const leftPanel = (
    <div className="h-full flex flex-col relative">
      {/* DBML Editor - takes full height when AI chat is hidden */}
      <div className="flex-1 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
        <Code selectedFile={dbmlFile} onFileEdit={setDbmlCode} />
      </div>

      {/* AI Chat Panel - slides up from bottom */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 
          bg-white dark:bg-slate-900 
          border-t border-slate-200 dark:border-slate-800 
          rounded-t-lg shadow-lg 
          transition-all duration-300 ease-in-out
          ${showAiChat ? 'h-[40%]' : 'h-0 opacity-0 pointer-events-none'}
      `}>
        {showAiChat && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-medium">AI Assistant</h3>
              <Button variant="ghost" size="sm" onClick={toggleAiChat} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-2 overflow-y-auto">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mb-2 max-w-[80%]">
                <p className="text-sm">How can I help you with your database schema?</p>
              </div>
            </div>
            <div className="p-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Describe your database schema..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[60px] resize-none text-sm"
                />
                <Button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white self-end">
                  {isGenerating ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <span>Send</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Button - More accent and visible */}
      {!showAiChat && (
        <div className="absolute bottom-4 left-4 z-10">
          <Button
            onClick={toggleAiChat}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white
                     shadow-lg hover:shadow-xl transition-all duration-300
                     hover:animate-none
                     font-medium">
            <MessageSquare className="w-5 h-5 mr-2" />
            AI Assistant
          </Button>
        </div>
      )}
    </div>
  );

  // Right panel with diagram
  const rightPanel = (
    <div className="h-full relative">
      {/* Dynamic ER Diagram */}
      <DynamicERDiagram dbmlCode={dbmlCode} />

      {/* Floating Scaffold Button */}
      <div className="absolute bottom-4 right-4 z-20">
        <Button
          onClick={handleScaffoldCode}
          size="lg"
          className={`
            bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white
            shadow-lg transition-all duration-3000 ease-in-out
            ${isButtonHovered ? 'scale-105 shadow-xl' : ''}
            animate-heartbeat hover:animate-none
          `}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}>
          <Code2 className="w-5 h-5 mr-2" />
          Scaffold Code
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <AppHeader activeProjectId={'Test project'} generatedFiles={{}} />

      {/* Main Content with Resizable Layout */}
      <ResizableLayout
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        defaultLeftWidth={500}
        minLeftWidth={350}
        maxLeftWidth={800}
      />
    </div>
  );
}
