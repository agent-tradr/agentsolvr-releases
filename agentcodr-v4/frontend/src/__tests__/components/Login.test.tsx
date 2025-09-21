import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockUnauthenticatedUser } from '@/test/utils'
import Login from '@/components/pages/Login'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  }
})

describe('Login Component', () => {
  beforeEach(() => {
    mockUnauthenticatedUser()
    mockNavigate.mockClear()
  })

  it('renders login form correctly', () => {
    render(<Login />)
    
    // Check header elements
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your AgentSOLVR account')).toBeInTheDocument()
    
    // Check form elements
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByText(/remember me/i)).toBeInTheDocument()
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    
    // Check logo
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('SOLVR')).toBeInTheDocument()
    
    // Check demo credentials
    expect(screen.getByText('Demo Credentials')).toBeInTheDocument()
    expect(screen.getByText('demo@agentsolvr.com')).toBeInTheDocument()
    expect(screen.getByText('demo123')).toBeInTheDocument()
  })

  it('validates email input correctly', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Test required validation
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
    
    // Test invalid email format
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
    
    // Test valid email
    await user.clear(emailInput)
    await user.type(emailInput, 'valid@email.com')
    await waitFor(() => {
      expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument()
    })
  })

  it('validates password input correctly', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Test required validation
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
    
    // Test minimum length validation
    await user.type(passwordInput, 'short')
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
    
    // Test valid password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'validpassword')
    await waitFor(() => {
      expect(screen.queryByText(/password must be at least 6 characters/i)).not.toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
    
    // Initially password should be hidden
    expect(passwordInput.type).toBe('password')
    
    // Click to show password
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('text')
    
    // Click to hide password again
    await user.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('submits form with valid credentials successfully', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Fill in valid credentials (matching our MSW mock)
    await user.type(emailInput, 'demo@agentsolvr.com')
    await user.type(passwordInput, 'demo123')
    
    // Submit form
    await user.click(submitButton)
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })
    
    // Wait for navigation to dashboard
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    }, { timeout: 3000 })
  })

  it('displays error for invalid credentials', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Fill in invalid credentials
    await user.type(emailInput, 'wrong@email.com')
    await user.type(passwordInput, 'wrongpassword')
    
    // Submit form
    await user.click(submitButton)
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
    
    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('handles remember me checkbox', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i })
    
    // Initially unchecked
    expect(rememberCheckbox).not.toBeChecked()
    
    // Click to check
    await user.click(rememberCheckbox)
    expect(rememberCheckbox).toBeChecked()
    
    // Click to uncheck
    await user.click(rememberCheckbox)
    expect(rememberCheckbox).not.toBeChecked()
  })

  it('navigates to register page', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const registerLink = screen.getByText(/sign up for free/i)
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  it('navigates to forgot password page', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const forgotPasswordLink = screen.getByText(/forgot password/i)
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('navigates back to home', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const backButton = screen.getByText(/back to home/i)
    
    await user.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('has proper accessibility attributes', () => {
    render(<Login />)
    
    // Check form labels
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    
    // Check submit button
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('applies correct CSS classes for styling', () => {
    render(<Login />)
    
    // Check that Catppuccin classes are applied
    const container = screen.getByText('Welcome Back').closest('div')
    expect(container).toHaveClass('text-center')
    
    // Check card styling - look for specific Tailwind classes that make up the card
    const card = screen.getByRole('button', { name: /sign in/i }).closest('form')?.closest('div')
    expect(card).toHaveClass('rounded-xl', 'border', 'bg-ctp-surface0', 'p-8')
  })
})