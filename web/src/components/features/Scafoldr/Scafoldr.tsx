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
    <section>
      <Container>
        <Preview dbmlCode={dbmlCode} onDbmlCodeChange={handleDbmlCodeChange} />
        <Chat />
      </Container>
    </section>
  );
};

export default Scafoldr;
