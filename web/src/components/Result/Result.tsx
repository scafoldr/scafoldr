'use client';

import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { convertToTree } from './utils/fileManager';
import { FileTree } from './FileTree';
import { Code } from './Code';
import { File, FileMap } from './types';

export default function Result({ files }: { files: FileMap }) {
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
    <section id="code-viewer">
      <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownload}>
        Download ZIP
      </button>
      <div className="py-8 px-4 mx-auto max-w-screen-lg">
        <div className="flex flex-col md:flex-row gap-6 p-4">
          <div className="md:w-1/3">
            <div
              className="h-[500px] overflow-y-scroll 
                [&::-webkit-scrollbar]:w-2
              [&::-webkit-scrollbar-track]:bg-gray-100
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              dark:[&::-webkit-scrollbar-track]:bg-neutral-700
              dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
              <FileTree
                rootDir={filesTree}
                onSelect={setSelectedFile}
                selectedFile={selectedFile}
              />
            </div>
          </div>
          <div className="md:w-2/3">
            <Code selectedFile={selectedFile} />
          </div>
        </div>
      </div>
    </section>
  );
}
