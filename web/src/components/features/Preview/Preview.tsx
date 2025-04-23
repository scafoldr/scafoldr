'use client';

import dynamic from 'next/dynamic';
import { parseDbmlToDiagram } from '../Diagram/utils/dbml';
import DBMLCodeEditor from '../DBMLCodeEditor/DBMLCodeEditor';
import GenerateCode from '../GenerateCode/GenerateCode';

const Diagram = dynamic(() => import('@/components/features/Diagram/Diagram'), { ssr: false });

interface PreviewProps {
  dbmlCode: string;
  // eslint-disable-next-line no-unused-vars
  onDbmlCodeChange: (value: string | undefined) => void;
}

const Preview = ({ dbmlCode, onDbmlCodeChange }: PreviewProps) => {
  return (
    <div className="tabs tabs-lift tabs-xs h-[70vh] relative">
      <input type="radio" name="my_tabs_3" className="tab" aria-label="Visual" defaultChecked />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        <Diagram initialDiagram={parseDbmlToDiagram(dbmlCode)} />
      </div>

      <input type="radio" name="my_tabs_3" className="tab" aria-label="DBML Code" />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        <DBMLCodeEditor dbmlCode={dbmlCode} onDbmlCodeChange={onDbmlCodeChange} />
      </div>

      <div className=" absolute right-12 bottom-6 z-1000">
        <GenerateCode dbmlCode={dbmlCode} />
      </div>
    </div>
  );
};

export default Preview;
