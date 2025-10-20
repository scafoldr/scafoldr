'use client';

import { useState } from 'react';
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
import { Github, CheckCircle2 } from 'lucide-react';
import { authorizeGitHub, createGithubRepo, getAccessToken } from '../api/github.api';
import { FileMap } from '@/features/code-editor';
type PromptProps = {
  isOpen: boolean;
  isLoading: boolean;
  files: FileMap;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  setIsLoading: (isLoading: boolean) => void;
};

export default function GithubModal({
  isOpen,
  isLoading,
  files,
  onClose,
  setIsLoading
}: PromptProps) {
  const [repositoryName, setRepositoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [repositoryCreated, setRepositoryCreated] = useState(false);

  const handleCreateRepository = async () => {
    try {
      setIsLoading(true);

      const accessToken = await getAccessToken();

      console.log('GitHub token acquired:', accessToken);
      const createRepo = await createGithubRepo(
        repositoryName,
        description,
        isPrivate,
        accessToken,
        files
      );

      setRepositoryCreated(true);
    } catch (err) {
      console.error('Error creating repository:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    const tree = Object.entries(files).map(([path, content]) => ({
      path,
      mode: '100644',
      type: 'blob',
      content
    }));
    console.log(tree);
    onClose();
    setIsLoading(false);
    // Reset state after dialog closes
    setTimeout(() => {
      setRepositoryCreated(false);
      setRepositoryName('');
      setDescription('');
      setIsPrivate(false);
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
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              className="border-gray-600 data-[state=checked]:bg-blue-600"
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
            disabled={!repositoryName || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <Github className="w-4 h-4 mr-2" />
            Create Repository
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
