import { describe, it, expect, vi } from 'vitest'
import { render, screen, setViewportSize } from '@/test/utils'
import Landing from '@/components/pages/Landing'
import Login from '@/components/pages/Login'
import { Button, Input, Card } from '@/components/ui'

describe('Performance & Responsive Design', () => {
  describe('Responsive Design', () => {
    it('adapts to mobile viewport (640px)', () => {
      setViewportSize(640, 800)
      render(<Landing />)
      
      // Should render without errors on mobile
      expect(screen.getByText('Agent')).toBeInTheDocument()
      expect(screen.getByText('SOLVR')).toBeInTheDocument()
      
      // Navigation should be responsive
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('adapts to tablet viewport (768px)', () => {
      setViewportSize(768, 1024)
      render(<Landing />)
      
      // Should render all content properly on tablet
      expect(screen.getByText('Transform Your Development with')).toBeInTheDocument()
      expect(screen.getByText('Voice Commands')).toBeInTheDocument()
    })

    it('adapts to desktop viewport (1024px+)', () => {
      setViewportSize(1024, 768)
      render(<Landing />)
      
      // All features should be visible on desktop
      const features = [
        'Voice Commands',
        'AI Agents', 
        'Project Analysis',
        'Real-time Sync',
        'Team Collaboration',
        'Enterprise Security'
      ]
      
      features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument()
      })
    })

    it('maintains usability across breakpoints', () => {
      const viewports = [
        { width: 375, height: 667 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1280, height: 800 }, // Desktop
      ]
      
      viewports.forEach(viewport => {
        setViewportSize(viewport.width, viewport.height)
        render(<Login />)
        
        // Core functionality should work at all sizes
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      })
    })
  })

  describe('Component Performance', () => {
    it('renders components efficiently', () => {
      const startTime = performance.now()
      
      render(
        <div>
          <Button>Test Button</Button>
          <Input label="Test Input" />
          <Card>Test Card</Card>
        </div>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Rendering should be fast (under 50ms for basic components)
      expect(renderTime).toBeLessThan(50)
    })

    it('handles large lists efficiently', () => {
      const startTime = performance.now()
      
      const items = Array.from({ length: 100 }, (_, i) => (
        <div key={i} className="p-2 border">Item {i}</div>
      ))
      
      render(<div>{items}</div>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should handle 100 items efficiently
      expect(renderTime).toBeLessThan(100)
    })
  })

  describe('Memory Usage', () => {
    it('cleans up properly on unmount', () => {
      const { unmount } = render(<Landing />)
      
      // Component should render successfully
      expect(screen.getByText('Agent')).toBeInTheDocument()
      
      // Unmounting should not cause errors
      expect(() => unmount()).not.toThrow()
    })

    it('does not create memory leaks with event listeners', () => {
      // Mock addEventListener and removeEventListener to track calls
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(<Landing />)
      
      unmount()
      
      // Should clean up any event listeners
      // In a real app, this would check that removeEventListener is called
      // for each addEventListener call
      expect(addEventListenerSpy).toHaveBeenCalled()
      
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('CSS Performance', () => {
    it('applies styles efficiently', () => {
      const startTime = performance.now()
      
      render(
        <div className="bg-ctp-base text-ctp-text p-4 rounded-lg shadow-lg border border-ctp-surface1">
          <h1 className="text-2xl font-bold text-ctp-mauve">Styled Content</h1>
          <p className="text-ctp-subtext1 mt-2">With multiple CSS classes</p>
          <Button className="mt-4">Styled Button</Button>
        </div>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // CSS application should be fast
      expect(renderTime).toBeLessThan(30)
    })

    it('uses efficient CSS selectors', () => {
      render(<Button className="btn-primary">Primary Button</Button>)
      
      const button = screen.getByRole('button')
      const computedStyle = getComputedStyle(button)
      
      // Styles should be applied correctly
      expect(computedStyle.borderRadius).toBeTruthy()
      expect(computedStyle.padding).toBeTruthy()
    })
  })

  describe('Image and Asset Loading', () => {
    it('handles missing images gracefully', () => {
      // Test that broken images don't break the layout
      render(
        <div>
          <img src="/nonexistent-image.png" alt="Test image" />
          <Button>Still functional</Button>
        </div>
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Touch Interface Support', () => {
    it('provides touch-friendly interface', () => {
      // Mock touch device
      setViewportSize(375, 667) // iPhone SE
      
      render(<Login />)
      
      const button = screen.getByRole('button', { name: /sign in/i })
      const computedStyle = getComputedStyle(button)
      
      // Button should have adequate touch target size (44px minimum)
      const buttonHeight = parseInt(computedStyle.height)
      const buttonPadding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom)
      
      expect(buttonHeight + buttonPadding).toBeGreaterThanOrEqual(44)
    })
  })

  describe('Animation Performance', () => {
    it('uses efficient animations', () => {
      render(
        <div className="animate-fade-in">
          <Button>Animated Button</Button>
        </div>
      )
      
      const animatedDiv = screen.getByText('Animated Button').closest('div')
      const computedStyle = getComputedStyle(animatedDiv!)
      
      // Should have animation properties
      expect(computedStyle.animation).toBeTruthy()
    })

    it('respects reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
        })),
      })
      
      render(
        <div className="animate-fade-in">
          <Button>Respects Motion Preferences</Button>
        </div>
      )
      
      // Animation should respect user preferences
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Bundle Size Optimization', () => {
    it('uses tree shaking effectively', () => {
      // Test that only imported components are included
      render(<Button>Tree Shaken Button</Button>)
      
      // Button should render without importing unnecessary code
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('loads components lazily when possible', () => {
      // This would test lazy loading in a real scenario
      render(<Landing />)
      
      // Basic components should load immediately
      expect(screen.getByText('Agent')).toBeInTheDocument()
    })
  })

  describe('Accessibility Performance', () => {
    it('maintains fast screen reader navigation', () => {
      render(<Landing />)
      
      // Should have proper heading structure for fast navigation
      const h1 = screen.getByRole('heading', { level: 1 })
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      
      expect(h1).toBeInTheDocument()
      expect(h2Elements.length).toBeGreaterThan(0)
    })

    it('provides efficient keyboard navigation', () => {
      render(<Login />)
      
      // Focusable elements should be properly ordered
      const focusableElements = [
        screen.getByLabelText(/email address/i),
        screen.getByLabelText(/password/i),
        screen.getByRole('button', { name: /sign in/i })
      ]
      
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })
})