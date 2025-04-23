'use client';

import dynamic from 'next/dynamic';
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false
});

interface DBMLCodeEditorProps {
  dbmlCode: string;
  // eslint-disable-next-line no-unused-vars
  onDbmlCodeChange: (value: string | undefined) => void;
}

const DBMLCodeEditor = ({ dbmlCode, onDbmlCodeChange }: DBMLCodeEditorProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: any) => {
    monaco.languages.register({ id: 'dbml' });

    monaco.languages.setMonarchTokensProvider('dbml', {
      tokenizer: {
        root: [
          [/\b(Table|Ref|Project|Enum)\b/, 'keyword'],
          [/\b(\w+)\b/, 'identifier'],
          [/".*?"/, 'string'],
          [/\/\/.*$/, 'comment'],
          [/\[.*?\]/, 'annotation']
        ]
      }
    });
  };

  return (
    <MonacoEditor
      height="100%"
      width="100%"
      language="dbml"
      value={dbmlCode}
      theme="vs-dark"
      onChange={onDbmlCodeChange}
      onMount={handleEditorDidMount}
    />
  );
};

export default DBMLCodeEditor;
