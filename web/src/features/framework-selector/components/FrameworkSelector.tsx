'use client';

import * as React from 'react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComingSoonModal } from '@/components/coming-soon-modal';

export interface Framework {
  id: string;
  name: string;
  icon: string;
  comingSoon?: boolean;
}

// TODO: Replace hardcoded frameworks with dynamic fetching from backend API
// See GitHub issue: #63 Implement Dynamic Framework Fetching from Backend
// This should fetch from GET /frameworks endpoint to automatically support new frameworks
const frameworks: Framework[] = [
  {
    id: 'nodejs-express-js',
    name: 'Node.js + Express',
    icon: '🟢'
  },
  {
    id: 'java-spring',
    name: 'Java + Spring Boot',
    icon: '☕'
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    icon: '⚫',
    comingSoon: true
  }
];

interface FrameworkSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function FrameworkSelector({ value, onValueChange, className }: FrameworkSelectorProps) {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  
  const handleValueChange = (newValue: string) => {
    const selectedFramework = frameworks.find(f => f.id === newValue);
    
    if (selectedFramework?.comingSoon) {
      setShowComingSoonModal(true);
      return;
    }
    
    onValueChange?.(newValue);
  };

  return (
    <>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Framework" />
        </SelectTrigger>
        <SelectContent>
          {frameworks.map((framework) => (
            <SelectItem key={framework.id} value={framework.id}>
              <div className="flex items-center space-x-2">
                <span>{framework.icon}</span>
                <span>{framework.name}</span>
                {framework.comingSoon && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Soon)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ComingSoonModal
        open={showComingSoonModal}
        onOpenChange={setShowComingSoonModal}
        featureName="Next.js Framework Support"
        description="Full-stack Next.js application generation with TypeScript, API routes, and modern React patterns."
        issueLink="https://github.com/scafoldr/scafoldr/issues/64"
        githubRepo="https://github.com/scafoldr/scafoldr"
      />
    </>
  );
}