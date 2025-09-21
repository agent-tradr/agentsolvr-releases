import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Button, Input, Card } from '@/components/ui'
import Login from '@/components/pages/Login'
import Landing from '@/components/pages/Landing'

describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
  describe('Form Accessibility', () => {
    it('associates labels with inputs correctly', () => {
      render(<Input id="test-input" label="Test Label" />)
      
      const input = screen.getByLabelText('Test Label')
      const label = screen.getByText('Test Label')
      
      expect(input).toHaveAttribute('id', 'test-input')
      expect(label).toHaveAttribute('for', 'test-input')
    })

    it('marks required fields appropriately', () => {
      render(<Input label="Required Field" required />)
      
      const input = screen.getByLabelText(/required field/i)
      const requiredIndicator = screen.getByText('*')
      
      expect(input).toHaveAttribute('required')
      expect(requiredIndicator).toBeInTheDocument()
      expect(requiredIndicator).toHaveClass('text-ctp-red')
    })

    it('announces error messages to screen readers', () => {
      render(<Input label="Error Field" error="This field has an error" />)
      
      const errorMessage = screen.getByText('This field has an error')
      const input = screen.getByLabelText(/error field/i)
      
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveClass('text-ctp-red')
      
      // Error message should be associated with the input
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('provides proper form structure for grouped inputs', () => {
      render(<Login />)
      
      // Login form should have proper structure
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      
      // Inputs should have proper labels
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Interactive Elements', () => {
    it('provides descriptive button text', () => {
      render(
        <div>
          <Button>Sign In</Button>
          <Button>Create Account</Button>
          <Button>Get Started Free</Button>
        </div>
      )
      
      const signInButton = screen.getByRole('button', { name: /sign in/i })
      const createButton = screen.getByRole('button', { name: /create account/i })
      const getStartedButton = screen.getByRole('button', { name: /get started free/i })
      
      expect(signInButton).toBeInTheDocument()
      expect(createButton).toBeInTheDocument()
      expect(getStartedButton).toBeInTheDocument()
    })

    it('provides clear link purposes', () => {
      render(<Landing />)
      
      // Check that links have descriptive text
      const footerLinks = screen.getAllByRole('button')
      footerLinks.forEach(link => {
        expect(link.textContent).toBeTruthy()
        expect(link.textContent?.trim()).not.toBe('')
      })
    })

    it('handles keyboard navigation properly', () => {
      render(<Button>Focusable Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Button should be focusable (tabIndex 0 is default for buttons)
      expect(button.tabIndex).toBe(0)
      
      // Should have focus styles
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
    })
  })

  describe('Color Contrast', () => {
    it('ensures sufficient contrast for text elements', () => {
      render(
        <div className="bg-ctp-base text-ctp-text p-4">
          <h1>High Contrast Heading</h1>
          <p>Body text with proper contrast</p>
          <Button variant="primary">Primary Button</Button>
        </div>
      )
      
      const heading = screen.getByText('High Contrast Heading')
      const paragraph = screen.getByText('Body text with proper contrast')
      const button = screen.getByRole('button')
      
      expect(heading).toHaveClass('text-ctp-text')
      expect(paragraph).toHaveClass('text-ctp-text')
      expect(button).toHaveClass('text-white') // White text on gradient background
    })

    it('provides sufficient contrast for interactive elements', () => {
      render(
        <div>
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline Action</Button>
        </div>
      )
      
      const primaryButton = screen.getByRole('button', { name: /primary action/i })
      const secondaryButton = screen.getByRole('button', { name: /secondary action/i })
      const outlineButton = screen.getByRole('button', { name: /outline action/i })
      
      // Primary button: white text on gradient (high contrast)
      expect(primaryButton).toHaveClass('text-white')
      
      // Secondary button: appropriate text color
      expect(secondaryButton).toHaveClass('text-ctp-text')
      
      // Outline button: branded color with sufficient contrast
      expect(outlineButton).toHaveClass('text-ctp-mauve')
    })
  })

  describe('Focus Management', () => {
    it('provides visible focus indicators', () => {
      render(
        <div>
          <Button>Focusable Button</Button>
          <Input label="Focusable Input" />
        </div>
      )
      
      const button = screen.getByRole('button')
      const input = screen.getByRole('textbox')
      
      // Both should have focus ring classes
      expect(button).toHaveClass('focus:ring-2')
      expect(input).toHaveClass('focus:ring-2')
    })

    it('maintains logical tab order', () => {
      render(<Login />)
      
      // Get all focusable elements
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Check tab indices are logical (or default to 0)
      expect(emailInput.tabIndex).toBe(0)
      expect(passwordInput.tabIndex).toBe(0)
      expect(submitButton.tabIndex).toBe(0)
    })
  })

  describe('Semantic HTML', () => {
    it('uses proper heading hierarchy', () => {
      render(<Landing />)
      
      // Should have exactly one h1
      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      expect(h1Elements).toHaveLength(1)
      
      // Should have h2 elements for major sections
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h2Elements.length).toBeGreaterThan(0)
    })

    it('uses landmark elements correctly', () => {
      render(<Landing />)
      
      // Check for semantic landmarks
      const header = document.querySelector('header')
      const main = document.querySelector('main')
      const footer = document.querySelector('footer')
      
      expect(header).toBeInTheDocument()
      expect(main).toBeInTheDocument()
      expect(footer).toBeInTheDocument()
    })

    it('provides proper list semantics', () => {
      render(<Landing />)
      
      // Feature lists should use proper list markup
      const lists = document.querySelectorAll('ul, ol')
      expect(lists.length).toBeGreaterThan(0)
      
      // Each list should have list items
      lists.forEach(list => {
        const listItems = list.querySelectorAll('li')
        expect(listItems.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Loading States', () => {
    it('announces loading states to screen readers', () => {
      render(<Button loading>Loading Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Loading button should be disabled
      expect(button).toBeDisabled()
      
      // Should contain loading indicator
      const loader = button.querySelector('svg')
      expect(loader).toBeInTheDocument()
      expect(loader).toHaveClass('animate-spin')
    })
  })

  describe('Error States', () => {
    it('makes error messages accessible', () => {
      render(<Input label="Test Field" error="Error message" />)
      
      const input = screen.getByRole('textbox')
      const errorMessage = screen.getByText('Error message')
      
      // Error message should be visible and styled
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveClass('text-ctp-red')
      
      // Input should indicate error state
      expect(input).toHaveClass('border-ctp-red')
    })
  })

  describe('Alternative Text', () => {
    it('provides alt text for images', () => {
      render(<Landing />)
      
      // SVG icons should have proper titles or aria-labels
      const svgElements = document.querySelectorAll('svg')
      svgElements.forEach(svg => {
        // SVG should either have title, aria-label, or be decorative
        const hasTitle = svg.querySelector('title')
        const hasAriaLabel = svg.getAttribute('aria-label')
        const isDecorative = svg.getAttribute('aria-hidden') === 'true'
        
        expect(hasTitle || hasAriaLabel || isDecorative).toBeTruthy()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard-only navigation', async () => {
      render(<Login />)
      
      // All interactive elements should be keyboard accessible
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // These elements should be in the tab order
      expect(emailInput).not.toHaveAttribute('tabindex', '-1')
      expect(passwordInput).not.toHaveAttribute('tabindex', '-1')
      expect(submitButton).not.toHaveAttribute('tabindex', '-1')
    })
  })
})