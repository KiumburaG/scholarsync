// Application tracking resolvers

import { Context } from '../types/context';
import { prisma } from '../utils/prisma';
import { logAccess } from '../utils/auth';

export const applicationResolvers = {
  Query: {
    // Get all applications for current user
    myApplications: async (
      _parent: any,
      args: { status?: string; limit?: number },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const { status, limit = 50 } = args;

      const where: any = {
        userId: context.userId,
      };

      if (status) {
        where.status = status;
      }

      const applications = await prisma.application.findMany({
        where,
        include: {
          scholarship: true,
          essays: true,
        },
        orderBy: [
          { status: 'asc' },
          { deadline: 'asc' },
        ],
        take: limit,
      });

      await logAccess(context.userId, 'VIEW_APPLICATIONS', {
        count: applications.length,
        status,
      });

      return applications;
    },

    // Get single application
    application: async (_parent: any, args: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const application = await prisma.application.findUnique({
        where: { id: args.id },
        include: {
          scholarship: true,
          essays: true,
          documents: true,
        },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.userId !== context.userId) {
        throw new Error('Not authorized to view this application');
      }

      await logAccess(context.userId, 'VIEW_APPLICATION', {
        applicationId: application.id,
      });

      return application;
    },

    // Get application statistics
    applicationStats: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const applications = await prisma.application.findMany({
        where: { userId: context.userId },
        include: {
          scholarship: true,
        },
      });

      const stats = {
        total: applications.length,
        draft: applications.filter((a) => a.status === 'DRAFT').length,
        inProgress: applications.filter((a) => a.status === 'IN_PROGRESS').length,
        submitted: applications.filter((a) => a.status === 'SUBMITTED').length,
        accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
        rejected: applications.filter((a) => a.status === 'REJECTED').length,
        pending: applications.filter((a) => a.status === 'PENDING').length,
        totalAmountApplied: applications.reduce(
          (sum, a) => sum + (a.scholarship?.amount || 0),
          0
        ),
        totalAmountWon: applications
          .filter((a) => a.status === 'ACCEPTED' && a.amountAwarded)
          .reduce((sum, a) => sum + (a.amountAwarded || 0), 0),
        upcomingDeadlines: applications.filter(
          (a) =>
            a.deadline &&
            new Date(a.deadline) > new Date() &&
            new Date(a.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ).length,
      };

      return stats;
    },
  },

  Mutation: {
    // Create new application
    createApplication: async (
      _parent: any,
      args: { scholarshipId: string },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      // Check if scholarship exists
      const scholarship = await prisma.scholarship.findUnique({
        where: { id: args.scholarshipId },
      });

      if (!scholarship) {
        throw new Error('Scholarship not found');
      }

      // Check if application already exists
      const existing = await prisma.application.findFirst({
        where: {
          userId: context.userId,
          scholarshipId: args.scholarshipId,
        },
      });

      if (existing) {
        throw new Error('Application already exists for this scholarship');
      }

      // Create application
      const application = await prisma.application.create({
        data: {
          userId: context.userId,
          scholarshipId: args.scholarshipId,
          status: 'DRAFT',
          deadline: scholarship.deadline,
          progressPercentage: 0,
        },
        include: {
          scholarship: true,
        },
      });

      await logAccess(context.userId, 'CREATE_APPLICATION', {
        applicationId: application.id,
        scholarshipId: scholarship.id,
      });

      return application;
    },

    // Update application
    updateApplication: async (
      _parent: any,
      args: { id: string; input: any },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const application = await prisma.application.findUnique({
        where: { id: args.id },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.userId !== context.userId) {
        throw new Error('Not authorized to update this application');
      }

      const updated = await prisma.application.update({
        where: { id: args.id },
        data: {
          status: args.input.status,
          deadline: args.input.deadline,
          submittedAt: args.input.submittedAt,
          notes: args.input.notes,
          progressPercentage: args.input.progressPercentage,
          amountAwarded: args.input.amountAwarded,
          outcomeNotificationDate: args.input.outcomeNotificationDate,
        },
        include: {
          scholarship: true,
          essays: true,
        },
      });

      await logAccess(context.userId, 'UPDATE_APPLICATION', {
        applicationId: updated.id,
        status: updated.status,
      });

      return updated;
    },

    // Delete application
    deleteApplication: async (_parent: any, args: { id: string }, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const application = await prisma.application.findUnique({
        where: { id: args.id },
      });

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.userId !== context.userId) {
        throw new Error('Not authorized to delete this application');
      }

      await prisma.application.delete({
        where: { id: args.id },
      });

      await logAccess(context.userId, 'DELETE_APPLICATION', {
        applicationId: args.id,
      });

      return true;
    },

    // Link essay to application
    linkEssayToApplication: async (
      _parent: any,
      args: { applicationId: string; essayId: string },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const application = await prisma.application.findUnique({
        where: { id: args.applicationId },
      });

      if (!application || application.userId !== context.userId) {
        throw new Error('Application not found or not authorized');
      }

      const essay = await prisma.essay.findUnique({
        where: { id: args.essayId },
      });

      if (!essay || essay.userId !== context.userId) {
        throw new Error('Essay not found or not authorized');
      }

      const updated = await prisma.essay.update({
        where: { id: args.essayId },
        data: {
          applicationId: args.applicationId,
        },
      });

      return updated;
    },

    // Add document to application
    addApplicationDocument: async (
      _parent: any,
      args: { applicationId: string; input: any },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const application = await prisma.application.findUnique({
        where: { id: args.applicationId },
      });

      if (!application || application.userId !== context.userId) {
        throw new Error('Application not found or not authorized');
      }

      const document = await prisma.document.create({
        data: {
          userId: context.userId,
          applicationId: args.applicationId,
          name: args.input.name,
          type: args.input.type,
          url: args.input.url,
          uploadedAt: new Date(),
        },
      });

      return document;
    },

    // Update application progress
    updateApplicationProgress: async (
      _parent: any,
      args: { id: string; percentage: number },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const application = await prisma.application.findUnique({
        where: { id: args.id },
      });

      if (!application || application.userId !== context.userId) {
        throw new Error('Application not found or not authorized');
      }

      const updated = await prisma.application.update({
        where: { id: args.id },
        data: {
          progressPercentage: Math.min(100, Math.max(0, args.percentage)),
          status:
            args.percentage === 100 && application.status === 'DRAFT'
              ? 'IN_PROGRESS'
              : application.status,
        },
        include: {
          scholarship: true,
        },
      });

      return updated;
    },
  },
};
