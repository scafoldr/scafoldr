'use client';

import React, { useState } from 'react';
import AppHeader from '@/layout/app-header';
import { Button } from '@/components/ui/button';
import { Code2, MessageSquare, X, ChevronRight } from 'lucide-react';
import { ResizableLayout } from '@/components/resizable-layout';
import { Code } from '@/features/code-editor/components/Code';
import { DynamicERDiagram } from '@/components/dynamic-er-diagram';
import { DbmlAssistant } from '@/features/dbml-assistant';

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
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [currentRightPanel, setCurrentRightPanel] = useState<'diagram' | 'codeForm' | 'results'>(
    'diagram'
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [visitedPanels, setVisitedPanels] = useState<Set<'diagram' | 'codeForm' | 'results'>>(
    new Set(['diagram'] as ('diagram' | 'codeForm' | 'results')[])
  );
  const [codeFormData, setCodeFormData] = useState({
    framework: 'nextjs',
    language: 'typescript',
    includeAuth: true,
    includeCrud: true,
    outputPath: './generated'
  });

  // Create a mock file object for the Code component
  const dbmlFile = {
    id: 'schema.dbml',
    name: 'schema.dbml',
    content: dbmlCode,
    type: 0,
    parentId: 'root',
    depth: 1
  };

  // Handle scaffold code generation - switch to form panel
  const handleScaffoldCode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRightPanel('codeForm');
      setVisitedPanels((prev) => new Set([...Array.from(prev), 'codeForm' as const]));
      setIsTransitioning(false);
    }, 150);
  };

  // Handle form submission
  const handleGenerateCode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRightPanel('results');
      setVisitedPanels((prev) => new Set([...Array.from(prev), 'results' as const]));
      setIsTransitioning(false);
    }, 150);
  };

  // Handle back to diagram
  const handleBackToDiagram = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRightPanel('diagram');
      setIsTransitioning(false);
    }, 150);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (panel: 'diagram' | 'codeForm' | 'results') => {
    if (panel !== currentRightPanel && visitedPanels.has(panel)) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentRightPanel(panel);
        setIsTransitioning(false);
      }, 150);
    }
  };

  // Breadcrumb component
  const Breadcrumbs = () => {
    const allSteps = [
      { id: 'diagram', label: 'Schema Diagram' },
      { id: 'codeForm', label: 'Configure Generation' },
      { id: 'results', label: 'Generated Code' }
    ];

    // Filter to show only visited steps
    const availableSteps = allSteps.filter((step) =>
      visitedPanels.has(step.id as 'diagram' | 'codeForm' | 'results')
    );

    return (
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center space-x-2 text-sm">
          {availableSteps.map((step, index) => {
            const isActive = currentRightPanel === step.id;
            const isClickable = visitedPanels.has(step.id as 'diagram' | 'codeForm' | 'results');

            return (
              <div key={step.id} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />}
                <button
                  onClick={() =>
                    handleBreadcrumbClick(step.id as 'diagram' | 'codeForm' | 'results')
                  }
                  className={`
                    px-3 py-1 rounded transition-colors
                    ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                        : isClickable
                          ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }
                  `}
                  disabled={!isClickable}>
                  {step.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
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
            <DbmlAssistant setDbmlCode={setDbmlCode} />
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

  // Code generation form panel
  const codeFormPanel = (
    <div className="flex-1 p-6 bg-white dark:bg-slate-900 overflow-y-auto h-full">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Generate Code</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Configure your code generation options
          </p>
        </div>

        <div className="space-y-4">
          {/* Framework Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Framework
            </label>
            <select
              value={codeFormData.framework}
              onChange={(e) => setCodeFormData((prev) => ({ ...prev, framework: e.target.value }))}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
              <option value="nextjs">Next.js</option>
              <option value="express">Express.js</option>
              <option value="spring">Spring Boot</option>
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Language
            </label>
            <select
              value={codeFormData.language}
              onChange={(e) => setCodeFormData((prev) => ({ ...prev, language: e.target.value }))}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={codeFormData.includeAuth}
                onChange={(e) =>
                  setCodeFormData((prev) => ({ ...prev, includeAuth: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Include Authentication
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={codeFormData.includeCrud}
                onChange={(e) =>
                  setCodeFormData((prev) => ({ ...prev, includeCrud: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Include CRUD Operations
              </span>
            </label>
          </div>

          {/* Output Path */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Output Path
            </label>
            <input
              type="text"
              value={codeFormData.outputPath}
              onChange={(e) => setCodeFormData((prev) => ({ ...prev, outputPath: e.target.value }))}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="./generated"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button onClick={handleBackToDiagram} variant="outline" className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleGenerateCode}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            Generate
          </Button>
        </div>
      </div>
    </div>
  );

  // Results panel
  const resultsPanel = (
    <div className="flex-1 p-6 bg-white dark:bg-slate-900 overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Code Generated Successfully!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your code has been generated and is ready for download
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
          <h3 className="font-medium text-slate-900 dark:text-white mb-2">Generated Files:</h3>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            <li>• src/models/User.ts</li>
            <li>• src/models/Post.ts</li>
            <li>• src/models/Comment.ts</li>
            <li>• src/api/routes/users.ts</li>
            <li>• src/api/routes/posts.ts</li>
            <li>• src/api/routes/comments.ts</li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleBackToDiagram} variant="outline" className="flex-1">
            Back to Diagram
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white">
            Download Code
          </Button>
        </div>
      </div>
    </div>
  );

  // Right panel with smooth transitions
  const rightPanel = (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Panel Container with smooth transitions */}
      <div
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}>
        {currentRightPanel === 'diagram' && (
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
        )}

        {currentRightPanel === 'codeForm' && codeFormPanel}
        {currentRightPanel === 'results' && resultsPanel}
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
