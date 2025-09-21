import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import { vi } from 'vitest';
import App from '@/App';

// Mock API responses
const mockApiResponses = {
  register: {
    user: {
      id: 'user-123',
      email: 'newuser@example.com',
      fullName: 'New User',
      isActive: true,
      emailVerified: true,
    },
    token: 'auth-token-123',
  },
  login: {
    user: {
      id: 'user-456',
      email: 'existinguser@example.com',
      fullName: 'Existing User',
      isActive: true,
      emailVerified: true,
    },
    token: 'auth-token-456',
  },
  subscription: {
    plan_type: 'professional',
    status: 'active',
    features: ['desktop_app', 'advanced_voice', 'unlimited_analysis', 'priority_support'],
  },
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      price: 39,
      billing: 'month',
      description: 'Perfect for individual developers getting started',
      features: ['AgentSOLVR Desktop App', 'Basic voice commands (10/day)'],
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      billing: 'month',
      description: 'For serious developers and small teams',
      features: ['Everything in Starter', 'Advanced voice commands (unlimited)'],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      billing: 'month',
      description: 'For teams that need custom solutions',
      features: ['Everything in Professional', 'Custom AI model training'],
      popular: false,
    },
  ],
};

// Mock axios
vi.mock('axios', () => ({
  create: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
  })),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.open
global.window.open = vi.fn();

