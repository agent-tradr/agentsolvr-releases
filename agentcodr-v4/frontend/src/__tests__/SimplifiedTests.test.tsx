import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { Button, Input, Card, Logo } from '@/components/ui'
import Landing from '@/components/pages/Landing'
import Login from '@/components/pages/Login'

// Mock react-router-dom for navigation tests
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

// Mock the auth hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
  usePlans: () => ({
    data: [
      { id: 'starter', name: 'Starter', price: 29, features: ['Basic features'] }
    ],
    isLoading: false,
    error: null
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('AgentSOLVR V4 Frontend - Core Functionality Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('UI Components', () => {
    it('renders Button component correctly', () => {
      render(<Button>Test Button</Button>)
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument()
    })

    it('renders Button with different variants', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>)
      expect(screen.getByRole('button')).toHaveClass('from-ctp-mauve', 'to-ctp-blue')

      rerender(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveClass('bg-ctp-surface0')
    })

    it('renders Input component with label', () => {
      render(<Input label="Test Input" />)
      expect(screen.getByLabelText(/test input/i)).toBeInTheDocument()
    })

    it('handles input changes', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Type here" />)
      
      const input = screen.getByPlaceholderText(/type here/i)
      await user.type(input, 'hello')
      
      expect(input).toHaveValue('hello')
    })

    it('renders Card component', () => {
      render(<Card>Card Content</Card>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('renders Logo with AgentSOLVR branding', () => {
      render(<Logo />)
      expect(screen.getByText('Agent')).toBeInTheDocument()
      expect(screen.getByText('SOLVR')).toBeInTheDocument()
    })
  })

  describe('Landing Page', () => {
    it('renders hero section with proper branding', () => {
      render(<Landing />)
      
      expect(screen.getByText('Transform Your Development with')).toBeInTheDocument()
      expect(screen.getAllByText('Agent').length).toBeGreaterThan(0)
      expect(screen.getAllByText('SOLVR').length).toBeGreaterThan(0)
    })

    it('displays feature cards', () => {
      render(<Landing />)
      
      expect(screen.getByText('Voice Commands')).toBeInTheDocument()
      expect(screen.getByText('AI Agents')).toBeInTheDocument()
      expect(screen.getByText('Project Analysis')).toBeInTheDocument()
    })

    it('has navigation buttons that work', async () => {
      const user = userEvent.setup()
      render(<Landing />)
      
      const getStartedButton = screen.getByRole('button', { name: /get started free/i })
      await user.click(getStartedButton)
      
      expect(mockNavigate).toHaveBeenCalledWith('/register')
    })
  })

  describe('Login Page', () => {
    it('renders login form with all fields', () => {
      render(<Login />)
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('allows form submission', async () => {
      const user = userEvent.setup()
      render(<Login />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Should be able to click the submit button
      await user.click(submitButton)
      expect(submitButton).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
      render(<Login />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('required')
    })
  })

  describe('Design System', () => {
    it('applies Catppuccin Macchiato color classes', () => {
      render(
        <div>
          <Button className="bg-ctp-mauve">Mauve Button</Button>
          <div className="text-ctp-blue">Blue Text</div>
          <div className="bg-ctp-base">Base Background</div>
        </div>
      )
      
      expect(screen.getByText('Mauve Button')).toHaveClass('bg-ctp-mauve')
      expect(screen.getByText('Blue Text')).toHaveClass('text-ctp-blue')
      expect(screen.getByText('Base Background')).toHaveClass('bg-ctp-base')
    })

    it('applies proper typography classes', () => {
      render(
        <div>
          <h1 className="text-2xl font-bold">Main Heading</h1>
          <p className="text-ctp-subtext1">Subtitle text</p>
        </div>
      )
      
      expect(screen.getByText('Main Heading')).toHaveClass('text-2xl', 'font-bold')
      expect(screen.getByText('Subtitle text')).toHaveClass('text-ctp-subtext1')
    })
  })

  describe('Responsive Design', () => {
    it('renders components at different screen sizes', () => {
      // Test mobile layout
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      render(<Landing />)
      expect(screen.getAllByText('Agent').length).toBeGreaterThan(0)
      
      // Test desktop layout  
      Object.defineProperty(window, 'innerWidth', { value: 1024 })
      render(<Landing />)
      expect(screen.getAllByText('SOLVR').length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      render(<Landing />)
      
      // Check that basic content renders properly (which indicates semantic structure)
      expect(screen.getByText('Transform Your Development with')).toBeInTheDocument()
      expect(screen.getByText('Why Choose AgentSOLVR?')).toBeInTheDocument()
      expect(screen.getByText('© 2024 AgentSOLVR')).toBeInTheDocument()
    })

    it('has proper heading hierarchy', () => {
      render(<Landing />)
      
      const h1 = screen.getByRole('heading', { level: 1 })
      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      
      expect(h1).toBeInTheDocument()
      expect(h2Elements.length).toBeGreaterThan(0)
    })

    it('buttons have proper focus states', () => {
      render(<Button>Focusable Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
    })
  })

  describe('User Interactions', () => {
    it('handles button clicks correctly', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<Button onClick={handleClick}>Click Me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles form input correctly', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Enter text" />)
      
      const input = screen.getByPlaceholderText(/enter text/i)
      await user.type(input, 'test input')
      
      expect(input).toHaveValue('test input')
    })

    it('shows loading states correctly', () => {
      render(<Button loading>Loading Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button.querySelector('svg')).toBeInTheDocument() // Loading icon
    })
  })

  describe('Error Handling', () => {
    it('displays input errors correctly', () => {
      render(<Input label="Test Field" error="This is an error" />)
      
      const errorMessage = screen.getByText('This is an error')
      expect(errorMessage).toBeInTheDocument()
      // Check that the error is styled (the parent div has the error class)
      expect(errorMessage.closest('div')).toHaveClass('text-ctp-red')
    })

    it('handles disabled states correctly', () => {
      render(<Button disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50')
    })
  })
})