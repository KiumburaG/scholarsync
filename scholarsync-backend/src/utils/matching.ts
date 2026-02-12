// Scholarship matching algorithm

import { UserProfile, Activity, Scholarship } from '@prisma/client';

export interface MatchFactors {
  gpaMatch: number;
  majorMatch: number;
  deadlineProximity: number;
  profileStrength: number;
  activityMatch: number;
  academicStandingMatch: number;
}

export interface ScholarshipMatch {
  scholarship: Scholarship;
  score: number;
  factors: MatchFactors;
  eligibilityStatus: 'eligible' | 'ineligible' | 'partial';
  missingRequirements: string[];
}

interface ProfileWithActivities extends UserProfile {
  activities?: Activity[];
}

/**
 * Calculate match score between a user profile and a scholarship
 * Score ranges from 0-100, with higher scores indicating better matches
 */
export function calculateMatchScore(
  profile: ProfileWithActivities,
  scholarship: Scholarship
): { score: number; factors: MatchFactors; eligibilityStatus: string; missingRequirements: string[] } {
  const factors: MatchFactors = {
    gpaMatch: 0,
    majorMatch: 0,
    deadlineProximity: 0,
    profileStrength: 0,
    activityMatch: 0,
    academicStandingMatch: 0,
  };

  const missingRequirements: string[] = [];
  let eligible = true;

  const requirements = scholarship.eligibilityRequirements as any;

  // 1. GPA Match (20% weight)
  if (requirements.minGPA) {
    if (profile.gpa) {
      if (profile.gpa >= requirements.minGPA) {
        factors.gpaMatch = 1.0;
      } else {
        factors.gpaMatch = Math.max(0, profile.gpa / requirements.minGPA);
        eligible = false;
        missingRequirements.push(`GPA must be ${requirements.minGPA} or higher (yours: ${profile.gpa})`);
      }
    } else {
      factors.gpaMatch = 0;
      missingRequirements.push('GPA not provided in profile');
    }
  } else {
    factors.gpaMatch = 1.0; // No GPA requirement
  }

  // 2. Major Match (25% weight)
  if (requirements.majors && requirements.majors.length > 0) {
    if (profile.major) {
      const majorMatch = requirements.majors.some((reqMajor: string) =>
        profile.major!.toLowerCase().includes(reqMajor.toLowerCase()) ||
        reqMajor.toLowerCase().includes(profile.major!.toLowerCase())
      );
      factors.majorMatch = majorMatch ? 1.0 : 0.3;
      if (!majorMatch) {
        missingRequirements.push(`Major must be one of: ${requirements.majors.join(', ')}`);
      }
    } else {
      factors.majorMatch = 0;
      missingRequirements.push('Major not provided in profile');
    }
  } else {
    factors.majorMatch = 1.0; // No major requirement
  }

  // 3. Academic Standing Match (15% weight)
  if (requirements.academicStanding && requirements.academicStanding.length > 0) {
    if (profile.academicStanding) {
      const standingMatch = requirements.academicStanding.includes(profile.academicStanding);
      factors.academicStandingMatch = standingMatch ? 1.0 : 0;
      if (!standingMatch) {
        eligible = false;
        missingRequirements.push(`Academic standing must be: ${requirements.academicStanding.join(' or ')}`);
      }
    } else {
      factors.academicStandingMatch = 0;
      missingRequirements.push('Academic standing not provided in profile');
    }
  } else {
    factors.academicStandingMatch = 1.0;
  }

  // 4. Deadline Proximity (15% weight)
  // Closer deadlines get higher scores (but not too close - need time to apply)
  const now = new Date();
  const deadline = new Date(scholarship.deadline);
  const daysUntilDeadline = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDeadline < 0) {
    factors.deadlineProximity = 0; // Expired
    eligible = false;
    missingRequirements.push('Deadline has passed');
  } else if (daysUntilDeadline < 7) {
    factors.deadlineProximity = 0.3; // Too soon
  } else if (daysUntilDeadline <= 30) {
    factors.deadlineProximity = 1.0; // Optimal - upcoming
  } else if (daysUntilDeadline <= 60) {
    factors.deadlineProximity = 0.8; // Good
  } else if (daysUntilDeadline <= 90) {
    factors.deadlineProximity = 0.6; // Decent
  } else {
    factors.deadlineProximity = 0.4; // Far away
  }

  // 5. Profile Strength (10% weight)
  factors.profileStrength = (profile.profileStrengthScore || 0) / 100;

  // 6. Activity Match (15% weight)
  // Match based on tags and activity types
  if (profile.activities && profile.activities.length > 0) {
    const scholarshipTags = scholarship.tags || [];
    const activityTypes = profile.activities.map(a => a.type.toLowerCase());

    let activityScore = 0;
    const tagMatches = scholarshipTags.filter((tag: string) => {
      const tagLower = tag.toLowerCase();
      return activityTypes.some(type =>
        type.includes(tagLower) || tagLower.includes(type)
      );
    });

    activityScore = Math.min(1.0, (tagMatches.length / Math.max(scholarshipTags.length, 1)) + 0.3);
    factors.activityMatch = activityScore;
  } else {
    factors.activityMatch = 0.5; // Neutral if no activities
  }

  // Calculate weighted score
  const weights = {
    gpaMatch: 0.20,
    majorMatch: 0.25,
    deadlineProximity: 0.15,
    profileStrength: 0.10,
    activityMatch: 0.15,
    academicStandingMatch: 0.15,
  };

  const score = Math.round(
    factors.gpaMatch * weights.gpaMatch * 100 +
    factors.majorMatch * weights.majorMatch * 100 +
    factors.deadlineProximity * weights.deadlineProximity * 100 +
    factors.profileStrength * weights.profileStrength * 100 +
    factors.activityMatch * weights.activityMatch * 100 +
    factors.academicStandingMatch * weights.academicStandingMatch * 100
  );

  // Determine eligibility status
  let eligibilityStatus: 'eligible' | 'ineligible' | 'partial' = 'eligible';
  if (!eligible) {
    eligibilityStatus = 'ineligible';
  } else if (missingRequirements.length > 0) {
    eligibilityStatus = 'partial';
  }

  return {
    score,
    factors,
    eligibilityStatus,
    missingRequirements,
  };
}

