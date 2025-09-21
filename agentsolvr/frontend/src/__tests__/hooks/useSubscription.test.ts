import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';
import { useSubscription } from '@/hooks/useSubscription';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('useSubscription Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create
    mockedAxios.create.mockReturnValue({
      get: vi.fn(),
    } as any);
  });

  describe('Successful API Response', () => {
    it('fetches subscription data successfully', async () => {
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: {
            plan_type: 'professional',
            status: 'active',
          },
        }),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual({
        planType: 'Professional',
        price: 99,
        status: 'active',
        nextBilling: 'March 15, 2024',
        usage: {
          voiceCommands: 147,
          projectsAnalyzed: 23,
          aiResponses: 892,
        },
      });
      expect(result.current.error).toBe(null);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/subscription/status');
    });

    it('maps starter plan correctly', async () => {
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: {
            plan_type: 'starter',
            status: 'active',
          },
        }),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data?.planType).toBe('Starter');
      expect(result.current.data?.price).toBe(39);
    });

    it('provides default usage statistics', async () => {
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: {
            plan_type: 'professional',
            status: 'active',
          },
        }),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data?.usage).toEqual({
        voiceCommands: 147,
        projectsAnalyzed: 23,
        aiResponses: 892,
      });
    });
  });

  describe('API Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const mockApiClient = {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe('Failed to fetch subscription data');
    });

    it('handles network errors', async () => {
      const mockApiClient = {
        get: vi.fn().mockRejectedValue(new Error('Network Error')),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch subscription data');
    });

    it('handles timeout errors', async () => {
      const mockApiClient = {
        get: vi.fn().mockRejectedValue({ code: 'ECONNABORTED' }),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch subscription data');
    });
  });

  describe('API Configuration', () => {
    it('creates API client with correct configuration', () => {
      renderHook(() => useSubscription());

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8001',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('calls correct API endpoint', async () => {
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: { plan_type: 'professional', status: 'active' },
        }),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      renderHook(() => useSubscription());

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/subscription/status');
      });
    });
  });

  describe('Data Transformation', () => {
    it('transforms plan_type to planType correctly', async () => {
      const testCases = [
        { input: 'professional', expected: 'Professional' },
        { input: 'starter', expected: 'Starter' },
        { input: 'unknown', expected: 'Starter' }, // Default case
      ];

      for (const testCase of testCases) {
        const mockApiClient = {
          get: vi.fn().mockResolvedValue({
            data: {
              plan_type: testCase.input,
              status: 'active',
            },
          }),
        };
        
        mockedAxios.create.mockReturnValue(mockApiClient as any);

        const { result } = renderHook(() => useSubscription());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.data?.planType).toBe(testCase.expected);
      }
    });

    it('maps price correctly based on plan type', async () => {
      const testCases = [
        { planType: 'professional', expectedPrice: 99 },
        { planType: 'starter', expectedPrice: 39 },
        { planType: 'unknown', expectedPrice: 39 }, // Default case
      ];

      for (const testCase of testCases) {
        const mockApiClient = {
          get: vi.fn().mockResolvedValue({
            data: {
              plan_type: testCase.planType,
              status: 'active',
            },
          }),
        };
        
        mockedAxios.create.mockReturnValue(mockApiClient as any);

        const { result } = renderHook(() => useSubscription());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.data?.price).toBe(testCase.expectedPrice);
      }
    });

    it('preserves status from API response', async () => {
      const testStatuses = ['active', 'inactive', 'canceled', 'past_due'];

      for (const status of testStatuses) {
        const mockApiClient = {
          get: vi.fn().mockResolvedValue({
            data: {
              plan_type: 'professional',
              status,
            },
          }),
        };
        
        mockedAxios.create.mockReturnValue(mockApiClient as any);

        const { result } = renderHook(() => useSubscription());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.data?.status).toBe(status);
      }
    });
  });

  describe('Loading States', () => {
    it('starts with loading true', () => {
      const mockApiClient = {
        get: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('sets loading to false after successful fetch', async () => {
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: { plan_type: 'professional', status: 'active' },
        }),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('sets loading to false after error', async () => {
      const mockApiClient = {
        get: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Effect Dependencies', () => {
    it('only calls API once on mount', async () => {
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: { plan_type: 'professional', status: 'active' },
        }),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { rerender } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledTimes(1);
      });

      // Rerender should not trigger another API call
      rerender();

      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Logging', () => {
    it('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockApiClient = {
        get: vi.fn().mockRejectedValue(new Error('Test Error')),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      renderHook(() => useSubscription());

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Subscription fetch error:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});