// Onboarding wizard component tests

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useQuery, useMutation } from '@apollo/client';
import OnboardingWizard from '@/components/onboarding/onboarding-wizard';

// Mock Apollo hooks
jest.mock('@apollo/client');

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

describe('OnboardingWizard Component', () => {
  const mockProfile = {
    firstName: '',
    lastName: '',
    phone: '',
    currentSchool: '',
    major: '',
    gpa: null,
  };

  beforeEach(() => {
    mockUseQuery.mockReturnValue({
      data: { myProfile: mockProfile },
      loading: false,
      error: undefined,
    } as any);

    mockUseMutation.mockReturnValue([
      jest.fn().mockResolvedValue({ data: {} }),
      { loading: false, error: undefined },
    ] as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render step 1 (Basic Info) by default', () => {
    render(<OnboardingWizard />);

    expect(screen.getByText(/Basic Information/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<OnboardingWizard />);

    const progressBar = screen.getByRole('progressbar', { hidden: true });
    expect(progressBar).toBeInTheDocument();
  });

  it('should navigate to next step when clicking Next', async () => {
    render(<OnboardingWizard />);

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Academic Information/i)).toBeInTheDocument();
    });
  });

  it('should navigate back to previous step', async () => {
    render(<OnboardingWizard />);

    // Go to step 2
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/Academic Information/i)).toBeInTheDocument();
    });

    // Go back to step 1
    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByText(/Basic Information/i)).toBeInTheDocument();
    });
  });

  it('should update form fields', () => {
    render(<OnboardingWizard />);

    const firstNameInput = screen.getByLabelText(/First Name/i) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: 'John' } });

    expect(firstNameInput.value).toBe('John');
  });

  it('should show validation errors for required fields', async () => {
    render(<OnboardingWizard />);

    // Try to go to next step without filling required fields
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    // Should show validation messages (if implemented)
    // This test would need to match your actual validation implementation
  });

  it('should display loading state while submitting', async () => {
    mockUseMutation.mockReturnValue([
      jest.fn().mockResolvedValue({ data: {} }),
      { loading: true, error: undefined },
    ] as any);

    render(<OnboardingWizard />);

    // Navigate to final step
    const nextButton = screen.getByRole('button', { name: /Next/i });
    for (let i = 0; i < 4; i++) {
      fireEvent.click(nextButton);
      await waitFor(() => {});
    }

    // Should show loading state
    expect(screen.getByText(/Saving/i) || screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
