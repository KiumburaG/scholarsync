'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MY_PROFILE_QUERY } from '@/lib/graphql/queries';
import { OnboardingData } from '../onboarding-wizard';

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PreferencesStep({ data, updateData, onNext, onBack }: Props) {
  const router = useRouter();
  const { data: profileData, loading } = useQuery(MY_PROFILE_QUERY);

  const profile = profileData?.myProfile;
  const profileStrength = profile?.profileStrengthScore || 0;

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

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">🎉 Welcome to ScholarSync!</h3>
            <p className="text-gray-700">
              Your profile is set up and ready to go. Here's what you can do next:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold">Browse Matched Scholarships</h4>
                <p className="text-sm text-gray-600">
                  We'll show you scholarships that match your profile and have high win probability
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <h4 className="font-semibold">Generate AI Essays</h4>
                <p className="text-sm text-gray-600">
                  Our AI writes personalized essays in your voice based on your profile
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold">Install Chrome Extension</h4>
                <p className="text-sm text-gray-600">
                  Auto-fill scholarship applications with one click
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold">Track Your Applications</h4>
                <p className="text-sm text-gray-600">
                  Monitor deadlines, submission status, and win rates in your dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {profileStrength < 60 && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-900">Tip: Strengthen Your Profile</h4>
              <p className="text-sm text-yellow-800 mt-1">
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