describe('End-to-End User Workflows', () => {
  let axios: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Import axios mock
    axios = require('axios');
    const mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
    };
    axios.create.mockReturnValue(mockApiClient);
    
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const renderApp = () => {
    return render(<App />);
  };

  describe('New User Registration and Onboarding Flow', () => {
    it('completes full user registration to dashboard flow', async () => {
      const user = userEvent.setup();
      
      // Setup API mocks
      const mockApiClient = axios.create();
      mockApiClient.post.mockImplementation((url: string) => {
        if (url === '/api/auth/register') {
          return Promise.resolve({ data: mockApiResponses.register });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
      
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/api/subscription/status') {
          return Promise.resolve({ data: mockApiResponses.subscription });
        }
        if (url === '/api/subscription/plans') {
          return Promise.resolve({ data: mockApiResponses.plans });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      renderApp();

      // 1. User lands on homepage
      expect(screen.getByText(/transform your development with/i)).toBeInTheDocument();
      expect(screen.getByText('AgentSOLVR')).toBeInTheDocument();

      // 2. User clicks "Get Started" to begin registration
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      // 3. User is on registration page
      await waitFor(() => {
        expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      });

      // 4. User fills out registration form
      const fullNameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(fullNameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'SecurePass123!');
      await user.type(confirmPasswordInput, 'SecurePass123!');

      // 5. User submits registration
      const registerButton = screen.getByRole('button', { name: /create account/i });
      await user.click(registerButton);

      // 6. User is redirected to dashboard after successful registration
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // 7. Verify registration API was called
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        full_name: 'New User',
      });

      // 8. Verify token was stored
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'auth-token-123');
    });
  });

  describe('Existing User Login Flow', () => {
    it('completes login to dashboard flow', async () => {
      const user = userEvent.setup();
      
      // Setup API mocks
      const mockApiClient = axios.create();
      mockApiClient.post.mockResolvedValue({ data: mockApiResponses.login });
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/api/subscription/status') {
          return Promise.resolve({ data: mockApiResponses.subscription });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      renderApp();

      // 1. User clicks "Sign In" from homepage
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // 2. User is on login page
      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });

      // 3. User fills out login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'existinguser@example.com');
      await user.type(passwordInput, 'MyPassword123!');

      // 4. User submits login
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);

      // 5. User is redirected to dashboard
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // 6. Verify login API was called
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'existinguser@example.com',
        password: 'MyPassword123!',
      });
    });
  });

  describe('Pricing Exploration Flow', () => {
    it('user can explore pricing options and select plan', async () => {
      const user = userEvent.setup();
      
      renderApp();

      // 1. User starts on homepage
      expect(screen.getByText(/transform your development/i)).toBeInTheDocument();

      // 2. User clicks "View Pricing"
      const viewPricingButton = screen.getByRole('button', { name: /view pricing/i });
      await user.click(viewPricingButton);

      // 3. User is on pricing page
      await waitFor(() => {
        expect(screen.getByText(/choose your.*plan/i)).toBeInTheDocument();
      });

      // 4. User sees all pricing tiers
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();

      // 5. User sees production pricing
      expect(screen.getByText('$39')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('$299')).toBeInTheDocument();

      // 6. User sees "Most Popular" badge on Professional plan
      expect(screen.getByText('Most Popular')).toBeInTheDocument();

      // 7. User clicks on Professional plan
      const upgradeToProButton = screen.getByText('Upgrade to Pro');
      await user.click(upgradeToProButton);

      // 8. User is redirected to registration
      await waitFor(() => {
        expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Subscription Management Flow', () => {
    it('authenticated user can manage subscription in dashboard', async () => {
      const user = userEvent.setup();
      
      // Mock authenticated state
      mockLocalStorage.getItem.mockReturnValue('existing-token');
      
      const mockApiClient = axios.create();
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/api/auth/me') {
          return Promise.resolve({ data: mockApiResponses.login.user });
        }
        if (url === '/api/subscription/status') {
          return Promise.resolve({ data: mockApiResponses.subscription });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      renderApp();

      // 1. User lands on dashboard (authenticated)
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // 2. User sees subscription status
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
      expect(screen.getByText('$99/month')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();

      // 3. User sees usage statistics
      expect(screen.getByText('Voice Commands')).toBeInTheDocument();
      expect(screen.getByText('147')).toBeInTheDocument();
      expect(screen.getByText('Projects Analyzed')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();

      // 4. User can access quick actions
      expect(screen.getByText('Download AgentSOLVR V4')).toBeInTheDocument();
      expect(screen.getByText('View Documentation')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();

      // 5. User clicks on upgrade plan
      const upgradePlanButton = screen.getByText('Upgrade Plan');
      await user.click(upgradePlanButton);

      // 6. User is redirected to pricing
      await waitFor(() => {
        expect(screen.getByText(/choose your.*plan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Software Download Flow', () => {
    it('authenticated user can download software', async () => {
      const user = userEvent.setup();
      
      // Mock authenticated state with active subscription
      mockLocalStorage.getItem.mockReturnValue('existing-token');
      
      const mockApiClient = axios.create();
      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/api/auth/me') {
          return Promise.resolve({
            data: {
              ...mockApiResponses.login.user,
              subscription: { planType: 'Professional', status: 'active' },
            },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Mock document.createElement for download simulation
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      global.document.createElement = vi.fn().mockReturnValue(mockAnchor);
      global.document.body.appendChild = vi.fn();
      global.document.body.removeChild = vi.fn();

      renderApp();

      // 1. Navigate to dashboard first
      await waitFor(() => {
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      });

      // 2. User clicks "Download AgentSOLVR V4"
      const downloadButton = screen.getByText('Download AgentSOLVR V4');
      await user.click(downloadButton);

      // 3. User is on downloads page
      await waitFor(() => {
        expect(screen.getByText(/download.*agentsolvr.*v4/i)).toBeInTheDocument();
      });

      // 4. User sees active subscription status
      expect(screen.getByText('Ready to Download')).toBeInTheDocument();
      expect(screen.getByText(/your professional subscription is active/i)).toBeInTheDocument();

      // 5. User sees all platform options
      expect(screen.getByText('Windows')).toBeInTheDocument();
      expect(screen.getByText('macOS')).toBeInTheDocument();
      expect(screen.getByText('Linux')).toBeInTheDocument();

      // 6. User sees system requirements
      expect(screen.getByText('Windows 10 or later (64-bit)')).toBeInTheDocument();
      expect(screen.getByText('macOS 11.0 (Big Sur) or later')).toBeInTheDocument();

      // 7. User clicks download for Windows
      const windowsDownloadButton = screen.getByRole('button', { name: /download for windows/i });
      await user.click(windowsDownloadButton);

      // 8. Download process is initiated
      await waitFor(() => {
        expect(screen.getByText('Preparing Download...')).toBeInTheDocument();
      });

      // 9. Verify download link creation
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('redirects non-subscribers to pricing page', async () => {
      const user = userEvent.setup();
      
      // Mock user without active subscription
      const mockApiClient = axios.create();
      mockApiClient.get.mockResolvedValue({
        data: {
          ...mockApiResponses.login.user,
          subscription: { status: 'inactive' },
        },
      });

      renderApp();

      // Navigate directly to downloads page
      window.history.pushState({}, '', '/downloads');

      await waitFor(() => {
        expect(screen.getByText(/subscription required/i)).toBeInTheDocument();
      });

      // User clicks "View Pricing Plans"
      const viewPricingButton = screen.getByRole('button', { name: /view pricing plans/i });
      await user.click(viewPricingButton);

      // User is redirected to pricing
      await waitFor(() => {
        expect(screen.getByText(/choose your.*plan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and User Experience Flow', () => {
    it('user can navigate between all pages seamlessly', async () => {
      const user = userEvent.setup();
      
      renderApp();

      // 1. Start on landing page
      expect(screen.getByText(/transform your development/i)).toBeInTheDocument();

      // 2. Navigate to pricing
      const viewPricingButton = screen.getByRole('button', { name: /view pricing/i });
      await user.click(viewPricingButton);

      await waitFor(() => {
        expect(screen.getByText(/choose your.*plan/i)).toBeInTheDocument();
      });

      // 3. Navigate to login
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });

      // 4. Navigate to registration
      const createAccountLink = screen.getByText(/create an account/i);
      await user.click(createAccountLink);

      await waitFor(() => {
        expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      });

      // 5. Navigate back to login
      const backToLoginLink = screen.getByText(/already have an account/i);
      await user.click(backToLoginLink);

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Flows', () => {
    it('handles registration errors gracefully', async () => {
      const user = userEvent.setup();
      
      const mockApiClient = axios.create();
      mockApiClient.post.mockRejectedValue(new Error('Email already exists'));

      renderApp();

      // Navigate to registration
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      await user.click(getStartedButton);

      await waitFor(() => {
        expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      });

      // Fill out form
      const fullNameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(fullNameInput, 'Test User');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');

      // Submit form
      const registerButton = screen.getByRole('button', { name: /create account/i });
      await user.click(registerButton);

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });

      // User should still be on registration page
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    });

    it('handles login errors gracefully', async () => {
      const user = userEvent.setup();
      
      const mockApiClient = axios.create();
      mockApiClient.post.mockRejectedValue(new Error('Invalid credentials'));

      renderApp();

      // Navigate to login
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      });

      // Fill out form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'wrongpassword');

      // Submit form
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // User should still be on login page
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior Flow', () => {
    it('works on different screen sizes', async () => {
      const user = userEvent.setup();
      
      renderApp();

      // Verify responsive grid classes are present
      expect(document.querySelector('.lg\\:grid-cols-2')).toBeInTheDocument();
      expect(document.querySelector('.md\\:grid-cols-3')).toBeInTheDocument();

      // Navigation should work on mobile
      const mobileNavButton = screen.getByRole('button', { name: /get started/i });
      expect(mobileNavButton).toBeInTheDocument();

      // Content should be accessible
      expect(screen.getByText(/transform your development/i)).toBeInTheDocument();
    });
  });
});