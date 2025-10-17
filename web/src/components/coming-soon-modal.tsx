'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Construction, Star, ExternalLink, Eye, ThumbsUp } from 'lucide-react';

export interface ComingSoonModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Function to handle modal close */
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void;
  /** The feature name that's coming soon */
  featureName: string;
  /** Optional description of the feature */
  description?: string;
  /** Optional GitHub issue link. If not provided, defaults to GitHub issues index */
  issueLink?: string;
  /** GitHub repository URL for the "Star us" link */
  githubRepo?: string;
  /** Optional custom title override */
  title?: string;
}

const DEFAULT_GITHUB_REPO = 'https://github.com/scafoldr/scafoldr';
const DEFAULT_ISSUES_URL = 'https://github.com/scafoldr/scafoldr/issues';

export function ComingSoonModal({
  open,
  onOpenChange,
  featureName,
  description,
  issueLink,
  githubRepo = DEFAULT_GITHUB_REPO,
  title
}: ComingSoonModalProps) {
  const finalIssueLink = issueLink || DEFAULT_ISSUES_URL;
  const finalTitle = title || `${featureName} - Coming Soon`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Construction className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-center">{finalTitle}</DialogTitle>
          <DialogDescription className="text-center">
            This feature is planned for a future release. We&apos;d love to hear from you about it!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feature Badge */}
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
              <Construction className="w-3 h-3 mr-1" />
              Planned
            </Badge>
          </div>

          {/* Custom Description */}
          {description && (
            <div className="text-sm text-muted-foreground text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              {description}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Want to see this feature prioritized? You can help shape our roadmap!
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {/* See Issue Button */}
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.open(finalIssueLink, '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                See Issue
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>

              {/* Star Us Button */}
              <Button variant="outline" size="sm" onClick={() => window.open(githubRepo, '_blank')}>
                <Star className="w-4 h-4 mr-2" />
                Star us
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Support Message */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <ThumbsUp className="w-3 h-3 text-blue-500" />
              Like the issue to help us prioritize this feature
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Predefined configurations for specific features
export const FEATURE_CONFIGS = {
  database: {
    featureName: 'Database Tab',
    description:
      'Advanced database management and visualization tools to help you manage your data schemas more effectively.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/57'
  },
  preview: {
    featureName: 'Preview Tab',
    description:
      'Live preview functionality to see your changes in real-time before applying them to your project.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/56'
  },
  deploy: {
    featureName: 'Deploy Button',
    description:
      'One-click deployment to various cloud platforms including AWS, Vercel, and Netlify.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/11'
  },
  share: {
    featureName: 'Share Button',
    description:
      'Share your projects with team members and collaborate in real-time with advanced sharing options.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/58'
  },
  auth: {
    featureName: 'Authentication',
    description:
      'User authentication and authorization system. For now, you can use any username and password to test the interface - no real authentication is required.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/7'
  },
  projectManagement: {
    featureName: 'Project Management',
    description:
      'Advanced project management features including creating new projects, switching between projects, renaming, and deleting projects. Currently, you can view existing demo projects but cannot modify them.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/10'
  },
  createYourOwnTemplate: {
    featureName: 'Create Your Own Template',
    description: 'Upload your example project and Scafoldr will create a custom template for you.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/41'
  },
  pythonTemplate: {
    featureName: 'Python Template',
    description: 'Support for Python projects including FastAPI Framework.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/65'
  },
  phpFrameworkTemplate: {
    featureName: 'PHP Framework Template',
    description: 'Support for PHP projects including Laravel Framework.',
    issueLink: 'https://github.com/scafoldr/scafoldr/issues/66'
  }
} as const;

// Convenience components for specific features
export function DatabaseComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.database} />;
}

export function PreviewComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.preview} />;
}

export function DeployComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.deploy} />;
}

export function ShareComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.share} />;
}

export function AuthComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.auth} />;
}

export function ProjectComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.projectManagement} />;
}

export function CreateYourOwnTemplateComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.createYourOwnTemplate} />;
}

export function PythonTemplateComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.pythonTemplate} />;
}

export function PHPFrameworkTemplateComingSoonModal(
  props: Omit<ComingSoonModalProps, 'featureName' | 'description'>
) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.phpFrameworkTemplate} />;
}
