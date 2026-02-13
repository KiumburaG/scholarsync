import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        email
        emailVerified
        profileCompleted
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      refreshToken
      user {
        id
        email
        emailVerified
        profileCompleted
      }
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
      user {
        id
        email
        emailVerified
        profileCompleted
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      firstName
      lastName
      phone
      dateOfBirth
      streetAddress
      city
      state
      zip
      country
      currentSchool
      expectedGraduation
      major
      minor
      gpa
      academicStanding
      citizenship
      ethnicity
      gender
      firstGeneration
      background
      challenges
      academicJourney
      careerGoals
      whyEducation
      personalValues
      profileStrength
      updatedAt
    }
  }
`;

export const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      id
      type
      organization
      role
      description
      startDate
      endDate
      isCurrent
      hoursPerWeek
      achievements
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_ACTIVITY_MUTATION = gql`
  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      id
      type
      organization
      role
      description
      startDate
      endDate
      isCurrent
      hoursPerWeek
      totalHours
      achievements
      updatedAt
    }
  }
`;

export const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

export const GENERATE_ESSAY_MUTATION = gql`
  mutation GenerateEssay($input: GenerateEssayInput!) {
    generateEssay(input: $input) {
      essay
      wordCount
      variants {
        variant
        essay
        wordCount
      }
    }
  }
`;

export const GENERATE_MULTIPLE_VARIANTS_MUTATION = gql`
  mutation GenerateMultipleVariants($input: GenerateEssayInput!, $count: Int) {
    generateMultipleVariants(input: $input, count: $count) {
      essay
      wordCount
      variants {
        variant
        essay
        wordCount
      }
    }
  }
`;

export const GENERATE_OUTLINE_MUTATION = gql`
  mutation GenerateOutline($input: GenerateEssayInput!) {
    generateOutline(input: $input) {
      outline
    }
  }
`;

export const REFINE_ESSAY_MUTATION = gql`
  mutation RefineEssay($essayId: ID!, $feedback: String!) {
    refineEssay(essayId: $essayId, feedback: $feedback) {
      id
      generatedEssay
      finalEssay
      wordCount
      updatedAt
    }
  }
`;

// Application mutations
export const CREATE_APPLICATION_MUTATION = gql`
  mutation CreateApplication($scholarshipId: ID!) {
    createApplication(scholarshipId: $scholarshipId) {
      id
      scholarshipId
      status
      deadline
      progressPercentage
      createdAt
      scholarship {
        id
        title
        organization
        amount
      }
    }
  }
`;

export const UPDATE_APPLICATION_MUTATION = gql`
  mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
    updateApplication(id: $id, input: $input) {
      id
      status
      deadline
      submittedAt
      notes
      progressPercentage
      amountAwarded
      outcomeNotificationDate
      updatedAt
    }
  }
`;

export const DELETE_APPLICATION_MUTATION = gql`
  mutation DeleteApplication($id: ID!) {
    deleteApplication(id: $id)
  }
`;

export const UPDATE_APPLICATION_PROGRESS_MUTATION = gql`
  mutation UpdateApplicationProgress($id: ID!, $percentage: Int!) {
    updateApplicationProgress(id: $id, percentage: $percentage) {
      id
      progressPercentage
      status
    }
  }
`;

export const LINK_ESSAY_TO_APPLICATION_MUTATION = gql`
  mutation LinkEssayToApplication($applicationId: ID!, $essayId: ID!) {
    linkEssayToApplication(applicationId: $applicationId, essayId: $essayId) {
      id
      applicationId
    }
  }
`;

export const ADD_APPLICATION_DOCUMENT_MUTATION = gql`
  mutation AddApplicationDocument($applicationId: ID!, $input: AddDocumentInput!) {
    addApplicationDocument(applicationId: $applicationId, input: $input) {
      id
      name
      type
      url
      uploadedAt
    }
  }
`;
