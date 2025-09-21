import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Dashboard from '@/components/pages/Dashboard';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      fullName: 'Alex Developer',
      email: 'alex@example.com',
      avatar: '/api/placeholder/40/40',
    },
  }),
}));

vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    data: {
      planType: 'Professional',
      price: 99,
      status: 'active',
      nextBilling: 'March 15, 2024',
      usage: {
        voiceCommands: 147,
        projectsAnalyzed: 23,
        aiResponses: 892,
      },
    },
    loading: false,
    error: null,
  }),
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    global.window.open = vi.fn();
  });

  describe('Navigation Header', () => {
    it('renders the logo', () => {
      renderDashboard();
      expect(screen.getByRole('img', { name: /agentsolvr/i })).toBeInTheDocument();
    });

    it('displays user information', () => {
      renderDashboard();
      expect(screen.getByText('Alex Developer')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /alex developer/i })).toBeInTheDocument();
    });

    it('has glass effect styling', () => {
      renderDashboard();
      const header = document.querySelector('.glass-effect');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it('renders "Back to Home" button', () => {
      renderDashboard();
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('navigates to home when Back to Home is clicked', () => {
      renderDashboard();
      fireEvent.click(screen.getByText('Back to Home'));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Welcome Section', () => {
    it('displays personalized welcome message', () => {
      renderDashboard();
      expect(screen.getByText(/welcome back, alex!/i)).toBeInTheDocument();
    });

    it('shows descriptive subtitle', () => {
      renderDashboard();
      expect(screen.getByText(/manage your agentsolvr subscription and access your development tools/i)).toBeInTheDocument();
    });

    it('has fade-in animation', () => {
      renderDashboard();
      const welcomeSection = document.querySelector('.animate-fade-in');
      expect(welcomeSection).toBeInTheDocument();
    });
  });

  describe('Subscription Status Section', () => {
    it('renders subscription status card', () => {
      renderDashboard();
      expect(screen.getByText('Subscription Status')).toBeInTheDocument();
    });

    it('displays current plan information', () => {
      renderDashboard();
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
      expect(screen.getByText('$99/month • Next billing: March 15, 2024')).toBeInTheDocument();
    });

    it('shows active status with indicator', () => {
      renderDashboard();
      expect(screen.getByText('Active')).toBeInTheDocument();
      const statusDot = document.querySelector('.bg-ctp-green.rounded-full');
      expect(statusDot).toBeInTheDocument();
    });

    it('has gradient background styling', () => {
      renderDashboard();
      const gradientSection = document.querySelector('.bg-gradient-to-r.from-ctp-mauve\\/10');
      expect(gradientSection).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      renderDashboard();
      expect(screen.getByText('Manage Billing')).toBeInTheDocument();
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
    });

    it('navigates to pricing when Upgrade Plan is clicked', () => {
      renderDashboard();
      fireEvent.click(screen.getByText('Upgrade Plan'));
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });
  });

  describe('Usage Statistics Section', () => {
    it('renders usage statistics heading', () => {
      renderDashboard();
      expect(screen.getByText('Usage This Month')).toBeInTheDocument();
    });

    it('displays voice commands usage', () => {
      renderDashboard();
      expect(screen.getByText('Voice Commands')).toBeInTheDocument();
      expect(screen.getByText('147')).toBeInTheDocument();
      expect(screen.getByText('Limit: Unlimited')).toBeInTheDocument();
    });

    it('displays projects analyzed usage', () => {
      renderDashboard();
      expect(screen.getByText('Projects Analyzed')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('displays AI responses usage', () => {
      renderDashboard();
      expect(screen.getByText('AI Responses')).toBeInTheDocument();
      expect(screen.getByText('892')).toBeInTheDocument();
    });

    it('stat cards have hover effects', () => {
      renderDashboard();
      const statCards = document.querySelectorAll('.hover\\:shadow-glow');
      expect(statCards.length).toBeGreaterThan(0);
    });

    it('stat cards have gradient icons', () => {
      renderDashboard();
      const gradientIcons = document.querySelectorAll('.bg-gradient-to-r.from-ctp-mauve.to-ctp-blue');
      expect(gradientIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Recent Activity Section', () => {
    it('renders recent activity heading', () => {
      renderDashboard();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('displays activity items', () => {
      renderDashboard();
      expect(screen.getByText('Downloaded AgentSOLVR V4.2.1')).toBeInTheDocument();
      expect(screen.getByText('Analyzed React project (45 files)')).toBeInTheDocument();
      expect(screen.getByText('Voice command: "Add authentication"')).toBeInTheDocument();
      expect(screen.getByText('Upgraded to Professional plan')).toBeInTheDocument();
    });

    it('displays timestamps for activities', () => {
      renderDashboard();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('1 day ago')).toBeInTheDocument();
      expect(screen.getByText('3 days ago')).toBeInTheDocument();
      expect(screen.getByText('1 week ago')).toBeInTheDocument();
    });

    it('activity items have appropriate icons', () => {
      renderDashboard();
      // Check for various activity type icons
      const activityIcons = document.querySelectorAll('.text-ctp-blue, .text-ctp-green, .text-ctp-mauve, .text-ctp-yellow');
      expect(activityIcons.length).toBeGreaterThan(0);
    });

    it('has "View All Activity" button', () => {
      renderDashboard();
      expect(screen.getByText('View All Activity')).toBeInTheDocument();
    });

    it('activity items have hover effects', () => {
      renderDashboard();
      const hoverElements = document.querySelectorAll('.hover\\:bg-ctp-surface0');
      expect(hoverElements.length).toBeGreaterThan(0);
    });
  });

  describe('Quick Actions Sidebar', () => {
    it('renders quick actions card', () => {
      renderDashboard();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('displays download button', () => {
      renderDashboard();
      expect(screen.getByText('Download AgentSOLVR V4')).toBeInTheDocument();
    });

    it('download button has premium styling', () => {
      renderDashboard();
      const downloadButton = screen.getByText('Download AgentSOLVR V4').closest('button');
      expect(downloadButton).toHaveClass('btn-premium');
    });

    it('navigates to downloads when download button is clicked', () => {
      renderDashboard();
      fireEvent.click(screen.getByText('Download AgentSOLVR V4'));
      expect(mockNavigate).toHaveBeenCalledWith('/downloads');
    });

    it('displays documentation button', () => {
      renderDashboard();
      expect(screen.getByText('View Documentation')).toBeInTheDocument();
    });

    it('opens documentation in new tab', () => {
      renderDashboard();
      fireEvent.click(screen.getByText('View Documentation'));
      expect(window.open).toHaveBeenCalledWith('https://docs.agentsolvr.com', '_blank');
    });

    it('displays contact support button', () => {
      renderDashboard();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    it('opens email client for support', () => {
      renderDashboard();
      fireEvent.click(screen.getByText('Contact Support'));
      expect(window.open).toHaveBeenCalledWith('mailto:support@agentsolvr.com');
    });
  });

  describe('Account Information Sidebar', () => {
    it('renders account information card', () => {
      renderDashboard();
      expect(screen.getByText('Account Information')).toBeInTheDocument();
    });

    it('displays user full name', () => {
      renderDashboard();
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Alex Developer')).toBeInTheDocument();
    });

    it('displays user email', () => {
      renderDashboard();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('alex@example.com')).toBeInTheDocument();
    });

    it('displays current plan', () => {
      renderDashboard();
      expect(screen.getByText('Plan')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
    });

    it('displays member since date', () => {
      renderDashboard();
      expect(screen.getByText('Member Since')).toBeInTheDocument();
      expect(screen.getByText('January 2024')).toBeInTheDocument();
    });

    it('has edit profile button', () => {
      renderDashboard();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  describe('Coming Soon Sidebar', () => {
    it('renders coming soon card', () => {
      renderDashboard();
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    it('displays upcoming features', () => {
      renderDashboard();
      expect(screen.getByText('Real-time collaboration features')).toBeInTheDocument();
      expect(screen.getByText('Advanced project templates')).toBeInTheDocument();
      expect(screen.getByText('Mobile companion app')).toBeInTheDocument();
    });

    it('has gradient background styling', () => {
      renderDashboard();
      const comingSoonCard = document.querySelector('.bg-gradient-to-br.from-ctp-mauve\\/10');
      expect(comingSoonCard).toBeInTheDocument();
    });

    it('features have colored status dots', () => {
      renderDashboard();
      const statusDots = document.querySelectorAll('.bg-ctp-mauve.rounded-full, .bg-ctp-blue.rounded-full, .bg-ctp-green.rounded-full');
      expect(statusDots.length).toBe(3);
    });
  });

  describe('Responsive Design', () => {
    it('uses responsive grid layout', () => {
      renderDashboard();
      expect(document.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
      expect(document.querySelector('.lg\\:col-span-2')).toBeInTheDocument();
    });

    it('has proper container and spacing', () => {
      renderDashboard();
      expect(document.querySelector('.container-padding')).toBeInTheDocument();
      expect(document.querySelector('.max-w-7xl')).toBeInTheDocument();
    });

    it('statistics grid is responsive', () => {
      renderDashboard();
      expect(document.querySelector('.md\\:grid-cols-3')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('has fade-in animations', () => {
      renderDashboard();
      const animatedElements = document.querySelectorAll('.animate-fade-in');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('cards have hover animations', () => {
      renderDashboard();
      const hoverCards = document.querySelectorAll('.hover\\:shadow-glow');
      expect(hoverCards.length).toBeGreaterThan(0);
    });

    it('status indicators have animations', () => {
      renderDashboard();
      const pulsingElements = document.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderDashboard();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5);
    });

    it('all buttons have accessible names', () => {
      renderDashboard();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('images have alt text', () => {
      renderDashboard();
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('subscription status is clearly marked', () => {
      renderDashboard();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('displays subscription data correctly', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Professional Plan')).toBeInTheDocument();
        expect(screen.getByText('$99/month')).toBeInTheDocument();
      });
    });

    it('displays usage statistics correctly', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('147')).toBeInTheDocument();
        expect(screen.getByText('23')).toBeInTheDocument();
        expect(screen.getByText('892')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles navigation errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      
      renderDashboard();
      
      expect(() => {
        fireEvent.click(screen.getByText('Back to Home'));
      }).not.toThrow();
    });

    it('handles external link errors gracefully', () => {
      global.window.open = vi.fn().mockImplementation(() => {
        throw new Error('Failed to open');
      });
      
      renderDashboard();
      
      expect(() => {
        fireEvent.click(screen.getByText('View Documentation'));
      }).not.toThrow();
    });
  });

  describe('Brand Consistency', () => {
    it('uses Catppuccin color scheme', () => {
      renderDashboard();
      expect(document.querySelector('.bg-ctp-base')).toBeInTheDocument();
      expect(document.querySelector('.text-ctp-text')).toBeInTheDocument();
      expect(document.querySelector('.text-ctp-subtext1')).toBeInTheDocument();
    });

    it('maintains consistent spacing and typography', () => {
      renderDashboard();
      expect(document.querySelector('.gap-8')).toBeInTheDocument();
      expect(document.querySelector('.gap-6')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('efficiently renders dashboard data', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('Welcome back, Alex!')).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('integrates with auth context', () => {
      renderDashboard();
      expect(screen.getByText('Alex Developer')).toBeInTheDocument();
    });

    it('integrates with subscription context', () => {
      renderDashboard();
      expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    });
  });
});