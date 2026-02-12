// Profile and Activity types for frontend

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  currentSchool?: string;
  schoolType?: string;
  expectedGraduation?: string;
  major?: string;
  minor?: string;
  gpa?: number;
  academicStanding?: string;
  citizenship?: string;
  ethnicity?: string;
  gender?: string;
  firstGeneration?: boolean;
  militaryStatus?: string;
  financialNeedIndicator?: string;
  background?: string;
  challenges?: string;
  academicJourney?: string;
  careerGoals?: string;
  whyEducation?: string;
  personalValues?: string;
  profileStrengthScore: number;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  organization?: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  hoursPerWeek?: number;
  totalHours?: number;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export type ActivityType =
  | 'leadership'
  | 'work'
  | 'volunteer'
  | 'award'
  | 'skill'
  | 'extracurricular';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  currentSchool?: string;
  schoolType?: string;
  expectedGraduation?: string;
  major?: string;
  minor?: string;
  gpa?: number;
  academicStanding?: string;
  citizenship?: string;
  ethnicity?: string;
  gender?: string;
  firstGeneration?: boolean;
  militaryStatus?: string;
  financialNeedIndicator?: string;
  background?: string;
  challenges?: string;
  academicJourney?: string;
  careerGoals?: string;
  whyEducation?: string;
  personalValues?: string;
}

export interface CreateActivityInput {
  type: ActivityType;
  organization?: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  hoursPerWeek?: number;
  totalHours?: number;
  achievements?: string[];
}
