import React, { ReactNode } from 'react';
import {
  FileText,
  Code,
  Database,
  Image,
  Folder,
  FolderOpen,
  File as FileIcon,
  Coffee,
  SlidersVertical
} from 'lucide-react';
import { SiDocker } from '@icons-pack/react-simple-icons';

function getIconHelper() {
  const cache = new Map<string, ReactNode>();
  cache.set('js', <Code className="w-4 h-4 text-yellow-500" />);
  cache.set('jsx', <Code className="w-4 h-4 text-yellow-500" />);
  cache.set('ts', <Code className="w-4 h-4 text-blue-500" />);
  cache.set('tsx', <Code className="w-4 h-4 text-blue-500" />);
  cache.set('mjs', <Code className="w-4 h-4 text-yellow-500" />);
  cache.set('cjs', <Code className="w-4 h-4 text-green-700" />);
  cache.set('css', <Code className="w-4 h-4 text-purple-500" />);
  cache.set('json', <Database className="w-4 h-4 text-green-500" />);
  cache.set('jsonc', <Database className="w-4 h-4 text-green-500" />);
  cache.set('html', <Code className="w-4 h-4 text-orange-500" />);
  cache.set('png', <Image className="w-4 h-4 text-gray-500" />);
  cache.set('jpg', <Image className="w-4 h-4 text-gray-500" />);
  cache.set('ico', <Image className="w-4 h-4 text-gray-500" />);
  cache.set('txt', <FileText className="w-4 h-4 text-gray-500" />);
  cache.set('java', <Coffee className="w-4 h-4 text-red-500" />);
  cache.set('php', <Code className="w-4 h-4 text-indigo-500" />);
  cache.set('py', <Code className="w-4 h-4 text-blue-600" />);
  cache.set('yaml', <SiDocker className="w-4 h-4 text-blue-400" />);
  cache.set('yml', <SiDocker className="w-4 h-4 text-blue-400" />);
  cache.set('Dockerfile', <SiDocker className="w-4 h-4 text-blue-400" />);
  cache.set('md', <FileText className="w-4 h-4 text-blue-500" />);
  cache.set('dbml', <Database className="w-4 h-4 text-green-600" />);
  cache.set('env', <SlidersVertical className="w-4 h-4 text-orange-500" />);
  cache.set('local', <SlidersVertical className="w-4 h-4 text-orange-500" />); // for .env.local files
  cache.set('example', <SlidersVertical className="w-4 h-4 text-orange-500" />); // for .env.example files
  cache.set('closedDirectory', <Folder className="w-4 h-4 text-blue-400" />);
  cache.set('openDirectory', <FolderOpen className="w-4 h-4 text-blue-400" />);

  const getIcon = (extension: string, name: string): ReactNode => {
    if (cache.has(extension)) return cache.get(extension);
    else if (cache.has(name)) return cache.get(name);
    else return <FileIcon className="w-4 h-4 text-gray-500" />;
  };

  return getIcon;
}

export const getIcon = getIconHelper();
