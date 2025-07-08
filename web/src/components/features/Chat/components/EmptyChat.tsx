import Link from 'next/link';

const EmptyChat = () => (
  <div className="flex h-full flex-col justify-center items-center">
    <article className="prose">
      <h1>👋 Welcome to Scafoldr!</h1>
      <p>💬 Chat: Share your business goal (e.g. “Manage flower orders and deliveries”).</p>
      <p>🛠️ Edit: Hop into DBML view & fine-tune tables and columns. </p>
      <p>👀 Preview: Watch your ER-diagram spring to life.</p>
      <p>⚡ Generate: Click “Get your code” to spin up your backend. Ready to build? Let’s go!</p>
      <p>
        ⭐️ Star us on{' '}
        <Link href="https://github.com/scafoldr/scafoldr" target="_blank" rel="noopener noreferrer">
          github
        </Link>
      </p>
    </article>
  </div>
);

export default EmptyChat;
