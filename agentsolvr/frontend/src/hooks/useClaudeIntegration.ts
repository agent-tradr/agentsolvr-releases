import { useState, useEffect, useCallback } from 'react';
import useWebSocket from './useWebSocket';

export interface ClaudeAuthStatus {
  isAuthenticated: boolean;
  authMethod: 'browser' | 'api_key' | 'none';
  apiKeyValid: boolean;
  browserAuthValid: boolean;
  subscriptionTier: string | null;
  rateLimits: {
    requestsPerMinute: number;
    tokensPerDay: number;
    remaining: number;
  } | null;
}

export interface ClaudeMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  cachingEnabled: boolean;
  cacheHitRate: number;
  currentRateLimit: number;
  rateLimitRemaining: number;
  activeConnections: number;
  lastRequestTimestamp: Date | null;
}

export interface CostOptimization {
  enabled: boolean;
  totalSavings: number;
  compressionSavings: number;
  batchOptimizations: number;
  recommendations: {
    type: 'caching' | 'compression' | 'batching' | 'request_optimization';
    title: string;
    description: string;
    potentialSavings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    priority: 'low' | 'medium' | 'high';
  }[];
}

export interface ContextSummary {
  totalTokens: number;
  itemCount: number;
  utilization: number;
  maxTokens: number;
  optimizationNeeded: boolean;
}

export interface ClaudeIntegrationData {
  authStatus: ClaudeAuthStatus;
  metrics: ClaudeMetrics;
  costOptimization: CostOptimization;
  contextSummary: ContextSummary;
  isOnline: boolean;
  lastUpdate: Date;
}

export interface UseClaudeIntegrationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableMockData?: boolean;
}

export interface UseClaudeIntegrationReturn {
  data: ClaudeIntegrationData | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  refreshData: () => void;
  authenticateWithBrowser: () => Promise<{ success: boolean; error?: string }>;
  authenticateWithApiKey: (apiKey: string) => Promise<{ success: boolean; error?: string }>;
  testConnection: () => Promise<{ success: boolean; error?: string }>;
  toggleCaching: (enabled: boolean) => Promise<{ success: boolean; error?: string }>;
  optimizeSettings: () => Promise<{ success: boolean; error?: string }>;
  updateBudget: (budget: number) => Promise<{ success: boolean; error?: string }>;
  
  // Context management
  addContext: (content: string, type: string) => Promise<{ success: boolean; error?: string }>;
  removeContext: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  optimizeContext: () => Promise<{ success: boolean; error?: string }>;
  
  // Cost monitoring
  getCostBreakdown: () => Promise<{ success: boolean; data?: any; error?: string }>;
  getUsageReport: (timeRange: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useClaudeIntegration = ({
  autoRefresh = true,
  refreshInterval = 30000,
  enableMockData = false
}: UseClaudeIntegrationOptions = {}): UseClaudeIntegrationReturn => {
  const [data, setData] = useState<ClaudeIntegrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket connection for real-time updates
  const {
    isConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/claude-integration',
    onConnect: () => {
      console.log('Connected to Claude integration WebSocket');
      if (!enableMockData) {
        refreshData();
      }
    },
    onError: (error) => {
      console.error('Claude integration WebSocket error:', error);
      setError('Failed to connect to Claude integration service');
    },
    autoReconnect: true
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'claude_integration_update') {
      setData(lastMessage.data);
      setLoading(false);
      setError(null);
    }
  }, [lastMessage]);

  // Mock data for development/testing
  const generateMockData = useCallback((): ClaudeIntegrationData => {
    return {
      authStatus: {
        isAuthenticated: true,
        authMethod: 'api_key',
        apiKeyValid: true,
        browserAuthValid: false,
        subscriptionTier: 'Pro',
        rateLimits: {
          requestsPerMinute: 50,
          tokensPerDay: 1000000,
          remaining: 42
        }
      },
      metrics: {
        totalRequests: 1247,
        successfulRequests: 1198,
        failedRequests: 49,
        averageResponseTime: 145,
        totalTokensUsed: 87523,
        totalCost: 12.47,
        cachingEnabled: true,
        cacheHitRate: 0.73,
        currentRateLimit: 50,
        rateLimitRemaining: 42,
        activeConnections: 3,
        lastRequestTimestamp: new Date(Date.now() - 120000)
      },
      costOptimization: {
        enabled: true,
        totalSavings: 3.82,
        compressionSavings: 2048,
        batchOptimizations: 15,
        recommendations: [
          {
            type: 'caching',
            title: 'Increase Cache TTL',
            description: 'Extending cache time-to-live could reduce redundant requests',
            potentialSavings: 0.45,
            difficulty: 'easy',
            priority: 'medium'
          },
          {
            type: 'batching',
            title: 'Batch Small Requests',
            description: 'Combining small requests could improve cost efficiency',
            potentialSavings: 1.23,
            difficulty: 'medium',
            priority: 'high'
          }
        ]
      },
      contextSummary: {
        totalTokens: 45680,
        itemCount: 28,
        utilization: 0.46,
        maxTokens: 100000,
        optimizationNeeded: false
      },
      isOnline: true,
      lastUpdate: new Date()
    };
  }, []);

