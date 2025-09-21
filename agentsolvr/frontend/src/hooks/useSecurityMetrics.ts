import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useSecurityMetrics Hook
 * 
 * Manages security metrics, authentication status, and audit logs
 * with real-time updates and API integration capabilities.
 */

export interface SecurityMetrics {
  activeSessionsCount: number;
  failedAuthAttempts: number;
  sessionDuration: number;
  lastLoginTime: string;
  rateLimitStatus: {
    requestsRemaining: number;
    tokensRemaining: number;
    resetTime: string;
  };
  subscriptionTier: string;
  mfaEnabled: boolean;
  sessionValid: boolean;
  accountSecurityScore: number;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  sessionValid: boolean;
  sessionExpiry: string | null;
  userIdentifier: string | null;
  subscriptionTier: string | null;
  mfaEnabled: boolean;
  lastActivity: string | null;
  rateLimitStatus: {
    requestsRemaining: number;
    requestsTotal: number;
    resetTime: string;
  };
  securityLevel: 'low' | 'medium' | 'high';
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'authentication' | 'authorization' | 'session' | 'security' | 'system' | 'error';
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  description: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  success: boolean;
}

export interface AuditLogFilters {
  eventTypes: string[];
  severityLevels: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  searchQuery: string;
  userId?: string;
  sessionId?: string;
}

interface UseSecurityMetricsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  apiBaseUrl?: string;
  enableMockData?: boolean;
}

