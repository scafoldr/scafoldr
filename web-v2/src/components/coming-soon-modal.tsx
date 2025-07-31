"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Construction, 
  Github, 
  Star, 
  ExternalLink, 
  Heart,
  Code,
  Users
} from "lucide-react"

export interface ComingSoonModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Function to handle modal close */
  onOpenChange: (open: boolean) => void
  /** The feature name that's coming soon */
  featureName: string
  /** Optional description of the feature */
  description?: string
  /** Optional GitHub issue link. If not provided, defaults to GitHub issues index */
  issueLink?: string
  /** GitHub repository URL for the "Star us" link */
  githubRepo?: string
  /** Optional custom title override */
  title?: string
}

const DEFAULT_GITHUB_REPO = "https://github.com/scafoldr/scafoldr"
const DEFAULT_ISSUES_URL = "https://github.com/scafoldr/scafoldr/issues"

export function ComingSoonModal({
  open,
  onOpenChange,
  featureName,
  description,
  issueLink,
  githubRepo = DEFAULT_GITHUB_REPO,
  title,
}: ComingSoonModalProps) {
  const finalIssueLink = issueLink || DEFAULT_ISSUES_URL
  const finalTitle = title || `${featureName} - Coming Soon`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Construction className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {finalTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            This feature is currently under development and will be available soon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Feature Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
              <Construction className="w-3 h-3 mr-1" />
              In Development
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
              Want to help us build this feature faster?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {/* Contribute Button */}
              <Button
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.open(finalIssueLink, '_blank')}
              >
                <Code className="w-4 h-4 mr-2" />
                Contribute
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>

              {/* Star Us Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(githubRepo, '_blank')}
              >
                <Star className="w-4 h-4 mr-2" />
                Star us
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Support Message */}
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-red-500" />
              Support us by contributing or starring our repository
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Predefined configurations for specific features
export const FEATURE_CONFIGS = {
  database: {
    featureName: "Database Tab",
    description: "Advanced database management and visualization tools to help you manage your data schemas more effectively.",
  },
  preview: {
    featureName: "Preview Tab", 
    description: "Live preview functionality to see your changes in real-time before applying them to your project.",
  },
  deploy: {
    featureName: "Deploy Button",
    description: "One-click deployment to various cloud platforms including AWS, Vercel, and Netlify.",
  },
  export: {
    featureName: "Export Button",
    description: "Export your projects in multiple formats including ZIP archives, Docker containers, and more.",
  },
  share: {
    featureName: "Share Button", 
    description: "Share your projects with team members and collaborate in real-time with advanced sharing options.",
  },
  auth: {
    featureName: "Authentication",
    description: "User authentication and authorization system. For now, you can use any username and password to test the interface - no real authentication is required.",
  },
  projectManagement: {
    featureName: "Project Management",
    description: "Advanced project management features including creating new projects, switching between projects, renaming, and deleting projects. Currently, you can view existing demo projects but cannot modify them.",
  },
} as const

// Convenience components for specific features
export function DatabaseComingSoonModal(props: Omit<ComingSoonModalProps, 'featureName' | 'description'>) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.database} />
}

export function PreviewComingSoonModal(props: Omit<ComingSoonModalProps, 'featureName' | 'description'>) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.preview} />
}

export function DeployComingSoonModal(props: Omit<ComingSoonModalProps, 'featureName' | 'description'>) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.deploy} />
}

export function ExportComingSoonModal(props: Omit<ComingSoonModalProps, 'featureName' | 'description'>) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.export} />
}

export function ShareComingSoonModal(props: Omit<ComingSoonModalProps, 'featureName' | 'description'>) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.share} />
}

export function AuthComingSoonModal(props: Omit<ComingSoonModalProps, 'featureName' | 'description'>) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.auth} />
}

export function ProjectComingSoonModal(props: Omit<ComingSoonModalProps, 'featureName' | 'description'>) {
  return <ComingSoonModal {...props} {...FEATURE_CONFIGS.projectManagement} />
}