# Scholarship Matching System

## Overview

The ScholarSync scholarship matching system uses a sophisticated algorithm to rank scholarships based on user profile compatibility. The system considers multiple factors to provide personalized scholarship recommendations.

## Matching Algorithm

### Factors Considered

The matching algorithm evaluates six key factors:

1. **GPA Match (20% weight)**
   - Compares user's GPA against scholarship minimum requirement
   - Full credit if user meets or exceeds requirement
   - Partial credit based on proximity if below requirement

2. **Major Match (25% weight)**
   - Checks if user's major aligns with scholarship focus areas
   - Highest weight factor as major alignment is crucial
   - Uses fuzzy matching for related fields

3. **Academic Standing Match (15% weight)**
   - Verifies user's academic level (High School Senior, Undergraduate, Graduate)
   - Binary match - either eligible or not

4. **Deadline Proximity (15% weight)**
   - Prioritizes scholarships with upcoming deadlines
   - Optimal range: 7-30 days away
   - Penalizes deadlines that are too close (< 7 days) or too far (> 90 days)

5. **Profile Strength (10% weight)**
   - Uses overall profile completion percentage
   - Encourages users to complete their profiles
   - Higher profile strength improves all matches

6. **Activity Match (15% weight)**
   - Compares user's extracurricular activities with scholarship tags
   - Rewards relevant experience (community service, leadership, etc.)

### Score Calculation

```
Final Score (0-100) =
  (GPA Match × 20) +
  (Major Match × 25) +
  (Academic Standing × 15) +
  (Deadline Proximity × 15) +
  (Profile Strength × 10) +
  (Activity Match × 15)
```

### Eligibility Status

- **Eligible**: User meets all requirements
- **Partial**: User meets some but not all requirements
- **Ineligible**: User fails to meet critical requirements

## Database Seeding

### Seed Data

The system includes 12 sample scholarships covering various categories:

- General scholarships (Future Leaders)
- STEM fields (STEM Excellence, Women in Tech)
- Community service
- First-generation students
- Business and entrepreneurship
- Arts and creativity
- Healthcare
- Environmental sustainability
- Military families
- Journalism and media
- Education

Each scholarship includes:
- Title and organization
- Award amount
- Deadline
- Description
- Detailed eligibility requirements
- Application URL
- Tags for categorization
- Essay prompts with word limits

### Running the Seed Script

**Prerequisites:**
1. PostgreSQL database running (Supabase or local)
2. DATABASE_URL set in `.env` file
3. Prisma migrations applied

**Commands:**

```bash
# Run Prisma migrations (if not already done)
npm run migrate

# Generate Prisma client
npm run prisma:generate

# Run seed script
npm run seed
```

The seed script will:
1. Load scholarship data from `prisma/seed-data/scholarships.json`
2. Create scholarship records in the database
3. Generate sample match scores (if users exist)
4. Display summary of results

### Seed Output Example

```
🌱 Starting database seed...

📚 Found 12 scholarships to seed

✓ Created: Future Leaders Scholarship
✓ Created: STEM Excellence Award
✓ Created: Community Service Champion
...

📊 Seed Summary:
   ✓ Success: 12
   ✗ Errors: 0
   📚 Total: 12

🎉 Database seed completed!
```

## GraphQL API

### Queries

#### Get All Scholarships

```graphql
query {
  scholarships(limit: 20, offset: 0, tags: ["STEM", "Technology"]) {
    id
    title
    organization
    amount
    deadline
    description
    tags
    eligibilityRequirements
    applicationUrl
    essayPrompts {
      prompt
      wordLimit
      required
    }
  }
}
```

#### Get Matched Scholarships

```graphql
query {
  matchedScholarships(limit: 10, minScore: 60) {
    scholarship {
      id
      title
      organization
      amount
      deadline
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
```

**Response:**
```json
{
  "data": {
    "matchedScholarships": [
      {
        "scholarship": {
          "id": "clx...",
          "title": "STEM Excellence Award",
          "organization": "Technology Innovation Council",
          "amount": 10000,
          "deadline": "2026-07-15T23:59:59Z"
        },
        "matchScore": 92,
        "eligibilityStatus": "eligible",
        "missingRequirements": [],
        "matchFactors": {
          "gpaMatch": 1.0,
          "majorMatch": 1.0,
          "deadlineProximity": 0.8,
          "profileStrength": 0.85,
          "activityMatch": 0.9,
          "academicStandingMatch": 1.0
        }
      }
    ]
  }
}
```

#### Get Single Scholarship Match

```graphql
query {
  scholarshipMatch(scholarshipId: "clx...") {
    scholarship {
      title
      amount
    }
    matchScore
    eligibilityStatus
    missingRequirements
  }
}
```

#### Search Scholarships

```graphql
query {
  searchScholarships(query: "engineering", limit: 10) {
    id
    title
    organization
    amount
    deadline
  }
}
```

#### Get Available Tags

```graphql
query {
  scholarshipTags
}
```

Returns: `["STEM", "Technology", "Leadership", "Community Service", ...]`

## Matching Logic Implementation

### File: `src/utils/matching.ts`

Key functions:

```typescript
// Calculate match score for single scholarship
calculateMatchScore(profile, scholarship): {
  score: number,
  factors: MatchFactors,
  eligibilityStatus: string,
  missingRequirements: string[]
}

// Rank all scholarships for a user
rankScholarships(profile, scholarships): ScholarshipMatch[]

// Filter by eligibility
filterEligibleScholarships(matches, includePartial): ScholarshipMatch[]

// Get top N matches
getTopMatches(profile, scholarships, limit): ScholarshipMatch[]
```

### Resolver: `src/resolvers/scholarship.ts`

Implements GraphQL queries:
- `scholarships` - List all active scholarships
- `scholarship` - Get single scholarship by ID
- `matchedScholarships` - Get personalized matches
- `scholarshipMatch` - Get match for specific scholarship
- `searchScholarships` - Search by keyword
- `scholarshipTags` - Get available filter tags

## Match Score Caching

Match scores are cached in the `MatchScore` table for performance:

```prisma
model MatchScore {
  id              String   @id @default(cuid())
  userId          String
  scholarshipId   String
  score           Int
  factors         Json
  lastCalculated  DateTime

  user         User        @relation(...)
  scholarship  Scholarship @relation(...)

  @@unique([userId, scholarshipId])
}
```

Benefits:
- Faster repeated queries
- Analytics tracking
- Historical match data
- Score trending over time

## Customization

### Adding New Scholarships

Edit `prisma/seed-data/scholarships.json`:

```json
{
  "title": "Your Scholarship Name",
  "organization": "Organization Name",
  "amount": 5000,
  "deadline": "2026-12-31T23:59:59Z",
  "description": "...",
  "eligibilityRequirements": {
    "minGPA": 3.0,
    "academicStanding": ["Undergraduate"],
    "majors": ["Computer Science"],
    "states": ["CA", "NY"],
    "citizenshipRequired": true,
    "essayRequired": true,
    "recommendationsRequired": 2
  },
  "applicationUrl": "https://...",
  "tags": ["Technology", "STEM"],
  "essayPrompts": [
    {
      "prompt": "Essay question...",
      "wordLimit": 500,
      "required": true
    }
  ]
}
```

Then run: `npm run seed`

### Adjusting Weights

Edit `src/utils/matching.ts` to change factor weights:

```typescript
const weights = {
  gpaMatch: 0.20,           // GPA importance
  majorMatch: 0.25,          // Major alignment
  deadlineProximity: 0.15,   // Timing
  profileStrength: 0.10,     // Profile completion
  activityMatch: 0.15,       // Activities/experience
  academicStandingMatch: 0.15, // Academic level
};
```

Weights must sum to 1.0 for accurate scoring.

### Deadline Proximity Scoring

Adjust deadline scoring ranges in `src/utils/matching.ts`:

```typescript
if (daysUntilDeadline < 7) {
  factors.deadlineProximity = 0.3; // Too urgent
} else if (daysUntilDeadline <= 30) {
  factors.deadlineProximity = 1.0; // Optimal
} else if (daysUntilDeadline <= 60) {
  factors.deadlineProximity = 0.8; // Good
}
// etc...
```

## Testing

### Manual Testing

1. Create a test user and complete profile:
   ```graphql
   mutation {
     register(email: "test@example.com", password: "SecurePass123!")
   }

   mutation {
     updateProfile(input: {
       firstName: "Jane"
       lastName: "Doe"
       gpa: 3.8
       major: "Computer Science"
       academicStanding: "Undergraduate"
     })
   }
   ```

2. Run seed script: `npm run seed`

3. Query matched scholarships:
   ```graphql
   query {
     matchedScholarships(limit: 5, minScore: 70) {
       scholarship { title }
       matchScore
       eligibilityStatus
     }
   }
   ```

4. Verify scores make sense based on profile

### Expected Results

For a Computer Science student with 3.8 GPA:
- STEM Excellence Award: 90-95 (perfect match)
- Women in Tech: 85-90 (if female)
- Future Leaders: 75-80 (general scholarship)
- Healthcare Heroes: 30-40 (wrong major)

## Performance Considerations

- Match calculation is O(n) for n scholarships
- Results are cached in database
- Implement pagination for large result sets
- Consider background job for bulk recalculation
- Index on `deadline`, `isActive`, `tags` fields

## Future Enhancements

1. **Machine Learning**: Learn from user application outcomes
2. **Collaborative Filtering**: "Students like you applied to..."
3. **Application Tracking Integration**: Boost undefeated scholarships
4. **Geographic Matching**: State/region requirements
5. **Financial Need Scoring**: Income-based matching
6. **Recommendation Quality**: Factor in win rates
7. **Real-time Updates**: WebSocket notifications for new matches
8. **A/B Testing**: Optimize weight configurations

## Troubleshooting

### Seed Script Fails

**Error**: "Database connection failed"
- Check DATABASE_URL in .env
- Verify database is running
- Run `npm run migrate` first

**Error**: "Duplicate key violation"
- Database already seeded
- Clear scholarships first or use `upsert`

### Low Match Scores

- Check profile completion percentage
- Verify GPA, major, academic standing are set
- Add activities to profile
- Consider adjusting matching weights

### No Matches Returned

- Profile strength may be too low (< 40%)
- All deadlines may have passed
- Try lowering minScore parameter
- Check eligibilityStatus in response
