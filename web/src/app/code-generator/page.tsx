import Preview from '@/components/features/Preview/Preview';
import Container from '@/components/layout/Container/Container';

export default function CodeGenerator() {
  return (
    <div className="">
      <main className="">
        <Container>
          <section id="scafoldr-code-generator" className="h-[100vh]">
            <Preview />
          </section>
        </Container>
      </main>
    </div>
  );
}
