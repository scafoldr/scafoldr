import { useEffect, useState } from 'react';
import GithubModal from './components/github-modal';
import { FileMap } from '@/features/code-editor';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import AuthorizeGitHub from './components/authorize-github';

interface GithubCreateRepoProps {
  activeProjectId: string;
}

const GithubCreateRepo = ({ activeProjectId }: GithubCreateRepoProps) => {
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
        Create Repository
      </Button>
      <GithubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeProjectId={activeProjectId}
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
