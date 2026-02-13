'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UPDATE_PROFILE_MUTATION } from '@/lib/graphql/mutations';
import { OnboardingData } from '../onboarding-wizard';

const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().default('United States'),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface Props {
  data: OnboardingData;
  updateData: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  buttonText?: string;
}

export function BasicInfoStep({ data, updateData, onNext, buttonText = 'Next: Academic Info' }: Props) {
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      dateOfBirth: data.dateOfBirth || '',
      streetAddress: data.streetAddress || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      country: data.country || 'United States',
    },
  });

  // Reset form with new data when data prop changes
  useEffect(() => {
    reset({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      dateOfBirth: data.dateOfBirth || '',
      streetAddress: data.streetAddress || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      country: data.country || 'United States',
    });
  }, [data, reset]);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION, {
    onCompleted: () => {
      onNext();
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const onSubmit = (formData: BasicInfoFormData) => {
    setError('');

    // Filter out empty strings to prevent overwriting with null values
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    updateData(cleanedData);

    updateProfile({
      variables: {
        input: cleanedData,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" {...register('firstName')} />
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" {...register('lastName')} />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="(555) 123-4567" {...register('phone')} />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address</Label>
        <Input id="streetAddress" placeholder="123 Main St" {...register('streetAddress')} />
        {errors.streetAddress && (
          <p className="text-sm text-red-600">{errors.streetAddress.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" placeholder="CA" {...register('state')} />
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input id="zip" placeholder="12345" {...register('zip')} />
          {errors.zip && (
            <p className="text-sm text-red-600">{errors.zip.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register('country')} />
        {errors.country && (
          <p className="text-sm text-red-600">{errors.country.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <div></div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : buttonText}
        </Button>
      </div>
    </form>
  );
}
