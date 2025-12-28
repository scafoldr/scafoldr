'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { File } from '../types';
import { registerDBMLLanguage } from '../languages/dbml';
import { Monaco } from '@monaco-editor/react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

export const Code = ({ selectedFile }: { selectedFile: File | undefined }) => {
  const { resolvedTheme } = useTheme();
  const code = selectedFile?.content ?? '// Select a file to view its content';
  const fileName = selectedFile?.name ?? 'index.js';

  // Register DBML language on component mount
  const handleBeforeMount = (monaco: Monaco) => {
    registerDBMLLanguage(monaco);
  };
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
  else if (language === 'dbml') language = 'dbml';

  // Determine Monaco theme based on current theme
  // Use resolvedTheme to handle 'system' theme properly
  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'light';

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        width="100%"
        language={language}
        value={code}
        beforeMount={handleBeforeMount}
        theme={monacoTheme}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true
        }}
      />
    </div>
  );
};
