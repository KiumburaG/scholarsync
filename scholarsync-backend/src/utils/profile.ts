import { UserProfile, Activity } from '@prisma/client';

interface ProfileWithActivities extends UserProfile {
  activities?: Activity[];
}

/**
 * Calculate profile strength score (0-100)
 * Based on completeness of profile sections
 */
export function calculateProfileStrength(
  profile: Partial<UserProfile>,
  activities?: Activity[]
): number {
  let score = 0;
  const weights = {
    basicInfo: 30,
    academicInfo: 30,
    narrative: 30,
    activities: 10,
  };

  // Basic Info (30 points)
  const basicFields = [
    'firstName',
    'lastName',
    'phone',
    'dateOfBirth',
    'streetAddress',
    'city',
    'state',
    'zip',
  ];
  const basicCompleted = basicFields.filter((field) => {
    const value = profile[field as keyof UserProfile];
    return value !== null && value !== undefined && value !== '';
  }).length;
  score += (basicCompleted / basicFields.length) * weights.basicInfo;

  // Academic Info (30 points)
  const academicFields = [
    'currentSchool',
    'expectedGraduation',
    'major',
    'gpa',
    'academicStanding',
  ];
  const academicCompleted = academicFields.filter((field) => {
    const value = profile[field as keyof UserProfile];
    return value !== null && value !== undefined && value !== '';
  }).length;
  score += (academicCompleted / academicFields.length) * weights.academicInfo;

  // Narrative (30 points)
  const narrativeFields = [
    'background',
    'challenges',
    'academicJourney',
    'careerGoals',
    'whyEducation',
    'personalValues',
  ];
  const narrativeCompleted = narrativeFields.filter((field) => {
    const value = profile[field as keyof UserProfile];
    return value !== null && value !== undefined && value !== '' && (value as string).length > 50;
  }).length;
  score += (narrativeCompleted / narrativeFields.length) * weights.narrative;

  // Activities (10 points)
  if (activities) {
    const activityScore = Math.min(activities.length / 3, 1) * weights.activities;
    score += activityScore;
  }

  return Math.round(score);
}

/**
 * Validate profile data
 */
export function validateProfileData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate GPA (if provided)
  if (data.gpa !== undefined && data.gpa !== null) {
    const gpa = parseFloat(data.gpa);
    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
      errors.push('GPA must be between 0.0 and 4.0');
    }
  }

  // Validate phone (if provided)
  if (data.phone && typeof data.phone === 'string') {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(data.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  // Validate dates (if provided)
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth');
    }
    // Check if age is reasonable (13-100 years old)
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 13 || age > 100) {
      errors.push('Invalid date of birth (age must be between 13 and 100)');
    }
  }

  if (data.expectedGraduation) {
    const grad = new Date(data.expectedGraduation);
    if (isNaN(grad.getTime())) {
      errors.push('Invalid expected graduation date');
    }
  }

  // Validate academic standing
  const validAcademicStandings = [
    'freshman',
    'sophomore',
    'junior',
    'senior',
    'graduate',
    'postgraduate',
  ];
  if (data.academicStanding && !validAcademicStandings.includes(data.academicStanding.toLowerCase())) {
    errors.push(
      `Invalid academic standing. Must be one of: ${validAcademicStandings.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate activity data
 */
export function validateActivityData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const validActivityTypes = [
    'leadership',
    'work',
    'volunteer',
    'award',
    'skill',
    'extracurricular',
  ];

  if (!data.type || !validActivityTypes.includes(data.type.toLowerCase())) {
    errors.push(`Activity type must be one of: ${validActivityTypes.join(', ')}`);
  }

  // Validate hours
  if (data.hoursPerWeek !== undefined && data.hoursPerWeek !== null) {
    const hours = parseInt(data.hoursPerWeek);
    if (isNaN(hours) || hours < 0 || hours > 168) {
      errors.push('Hours per week must be between 0 and 168');
    }
  }

  if (data.totalHours !== undefined && data.totalHours !== null) {
    const hours = parseInt(data.totalHours);
    if (isNaN(hours) || hours < 0) {
      errors.push('Total hours must be a positive number');
    }
  }

  // Validate dates
  if (data.startDate) {
    const start = new Date(data.startDate);
    if (isNaN(start.getTime())) {
      errors.push('Invalid start date');
    }
  }

  if (data.endDate && !data.isCurrent) {
    const end = new Date(data.endDate);
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date');
    }

    if (data.startDate) {
      const start = new Date(data.startDate);
      if (end < start) {
        errors.push('End date must be after start date');
      }
    }
  }

  if (data.isCurrent && data.endDate) {
    errors.push('Current activities should not have an end date');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
