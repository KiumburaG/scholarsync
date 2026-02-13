export const typeDefs = `#graphql
  # User Authentication
  type User {
    id: ID!
    email: String!
    createdAt: String!
    updatedAt: String!
    emailVerified: Boolean!
    profileCompleted: Boolean!
    profile: UserProfile
  }

  type UserProfile {
    id: ID!
    userId: ID!
    firstName: String
    lastName: String
    phone: String
    dateOfBirth: String
    streetAddress: String
    city: String
    state: String
    zip: String
    country: String
    currentSchool: String
    expectedGraduation: String
    major: String
    minor: String
    gpa: Float
    academicStanding: String
    citizenship: String
    ethnicity: String
    gender: String
    firstGeneration: Boolean
    background: String
    challenges: String
    academicJourney: String
    careerGoals: String
    whyEducation: String
    personalValues: String
    profileStrength: Int
    createdAt: String!
    updatedAt: String!
    activities: [Activity!]!
  }

  type Activity {
    id: ID!
    userId: ID!
    type: String!
    organization: String
    role: String
    description: String
    startDate: String
    endDate: String
    isCurrent: Boolean!
    hoursPerWeek: Int
    achievements: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  # Essay Types
  type Essay {
    id: ID!
    applicationId: ID
    promptText: String!
    wordLimit: Int
    generatedEssay: String
    finalEssay: String
    generationMethod: String
    variantsGenerated: Int
    selectedVariant: Int
    qualityScore: Int
    wordCount: Int
    userRating: Int
    createdAt: String!
    updatedAt: String!
  }

  type EssayVariant {
    variant: Int!
    essay: String!
    wordCount: Int!
  }

  type EssayGenerationResponse {
    essay: String!
    wordCount: Int!
    variants: [EssayVariant!]
  }

  type OutlineResponse {
    outline: String!
  }

  # Scholarship Types
  type Scholarship {
    id: ID!
    title: String!
    organization: String!
    amount: Float!
    deadline: String!
    description: String!
    eligibilityRequirements: JSON!
    applicationUrl: String!
    tags: [String!]!
    essayPrompts: [EssayPrompt!]!
    isActive: Boolean!
    source: String
    createdAt: String!
    updatedAt: String!
  }

  type EssayPrompt {
    prompt: String!
    wordLimit: Int
    required: Boolean!
  }

  type MatchFactors {
    gpaMatch: Float!
    majorMatch: Float!
    deadlineProximity: Float!
    profileStrength: Float!
    activityMatch: Float!
    academicStandingMatch: Float!
  }

  type ScholarshipMatch {
    scholarship: Scholarship!
    matchScore: Int!
    matchFactors: MatchFactors!
    eligibilityStatus: String!
    missingRequirements: [String!]!
  }

  scalar JSON

  # Application Types
  type Application {
    id: ID!
    userId: ID!
    scholarshipId: ID!
    scholarship: Scholarship
    status: String!
    deadline: String
    submittedAt: String
    notes: String
    progressPercentage: Int!
    amountAwarded: Float
    outcomeNotificationDate: String
    createdAt: String!
    updatedAt: String!
    essays: [Essay!]!
    documents: [Document!]!
  }

  type Document {
    id: ID!
    userId: ID!
    applicationId: ID
    name: String!
    type: String!
    url: String!
    uploadedAt: String!
  }

  type ApplicationStats {
    total: Int!
    draft: Int!
    inProgress: Int!
    submitted: Int!
    accepted: Int!
    rejected: Int!
    pending: Int!
    totalAmountApplied: Float!
    totalAmountWon: Float!
    upcomingDeadlines: Int!
  }

  # Analytics Types
  type TimelineData {
    month: String!
    started: Int!
    submitted: Int!
    accepted: Int!
    rejected: Int!
    totalAmount: Float!
    wonAmount: Float!
  }

  type CategoryBreakdown {
    category: String!
    total: Int!
    accepted: Int!
    rejected: Int!
    wonAmount: Float!
    successRate: Float!
  }

  type SuccessAnalytics {
    totalApplications: Int!
    submitted: Int!
    accepted: Int!
    rejected: Int!
    pending: Int!
    successRate: Float!
    completionRate: Float!
    avgTimeToSubmit: Float!
    categoryBreakdown: [CategoryBreakdown!]!
  }

  type ActivityAnalytics {
    totalApplications: Int!
    totalEssays: Int!
    recentApplications: Int!
    recentEssays: Int!
    mostActiveDay: String!
    mostActiveDayCount: Int!
    currentStreak: Int!
    longestStreak: Int!
    lastActivityDate: String
  }

  type DeadlineItem {
    applicationId: ID!
    scholarshipTitle: String!
    deadline: String!
    daysRemaining: Int!
    progressPercentage: Int!
    status: String!
  }

  type MonthlyFinancial {
    month: String!
    amount: Float!
    count: Int!
  }

  type FinancialSummary {
    totalAppliedFor: Float!
    totalWon: Float!
    pending: Float!
    averageAwardWon: Float!
    numberOfWins: Int!
    monthlyBreakdown: [MonthlyFinancial!]!
  }

  # Input Types
  input UpdateProfileInput {
    firstName: String
    lastName: String
    phone: String
    dateOfBirth: String
    streetAddress: String
    city: String
    state: String
    zip: String
    country: String
    currentSchool: String
    schoolType: String
    expectedGraduation: String
    major: String
    minor: String
    gpa: Float
    academicStanding: String
    citizenship: String
    ethnicity: String
    gender: String
    firstGeneration: Boolean
    militaryStatus: String
    financialNeedIndicator: String
    background: String
    challenges: String
    academicJourney: String
    careerGoals: String
    whyEducation: String
    personalValues: String
  }

  input CreateActivityInput {
    type: String!
    organization: String
    role: String
    description: String
    startDate: String
    endDate: String
    isCurrent: Boolean
    hoursPerWeek: Int
    totalHours: Int
    achievements: [String!]
  }

  input UpdateActivityInput {
    type: String
    organization: String
    role: String
    description: String
    startDate: String
    endDate: String
    isCurrent: Boolean
    hoursPerWeek: Int
    totalHours: Int
    achievements: [String!]
  }

  input GenerateEssayInput {
    prompt: String!
    wordLimit: Int
    scholarshipMission: String
    essayType: String
    generationMethod: String
  }

  input UpdateApplicationInput {
    status: String
    deadline: String
    submittedAt: String
    notes: String
    progressPercentage: Int
    amountAwarded: Float
    outcomeNotificationDate: String
  }

  input AddDocumentInput {
    name: String!
    type: String!
    url: String!
  }

  # Queries
  type Query {
    me: User
    myProfile: UserProfile
    myActivities: [Activity!]!
    activity(id: ID!): Activity
    health: String!

    # Scholarship Queries
    scholarships(limit: Int, offset: Int, tags: [String!]): [Scholarship!]!
    scholarship(id: ID!): Scholarship
    matchedScholarships(limit: Int, minScore: Int): [ScholarshipMatch!]!
    scholarshipMatch(scholarshipId: ID!): ScholarshipMatch!
    searchScholarships(query: String!, limit: Int): [Scholarship!]!
    scholarshipTags: [String!]!

    # Application Queries
    myApplications(status: String, limit: Int): [Application!]!
    application(id: ID!): Application
    applicationStats: ApplicationStats!

    # Analytics Queries
    applicationTimeline(months: Int): [TimelineData!]!
    successAnalytics: SuccessAnalytics!
    activityAnalytics: ActivityAnalytics!
    upcomingDeadlines(days: Int): [DeadlineItem!]!
    financialSummary: FinancialSummary!
  }

  # Mutations
  type Mutation {
    # Authentication
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!

    # Profile Management
    updateProfile(input: UpdateProfileInput!): UserProfile!

    # Activity Management
    createActivity(input: CreateActivityInput!): Activity!
    updateActivity(id: ID!, input: UpdateActivityInput!): Activity!
    deleteActivity(id: ID!): Boolean!

    # Essay Generation
    generateEssay(input: GenerateEssayInput!): EssayGenerationResponse!
    generateMultipleVariants(input: GenerateEssayInput!, count: Int): EssayGenerationResponse!
    generateOutline(input: GenerateEssayInput!): OutlineResponse!
    refineEssay(essayId: ID!, feedback: String!): Essay!

    # Application Management
    createApplication(scholarshipId: ID!): Application!
    updateApplication(id: ID!, input: UpdateApplicationInput!): Application!
    deleteApplication(id: ID!): Boolean!
    linkEssayToApplication(applicationId: ID!, essayId: ID!): Essay!
    addApplicationDocument(applicationId: ID!, input: AddDocumentInput!): Document!
    updateApplicationProgress(id: ID!, percentage: Int!): Application!
  }
`;
