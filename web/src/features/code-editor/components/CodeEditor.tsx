'use client';

import { useEffect, useState } from 'react';
import { convertToTree, findFileByPath } from '../utils/fileManager';
import { FileTree } from './FileTree';
import { Code } from './Code';
import { Directory, File, FileMap } from '../types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download } from 'lucide-react';
import { downloadProjectAsZip } from '@/lib/export-utils';
import { ResizableLayout } from '@/components/resizable-layout';

interface CodeEditorProps {
  files: FileMap;
  // eslint-disable-next-line no-unused-vars
  beforeFileSelect?: (file: File) => Promise<'' | undefined>;
}

export default function CodeEditor({ files, beforeFileSelect }: CodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [filesTree, setFilesTree] = useState<Directory>({
    id: 'root',
    type: 1,
    name: 'root',
    parentId: undefined,
    depth: 0,
    files: [],
    dirs: []
  });
  // const filesTree = useMemo(() => convertToTree(files), [files]);

  useEffect(() => {
    setFilesTree(convertToTree(files));
  }, [files]);

  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    // Check if selectedFiles is different than one in filesTree
    const newSelectedFile = findFileByPath(filesTree, selectedFile.id);
    if (newSelectedFile) {
      setSelectedFile(newSelectedFile);
      return;
    }
    setSelectedFile(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesTree]);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await downloadProjectAsZip(files, 'project');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (beforeFileSelect) {
      await beforeFileSelect(file);
    }
    setSelectedFile(file);
  };

  const fileExplorerSidebar = (
    <div className="h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Files</h3>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'ZIP'}
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] overflow-y-auto p-2">
        <FileTree rootDir={filesTree} onSelect={handleFileSelect} selectedFile={selectedFile} />
      </ScrollArea>
    </div>
  );

  const codeEditorPanel = (
    <div className="flex-1 flex flex-col">
      {/* Editor Header */}
      {selectedFile && (
        <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{selectedFile.name}</span>
          </div>
        </div>
      )}

      {/* Code Content */}
      <div className="flex-1">
        <Code selectedFile={selectedFile} />
      </div>
    </div>
  );

  return (
    <div className="h-full flex">
      <ResizableLayout
        leftPanel={fileExplorerSidebar}
        rightPanel={codeEditorPanel}
        defaultLeftWidth={300}
        minLeftWidth={250}
      />
    </div>
  );
}
