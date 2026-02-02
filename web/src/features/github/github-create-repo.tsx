import { useState } from 'react';
import GithubModal from './components/github-modal';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

interface GithubCreateRepoProps {
  activeProjectId: string;
  variant?: 'default' | 'green';
  size?: 'sm' | 'lg' | 'default';
  className?: string;
}

const GithubCreateRepo = ({
  activeProjectId,
  variant = 'default',
  size = 'sm',
  className
}: GithubCreateRepoProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  const buttonStyles = {
    default: 'h-8 px-3 text-sm font-medium bg-transparent',
    green:
      'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-3000 animate-heartbeat hover:animate-none font-medium'
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant === 'default' ? 'outline' : 'default'}
        size={size}
        className={className || buttonStyles[variant]}>
        <Github className={size === 'lg' ? 'w-5 h-5 mr-2' : ''} />
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
};

export default GithubCreateRepo;
