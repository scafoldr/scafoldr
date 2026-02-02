'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Github, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  createGithubRepo,
  fetchAllFiles,
  getAccessToken,
  authorizeGitHub
} from '../api/github.api';

type PromptProps = {
  isOpen: boolean;
  isLoading: boolean;
  activeProjectId: string;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  setIsLoading: (isLoading: boolean) => void;
};

export default function GithubModal({
  isOpen,
  isLoading,
  activeProjectId,
  onClose,
  setIsLoading
}: PromptProps) {
  const [repositoryName, setRepositoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [repositoryCreated, setRepositoryCreated] = useState(false);
  const [needsAuthorization, setNeedsAuthorization] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authorization status when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/github/check_access_token');
        const { isAuthorized } = await res.json();
        setNeedsAuthorization(!isAuthorized);
      } catch (err) {
        console.error('Failed to check authorization:', err);
        setNeedsAuthorization(true);
      }
    };

    checkAuth();
  }, [isOpen]);

  // Poll for authorization completion
  useEffect(() => {
    if (!isCheckingAuth) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/github/check_access_token');
        const { isAuthorized } = await res.json();

        if (isAuthorized) {
          setNeedsAuthorization(false);
          setIsCheckingAuth(false);
          setError(null);
        } else {
          timeoutId = setTimeout(checkAuth, 3000);
        }
      } catch (err) {
        console.error('Failed to check token:', err);
        timeoutId = setTimeout(checkAuth, 3000);
      }
    };

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, [isCheckingAuth]);

  const handleAuthorize = () => {
    setIsCheckingAuth(true);
    setError(null);
    authorizeGitHub();
  };

  const handleCreateRepository = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const accessToken = await getAccessToken();

      if (!accessToken) {
        setNeedsAuthorization(true);
        setError('GitHub authorization required. Please authorize and try again.');
        setIsLoading(false);
        return;
      }

      const genFiles = await fetchAllFiles(activeProjectId);

      console.log('GitHub token acquired:', accessToken);
      await createGithubRepo(repositoryName, description, isPrivate, accessToken, genFiles);

      setRepositoryCreated(true);
    } catch (err) {
      console.error('Error creating repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to create repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setIsLoading(false);
    setIsCheckingAuth(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setRepositoryCreated(false);
      setRepositoryName('');
      setDescription('');
      setIsPrivate(false);
      setNeedsAuthorization(false);
      setError(null);
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Github className="w-6 h-6 text-white" />
            <DialogTitle className="text-white text-2xl">Push to GitHub</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 text-base">
            Create a new GitHub repository with your generated files. Your project will be pushed
            with all files and folder structure intact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {repositoryCreated && (
            <div className="flex items-center gap-2 p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-medium">Repository Created!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {needsAuthorization && (
            <div className="flex flex-col gap-3 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-medium">Authorization Required</span>
              </div>
              <p className="text-yellow-200 text-sm">
                {isCheckingAuth
                  ? 'Waiting for GitHub authorization... Please complete the authorization in the popup window.'
                  : 'You need to authorize GitHub access before creating a repository.'}
              </p>
              {!isCheckingAuth && (
                <Button
                  onClick={handleAuthorize}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white w-fit">
                  <Github className="w-4 h-4 mr-2" />
                  Authorize GitHub
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="repo-name" className="text-white text-sm font-medium">
              Repository Name
            </Label>
            <Input
              id="repo-name"
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
              placeholder="my-awesome-project"
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              disabled={needsAuthorization}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project"
              rows={4}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 resize-none"
              disabled={needsAuthorization}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              className="border-gray-600 data-[state=checked]:bg-blue-600"
              disabled={needsAuthorization}
            />
            <Label htmlFor="private" className="text-white text-sm cursor-pointer">
              Make repository private
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="text-white text-sm font-medium">Files to be pushed:</Label>
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 max-h-32 overflow-y-auto">
              <p className="text-gray-400 text-sm">All generated files will be included</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-700">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-gray-300 hover:text-white hover:bg-gray-700">
            Cancel
          </Button>
          <Button
            onClick={handleCreateRepository}
            disabled={!repositoryName || isLoading || needsAuthorization}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
            <Github className="w-4 h-4 mr-2" />
            {isLoading ? 'Creating...' : 'Create Repository'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
