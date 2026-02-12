// Profile utility tests

import { calculateProfileStrength } from '../../src/utils/profile';

describe('Profile Utils', () => {
  describe('Profile Strength Calculation', () => {
    it('should return 0 for empty profile', () => {
      const profile = {};
      const score = calculateProfileStrength(profile);

      expect(score).toBe(0);
    });

    it('should calculate basic info score (30%)', () => {
      const profile = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        streetAddress: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zip: '02101',
        country: 'USA',
      };
      const score = calculateProfileStrength(profile);

      expect(score).toBe(30); // All basic fields filled
    });

    it('should calculate academic info score (30%)', () => {
      const profile = {
        currentSchool: 'MIT',
        major: 'Computer Science',
        gpa: 3.8,
        academicStanding: 'Undergraduate',
      };
      const score = calculateProfileStrength(profile);

      expect(score).toBe(30); // All academic fields filled
    });

    it('should calculate narrative info score (30%)', () => {
      const profile = {
        background: 'Background text',
        challenges: 'Challenges text',
        academicJourney: 'Journey text',
        careerGoals: 'Goals text',
        whyEducation: 'Why text',
        personalValues: 'Values text',
      };
      const score = calculateProfileStrength(profile);

      expect(score).toBe(30); // All narrative fields filled
    });

    it('should calculate activities score (10%)', () => {
      const profile = {};
      const activities = [
        { id: '1', type: 'Volunteer', organization: 'Red Cross' },
        { id: '2', type: 'Work', organization: 'Tech Corp' },
        { id: '3', type: 'Leadership', organization: 'Student Council' },
      ];
      const score = calculateProfileStrength(profile, activities as any);

      expect(score).toBe(10); // 3+ activities = full score
    });

    it('should calculate complete profile as 100%', () => {
      const profile = {
        // Basic info (30%)
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        streetAddress: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zip: '02101',
        country: 'USA',
        // Academic info (30%)
        currentSchool: 'MIT',
        major: 'Computer Science',
        gpa: 3.8,
        academicStanding: 'Undergraduate',
        // Narrative (30%)
        background: 'Background text',
        challenges: 'Challenges text',
        academicJourney: 'Journey text',
        careerGoals: 'Goals text',
        whyEducation: 'Why text',
        personalValues: 'Values text',
      };
      const activities = [
        { id: '1', type: 'Volunteer', organization: 'Red Cross' },
        { id: '2', type: 'Work', organization: 'Tech Corp' },
        { id: '3', type: 'Leadership', organization: 'Student Council' },
      ];
      const score = calculateProfileStrength(profile, activities as any);

      expect(score).toBe(100);
    });

    it('should calculate partial profile correctly', () => {
      const profile = {
        firstName: 'John',
        lastName: 'Doe',
        // 2/8 basic fields = 7.5% (30% * 2/8)
        currentSchool: 'MIT',
        major: 'Computer Science',
        // 2/4 academic fields = 15% (30% * 2/4)
      };
      const score = calculateProfileStrength(profile);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(30);
    });

    it('should handle activities count correctly', () => {
      const profile = {};

      // 0 activities = 0%
      const score0 = calculateProfileStrength(profile, []);
      expect(score0).toBe(0);

      // 1 activity = 3.33% (10% * 1/3)
      const activities1 = [{ id: '1', type: 'Volunteer' }];
      const score1 = calculateProfileStrength(profile, activities1 as any);
      expect(score1).toBeGreaterThan(0);
      expect(score1).toBeLessThan(5);

      // 2 activities = 6.66% (10% * 2/3)
      const activities2 = [
        { id: '1', type: 'Volunteer' },
        { id: '2', type: 'Work' },
      ];
      const score2 = calculateProfileStrength(profile, activities2 as any);
      expect(score2).toBeGreaterThan(score1);
      expect(score2).toBeLessThan(10);

      // 3+ activities = 10%
      const activities3 = [
        { id: '1', type: 'Volunteer' },
        { id: '2', type: 'Work' },
        { id: '3', type: 'Leadership' },
      ];
      const score3 = calculateProfileStrength(profile, activities3 as any);
      expect(score3).toBe(10);
    });
  });
});
