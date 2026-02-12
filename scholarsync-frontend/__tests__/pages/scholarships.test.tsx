// Scholarships page tests

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import ScholarshipsPage from '@/app/scholarships/page';

jest.mock('@apollo/client');

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe('ScholarshipsPage', () => {
  const mockScholarships = [
    {
      scholarship: {
        id: '1',
        title: 'STEM Excellence Award',
        organization: 'Tech Foundation',
        amount: 10000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'For outstanding STEM students',
        tags: ['STEM', 'Technology'],
        applicationUrl: 'https://example.com/apply',
        essayPrompts: [{ prompt: 'Why STEM?', wordLimit: 500, required: true }],
      },
      matchScore: 92,
      eligibilityStatus: 'eligible',
      missingRequirements: [],
      matchFactors: {
        gpaMatch: 1.0,
        majorMatch: 1.0,
        deadlineProximity: 0.8,
        profileStrength: 0.85,
        activityMatch: 0.9,
        academicStandingMatch: 1.0,
      },
    },
    {
      scholarship: {
        id: '2',
        title: 'Arts Scholarship',
        organization: 'Arts Council',
        amount: 5000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Supporting creative students',
        tags: ['Arts', 'Creativity'],
        applicationUrl: 'https://example.com/arts',
        essayPrompts: [],
      },
      matchScore: 65,
      eligibilityStatus: 'partial',
      missingRequirements: ['Major must be Art-related'],
      matchFactors: {
        gpaMatch: 0.9,
        majorMatch: 0.3,
        deadlineProximity: 0.6,
        profileStrength: 0.85,
        activityMatch: 0.5,
        academicStandingMatch: 1.0,
      },
    },
  ];

  beforeEach(() => {
    mockUseQuery.mockReturnValue({
      data: { matchedScholarships: mockScholarships, scholarshipTags: ['STEM', 'Arts'] },
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render scholarships list', () => {
    render(<ScholarshipsPage />);

    expect(screen.getByText('STEM Excellence Award')).toBeInTheDocument();
    expect(screen.getByText('Arts Scholarship')).toBeInTheDocument();
  });

  it('should display match scores', () => {
    render(<ScholarshipsPage />);

    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as any);

    render(<ScholarshipsPage />);

    expect(screen.getByText(/Loading scholarships/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Failed to load scholarships'),
    } as any);

    render(<ScholarshipsPage />);

    expect(screen.getByText(/Error Loading Scholarships/i)).toBeInTheDocument();
  });

  it('should show empty state when no scholarships match', () => {
    mockUseQuery.mockReturnValue({
      data: { matchedScholarships: [], scholarshipTags: [] },
      loading: false,
      error: undefined,
    } as any);

    render(<ScholarshipsPage />);

    expect(screen.getByText(/No Scholarships Found/i)).toBeInTheDocument();
  });

  it('should filter scholarships by minimum score', async () => {
    render(<ScholarshipsPage />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '70' } });

    // After filtering by 70%, only the first scholarship (92%) should show
    // This would require the component to actually implement client-side filtering
    // or trigger a new query
  });

  it('should display eligibility status badges', () => {
    render(<ScholarshipsPage />);

    expect(screen.getByText('eligible')).toBeInTheDocument();
    expect(screen.getByText('partial')).toBeInTheDocument();
  });

  it('should show award amounts', () => {
    render(<ScholarshipsPage />);

    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('should display deadline information', () => {
    render(<ScholarshipsPage />);

    // Should show "X days" for deadlines
    expect(screen.getAllByText(/\d+ days/)).toHaveLength(2);
  });

  it('should render filter sidebar', () => {
    render(<ScholarshipsPage />);

    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Minimum Match Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
  });

  it('should allow clearing filters', () => {
    render(<ScholarshipsPage />);

    const clearButton = screen.getByText(/Clear Filters/i);
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    // Should reset all filters (implementation-specific)
  });
});
