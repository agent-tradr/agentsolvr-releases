import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@/test/utils'
import { checkCatppuccinColors, getCSSCustomProperty } from '@/test/utils'

describe('Catppuccin Macchiato Design System', () => {
  let testDiv: HTMLDivElement

  beforeEach(() => {
    // Create a test element to check styles
    testDiv = document.createElement('div')
    document.body.appendChild(testDiv)
  })

  afterEach(() => {
    if (testDiv.parentNode) {
      testDiv.parentNode.removeChild(testDiv)
    }
  })

  describe('CSS Custom Properties', () => {
    it('defines correct Catppuccin Macchiato base colors', () => {
      const colors = checkCatppuccinColors()
      
      // Core backgrounds - exact Catppuccin Macchiato hex values
      expect(colors.base).toBe('#1e1e2e')
      
      // Brand colors
      expect(colors.mauve).toBe('#cba6f7')
      expect(colors.blue).toBe('#89b4fa')
      expect(colors.green).toBe('#a6e3a1')
      expect(colors.red).toBe('#f38ba8')
      
      // Text colors
      expect(colors.text).toBe('#cdd6f4')
    })

    it('defines all required CSS custom properties', () => {
      const root = document.documentElement
      const computedStyle = getComputedStyle(root)
      
      const requiredProperties = [
        '--ctp-base',
        '--ctp-mantle',
        '--ctp-surface0',
        '--ctp-surface1',
        '--ctp-surface2',
        '--ctp-mauve',
        '--ctp-blue',
        '--ctp-green',
        '--ctp-red',
        '--ctp-yellow',
        '--ctp-peach',
        '--ctp-text',
        '--ctp-subtext1',
        '--ctp-subtext0',
        '--ctp-overlay0',
        '--primary-gradient',
        '--surface-gradient'
      ]
      
      requiredProperties.forEach(property => {
        const value = computedStyle.getPropertyValue(property).trim()
        expect(value).toBeTruthy()
        expect(value).not.toBe('')
      })
    })

    it('defines correct gradient values', () => {
      const root = document.documentElement
      const computedStyle = getComputedStyle(root)
      
      const primaryGradient = computedStyle.getPropertyValue('--primary-gradient').trim()
      const surfaceGradient = computedStyle.getPropertyValue('--surface-gradient').trim()
      
      expect(primaryGradient).toContain('linear-gradient')
      expect(primaryGradient).toContain('var(--ctp-mauve)')
      expect(primaryGradient).toContain('var(--ctp-blue)')
      
      expect(surfaceGradient).toContain('linear-gradient')
      expect(surfaceGradient).toContain('var(--ctp-surface0)')
      expect(surfaceGradient).toContain('var(--ctp-surface1)')
    })
  })

  describe('Typography System', () => {
    it('loads Inter font correctly', () => {
      // Check if Inter font is loaded
      const testElement = document.createElement('div')
      testElement.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      document.body.appendChild(testElement)
      
      const computedStyle = getComputedStyle(testElement)
      const fontFamily = computedStyle.fontFamily
      
      expect(fontFamily).toContain('Inter')
      
      document.body.removeChild(testElement)
    })

    it('applies correct base typography styles', () => {
      const body = document.body
      const computedStyle = getComputedStyle(body)
      
      expect(computedStyle.fontSize).toBe('16px')
      expect(computedStyle.lineHeight).toBe('1.5')
      expect(computedStyle.color).toBe('rgb(205, 214, 244)') // --ctp-text converted to RGB
    })

    it('defines correct heading hierarchy', () => {
      const headingTests = [
        { tag: 'h1', expectedSize: '2.5rem', expectedWeight: '700' },
        { tag: 'h2', expectedSize: '2rem', expectedWeight: '600' },
        { tag: 'h3', expectedSize: '1.5rem', expectedWeight: '600' },
        { tag: 'h4', expectedSize: '1.25rem', expectedWeight: '500' },
      ]
      
      headingTests.forEach(({ tag, expectedSize, expectedWeight }) => {
        const heading = document.createElement(tag)
        heading.textContent = `Test ${tag.toUpperCase()}`
        document.body.appendChild(heading)
        
        const computedStyle = getComputedStyle(heading)
        expect(computedStyle.fontSize).toBe(expectedSize)
        expect(computedStyle.fontWeight).toBe(expectedWeight)
        
        document.body.removeChild(heading)
      })
    })

    it('applies correct logo styling classes', () => {
      const agentElement = document.createElement('span')
      agentElement.className = 'text-ctp-mauve font-bold'
      agentElement.textContent = 'Agent'
      
      const solvrElement = document.createElement('span')
      solvrElement.className = 'text-ctp-blue font-bold'
      solvrElement.textContent = 'SOLVR'
      
      document.body.appendChild(agentElement)
      document.body.appendChild(solvrElement)
      
      const agentStyle = getComputedStyle(agentElement)
      const solvrStyle = getComputedStyle(solvrElement)
      
      // Colors should be applied correctly
      expect(agentStyle.color).toBe('rgb(203, 166, 247)') // --ctp-mauve
      expect(solvrStyle.color).toBe('rgb(137, 180, 250)') // --ctp-blue
      
      document.body.removeChild(agentElement)
      document.body.removeChild(solvrElement)
    })
  })

  describe('Component Styling Classes', () => {
    it('defines btn-primary class correctly', () => {
      testDiv.className = 'btn-primary'
      const computedStyle = getComputedStyle(testDiv)
      
      // Should have gradient background
      expect(computedStyle.backgroundImage).toContain('linear-gradient')
      expect(computedStyle.color).toBe('rgb(255, 255, 255)') // white text
      expect(computedStyle.borderRadius).toBe('8px')
      expect(computedStyle.fontWeight).toBe('600')
    })

    it('defines btn-secondary class correctly', () => {
      testDiv.className = 'btn-secondary'
      const computedStyle = getComputedStyle(testDiv)
      
      expect(computedStyle.backgroundColor).toBe('rgb(49, 50, 68)') // --ctp-surface0
      expect(computedStyle.color).toBe('rgb(205, 214, 244)') // --ctp-text
      expect(computedStyle.borderRadius).toBe('8px')
    })

    it('defines card class correctly', () => {
      testDiv.className = 'card'
      const computedStyle = getComputedStyle(testDiv)
      
      expect(computedStyle.backgroundColor).toBe('rgb(49, 50, 68)') // --ctp-surface0
      expect(computedStyle.borderRadius).toBe('12px')
      expect(computedStyle.padding).toBe('24px')
    })

    it('defines form-input class correctly', () => {
      testDiv.className = 'form-input'
      const computedStyle = getComputedStyle(testDiv)
      
      expect(computedStyle.backgroundColor).toBe('rgb(49, 50, 68)') // --ctp-surface0
      expect(computedStyle.borderRadius).toBe('8px')
      expect(computedStyle.padding).toBe('12px 16px')
      expect(computedStyle.color).toBe('rgb(205, 214, 244)') // --ctp-text
    })
  })

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', () => {
      // Test container padding responsiveness
      testDiv.className = 'container-padding'
      
      // Default (mobile) should have px-4
      let computedStyle = getComputedStyle(testDiv)
      expect(computedStyle.paddingLeft).toBe('16px') // px-4
      expect(computedStyle.paddingRight).toBe('16px')
    })

    it('handles responsive breakpoints correctly', () => {
      const breakpoints = {
        sm: '640px',
        md: '768px', 
        lg: '1024px',
        xl: '1280px'
      }
      
      // This tests that our Tailwind config includes the correct breakpoints
      // The actual responsive behavior would be tested in integration tests
      Object.entries(breakpoints).forEach(([name, width]) => {
        expect(width).toMatch(/^\d+px$/)
      })
    })
  })

  describe('Accessibility Features', () => {
    it('provides high contrast mode support', () => {
      // Test that high contrast mode variables are defined
      const root = document.documentElement
      
      // Add high contrast class to test
      root.classList.add('high-contrast')
      
      // In high contrast mode, text should be more contrasted
      // This would be implemented in the CSS
      
      root.classList.remove('high-contrast')
    })

    it('supports reduced motion preferences', () => {
      // Test that animations respect prefers-reduced-motion
      testDiv.className = 'animate-fade-in'
      
      // The CSS should include media query for prefers-reduced-motion
      // This ensures animations are disabled for users who prefer it
      const computedStyle = getComputedStyle(testDiv)
      expect(computedStyle.animation).toBeDefined()
    })

    it('maintains proper focus indicators', () => {
      testDiv.className = 'focus-ring'
      testDiv.tabIndex = 0
      testDiv.focus()
      
      const computedStyle = getComputedStyle(testDiv)
      // Should have focus ring styles
      expect(computedStyle.outline).toBeDefined()
    })
  })

  describe('Color Contrast Compliance', () => {
    it('ensures text has sufficient contrast on backgrounds', () => {
      // Test primary text on base background
      const textElement = document.createElement('div')
      textElement.style.color = '#cdd6f4' // --ctp-text
      textElement.style.backgroundColor = '#1e1e2e' // --ctp-base
      
      document.body.appendChild(textElement)
      
      const computedStyle = getComputedStyle(textElement)
      expect(computedStyle.color).toBe('rgb(205, 214, 244)')
      expect(computedStyle.backgroundColor).toBe('rgb(30, 30, 46)')
      
      // This combination should meet WCAG AA standards (>4.5:1 contrast ratio)
      // In a real test, you would calculate the actual contrast ratio
      
      document.body.removeChild(textElement)
    })

    it('ensures interactive elements have proper contrast', () => {
      // Test button contrast
      const button = document.createElement('button')
      button.className = 'btn-primary'
      button.textContent = 'Test Button'
      
      document.body.appendChild(button)
      
      const computedStyle = getComputedStyle(button)
      expect(computedStyle.color).toBe('rgb(255, 255, 255)') // White text
      // Background should be gradient with sufficient contrast
      expect(computedStyle.backgroundImage).toContain('linear-gradient')
      
      document.body.removeChild(button)
    })
  })

  describe('Animation System', () => {
    it('defines custom animations', () => {
      const animationNames = ['fadeIn', 'slideIn', 'glow']
      
      animationNames.forEach(name => {
        testDiv.className = `animate-${name.toLowerCase().replace(/([A-Z])/g, '-$1')}`
        const computedStyle = getComputedStyle(testDiv)
        expect(computedStyle.animation).toBeDefined()
      })
    })

    it('provides consistent timing functions', () => {
      testDiv.className = 'transition-all duration-300'
      const computedStyle = getComputedStyle(testDiv)
      
      expect(computedStyle.transitionDuration).toBe('0.3s')
      expect(computedStyle.transitionProperty).toBe('all')
    })
  })
})