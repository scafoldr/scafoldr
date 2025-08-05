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
  },
  {
    id: 'php-laravel',
    name: 'PHP + Laravel',
    icon: '🐘',
    comingSoon: true
  },
  {
    id: 'python-fastapi',
    name: 'Python + FastAPI',
    icon: '🐍',
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
  const [selectedComingSoonFramework, setSelectedComingSoonFramework] = useState<Framework | null>(null);
  
  const handleValueChange = (newValue: string) => {
    const selectedFramework = frameworks.find(f => f.id === newValue);
    
    if (selectedFramework?.comingSoon) {
      setSelectedComingSoonFramework(selectedFramework);
      setShowComingSoonModal(true);
      return;
    }
    
    onValueChange?.(newValue);
  };

  const getFrameworkModalContent = (framework: Framework) => {
    switch (framework.id) {
      case 'nextjs':
        return {
          featureName: 'Next.js Framework Support',
          description: 'Full-stack Next.js application generation with TypeScript, API routes, and modern React patterns.',
          issueLink: 'https://github.com/scafoldr/scafoldr/issues/64'
        };
      case 'php-laravel':
        return {
          featureName: 'PHP Laravel Framework Support',
          description: 'PHP Laravel application generation with Eloquent ORM, Artisan commands, and modern PHP patterns.',
          issueLink: 'https://github.com/scafoldr/scafoldr/issues/66'
        };
      case 'python-fastapi':
        return {
          featureName: 'Python FastAPI Framework Support',
          description: 'Modern Python FastAPI application generation with async support, Pydantic models, and automatic OpenAPI documentation.',
          issueLink: 'https://github.com/scafoldr/scafoldr/issues/65'
        };
      default:
        return {
          featureName: 'Framework Support',
          description: 'This framework is coming soon!',
          issueLink: 'https://github.com/scafoldr/scafoldr/issues'
        };
    }
  };

  const modalContent = selectedComingSoonFramework ? getFrameworkModalContent(selectedComingSoonFramework) : null;

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

      {modalContent && (
        <ComingSoonModal
          open={showComingSoonModal}
          onOpenChange={setShowComingSoonModal}
          featureName={modalContent.featureName}
          description={modalContent.description}
          issueLink={modalContent.issueLink}
          githubRepo="https://github.com/scafoldr/scafoldr"
        />
      )}
    </>
  );
}