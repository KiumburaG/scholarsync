// Scholarship resolvers

import { Context } from '../types/context';
import { prisma } from '../utils/prisma';
import { calculateMatchScore, rankScholarships, getTopMatches } from '../utils/matching';
import { logAccess } from '../utils/auth';

export const scholarshipResolvers = {
  Query: {
    // Get all active scholarships
    scholarships: async (
      _parent: any,
      args: { limit?: number; offset?: number; tags?: string[] },
      context: Context
    ) => {
      const { limit = 20, offset = 0, tags } = args;

      const where: any = {
        isActive: true,
        deadline: {
          gte: new Date(), // Only future scholarships
        },
      };

      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags,
        };
      }

      const scholarships = await prisma.scholarship.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          deadline: 'asc',
        },
      });

      // Log access if authenticated
      if (context.userId) {
        await logAccess(context.userId, 'VIEW_SCHOLARSHIPS', {
          count: scholarships.length,
          tags,
        });
      }

      return scholarships;
    },

    // Get scholarship by ID
    scholarship: async (_parent: any, args: { id: string }, context: Context) => {
      const scholarship = await prisma.scholarship.findUnique({
        where: { id: args.id },
      });

      if (!scholarship) {
        throw new Error('Scholarship not found');
      }

      // Log access if authenticated
      if (context.userId) {
        await logAccess(context.userId, 'VIEW_SCHOLARSHIP', {
          scholarshipId: scholarship.id,
          title: scholarship.title,
        });
      }

      return scholarship;
    },

    // Get matched scholarships for current user
    matchedScholarships: async (
      _parent: any,
      args: { limit?: number; minScore?: number },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { limit = 20, minScore = 50 } = args;

      // Get user profile with activities
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (!profile) {
        throw new Error('Profile not found. Please complete your profile first.');
      }

      // Get all active scholarships
      const scholarships = await prisma.scholarship.findMany({
        where: {
          isActive: true,
          deadline: {
            gte: new Date(),
          },
        },
      });

      // Calculate matches
      const matches = getTopMatches(profile, scholarships, limit * 2); // Get extra to filter

      // Filter by minimum score
      const filteredMatches = matches.filter(m => m.score >= minScore).slice(0, limit);

      // Save match scores to database for analytics
      for (const match of filteredMatches) {
        await prisma.matchScore.upsert({
          where: {
            userId_scholarshipId: {
              userId: context.userId,
              scholarshipId: match.scholarship.id,
            },
          },
          create: {
            userId: context.userId,
            scholarshipId: match.scholarship.id,
            score: match.score,
            factors: match.factors as any,
            lastCalculated: new Date(),
          },
          update: {
            score: match.score,
            factors: match.factors as any,
            lastCalculated: new Date(),
          },
        });
      }

      await logAccess(context.userId, 'CALCULATE_MATCHES', {
        profileId: profile.id,
        matchCount: filteredMatches.length,
        minScore,
      });

      return filteredMatches.map(m => ({
        scholarship: m.scholarship,
        matchScore: m.score,
        matchFactors: m.factors,
        eligibilityStatus: m.eligibilityStatus,
        missingRequirements: m.missingRequirements,
      }));
    },

    // Get match score for a specific scholarship
    scholarshipMatch: async (
      _parent: any,
      args: { scholarshipId: string },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      // Get profile
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Get scholarship
      const scholarship = await prisma.scholarship.findUnique({
        where: { id: args.scholarshipId },
      });

      if (!scholarship) {
        throw new Error('Scholarship not found');
      }

      // Calculate match
      const { score, factors, eligibilityStatus, missingRequirements } = calculateMatchScore(
        profile,
        scholarship
      );

      // Save match score
      await prisma.matchScore.upsert({
        where: {
          userId_scholarshipId: {
            userId: context.userId,
            scholarshipId: scholarship.id,
          },
        },
        create: {
          userId: context.userId,
          scholarshipId: scholarship.id,
          score,
          factors: factors as any,
          lastCalculated: new Date(),
        },
        update: {
          score,
          factors: factors as any,
          lastCalculated: new Date(),
        },
      });

      return {
        scholarship,
        matchScore: score,
        matchFactors: factors,
        eligibilityStatus,
        missingRequirements,
      };
    },

    // Search scholarships
    searchScholarships: async (
      _parent: any,
      args: { query: string; limit?: number },
      context: Context
    ) => {
      const { query, limit = 20 } = args;

      const scholarships = await prisma.scholarship.findMany({
        where: {
          isActive: true,
          deadline: {
            gte: new Date(),
          },
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { organization: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: {
          deadline: 'asc',
        },
      });

      if (context.userId) {
        await logAccess(context.userId, 'SEARCH_SCHOLARSHIPS', { query, results: scholarships.length });
      }

      return scholarships;
    },

    // Get available scholarship tags
    scholarshipTags: async () => {
      const scholarships = await prisma.scholarship.findMany({
        where: {
          isActive: true,
          deadline: {
            gte: new Date(),
          },
        },
        select: {
          tags: true,
        },
      });

      // Flatten and deduplicate tags
      const allTags = scholarships.flatMap(s => s.tags as string[]);
      const uniqueTags = Array.from(new Set(allTags)).sort();

      return uniqueTags;
    },
  },
};
