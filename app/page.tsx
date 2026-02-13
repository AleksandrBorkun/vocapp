import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-dark">
      {/* Header */}
      <header className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-pale">VocApp</h1>
          <Link 
            href="/login"
            className="px-4 sm:px-6 py-2 bg-primary-light text-primary-pale rounded-lg hover:bg-primary-gray transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-pale mb-6">
            Learn New Words
            <span className="block text-primary-light mt-2">The Smart Way</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-primary-gray mb-8 sm:mb-12 max-w-2xl mx-auto">
            Create custom flashcard sets and master new vocabulary at your own pace.
            Perfect for students, language learners, and anyone expanding their knowledge.
          </p>

          <Link 
            href="/login"
            className="inline-block px-8 sm:px-12 py-3 sm:py-4 bg-primary-light text-primary-pale text-lg sm:text-xl font-semibold rounded-lg hover:bg-primary-gray transition-colors shadow-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl w-full">
          <div className="bg-primary-medium p-6 sm:p-8 rounded-lg border border-primary-gray">
            <div className="text-3xl sm:text-4xl mb-4">📚</div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary-pale mb-2">Create Card Sets</h3>
            <p className="text-primary-gray text-sm sm:text-base">
              Build your own flashcard collections for any subject or language
            </p>
          </div>

          <div className="bg-primary-medium p-6 sm:p-8 rounded-lg border border-primary-gray">
            <div className="text-3xl sm:text-4xl mb-4">🧠</div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary-pale mb-2">Study Anytime</h3>
            <p className="text-primary-gray text-sm sm:text-base">
              Practice on any device with our mobile-friendly interface
            </p>
          </div>

          <div className="bg-primary-medium p-6 sm:p-8 rounded-lg border border-primary-gray">
            <div className="text-3xl sm:text-4xl mb-4">📈</div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary-pale mb-2">Track Progress</h3>
            <p className="text-primary-gray text-sm sm:text-base">
              Monitor your learning journey and master new words efficiently
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-primary-gray border-t border-primary-gray">
        <p className="text-sm">© 2026 VocApp. Learn smarter, not harder.</p>
      </footer>
    </div>
  );
}
