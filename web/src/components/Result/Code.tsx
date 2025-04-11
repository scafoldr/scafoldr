import dynamic from 'next/dynamic';
import { File } from './types';
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

export const Code = ({ selectedFile }: { selectedFile: File | undefined }) => {
  const code = selectedFile?.content ?? '// Select a file to view its content';
  const fileName = selectedFile?.name ?? 'index.js';

  let language = fileName.split('.').pop();

  if (language === 'js' || language === 'jsx') language = 'javascript';
  else if (language === 'ts' || language === 'tsx') language = 'typescript';

  return (
    <div className="m-0 text-base">
      <MonacoEditor height="500px" width="100%" language={language} value={code} theme="vs-dark" />
    </div>
  );
};
