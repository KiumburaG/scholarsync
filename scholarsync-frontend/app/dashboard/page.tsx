'use client';

import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MY_PROFILE_QUERY, APPLICATION_STATS_QUERY } from '@/lib/graphql/queries';
import { isAuthenticated, clearAuthTokens } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(MY_PROFILE_QUERY);
  const { data: statsData } = useQuery(APPLICATION_STATS_QUERY);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  const handleLogout = () => {
    clearAuthTokens();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading profile</p>
          <Button onClick={handleLogout}>Log Out</Button>
        </div>
      </div>
    );
  }

  const profile = data?.myProfile;
  const profileStrength = profile?.profileStrength || 0;
  const firstName = profile?.firstName || 'there';
  const stats = statsData?.applicationStats;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">ScholarSync</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {firstName}!
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Strength Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile Strength</CardTitle>
                  <CardDescription>
                    Your profile is {profileStrength}% complete
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile/edit')}
                >
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={profileStrength} className="h-3 mb-2" />
              <p className="text-sm text-gray-600">
                {profileStrength < 60
                  ? 'Complete your profile to unlock better scholarship matches'
                  : 'Great job! Your profile is ready for scholarship matching'}
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Matched Scholarships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">12+</p>
                <p className="text-sm text-gray-600 mt-2">
                  Personalized matches ready
                </p>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => router.push('/scholarships')}
                >
                  View All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applications Started</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-orange-600">
                  {stats ? stats.total : 0}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {stats && stats.inProgress > 0 ? `${stats.inProgress} in progress` : 'Ready to apply'}
                </p>
                <Button
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => router.push('/applications')}
                >
                  View All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scholarships Won</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">
                  ${stats ? stats.totalAmountWon.toLocaleString() : 0}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {stats && stats.accepted > 0 ? `${stats.accepted} accepted` : 'Track your wins'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon Features */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Available features and tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">AI Essay Generator</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Generate personalized scholarship essays using AI
                    </p>
                    <Button
                      size="sm"
                      onClick={() => router.push('/essay-generator')}
                    >
                      Generate Essay
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Scholarship Matching</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      AI-powered matching algorithm to find scholarships you qualify for
                    </p>
                    <Button
                      size="sm"
                      onClick={() => router.push('/scholarships')}
                    >
                      Browse Scholarships
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Analytics Dashboard</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Track your performance and success metrics
                    </p>
                    <Button
                      size="sm"
                      onClick={() => router.push('/analytics')}
                    >
                      View Analytics
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold">Chrome Extension</h4>
                    <p className="text-sm text-gray-600">
                      Auto-fill scholarship applications with one click
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 text-orange-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">Application Tracking</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Track deadlines, submissions, and outcomes
                    </p>
                    <Button
                      size="sm"
                      onClick={() => router.push('/applications')}
                    >
                      Track Applications
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
