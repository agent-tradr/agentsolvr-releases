import { http, HttpResponse } from 'msw'
import type { User, LoginResponse, Subscription, Plan } from '@/types'

// Mock data
const mockUser: User = {
  id: 'user-123',
  email: 'demo@agentsolvr.com',
  fullName: 'Demo User',
  avatar: 'https://example.com/avatar.png',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  isEmailVerified: true,
}

const mockSubscription: Subscription = {
  id: 'sub-123',
  userId: 'user-123',
  planType: 'professional',
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  price: 79,
  currency: 'usd',
  features: [
    'Everything in Starter',
    'Advanced voice commands',
    'Unlimited project analysis',
    'Priority support',
    '3 user licenses',
    'Advanced integrations'
  ],
}

const mockPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual developers',
    price: 29,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_starter',
    features: [
      'AgentSOLVR V4 Desktop App',
      'Basic voice commands',
      'Project analysis (100 files)',
      'Email support',
      '1 user license'
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Best for growing teams',
    price: 79,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_professional',
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced voice commands',
      'Unlimited project analysis',
      'Priority support',
      '3 user licenses',
      'Advanced integrations'
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_enterprise',
    features: [
      'Everything in Professional',
      'Custom integrations',
      'Dedicated support',
      'Unlimited licenses',
      'On-premise deployment',
      'Custom training'
    ],
  },
]

export const handlers = [
  // Authentication endpoints
  http.post('http://localhost:8001/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'demo@agentsolvr.com' && body.password === 'demo123') {
      const response: LoginResponse = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }
      
      return HttpResponse.json({
        success: true,
        data: response,
        message: 'Login successful'
      })
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid credentials',
        errors: ['Email or password is incorrect']
      },
      { status: 401 }
    )
  }),

  http.post('http://localhost:8001/api/auth/register', async ({ request }) => {
    const body = await request.json() as { fullName: string; email: string; password: string }
    
    if (body.email === 'existing@agentsolvr.com') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Email already exists',
          errors: ['This email is already registered']
        },
        { status: 409 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        ...mockUser,
        email: body.email,
        fullName: body.fullName,
      },
      message: 'Registration successful'
    })
  }),

  http.get('http://localhost:8001/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          errors: ['No valid token provided']
        },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: mockUser,
    })
  }),

  http.post('http://localhost:8001/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logout successful'
    })
  }),

  http.post('http://localhost:8001/api/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'new-mock-access-token'
      }
    })
  }),

  // Subscription endpoints
  http.get('http://localhost:8001/api/subscription/status', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Unauthorized'
        },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: mockSubscription,
    })
  }),

  http.get('http://localhost:8001/api/subscription/plans', () => {
    return HttpResponse.json({
      success: true,
      data: mockPlans,
    })
  }),

  // System endpoints for testing
  http.get('http://localhost:8001/api/system/agents', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 'agent-1',
          name: 'Backend Core',
          role: 'Application startup, coordination, APIs',
          status: 'online',
          performance: 98.2,
          tasksCompleted: 89,
          uptime: 99.9,
          lastUpdate: new Date().toISOString(),
        },
        {
          id: 'agent-2',
          name: 'Claude Integration',
          role: 'Claude APIs, cost optimization',
          status: 'online',
          performance: 99.1,
          tasksCompleted: 1247,
          uptime: 100,
          lastUpdate: new Date().toISOString(),
        },
      ],
    })
  }),

  // Error simulation endpoints for testing
  http.get('http://localhost:8001/api/test/500', () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errors: ['Something went wrong on our end']
      },
      { status: 500 }
    )
  }),

  http.get('http://localhost:8001/api/test/timeout', () => {
    return new Promise(() => {
      // Never resolve to simulate timeout
    })
  }),
]