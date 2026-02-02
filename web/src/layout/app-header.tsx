'use client';

import { GithubCreateRepo } from '@/features/github';
import { UserProfileDropdown } from '@/features/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Play, Share } from 'lucide-react';
import { ProjectSwitcher } from '@/components/project-switcher';
import { useState } from 'react';
import { DeployComingSoonModal, ShareComingSoonModal } from '@/components/coming-soon-modal';
import { downloadProjectAsZip } from '@/lib/export-utils';
import { FileMap } from '@/features/code-editor';

interface AppHeaderProps {
  activeProjectId: string;
  generatedFiles: FileMap;
}

const AppHeader = ({ activeProjectId, generatedFiles }: AppHeaderProps) => {
  const [currentProject, setCurrentProject] = useState('Task Manager App');
  const [isExporting, setIsExporting] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
  return (
    <>
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
    </>
  );
};

export default AppHeader;
