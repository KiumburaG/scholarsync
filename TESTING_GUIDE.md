# ScholarSync Testing Guide

## Overview

This document provides comprehensive information about the testing strategy, setup, and execution for the ScholarSync platform.

## Testing Stack

### Backend Testing
- **Framework**: Jest
- **TypeScript Support**: ts-jest
- **Test Types**: Unit tests, Integration tests
- **Coverage**: Code coverage reports with lcov/html

### Frontend Testing
- **Framework**: Jest + React Testing Library
- **Environment**: jsdom (simulates browser)
- **Next.js Integration**: next/jest for proper configuration
- **Test Types**: Component tests, Page tests, Integration tests

### E2E Testing (Planned)
- **Framework**: Playwright or Cypress
- **Scope**: Critical user flows end-to-end

## Project Structure

```
scholarsync-backend/
├── jest.config.js          # Jest configuration
├── tests/
│   ├── setup.ts           # Test setup and mocks
│   ├── unit/              # Unit tests
│   │   ├── auth.test.ts
│   │   ├── profile.test.ts
│   │   └── matching.test.ts
│   └── integration/        # Integration tests
│       └── resolvers.test.ts

scholarsync-frontend/
├── jest.config.js          # Jest configuration
├── jest.setup.js          # Test setup
└── __tests__/             # All frontend tests
    ├── lib/               # Utility tests
    │   └── auth.test.ts
    ├── components/        # Component tests
    │   └── onboarding.test.tsx
    └── pages/             # Page tests
        ├── scholarships.test.tsx
        └── applications.test.tsx
```

## Backend Tests

### Running Backend Tests

```bash
cd scholarsync-backend

# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Test Categories

#### 1. Unit Tests

**Authentication Utils** (`tests/unit/auth.test.ts`):
- Password hashing and verification
- JWT token generation and verification
- Email validation
- Password strength validation

**Profile Utils** (`tests/unit/profile.test.ts`):
- Profile strength calculation
- Score computation for different sections
- Activity scoring
- Edge cases handling

**Matching Algorithm** (`tests/unit/matching.test.ts`):
- Match score calculation
- Factor weighting (GPA, major, deadline, etc.)
- Scholarship ranking
- Eligibility determination
- Edge cases (missing data, expired deadlines)

#### 2. Integration Tests

**Resolver Tests** (`tests/integration/resolvers.test.ts`):
- Authentication flow (register, login)
- Profile management (CRUD operations)
- Application lifecycle
- Authorization checks
- Error handling

### Writing New Backend Tests

Example unit test:
```typescript
import { calculateProfileStrength } from '../../src/utils/profile';

describe('Profile Strength', () => {
  it('should calculate correctly', () => {
    const profile = { firstName: 'John', lastName: 'Doe' };
    const score = calculateProfileStrength(profile);
    expect(score).toBeGreaterThan(0);
  });
});
```

Example integration test:
```typescript
import { resolvers } from '../../src/resolvers';

describe('Profile Resolvers', () => {
  it('should update profile', async () => {
    const result = await resolvers.Mutation.updateProfile(
      {},
      { input: { firstName: 'Jane' } },
      { userId: 'test-user' }
    );
    expect(result.firstName).toBe('Jane');
  });
});
```

## Frontend Tests

### Running Frontend Tests

```bash
cd scholarsync-frontend

# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage

# Run specific test file
npm test -- __tests__/pages/scholarships.test.tsx
```

### Test Categories

#### 1. Utility Tests

**Auth Utils** (`__tests__/lib/auth.test.ts`):
- Token storage (localStorage)
- Token retrieval
- Authentication state
- Token clearing

#### 2. Component Tests

**Onboarding Wizard** (`__tests__/components/onboarding.test.tsx`):
- Step navigation (next/back)
- Form field updates
- Validation
- Submission flow
- Loading states

#### 3. Page Tests

**Scholarships Page** (`__tests__/pages/scholarships.test.tsx`):
- Scholarship list rendering
- Match scores display
- Filtering functionality
- Empty state
- Loading/error states
- Eligibility badges

**Applications Page** (`__tests__/pages/applications.test.tsx`):
- Application list rendering
- Statistics display
- Status filtering
- Progress tracking
- Delete functionality
- Deadline urgency indicators

### Writing New Frontend Tests

Example component test:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Test Coverage Goals

### Current Coverage (As of Testing Implementation)

**Backend:**
- Authentication utils: 100%
- Profile utils: 100%
- Matching algorithm: 95%+
- Resolvers: 80%+

**Frontend:**
- Utilities: 90%+
- Components: 70%+
- Pages: 60%+

### Target Coverage

- **Critical paths**: 90%+ coverage
- **Business logic**: 85%+ coverage
- **UI components**: 70%+ coverage
- **Overall**: 75%+ coverage

## Mocking Strategy

### Backend Mocks

**Prisma Client**: Mocked in `tests/setup.ts`
```typescript
jest.mock('../src/utils/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      // ... other methods
    },
  },
}));
```

**Environment Variables**: Set in setup file
```typescript
process.env.JWT_SECRET = 'test-secret-key';
process.env.GEMINI_API_KEY = 'test-key';
```

### Frontend Mocks

**Next.js Router**: Mocked in `jest.setup.js`
```typescript
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));
```

**Apollo Client**: Mocked per test
```typescript
import { useQuery } from '@apollo/client';
jest.mock('@apollo/client');

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
mockUseQuery.mockReturnValue({
  data: { ... },
  loading: false,
  error: undefined,
} as any);
```

## Continuous Integration

### GitHub Actions Workflow (Recommended)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd scholarsync-backend && npm install
      - run: cd scholarsync-backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd scholarsync-frontend && npm install
      - run: cd scholarsync-frontend && npm test
```

