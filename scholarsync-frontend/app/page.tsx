import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          ScholarSync
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-4">
          AI-Powered Scholarship Application Platform
        </p>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Find scholarships you qualify for, generate tailored essays in your voice,
          and apply 10x faster with AI assistance.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Log In
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              AI finds scholarships you actually qualify for with high win probability
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">✍️</div>
            <h3 className="font-semibold text-lg mb-2">AI Essay Writing</h3>
            <p className="text-gray-600">
              Generate tailored essays in your authentic voice, reviewed by you
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Auto-Fill Forms</h3>
            <p className="text-gray-600">
              Chrome extension fills applications automatically, you just review and submit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
