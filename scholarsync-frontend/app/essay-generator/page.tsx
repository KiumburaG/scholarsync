'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EssayGenerator } from '@/components/essay/essay-generator';
import { isAuthenticated, clearAuthTokens } from '@/lib/auth';

export default function EssayGeneratorPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    clearAuthTokens();
    router.push('/');
  };

  const handleEssaySaved = (essay: string, wordCount: number) => {
    alert(`Essay saved! ${wordCount} words`);
    // In production, this would save to database
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                ← Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">AI Essay Generator</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Generate Scholarship Essays with AI
          </h2>
          <p className="text-gray-600">
            Paste your essay prompt and let our AI write a personalized essay based on your profile.
            You can generate single drafts, multiple variants, or start with an outline.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Important Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Essays are generated based on YOUR real profile data</li>
                <li>• Review and edit all generated content before submitting</li>
                <li>• Check scholarship terms - some may prohibit AI assistance</li>
                <li>• Your profile must be at least 40% complete for quality results</li>
              </ul>
            </div>
          </div>
        </div>

        <EssayGenerator onEssayGenerated={handleEssaySaved} />
      </main>
    </div>
  );
}
