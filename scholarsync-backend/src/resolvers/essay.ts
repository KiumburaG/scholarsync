import { Context } from '../context';
import { prisma } from '../utils/prisma';
import { geminiService } from '../services/gemini';

interface GenerateEssayInput {
  prompt: string;
  wordLimit?: number;
  scholarshipMission?: string;
  essayType?: 'personal' | 'academic' | 'career' | 'community' | 'leadership';
  generationMethod?: 'single_draft' | 'multiple_variants' | 'outline_first';
}

export const essayResolvers = {
  Mutation: {
    generateEssay: async (
      _parent: any,
      args: { input: GenerateEssayInput },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      // Check if Gemini API is configured
      if (!geminiService.isConfigured()) {
        throw new Error(
          'Essay generation is not available. Please configure GEMINI_API_KEY in environment variables.'
        );
      }

      const { input } = args;

      // Fetch user profile with activities
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (!profile) {
        throw new Error('Profile not found. Please complete your profile first.');
      }

      // Check profile strength - recommend at least 40% for good essays
      if (profile.profileStrengthScore < 40) {
        throw new Error(
          'Your profile needs more information to generate quality essays. Please complete more of your profile (current: ' +
            profile.profileStrengthScore +
            '%).'
        );
      }

      try {
        // Generate essay
        const essay = await geminiService.generateEssay(profile, input);

        // Calculate word count
        const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;

        // Log essay generation
        await prisma.accessLog.create({
          data: {
            userId: context.userId,
            action: 'generate_essay',
            resourceType: 'essay',
          },
        });

        return {
          essay,
          wordCount,
          variants: [],
        };
      } catch (error: any) {
        // Handle quota exceeded
        if (error.message.includes('quota')) {
          throw new Error(
            'AI quota exceeded. Your request has been queued and will be processed when quota resets. Please try again in a few minutes.'
          );
        }
        throw error;
      }
    },

    generateMultipleVariants: async (
      _parent: any,
      args: { input: GenerateEssayInput; count?: number },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      if (!geminiService.isConfigured()) {
        throw new Error('Essay generation is not available. GEMINI_API_KEY not configured.');
      }

      const { input, count = 3 } = args;

      // Validate count
      if (count < 2 || count > 5) {
        throw new Error('Variant count must be between 2 and 5');
      }

      // Fetch user profile
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (!profile) {
        throw new Error('Profile not found');
      }

      if (profile.profileStrengthScore < 40) {
        throw new Error(
          `Profile needs more information (current: ${profile.profileStrengthScore}%). Please complete more sections.`
        );
      }

      try {
        // Generate multiple variants
        const variants = await geminiService.generateMultipleVariants(profile, input, count);

        // Calculate word counts
        const variantData = variants.map((essay, index) => ({
          variant: index + 1,
          essay,
          wordCount: essay.trim().split(/\s+/).filter(Boolean).length,
        }));

        // Log generation
        await prisma.accessLog.create({
          data: {
            userId: context.userId,
            action: 'generate_essay_variants',
            resourceType: 'essay',
          },
        });

        return {
          essay: variants[0], // Return first variant as default
          wordCount: variantData[0].wordCount,
          variants: variantData,
        };
      } catch (error: any) {
        if (error.message.includes('quota')) {
          throw new Error('AI quota exceeded. Please try again later.');
        }
        throw error;
      }
    },

    generateOutline: async (
      _parent: any,
      args: { input: GenerateEssayInput },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      if (!geminiService.isConfigured()) {
        throw new Error('Essay generation is not available. GEMINI_API_KEY not configured.');
      }

      const { input } = args;

      // Fetch user profile
      const profile = await prisma.userProfile.findUnique({
        where: { userId: context.userId },
        include: { activities: true },
      });

      if (!profile) {
        throw new Error('Profile not found');
      }

      try {
        // Generate outline
        const outline = await geminiService.generateOutline(profile, input);

        // Log generation
        await prisma.accessLog.create({
          data: {
            userId: context.userId,
            action: 'generate_essay_outline',
            resourceType: 'essay',
          },
        });

        return { outline };
      } catch (error: any) {
        if (error.message.includes('quota')) {
          throw new Error('AI quota exceeded. Please try again later.');
        }
        throw error;
      }
    },

    refineEssay: async (
      _parent: any,
      args: { essayId: string; feedback: string },
      context: Context
    ) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      if (!geminiService.isConfigured()) {
        throw new Error('Essay refinement is not available. GEMINI_API_KEY not configured.');
      }

      const { essayId, feedback } = args;

      // Fetch essay
      const essay = await prisma.essay.findUnique({
        where: { id: essayId },
        include: {
          application: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!essay) {
        throw new Error('Essay not found');
      }

      // Check ownership
      if (essay.application?.user?.id !== context.userId) {
        throw new Error('Not authorized to refine this essay');
      }

      if (!essay.generatedEssay && !essay.finalEssay) {
        throw new Error('No essay content to refine');
      }

      try {
        // Refine essay
        const refinedEssay = await geminiService.refineEssay(
          essay.finalEssay || essay.generatedEssay || '',
          feedback,
          essay.wordLimit || undefined
        );

        // Calculate new word count
        const wordCount = refinedEssay.trim().split(/\s+/).filter(Boolean).length;

        // Update essay
        const updated = await prisma.essay.update({
          where: { id: essayId },
          data: {
            finalEssay: refinedEssay,
            wordCount,
            timesEdited: { increment: 1 },
          },
        });

        // Log refinement
        await prisma.accessLog.create({
          data: {
            userId: context.userId,
            action: 'refine_essay',
            resourceType: 'essay',
            resourceId: essayId,
          },
        });

        return updated;
      } catch (error: any) {
        if (error.message.includes('quota')) {
          throw new Error('AI quota exceeded. Please try again later.');
        }
        throw error;
      }
    },
  },
};
