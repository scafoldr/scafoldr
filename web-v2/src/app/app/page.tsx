'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Database, Eye, GitBranch, Play, Download, Share } from 'lucide-react';
import { ProjectSwitcher } from '@/components/project-switcher';
import { ChatInterface } from '@/features/chat';
import { DynamicERDiagram } from '@/components/dynamic-er-diagram';
import { CodeEditor } from '@/features/code-editor';
import { DatabaseViewer } from '@/components/database-viewer';
import { AppPreview } from '@/components/app-preview';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { ResizableLayout } from '@/components/resizable-layout';
import { PreviewIndicator } from '@/components/preview-indicator';
import {
  DatabaseComingSoonModal,
  PreviewComingSoonModal,
  DeployComingSoonModal,
  ExportComingSoonModal,
  ShareComingSoonModal
} from '@/components/coming-soon-modal';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('er-diagram');
  const [currentProject, setCurrentProject] = useState('Task Manager App');
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [generatedFiles, setGeneratedFiles] = useState<any>({});
  const [currentDbml, setCurrentDbml] = useState<string | undefined>();
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Coming Soon Modal states
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    // Get prompt from URL params (passed from auth page)
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    if (promptParam) {
      setInitialPrompt(decodeURIComponent(promptParam));
      // Clean up URL after extracting prompt
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleViewCode = (files: any) => {
    setGeneratedFiles(files);
    setActiveTab('code');
  };

  const handleViewDB = (dbmlCode?: string) => {
    if (dbmlCode) {
      setCurrentDbml(dbmlCode);
    }
    setActiveTab('er-diagram');
  };

  const handleUserInteraction = () => {
    setHasUserInteracted(true);
  };

  const handleMessageReceived = (messageType: string, content?: string) => {
    // Auto-switch tabs based on message type
    if (messageType === 'RESULT' || messageType === 'DBML') {
      // Database/DBML generated - switch to ER Diagram
      if (content) {
        setCurrentDbml(content);
      }
      setActiveTab('er-diagram');
    } else if (messageType === 'CODE_GENERATION') {
      // Code generated - switch to Code tab
      setActiveTab('code');
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🏗️ scafoldr
            </span>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

          <ProjectSwitcher currentProject={currentProject} onProjectChange={setCurrentProject} />
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex bg-transparent"
            onClick={() => setShowShareModal(true)}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex bg-transparent"
            onClick={() => setShowExportModal(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:text-white"
            onClick={() => setShowDeployModal(true)}>
            <Play className="w-4 h-4 mr-2" />
            Deploy
          </Button>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

          <UserProfileDropdown />
        </div>
      </header>

      {/* Main Content with Resizable Layout */}
      <ResizableLayout
        leftPanel={
          <ChatInterface
            initialPrompt={initialPrompt}
            onViewCode={handleViewCode}
            onViewDB={handleViewDB}
            onUserInteraction={handleUserInteraction}
            onMessageReceived={handleMessageReceived}
          />
        }
        rightPanel={
          <>
            {/* Tab Navigation */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="er-diagram" className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4" />
                    <span className="hidden sm:inline">ER Diagram</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Code</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="database"
                    className="flex items-center space-x-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDatabaseModal(true);
                    }}>
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">Database</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center space-x-2"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPreviewModal(true);
                    }}>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} className="h-full">
                <TabsContent value="er-diagram" className="h-full m-0 relative">
                  <PreviewIndicator tabName="ER Diagram" show={!hasUserInteracted} />
                  <DynamicERDiagram dbmlCode={currentDbml} />
                </TabsContent>
                <TabsContent value="code" className="h-full m-0 relative">
                  <PreviewIndicator tabName="Code" show={!hasUserInteracted} />
                  <CodeEditor
                    files={
                      Object.keys(generatedFiles).length > 0
                        ? generatedFiles
                        : {
                            'README.md': `# Generated Code

Click "View Code" from a code generation message to see the generated files here.

This tab will display:
- Generated Node.js Express application files
- Database models and schemas
- API routes and controllers
- Configuration files

Start by asking the AI to generate a database schema, then the code will be automatically generated and displayed here.`
                          }
                    }
                  />
                </TabsContent>
                <TabsContent value="database" className="h-full m-0 relative">
                  <PreviewIndicator tabName="Database" show={!hasUserInteracted} />
                  <DatabaseViewer />
                </TabsContent>
                <TabsContent value="preview" className="h-full m-0 relative">
                  <PreviewIndicator tabName="Preview" show={!hasUserInteracted} />
                  <AppPreview />
                </TabsContent>
              </Tabs>
            </div>
          </>
        }
        defaultLeftWidth={320}
        minLeftWidth={280}
        maxLeftWidth={600}
      />

      {/* Coming Soon Modals */}
      <DatabaseComingSoonModal
        open={showDatabaseModal}
        onOpenChange={setShowDatabaseModal}
        githubRepo="https://github.com/scafoldr/scafoldr"
      />

      <PreviewComingSoonModal
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        githubRepo="https://github.com/scafoldr/scafoldr"
      />

      <DeployComingSoonModal
        open={showDeployModal}
        onOpenChange={setShowDeployModal}
        githubRepo="https://github.com/scafoldr/scafoldr"
      />

      <ExportComingSoonModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        githubRepo="https://github.com/scafoldr/scafoldr"
      />

      <ShareComingSoonModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        githubRepo="https://github.com/scafoldr/scafoldr"
      />
    </div>
  );
}
