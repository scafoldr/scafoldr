'use client';

import { UserProfileDropdown } from '@/features/auth';
import Link from 'next/link';
import Image from 'next/image';
import { ProjectSwitcher } from '@/components/project-switcher';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

const MinimalAppHeader = () => {
  const [currentProject, setCurrentProject] = useState('Task Manager App');

  return (
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
        <Link href="https://github.com/scafoldr/scafoldr" target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Star className="h-4 w-4" />
            <span>Star us on GitHub</span>
          </Button>
        </Link>
        <UserProfileDropdown />
      </div>
    </header>
  );
};

export default MinimalAppHeader;