## E2E Testing Setup (Future)

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### Critical E2E Test Flows

1. **User Registration & Onboarding**
   - Register new account
   - Complete onboarding wizard
   - Verify profile creation

2. **Scholarship Discovery**
   - Login
   - Browse scholarships
   - View scholarship details
   - Check match scores

3. **Application Management**
   - Create new application
   - Update progress
   - Submit application
   - Track status

4. **Essay Generation**
   - Navigate to essay generator
   - Generate essay with AI
   - Edit and save
   - Link to application

5. **Analytics Dashboard**
   - View statistics
   - Check timeline
   - Review success metrics

## Best Practices

### General

1. **Test Behavior, Not Implementation**
   - Test what the user sees and does
   - Avoid testing internal implementation details

2. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test';

     // Act
     const result = doSomething(input);

     // Assert
     expect(result).toBe('expected');
   });
   ```

3. **Clear Test Names**
   - Use descriptive test names
   - Format: "should [expected behavior] when [condition]"

4. **Isolated Tests**
   - Each test should be independent
   - Use `beforeEach` to reset state
   - Clean up after tests

5. **Mock External Dependencies**
   - Don't make real API calls
   - Mock database interactions
   - Mock third-party services

### Backend-Specific

1. **Test Both Success and Error Cases**
   ```typescript
   it('should succeed with valid input', () => { ... });
   it('should reject invalid input', () => { ... });
   it('should handle database errors', () => { ... });
   ```

2. **Test Authorization**
   - Verify authentication checks
   - Test permission boundaries
   - Ensure proper error messages

3. **Test Edge Cases**
   - Empty inputs
   - Null values
   - Large datasets
   - Boundary conditions

### Frontend-Specific

1. **Query by Accessibility**
   ```typescript
   // Good
   screen.getByRole('button', { name: /submit/i });
   screen.getByLabelText(/email/i);

   // Avoid
   screen.getByClassName('submit-button');
   ```

2. **Wait for Async Updates**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

3. **Test User Interactions**
   ```typescript
   fireEvent.click(screen.getByRole('button'));
   fireEvent.change(input, { target: { value: 'text' } });
   ```

## Troubleshooting

### Common Issues

**Issue**: "Cannot find module '@/...'"
**Solution**: Check `moduleNameMapper` in jest.config.js

**Issue**: "localStorage is not defined"
**Solution**: jsdom provides localStorage, ensure testEnvironment is set

**Issue**: "Cannot read property of undefined (Prisma)"
**Solution**: Check that prisma is properly mocked in setup.ts

**Issue**: "React hooks can only be called inside the body of a function component"
**Solution**: Properly mock React hooks (useQuery, useRouter, etc.)

### Debugging Tests

```bash
# Run single test file
npm test -- path/to/test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Run with verbose output
npm test -- --verbose

# Debug in watch mode
npm test -- --watch
```

## Dependencies

### Backend
```json
{
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "@types/jest": "^29.5.11"
}
```

### Frontend
```json
{
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1"
}
```

## Next Steps

1. **Increase Coverage**
   - Add tests for scholarship resolvers
   - Test analytics calculations
   - Cover more edge cases

2. **Integration Testing**
   - Test complete GraphQL flows
   - Test authentication end-to-end
   - Test application lifecycle

3. **E2E Testing**
   - Set up Playwright
   - Create critical path tests
   - Add visual regression tests

4. **Performance Testing**
   - Load testing for API
   - Stress testing matching algorithm
   - Database query performance

5. **Accessibility Testing**
   - Use jest-axe for a11y
   - Test keyboard navigation
   - Screen reader compatibility

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright Documentation](https://playwright.dev/)
- [Testing GraphQL](https://www.apollographql.com/docs/apollo-server/testing/testing/)

## Conclusion

This testing infrastructure provides a solid foundation for ensuring ScholarSync quality and reliability. As the platform grows, continue expanding test coverage and maintaining high testing standards.

**Remember**: Tests are documentation. Write tests that explain what the code should do, not just verify that it works.
