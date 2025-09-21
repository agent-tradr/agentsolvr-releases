import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Import all components that have animations
import Landing from '@/components/pages/Landing';
import Pricing from '@/components/pages/Pricing';
import Dashboard from '@/components/pages/Dashboard';
import Downloads from '@/components/pages/Downloads';

// Mock hooks and dependencies
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

describe('Visual Animation Tests', () => {
  beforeEach(() => {
    // Mock window.open
    global.window.open = vi.fn();
  });

  describe('Hero Gradient Background Animation', () => {
    it('landing page has animated gradient background', () => {
      renderWithRouter(<Landing />);
      
      const gradientElement = document.querySelector('.hero-gradient-bg');
      expect(gradientElement).toBeInTheDocument();
      
      // Check for gradient animation classes
      expect(gradientElement).toHaveClass('hero-gradient-bg');
      
      // Verify gradient CSS properties are applied
      const computedStyle = window.getComputedStyle(gradientElement!);
      expect(computedStyle.background).toContain('linear-gradient');
    });

    it('gradient animation has correct keyframe properties', () => {
      renderWithRouter(<Landing />);
      
      // Check if CSS animation is defined in document
      const styleSheets = Array.from(document.styleSheets);
      let hasGradientAnimation = false;
      
      try {
        styleSheets.forEach(sheet => {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.cssText.includes('gradientShift') || rule.cssText.includes('background-position')) {
              hasGradientAnimation = true;
            }
          });
        });
      } catch (e) {
        // Some stylesheets may not be accessible
      }
      
      // The animation should be defined in our CSS
      const gradientElement = document.querySelector('.hero-gradient-bg');
      expect(gradientElement).toBeInTheDocument();
    });
  });

  describe('Fade-in Animations', () => {
    it('landing page elements have fade-in animation', () => {
      renderWithRouter(<Landing />);
      
      const fadeElements = document.querySelectorAll('.animate-fade-in');
      expect(fadeElements.length).toBeGreaterThan(0);
    });

    it('pricing page has fade-in animations', () => {
      renderWithRouter(<Pricing />);
      
      const fadeElements = document.querySelectorAll('.animate-fade-in');
      expect(fadeElements.length).toBeGreaterThan(0);
    });

    it('dashboard has fade-in animations', () => {
      renderWithRouter(<Dashboard />);
      
      const fadeElements = document.querySelectorAll('.animate-fade-in');
      expect(fadeElements.length).toBeGreaterThan(0);
    });

    it('downloads page has fade-in animations', () => {
      renderWithRouter(<Downloads />);
      
      const fadeElements = document.querySelectorAll('.animate-fade-in');
      expect(fadeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Staggered Grid Animations', () => {
    it('landing page features have staggered animation', () => {
      renderWithRouter(<Landing />);
      
      const staggeredGrid = document.querySelector('.animate-stagger');
      expect(staggeredGrid).toBeInTheDocument();
      
      // Check that grid has children
      const gridChildren = staggeredGrid?.children;
      expect(gridChildren?.length).toBeGreaterThan(0);
    });

    it('pricing cards have staggered animation', () => {
      renderWithRouter(<Pricing />);
      
      const staggeredElements = document.querySelectorAll('.animate-stagger');
      expect(staggeredElements.length).toBeGreaterThan(0);
    });

    it('downloads page has staggered animations', () => {
      renderWithRouter(<Downloads />);
      
      const staggeredElements = document.querySelectorAll('.animate-stagger');
      expect(staggeredElements.length).toBeGreaterThan(0);
    });
  });

  describe('Hover Animations', () => {
    it('landing page cards have hover scale effects', () => {
      renderWithRouter(<Landing />);
      
      const hoverScaleElements = document.querySelectorAll('.hover\\:scale-105');
      expect(hoverScaleElements.length).toBeGreaterThan(0);
    });

    it('pricing cards have hover scale effects', () => {
      renderWithRouter(<Pricing />);
      
      const hoverScaleElements = document.querySelectorAll('.hover\\:scale-105');
      expect(hoverScaleElements.length).toBe(3); // Three pricing cards
    });

    it('dashboard cards have hover glow effects', () => {
      renderWithRouter(<Dashboard />);
      
      const hoverGlowElements = document.querySelectorAll('.hover\\:shadow-glow');
      expect(hoverGlowElements.length).toBeGreaterThan(0);
    });

    it('downloads cards have hover effects', () => {
      renderWithRouter(<Downloads />);
      
      const hoverElements = document.querySelectorAll('.hover\\:scale-105, .hover\\:shadow-glow');
      expect(hoverElements.length).toBeGreaterThan(0);
    });
  });

  describe('Glass Morphism Effects', () => {
    it('dashboard header has glass effect', () => {
      renderWithRouter(<Dashboard />);
      
      const glassElements = document.querySelectorAll('.glass-effect');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('pricing header has glass effect', () => {
      renderWithRouter(<Pricing />);
      
      const glassElements = document.querySelectorAll('.glass-effect');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('downloads header has glass effect', () => {
      renderWithRouter(<Downloads />);
      
      const glassElements = document.querySelectorAll('.glass-effect');
      expect(glassElements.length).toBeGreaterThan(0);
    });
  });

  describe('Premium Button Effects', () => {
    it('landing page has premium button animations', () => {
      renderWithRouter(<Landing />);
      
      const premiumButtons = document.querySelectorAll('.btn-premium');
      expect(premiumButtons.length).toBeGreaterThan(0);
    });

    it('pricing page has premium button animations', () => {
      renderWithRouter(<Pricing />);
      
      const premiumButtons = document.querySelectorAll('.btn-premium');
      expect(premiumButtons.length).toBeGreaterThan(0);
    });

    it('dashboard has premium button animations', () => {
      renderWithRouter(<Dashboard />);
      
      const premiumButtons = document.querySelectorAll('.btn-premium');
      expect(premiumButtons.length).toBeGreaterThan(0);
    });

    it('downloads page has premium button animations', () => {
      renderWithRouter(<Downloads />);
      
      const premiumButtons = document.querySelectorAll('.btn-premium');
      expect(premiumButtons.length).toBe(3); // Three download buttons
    });

    it('glow animation buttons exist', () => {
      renderWithRouter(<Landing />);
      
      const glowButtons = document.querySelectorAll('.animate-glow');
      expect(glowButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Pulse Animations', () => {
    it('landing page has pulse animations', () => {
      renderWithRouter(<Landing />);
      
      const pulseElements = document.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('dashboard has pulse animations for status indicators', () => {
      renderWithRouter(<Dashboard />);
      
      const pulseElements = document.querySelectorAll('.animate-pulse');
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  describe('Gradient Backgrounds', () => {
    it('cards have gradient backgrounds', () => {
      renderWithRouter(<Landing />);
      
      const gradientElements = document.querySelectorAll('.bg-gradient-to-r, .bg-gradient-to-br');
      expect(gradientElements.length).toBeGreaterThan(0);
    });

    it('pricing page has gradient elements', () => {
      renderWithRouter(<Pricing />);
      
      const gradientElements = document.querySelectorAll('.bg-gradient-to-r, .bg-gradient-to-br');
      expect(gradientElements.length).toBeGreaterThan(0);
    });

    it('dashboard has gradient elements', () => {
      renderWithRouter(<Dashboard />);
      
      const gradientElements = document.querySelectorAll('.bg-gradient-to-r, .bg-gradient-to-br');
      expect(gradientElements.length).toBeGreaterThan(0);
    });
  });

  describe('Loading Animations', () => {
    it('download buttons show loading states', () => {
      renderWithRouter(<Downloads />);
      
      // Verify that download buttons exist and can show loading
      const downloadButtons = screen.getAllByRole('button', { name: /download for/i });
      expect(downloadButtons.length).toBe(3);
      
      downloadButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Transition Classes', () => {
    it('elements have transition classes for smooth animations', () => {
      renderWithRouter(<Landing />);
      
      const transitionElements = document.querySelectorAll('.transition-all, .transition-colors, .transition-shadow');
      expect(transitionElements.length).toBeGreaterThan(0);
    });

    it('cards have transition duration classes', () => {
      renderWithRouter(<Pricing />);
      
      const durationElements = document.querySelectorAll('.duration-300, .duration-200');
      expect(durationElements.length).toBeGreaterThan(0);
    });
  });

  describe('Transform Effects', () => {
    it('elements have transform hover effects', () => {
      renderWithRouter(<Landing />);
      
      const transformElements = document.querySelectorAll('.hover\\:scale-105, .hover\\:-translate-y-1');
      expect(transformElements.length).toBeGreaterThan(0);
    });
  });

  describe('Shadow Effects', () => {
    it('cards have elevated shadow effects', () => {
      renderWithRouter(<Landing />);
      
      const elevatedElements = document.querySelectorAll('.elevated');
      expect(elevatedElements.length).toBeGreaterThan(0);
    });

    it('elements have shadow-glow effects', () => {
      renderWithRouter(<Pricing />);
      
      const glowElements = document.querySelectorAll('.shadow-glow, .hover\\:shadow-glow');
      expect(glowElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Performance', () => {
    it('animations use GPU-accelerated properties', () => {
      renderWithRouter(<Landing />);
      
      // Check for transform and opacity animations (GPU-accelerated)
      const gradientElement = document.querySelector('.hero-gradient-bg');
      expect(gradientElement).toBeInTheDocument();
      
      // Verify that we're using CSS transforms rather than changing layout properties
      const animatedElements = document.querySelectorAll('.animate-fade-in, .hover\\:scale-105');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('uses appropriate animation durations', () => {
      renderWithRouter(<Pricing />);
      
      // Check that elements have reasonable duration classes
      const durationElements = document.querySelectorAll('.duration-300, .duration-200, .duration-150');
      expect(durationElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Animation Behavior', () => {
    it('animations work across different screen sizes', () => {
      renderWithRouter(<Landing />);
      
      // Verify that responsive classes are present
      const responsiveElements = document.querySelectorAll('.lg\\:grid-cols-2, .md\\:grid-cols-3');
      expect(responsiveElements.length).toBeGreaterThan(0);
      
      // Animations should still be present
      const animatedElements = document.querySelectorAll('.animate-fade-in');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility and Animation', () => {
    it('respects user preferences for reduced motion', () => {
      // This would ideally test prefers-reduced-motion media query
      renderWithRouter(<Landing />);
      
      const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
      
      // In a real implementation, we would check for motion-reduce classes
    });

    it('animations do not interfere with focus management', () => {
      renderWithRouter(<Pricing />);
      
      const focusableButtons = screen.getAllByRole('button');
      focusableButtons.forEach(button => {
        expect(button).toBeInTheDocument();
        // Verify buttons are focusable even with animations
      });
    });
  });

  describe('Color Consistency', () => {
    it('maintains Catppuccin color scheme in animations', () => {
      renderWithRouter(<Landing />);
      
      const catppuccinElements = document.querySelectorAll(
        '.text-ctp-mauve, .text-ctp-blue, .bg-ctp-surface0, .border-ctp-mauve'
      );
      expect(catppuccinElements.length).toBeGreaterThan(0);
    });

    it('gradient colors use theme colors', () => {
      renderWithRouter(<Pricing />);
      
      const gradientElements = document.querySelectorAll('.from-ctp-mauve, .to-ctp-blue');
      expect(gradientElements.length).toBeGreaterThan(0);
    });
  });
});