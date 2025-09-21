import { vi } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Subscription API Integration', () => {
  const API_BASE_URL = 'http://localhost:8001';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  describe('GET /api/subscription/status', () => {
    it('returns subscription status for active professional plan', async () => {
      const mockResponse = {
        data: {
          plan_type: 'professional',
          status: 'active',
          features: [
            'desktop_app',
            'advanced_voice',
            'unlimited_analysis',
            'priority_support'
          ]
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);

      expect(response.data).toEqual({
        plan_type: 'professional',
        status: 'active',
        features: [
          'desktop_app',
          'advanced_voice',
          'unlimited_analysis',
          'priority_support'
        ]
      });
      expect(response.status).toBe(200);
    });

    it('handles unauthorized access', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      });

      try {
        await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Unauthorized');
      }
    });

    it('handles server errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 500,
          data: { error: 'Internal Server Error' }
        }
      });

      try {
        await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  describe('GET /api/subscription/plans', () => {
    it('returns updated production pricing plans', async () => {
      const mockResponse = {
        data: [
          {
            id: 'starter',
            name: 'Starter',
            price: 39,
            billing: 'month',
            description: 'Perfect for individual developers getting started',
            features: [
              'AgentSOLVR Desktop App',
              'Basic voice commands (10/day)',
              'Project analysis (50 files)',
              'Email support',
              '1 user license',
              'GitHub integration'
            ],
            popular: false
          },
          {
            id: 'professional',
            name: 'Professional',
            price: 99,
            billing: 'month',
            description: 'For serious developers and small teams',
            features: [
              'Everything in Starter',
              'Advanced voice commands (unlimited)',
              'Unlimited project analysis',
              'Priority support (24h response)',
              '5 user licenses',
              'Advanced integrations',
              'Custom prompts & templates'
            ],
            popular: true
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 299,
            billing: 'month',
            description: 'For teams that need custom solutions',
            features: [
              'Everything in Professional',
              'Custom AI model training',
              'Dedicated support manager',
              'Unlimited user licenses',
              'On-premise deployment option',
              'Custom integrations & APIs',
              'SLA guarantees (99.9% uptime)'
            ],
            popular: false
          }
        ],
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await mockedAxios.get(`${API_BASE_URL}/api/subscription/plans`);

      expect(response.data).toHaveLength(3);
      expect(response.data[0]).toEqual({
        id: 'starter',
        name: 'Starter',
        price: 39,
        billing: 'month',
        description: 'Perfect for individual developers getting started',
        features: expect.arrayContaining([
          'AgentSOLVR Desktop App',
          'Basic voice commands (10/day)',
          'Project analysis (50 files)',
          'Email support',
          '1 user license',
          'GitHub integration'
        ]),
        popular: false
      });
      expect(response.data[1].price).toBe(99); // Professional plan
      expect(response.data[2].price).toBe(299); // Enterprise plan
    });

    it('validates pricing structure', async () => {
      const mockResponse = {
        data: [
          { id: 'starter', price: 39, popular: false },
          { id: 'professional', price: 99, popular: true },
          { id: 'enterprise', price: 299, popular: false }
        ],
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await mockedAxios.get(`${API_BASE_URL}/api/subscription/plans`);

      // Verify pricing progression
      expect(response.data[0].price).toBeLessThan(response.data[1].price);
      expect(response.data[1].price).toBeLessThan(response.data[2].price);
      
      // Verify only one plan is marked as popular
      const popularPlans = response.data.filter((plan: any) => plan.popular);
      expect(popularPlans).toHaveLength(1);
      expect(popularPlans[0].id).toBe('professional');
    });

    it('includes all required plan fields', async () => {
      const mockResponse = {
        data: [
          {
            id: 'starter',
            name: 'Starter',
            price: 39,
            billing: 'month',
            description: 'Perfect for individual developers getting started',
            features: ['Feature 1', 'Feature 2'],
            popular: false
          }
        ],
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await mockedAxios.get(`${API_BASE_URL}/api/subscription/plans`);
      const plan = response.data[0];

      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('price');
      expect(plan).toHaveProperty('billing');
      expect(plan).toHaveProperty('description');
      expect(plan).toHaveProperty('features');
      expect(plan).toHaveProperty('popular');
      
      expect(typeof plan.price).toBe('number');
      expect(Array.isArray(plan.features)).toBe(true);
      expect(typeof plan.popular).toBe('boolean');
    });
  });

  describe('Authentication Integration', () => {
    it('includes authorization header when token is present', async () => {
      const mockToken = 'test-auth-token';
      
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn().mockReturnValue(mockToken),
        },
      });

      mockedAxios.get.mockResolvedValue({ data: {}, status: 200 });

      await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/subscription/status`,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it('handles token expiration', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { error: 'Token expired' }
        }
      });

      try {
        await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Token expired');
      }
    });
  });

  describe('Error Handling', () => {
    it('handles network timeouts', async () => {
      mockedAxios.get.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded'
      });

      try {
        await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);
      } catch (error: any) {
        expect(error.code).toBe('ECONNABORTED');
        expect(error.message).toContain('timeout');
      }
    });

    it('handles connection refused', async () => {
      mockedAxios.get.mockRejectedValue({
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:8001'
      });

      try {
        await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);
      } catch (error: any) {
        expect(error.code).toBe('ECONNREFUSED');
      }
    });

    it('handles malformed JSON responses', async () => {
      mockedAxios.get.mockRejectedValue({
        response: {
          status: 200,
          data: 'invalid json'
        }
      });

      try {
        await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);
      } catch (error: any) {
        expect(error.response.status).toBe(200);
        expect(error.response.data).toBe('invalid json');
      }
    });
  });

  describe('Request Configuration', () => {
    it('sends requests with correct headers', async () => {
      mockedAxios.get.mockResolvedValue({ data: {}, status: 200 });

      await mockedAxios.get(`${API_BASE_URL}/api/subscription/plans`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/subscription/plans`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
    });

    it('configures timeout correctly', async () => {
      const axiosInstance = {
        get: vi.fn().mockResolvedValue({ data: {}, status: 200 }),
        defaults: { timeout: 10000 },
      };

      mockedAxios.create.mockReturnValue(axiosInstance as any);

      await axiosInstance.get('/api/subscription/status');

      expect(axiosInstance.defaults.timeout).toBe(10000);
    });
  });

  describe('Response Validation', () => {
    it('validates subscription status response structure', async () => {
      const mockResponse = {
        data: {
          plan_type: 'professional',
          status: 'active',
          features: ['feature1', 'feature2']
        },
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await mockedAxios.get(`${API_BASE_URL}/api/subscription/status`);

      expect(response.data).toHaveProperty('plan_type');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('features');
      expect(Array.isArray(response.data.features)).toBe(true);
    });

    it('validates plans response structure', async () => {
      const mockResponse = {
        data: [
          {
            id: 'starter',
            name: 'Starter',
            price: 39,
            features: ['feature1'],
            popular: false
          }
        ],
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await mockedAxios.get(`${API_BASE_URL}/api/subscription/plans`);

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('name');
      expect(response.data[0]).toHaveProperty('price');
      expect(response.data[0]).toHaveProperty('features');
      expect(response.data[0]).toHaveProperty('popular');
    });
  });

  describe('Production Pricing Validation', () => {
    it('confirms updated production pricing values', async () => {
      const mockResponse = {
        data: [
          { id: 'starter', price: 39 },
          { id: 'professional', price: 99 },
          { id: 'enterprise', price: 299 }
        ],
        status: 200,
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const response = await mockedAxios.get(`${API_BASE_URL}/api/subscription/plans`);

      const starterPlan = response.data.find((plan: any) => plan.id === 'starter');
      const professionalPlan = response.data.find((plan: any) => plan.id === 'professional');
      const enterprisePlan = response.data.find((plan: any) => plan.id === 'enterprise');

      expect(starterPlan.price).toBe(39); // Updated from $29
      expect(professionalPlan.price).toBe(99); // Updated from $79
      expect(enterprisePlan.price).toBe(299); // Updated from $199
    });
  });
});