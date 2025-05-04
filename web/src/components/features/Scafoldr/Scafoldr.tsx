import Container from '@/components/layout/Container/Container';
import Chat from '../Chat/Chat';

const Scafoldr = () => {
  return (
    <Container>
      <div className="flex gap-4 h-[90vh]">
        <section id="scafoldr-chat" className="w-full">
          <Chat />
        </section>
      </div>
    </Container>
  );
};

export default Scafoldr;
