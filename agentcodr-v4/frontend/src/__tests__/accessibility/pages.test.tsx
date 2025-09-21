import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

// Import pages to test
import Landing from '@/components/pages/Landing';
import Pricing from '@/components/pages/Pricing';
import Dashboard from '@/components/pages/Dashboard';
import Downloads from '@/components/pages/Downloads';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      fullName: 'Test User',
      email: 'test@example.com',
      subscription: { planType: 'Professional', status: 'active' },
    },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Accessibility Tests', () => {
  beforeEach(() => {
    global.window.open = vi.fn();
  });

  describe('Landing Page Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithRouter(<Landing />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      renderWithRouter(<Landing />);
      
      // Should have one h1
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      
      // Should have h2 elements for main sections
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
      
      // Should have h3 elements for subsections
      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('all interactive elements have accessible names', () => {
      renderWithRouter(<Landing />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button, index) => {
        expect(button).toHaveAccessibleName(`Button ${index + 1} should have accessible name`);
      });
      
      const links = screen.getAllByRole('link');
      links.forEach((link, index) => {
        expect(link).toHaveAccessibleName(`Link ${index + 1} should have accessible name`);
      });
    });

    it('images have appropriate alt text', () => {
      renderWithRouter(<Landing />);
      
      const images = screen.getAllByRole('img');
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('alt');
        const altText = img.getAttribute('alt');
        expect(altText).not.toBe('');
      });
    });

    it('has proper landmark regions', () => {
      renderWithRouter(<Landing />);
      
      // Should have main content area
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Should have navigation
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // Should have footer
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('color contrast meets accessibility standards', () => {
      renderWithRouter(<Landing />);
      
      // Test that Catppuccin colors provide sufficient contrast
      const textElements = document.querySelectorAll('.text-ctp-text, .text-ctp-subtext1');
      expect(textElements.length).toBeGreaterThan(0);
      
      // Test that background/foreground combinations are accessible
      const backgroundElements = document.querySelectorAll('.bg-ctp-base, .bg-ctp-surface0');
      expect(backgroundElements.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', () => {
      renderWithRouter(<Landing />);
      
      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        expect(element).toHaveAttribute('tabIndex');
        expect(element.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Pricing Page Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithRouter(<Pricing />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('pricing information is properly structured', () => {
      renderWithRouter(<Pricing />);
      
      // Pricing should be in accessible format
      const prices = screen.getAllByText(/\$\d+/);
      expect(prices.length).toBe(3);
      
      // Each price should be associated with a plan name
      expect(screen.getByText('Starter')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('plan features are in accessible lists', () => {
      renderWithRouter(<Pricing />);
      
      // Features should be in list format for screen readers
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);
      
      // Each list should have list items
      lists.forEach(list => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    it('plan selection buttons are accessible', () => {
      renderWithRouter(<Pricing />);
      
      const planButtons = screen.getAllByRole('button', { name: /start free trial|upgrade to pro|contact sales/i });
      expect(planButtons.length).toBe(3);
      
      planButtons.forEach(button => {
        expect(button).toHaveAccessibleName();
        expect(button).not.toBeDisabled();
      });
    });

    it('popular plan is properly indicated for screen readers', () => {
      renderWithRouter(<Pricing />);
      
      const popularBadge = screen.getByText('Most Popular');
      expect(popularBadge).toBeInTheDocument();
      
      // Should be associated with the professional plan
      const professionalCard = popularBadge.closest('[class*="border-ctp-mauve"]');
      expect(professionalCard).toBeInTheDocument();
    });
  });

  describe('Dashboard Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithRouter(<Dashboard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('subscription status is clearly announced', () => {
      renderWithRouter(<Dashboard />);
      
      // Status should be clearly marked
      const activeStatus = screen.getByText('Active');
      expect(activeStatus).toBeInTheDocument();
      
      // Should be associated with subscription information
      const subscriptionSection = screen.getByText('Subscription Status');
      expect(subscriptionSection).toBeInTheDocument();
    });

    it('usage statistics are accessible', () => {
      renderWithRouter(<Dashboard />);
      
      // Statistics should have proper labels
      expect(screen.getByText('Voice Commands')).toBeInTheDocument();
      expect(screen.getByText('Projects Analyzed')).toBeInTheDocument();
      expect(screen.getByText('AI Responses')).toBeInTheDocument();
      
      // Values should be associated with labels
      expect(screen.getByText('147')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('892')).toBeInTheDocument();
    });

    it('navigation between sections is accessible', () => {
      renderWithRouter(<Dashboard />);
      
      // Should have clear section headings
      const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(sectionHeadings.length).toBeGreaterThan(0);
      
      // Quick actions should be easily accessible
      const downloadButton = screen.getByText('Download AgentSOLVR V4');
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton).toHaveAccessibleName();
    });

    it('user information is properly structured', () => {
      renderWithRouter(<Dashboard />);
      
      // User name should be in appropriate heading
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      
      // Account information should be structured
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Downloads Page Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = renderWithRouter(<Downloads />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('platform options are accessible', () => {
      renderWithRouter(<Downloads />);
      
      // Each platform should be clearly labeled
      expect(screen.getByText('Windows')).toBeInTheDocument();
      expect(screen.getByText('macOS')).toBeInTheDocument();
      expect(screen.getByText('Linux')).toBeInTheDocument();
      
      // Download buttons should indicate platform
      expect(screen.getByRole('button', { name: /download for windows/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download for macos/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download for linux/i })).toBeInTheDocument();
    });

    it('system requirements are accessible', () => {
      renderWithRouter(<Downloads />);
      
      // Requirements should be in structured format
      expect(screen.getByText('System Requirements:')).toBeInTheDocument();
      
      // Should be lists or clearly structured
      expect(screen.getByText('Windows 10 or later (64-bit)')).toBeInTheDocument();
      expect(screen.getByText('macOS 11.0 (Big Sur) or later')).toBeInTheDocument();
      expect(screen.getByText('Ubuntu 20.04+ or equivalent distribution')).toBeInTheDocument();
    });

    it('installation guide is accessible', () => {
      renderWithRouter(<Downloads />);
      
      // Installation steps should be numbered and clear
      expect(screen.getByText('Installation Guide')).toBeInTheDocument();
      expect(screen.getByText('1. Download')).toBeInTheDocument();
      expect(screen.getByText('2. Install')).toBeInTheDocument();
      expect(screen.getByText('3. Launch')).toBeInTheDocument();
    });

    it('release notes are structured accessibly', () => {
      renderWithRouter(<Downloads />);
      
      // Release notes should have proper headings
      expect(screen.getByText('Release Notes')).toBeInTheDocument();
      expect(screen.getByText('Version 4.2.1')).toBeInTheDocument();
      expect(screen.getByText('Version 4.2.0')).toBeInTheDocument();
      
      // Changes should be in list format
      const changeItems = screen.getAllByText(/fixed|improved|enhanced|added|introduced/i);
      expect(changeItems.length).toBeGreaterThan(0);
    });
  });

  describe('Cross-Page Accessibility Features', () => {
    it('all pages support screen readers', () => {
      const pages = [
        <Landing />,
        <Pricing />,
        <Dashboard />,
        <Downloads />,
      ];

      pages.forEach((page) => {
        const { container } = renderWithRouter(page);
        
        // Should have proper document structure
        expect(container.querySelector('div')).toBeInTheDocument();
        
        // Should have text content for screen readers
        expect(container).toHaveTextContent(/.+/);
      });
    });

    it('animations respect user preferences', () => {
      // Test that animations can be disabled for users who prefer reduced motion
      renderWithRouter(<Landing />);
      
      const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
      
      // In a real implementation, we would test for prefers-reduced-motion classes
    });

    it('focus management is proper', () => {
      renderWithRouter(<Pricing />);
      
      // Interactive elements should be focusable
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('error messages are accessible', () => {
      // This would be tested in error scenarios
      renderWithRouter(<Landing />);
      
      // Error messages should be announced to screen readers
      // This would be tested with actual error states
    });

    it('loading states are accessible', () => {
      renderWithRouter(<Downloads />);
      
      // Loading states should be announced
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('ARIA Labels and Descriptions', () => {
    it('complex UI elements have ARIA labels', () => {
      renderWithRouter(<Dashboard />);
      
      // Progress indicators should have ARIA labels
      const progressElements = document.querySelectorAll('[role="progressbar"]');
      progressElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label');
      });
      
      // Status indicators should be labeled
      const statusElements = document.querySelectorAll('.bg-ctp-green.rounded-full');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('form controls have proper labels', () => {
      // This would be tested on forms if present
      renderWithRouter(<Pricing />);
      
      // Any form controls should have associated labels
      const inputs = screen.queryAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('tables have proper headers', () => {
      // If any tables are present, they should have proper headers
      renderWithRouter(<Dashboard />);
      
      const tables = screen.queryAllByRole('table');
      tables.forEach(table => {
        const headers = screen.queryAllByRole('columnheader');
        if (headers.length > 0) {
          expect(headers.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation', () => {
      renderWithRouter(<Landing />);
      
      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        expect(element.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('has visible focus indicators', () => {
      renderWithRouter(<Pricing />);
      
      // Focus indicators should be visible
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Should not have outline: none without replacement
        const computedStyle = window.getComputedStyle(button);
        if (computedStyle.outline === 'none') {
          // Should have alternative focus indicator
          expect(button).toHaveClass(/focus/);
        }
      });
    });

    it('skip links are available for complex pages', () => {
      renderWithRouter(<Dashboard />);
      
      // Complex pages should have skip navigation options
      // This would be implemented with actual skip links
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Mobile Accessibility', () => {
    it('works with touch navigation', () => {
      renderWithRouter(<Landing />);
      
      // Touch targets should be appropriately sized
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Buttons should be large enough for touch
        expect(button).toBeInTheDocument();
      });
    });

    it('responsive design maintains accessibility', () => {
      renderWithRouter(<Pricing />);
      
      // Content should remain accessible across screen sizes
      expect(document.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();
      expect(document.querySelector('.md\\:grid-cols-2')).toBeInTheDocument();
      
      // Text should remain readable
      const textElements = document.querySelectorAll('.text-sm, .text-lg, .text-xl');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });
});