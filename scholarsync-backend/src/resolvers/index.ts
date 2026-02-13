import { Context } from '../context';
import { prisma } from '../utils/prisma';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  validatePassword,
  validateEmail,
} from '../utils/auth';
import { profileResolvers } from './profile';
import { activityResolvers } from './activity';
import { essayResolvers } from './essay';
import { scholarshipResolvers } from './scholarship';
import { applicationResolvers } from './application';
import { analyticsResolvers } from './analytics';
import { GraphQLScalarType, Kind } from 'graphql';

export const resolvers = {
  Query: {
    health: () => 'ScholarSync API is running!',

    me: async (_parent: any, _args: any, context: Context) => {
      if (!context.userId) {
        throw new Error('Not authenticated');
      }

      const user = await prisma.user.findUnique({
        where: { id: context.userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    },

    // Profile queries
    ...profileResolvers.Query,

    // Scholarship queries
    ...scholarshipResolvers.Query,

    // Application queries
    ...applicationResolvers.Query,

    // Analytics queries
    ...analyticsResolvers.Query,
  },

  Mutation: {
    register: async (_parent: any, args: { email: string; password: string }) => {
      const { email, password } = args;

      // Validate email
      if (!validateEmail(email)) {
        throw new Error('Invalid email address');
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user and profile
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          profile: {
            create: {
              // Profile starts empty, will be filled during onboarding
            },
          },
        },
        include: {
          profile: true,
        },
      });

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      // Log access
      await prisma.accessLog.create({
        data: {
          userId: user.id,
          action: 'register',
          resourceType: 'user',
          resourceId: user.id,
        },
      });

      return {
        token,
        refreshToken,
        user,
      };
    },

    login: async (_parent: any, args: { email: string; password: string }) => {
      const { email, password } = args;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);

      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const token = generateToken({ userId: user.id, email: user.email });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

      // Log access
      await prisma.accessLog.create({
        data: {
          userId: user.id,
          action: 'login',
          resourceType: 'user',
          resourceId: user.id,
        },
      });

      return {
        token,
        refreshToken,
        user,
      };
    },

    refreshToken: async (_parent: any, args: { refreshToken: string }) => {
      const { refreshToken } = args;

      try {
        // Verify refresh token
        const payload = verifyRefreshToken(refreshToken);

        // Fetch user
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            profile: true,
          },
        });

        if (!user) {
          throw new Error('User not found');
        }

        // Generate new tokens
        const newToken = generateToken({ userId: user.id, email: user.email });
        const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

        return {
          token: newToken,
          refreshToken: newRefreshToken,
          user,
        };
      } catch (error) {
        throw new Error('Invalid or expired refresh token');
      }
    },

    // Profile mutations
    ...profileResolvers.Mutation,

    // Activity mutations
    ...activityResolvers.Mutation,

    // Essay mutations
    ...essayResolvers.Mutation,

    // Application mutations
    ...applicationResolvers.Mutation,
  },

  User: {
    profile: async (parent: any) => {
      if (parent.profile) {
        return parent.profile;
      }

      return prisma.userProfile.findUnique({
        where: { userId: parent.id },
      });
    },
  },

  UserProfile: {
    ...profileResolvers.UserProfile,
  },

  // Custom scalar for JSON
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value) {
      return value;
    },
    parseValue(value) {
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.OBJECT) {
        return ast;
      }
      return null;
    },
  }),

  // Custom scalar for Date - serialize as ISO string
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    serialize(value: any) {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    },
    parseValue(value: any) {
      // Parse incoming strings to Date objects
      if (typeof value === 'string') {
        return new Date(value);
      }
      return value;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};
