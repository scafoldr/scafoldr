import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Github } from 'lucide-react';
import { authorizeGitHub } from '../api/github.api';

interface AuthorizeGitHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthorizeGitHub = ({ isOpen, onClose }: AuthorizeGitHubProps) => {
  const handleClose = () => {
    onClose();
  };

  const handleAuthorization = async () => {
    await authorizeGitHub();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Github className="w-6 h-6 text-white" />
            <DialogTitle className="text-white text-2xl">Authorize GitHub</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 text-base">
            Authorize a creation of a new GitHub repository with your generated files. Your project
            will be pushed with all files and folder structure intact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Button
            onClick={handleAuthorization}
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <Github className="w-4 h-4 mr-2" />
            Authorize
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthorizeGitHub;
