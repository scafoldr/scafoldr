'use client';

import dynamic from 'next/dynamic';
import { parseDbmlToDiagram } from '../Diagram/utils/dbml';
import DBMLCodeEditor from '../DBMLCodeEditor/DBMLCodeEditor';
import GenerateCode from '../GenerateCode/GenerateCode';
import { useState } from 'react';
import { EXAMPLE_DBML } from '@/constants';
import { Parser } from '@dbml/core';
import { CompilerDiagnostic, CompilerError } from '@dbml/core/types/parse/error';

const Diagram = dynamic(() => import('@/components/features/Diagram/Diagram'), { ssr: false });

interface PreviewProps {
  initialDbmlCode?: string;
}

const Preview = ({ initialDbmlCode = EXAMPLE_DBML }: PreviewProps) => {
  const [dbmlCode, setDbmlCode] = useState<string>(initialDbmlCode);
  const [errors, setErrors] = useState<CompilerDiagnostic[]>([]);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');

  const canCompileDBMLCode = (dbmlCode: string) => {
    try {
      const parser = new Parser();
      parser.parse(dbmlCode, 'dbml');
      setErrors([]);
      return true;
    } catch (error) {
      if ((error as CompilerError)?.diags) {
        const typedError = error as CompilerError;
        setErrors(typedError.diags as CompilerDiagnostic[]);
        return false;
      }
      console.error('Unexpected error while parsing DBML code:', error);
    }
  };

  const handleDbmlCodeChange = (value: string | undefined) => {
    if (value && canCompileDBMLCode(value)) {
      setDbmlCode(value);
    }
  };

  return (
    // add content-end because of sizing bug
    <div className="tabs tabs-lift tabs-xs relative h-1/2 content-end">
      <input
        type="radio"
        name="my_tabs_3"
        className="tab"
        aria-label="Visual"
        onChange={() => setActiveTab('visual')}
        defaultChecked
      />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        {activeTab === 'visual' && <Diagram initialDiagram={parseDbmlToDiagram(dbmlCode)} />}
      </div>

      <input
        type="radio"
        name="my_tabs_3"
        className="tab"
        aria-label="DBML Code"
        onChange={() => setActiveTab('code')}
      />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        <DBMLCodeEditor dbmlCode={dbmlCode} onDbmlCodeChange={handleDbmlCodeChange} />
      </div>

      <div className=" absolute right-12 bottom-8 z-1000">
        <GenerateCode dbmlCode={dbmlCode} />
      </div>

      <div className="absolute left-12 bottom-6 z-1000">
        {errors.map((error, index) => (
          <div role="alert" className="alert alert-error" key={index}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {`(${error.location.start.line}:${error.location.start.column})`} {error.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preview;
