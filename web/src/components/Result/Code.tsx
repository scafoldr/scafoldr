import dynamic from 'next/dynamic';
import { File } from './types';
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

export const Code = ({ selectedFile }: { selectedFile: File | undefined }) => {
  if (!selectedFile) return null;

  const code = selectedFile.content;
  let language = selectedFile.name.split('.').pop();

  if (language === 'js' || language === 'jsx') language = 'javascript';
  else if (language === 'ts' || language === 'tsx') language = 'typescript';

  return (
    <div className="m-0 text-base">
      <MonacoEditor height="500px" width="100%" language={language} value={code} theme="vs-dark" />
    </div>
  );
};
