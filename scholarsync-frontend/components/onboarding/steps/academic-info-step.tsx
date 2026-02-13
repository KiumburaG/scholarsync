'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UPDATE_PROFILE_MUTATION } from '@/lib/graphql/mutations';
import { OnboardingData } from '../onboarding-wizard';

const academicInfoSchema = z.object({
  currentSchool: z.string().min(1, 'School is required'),
  major: z.string().min(1, 'Major is required'),
  minor: z.string().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  expectedGraduation: z.string().optional(),
  academicStanding: z.string().optional(),
});

type AcademicInfoFormData = z.infer<typeof academicInfoSchema>;

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function AcademicInfoStep({ data, updateData, onNext, onBack }: Props) {
  const [error, setError] = useState('');
  const [academicStanding, setAcademicStanding] = useState(data.academicStanding || '');

  const { register, handleSubmit, formState: { errors } } = useForm<AcademicInfoFormData>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: {
      currentSchool: data.currentSchool || '',
      major: data.major || '',
      minor: data.minor || '',
      gpa: data.gpa || undefined,
      expectedGraduation: data.expectedGraduation || '',
      academicStanding: data.academicStanding || '',
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

  const onSubmit = (formData: AcademicInfoFormData) => {
    setError('');
    const dataWithStanding = { ...formData, academicStanding };
    updateData(dataWithStanding);

    updateProfile({
      variables: {
        input: dataWithStanding,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currentSchool">Current School/University *</Label>
        <Input
          id="currentSchool"
          placeholder="University of California, Berkeley"
          {...register('currentSchool')}
        />
        {errors.currentSchool && (
          <p className="text-sm text-red-600">{errors.currentSchool.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="major">Major *</Label>
          <Input id="major" placeholder="Computer Science" {...register('major')} />
          {errors.major && (
            <p className="text-sm text-red-600">{errors.major.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minor">Minor (Optional)</Label>
          <Input id="minor" placeholder="Mathematics" {...register('minor')} />
          {errors.minor && (
            <p className="text-sm text-red-600">{errors.minor.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            type="number"
            step="0.01"
            min="0"
            max="4.0"
            placeholder="3.85"
            {...register('gpa', { valueAsNumber: true })}
          />
          {errors.gpa && (
            <p className="text-sm text-red-600">{errors.gpa.message}</p>
          )}
          <p className="text-xs text-gray-500">On a 4.0 scale</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedGraduation">Expected Graduation</Label>
          <Input id="expectedGraduation" type="date" {...register('expectedGraduation')} />
          {errors.expectedGraduation && (
            <p className="text-sm text-red-600">{errors.expectedGraduation.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="academicStanding">Academic Standing</Label>
        <Select value={academicStanding} onValueChange={setAcademicStanding}>
          <SelectTrigger>
            <SelectValue placeholder="Select your year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="freshman">Freshman</SelectItem>
            <SelectItem value="sophomore">Sophomore</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="graduate">Graduate Student</SelectItem>
            <SelectItem value="postgraduate">Post-Graduate</SelectItem>
          </SelectContent>
        </Select>
        {errors.academicStanding && (
          <p className="text-sm text-red-600">{errors.academicStanding.message}</p>
        )}
      </div>

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
          {loading ? 'Saving...' : 'Next: Experiences'}
        </Button>
      </div>
    </form>
  );
}
