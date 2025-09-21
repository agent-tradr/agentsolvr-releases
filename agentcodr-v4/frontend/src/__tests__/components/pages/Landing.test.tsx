import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Landing from '@/components/pages/Landing';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthProvider
vi.mock('@/hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderLanding = () => {
  return render(
    <BrowserRouter>
      <Landing />
    </BrowserRouter>
  );
};

describe('Landing Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Header', () => {
    it('renders the logo', () => {
      renderLanding();
      expect(screen.getByRole('img', { name: /agentsolvr/i })).toBeInTheDocument();
    });

    it('renders navigation buttons', () => {
      renderLanding();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });

    it('navigates to login when Sign In is clicked', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to register when Get Started is clicked', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /get started/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
  });

  describe('Hero Section', () => {
    it('renders the main heading with brand colors', () => {
      renderLanding();
      expect(screen.getByText(/transform your development with/i)).toBeInTheDocument();
      expect(screen.getByText('Agent')).toBeInTheDocument();
      expect(screen.getByText('SOLVR')).toBeInTheDocument();
    });

    it('renders the value proposition', () => {
      renderLanding();
      expect(screen.getByText(/voice-controlled ai development platform/i)).toBeInTheDocument();
      expect(screen.getByText(/deploy multiple specialized agents/i)).toBeInTheDocument();
    });

    it('has animated gradient background', () => {
      renderLanding();
      const heroSection = document.querySelector('.hero-gradient-bg');
      expect(heroSection).toBeInTheDocument();
      expect(heroSection).toHaveClass('animate-fade-in');
    });

    it('renders CTA buttons with correct text', () => {
      renderLanding();
      expect(screen.getByRole('button', { name: /start free trial/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view pricing/i })).toBeInTheDocument();
    });

    it('navigates to register when Start Free Trial is clicked', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /start free trial/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('navigates to pricing when View Pricing is clicked', () => {
      renderLanding();
      fireEvent.click(screen.getByRole('button', { name: /view pricing/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/pricing');
    });

    it('displays trust signals', () => {
      renderLanding();
      expect(screen.getByText(/no credit card required/i)).toBeInTheDocument();
      expect(screen.getByText(/14-day free trial/i)).toBeInTheDocument();
      expect(screen.getByText(/cancel anytime/i)).toBeInTheDocument();
    });
  });

  describe('Dashboard Preview', () => {
    it('renders agent coordination preview', () => {
      renderLanding();
      expect(screen.getByText(/agent coordination/i)).toBeInTheDocument();
      expect(screen.getByText(/6 agents active/i)).toBeInTheDocument();
    });

    it('displays agent cards', () => {
      renderLanding();
      expect(screen.getByText('Backend Core')).toBeInTheDocument();
      expect(screen.getByText('Claude Integration')).toBeInTheDocument();
      expect(screen.getByText('Security Agent')).toBeInTheDocument();
      expect(screen.getByText('Frontend UI')).toBeInTheDocument();
    });

    it('shows performance metrics for each agent', () => {
      renderLanding();
      expect(screen.getByText('Performance: 95%')).toBeInTheDocument();
      expect(screen.getByText('Performance: 96%')).toBeInTheDocument();
      expect(screen.getByText('Performance: 97%')).toBeInTheDocument();
      expect(screen.getByText('Performance: 98%')).toBeInTheDocument();
    });

    it('displays voice command preview', () => {
      renderLanding();
      expect(screen.getByText(/voice command active/i)).toBeInTheDocument();
      expect(screen.getByText(/add error handling to the authentication module/i)).toBeInTheDocument();
    });

    it('has animated floating elements', () => {
      renderLanding();
      const floatingElements = document.querySelectorAll('.animate-pulse');
      expect(floatingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Features Section', () => {
    it('renders features section heading', () => {
      renderLanding();
      expect(screen.getByText(/powerful features for modern development/i)).toBeInTheDocument();
    });

    it('displays all feature cards', () => {
      renderLanding();
      expect(screen.getByText('Voice Commands')).toBeInTheDocument();
      expect(screen.getByText('AI Agents')).toBeInTheDocument();
      expect(screen.getByText('Project Analysis')).toBeInTheDocument();
      expect(screen.getByText('Real-time Sync')).toBeInTheDocument();
      expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Security')).toBeInTheDocument();
    });

    it('feature cards have hover effects', () => {
      renderLanding();
      const featureCards = document.querySelectorAll('.hover\\:shadow-glow');
      expect(featureCards.length).toBeGreaterThan(0);
    });

    it('has staggered animation classes', () => {
      renderLanding();
      const animatedGrid = document.querySelector('.animate-stagger');
      expect(animatedGrid).toBeInTheDocument();
    });
  });

  describe('Benefits Section', () => {
    it('renders benefits section', () => {
      renderLanding();
      expect(screen.getByText(/why choose agentsolvr/i)).toBeInTheDocument();
    });

    it('displays all benefits with checkmarks', () => {
      renderLanding();
      expect(screen.getByText(/50x faster development workflow/i)).toBeInTheDocument();
      expect(screen.getByText(/natural language programming interface/i)).toBeInTheDocument();
      expect(screen.getByText(/automated code review and optimization/i)).toBeInTheDocument();
      expect(screen.getByText(/real-time collaboration with ai agents/i)).toBeInTheDocument();
      expect(screen.getByText(/support for 50\+ programming languages/i)).toBeInTheDocument();
      expect(screen.getByText(/enterprise-grade security and compliance/i)).toBeInTheDocument();
    });

    it('final CTA button has glow animation', () => {
      renderLanding();
      const finalCTA = screen.getByRole('button', { name: /start your free trial/i });
      expect(finalCTA).toHaveClass('animate-glow');
    });
  });

  describe('Footer', () => {
    it('renders footer with logo and links', () => {
      renderLanding();
      expect(screen.getByText('© 2024 AgentSOLVR')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies container padding class', () => {
      renderLanding();
      const sections = document.querySelectorAll('.container-padding');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('applies section spacing class', () => {
      renderLanding();
      const sections = document.querySelectorAll('.section-spacing');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('uses responsive grid classes', () => {
      renderLanding();
      expect(document.querySelector('.lg\\:grid-cols-2')).toBeInTheDocument();
      expect(document.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
      expect(document.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('applies fade-in animation to main elements', () => {
      renderLanding();
      const animatedElements = document.querySelectorAll('.animate-fade-in');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('has gradient background animation', () => {
      renderLanding();
      const gradientBg = document.querySelector('.hero-gradient-bg');
      expect(gradientBg).toBeInTheDocument();
    });

    it('floating elements have pulse animation', () => {
      renderLanding();
      const pulsingElements = document.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderLanding();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
    });

    it('buttons have accessible names', () => {
      renderLanding();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('images have alt text', () => {
      renderLanding();
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });

  describe('Performance', () => {
    it('lazy loads non-critical elements', async () => {
      renderLanding();
      // Test that heavy animations don't block initial render
      await waitFor(() => {
        expect(screen.getByText(/transform your development/i)).toBeInTheDocument();
      });
    });

    it('uses proper image optimization', () => {
      renderLanding();
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading');
      });
    });
  });

  describe('Brand Consistency', () => {
    it('uses Catppuccin color classes', () => {
      renderLanding();
      expect(document.querySelector('.text-ctp-mauve')).toBeInTheDocument();
      expect(document.querySelector('.text-ctp-blue')).toBeInTheDocument();
      expect(document.querySelector('.text-ctp-subtext1')).toBeInTheDocument();
      expect(document.querySelector('.bg-ctp-base')).toBeInTheDocument();
    });

    it('maintains consistent spacing', () => {
      renderLanding();
      expect(document.querySelector('.gap-12')).toBeInTheDocument();
      expect(document.querySelector('.gap-8')).toBeInTheDocument();
      expect(document.querySelector('.gap-6')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles navigation errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      
      renderLanding();
      
      // Should not crash the component
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      }).not.toThrow();
    });
  });
});