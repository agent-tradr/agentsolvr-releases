import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  Subscription, 
  Plan,
  DownloadInfo,
  AgentStatus,
  SystemMetrics,
  SecurityMetrics,
  ClaudeMetrics
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('accessToken', response.data.accessToken);
              
              // Retry the original request
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return this.api.request(originalRequest);
            } catch (refreshError) {
              // Refresh failed, redirect to login
              this.logout();
              window.location.href = '/login';
            }
          } else {
            // No refresh token, redirect to login
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const response: AxiosResponse<ApiResponse<{ accessToken: string }>> = await this.api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/auth/verify-email', { token });
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  }

  // Subscription endpoints
  async getSubscription(): Promise<ApiResponse<Subscription>> {
    const response: AxiosResponse<ApiResponse<Subscription>> = await this.api.get('/subscription/status');
    return response.data;
  }

  async getPlans(): Promise<ApiResponse<Plan[]>> {
    const response: AxiosResponse<ApiResponse<Plan[]>> = await this.api.get('/subscription/plans');
    return response.data;
  }

  async createSubscription(planId: string, paymentMethodId: string): Promise<ApiResponse<Subscription>> {
    const response: AxiosResponse<ApiResponse<Subscription>> = await this.api.post('/subscription/create', {
      planId,
      paymentMethodId,
    });
    return response.data;
  }

  async updateSubscription(planId: string): Promise<ApiResponse<Subscription>> {
    const response: AxiosResponse<ApiResponse<Subscription>> = await this.api.put('/subscription/update', {
      planId,
    });
    return response.data;
  }

  async cancelSubscription(): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/subscription/cancel');
    return response.data;
  }

  async resumeSubscription(): Promise<ApiResponse<Subscription>> {
    const response: AxiosResponse<ApiResponse<Subscription>> = await this.api.post('/subscription/resume');
    return response.data;
  }

  // Download endpoints
  async getDownloadInfo(): Promise<ApiResponse<DownloadInfo[]>> {
    const response: AxiosResponse<ApiResponse<DownloadInfo[]>> = await this.api.get('/downloads/info');
    return response.data;
  }

  async getDownloadUrl(platform: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    const response: AxiosResponse<ApiResponse<{ downloadUrl: string }>> = await this.api.get(`/downloads/url/${platform}`);
    return response.data;
  }

  // System monitoring endpoints
  async getAgentStatuses(): Promise<ApiResponse<AgentStatus[]>> {
    const response: AxiosResponse<ApiResponse<AgentStatus[]>> = await this.api.get('/system/agents');
    return response.data;
  }

  async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    const response: AxiosResponse<ApiResponse<SystemMetrics>> = await this.api.get('/system/metrics');
    return response.data;
  }

  async getSecurityMetrics(): Promise<ApiResponse<SecurityMetrics>> {
    const response: AxiosResponse<ApiResponse<SecurityMetrics>> = await this.api.get('/security/metrics');
    return response.data;
  }

  async getClaudeMetrics(): Promise<ApiResponse<ClaudeMetrics>> {
    const response: AxiosResponse<ApiResponse<ClaudeMetrics>> = await this.api.get('/claude/metrics');
    return response.data;
  }

  // User profile endpoints
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/user/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.post('/user/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async deleteAccount(): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete('/user/account');
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('accessToken', token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Create and export a singleton instance
export const api = new ApiService();
export default api;