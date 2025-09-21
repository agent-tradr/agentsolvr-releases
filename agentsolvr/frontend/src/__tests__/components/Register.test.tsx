import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockUnauthenticatedUser } from '@/test/utils'
import Register from '@/components/pages/Register'

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

// Mock the usePlans hook
vi.mock('@/hooks/useAuth', async () => {
  const actual = await vi.importActual('@/hooks/useAuth')
  return {
    ...actual,
    usePlans: () => ({
      data: [
        {
          id: 'starter',
          name: 'Starter',
          price: 29,
          features: ['Basic features']
        }
      ],
      isLoading: false,
      error: null
    })
  }
})

describe('Register Component', () => {
  beforeEach(() => {
    mockUnauthenticatedUser()
    mockNavigate.mockClear()
  })

  it('renders registration form correctly', () => {
    render(<Register />)
    
    // Check header elements
    expect(screen.getByText('Create Your Account')).toBeInTheDocument()
    expect(screen.getByText('Join AgentSOLVR and transform your development workflow')).toBeInTheDocument()
    
    // Check form elements
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByText(/i agree to the/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    
    // Check links
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument()
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    
    // Check features preview
    expect(screen.getByText('What you\'ll get:')).toBeInTheDocument()
    expect(screen.getByText('14-day free trial of all features')).toBeInTheDocument()
    expect(screen.getByText('Voice-controlled AI development agents')).toBeInTheDocument()
  })

  it('validates full name input correctly', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Test required validation
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument()
    })
    
    // Test minimum length validation
    await user.type(nameInput, 'A')
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
    
    // Test valid name
    await user.clear(nameInput)
    await user.type(nameInput, 'John Doe')
    await waitFor(() => {
      expect(screen.queryByText(/name must be at least 2 characters/i)).not.toBeInTheDocument()
    })
  })

  it('validates email input correctly', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
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

  it('displays password strength indicator', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    // Initially no strength indicator
    expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument()
    
    // Type weak password
    await user.type(passwordInput, 'weak')
    await waitFor(() => {
      expect(screen.getByText(/password strength/i)).toBeInTheDocument()
      expect(screen.getByText(/weak/i)).toBeInTheDocument()
    })
    
    // Type medium password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'MediumPass1')
    await waitFor(() => {
      expect(screen.getByText(/medium/i)).toBeInTheDocument()
    })
    
    // Type strong password
    await user.clear(passwordInput)
    await user.type(passwordInput, 'StrongPass123!')
    await waitFor(() => {
      expect(screen.getByText(/strong/i)).toBeInTheDocument()
    })
  })

  it('shows password requirements checklist', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    // Type password to trigger requirements display
    await user.type(passwordInput, 'TestPass123!')
    
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument()
      expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument()
      expect(screen.getByText(/one number/i)).toBeInTheDocument()
      expect(screen.getByText(/one special character/i)).toBeInTheDocument()
    })
  })

  it('validates password confirmation', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Fill different passwords
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    
    // Fix password confirmation
    await user.clear(confirmPasswordInput)
    await user.type(confirmPasswordInput, 'password123')
    
    await waitFor(() => {
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument()
    })
  })

  it('validates terms and conditions checkbox', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Try to submit without agreeing to terms
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/you must agree to the terms and conditions/i)).toBeInTheDocument()
    })
    
    // Check the checkbox
    const termsCheckbox = screen.getByRole('checkbox')
    await user.click(termsCheckbox)
    
    await waitFor(() => {
      expect(screen.queryByText(/you must agree to the terms and conditions/i)).not.toBeInTheDocument()
    })
  })

  it('submits registration form successfully', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    // Fill in all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!')
    await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!')
    await user.click(screen.getByRole('checkbox'))
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    })
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Should navigate to login after delay
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    }, { timeout: 4000 })
  })

  it('displays error for existing email', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    // Fill form with existing email (as defined in MSW mock)
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'existing@agentsolvr.com')
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!')
    await user.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!')
    await user.click(screen.getByRole('checkbox'))
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
    
    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates to login page', async () => {
    render(<Register />)
    
    const loginLink = screen.getByText(/sign in/i)
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  it('navigates back to home', async () => {
    const user = userEvent.setup()
    render(<Register />)
    
    const backButton = screen.getByText(/back to home/i)
    
    await user.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('has proper accessibility attributes', () => {
    render(<Register />)
    
    // Check form labels and required attributes
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    expect(nameInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('required')
    
    // Check submit button
    const submitButton = screen.getByRole('button', { name: /create account/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
    
    // Check checkbox
    const termsCheckbox = screen.getByRole('checkbox')
    expect(termsCheckbox).toHaveAttribute('type', 'checkbox')
  })

  it('links to terms and privacy policy', () => {
    render(<Register />)
    
    const termsLink = screen.getByText(/terms of service/i)
    const privacyLink = screen.getByText(/privacy policy/i)
    
    expect(termsLink).toHaveAttribute('href', '/terms')
    expect(privacyLink).toHaveAttribute('href', '/privacy')
  })
})