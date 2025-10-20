import { useEffect, useState } from 'react';
import GithubModal from './components/github-modal';
import { FileMap } from '@/features/code-editor';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import AuthorizeGitHub from './components/authorize-github';

const GithubCreateRepo = ({ generatedFiles }: { generatedFiles: FileMap }) => {
  //Github Create repository states
  const [isGithubAuthorized, setIsGithubAuthorized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthorizedModalOpen, setIsAuthorizedModalOpen] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isGithubAuthorized') == 'true') {
      setIsGithubAuthorized(true);
    }

    if (!isAuthorizedModalOpen) return;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/github/check_access_token');
        const { isAuthorized } = await res.json();

        setIsGithubAuthorized(isAuthorized);
        localStorage.setItem('isGithubAuthorized', 'true');

        if (!isAuthorized) {
          timeoutId = setTimeout(checkAuth, 5000);
        }
      } catch (err) {
        console.error('Failed to check token:', err);
        timeoutId = setTimeout(checkAuth, 5000);
      }
    };

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, [isAuthorizedModalOpen]);

  const renderCreateGithubRepo = () => (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className="h-8 px-3 text-sm font-medium bg-transparent">
        <Github />
        Continue to Github
      </Button>
      <GithubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        files={
          Object.keys(generatedFiles).length > 0
            ? generatedFiles
            : {
                'README.md': `# Generated Code

Click "View Code" from a code generation message to see the generated files here.

This tab will display:
- Generated Node.js Express application files
- Database models and schemas
- API routes and controllers
- Configuration files

Start by asking the AI to generate a database schema, then the code will be automatically generated and displayed here.`
              }
        }
        isLoading={isLoadingGithub}
        setIsLoading={setIsLoadingGithub}
      />
    </>
  );
  const renderAuthorizeGithub = () => (
    <>
      <Button
        onClick={() => setIsAuthorizedModalOpen(true)}
        variant="outline"
        size="sm"
        className="h-8 px-3 text-sm font-medium bg-transparent">
        <Github />
        Authorize Github
      </Button>
      <AuthorizeGitHub
        isOpen={isAuthorizedModalOpen}
        onClose={() => setIsAuthorizedModalOpen(false)}
      />
    </>
  );

  return isGithubAuthorized ? renderCreateGithubRepo() : renderAuthorizeGithub();
};

export default GithubCreateRepo;