/**
 * Rank scholarships by match score for a given profile
 */
export function rankScholarships(
  profile: ProfileWithActivities,
  scholarships: Scholarship[]
): ScholarshipMatch[] {
  const matches: ScholarshipMatch[] = scholarships.map(scholarship => {
    const { score, factors, eligibilityStatus, missingRequirements } = calculateMatchScore(profile, scholarship);

    return {
      scholarship,
      score,
      factors,
      eligibilityStatus: eligibilityStatus as 'eligible' | 'ineligible' | 'partial',
      missingRequirements,
    };
  });

  // Sort by score (descending) and then by deadline (ascending)
  matches.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(a.scholarship.deadline).getTime() - new Date(b.scholarship.deadline).getTime();
  });

  return matches;
}

/**
 * Filter scholarships by eligibility
 */
export function filterEligibleScholarships(
  matches: ScholarshipMatch[],
  includePartial: boolean = true
): ScholarshipMatch[] {
  return matches.filter(match => {
    if (match.eligibilityStatus === 'eligible') return true;
    if (match.eligibilityStatus === 'partial' && includePartial) return true;
    return false;
  });
}

/**
 * Get top N scholarship matches
 */
export function getTopMatches(
  profile: ProfileWithActivities,
  scholarships: Scholarship[],
  limit: number = 10
): ScholarshipMatch[] {
  const ranked = rankScholarships(profile, scholarships);
  const eligible = filterEligibleScholarships(ranked);
  return eligible.slice(0, limit);
}
