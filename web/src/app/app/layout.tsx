import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { CodeStorageProvider } from '@/contexts/CodeStorageContext';
import { ProjectManagerProvider } from '@/contexts/project-manager-context';

export const metadata: Metadata = {
  title: 'Scafoldr - Open Source AI App Generator',
  description: 'Generate full-stack applications with modern frameworks and best practices.'
};

export default function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ProjectManagerProvider>
      <CodeStorageProvider>{children}</CodeStorageProvider>
    </ProjectManagerProvider>
  );
}
