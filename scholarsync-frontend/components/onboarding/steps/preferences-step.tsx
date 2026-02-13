'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MY_PROFILE_QUERY } from '@/lib/graphql/queries';
import { OnboardingData } from '../onboarding-wizard';
import { useTheme } from '@/contexts/theme-context';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PreferencesStep({ data, updateData, onNext, onBack }: Props) {
  const router = useRouter();
  const { data: profileData, loading } = useQuery(MY_PROFILE_QUERY);
  const { theme, toggleTheme } = useTheme();

  const profile = profileData?.myProfile;
  const profileStrength = profile?.profileStrength || 0;

  const handleComplete = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Profile Strength</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your profile is <strong>{profileStrength}%</strong> complete. A stronger profile means
          better scholarship matches!
        </p>
        <Progress value={profileStrength} className="h-3 mb-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>60% (Good)</span>
          <span>100%</span>
        </div>
      </div>

      <Card className="p-6 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1 dark:text-white">Dark Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toggle between light and dark theme
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-12 w-24 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            style={{
              backgroundColor: theme === 'dark' ? '#3b82f6' : '#e5e7eb'
            }}
            aria-label="Toggle dark mode"
          >
            <span
              className="inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center"
              style={{
                transform: theme === 'dark' ? 'translateX(52px)' : 'translateX(4px)'
              }}
            >
              {theme === 'dark' ? (
                <span className="text-xl">🌙</span>
              ) : (
                <span className="text-xl">☀️</span>
              )}
            </span>
          </button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">🎉 Welcome to ScholarSync!</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Your profile is set up and ready to go. Here's what you can do next:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold dark:text-white">Browse Matched Scholarships</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We'll show you scholarships that match your profile and have high win probability
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <h4 className="font-semibold dark:text-white">Generate AI Essays</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Our AI writes personalized essays in your voice based on your profile
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold dark:text-white">Install Chrome Extension</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Auto-fill scholarship applications with one click
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold dark:text-white">Track Your Applications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monitor deadlines, submission status, and win rates in your dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {profileStrength < 60 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Tip: Strengthen Your Profile</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                Profiles above 60% get better scholarship matches. Consider filling out more
                narrative sections and adding more activities.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
