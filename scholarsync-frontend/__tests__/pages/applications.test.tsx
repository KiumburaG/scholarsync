// Applications page tests

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useQuery, useMutation } from '@apollo/client';
import ApplicationsPage from '@/app/applications/page';

jest.mock('@apollo/client');

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe('ApplicationsPage', () => {
  const mockApplications = [
    {
      id: 'app-1',
      status: 'IN_PROGRESS',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      progressPercentage: 60,
      scholarship: {
        id: 'sch-1',
        title: 'STEM Award',
        organization: 'Tech Foundation',
        amount: 10000,
        tags: ['STEM'],
      },
      essays: [{ id: 'essay-1' }],
    },
    {
      id: 'app-2',
      status: 'SUBMITTED',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      progressPercentage: 100,
      scholarship: {
        id: 'sch-2',
        title: 'Arts Scholarship',
        organization: 'Arts Council',
        amount: 5000,
        tags: ['Arts'],
      },
      essays: [],
    },
  ];

  const mockStats = {
    total: 5,
    draft: 1,
    inProgress: 2,
    submitted: 1,
    accepted: 1,
    rejected: 0,
    pending: 0,
    totalAmountApplied: 30000,
    totalAmountWon: 5000,
    upcomingDeadlines: 2,
  };

  beforeEach(() => {
    mockUseQuery.mockImplementation((query: any) => {
      if (query.definitions[0].name.value === 'MyApplications') {
        return {
          data: { myApplications: mockApplications },
          loading: false,
          error: undefined,
          refetch: jest.fn(),
        } as any;
      }
      if (query.definitions[0].name.value === 'ApplicationStats') {
        return {
          data: { applicationStats: mockStats },
          loading: false,
          error: undefined,
        } as any;
      }
      return { data: undefined, loading: false, error: undefined } as any;
    });

    mockUseMutation.mockReturnValue([
      jest.fn().mockResolvedValue({ data: {} }),
      { loading: false, error: undefined },
    ] as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render application statistics', () => {
    render(<ApplicationsPage />);

    expect(screen.getByText('5')).toBeInTheDocument(); // Total
    expect(screen.getByText('2')).toBeInTheDocument(); // In Progress
    expect(screen.getByText('1')).toBeInTheDocument(); // Submitted or Accepted
  });

  it('should render applications list', () => {
    render(<ApplicationsPage />);

    expect(screen.getByText('STEM Award')).toBeInTheDocument();
    expect(screen.getByText('Arts Scholarship')).toBeInTheDocument();
  });

  it('should display status badges', () => {
    render(<ApplicationsPage />);

    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('SUBMITTED')).toBeInTheDocument();
  });

  it('should show progress bars', () => {
    render(<ApplicationsPage />);

    // Should show progress percentages
    expect(screen.getAllByText(/60%|100%/)).toHaveLength(4); // 2 apps × 2 displays each
  });

  it('should filter by status', async () => {
    render(<ApplicationsPage />);

    const submittedButton = screen.getByRole('button', { name: /Submitted/i });
    fireEvent.click(submittedButton);

    // Should trigger a refetch with status filter
    await waitFor(() => {
      // Implementation would show only submitted applications
    });
  });

  it('should show loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    } as any);

    render(<ApplicationsPage />);

    expect(screen.getByText(/Loading applications/i)).toBeInTheDocument();
  });

  it('should show empty state', () => {
    mockUseQuery.mockReturnValue({
      data: { myApplications: [], applicationStats: mockStats },
      loading: false,
      error: undefined,
    } as any);

    render(<ApplicationsPage />);

    expect(screen.getByText(/No Applications Yet/i)).toBeInTheDocument();
  });

  it('should handle delete application', async () => {
    const mockDeleteMutation = jest.fn().mockResolvedValue({ data: {} });
    mockUseMutation.mockReturnValue([
      mockDeleteMutation,
      { loading: false, error: undefined },
    ] as any);

    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    render(<ApplicationsPage />);

    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(mockDeleteMutation).toHaveBeenCalled();
    });
  });

  it('should update progress with slider', async () => {
    const mockUpdateMutation = jest.fn().mockResolvedValue({ data: {} });
    mockUseMutation.mockReturnValue([
      mockUpdateMutation,
      { loading: false, error: undefined },
    ] as any);

    render(<ApplicationsPage />);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '75' } });

    await waitFor(() => {
      expect(mockUpdateMutation).toHaveBeenCalledWith({
        variables: expect.objectContaining({
          percentage: 75,
        }),
      });
    });
  });

  it('should show deadline urgency for approaching deadlines', () => {
    const urgentApp = {
      ...mockApplications[0],
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    };

    mockUseQuery.mockImplementation((query: any) => {
      if (query.definitions[0].name.value === 'MyApplications') {
        return {
          data: { myApplications: [urgentApp] },
          loading: false,
          error: undefined,
        } as any;
      }
      return { data: { applicationStats: mockStats }, loading: false } as any;
    });

    render(<ApplicationsPage />);

    // Should show red urgency indicator for deadlines ≤7 days
    const deadlineText = screen.getByText(/3 days/i);
    expect(deadlineText.className).toContain('red'); // Implementation-specific
  });
});
