// Integration tests for GraphQL resolvers

import { resolvers } from '../../src/resolvers';
import { prisma } from '../../src/utils/prisma';

describe('GraphQL Resolvers Integration', () => {
  const mockContext = {
    userId: 'test-user-id',
    req: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Resolvers', () => {
    describe('register', () => {
      it('should create a new user with profile', async () => {
        const mockUser = {
          id: 'new-user-id',
          email: 'newuser@example.com',
          passwordHash: 'hashed-password',
          profile: { id: 'profile-id' },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
        (prisma.accessLog.create as jest.Mock).mockResolvedValue({});

        const result = await resolvers.Mutation.register(
          {},
          { email: 'newuser@example.com', password: 'StrongPass123!' },
          {} as any
        );

        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('refreshToken');
        expect(result).toHaveProperty('user');
        expect(prisma.user.create).toHaveBeenCalled();
      });

      it('should reject duplicate email registration', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
          id: 'existing-user',
          email: 'existing@example.com',
        });

        await expect(
          resolvers.Mutation.register(
            {},
            { email: 'existing@example.com', password: 'StrongPass123!' },
            {} as any
          )
        ).rejects.toThrow('User with this email already exists');
      });

      it('should reject invalid email format', async () => {
        await expect(
          resolvers.Mutation.register(
            {},
            { email: 'invalid-email', password: 'StrongPass123!' },
            {} as any
          )
        ).rejects.toThrow('Invalid email address');
      });

      it('should reject weak password', async () => {
        await expect(
          resolvers.Mutation.register(
            {},
            { email: 'test@example.com', password: 'weak' },
            {} as any
          )
        ).rejects.toThrow();
      });
    });

    describe('login', () => {
      it('should successfully login with correct credentials', async () => {
        const mockUser = {
          id: 'user-id',
          email: 'user@example.com',
          passwordHash: await require('../../src/utils/auth').hashPassword('Password123!'),
          profile: {},
        };

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
        (prisma.accessLog.create as jest.Mock).mockResolvedValue({});

        const result = await resolvers.Mutation.login(
          {},
          { email: 'user@example.com', password: 'Password123!' },
          {} as any
        );

        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('refreshToken');
        expect(result.user.email).toBe('user@example.com');
      });

      it('should reject invalid credentials', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(
          resolvers.Mutation.login(
            {},
            { email: 'nonexistent@example.com', password: 'Password123!' },
            {} as any
          )
        ).rejects.toThrow('Invalid email or password');
      });
    });
  });

  describe('Profile Resolvers', () => {
    describe('updateProfile', () => {
      it('should update user profile and recalculate strength', async () => {
        const mockProfile = {
          id: 'profile-id',
          userId: 'test-user-id',
          firstName: 'Jane',
          lastName: 'Doe',
          gpa: 3.8,
          profileStrengthScore: 45,
        };

        (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
        (prisma.activity.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.userProfile.update as jest.Mock).mockResolvedValue({
          ...mockProfile,
          major: 'Computer Science',
          profileStrengthScore: 50,
        });
        (prisma.accessLog.create as jest.Mock).mockResolvedValue({});

        const result = await resolvers.Mutation.updateProfile(
          {},
          { input: { major: 'Computer Science' } },
          mockContext
        );

        expect(result.major).toBe('Computer Science');
        expect(prisma.userProfile.update).toHaveBeenCalled();
      });

      it('should require authentication', async () => {
        await expect(
          resolvers.Mutation.updateProfile({}, { input: {} }, { userId: null } as any)
        ).rejects.toThrow('Not authenticated');
      });
    });

    describe('myProfile', () => {
      it('should return authenticated user profile', async () => {
        const mockProfile = {
          id: 'profile-id',
          userId: 'test-user-id',
          firstName: 'Jane',
          profileStrengthScore: 75,
          activities: [],
        };

        (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
        (prisma.accessLog.create as jest.Mock).mockResolvedValue({});

        const result = await resolvers.Query.myProfile({}, {}, mockContext);

        expect(result.userId).toBe('test-user-id');
        expect(result.firstName).toBe('Jane');
      });

      it('should require authentication', async () => {
        await expect(
          resolvers.Query.myProfile({}, {}, { userId: null } as any)
        ).rejects.toThrow('Not authenticated');
      });
    });
  });

  describe('Application Resolvers', () => {
    describe('createApplication', () => {
      it('should create new application', async () => {
        const mockScholarship = {
          id: 'scholarship-id',
          title: 'Test Scholarship',
          amount: 5000,
          deadline: new Date(),
        };

        const mockApplication = {
          id: 'app-id',
          userId: 'test-user-id',
          scholarshipId: 'scholarship-id',
          status: 'DRAFT',
          progressPercentage: 0,
          scholarship: mockScholarship,
        };

        (prisma.scholarship.findUnique as jest.Mock).mockResolvedValue(mockScholarship);
        (prisma.application.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.application.create as jest.Mock).mockResolvedValue(mockApplication);
        (prisma.accessLog.create as jest.Mock).mockResolvedValue({});

        const result = await resolvers.Mutation.createApplication(
          {},
          { scholarshipId: 'scholarship-id' },
          mockContext
        );

        expect(result.status).toBe('DRAFT');
        expect(result.scholarshipId).toBe('scholarship-id');
      });

      it('should prevent duplicate applications', async () => {
        const mockScholarship = {
          id: 'scholarship-id',
          title: 'Test Scholarship',
        };

        (prisma.scholarship.findUnique as jest.Mock).mockResolvedValue(mockScholarship);
        (prisma.application.findFirst as jest.Mock).mockResolvedValue({
          id: 'existing-app',
        });

        await expect(
          resolvers.Mutation.createApplication(
            {},
            { scholarshipId: 'scholarship-id' },
            mockContext
          )
        ).rejects.toThrow('Application already exists for this scholarship');
      });
    });

    describe('myApplications', () => {
      it('should return user applications', async () => {
        const mockApplications = [
          {
            id: 'app-1',
            status: 'IN_PROGRESS',
            scholarship: { title: 'Scholarship 1' },
          },
          {
            id: 'app-2',
            status: 'SUBMITTED',
            scholarship: { title: 'Scholarship 2' },
          },
        ];

        (prisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);
        (prisma.accessLog.create as jest.Mock).mockResolvedValue({});

        const result = await resolvers.Query.myApplications({}, {}, mockContext);

        expect(result).toHaveLength(2);
        expect(result[0].status).toBe('IN_PROGRESS');
      });

      it('should filter by status', async () => {
        const mockApplications = [
          {
            id: 'app-1',
            status: 'SUBMITTED',
          },
        ];

        (prisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);
        (prisma.accessLog.create as jest.Mock).mockResolvedValue({});

        await resolvers.Query.myApplications(
          {},
          { status: 'SUBMITTED' },
          mockContext
        );

        expect(prisma.application.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status: 'SUBMITTED',
            }),
          })
        );
      });
    });
  });

  describe('Analytics Resolvers', () => {
    describe('applicationStats', () => {
      it('should calculate application statistics', async () => {
        const mockApplications = [
          { status: 'DRAFT', scholarship: { amount: 5000 } },
          { status: 'IN_PROGRESS', scholarship: { amount: 7000 } },
          { status: 'SUBMITTED', scholarship: { amount: 10000 } },
          {
            status: 'ACCEPTED',
            scholarship: { amount: 5000 },
            amountAwarded: 5000,
          },
        ];

        (prisma.application.findMany as jest.Mock).mockResolvedValue(mockApplications);

        const result = await resolvers.Query.applicationStats({}, {}, mockContext);

        expect(result.total).toBe(4);
        expect(result.draft).toBe(1);
        expect(result.inProgress).toBe(1);
        expect(result.submitted).toBe(1);
        expect(result.accepted).toBe(1);
        expect(result.totalAmountWon).toBe(5000);
      });
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent unauthorized access to protected queries', async () => {
      const unauthedContext = { userId: null } as any;

      await expect(
        resolvers.Query.myProfile({}, {}, unauthedContext)
      ).rejects.toThrow('Not authenticated');

      await expect(
        resolvers.Query.myApplications({}, {}, unauthedContext)
      ).rejects.toThrow('Not authenticated');

      await expect(
        resolvers.Query.myActivities({}, {}, unauthedContext)
      ).rejects.toThrow('Not authenticated');
    });

    it('should prevent unauthorized access to protected mutations', async () => {
      const unauthedContext = { userId: null } as any;

      await expect(
        resolvers.Mutation.updateProfile({}, { input: {} }, unauthedContext)
      ).rejects.toThrow('Not authenticated');

      await expect(
        resolvers.Mutation.createApplication({}, { scholarshipId: 'test' }, unauthedContext)
      ).rejects.toThrow('Not authenticated');

      await expect(
        resolvers.Mutation.createActivity({}, { input: {} as any }, unauthedContext)
      ).rejects.toThrow('Not authenticated');
    });
  });
});