interface SecurityMetricsState {
  metrics: SecurityMetrics | null;
  authStatus: AuthStatus | null;
  recentEvents: SecurityEvent[];
  auditLogs: SecurityEvent[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export const useSecurityMetrics = (options: UseSecurityMetricsOptions = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    apiBaseUrl = '/api/security',
    enableMockData = true
  } = options;

  const [state, setState] = useState<SecurityMetricsState>({
    metrics: null,
    authStatus: null,
    recentEvents: [],
    auditLogs: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mock data for development
  const getMockSecurityMetrics = (): SecurityMetrics => ({
    activeSessionsCount: 1,
    failedAuthAttempts: 0,
    sessionDuration: 14.5,
    lastLoginTime: new Date().toISOString(),
    rateLimitStatus: {
      requestsRemaining: 850,
      tokensRemaining: 425000,
      resetTime: new Date(Date.now() + 3600000).toISOString()
    },
    subscriptionTier: 'pro',
    mfaEnabled: false,
    sessionValid: true,
    accountSecurityScore: 75
  });

  const getMockAuthStatus = (): AuthStatus => ({
    isAuthenticated: true,
    sessionValid: true,
    sessionExpiry: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    userIdentifier: 'user_12345',
    subscriptionTier: 'pro',
    mfaEnabled: false,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    rateLimitStatus: {
      requestsRemaining: 850,
      requestsTotal: 1000,
      resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    },
    securityLevel: 'medium'
  });

  const getMockSecurityEvents = (): SecurityEvent[] => [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      eventType: 'authentication',
      severity: 'info',
      action: 'login_success',
      description: 'User successfully authenticated via browser',
      userAgent: 'AgentSOLVR/4.0',
      ipAddress: '192.168.1.100',
      location: 'Local Network',
      sessionId: 'sess_12345',
      userId: 'user_12345',
      success: true,
      metadata: {
        authMethod: 'browser_auth',
        loginDuration: '2.3s'
      }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      eventType: 'session',
      severity: 'info',
      action: 'session_refresh',
      description: 'Session tokens refreshed automatically',
      sessionId: 'sess_12345',
      userId: 'user_12345',
      success: true,
      metadata: {
        previousExpiry: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        newExpiry: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      eventType: 'security',
      severity: 'warning',
      action: 'mfa_recommendation',
      description: 'MFA not enabled - security recommendation generated',
      userId: 'user_12345',
      success: true,
      metadata: {
        securityScore: 75,
        recommendation: 'Enable multi-factor authentication'
      }
    }
  ];

  // API Functions
  const fetchSecurityMetrics = useCallback(async (): Promise<SecurityMetrics> => {
    if (enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      return getMockSecurityMetrics();
    }

    const response = await fetch(`${apiBaseUrl}/metrics`, {
      signal: abortControllerRef.current?.signal
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch security metrics: ${response.statusText}`);
    }
    
    return response.json();
  }, [apiBaseUrl, enableMockData]);

  const fetchAuthStatus = useCallback(async (): Promise<AuthStatus> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 150));
      return getMockAuthStatus();
    }

    const response = await fetch(`${apiBaseUrl}/auth/status`, {
      signal: abortControllerRef.current?.signal
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch auth status: ${response.statusText}`);
    }
    
    return response.json();
  }, [apiBaseUrl, enableMockData]);

  const fetchSecurityEvents = useCallback(async (limit = 10): Promise<SecurityEvent[]> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return getMockSecurityEvents().slice(0, limit);
    }

    const response = await fetch(`${apiBaseUrl}/events?limit=${limit}`, {
      signal: abortControllerRef.current?.signal
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch security events: ${response.statusText}`);
    }
    
    return response.json();
  }, [apiBaseUrl, enableMockData]);

  const fetchAuditLogs = useCallback(async (
    filters: AuditLogFilters, 
    page = 1, 
    limit = 25
  ): Promise<SecurityEvent[]> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Apply mock filtering
      let filteredLogs = getMockSecurityEvents();
      
      if (filters.eventTypes.length > 0) {
        filteredLogs = filteredLogs.filter(log => filters.eventTypes.includes(log.eventType));
      }
      
      if (filters.severityLevels.length > 0) {
        filteredLogs = filteredLogs.filter(log => filters.severityLevels.includes(log.severity));
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.description.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query)
        );
      }
      
      const startIndex = (page - 1) * limit;
      return filteredLogs.slice(startIndex, startIndex + limit);
    }

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters.eventTypes.length > 0 && { eventTypes: filters.eventTypes.join(',') },
      ...filters.severityLevels.length > 0 && { severityLevels: filters.severityLevels.join(',') },
      ...filters.searchQuery && { search: filters.searchQuery },
      ...filters.userId && { userId: filters.userId },
      ...filters.sessionId && { sessionId: filters.sessionId },
      ...filters.dateRange.start && { startDate: filters.dateRange.start },
      ...filters.dateRange.end && { endDate: filters.dateRange.end }
    });

    const response = await fetch(`${apiBaseUrl}/audit-logs?${params}`, {
      signal: abortControllerRef.current?.signal
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
    }
    
    return response.json();
  }, [apiBaseUrl, enableMockData]);

  // Main refresh function
  const refreshAllData = useCallback(async () => {
    // Cancel any existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [metrics, authStatus, recentEvents] = await Promise.all([
        fetchSecurityMetrics(),
        fetchAuthStatus(),
        fetchSecurityEvents(5)
      ]);

      setState(prev => ({
        ...prev,
        metrics,
        authStatus,
        recentEvents,
        loading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch security data'
      }));
    }
  }, [fetchSecurityMetrics, fetchAuthStatus, fetchSecurityEvents]);

  // MFA Operations
  const enableMFA = useCallback(async (method: 'totp' | 'sms' | 'backup_codes'): Promise<{
    success: boolean;
    qrCode?: string;
    secret?: string;
    backupCodes?: string[];
    error?: string;
  }> => {
    try {
      if (enableMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (method === 'totp') {
          return {
            success: true,
            secret: 'JBSWY3DPEHPK3PXP',
            qrCode: 'data:image/svg+xml;base64,mock-qr-code'
          };
        } else if (method === 'backup_codes') {
          return {
            success: true,
            backupCodes: ['ABC123', 'DEF456', 'GHI789', 'JKL012']
          };
        }
        
        return { success: true };
      }

      const response = await fetch(`${apiBaseUrl}/mfa/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        throw new Error(`MFA setup failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MFA setup failed'
      };
    }
  }, [apiBaseUrl, enableMockData]);

  const verifyMFA = useCallback(async (code: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      if (enableMockData) {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Accept any 6-digit code for demo
        return { success: code.length === 6 };
      }

      const response = await fetch(`${apiBaseUrl}/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        throw new Error(`MFA verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh data after successful MFA setup
      if (result.success) {
        await refreshAllData();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MFA verification failed'
      };
    }
  }, [apiBaseUrl, enableMockData, refreshAllData]);

  // Session Management
  const refreshSession = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      if (enableMockData) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true };
      }

      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        throw new Error(`Session refresh failed: ${response.statusText}`);
      }

      await refreshAllData();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Session refresh failed'
      };
    }
  }, [apiBaseUrl, enableMockData, refreshAllData]);

  const logout = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      if (enableMockData) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setState(prev => ({
          ...prev,
          metrics: null,
          authStatus: null,
          recentEvents: [],
          auditLogs: []
        }));
        return { success: true };
      }

      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      setState(prev => ({
        ...prev,
        metrics: null,
        authStatus: null,
        recentEvents: [],
        auditLogs: []
      }));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed'
      };
    }
  }, [apiBaseUrl, enableMockData]);

  // Effects
  useEffect(() => {
    refreshAllData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refreshAllData]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(refreshAllData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshAllData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    refreshMetrics: refreshAllData,
    refreshSession,
    logout,
    
    // MFA
    enableMFA,
    verifyMFA,
    
    // Audit Logs
    loadAuditLogs: fetchAuditLogs,
    
    // Utilities
    isLoading: state.loading,
    hasError: !!state.error,
    isAuthenticated: state.authStatus?.isAuthenticated ?? false,
    isMFAEnabled: state.authStatus?.mfaEnabled ?? false,
    securityScore: state.metrics?.accountSecurityScore ?? 0,
    
    // Auto-refresh control
    setAutoRefresh: (enabled: boolean) => {
      if (enabled && !intervalRef.current) {
        intervalRef.current = setInterval(refreshAllData, refreshInterval);
      } else if (!enabled && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };
};

export default useSecurityMetrics;