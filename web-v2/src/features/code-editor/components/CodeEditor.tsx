'use client';

import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { convertToTree } from '../utils/fileManager';
import { FileTree } from './FileTree';
import { Code } from './Code';
import { File, FileMap } from '../types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download } from 'lucide-react';

export default function CodeEditor({ files }: { files: FileMap }) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const filesTree = useMemo(() => convertToTree(files), [files]);

  const handleDownload = async () => {
    const zip = new JSZip();
    for (const [path, content] of Object.entries(files)) {
      zip.file(path, content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'project.zip');
  };

  return (
    <div className="h-full flex">
      {/* File Explorer */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Files</h3>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              ZIP
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="p-2">
            <FileTree rootDir={filesTree} onSelect={setSelectedFile} selectedFile={selectedFile} />
          </div>
        </ScrollArea>
      </div>

      {/* Code Editor */}
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
    </div>
  );
}
