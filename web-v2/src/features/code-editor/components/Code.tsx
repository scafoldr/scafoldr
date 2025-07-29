"use client";

import dynamic from 'next/dynamic';
import { File } from '../types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

export const Code = ({ selectedFile }: { selectedFile: File | undefined }) => {
  const code = selectedFile?.content ?? '// Select a file to view its content';
  const fileName = selectedFile?.name ?? 'index.js';

  let language = fileName.split('.').pop();

  if (language === 'js' || language === 'jsx') language = 'javascript';
  else if (language === 'ts' || language === 'tsx') language = 'typescript';
  else if (language === 'java') language = 'java';
  else if (language === 'py') language = 'python';
  else if (language === 'css') language = 'css';
  else if (language === 'html') language = 'html';
  else if (language === 'json') language = 'json';
  else if (language === 'sql') language = 'sql';
  else if (language === 'php') language = 'php';

  return (
    <div className="h-full w-full">
      <MonacoEditor 
        height="100%" 
        width="100%" 
        language={language} 
        value={code} 
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
};