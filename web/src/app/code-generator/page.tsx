import Preview from '@/components/features/Preview/Preview';
import Container from '@/components/layout/Container/Container';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scafoldr - Code Generator',
  description:
    'Convert DBML schemas into production-ready backend code for Node.js, Spring Boot, Python, and more—accelerate your development workflow.'
};

export default function CodeGenerator() {
  return (
    <div className="">
      <main className="">
        <Container>
          <section id="scafoldr-code-generator" className="h-[100vh] mt-12">
            <Preview />
          </section>
        </Container>
      </main>
    </div>
  );
}
