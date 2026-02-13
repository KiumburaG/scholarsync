import { Context } from '../context';
import { prisma } from '../utils/prisma';
import { calculateProfileStrength, validateProfileData } from '../utils/profile';

export const profileResolvers = {
  Query: {
    myProfile: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: {
          activities: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!profile) {
        throw new Error('Profile not found');
      }

      return profile;
    },

    myActivities: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      return prisma.activity.findMany({
        where: { userId: context.userId },
        orderBy: [
          { isCurrent: 'desc' },
          { startDate: 'desc' },
        ],
      });
    },

    activity: async (_parent: any, args: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const activity = await prisma.activity.findUnique({
        where: { id: args.id },
      });

      if (!activity) {
        throw new Error('Activity not found');
      }

      // Ensure user owns this activity
      if (activity.userId !== context.userId) {
        throw new Error('Not authorized to view this activity');
      }

      return activity;
    },
  },

  Mutation: {
    updateProfile: async (_parent: any, args: { input: any }, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { input } = args;

      // Validate profile data
      const validation = validateProfileData(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Filter out empty strings and convert date strings to Date objects
      const data: any = {};

      // Copy non-empty values from input
      Object.entries(input).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          data[key] = value;
        }
      });

      // Convert date strings to Date objects if provided
      if (data.dateOfBirth) {
        data.dateOfBirth = new Date(data.dateOfBirth);
      }
      if (data.expectedGraduation) {
        data.expectedGraduation = new Date(data.expectedGraduation);
      }

      // Get current profile to calculate strength
      const currentProfile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: {
          activities: true,
          user: true,
        },
      });

      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      // Merge current profile with updates for strength calculation
      const updatedData = { ...currentProfile, ...data };
      const profileStrength = calculateProfileStrength(updatedData, currentProfile.activities);

      // Update profile
      const profile = await prisma.userProfile.update({
        where: { userId: context.userId },
        data: {
          ...data,
          profileStrength: profileStrength,
        },
        include: {
          activities: true,
        },
      });

      // Update user's profileCompleted status if strength is > 60%
      if (profileStrength >= 60 && !currentProfile.user?.profileCompleted) {
        await prisma.user.update({
          where: { id: context.userId },
          data: { profileCompleted: true },
        });
      }

      // Log access
      await prisma.accessLog.create({
        data: {
          userId: context.userId,
          action: 'update_profile',
          resourceType: 'user_profile',
          resourceId: profile.id,
        },
      });

      return profile;
    },
  },

  UserProfile: {
    activities: async (parent: any) => {
      if (parent.activities) {
        return parent.activities;
      }

      return prisma.activity.findMany({
        where: { userId: parent.userId },
        orderBy: [
          { isCurrent: 'desc' },
          { startDate: 'desc' },
        ],
      });
    },
  },
};
