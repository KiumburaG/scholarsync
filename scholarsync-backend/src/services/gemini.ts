import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile, Activity } from '@prisma/client';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface EssayGenerationOptions {
  prompt: string;
  wordLimit?: number;
  scholarshipMission?: string;
  essayType?: 'personal' | 'academic' | 'career' | 'community' | 'leadership';
  generationMethod?: 'single_draft' | 'multiple_variants' | 'outline_first';
}

interface ProfileWithActivities extends UserProfile {
  activities?: Activity[];
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  isConfigured(): boolean {
    return !!GEMINI_API_KEY && !!this.model;
  }

  /**
   * Generate essay based on user profile and prompt
   */
  async generateEssay(
    profile: ProfileWithActivities,
    options: EssayGenerationOptions
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    const systemPrompt = this.buildSystemPrompt(profile, options);

    try {
      const result = await this.model.generateContent(systemPrompt);
      const response = await result.response;
      const essay = response.text();

      return essay.trim();
    } catch (error: any) {
      if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      }
      throw new Error(`Essay generation failed: ${error.message}`);
    }
  }

  /**
   * Generate multiple essay variants
   */
  async generateMultipleVariants(
    profile: ProfileWithActivities,
    options: EssayGenerationOptions,
    count: number = 3
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured.');
    }

    const variants: string[] = [];

    for (let i = 0; i < count; i++) {
      const variantOptions = {
        ...options,
        // Add variation instructions
        generationMethod: 'multiple_variants' as const,
      };

      const essay = await this.generateEssay(profile, variantOptions);
      variants.push(essay);
    }

    return variants;
  }

  /**
   * Generate essay outline
   */
  async generateOutline(
    profile: ProfileWithActivities,
    options: EssayGenerationOptions
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured.');
    }

    const outlinePrompt = this.buildOutlinePrompt(profile, options);

    try {
      const result = await this.model.generateContent(outlinePrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      throw new Error(`Outline generation failed: ${error.message}`);
    }
  }

  /**
   * Refine essay based on feedback
   */
  async refineEssay(
    originalEssay: string,
    feedback: string,
    wordLimit?: number
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured.');
    }

    const refinementPrompt = `
You are refining a scholarship essay based on user feedback.

Original Essay:
${originalEssay}

User Feedback:
${feedback}

${wordLimit ? `Word Limit: ${wordLimit} words` : ''}

Please revise the essay incorporating the feedback while maintaining:
- The authentic voice and facts from the original
- Proper essay structure
- Clear, concise writing
${wordLimit ? `- Staying within the ${wordLimit} word limit` : ''}

Revised Essay:
`;

    try {
      const result = await this.model.generateContent(refinementPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      throw new Error(`Essay refinement failed: ${error.message}`);
    }
  }

  /**
   * Build system prompt with user context
   */
  private buildSystemPrompt(
    profile: ProfileWithActivities,
    options: EssayGenerationOptions
  ): string {
    const userContext = this.buildUserContext(profile);
    const essayTypeGuidance = this.getEssayTypeGuidance(options.essayType);

    return `
You are a scholarship essay writing assistant. Your task is to write a compelling, authentic essay based on the student's real experiences and profile.

STUDENT PROFILE:
${userContext}

ESSAY PROMPT:
${options.prompt}

${options.scholarshipMission ? `SCHOLARSHIP MISSION:\n${options.scholarshipMission}\n` : ''}

${options.wordLimit ? `WORD LIMIT: ${options.wordLimit} words\n` : ''}

${essayTypeGuidance}

INSTRUCTIONS:
1. Write in the student's authentic voice based on their profile narrative
2. Use ONLY facts and experiences from their profile - DO NOT fabricate anything
3. Address the prompt directly and specifically
4. Include concrete examples from their experiences
5. Show genuine passion and reflection
6. Use varied sentence structure to avoid AI detection
7. Stay within the word limit (target: ${options.wordLimit || 500} words)
8. End with a strong, memorable conclusion

${options.generationMethod === 'multiple_variants' ? 'VARIATION: Generate a unique approach/angle for this variant.\n' : ''}

Write the essay now:
`;
  }

  /**
   * Build outline generation prompt
   */
  private buildOutlinePrompt(
    profile: ProfileWithActivities,
    options: EssayGenerationOptions
  ): string {
    const userContext = this.buildUserContext(profile);

    return `
You are creating an essay outline for a scholarship application.

STUDENT PROFILE:
${userContext}

ESSAY PROMPT:
${options.prompt}

${options.scholarshipMission ? `SCHOLARSHIP MISSION:\n${options.scholarshipMission}\n` : ''}

Create a detailed outline with:
1. Introduction (hook, thesis)
2. Body paragraphs (3-4 main points with specific examples from profile)
3. Conclusion (key takeaway, future impact)

Format as a clear, structured outline with bullet points.

Outline:
`;
  }

  /**
   * Build user context from profile
   */
  private buildUserContext(profile: ProfileWithActivities): string {
    let context = '';

    // Basic Info
    if (profile.firstName || profile.lastName) {
      context += `Name: ${profile.firstName || ''} ${profile.lastName || ''}\n`;
    }

    // Academic Info
    if (profile.currentSchool) {
      context += `School: ${profile.currentSchool}\n`;
    }
    if (profile.major) {
      context += `Major: ${profile.major}\n`;
    }
    if (profile.academicStanding) {
      context += `Academic Standing: ${profile.academicStanding}\n`;
    }
    if (profile.gpa) {
      context += `GPA: ${profile.gpa}\n`;
    }

    context += '\n';

    // Narrative Sections
    if (profile.background) {
      context += `BACKGROUND:\n${profile.background}\n\n`;
    }
    if (profile.challenges) {
      context += `CHALLENGES OVERCOME:\n${profile.challenges}\n\n`;
    }
    if (profile.academicJourney) {
      context += `ACADEMIC JOURNEY:\n${profile.academicJourney}\n\n`;
    }
    if (profile.careerGoals) {
      context += `CAREER GOALS:\n${profile.careerGoals}\n\n`;
    }
    if (profile.whyEducation) {
      context += `WHY EDUCATION MATTERS:\n${profile.whyEducation}\n\n`;
    }
    if (profile.personalValues) {
      context += `PERSONAL VALUES:\n${profile.personalValues}\n\n`;
    }

    // Activities
    if (profile.activities && profile.activities.length > 0) {
      context += 'ACTIVITIES & EXPERIENCES:\n';
      profile.activities.forEach((activity) => {
        context += `- ${activity.type.toUpperCase()}: ${activity.role || 'Member'} at ${activity.organization || 'Organization'}\n`;
        if (activity.description) {
          context += `  ${activity.description}\n`;
        }
        if (activity.achievements && activity.achievements.length > 0) {
          context += `  Achievements: ${activity.achievements.join(', ')}\n`;
        }
      });
      context += '\n';
    }

    return context;
  }

  /**
   * Get essay type-specific guidance
   */
  private getEssayTypeGuidance(essayType?: string): string {
    const guidance: { [key: string]: string } = {
      personal: 'ESSAY TYPE: Personal - Focus on personal experiences, growth, and character. Show vulnerability and authenticity.',
      academic: 'ESSAY TYPE: Academic - Emphasize intellectual curiosity, academic achievements, and scholarly interests.',
      career: 'ESSAY TYPE: Career - Highlight professional goals, relevant experiences, and future aspirations.',
      community: 'ESSAY TYPE: Community - Showcase community involvement, service, and impact on others.',
      leadership: 'ESSAY TYPE: Leadership - Demonstrate leadership experiences, decision-making, and influence on others.',
    };

    return essayType && guidance[essayType] ? guidance[essayType] : '';
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