  // Auto-refresh with mock data
  useEffect(() => {
    if (enableMockData) {
      setData(generateMockData());
      setLoading(false);
      setError(null);

      if (autoRefresh && refreshInterval > 0) {
        const interval = setInterval(() => {
          setData(generateMockData());
        }, refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [enableMockData, autoRefresh, refreshInterval, generateMockData]);

  // Auto-refresh data
  useEffect(() => {
    if (!enableMockData && autoRefresh && refreshInterval > 0 && isConnected) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, isConnected, enableMockData]);

  const refreshData = useCallback(() => {
    if (enableMockData) {
      setData(generateMockData());
      return;
    }

    if (isConnected) {
      setLoading(true);
      sendMessage('request_claude_data', {
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, sendMessage, enableMockData, generateMockData]);

  const authenticateWithBrowser = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    return new Promise((resolve) => {
      const requestId = `auth_browser_${Date.now()}`;
      
      const handleResponse = (message: any) => {
        if (message.type === 'auth_browser_response' && message.requestId === requestId) {
          resolve({
            success: message.success,
            error: message.error
          });
        }
      };

      // Listen for response (simplified - in real implementation would use proper event handling)
      sendMessage('authenticate_browser', {
        requestId,
        timestamp: new Date().toISOString()
      });

      // Simulate response for now
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }, [isConnected, sendMessage, enableMockData]);

  const authenticateWithApiKey = useCallback(async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (apiKey.startsWith('sk-ant-api')) {
        return { success: true };
      } else {
        return { success: false, error: 'Invalid API key format' };
      }
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    return new Promise((resolve) => {
      const requestId = `auth_api_${Date.now()}`;
      
      sendMessage('authenticate_api_key', {
        requestId,
        apiKey,
        timestamp: new Date().toISOString()
      });

      // Simulate response
      setTimeout(() => {
        resolve({ success: true });
      }, 800);
    });
  }, [isConnected, sendMessage, enableMockData]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'WebSocket not connected' };
    }

    return new Promise((resolve) => {
      const requestId = `test_connection_${Date.now()}`;
      
      sendMessage('test_claude_connection', {
        requestId,
        timestamp: new Date().toISOString()
      });

      // Simulate response
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }, [isConnected, sendMessage, enableMockData]);

  const toggleCaching = useCallback(async (enabled: boolean): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Update mock data
      if (data) {
        setData({
          ...data,
          metrics: {
            ...data.metrics,
            cachingEnabled: enabled
          }
        });
      }
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('toggle_claude_caching', {
      enabled,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const optimizeSettings = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('optimize_claude_settings', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const updateBudget = useCallback(async (budget: number): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('update_claude_budget', {
      budget,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const addContext = useCallback(async (content: string, type: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('add_claude_context', {
      content,
      type,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const removeContext = useCallback(async (itemId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('remove_claude_context', {
      itemId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const optimizeContext = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('optimize_claude_context', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const getCostBreakdown = useCallback(async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        data: {
          requestCosts: 8.50,
          tokenCosts: 3.97,
          cachingCosts: 0.00,
          compressionCosts: 0.00,
          batchingCosts: 0.00
        }
      };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    // In real implementation, would wait for response
    sendMessage('get_cost_breakdown', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const getUsageReport = useCallback(async (timeRange: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        data: {
          timeRange,
          totalRequests: 1247,
          totalCost: 12.47,
          averageResponseTime: 145,
          topEndpoints: [
            { endpoint: '/api/claude/analyze', requests: 423, cost: 5.12 },
            { endpoint: '/api/claude/generate', requests: 289, cost: 3.45 }
          ]
        }
      };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('get_usage_report', {
      timeRange,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  return {
    data,
    loading,
    error,
    isConnected,
    refreshData,
    authenticateWithBrowser,
    authenticateWithApiKey,
    testConnection,
    toggleCaching,
    optimizeSettings,
    updateBudget,
    addContext,
    removeContext,
    optimizeContext,
    getCostBreakdown,
    getUsageReport
  };
};

export default useClaudeIntegration;