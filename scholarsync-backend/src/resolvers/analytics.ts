// Analytics resolvers

import { Context } from '../types/context';
import { prisma } from '../utils/prisma';
import { logAccess } from '../utils/auth';

export const analyticsResolvers = {
  Query: {
    // Get application timeline data
    applicationTimeline: async (
      _parent: any,
      args: { months?: number },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { months = 6 } = args;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const applications = await prisma.application.findMany({
        where: {
          userId: context.userId,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          scholarship: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Group by month
      const timeline: { [key: string]: any } = {};

      applications.forEach((app) => {
        const date = new Date(app.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!timeline[monthKey]) {
          timeline[monthKey] = {
            month: monthKey,
            started: 0,
            submitted: 0,
            accepted: 0,
            rejected: 0,
            totalAmount: 0,
            wonAmount: 0,
          };
        }

        timeline[monthKey].started++;

        if (app.status === 'SUBMITTED' || app.status === 'PENDING' || app.status === 'ACCEPTED') {
          timeline[monthKey].submitted++;
        }

        if (app.status === 'ACCEPTED') {
          timeline[monthKey].accepted++;
          timeline[monthKey].wonAmount += app.amountAwarded || 0;
        }

        if (app.status === 'REJECTED') {
          timeline[monthKey].rejected++;
        }

        timeline[monthKey].totalAmount += app.scholarship?.amount || 0;
      });

      await logAccess(context.userId, 'VIEW_ANALYTICS_TIMELINE', {
        months,
        dataPoints: Object.keys(timeline).length,
      });

      return Object.values(timeline);
    },

    // Get success rate analytics
    successAnalytics: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const applications = await prisma.application.findMany({
        where: { userId: context.userId },
        include: {
          scholarship: true,
        },
      });

      const total = applications.length;
      const submitted = applications.filter(
        (a) => ['SUBMITTED', 'PENDING', 'ACCEPTED', 'REJECTED'].includes(a.status)
      ).length;
      const accepted = applications.filter((a) => a.status === 'ACCEPTED').length;
      const rejected = applications.filter((a) => a.status === 'REJECTED').length;
      const pending = applications.filter((a) => a.status === 'PENDING').length;

      const successRate = submitted > 0 ? (accepted / submitted) * 100 : 0;
      const completionRate = total > 0 ? (submitted / total) * 100 : 0;

      // Average time to submit (from creation to submission)
      const submittedApps = applications.filter((a) => a.submittedAt);
      let avgTimeToSubmit = 0;
      if (submittedApps.length > 0) {
        const totalDays = submittedApps.reduce((sum, app) => {
          const created = new Date(app.createdAt).getTime();
          const submitted = new Date(app.submittedAt!).getTime();
          const days = (submitted - created) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0);
        avgTimeToSubmit = totalDays / submittedApps.length;
      }

      // Category breakdown
      const categoryStats: { [key: string]: any } = {};
      applications.forEach((app) => {
        const tags = app.scholarship?.tags || [];
        tags.forEach((tag: any) => {
          if (!categoryStats[tag]) {
            categoryStats[tag] = {
              category: tag,
              total: 0,
              accepted: 0,
              rejected: 0,
              wonAmount: 0,
            };
          }
          categoryStats[tag].total++;
          if (app.status === 'ACCEPTED') {
            categoryStats[tag].accepted++;
            categoryStats[tag].wonAmount += app.amountAwarded || 0;
          }
          if (app.status === 'REJECTED') {
            categoryStats[tag].rejected++;
          }
        });
      });

      const categoryBreakdown = Object.values(categoryStats).map((cat: any) => ({
        ...cat,
        successRate: cat.total > 0 ? (cat.accepted / cat.total) * 100 : 0,
      }));

      await logAccess(context.userId, 'VIEW_SUCCESS_ANALYTICS', {
        totalApplications: total,
        successRate,
      });

      return {
        totalApplications: total,
        submitted,
        accepted,
        rejected,
        pending,
        successRate,
        completionRate,
        avgTimeToSubmit,
        categoryBreakdown,
      };
    },

    // Get activity analytics
    activityAnalytics: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const applications = await prisma.application.findMany({
        where: { userId: context.userId },
        orderBy: { createdAt: 'desc' },
      });

      const essays = await prisma.essay.findMany({
        where: { userId: context.userId },
        orderBy: { createdAt: 'desc' },
      });

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentApps = applications.filter(
        (a) => new Date(a.createdAt) >= thirtyDaysAgo
      );
      const recentEssays = essays.filter((e) => new Date(e.createdAt) >= thirtyDaysAgo);

      // Most active day
      const dayActivity: { [key: string]: number } = {};
      [...applications, ...essays].forEach((item) => {
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        dayActivity[date] = (dayActivity[date] || 0) + 1;
      });

      const mostActiveDay = Object.entries(dayActivity).sort((a, b) => b[1] - a[1])[0] || [
        'N/A',
        0,
      ];

      // Streaks
      const activityDates = Object.keys(dayActivity).sort();
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date().toISOString().split('T')[0];
      for (let i = activityDates.length - 1; i >= 0; i--) {
        const date = new Date(activityDates[i]);
        const nextDate = i < activityDates.length - 1 ? new Date(activityDates[i + 1]) : null;

        if (nextDate) {
          const diff = (nextDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            tempStreak = 1;
          }
        }

        if (activityDates[i] === today || (i === activityDates.length - 1 && tempStreak > 0)) {
          currentStreak = tempStreak;
        }
      }

      if (tempStreak > longestStreak) longestStreak = tempStreak;

      await logAccess(context.userId, 'VIEW_ACTIVITY_ANALYTICS', {
        recentApps: recentApps.length,
        recentEssays: recentEssays.length,
      });

      return {
        totalApplications: applications.length,
        totalEssays: essays.length,
        recentApplications: recentApps.length,
        recentEssays: recentEssays.length,
        mostActiveDay: mostActiveDay[0],
        mostActiveDayCount: mostActiveDay[1],
        currentStreak,
        longestStreak,
        lastActivityDate: activityDates[activityDates.length - 1] || null,
      };
    },

    // Get upcoming deadlines
    upcomingDeadlines: async (
      _parent: any,
      args: { days?: number },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { days = 30 } = args;
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const applications = await prisma.application.findMany({
        where: {
          userId: context.userId,
          deadline: {
            gte: now,
            lte: futureDate,
          },
          status: {
            in: ['DRAFT', 'IN_PROGRESS'],
          },
        },
        include: {
          scholarship: true,
        },
        orderBy: {
          deadline: 'asc',
        },
      });

      const deadlines = applications.map((app) => ({
        applicationId: app.id,
        scholarshipTitle: app.scholarship?.title || 'Unknown',
        deadline: app.deadline,
        daysRemaining: Math.floor(
          (new Date(app.deadline!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
        progressPercentage: app.progressPercentage,
        status: app.status,
      }));

      return deadlines;
    },

    // Get financial summary
    financialSummary: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const applications = await prisma.application.findMany({
        where: { userId: context.userId },
        include: {
          scholarship: true,
        },
      });

      const totalAppliedFor = applications.reduce(
        (sum, app) => sum + (app.scholarship?.amount || 0),
        0
      );

      const totalWon = applications
        .filter((app) => app.status === 'ACCEPTED')
        .reduce((sum, app) => sum + (app.amountAwarded || 0), 0);

      const pending = applications
        .filter((app) => app.status === 'PENDING' || app.status === 'SUBMITTED')
        .reduce((sum, app) => sum + (app.scholarship?.amount || 0), 0);

      const averageAwardWon =
        applications.filter((app) => app.status === 'ACCEPTED').length > 0
          ? totalWon / applications.filter((app) => app.status === 'ACCEPTED').length
          : 0;

      // Monthly breakdown
      const monthlyBreakdown: { [key: string]: any } = {};
      applications.forEach((app) => {
        if (app.status === 'ACCEPTED' && app.amountAwarded) {
          const date = new Date(app.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!monthlyBreakdown[monthKey]) {
            monthlyBreakdown[monthKey] = {
              month: monthKey,
              amount: 0,
              count: 0,
            };
          }

          monthlyBreakdown[monthKey].amount += app.amountAwarded;
          monthlyBreakdown[monthKey].count++;
        }
      });

      return {
        totalAppliedFor,
        totalWon,
        pending,
        averageAwardWon,
        numberOfWins: applications.filter((app) => app.status === 'ACCEPTED').length,
        monthlyBreakdown: Object.values(monthlyBreakdown),
      };
    },
  },
};
