import { Context } from '../context';
import { prisma } from '../utils/prisma';
import { validateActivityData, calculateProfileStrength } from '../utils/profile';

export const activityResolvers = {
  Mutation: {
    createActivity: async (_parent: any, args: { input: any }, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { input } = args;

      // Validate activity data
      const validation = validateActivityData(input);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Convert date strings to Date objects if provided
      const data: any = { ...input };
      if (input.startDate) {
        data.startDate = new Date(input.startDate);
      }
      if (input.endDate && !input.isCurrent) {
        data.endDate = new Date(input.endDate);
      } else {
        data.endDate = null;
      }

      // Set isCurrent default
      if (data.isCurrent === undefined) {
        data.isCurrent = false;
      }

      // Create activity
      const activity = await prisma.activity.create({
        data: {
          ...data,
          userId: context.userId,
          achievements: input.achievements || [],
        },
      });

      // Recalculate profile strength
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (profile) {
        const profileStrength = calculateProfileStrength(profile, profile.activities);

        await prisma.userProfile.update({
          where: { userId: context.userId },
          data: { profileStrengthScore: profileStrength },
        });
      }

      // Log access
      await prisma.accessLog.create({
        data: {
          userId: context.userId,
          action: 'create_activity',
          resourceType: 'activity',
          resourceId: activity.id,
        },
      });

      return activity;
    },

    updateActivity: async (
      _parent: any,
      args: { id: string; input: any },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { id, input } = args;

      // Check if activity exists and belongs to user
      const existingActivity = await prisma.activity.findUnique({
        where: { id },
      });

      if (!existingActivity) {
        throw new Error('Activity not found');
      }

      if (existingActivity.userId !== context.userId) {
        throw new Error('Not authorized to update this activity');
      }

      // Validate activity data
      const validation = validateActivityData({ ...existingActivity, ...input });
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Convert date strings to Date objects if provided
      const data: any = { ...input };
      if (input.startDate) {
        data.startDate = new Date(input.startDate);
      }
      if (input.endDate && !input.isCurrent) {
        data.endDate = new Date(input.endDate);
      }
      if (input.isCurrent) {
        data.endDate = null;
      }

      // Update activity
      const activity = await prisma.activity.update({
        where: { id },
        data,
      });

      // Recalculate profile strength
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (profile) {
        const profileStrength = calculateProfileStrength(profile, profile.activities);

        await prisma.userProfile.update({
          where: { userId: context.userId },
          data: { profileStrengthScore: profileStrength },
        });
      }

      // Log access
      await prisma.accessLog.create({
        data: {
          userId: context.userId,
          action: 'update_activity',
          resourceType: 'activity',
          resourceId: activity.id,
        },
      });

      return activity;
    },

    deleteActivity: async (_parent: any, args: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { id } = args;

      // Check if activity exists and belongs to user
      const activity = await prisma.activity.findUnique({
        where: { id },
      });

      if (!activity) {
        throw new Error('Activity not found');
      }

      if (activity.userId !== context.userId) {
        throw new Error('Not authorized to delete this activity');
      }

      // Delete activity
      await prisma.activity.delete({
        where: { id },
      });

      // Recalculate profile strength
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (profile) {
        const profileStrength = calculateProfileStrength(profile, profile.activities);

        await prisma.userProfile.update({
          where: { userId: context.userId },
          data: { profileStrengthScore: profileStrength },
        });
      }

      // Log access
      await prisma.accessLog.create({
        data: {
          userId: context.userId,
          action: 'delete_activity',
          resourceType: 'activity',
          resourceId: id,
        },
      });

      return true;
    },
  },
};
