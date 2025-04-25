'use client';

import Container from '@/components/layout/Container/Container';
import Preview from '../Preview/Preview';
import Chat from '../Chat/Chat';
import { useState } from 'react';
import { EXAMPLE_DBML } from '@/constants';

const Scafoldr = () => {
  const [dbmlCode, setDbmlCode] = useState<string>(EXAMPLE_DBML);

  const handleDbmlCodeChange = (value: string | undefined) => {
    if (value) {
      setDbmlCode(value);
    }
  };

  return (
    <Container>
      {/* add pt because of sizing bug */}
      <div className="flex gap-4 h-[90vh] pt-6">
        <section id="scafoldr-chat" className="w-1/2">
          {/* <div className="fixed bottom-16 left-0 right-0"> */}
          <Chat onDbmlCodeChange={handleDbmlCodeChange} />
          {/* </div> */}
        </section>
        <section id="preview" className="w-1/2">
          <Preview dbmlCode={dbmlCode} onDbmlCodeChange={handleDbmlCodeChange} />
        </section>
      </div>
    </Container>
  );
};

export default Scafoldr;
