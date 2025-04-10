import GenerateForm from '@/components/GenerateForm';

export default function Home() {
  return (
    <div className="">
      <main className="">
        <section>
          <div className="py-8 px-4 mx-auto max-w-screen-lg">
            <h1 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
              Start generating your code
            </h1>
            <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">
              Fill this form and get your backend code all setup with AI in seconds.
            </p>
            <GenerateForm />
          </div>
        </section>
      </main>
    </div>
  );
}
