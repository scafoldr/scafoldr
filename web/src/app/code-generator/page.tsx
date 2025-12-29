'use client';

import React, { useState } from 'react';
import AppHeader from '@/layout/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code2, MessageSquare, X, ChevronRight } from 'lucide-react';
import { ResizableLayout } from '@/components/resizable-layout';
import { Code } from '@/features/code-editor/components/Code';
import { CodeEditor } from '@/features/code-editor';
import { DynamicERDiagram } from '@/components/dynamic-er-diagram';
import { DbmlAssistant } from '@/features/dbml-assistant';
import TemplateCatalog from '@/features/templates/templates-catalog';
import { TEMPLATES } from '@/features/templates/constants/templates';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Parser } from '@dbml/core';

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
  const [codeFormData, setCodeFormData] = useState({
    selectedTemplateId: TEMPLATES[0].id,
    projectName: ''
  });
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);

  // DBML validation function
  const validateDbml = (dbml: string): { isValid: boolean; error?: string } => {
    if (!dbml.trim()) {
      return { isValid: false, error: 'DBML code is empty' };
    }

    try {
      const parser = new Parser();
      const db = parser.parse(dbml, 'dbml');

      // Check if we have at least one table
      if (db.schemas.length === 0 || db.schemas[0].tables.length === 0) {
        return { isValid: false, error: 'DBML must contain at least one table' };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid DBML syntax'
      };
    }
  };

  // Get current DBML validation state
  const dbmlValidation = validateDbml(dbmlCode);

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
    // Only allow if DBML code is valid
    if (!dbmlValidation.isValid) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRightPanel('codeForm');
      setIsTransitioning(false);
    }, 150);
  };

  // Handle form submission
  const handleGenerateCode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentRightPanel('results');
      setHasGeneratedCode(true);
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
    // Check if step is enabled
    const isStepEnabled = (stepId: string) => {
      if (stepId === 'diagram') return true; // Always enabled
      if (stepId === 'codeForm') return dbmlValidation.isValid; // Enabled if DBML code is valid
      if (stepId === 'results') return hasGeneratedCode; // Enabled if code has been generated
      return false;
    };

    if (panel !== currentRightPanel && isStepEnabled(panel)) {
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

    // Check if step is enabled based on business rules
    const isStepEnabled = (stepId: string) => {
      if (stepId === 'diagram') return true; // Always enabled
      if (stepId === 'codeForm') return dbmlValidation.isValid; // Enabled if DBML code is valid
      if (stepId === 'results') return hasGeneratedCode; // Enabled if code has been generated
      return false;
    };

    // Get tooltip message for disabled steps
    const getTooltipMessage = (stepId: string) => {
      if (stepId === 'codeForm' && !dbmlValidation.isValid) {
        return (
          dbmlValidation.error || 'Please provide valid DBML code to enable configuration step'
        );
      }
      if (stepId === 'results' && !hasGeneratedCode) {
        return 'Complete the configuration step to enable generated code view';
      }
      return '';
    };

    // Show all steps, but disable based on rules
    const availableSteps = allSteps;

    return (
      <TooltipProvider>
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            {availableSteps.map((step, index) => {
              const isActive = currentRightPanel === step.id;
              const isEnabled = isStepEnabled(step.id);
              const tooltipMessage = getTooltipMessage(step.id);

              return (
                <div key={step.id} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />}
                  {!isEnabled && tooltipMessage ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() =>
                            handleBreadcrumbClick(step.id as 'diagram' | 'codeForm' | 'results')
                          }
                          className={`
                            px-3 py-1 rounded transition-colors
                            ${
                              isActive
                                ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                                : isEnabled
                                  ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  : 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                            }
                          `}
                          disabled={!isEnabled}>
                          {step.label}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tooltipMessage}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <button
                      onClick={() =>
                        handleBreadcrumbClick(step.id as 'diagram' | 'codeForm' | 'results')
                      }
                      className={`
                        px-3 py-1 rounded transition-colors
                        ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                            : isEnabled
                              ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              : 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                        }
                      `}
                      disabled={!isEnabled}>
                      {step.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </TooltipProvider>
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Configure Generation
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Select a framework template and enter your project name
          </p>
        </div>

        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Project Name
            </label>
            <Input
              type="text"
              value={codeFormData.projectName}
              onChange={(e) =>
                setCodeFormData((prev) => ({ ...prev, projectName: e.target.value }))
              }
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="my-awesome-project"
            />
          </div>

          {/* Framework Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
              Select Framework Template
            </label>

            <TemplateCatalog
              selectedTemplateId={codeFormData.selectedTemplateId}
              setSelectedTemplateId={(templateId) =>
                setCodeFormData((prev) => ({ ...prev, selectedTemplateId: templateId }))
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-6">
          <Button
            onClick={handleGenerateCode}
            disabled={!codeFormData.projectName.trim()}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg font-semibold">
            Generate Code
          </Button>
          <div className="flex justify-center">
            <Button
              onClick={handleBackToDiagram}
              variant="ghost"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
              Back to Diagram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Mock generated files for the CodeEditor (FileMap format: Record<string, string>)
  const generatedFiles = {
    'src/models/User.ts': `export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export class UserModel {
  constructor(
    public id: number,
    public username: string,
    public email: string,
    public created_at: Date = new Date()
  ) {}

  static fromJSON(json: any): UserModel {
    return new UserModel(
      json.id,
      json.username,
      json.email,
      new Date(json.created_at)
    );
  }

  toJSON(): any {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      created_at: this.created_at.toISOString()
    };
  }
}`
  };

  // Results panel
  const resultsPanel = (
    <div className="h-full w-full">
      <CodeEditor files={generatedFiles} />
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
                disabled={!dbmlValidation.isValid}
                size="lg"
                className={`
                  bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white
                  shadow-lg transition-all duration-3000 ease-in-out
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none
                  ${isButtonHovered && dbmlValidation.isValid ? 'scale-105 shadow-xl' : ''}
                  ${dbmlValidation.isValid ? 'animate-heartbeat hover:animate-none' : ''}
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
        showLeftPanel={currentRightPanel === 'diagram'}
      />
    </div>
  );
}
