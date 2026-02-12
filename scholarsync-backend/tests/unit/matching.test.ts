// Scholarship matching algorithm tests

import { calculateMatchScore, rankScholarships } from '../../src/utils/matching';

describe('Matching Algorithm', () => {
  const mockProfile = {
    id: 'profile-1',
    userId: 'user-1',
    firstName: 'Jane',
    lastName: 'Doe',
    gpa: 3.8,
    major: 'Computer Science',
    academicStanding: 'Undergraduate',
    profileStrengthScore: 85,
    activities: [
      { type: 'volunteer', organization: 'Code for Good' },
      { type: 'leadership', organization: 'Tech Club President' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  const mockScholarship = {
    id: 'scholarship-1',
    title: 'STEM Excellence Award',
    organization: 'Tech Foundation',
    amount: 10000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    description: 'For outstanding STEM students',
    eligibilityRequirements: {
      minGPA: 3.5,
      academicStanding: ['Undergraduate'],
      majors: ['Computer Science', 'Engineering', 'Mathematics'],
      citizenshipRequired: true,
      essayRequired: true,
      recommendationsRequired: 2,
    },
    applicationUrl: 'https://example.com/apply',
    tags: ['STEM', 'Technology', 'Leadership'],
    isActive: true,
    source: 'manual',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  describe('calculateMatchScore', () => {
    it('should return high score for perfect match', () => {
      const result = calculateMatchScore(mockProfile, mockScholarship);

      expect(result.score).toBeGreaterThan(80);
      expect(result.eligibilityStatus).toBe('eligible');
      expect(result.missingRequirements).toHaveLength(0);
    });

    it('should calculate GPA match correctly', () => {
      // Profile GPA (3.8) meets requirement (3.5)
      const result = calculateMatchScore(mockProfile, mockScholarship);
      expect(result.factors.gpaMatch).toBe(1.0);

      // Profile GPA below requirement
      const lowGPAProfile = { ...mockProfile, gpa: 3.0 };
      const result2 = calculateMatchScore(lowGPAProfile, mockScholarship);
      expect(result2.factors.gpaMatch).toBeLessThan(1.0);
      expect(result2.missingRequirements.length).toBeGreaterThan(0);
    });

    it('should calculate major match correctly', () => {
      // Matching major
      const result = calculateMatchScore(mockProfile, mockScholarship);
      expect(result.factors.majorMatch).toBe(1.0);

      // Non-matching major
      const differentMajorProfile = { ...mockProfile, major: 'History' };
      const result2 = calculateMatchScore(differentMajorProfile, mockScholarship);
      expect(result2.factors.majorMatch).toBeLessThan(1.0);
    });

    it('should calculate academic standing match correctly', () => {
      // Matching standing
      const result = calculateMatchScore(mockProfile, mockScholarship);
      expect(result.factors.academicStandingMatch).toBe(1.0);

      // Non-matching standing
      const gradProfile = { ...mockProfile, academicStanding: 'Graduate' };
      const result2 = calculateMatchScore(gradProfile, mockScholarship);
      expect(result2.factors.academicStandingMatch).toBe(0);
      expect(result2.eligibilityStatus).toBe('ineligible');
    });

    it('should calculate deadline proximity correctly', () => {
      // 30 days away - optimal
      const result = calculateMatchScore(mockProfile, mockScholarship);
      expect(result.factors.deadlineProximity).toBeGreaterThan(0.8);

      // Expired deadline
      const expiredScholarship = {
        ...mockScholarship,
        deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      };
      const result2 = calculateMatchScore(mockProfile, expiredScholarship);
      expect(result2.factors.deadlineProximity).toBe(0);
      expect(result2.eligibilityStatus).toBe('ineligible');

      // Too soon (5 days)
      const urgentScholarship = {
        ...mockScholarship,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      };
      const result3 = calculateMatchScore(mockProfile, urgentScholarship);
      expect(result3.factors.deadlineProximity).toBeLessThan(0.5);
    });

    it('should calculate profile strength correctly', () => {
      const result = calculateMatchScore(mockProfile, mockScholarship);
      expect(result.factors.profileStrength).toBe(0.85); // 85% / 100

      const weakProfile = { ...mockProfile, profileStrengthScore: 40 };
      const result2 = calculateMatchScore(weakProfile, mockScholarship);
      expect(result2.factors.profileStrength).toBe(0.4);
    });

    it('should calculate activity match correctly', () => {
      const result = calculateMatchScore(mockProfile, mockScholarship);
      expect(result.factors.activityMatch).toBeGreaterThan(0);

      // No activities
      const noActivitiesProfile = { ...mockProfile, activities: [] };
      const result2 = calculateMatchScore(noActivitiesProfile, mockScholarship);
      expect(result2.factors.activityMatch).toBe(0.5); // Neutral
    });

    it('should handle scholarship with no requirements', () => {
      const openScholarship = {
        ...mockScholarship,
        eligibilityRequirements: {},
      };
      const result = calculateMatchScore(mockProfile, openScholarship);

      expect(result.score).toBeGreaterThan(0);
      expect(result.eligibilityStatus).toBe('eligible');
    });

    it('should return missing requirements for ineligible profiles', () => {
      const ineligibleProfile = {
        ...mockProfile,
        gpa: 3.0, // Below requirement
        major: 'History', // Not in list
        academicStanding: 'Graduate', // Not in list
      };
      const result = calculateMatchScore(ineligibleProfile, mockScholarship);

      expect(result.missingRequirements.length).toBeGreaterThan(0);
      expect(result.eligibilityStatus).toBe('ineligible');
    });
  });

  describe('rankScholarships', () => {
    const scholarships = [
      {
        ...mockScholarship,
        id: 'sch-1',
        eligibilityRequirements: { minGPA: 3.5, majors: ['Computer Science'] },
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        ...mockScholarship,
        id: 'sch-2',
        eligibilityRequirements: { minGPA: 4.0, majors: ['History'] },
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        ...mockScholarship,
        id: 'sch-3',
        eligibilityRequirements: { minGPA: 3.0, majors: ['Computer Science'] },
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
    ] as any;

    it('should rank scholarships by match score', () => {
      const ranked = rankScholarships(mockProfile, scholarships);

      expect(ranked).toHaveLength(3);
      expect(ranked[0].score).toBeGreaterThanOrEqual(ranked[1].score);
      expect(ranked[1].score).toBeGreaterThanOrEqual(ranked[2].score);
    });

    it('should sort by deadline when scores are equal', () => {
      const sameScoreScholarships = [
        {
          ...mockScholarship,
          id: 'sch-1',
          eligibilityRequirements: { minGPA: 3.5 },
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          ...mockScholarship,
          id: 'sch-2',
          eligibilityRequirements: { minGPA: 3.5 },
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
      ] as any;

      const ranked = rankScholarships(mockProfile, sameScoreScholarships);

      // Earlier deadline should come first if scores are equal
      const firstDeadline = new Date(ranked[0].scholarship.deadline);
      const secondDeadline = new Date(ranked[1].scholarship.deadline);
      expect(firstDeadline.getTime()).toBeLessThanOrEqual(secondDeadline.getTime());
    });

    it('should handle empty scholarship list', () => {
      const ranked = rankScholarships(mockProfile, []);
      expect(ranked).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle profile with missing GPA', () => {
      const noGPAProfile = { ...mockProfile, gpa: undefined };
      const result = calculateMatchScore(noGPAProfile, mockScholarship);

      expect(result.factors.gpaMatch).toBe(0);
      expect(result.missingRequirements).toContain('GPA not provided in profile');
    });

    it('should handle profile with missing major', () => {
      const noMajorProfile = { ...mockProfile, major: undefined };
      const result = calculateMatchScore(noMajorProfile, mockScholarship);

      expect(result.factors.majorMatch).toBe(0);
      expect(result.missingRequirements).toContain('Major not provided in profile');
    });

    it('should handle scholarship with empty tags', () => {
      const noTagsScholarship = { ...mockScholarship, tags: [] };
      const result = calculateMatchScore(mockProfile, noTagsScholarship);

      expect(result.score).toBeGreaterThan(0);
      expect(result.factors.activityMatch).toBeGreaterThan(0);
    });
  });
});
