'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BasicInfoStep } from './steps/basic-info-step';
import { AcademicInfoStep } from './steps/academic-info-step';
import { ExperiencesStep } from './steps/experiences-step';
import { NarrativeStep } from './steps/narrative-step';
import { PreferencesStep } from './steps/preferences-step';

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export interface OnboardingData {
  // Basic Info
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;

  // Academic Info
  currentSchool?: string;
  schoolType?: string;
  expectedGraduation?: string;
  major?: string;
  minor?: string;
  gpa?: number;
  academicStanding?: string;

  // Narrative
  background?: string;
  challenges?: string;
  academicJourney?: string;
  careerGoals?: string;
  whyEducation?: string;
  personalValues?: string;

  // Activities (stored separately via mutations)
  activities?: any[];
}

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>({});

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Tell us about yourself' },
    { number: 2, title: 'Academic Info', description: 'Your education background' },
    { number: 3, title: 'Experiences', description: 'Activities and achievements' },
    { number: 4, title: 'Your Story', description: 'Share your narrative' },
    { number: 5, title: 'Preferences', description: 'Customize your experience' },
  ];

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    } else {
      // Onboarding complete
      router.push('/dashboard');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={data} updateData={updateData} onNext={nextStep} />;
      case 2:
        return <AcademicInfoStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <ExperiencesStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <NarrativeStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <PreferencesStep data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome to ScholarSync</h1>
              <p className="text-gray-600 mt-1">Let's set up your profile to find the best scholarships</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Step {currentStep} of {steps.length}</p>
              <p className="text-lg font-semibold text-blue-600">{Math.round(progress)}%</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex-1 ${step.number !== steps.length ? 'mr-2' : ''}`}
            >
              <div
                className={`text-center p-4 rounded-lg transition-all ${
                  step.number === currentStep
                    ? 'bg-white shadow-md border-2 border-blue-500'
                    : step.number < currentStep
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold ${
                    step.number === currentStep
                      ? 'bg-blue-600 text-white'
                      : step.number < currentStep
                      ? 'bg-blue-400 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.number < currentStep ? '✓' : step.number}
                </div>
                <p
                  className={`text-xs font-medium hidden sm:block ${
                    step.number === currentStep ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
