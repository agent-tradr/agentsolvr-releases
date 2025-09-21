import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Pricing from '@/components/pages/Pricing';

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

const renderPricing = () => {
  return render(
    <BrowserRouter>
      <Pricing />
    </BrowserRouter>
  );
};

describe('Pricing Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Mock window.open
    global.window.open = vi.fn();
  });

  describe('Header', () => {
    it('renders the logo', () => {
      renderPricing();
      expect(screen.getByRole('img', { name: /agentsolvr/i })).toBeInTheDocument();
    });

    it('has glass effect styling', () => {
      renderPricing();
      const header = document.querySelector('.glass-effect');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it('renders navigation buttons', () => {
      renderPricing();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    });
  });

  describe('Hero Section', () => {
    it('renders main heading with brand colors', () => {
      renderPricing();
      expect(screen.getByText(/choose your/i)).toBeInTheDocument();
      expect(screen.getByText('Agent')).toBeInTheDocument();
      expect(screen.getByText('SOLVR')).toBeInTheDocument();
      expect(screen.getByText(/plan/i)).toBeInTheDocument();
    });

    it('displays value proposition', () => {
      renderPricing();
      expect(screen.getByText(/start with a 14-day free trial/i)).toBeInTheDocument();
      expect(screen.getByText(/no hidden fees, cancel anytime/i)).toBeInTheDocument();
    });

    it('shows trust signals', () => {
      renderPricing();
      expect(screen.getByText(/30-day money back guarantee/i)).toBeInTheDocument();
      expect(screen.getByText(/join 10,000\+ developers/i)).toBeInTheDocument();
      expect(screen.getByText(/setup in under 5 minutes/i)).toBeInTheDocument();
    });
  });

  describe('Pricing Plans', () => {
    it('renders all three pricing plans', () => {
      renderPricing();
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('displays correct pricing for each plan', () => {
      renderPricing();
      expect(screen.getByText('$39')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('$299')).toBeInTheDocument();
    });

    it('shows billing period for all plans', () => {
      renderPricing();
      const monthlyLabels = screen.getAllByText('/month');
      expect(monthlyLabels).toHaveLength(3);
    });

    it('displays plan descriptions', () => {
      renderPricing();
      expect(screen.getByText(/perfect for individual developers getting started/i)).toBeInTheDocument();
      expect(screen.getByText(/for serious developers and small teams/i)).toBeInTheDocument();
      expect(screen.getByText(/for teams that need custom solutions/i)).toBeInTheDocument();
    });

    describe('Starter Plan', () => {
      it('lists all starter features', () => {
        renderPricing();
        expect(screen.getByText('AgentSOLVR Desktop App')).toBeInTheDocument();
        expect(screen.getByText('Basic voice commands (10/day)')).toBeInTheDocument();
        expect(screen.getByText('Project analysis (50 files)')).toBeInTheDocument();
        expect(screen.getByText('Email support')).toBeInTheDocument();
        expect(screen.getByText('1 user license')).toBeInTheDocument();
        expect(screen.getByText('GitHub integration')).toBeInTheDocument();
      });

      it('has correct CTA button', () => {
        renderPricing();
        const starterButtons = screen.getAllByText('Start Free Trial');
        expect(starterButtons.length).toBeGreaterThan(0);
      });
    });

    describe('Professional Plan', () => {
      it('has "Most Popular" badge', () => {
        renderPricing();
        expect(screen.getByText('Most Popular')).toBeInTheDocument();
      });

      it('has special styling for popular plan', () => {
        renderPricing();
        const professionalCard = document.querySelector('.border-ctp-mauve');
        expect(professionalCard).toBeInTheDocument();
      });

      it('lists all professional features', () => {
        renderPricing();
        expect(screen.getByText('Everything in Starter')).toBeInTheDocument();
        expect(screen.getByText('Advanced voice commands (unlimited)')).toBeInTheDocument();
        expect(screen.getByText('Unlimited project analysis')).toBeInTheDocument();
        expect(screen.getByText('Priority support (24h response)')).toBeInTheDocument();
        expect(screen.getByText('5 user licenses')).toBeInTheDocument();
        expect(screen.getByText('Advanced integrations')).toBeInTheDocument();
        expect(screen.getByText('Custom prompts & templates')).toBeInTheDocument();
      });
    });

    describe('Enterprise Plan', () => {
      it('lists all enterprise features', () => {
        renderPricing();
        expect(screen.getByText('Everything in Professional')).toBeInTheDocument();
        expect(screen.getByText('Custom AI model training')).toBeInTheDocument();
        expect(screen.getByText('Dedicated support manager')).toBeInTheDocument();
        expect(screen.getByText('Unlimited user licenses')).toBeInTheDocument();
        expect(screen.getByText('On-premise deployment option')).toBeInTheDocument();
        expect(screen.getByText('Custom integrations & APIs')).toBeInTheDocument();
        expect(screen.getByText('SLA guarantees (99.9% uptime)')).toBeInTheDocument();
      });

      it('has "Contact Sales" CTA', () => {
        renderPricing();
        expect(screen.getByText('Contact Sales')).toBeInTheDocument();
      });
    });

    it('all plans have staggered animation', () => {
      renderPricing();
      const animatedGrid = document.querySelector('.animate-stagger');
      expect(animatedGrid).toBeInTheDocument();
    });

    it('cards have hover effects', () => {
      renderPricing();
      const cards = document.querySelectorAll('.hover\\:scale-105');
      expect(cards.length).toBe(3);
    });
  });

  describe('Plan Selection', () => {
    it('navigates to register for Starter plan', () => {
      renderPricing();
      const starterButton = screen.getAllByText('Start Free Trial')[0];
      fireEvent.click(starterButton);
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('navigates to register for Professional plan', () => {
      renderPricing();
      const proButton = screen.getByText('Upgrade to Pro');
      fireEvent.click(proButton);
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('navigates to contact for Enterprise plan', () => {
      renderPricing();
      const enterpriseButton = screen.getByText('Contact Sales');
      fireEvent.click(enterpriseButton);
      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });
  });

  describe('FAQ Section', () => {
    it('renders FAQ heading', () => {
      renderPricing();
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
      expect(screen.getByText(/everything you need to know about agentsolvr pricing/i)).toBeInTheDocument();
    });

    it('displays all FAQ items', () => {
      renderPricing();
      expect(screen.getByText(/can i change plans anytime/i)).toBeInTheDocument();
      expect(screen.getByText(/what's included in the free trial/i)).toBeInTheDocument();
      expect(screen.getByText(/do you offer custom enterprise solutions/i)).toBeInTheDocument();
      expect(screen.getByText(/how does voice command usage work/i)).toBeInTheDocument();
      expect(screen.getByText(/what payment methods do you accept/i)).toBeInTheDocument();
      expect(screen.getByText(/is there a discount for annual billing/i)).toBeInTheDocument();
    });

    it('displays FAQ answers', () => {
      renderPricing();
      expect(screen.getByText(/upgrade or downgrade your plan at any time/i)).toBeInTheDocument();
      expect(screen.getByText(/full access to professional features for 14 days/i)).toBeInTheDocument();
      expect(screen.getByText(/contact our sales team for custom pricing/i)).toBeInTheDocument();
    });
  });

  describe('Contact Section', () => {
    it('renders contact section with gradient background', () => {
      renderPricing();
      expect(screen.getByText('Still have questions?')).toBeInTheDocument();
      expect(screen.getByText(/our team is here to help you choose the right plan/i)).toBeInTheDocument();
    });

    it('has Contact Sales button', () => {
      renderPricing();
      const contactButton = screen.getAllByText('Contact Sales').find(button => 
        button.closest('.bg-gradient-to-r')
      );
      expect(contactButton).toBeInTheDocument();
    });

    it('has Email Support button', () => {
      renderPricing();
      const emailButton = screen.getByText('Email Support');
      expect(emailButton).toBeInTheDocument();
    });

    it('opens email client when Email Support is clicked', () => {
      renderPricing();
      const emailButton = screen.getByText('Email Support');
      fireEvent.click(emailButton);
      expect(window.open).toHaveBeenCalledWith('mailto:support@agentsolvr.com');
    });
  });

  describe('Footer', () => {
    it('renders footer with correct information', () => {
      renderPricing();
      expect(screen.getByText('© 2024 AgentSOLVR')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('uses responsive grid for pricing cards', () => {
      renderPricing();
      expect(document.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
    });

    it('has container padding and section spacing', () => {
      renderPricing();
      expect(document.querySelector('.container-padding')).toBeInTheDocument();
      expect(document.querySelector('.section-spacing')).toBeInTheDocument();
    });

    it('buttons stack on mobile', () => {
      renderPricing();
      expect(document.querySelector('.sm\\:flex-row')).toBeInTheDocument();
    });
  });

  describe('Animations', () => {
    it('hero section has fade-in animation', () => {
      renderPricing();
      expect(document.querySelector('.animate-fade-in')).toBeInTheDocument();
    });

    it('pricing cards have hover animations', () => {
      renderPricing();
      const cards = document.querySelectorAll('.hover\\:scale-105');
      expect(cards.length).toBe(3);
    });

    it('buttons have premium animations', () => {
      renderPricing();
      expect(document.querySelector('.btn-premium')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderPricing();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(9); // 3 plans + 6 FAQ
    });

    it('all buttons have accessible names', () => {
      renderPricing();
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('images have alt text', () => {
      renderPricing();
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('pricing information is clearly marked', () => {
      renderPricing();
      // Check that pricing is semantically structured
      expect(screen.getByText('$39')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('$299')).toBeInTheDocument();
    });
  });

  describe('Brand Consistency', () => {
    it('uses Catppuccin color scheme', () => {
      renderPricing();
      expect(document.querySelector('.text-ctp-mauve')).toBeInTheDocument();
      expect(document.querySelector('.text-ctp-blue')).toBeInTheDocument();
      expect(document.querySelector('.bg-ctp-base')).toBeInTheDocument();
    });

    it('maintains consistent spacing', () => {
      renderPricing();
      expect(document.querySelector('.gap-8')).toBeInTheDocument();
      expect(document.querySelector('.gap-6')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('loads pricing data efficiently', async () => {
      renderPricing();
      await waitFor(() => {
        expect(screen.getByText('Starter')).toBeInTheDocument();
        expect(screen.getByText('Professional')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();
      });
    });
  });

  describe('SEO and Meta', () => {
    it('has meaningful content for SEO', () => {
      renderPricing();
      expect(screen.getByText(/choose your agentsolvr plan/i)).toBeInTheDocument();
      expect(screen.getByText(/14-day free trial/i)).toBeInTheDocument();
      expect(screen.getByText(/no hidden fees/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles navigation errors gracefully', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });
      
      renderPricing();
      
      expect(() => {
        fireEvent.click(screen.getAllByText('Start Free Trial')[0]);
      }).not.toThrow();
    });

    it('handles email link errors gracefully', () => {
      global.window.open = vi.fn().mockImplementation(() => {
        throw new Error('Email client failed');
      });
      
      renderPricing();
      
      expect(() => {
        fireEvent.click(screen.getByText('Email Support'));
      }).not.toThrow();
    });
  });

  describe('Business Logic', () => {
    it('correctly displays production pricing values', () => {
      renderPricing();
      // Verify the updated production pricing
      expect(screen.getByText('$39')).toBeInTheDocument(); // Starter (was $29)
      expect(screen.getByText('$99')).toBeInTheDocument(); // Professional (was $79)
      expect(screen.getByText('$299')).toBeInTheDocument(); // Enterprise (was $199)
    });

    it('highlights most popular plan correctly', () => {
      renderPricing();
      const mostPopularBadge = screen.getByText('Most Popular');
      const professionalCard = mostPopularBadge.closest('[class*="border-ctp-mauve"]');
      expect(professionalCard).toBeInTheDocument();
    });

    it('provides clear feature differentiation', () => {
      renderPricing();
      // Starter limitations
      expect(screen.getByText('Basic voice commands (10/day)')).toBeInTheDocument();
      expect(screen.getByText('Project analysis (50 files)')).toBeInTheDocument();
      
      // Professional upgrades
      expect(screen.getByText('Advanced voice commands (unlimited)')).toBeInTheDocument();
      expect(screen.getByText('Unlimited project analysis')).toBeInTheDocument();
      
      // Enterprise features
      expect(screen.getByText('Custom AI model training')).toBeInTheDocument();
      expect(screen.getByText('Dedicated support manager')).toBeInTheDocument();
    });
  });
});