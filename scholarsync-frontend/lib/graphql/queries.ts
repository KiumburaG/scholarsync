import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      emailVerified
      profileCompleted
      profile {
        id
        firstName
        lastName
        profileStrengthScore
      }
    }
  }
`;

export const MY_PROFILE_QUERY = gql`
  query MyProfile {
    myProfile {
      id
      userId
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
      schoolType
      expectedGraduation
      major
      minor
      gpa
      academicStanding
      citizenship
      ethnicity
      gender
      firstGeneration
      militaryStatus
      financialNeedIndicator
      background
      challenges
      academicJourney
      careerGoals
      whyEducation
      personalValues
      profileStrengthScore
      createdAt
      updatedAt
      activities {
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
      }
    }
  }
`;

export const MY_ACTIVITIES_QUERY = gql`
  query MyActivities {
    myActivities {
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
      createdAt
      updatedAt
    }
  }
`;

export const ACTIVITY_QUERY = gql`
  query Activity($id: ID!) {
    activity(id: $id) {
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
      createdAt
      updatedAt
    }
  }
`;

export const HEALTH_QUERY = gql`
  query Health {
    health
  }
`;

// Scholarship queries
export const SCHOLARSHIPS_QUERY = gql`
  query Scholarships($limit: Int, $offset: Int, $tags: [String!]) {
    scholarships(limit: $limit, offset: $offset, tags: $tags) {
      id
      title
      organization
      amount
      deadline
      description
      eligibilityRequirements
      applicationUrl
      tags
      isActive
      source
      createdAt
      essayPrompts {
        prompt
        wordLimit
        required
      }
    }
  }
`;

export const SCHOLARSHIP_QUERY = gql`
  query Scholarship($id: ID!) {
    scholarship(id: $id) {
      id
      title
      organization
      amount
      deadline
      description
      eligibilityRequirements
      applicationUrl
      tags
      isActive
      source
      createdAt
      updatedAt
      essayPrompts {
        prompt
        wordLimit
        required
      }
    }
  }
`;

export const MATCHED_SCHOLARSHIPS_QUERY = gql`
  query MatchedScholarships($limit: Int, $minScore: Int) {
    matchedScholarships(limit: $limit, minScore: $minScore) {
      scholarship {
        id
        title
        organization
        amount
        deadline
        description
        applicationUrl
        tags
        essayPrompts {
          prompt
          wordLimit
          required
        }
      }
      matchScore
      eligibilityStatus
      missingRequirements
      matchFactors {
        gpaMatch
        majorMatch
        deadlineProximity
        profileStrength
        activityMatch
        academicStandingMatch
      }
    }
  }
`;

export const SCHOLARSHIP_MATCH_QUERY = gql`
  query ScholarshipMatch($scholarshipId: ID!) {
    scholarshipMatch(scholarshipId: $scholarshipId) {
      scholarship {
        id
        title
        organization
        amount
        deadline
        description
        applicationUrl
        tags
        essayPrompts {
          prompt
          wordLimit
          required
        }
      }
      matchScore
      eligibilityStatus
      missingRequirements
      matchFactors {
        gpaMatch
        majorMatch
        deadlineProximity
        profileStrength
        activityMatch
        academicStandingMatch
      }
    }
  }
`;

export const SEARCH_SCHOLARSHIPS_QUERY = gql`
  query SearchScholarships($query: String!, $limit: Int) {
    searchScholarships(query: $query, limit: $limit) {
      id
      title
      organization
      amount
      deadline
      description
      applicationUrl
      tags
      essayPrompts {
        prompt
        wordLimit
        required
      }
    }
  }
`;

export const SCHOLARSHIP_TAGS_QUERY = gql`
  query ScholarshipTags {
    scholarshipTags
  }
`;

// Application queries
export const MY_APPLICATIONS_QUERY = gql`
  query MyApplications($status: String, $limit: Int) {
    myApplications(status: $status, limit: $limit) {
      id
      userId
      scholarshipId
      status
      deadline
      submittedAt
      notes
      progressPercentage
      amountAwarded
      outcomeNotificationDate
      createdAt
      updatedAt
      scholarship {
        id
        title
        organization
        amount
        applicationUrl
        tags
      }
      essays {
        id
        promptText
        wordCount
      }
    }
  }
`;

export const APPLICATION_QUERY = gql`
  query Application($id: ID!) {
    application(id: $id) {
      id
      userId
      scholarshipId
      status
      deadline
      submittedAt
      notes
      progressPercentage
      amountAwarded
      outcomeNotificationDate
      createdAt
      updatedAt
      scholarship {
        id
        title
        organization
        amount
        deadline
        description
        applicationUrl
        tags
        essayPrompts {
          prompt
          wordLimit
          required
        }
      }
      essays {
        id
        promptText
        generatedEssay
        finalEssay
        wordCount
        createdAt
      }
      documents {
        id
        name
        type
        url
        uploadedAt
      }
    }
  }
`;

export const APPLICATION_STATS_QUERY = gql`
  query ApplicationStats {
    applicationStats {
      total
      draft
      inProgress
      submitted
      accepted
      rejected
      pending
      totalAmountApplied
      totalAmountWon
      upcomingDeadlines
    }
  }
`;

// Analytics queries
export const APPLICATION_TIMELINE_QUERY = gql`
  query ApplicationTimeline($months: Int) {
    applicationTimeline(months: $months) {
      month
      started
      submitted
      accepted
      rejected
      totalAmount
      wonAmount
    }
  }
`;

export const SUCCESS_ANALYTICS_QUERY = gql`
  query SuccessAnalytics {
    successAnalytics {
      totalApplications
      submitted
      accepted
      rejected
      pending
      successRate
      completionRate
      avgTimeToSubmit
      categoryBreakdown {
        category
        total
        accepted
        rejected
        wonAmount
        successRate
      }
    }
  }
`;

export const ACTIVITY_ANALYTICS_QUERY = gql`
  query ActivityAnalytics {
    activityAnalytics {
      totalApplications
      totalEssays
      recentApplications
      recentEssays
      mostActiveDay
      mostActiveDayCount
      currentStreak
      longestStreak
      lastActivityDate
    }
  }
`;

export const UPCOMING_DEADLINES_QUERY = gql`
  query UpcomingDeadlines($days: Int) {
    upcomingDeadlines(days: $days) {
      applicationId
      scholarshipTitle
      deadline
      daysRemaining
      progressPercentage
      status
    }
  }
`;

export const FINANCIAL_SUMMARY_QUERY = gql`
  query FinancialSummary {
    financialSummary {
      totalAppliedFor
      totalWon
      pending
      averageAwardWon
      numberOfWins
      monthlyBreakdown {
        month
        amount
        count
      }
    }
  }
`;
