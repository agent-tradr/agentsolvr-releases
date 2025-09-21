import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import { Input } from '@/components/ui'

describe('Input Component', () => {
  it('renders input with label', () => {
    render(<Input label="Test Label" />)
    
    const input = screen.getByLabelText(/test label/i)
    const label = screen.getByText('Test Label')
    
    expect(input).toBeInTheDocument()
    expect(label).toBeInTheDocument()
  })

  it('renders input without label', () => {
    render(<Input placeholder="No label input" />)
    
    const input = screen.getByPlaceholderText(/no label input/i)
    expect(input).toBeInTheDocument()
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('applies required indicator when required', () => {
    render(<Input label="Required Field" required />)
    
    const requiredIndicator = screen.getByText('*')
    expect(requiredIndicator).toBeInTheDocument()
    expect(requiredIndicator).toHaveClass('text-ctp-red')
  })

  it('handles value changes', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test value')
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test value')
  })

  it('displays error message and styles', () => {
    render(<Input label="Error Field" error="This field is required" />)
    
    const input = screen.getByRole('textbox')
    const errorMessage = screen.getByText('This field is required')
    const label = screen.getByText('Error Field')
    
    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveClass('text-ctp-red')
    expect(input).toHaveClass('border-ctp-red')
    expect(label).toHaveClass('text-ctp-red')
  })

  it('shows focus styles', async () => {
    const user = userEvent.setup()
    render(<Input label="Focus Test" />)
    
    const input = screen.getByRole('textbox')
    
    await user.click(input)
    expect(input).toHaveClass('focus:border-ctp-mauve', 'focus:ring-2', 'focus:ring-ctp-mauve/20')
  })

  it('handles disabled state', () => {
    render(<Input label="Disabled Field" disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')

    rerender(<Input type="tel" />)
    input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'tel')

    rerender(<Input type="url" />)
    input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'url')
  })

  it('handles password input with toggle visibility', async () => {
    const user = userEvent.setup()
    render(<Input type="password" showPasswordToggle />)
    
    const input = screen.getByDisplayValue('') // Get the input element
    const toggleButton = screen.getByRole('button')
    
    // Initially should be password type
    expect(input).toHaveAttribute('type', 'password')
    
    // Click toggle to show password
    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
    
    // Click toggle to hide password
    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('does not show password toggle for non-password inputs', () => {
    render(<Input type="text" showPasswordToggle />)
    
    const toggleButton = screen.queryByRole('button')
    expect(toggleButton).not.toBeInTheDocument()
  })

  it('applies hover styles', () => {
    render(<Input label="Hover Test" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('hover:border-ctp-surface2')
  })

  it('has proper placeholder styling', () => {
    render(<Input placeholder="Placeholder text" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('placeholder-ctp-subtext0')
  })

  it('associates label with input correctly', () => {
    render(<Input id="test-input" name="test" label="Test Label" />)
    
    const input = screen.getByRole('textbox')
    const label = screen.getByText('Test Label')
    
    expect(input).toHaveAttribute('id', 'test-input')
    expect(input).toHaveAttribute('name', 'test')
    expect(label).toHaveAttribute('for', 'test-input')
  })

  it('generates id from name when id is not provided', () => {
    render(<Input name="auto-id" label="Auto ID Label" />)
    
    const input = screen.getByRole('textbox')
    const label = screen.getByText('Auto ID Label')
    
    expect(input).toHaveAttribute('id', 'auto-id')
    expect(label).toHaveAttribute('for', 'auto-id')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('applies custom className', () => {
    render(<Input className="custom-input-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input-class')
  })

  it('supports all standard input attributes', () => {
    render(
      <Input
        placeholder="Test placeholder"
        maxLength={50}
        minLength={5}
        autoComplete="email"
        autoFocus
        readOnly
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Test placeholder')
    expect(input).toHaveAttribute('maxlength', '50')
    expect(input).toHaveAttribute('minlength', '5')
    expect(input).toHaveAttribute('autocomplete', 'email')
    expect(input).toHaveAttribute('readonly')
  })

  it('maintains consistent styling across states', () => {
    const { rerender } = render(<Input label="State Test" />)
    
    let input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-ctp-surface0', 'text-ctp-text', 'border-ctp-surface1')
    
    // Error state
    rerender(<Input label="State Test" error="Error message" />)
    input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-ctp-red')
    
    // Disabled state
    rerender(<Input label="State Test" disabled />)
    input = screen.getByRole('textbox')
    expect(input).toHaveClass('disabled:opacity-50')
  })
})