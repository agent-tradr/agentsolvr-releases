import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/utils'
import Landing from '@/components/pages/Landing'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Landing Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('renders hero section with AgentSOLVR branding', () => {
    render(<Landing />)
    
    // Check main heading
    expect(screen.getByText('Transform Your Development with')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('SOLVR')).toBeInTheDocument()
    
    // Check subtitle
    expect(screen.getByText(/voice-controlled ai development platform/i)).toBeInTheDocument()
  })

  it('displays call-to-action buttons', () => {
    render(<Landing />)
    
    const getStartedButtons = screen.getAllByText(/get started/i)
    const pricingButton = screen.getByText(/view pricing/i)
    
    expect(getStartedButtons.length).toBeGreaterThan(0)
    expect(pricingButton).toBeInTheDocument()
  })

  it('navigates to register page when Get Started is clicked', async () => {
    const user = userEvent.setup()
    render(<Landing />)
    
    const getStartedButton = screen.getByRole('button', { name: /get started free/i })
    await user.click(getStartedButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/register')
  })

  it('navigates to pricing page when View Pricing is clicked', async () => {
    const user = userEvent.setup()
    render(<Landing />)
    
    const pricingButton = screen.getByRole('button', { name: /view pricing/i })
    await user.click(pricingButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/pricing')
  })

  it('displays feature cards', () => {
    render(<Landing />)
    
    expect(screen.getByText('Voice Commands')).toBeInTheDocument()
    expect(screen.getByText('AI Agents')).toBeInTheDocument()
    expect(screen.getByText('Project Analysis')).toBeInTheDocument()
    expect(screen.getByText('Real-time Sync')).toBeInTheDocument()
    expect(screen.getByText('Team Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Enterprise Security')).toBeInTheDocument()
  })

  it('displays benefits section', () => {
    render(<Landing />)
    
    expect(screen.getByText('Why Choose AgentSOLVR?')).toBeInTheDocument()
    expect(screen.getByText(/50x faster development workflow/i)).toBeInTheDocument()
    expect(screen.getByText(/natural language programming interface/i)).toBeInTheDocument()
  })

  it('shows agent coordination dashboard preview', () => {
    render(<Landing />)
    
    expect(screen.getByText('Agent Coordination')).toBeInTheDocument()
    expect(screen.getByText(/6 agents active/i)).toBeInTheDocument()
    expect(screen.getByText('Backend Core')).toBeInTheDocument()
    expect(screen.getByText('Claude Integration')).toBeInTheDocument()
  })

  it('navigates to login when Sign In is clicked', async () => {
    const user = userEvent.setup()
    render(<Landing />)
    
    const signInButton = screen.getByText(/sign in/i)
    await user.click(signInButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('displays footer with proper branding', () => {
    render(<Landing />)
    
    expect(screen.getByText('© 2024 AgentSOLVR')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(<Landing />)
    
    // Check for semantic HTML structure
    const header = document.querySelector('header')
    const main = document.querySelector('main')
    const footer = document.querySelector('footer')
    
    expect(header).toBeInTheDocument()
    expect(main).toBeInTheDocument()
    expect(footer).toBeInTheDocument()
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    
    expect(h1).toBeInTheDocument()
    expect(h2Elements.length).toBeGreaterThan(0)
  })
})