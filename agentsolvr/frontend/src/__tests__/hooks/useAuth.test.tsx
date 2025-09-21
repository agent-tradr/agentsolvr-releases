import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.create
    mockedAxios.create.mockReturnValue({
      get: vi.fn(),
      post: vi.fn(),
    } as any);
  });

  describe('Initial State', () => {
    it('starts with loading true and no user', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBe(null);
      expect(result.current.loading).toBe(true);
    });

    it('attempts to refresh user on mount if token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');
      
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'user-1',
            email: 'test@example.com',
            fullName: 'Test User',
            isActive: true,
            emailVerified: true,
          },
        }),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/auth/me', {
          headers: { Authorization: 'Bearer test-token' },
        });
      });
    });
  });

  describe('Login Function', () => {
    it('successfully logs in user', async () => {
      const mockApiClient = {
        post: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              fullName: 'Test User',
              isActive: true,
              emailVerified: true,
            },
            token: 'login-token',
          },
        }),
        get: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult!).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'login-token');
      expect(result.current.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        isActive: true,
        emailVerified: true,
      });
    });

    it('handles login failure', async () => {
      const mockApiClient = {
        post: vi.fn().mockRejectedValue(new Error('Invalid credentials')),
        get: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(loginResult!).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(result.current.user).toBe(null);
    });

    it('logs login errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockApiClient = {
        post: vi.fn().mockRejectedValue(new Error('Login failed')),
        get: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Register Function', () => {
    it('successfully registers user', async () => {
      const mockApiClient = {
        post: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-2',
              email: 'new@example.com',
              fullName: 'New User',
              isActive: true,
              emailVerified: true,
            },
            token: 'register-token',
          },
        }),
        get: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.register('new@example.com', 'password123', 'New User');
      });

      expect(registerResult!).toBe(true);
      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        full_name: 'New User',
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'register-token');
      expect(result.current.user).toEqual({
        id: 'user-2',
        email: 'new@example.com',
        fullName: 'New User',
        isActive: true,
        emailVerified: true,
      });
    });

    it('handles registration failure', async () => {
      const mockApiClient = {
        post: vi.fn().mockRejectedValue(new Error('Email already exists')),
        get: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let registerResult: boolean;
      await act(async () => {
        registerResult = await result.current.register('existing@example.com', 'password123', 'User');
      });

      expect(registerResult!).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(result.current.user).toBe(null);
    });

    it('logs registration errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockApiClient = {
        post: vi.fn().mockRejectedValue(new Error('Registration failed')),
        get: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.register('test@example.com', 'password', 'Test User');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Registration failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Logout Function', () => {
    it('successfully logs out user', async () => {
      mockLocalStorage.getItem.mockReturnValue('existing-token');
      
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'user-1',
            email: 'test@example.com',
            fullName: 'Test User',
            isActive: true,
            emailVerified: true,
          },
        }),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.logout();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(result.current.user).toBe(null);
    });
  });

  describe('Refresh User Function', () => {
    it('successfully refreshes user data', async () => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');
      
      const mockApiClient = {
        get: vi.fn().mockResolvedValue({
          data: {
            id: 'user-1',
            email: 'test@example.com',
            fullName: 'Test User',
            isActive: true,
            emailVerified: true,
          },
        }),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        isActive: true,
        emailVerified: true,
      });
    });

    it('handles refresh failure and removes invalid token', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-token');
      
      const mockApiClient = {
        get: vi.fn().mockRejectedValue(new Error('Unauthorized')),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(result.current.user).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to refresh user:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('skips refresh if no token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const mockApiClient = {
        get: vi.fn(),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(result.current.user).toBe(null);
    });
  });

  describe('API Client Configuration', () => {
    it('creates API client with correct configuration', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      renderHook(() => useAuth(), { wrapper });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8001',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('Context Provider', () => {
    it('throws error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('provides all required context values', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const mockApiClient = {
        get: vi.fn(),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('refreshUser');
      
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refreshUser).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('manages loading state correctly during refresh', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');
      
      const mockApiClient = {
        get: vi.fn().mockImplementation(() => 
          new Promise(resolve => 
            setTimeout(() => resolve({
              data: {
                id: 'user-1',
                email: 'test@example.com',
                fullName: 'Test User',
                isActive: true,
                emailVerified: true,
              },
            }), 100)
          )
        ),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeTruthy();
    });

    it('sets loading to false even on refresh error', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-token');
      
      const mockApiClient = {
        get: vi.fn().mockRejectedValue(new Error('Unauthorized')),
        post: vi.fn(),
      };
      
      mockedAxios.create.mockReturnValue(mockApiClient as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBe(null);
      consoleSpy.mockRestore();
    });
  });
});