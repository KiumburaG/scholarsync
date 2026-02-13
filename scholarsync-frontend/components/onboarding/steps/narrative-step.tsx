'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UPDATE_PROFILE_MUTATION } from '@/lib/graphql/mutations';
import { OnboardingData } from '../onboarding-wizard';

interface NarrativeFormData {
  background?: string;
  challenges?: string;
  academicJourney?: string;
  careerGoals?: string;
  whyEducation?: string;
  personalValues?: string;
}

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  buttonText?: string;
}

export function NarrativeStep({ data, updateData, onNext, onBack, buttonText = 'Next: Preferences' }: Props) {
  const [error, setError] = useState('');

  const { register, handleSubmit, watch } = useForm<NarrativeFormData>({
    defaultValues: {
      background: data.background || '',
      challenges: data.challenges || '',
      academicJourney: data.academicJourney || '',
      careerGoals: data.careerGoals || '',
      whyEducation: data.whyEducation || '',
      personalValues: data.personalValues || '',
    },
  });

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION, {
    onCompleted: () => {
      onNext();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const onSubmit = (formData: NarrativeFormData) => {
    setError('');
    updateData(formData);

    updateProfile({
      variables: {
        input: formData,
      },
    });
  };

  const watchedValues = watch();

  const getWordCount = (text?: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const sections = [
    {
      id: 'background',
      label: 'Background',
      description: 'Tell us about your family, upbringing, and community (250 words)',
      placeholder:
        'Share your background story... Where did you grow up? What shaped who you are today?',
    },
    {
      id: 'challenges',
      label: 'Challenges Overcome',
      description: 'Describe obstacles you\'ve faced and how you overcame them (250 words)',
      placeholder: 'What challenges have you overcome? How did they shape your resilience?',
    },
    {
      id: 'academicJourney',
      label: 'Academic Journey',
      description: 'Why did you choose your field? What drives your intellectual curiosity? (250 words)',
      placeholder: 'What sparked your interest in your field of study?',
    },
    {
      id: 'careerGoals',
      label: 'Career Goals',
      description: 'What are your future aspirations? What impact do you want to make? (250 words)',
      placeholder: 'What do you hope to achieve in your career? What impact do you want to make?',
    },
    {
      id: 'whyEducation',
      label: 'Why Education Matters',
      description: 'What does education mean to you personally? (250 words)',
      placeholder: 'Why is education important to you?',
    },
    {
      id: 'personalValues',
      label: 'Personal Values',
      description: 'What core principles guide your decisions? (150 words)',
      placeholder: 'What values are most important to you?',
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Share your story. These narrative sections help match you with scholarships and generate
          personalized essays. You can skip sections and complete them later.
        </p>
      </div>

      {sections.map((section) => {
        const fieldName = section.id as keyof NarrativeFormData;
        const wordCount = getWordCount(watchedValues[fieldName]);
        const targetWords = section.id === 'personalValues' ? 150 : 250;

        return (
          <div key={section.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={section.id}>{section.label}</Label>
              <span
                className={`text-sm ${
                  wordCount >= targetWords ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {wordCount} / {targetWords} words
              </span>
            </div>
            <p className="text-xs text-gray-500">{section.description}</p>
            <Textarea
              id={section.id}
              {...register(fieldName)}
              placeholder={section.placeholder}
              rows={5}
              className="resize-none"
            />
          </div>
        );
      })}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : buttonText}
        </Button>
      </div>
    </form>
  );
}
