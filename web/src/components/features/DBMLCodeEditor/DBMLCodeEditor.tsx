'use client';

import dynamic from 'next/dynamic';
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

interface DBMLCodeEditorProps {
  dbmlCode: string;
  onDbmlCodeChange: (value: string | undefined) => void;
}

const DBMLCodeEditor = ({ dbmlCode, onDbmlCodeChange }: DBMLCodeEditorProps) => (
  <MonacoEditor
    height="100%"
    width="100%"
    language={'javascript'}
    value={dbmlCode}
    theme="vs-dark"
    onChange={onDbmlCodeChange}
  />
);

export default DBMLCodeEditor;
