'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Database, Eye, GitBranch, Play, Download, Share } from 'lucide-react';
import Link from 'next/link';
import { ProjectSwitcher } from '@/components/project-switcher';
import { ChatInterface } from '@/features/chat';
import { DynamicERDiagram } from '@/components/dynamic-er-diagram';
import { CodeEditor, FileMap } from '@/features/code-editor';
import { DatabaseViewer } from '@/components/database-viewer';
import { AppPreview } from '@/components/app-preview';
import { ResizableLayout } from '@/components/resizable-layout';
import { downloadProjectAsZip } from '@/lib/export-utils';
import { ChangesIndicator } from '@/components/changes-indicator';
import { playNotificationSound } from '@/utils/notification';
import {
  DatabaseComingSoonModal,
  PreviewComingSoonModal,
  DeployComingSoonModal,
  ShareComingSoonModal
} from '@/components/coming-soon-modal';
import { useCodeStorage } from '@/contexts/CodeStorageContext';
import { FileContent } from '@/services/codeStorage';
import { useProjectManager } from '@/contexts/project-manager-context';
import ProjectBuildingAnimation from '@/components/project-building-animation';
import { GithubCreateRepo } from '@/features/github';
import { UserProfileDropdown } from '@/features/auth';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('er-diagram');
  const [currentProject, setCurrentProject] = useState('Task Manager App');
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [generatedFiles, setGeneratedFiles] = useState<FileMap>({});
  const [currentDbml, setCurrentDbml] = useState<string | undefined>();
  const { activeProjectId, setSelectedFramework } = useProjectManager();

  const {
    projects,
    getFile,
    getProjectFiles,
    isFileLoaded,
    hasCodeChanges,
    hasSchemaChanges,
    setHasCodeChanges,
    setHasSchemaChanges
  } = useCodeStorage();

  useEffect(() => {
    if (hasSchemaChanges) {
      getFile(activeProjectId, 'schema.dbml').then((f: FileContent | null) => {
        if (f) {
          setCurrentDbml(f.content);
          playNotificationSound();
        }
      });
    }
  }, [hasSchemaChanges, activeProjectId, getFile]);

  useEffect(() => {
    if (hasCodeChanges) {
      playNotificationSound();
    }
  }, [hasCodeChanges]);

  // Reset functions for change indicators
  const resetSchemaChanges = useCallback(() => {
    setHasSchemaChanges(false);
  }, [setHasSchemaChanges]);

  const resetCodeChanges = useCallback(() => {
    setHasCodeChanges(false);
  }, [setHasCodeChanges]);

  // Handle tab changes
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      // Reset the change indicator for the selected tab
      if (value === 'er-diagram') {
        resetSchemaChanges();
      } else if (value === 'code') {
        resetCodeChanges();
      }
    },
    [resetSchemaChanges, resetCodeChanges]
  );

  useEffect(() => {
    if (projects.size === 0 || !activeProjectId) {
      return;
    }
    const projectFiles = projects.get(activeProjectId)?.files;
    if (projectFiles) {
      const freshFiles = Object.fromEntries(
        Object.keys(projectFiles).map((filePath) =>
          isFileLoaded(activeProjectId, filePath)
            ? [filePath, generatedFiles[filePath]]
            : [filePath, projectFiles[filePath].preview ?? '']
        )
      );
      setGeneratedFiles(freshFiles);
    }
  }, [activeProjectId, projects, isFileLoaded]);

  useEffect(() => {
    if (!activeProjectId) {
      return;
    }
    getProjectFiles(activeProjectId);
  }, [activeProjectId, getProjectFiles]);

  const getFileContent = async ({ id: filePath }: { id: string }) => {
    if (!activeProjectId) {
      return '';
    }
    try {
      await getFile(activeProjectId, filePath).then((f: FileContent | null) => {
        if (!f) {
          return;
        }
        setGeneratedFiles((prev) => ({ ...prev, [filePath]: f?.content ?? '' }));
      });
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  };

  // Coming Soon Modal states
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Get parameters from URL (passed from home page)
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    const frameworkParam = urlParams.get('framework');

    if (promptParam) {
      setInitialPrompt(decodeURIComponent(promptParam));
    }

    if (frameworkParam) {
      setSelectedFramework(frameworkParam);
    }
    // Clean up URL after extracting parameters
    if (promptParam || frameworkParam) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Check if there are files to export
      if (!generatedFiles || Object.keys(generatedFiles).length === 0) {
        alert('No files to export. Please generate some code first by chatting with the AI.');
        return;
      }

      await downloadProjectAsZip(generatedFiles, currentProject);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderWorkspacePanelLoading = () => (
    <div className="flex-1 flex flex-col items-center justify-center">
      <ProjectBuildingAnimation />
    </div>
  );

  const renderWorkspacePanel = () => (
    <>
      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="er-diagram" className="flex items-center space-x-2">
              <GitBranch className="w-4 h-4" />
              <span className="hidden sm:inline">ER Diagram</span>
              <ChangesIndicator isVisible={hasSchemaChanges} className="ml-1" />
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center space-x-2">
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Code</span>
              <ChangesIndicator isVisible={hasCodeChanges} className="ml-1" />
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
            <DynamicERDiagram dbmlCode={currentDbml} />
          </TabsContent>
          <TabsContent value="code" className="h-full m-0 relative">
            <CodeEditor
              files={
                Object.keys(generatedFiles).length > 0
                  ? generatedFiles
                  : {
                      'README.md': `There is no code to display yet. Start a chat on the left to generate code!`
                    }
              }
              beforeFileSelect={getFileContent}
            />
          </TabsContent>
          <TabsContent value="database" className="h-full m-0 relative">
            <DatabaseViewer />
          </TabsContent>
          <TabsContent value="preview" className="h-full m-0 relative">
            <AppPreview />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:opacity-80 transition-opacity cursor-pointer">
              <span className="flex items-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <Image src="/logo.png" width={40} height={40} alt="Scafoldr logo" />
                scafoldr
              </span>
            </Link>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

          <ProjectSwitcher currentProject={currentProject} onProjectChange={setCurrentProject} />
        </div>

        <div className="flex items-center space-x-3">
          <GithubCreateRepo activeProjectId={activeProjectId} />
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
            onClick={handleExport}
            disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
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
        leftPanel={<ChatInterface initialPrompt={initialPrompt} />}
        rightPanel={
          Object.keys(generatedFiles).length === 0
            ? renderWorkspacePanelLoading()
            : renderWorkspacePanel()
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

      <ShareComingSoonModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        githubRepo="https://github.com/scafoldr/scafoldr"
      />
    </div>
  );
}
