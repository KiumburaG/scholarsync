'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MY_PROFILE_QUERY } from '@/lib/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import { BasicInfoStep } from '@/components/onboarding/steps/basic-info-step';
import { AcademicInfoStep } from '@/components/onboarding/steps/academic-info-step';
import { ExperiencesStep } from '@/components/onboarding/steps/experiences-step';
import { NarrativeStep } from '@/components/onboarding/steps/narrative-step';
import { PreferencesStep } from '@/components/onboarding/steps/preferences-step';

type TabType = 'basic' | 'academic' | 'experiences' | 'narrative' | 'preferences';

export default function EditProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [profileData, setProfileData] = useState<any>({});

  const { data, loading } = useQuery(MY_PROFILE_QUERY);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (data?.myProfile) {
      setProfileData(data.myProfile);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic Info', icon: '👤' },
    { id: 'academic' as TabType, label: 'Academic', icon: '🎓' },
    { id: 'experiences' as TabType, label: 'Experiences', icon: '⭐' },
    { id: 'narrative' as TabType, label: 'Your Story', icon: '📝' },
    { id: 'preferences' as TabType, label: 'Preferences', icon: '⚙️' },
  ];

  const updateData = (newData: any) => {
    setProfileData({ ...profileData, ...newData });
  };

  const handleSaveAndClose = () => {
    router.push('/dashboard');
  };

  const renderTabContent = () => {
    const commonProps = {
      data: profileData,
      updateData,
      onNext: handleSaveAndClose,
      onBack: () => router.push('/dashboard'),
    };

    switch (activeTab) {
      case 'basic':
        return <BasicInfoStep {...commonProps} />;
      case 'academic':
        return <AcademicInfoStep {...commonProps} />;
      case 'experiences':
        return <ExperiencesStep {...commonProps} />;
      case 'narrative':
        return <NarrativeStep {...commonProps} />;
      case 'preferences':
        return <PreferencesStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabs.find((t) => t.id === activeTab)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderTabContent()}</CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
