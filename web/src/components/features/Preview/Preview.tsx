'use client';

import dynamic from 'next/dynamic';
import { parseDbmlToDiagram } from '../Diagram/utils/dbml';
import DBMLCodeEditor from '../DBMLCodeEditor/DBMLCodeEditor';
import GenerateCode from '../GenerateCode/GenerateCode';
import { useState } from 'react';

const Diagram = dynamic(() => import('@/components/features/Diagram/Diagram'), { ssr: false });

interface PreviewProps {
  initialDbmlCode: string;
}

const Preview = ({ initialDbmlCode }: PreviewProps) => {
  const [dbmlCode, setDbmlCode] = useState<string>(initialDbmlCode);

  const handleDbmlCodeChange = (value: string | undefined) => {
    if (value) {
      setDbmlCode(value);
    }
  };

  return (
    // add content-end because of sizing bug
    <div className="tabs tabs-lift tabs-xs relative h-1/2 content-end">
      <input type="radio" name="my_tabs_3" className="tab" aria-label="Visual" defaultChecked />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        <Diagram initialDiagram={parseDbmlToDiagram(dbmlCode)} />
      </div>

      <input type="radio" name="my_tabs_3" className="tab" aria-label="DBML Code" />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        <DBMLCodeEditor dbmlCode={dbmlCode} onDbmlCodeChange={handleDbmlCodeChange} />
      </div>

      <div className=" absolute right-12 bottom-6 z-1000">
        <GenerateCode dbmlCode={dbmlCode} />
      </div>
    </div>
  );
};

export default Preview;
