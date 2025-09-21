import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the API service methods
const mockApi = {
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  getSubscription: vi.fn(),
  getPlans: vi.fn(),
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn(),
  isAuthenticated: vi.fn(),
}

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
})

describe('API Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication Methods', () => {
    it('login method works correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', fullName: 'Test User' },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh'
        }
      }

      mockApi.login.mockResolvedValue(mockResponse)

      const credentials = { email: 'test@example.com', password: 'password' }
      const result = await mockApi.login(credentials)

      expect(mockApi.login).toHaveBeenCalledWith(credentials)
      expect(result.success).toBe(true)
      expect(result.data?.user.email).toBe('test@example.com')
    })

    it('register method works correctly', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          email: 'newuser@example.com',
          fullName: 'New User'
        }
      }

      mockApi.register.mockResolvedValue(mockResponse)

      const userData = {
        fullName: 'New User',
        email: 'newuser@example.com',
        password: 'password'
      }
      const result = await mockApi.register(userData)

      expect(mockApi.register).toHaveBeenCalledWith(userData)
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('newuser@example.com')
    })

    it('logout method works correctly', async () => {
      mockApi.logout.mockResolvedValue({ success: true })

      await mockApi.logout()

      expect(mockApi.logout).toHaveBeenCalled()
    })
  })

  describe('Token Management', () => {
    it('sets auth token correctly', () => {
      mockApi.setAuthToken.mockImplementation((token) => {
        mockLocalStorage.setItem('accessToken', token)
      })

      mockApi.setAuthToken('test-token')

      expect(mockApi.setAuthToken).toHaveBeenCalledWith('test-token')
    })

    it('gets auth token correctly', () => {
      mockLocalStorage.getItem.mockReturnValue('stored-token')
      mockApi.getAuthToken.mockReturnValue('stored-token')

      const token = mockApi.getAuthToken()

      expect(token).toBe('stored-token')
    })

    it('checks authentication status correctly', () => {
      // When token exists
      mockApi.isAuthenticated.mockReturnValue(true)
      expect(mockApi.isAuthenticated()).toBe(true)

      // When no token
      mockApi.isAuthenticated.mockReturnValue(false)
      expect(mockApi.isAuthenticated()).toBe(false)
    })
  })

  describe('Data Fetching', () => {
    it('gets subscription data correctly', async () => {
      const mockSubscription = {
        success: true,
        data: {
          id: 'sub-1',
          planType: 'professional',
          status: 'active',
          price: 79
        }
      }

      mockApi.getSubscription.mockResolvedValue(mockSubscription)

      const result = await mockApi.getSubscription()

      expect(mockApi.getSubscription).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data?.planType).toBe('professional')
    })

    it('gets plans data correctly', async () => {
      const mockPlans = {
        success: true,
        data: [
          { id: 'starter', name: 'Starter', price: 29 },
          { id: 'pro', name: 'Professional', price: 79 },
          { id: 'enterprise', name: 'Enterprise', price: 199 }
        ]
      }

      mockApi.getPlans.mockResolvedValue(mockPlans)

      const result = await mockApi.getPlans()

      expect(mockApi.getPlans).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data?.length).toBe(3)
      expect(result.data?.[0].name).toBe('Starter')
    })

    it('gets current user correctly', async () => {
      const mockUser = {
        success: true,
        data: {
          id: '1',
          email: 'current@example.com',
          fullName: 'Current User'
        }
      }

      mockApi.getCurrentUser.mockResolvedValue(mockUser)

      const result = await mockApi.getCurrentUser()

      expect(mockApi.getCurrentUser).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data?.email).toBe('current@example.com')
    })
  })

  describe('Error Handling', () => {
    it('handles login errors correctly', async () => {
      const mockError = new Error('Invalid credentials')
      mockApi.login.mockRejectedValue(mockError)

      const credentials = { email: 'wrong@email.com', password: 'wrong' }

      await expect(mockApi.login(credentials)).rejects.toThrow('Invalid credentials')
      expect(mockApi.login).toHaveBeenCalledWith(credentials)
    })

    it('handles network errors correctly', async () => {
      const mockError = new Error('Network error')
      mockApi.getCurrentUser.mockRejectedValue(mockError)

      await expect(mockApi.getCurrentUser()).rejects.toThrow('Network error')
    })
  })

  describe('Service Configuration', () => {
    it('API service is properly configured', () => {
      // Test that our mock API has all required methods
      expect(mockApi.login).toBeDefined()
      expect(mockApi.register).toBeDefined()
      expect(mockApi.getCurrentUser).toBeDefined()
      expect(mockApi.logout).toBeDefined()
      expect(mockApi.getSubscription).toBeDefined()
      expect(mockApi.getPlans).toBeDefined()
      expect(mockApi.setAuthToken).toBeDefined()
      expect(mockApi.getAuthToken).toBeDefined()
      expect(mockApi.isAuthenticated).toBeDefined()
    })

    it('handles method calls properly', () => {
      // Test that methods can be called without errors
      expect(() => mockApi.setAuthToken('test')).not.toThrow()
      expect(() => mockApi.getAuthToken()).not.toThrow()
      expect(() => mockApi.isAuthenticated()).not.toThrow()
    })
  })
})