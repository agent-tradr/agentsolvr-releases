import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { Button } from '@/components/ui'

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  it('applies primary variant styles by default', () => {
    render(<Button>Primary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gradient-to-r', 'from-ctp-mauve', 'to-ctp-blue')
  })

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-ctp-surface0', 'text-ctp-text', 'border-ctp-surface1')
  })

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-transparent', 'text-ctp-mauve', 'border-ctp-mauve')
  })

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-transparent', 'text-ctp-subtext1')
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'rounded-md')

    rerender(<Button size="md">Medium</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-base', 'rounded-lg')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('px-8', 'py-4', 'text-lg', 'rounded-xl')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button onClick={handleClick}>Clickable Button</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disables button when disabled prop is true', () => {
    const handleClick = vi.fn()
    
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  it('shows loading state with spinner', () => {
    render(<Button loading>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    // Check for loading text
    expect(button).toHaveTextContent('Loading Button')
    
    // Check for loader icon (Lucide Loader2)
    const loader = button.querySelector('svg')
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveClass('animate-spin')
  })

  it('prevents click when loading', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<Button loading onClick={handleClick}>Loading Button</Button>)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('supports different button types', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')

    rerender(<Button type="reset">Reset</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'reset')

    rerender(<Button>Default</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('has proper focus styles for accessibility', () => {
    render(<Button>Focus Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2')
  })

  it('maintains proper contrast for accessibility', () => {
    // Primary variant should have white text on gradient background
    render(<Button variant="primary">Primary</Button>)
    const primaryButton = screen.getByRole('button')
    expect(primaryButton).toHaveClass('text-white')

    // Secondary variant should have appropriate text color
    render(<Button variant="secondary">Secondary</Button>)
    const secondaryButton = screen.getAllByRole('button')[1]
    expect(secondaryButton).toHaveClass('text-ctp-text')
  })

  it('forwards additional props to button element', () => {
    render(<Button data-testid="custom-button" aria-label="Custom label">Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-testid', 'custom-button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })
})