import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import useWebSocket from '../hooks/useWebSocket';

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  lastRestart: Date | null;
  systemLoad: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  errorRate: number;
  activeProcesses: number;
  queuedTasks: number;
}

export interface ServiceStatus {
  id: string;
  name: string;
  type: 'backend' | 'database' | 'cache' | 'queue' | 'api' | 'websocket' | 'external';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  health: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  dependencies: string[];
  lastCheck: Date;
  issues: {
    type: 'connection' | 'performance' | 'error_rate' | 'timeout' | 'dependency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    since: Date;
  }[];
}

export interface SystemAlert {
  id: string;
  type: 'system' | 'service' | 'performance' | 'security' | 'capacity';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  affectedServices: string[];
  actionRequired: boolean;
  acknowledged: boolean;
  resolvedAt: Date | null;
  metadata?: {
    threshold?: number;
    current?: number;
    expected?: number;
    trend?: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface SystemStatusData {
  health: SystemHealth;
  services: ServiceStatus[];
  alerts: SystemAlert[];
  diagnostics: {
    databaseConnections: number;
    cacheHitRate: number;
    queueProcessingRate: number;
    apiResponseTimes: {
      [endpoint: string]: number;
    };
    resourceUtilization: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
  };
  trends: {
    performanceTrend: 'improving' | 'degrading' | 'stable';
    reliabilityTrend: 'improving' | 'degrading' | 'stable';
    capacityTrend: 'increasing' | 'decreasing' | 'stable';
    errorTrend: 'increasing' | 'decreasing' | 'stable';
  };
  lastUpdate: Date;
}

export interface SystemStatusContextType {
  // Data
  data: SystemStatusData | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;

  // Actions
  refreshData: () => void;
  restartService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  acknowledgeAlert: (alertId: string) => Promise<{ success: boolean; error?: string }>;
  triggerMaintenance: () => Promise<{ success: boolean; error?: string }>;
  exportDiagnostics: () => Promise<{ success: boolean; error?: string }>;

  // Service management
  getServiceStatus: (serviceId: string) => ServiceStatus | null;
  getSystemHealth: () => SystemHealth | null;
  getCriticalAlerts: () => SystemAlert[];
  getActiveIssues: () => SystemAlert[];

  // Monitoring
  enableMockData: boolean;
  setEnableMockData: (enabled: boolean) => void;
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
}

const SystemStatusContext = createContext<SystemStatusContextType | undefined>(undefined);

export interface SystemStatusProviderProps {
  children: ReactNode;
  enableMockData?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const SystemStatusProvider: React.FC<SystemStatusProviderProps> = ({
  children,
  enableMockData: initialEnableMockData = false,
  autoRefresh: initialAutoRefresh = true,
  refreshInterval: initialRefreshInterval = 30000
}) => {
  const [data, setData] = useState<SystemStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enableMockData, setEnableMockData] = useState(initialEnableMockData);
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);
  const [refreshInterval, setRefreshInterval] = useState(initialRefreshInterval);

  // WebSocket connection for real-time updates
  const {
    isConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/system-status',
    onConnect: () => {
      console.log('Connected to system status WebSocket');
      if (!enableMockData) {
        refreshData();
      }
    },
    onError: (error) => {
      console.error('System status WebSocket error:', error);
      setError('Failed to connect to system monitoring service');
    },
    autoReconnect: true
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'system_status_update') {
      setData(lastMessage.data);
      setLoading(false);
      setError(null);
    }
  }, [lastMessage]);

  // Mock data generator
  const generateMockData = useCallback((): SystemStatusData => {
    const now = new Date();
    
    return {
      health: {
        overall: 'healthy',
        uptime: 86400 + Math.random() * 172800, // 1-3 days
        lastRestart: new Date(now.getTime() - (86400 + Math.random() * 172800) * 1000),
        systemLoad: 0.3 + Math.random() * 0.4, // 30-70%
        memoryUsage: 0.5 + Math.random() * 0.3, // 50-80%
        diskUsage: 0.2 + Math.random() * 0.3, // 20-50%
        networkLatency: 20 + Math.random() * 30, // 20-50ms
        errorRate: Math.random() * 0.01, // 0-1%
        activeProcesses: 35 + Math.floor(Math.random() * 20), // 35-55
        queuedTasks: Math.floor(Math.random() * 10) // 0-10
      },
      services: [
        {
          id: 'backend_api',
          name: 'Backend API',
          type: 'backend',
          status: 'online',
          health: 'healthy',
          uptime: 86300,
          responseTime: 100 + Math.random() * 50,
          errorRate: Math.random() * 0.005,
          throughput: 40 + Math.random() * 20,
          dependencies: ['database', 'cache'],
          lastCheck: now,
          issues: []
        },
        {
          id: 'database',
          name: 'PostgreSQL Database',
          type: 'database',
          status: 'online',
          health: Math.random() > 0.7 ? 'warning' : 'healthy',
          uptime: 86400,
          responseTime: 10 + Math.random() * 10,
          errorRate: 0,
          throughput: 100 + Math.random() * 50,
          dependencies: [],
          lastCheck: now,
          issues: Math.random() > 0.7 ? [
            {
              type: 'performance',
              severity: 'medium',
              message: 'Connection pool at 85% capacity',
              since: new Date(now.getTime() - 3600000)
            }
          ] : []
        },
        {
          id: 'cache_redis',
          name: 'Redis Cache',
          type: 'cache',
          status: 'online',
          health: 'healthy',
          uptime: 85000,
          responseTime: 2 + Math.random() * 3,
          errorRate: 0,
          throughput: 200 + Math.random() * 100,
          dependencies: [],
          lastCheck: now,
          issues: []
        },
        {
          id: 'websocket_server',
          name: 'WebSocket Server',
          type: 'websocket',
          status: 'online',
          health: 'healthy',
          uptime: 84000,
          responseTime: 5 + Math.random() * 10,
          errorRate: Math.random() * 0.002,
          throughput: 50 + Math.random() * 30,
          dependencies: ['backend_api'],
          lastCheck: now,
          issues: []
        }
      ],
      alerts: Math.random() > 0.5 ? [
        {
          id: 'alert_memory_usage',
          type: 'performance',
          severity: 'warning',
          title: 'High Memory Usage',
          message: 'System memory usage is approaching 80% threshold',
          timestamp: new Date(now.getTime() - 300000),
          affectedServices: ['backend_api'],
          actionRequired: false,
          acknowledged: false,
          resolvedAt: null,
          metadata: {
            threshold: 80,
            current: 75,
            trend: 'increasing'
          }
        }
      ] : [],
      diagnostics: {
        databaseConnections: 20 + Math.floor(Math.random() * 15),
        cacheHitRate: 0.85 + Math.random() * 0.1,
        queueProcessingRate: 12 + Math.random() * 8,
        apiResponseTimes: {
          '/api/health': 8 + Math.random() * 8,
          '/api/agents': 120 + Math.random() * 50,
          '/api/claude': 200 + Math.random() * 100,
          '/api/security': 50 + Math.random() * 30
        },
        resourceUtilization: {
          cpu: 0.3 + Math.random() * 0.4,
          memory: 0.5 + Math.random() * 0.3,
          disk: 0.2 + Math.random() * 0.3,
          network: 0.1 + Math.random() * 0.3
        }
      },
      trends: {
        performanceTrend: Math.random() > 0.6 ? 'stable' : Math.random() > 0.5 ? 'improving' : 'degrading',
        reliabilityTrend: Math.random() > 0.7 ? 'improving' : 'stable',
        capacityTrend: Math.random() > 0.8 ? 'increasing' : 'stable',
        errorTrend: Math.random() > 0.9 ? 'increasing' : 'decreasing'
      },
      lastUpdate: now
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

  // Auto-refresh real data
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
      sendMessage('request_system_status', {
        includeMetrics: true,
        includeConfiguration: false,
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, sendMessage, enableMockData, generateMockData]);

  const restartService = useCallback(async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Update mock data to show service restarting
      if (data) {
        const updatedServices = data.services.map(service =>
          service.id === serviceId
            ? { ...service, status: 'online' as const, lastCheck: new Date(), uptime: 0 }
            : service
        );
        setData({ ...data, services: updatedServices });
      }
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('restart_service', {
      serviceId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Update mock data to acknowledge alert
      if (data) {
        const updatedAlerts = data.alerts.map(alert =>
          alert.id === alertId
            ? { ...alert, acknowledged: true }
            : alert
        );
        setData({ ...data, alerts: updatedAlerts });
      }
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('acknowledge_alert', {
      alertId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const triggerMaintenance = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('trigger_maintenance', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const exportDiagnostics = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Simulate file download
      const diagnosticsData = {
        exportTime: new Date().toISOString(),
        systemHealth: data?.health,
        services: data?.services,
        diagnostics: data?.diagnostics
      };
      
      const blob = new Blob([JSON.stringify(diagnosticsData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('export_diagnostics', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const getServiceStatus = useCallback((serviceId: string): ServiceStatus | null => {
    if (!data) return null;
    return data.services.find(service => service.id === serviceId) || null;
  }, [data]);

  const getSystemHealth = useCallback((): SystemHealth | null => {
    return data?.health || null;
  }, [data]);

  const getCriticalAlerts = useCallback((): SystemAlert[] => {
    if (!data) return [];
    return data.alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);
  }, [data]);

  const getActiveIssues = useCallback((): SystemAlert[] => {
    if (!data) return [];
    return data.alerts.filter(alert => !alert.acknowledged && !alert.resolvedAt);
  }, [data]);

  const contextValue: SystemStatusContextType = {
    // Data
    data,
    loading,
    error,
    isConnected,

    // Actions
    refreshData,
    restartService,
    acknowledgeAlert,
    triggerMaintenance,
    exportDiagnostics,

    // Service management
    getServiceStatus,
    getSystemHealth,
    getCriticalAlerts,
    getActiveIssues,

    // Monitoring
    enableMockData,
    setEnableMockData,
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval
  };

  return (
    <SystemStatusContext.Provider value={contextValue}>
      {children}
    </SystemStatusContext.Provider>
  );
};

export const useSystemStatus = (): SystemStatusContextType => {
  const context = useContext(SystemStatusContext);
  if (context === undefined) {
    throw new Error('useSystemStatus must be used within a SystemStatusProvider');
  }
  return context;
};

export default SystemStatusContext;