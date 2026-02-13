'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { MY_PROFILE_QUERY } from '@/lib/graphql/queries';
import { isAuthenticated } from '@/lib/auth';
import { BasicInfoStep } from '@/components/onboarding/steps/basic-info-step';
import { AcademicInfoStep } from '@/components/onboarding/steps/academic-info-step';
import { ExperiencesStep } from '@/components/onboarding/steps/experiences-step';
import { NarrativeStep } from '@/components/onboarding/steps/narrative-step';
import { PreferencesStep } from '@/components/onboarding/steps/preferences-step';
import { toast, Toaster } from 'sonner';

type TabType = 'basic' | 'academic' | 'experiences' | 'narrative' | 'preferences';

export default function EditProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [profileData, setProfileData] = useState<any>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [dataVersion, setDataVersion] = useState(0);

  const { data, loading, refetch } = useQuery(MY_PROFILE_QUERY);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (data?.myProfile) {
      const profile = data.myProfile;

      console.log('Profile data from server:', {
        dateOfBirth: profile.dateOfBirth,
        expectedGraduation: profile.expectedGraduation
      });

      // Helper function to convert ISO date to YYYY-MM-DD format
      const formatDateForInput = (isoDate: string | null) => {
        if (!isoDate) return '';
        try {
          // If already in YYYY-MM-DD format, return as is
          if (typeof isoDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
            return isoDate;
          }
          // Otherwise parse and format using UTC to avoid timezone shifts
          const date = new Date(isoDate);
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, '0');
          const day = String(date.getUTCDate()).padStart(2, '0');
          const formatted = `${year}-${month}-${day}`;
          console.log(`Formatted date: ${isoDate} -> ${formatted}`);
          return formatted;
        } catch (e) {
          console.error('Error formatting date:', isoDate, e);
          return '';
        }
      };

      const formattedData = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        dateOfBirth: formatDateForInput(profile.dateOfBirth),
        streetAddress: profile.streetAddress || '',
        city: profile.city || '',
        state: profile.state || '',
        zip: profile.zip || '',
        country: profile.country || 'United States',
        currentSchool: profile.currentSchool || '',
        expectedGraduation: formatDateForInput(profile.expectedGraduation),
        major: profile.major || '',
        minor: profile.minor || '',
        gpa: profile.gpa || undefined,
        academicStanding: profile.academicStanding || '',
        citizenship: profile.citizenship || '',
        ethnicity: profile.ethnicity || '',
        gender: profile.gender || '',
        firstGeneration: profile.firstGeneration || false,
        background: profile.background || '',
        challenges: profile.challenges || '',
        academicJourney: profile.academicJourney || '',
        careerGoals: profile.careerGoals || '',
        whyEducation: profile.whyEducation || '',
        personalValues: profile.personalValues || '',
        activities: profile.activities || [],
      };

      console.log('Formatted profile data:', {
        dateOfBirth: formattedData.dateOfBirth,
        expectedGraduation: formattedData.expectedGraduation
      });

      setProfileData(formattedData);
      setDataLoaded(true);
      setHasUnsavedChanges(false);
      setDataVersion((v) => v + 1); // Increment to force form remount
    }
  }, [data]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading || !dataLoaded) {
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
    setHasUnsavedChanges(true);
  };

  const handleSaveSuccess = async () => {
    // Refetch the profile data to get the latest from the server
    await refetch();
    setHasUnsavedChanges(false);
    toast.success('Changes saved successfully!', {
      description: 'Your profile has been updated.',
      duration: 3000,
    });
  };

  const confirmNavigation = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingAction(() => action);
      setShowConfirmDialog(true);
    } else {
      action();
    }
  };

  const handleConfirmNavigation = () => {
    setShowConfirmDialog(false);
    setHasUnsavedChanges(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  const handleTabChange = (newTab: TabType) => {
    confirmNavigation(() => setActiveTab(newTab));
  };

  const handleBackToDashboard = () => {
    confirmNavigation(() => router.push('/dashboard'));
  };

  const renderTabContent = () => {
    const commonProps = {
      data: profileData,
      updateData,
      onNext: handleSaveSuccess,
      onBack: handleBackToDashboard,
      buttonText: 'Save Changes',
    };

    // Use dataVersion to force remount when data is refetched
    const key = `${activeTab}-${dataVersion}`;

    switch (activeTab) {
      case 'basic':
        return <BasicInfoStep key={key} {...commonProps} />;
      case 'academic':
        return <AcademicInfoStep key={key} {...commonProps} />;
      case 'experiences':
        return <ExperiencesStep key={key} {...commonProps} />;
      case 'narrative':
        return <NarrativeStep key={key} {...commonProps} />;
      case 'preferences':
        return <PreferencesStep key={key} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Unsaved Changes"
        message="You have unsaved changes that will be lost. Are you sure you want to leave this section?"
        confirmText="Leave Anyway"
        cancelText="Stay Here"
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        variant="warning"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToDashboard}
                >
                  ← Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                    Unsaved changes
                  </span>
                )}
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
                        onClick={() => handleTabChange(tab.id)}
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
    </>
  );
}
