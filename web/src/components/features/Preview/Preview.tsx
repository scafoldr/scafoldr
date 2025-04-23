'use client';

import dynamic from 'next/dynamic';
import { parseDbmlToDiagram } from '../Diagram/utils/dbml';

const Diagram = dynamic(() => import('@/components/features/Diagram/Diagram'), { ssr: false });

interface PreviewProps {
  dbmlInput: string;
}

const Preview = ({ dbmlInput }: PreviewProps) => {
  return (
    <div className="tabs tabs-lift tabs-xs h-[70vh]">
      <input type="radio" name="my_tabs_3" className="tab" aria-label="Visual" defaultChecked />
      <div className="tab-content bg-base-100 border-base-300 p-6">
        <Diagram initialDiagram={parseDbmlToDiagram(dbmlInput)} />
      </div>

      <input type="radio" name="my_tabs_3" className="tab" aria-label="DBML Code" />
      <div className="tab-content bg-base-100 border-base-300 p-6">{dbmlInput}</div>
    </div>
  );
};

export default Preview;
