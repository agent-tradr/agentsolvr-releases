import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number; // seconds
  lastRestart: Date | null;
  systemLoad: number; // 0-1
  memoryUsage: number; // 0-1
  diskUsage: number; // 0-1
  networkLatency: number; // ms
  errorRate: number; // 0-1
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
  throughput: number; // requests/second
  dependencies: string[];
  endpoints?: {
    health: string;
    metrics: string;
  };
  lastCheck: Date;
  issues: {
    type: 'connection' | 'performance' | 'error_rate' | 'timeout' | 'dependency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    since: Date;
  }[];
}

export interface PerformanceMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskIO: number;
  networkIO: number;
  requestsPerSecond: number;
  responseTime: number;
  errorCount: number;
  activeConnections: number;
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

export interface SystemConfiguration {
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildDate: Date;
  features: {
    [key: string]: {
      enabled: boolean;
      version: string;
      config?: any;
    };
  };
  limits: {
    maxConnections: number;
    maxRequestsPerSecond: number;
    maxMemoryUsage: number;
    maxDiskUsage: number;
  };
  maintenance: {
    scheduled: boolean;
    startTime: Date | null;
    duration: number | null;
    reason: string | null;
  };
}

export interface SystemStatusData {
  health: SystemHealth;
  services: ServiceStatus[];
  metrics: PerformanceMetrics[];
  alerts: SystemAlert[];
  configuration: SystemConfiguration;
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
}

export interface SystemStatusDashboardProps {
  onRestartService?: (serviceId: string) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  onTriggerMaintenance?: () => void;
  onExportDiagnostics?: () => void;
  onConfigureService?: (serviceId: string) => void;
  refreshInterval?: number;
  className?: string;
  theme?: 'light' | 'dark';
  expandedView?: boolean;
}

export const SystemStatusDashboard: React.FC<SystemStatusDashboardProps> = ({
  onRestartService,
  onAcknowledgeAlert,
  onTriggerMaintenance,
  onExportDiagnostics,
  onConfigureService,
  refreshInterval = 30000, // 30 seconds
  className = '',
  theme = 'light',
  expandedView = true
}) => {
  const [systemData, setSystemData] = useState<SystemStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // WebSocket connection for real-time system updates
  const {
    isConnected: wsConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/system-status',
    onConnect: () => {
      console.log('Connected to system status WebSocket');
      requestSystemData();
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
      setSystemData(lastMessage.data);
      setIsLoading(false);
      setLastUpdate(new Date());
      setError(null);
    }
  }, [lastMessage]);

  // Request system data
  const requestSystemData = useCallback(() => {
    if (wsConnected) {
      sendMessage('request_system_status', {
        timeRange,
        includeMetrics: true,
        includeConfiguration: showConfiguration,
        timestamp: new Date().toISOString()
      });
    }
  }, [wsConnected, sendMessage, timeRange, showConfiguration]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0 && wsConnected) {
      const interval = setInterval(requestSystemData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, wsConnected, requestSystemData]);

  // Initial data load
  useEffect(() => {
    if (wsConnected) {
      requestSystemData();
    }
  }, [wsConnected, requestSystemData]);

  const handleRestartService = (serviceId: string) => {
    if (onRestartService) {
      onRestartService(serviceId);
    }

    if (wsConnected) {
      sendMessage('restart_service', {
        serviceId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    if (onAcknowledgeAlert) {
      onAcknowledgeAlert(alertId);
    }

    if (wsConnected) {
      sendMessage('acknowledge_alert', {
        alertId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleTriggerMaintenance = () => {
    if (onTriggerMaintenance) {
      onTriggerMaintenance();
    }

    if (wsConnected) {
      sendMessage('trigger_maintenance', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleExportDiagnostics = () => {
    if (onExportDiagnostics) {
      onExportDiagnostics();
    }

    if (wsConnected) {
      sendMessage('export_diagnostics', {
        timeRange,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Default data for when no real data is available
  const defaultData: SystemStatusData = {
    health: {
      overall: 'healthy',
      uptime: 86400, // 1 day
      lastRestart: new Date(Date.now() - 86400000),
      systemLoad: 0.45,
      memoryUsage: 0.67,
      diskUsage: 0.34,
      networkLatency: 25,
      errorRate: 0.001,
      activeProcesses: 42,
      queuedTasks: 3
    },
    services: [
      {
        id: 'backend_api',
        name: 'Backend API',
        type: 'backend',
        status: 'online',
        health: 'healthy',
        uptime: 86300,
        responseTime: 125,
        errorRate: 0.002,
        throughput: 45.3,
        dependencies: ['database', 'cache'],
        endpoints: {
          health: '/health',
          metrics: '/metrics'
        },
        lastCheck: new Date(),
        issues: []
      },
      {
        id: 'database',
        name: 'PostgreSQL Database',
        type: 'database',
        status: 'online',
        health: 'warning',
        uptime: 86400,
        responseTime: 15,
        errorRate: 0,
        throughput: 120.5,
        dependencies: [],
        lastCheck: new Date(),
        issues: [
          {
            type: 'performance',
            severity: 'medium',
            message: 'Connection pool at 85% capacity',
            since: new Date(Date.now() - 3600000)
          }
        ]
      }
    ],
    metrics: [],
    alerts: [
      {
        id: 'alert_1',
        type: 'performance',
        severity: 'warning',
        title: 'High Memory Usage',
        message: 'System memory usage is at 67%, approaching threshold of 70%',
        timestamp: new Date(Date.now() - 300000),
        affectedServices: ['backend_api'],
        actionRequired: false,
        acknowledged: false,
        resolvedAt: null,
        metadata: {
          threshold: 70,
          current: 67,
          trend: 'increasing'
        }
      }
    ],
    configuration: {
      environment: 'development',
      version: '4.0.0-beta',
      buildDate: new Date('2025-09-19'),
      features: {
        claude_integration: {
          enabled: true,
          version: '2.1.0'
        },
        realtime_monitoring: {
          enabled: true,
          version: '1.5.0'
        },
        security_dashboard: {
          enabled: true,
          version: '1.0.0'
        }
      },
      limits: {
        maxConnections: 1000,
        maxRequestsPerSecond: 100,
        maxMemoryUsage: 0.8,
        maxDiskUsage: 0.9
      },
      maintenance: {
        scheduled: false,
        startTime: null,
        duration: null,
        reason: null
      }
    },
    diagnostics: {
      databaseConnections: 25,
      cacheHitRate: 0.89,
      queueProcessingRate: 15.7,
      apiResponseTimes: {
        '/api/health': 12,
        '/api/agents': 145,
        '/api/claude': 230,
        '/api/security': 67
      },
      resourceUtilization: {
        cpu: 0.45,
        memory: 0.67,
        disk: 0.34,
        network: 0.23
      }
    },
    trends: {
      performanceTrend: 'stable',
      reliabilityTrend: 'improving',
      capacityTrend: 'stable',
      errorTrend: 'decreasing'
    }
  };

  const data = systemData || defaultData;
  const containerClass = `system-status-dashboard ${theme} ${className} ${expandedView ? 'expanded' : 'compact'}`;

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'critical': return '#F44336';
      case 'unknown': return '#9E9E9E';
      default: return '#777777';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'degraded': return '#FF9800';
      case 'offline': return '#F44336';
      case 'maintenance': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return '#2196F3';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      case 'critical': return '#D32F2F';
      default: return '#777777';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': case 'decreasing': return '📈';
      case 'degrading': case 'increasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (isLoading && !systemData) {
    return (
      <div className={containerClass}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading system status...</p>
        </div>
        <style>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
            border-top: 3px solid #2196F3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h2>System Status Dashboard</h2>
          <div className="system-overview">
            <div 
              className="health-indicator"
              style={{color: getHealthColor(data.health.overall)}}
            >
              ● {data.health.overall.toUpperCase()}
            </div>
            <div className="uptime-info">
              Uptime: {formatUptime(data.health.uptime)}
            </div>
            <div className="environment-badge">
              {data.configuration.environment.toUpperCase()}
            </div>
          </div>
        </div>
        <div className="header-controls">
          <div className="time-range-selector">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '1h' | '6h' | '24h' | '7d')}
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <button 
            className="config-btn"
            onClick={() => setShowConfiguration(!showConfiguration)}
          >
            Config
          </button>
          <button 
            className="maintenance-btn"
            onClick={handleTriggerMaintenance}
          >
            Maintenance
          </button>
          <button 
            className="export-btn"
            onClick={handleExportDiagnostics}
          >
            Export
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-message">{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Critical Alerts */}
      {data.alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length > 0 && (
        <div className="critical-alerts">
          <h3>🚨 Critical Alerts</h3>
          {data.alerts
            .filter(alert => alert.severity === 'critical' && !alert.acknowledged)
            .map(alert => (
              <div key={alert.id} className="critical-alert">
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-meta">
                    Affected services: {alert.affectedServices.join(', ')}
                  </div>
                </div>
                <button 
                  className="acknowledge-btn"
                  onClick={() => handleAcknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </button>
              </div>
            ))
          }
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        {/* System Health Overview */}
        <div className="health-section">
          <h3>System Health</h3>
          <div className="health-grid">
            <div className="health-card">
              <div className="health-label">System Load</div>
              <div className="health-value">{formatPercentage(data.health.systemLoad)}</div>
              <div className="health-bar">
                <div 
                  className="health-fill"
                  style={{
                    width: `${data.health.systemLoad * 100}%`,
                    backgroundColor: data.health.systemLoad > 0.8 ? '#F44336' : data.health.systemLoad > 0.6 ? '#FF9800' : '#4CAF50'
                  }}
                />
              </div>
            </div>
            <div className="health-card">
              <div className="health-label">Memory Usage</div>
              <div className="health-value">{formatPercentage(data.health.memoryUsage)}</div>
              <div className="health-bar">
                <div 
                  className="health-fill"
                  style={{
                    width: `${data.health.memoryUsage * 100}%`,
                    backgroundColor: data.health.memoryUsage > 0.8 ? '#F44336' : data.health.memoryUsage > 0.6 ? '#FF9800' : '#4CAF50'
                  }}
                />
              </div>
            </div>
            <div className="health-card">
              <div className="health-label">Disk Usage</div>
              <div className="health-value">{formatPercentage(data.health.diskUsage)}</div>
              <div className="health-bar">
                <div 
                  className="health-fill"
                  style={{
                    width: `${data.health.diskUsage * 100}%`,
                    backgroundColor: data.health.diskUsage > 0.9 ? '#F44336' : data.health.diskUsage > 0.7 ? '#FF9800' : '#4CAF50'
                  }}
                />
              </div>
            </div>
            <div className="health-card">
              <div className="health-label">Network Latency</div>
              <div className="health-value">{data.health.networkLatency}ms</div>
              <div className="health-detail">
                Error rate: {formatPercentage(data.health.errorRate)}
              </div>
            </div>
            <div className="health-card">
              <div className="health-label">Active Processes</div>
              <div className="health-value">{data.health.activeProcesses}</div>
              <div className="health-detail">
                Queued: {data.health.queuedTasks}
              </div>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="services-section">
          <h3>Services ({data.services.length})</h3>
          <div className="services-grid">
            {data.services.map(service => (
              <div 
                key={service.id} 
                className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
              >
                <div className="service-header">
                  <div className="service-info">
                    <div className="service-name">{service.name}</div>
                    <div className="service-type">{service.type}</div>
                  </div>
                  <div className="service-status">
                    <div 
                      className="status-dot"
                      style={{backgroundColor: getStatusColor(service.status)}}
                    />
                    <span className="status-text">{service.status}</span>
                  </div>
                </div>
                
                <div className="service-metrics">
                  <div className="metric-row">
                    <span>Uptime:</span>
                    <span>{formatUptime(service.uptime)}</span>
                  </div>
                  <div className="metric-row">
                    <span>Response:</span>
                    <span>{service.responseTime}ms</span>
                  </div>
                  <div className="metric-row">
                    <span>Throughput:</span>
                    <span>{service.throughput.toFixed(1)}/s</span>
                  </div>
                  <div className="metric-row">
                    <span>Error Rate:</span>
                    <span>{formatPercentage(service.errorRate)}</span>
                  </div>
                </div>

                {service.issues.length > 0 && (
                  <div className="service-issues">
                    {service.issues.slice(0, 2).map((issue, index) => (
                      <div key={index} className={`issue issue-${issue.severity}`}>
                        <div className="issue-type">{issue.type}</div>
                        <div className="issue-message">{issue.message}</div>
                      </div>
                    ))}
                    {service.issues.length > 2 && (
                      <div className="more-issues">
                        +{service.issues.length - 2} more issues
                      </div>
                    )}
                  </div>
                )}

                <div className="service-actions">
                  {service.status !== 'maintenance' && (
                    <button 
                      className="restart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestartService(service.id);
                      }}
                    >
                      Restart
                    </button>
                  )}
                  {onConfigureService && (
                    <button 
                      className="configure-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfigureService(service.id);
                      }}
                    >
                      Configure
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostics */}
        <div className="diagnostics-section">
          <h3>System Diagnostics</h3>
          <div className="diagnostics-grid">
            <div className="diagnostic-card">
              <div className="diagnostic-label">Database</div>
              <div className="diagnostic-metrics">
                <div className="metric">
                  <span>Active Connections:</span>
                  <span>{data.diagnostics.databaseConnections}</span>
                </div>
                <div className="metric">
                  <span>Cache Hit Rate:</span>
                  <span>{formatPercentage(data.diagnostics.cacheHitRate)}</span>
                </div>
              </div>
            </div>
            <div className="diagnostic-card">
              <div className="diagnostic-label">Queue Processing</div>
              <div className="diagnostic-metrics">
                <div className="metric">
                  <span>Processing Rate:</span>
                  <span>{data.diagnostics.queueProcessingRate.toFixed(1)}/s</span>
                </div>
                <div className="metric">
                  <span>Queued Tasks:</span>
                  <span>{data.health.queuedTasks}</span>
                </div>
              </div>
            </div>
            <div className="diagnostic-card">
              <div className="diagnostic-label">API Response Times</div>
              <div className="diagnostic-metrics">
                {Object.entries(data.diagnostics.apiResponseTimes).map(([endpoint, time]) => (
                  <div key={endpoint} className="metric">
                    <span>{endpoint}:</span>
                    <span>{time}ms</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Trends */}
        <div className="trends-section">
          <h3>System Trends</h3>
          <div className="trends-grid">
            <div className="trend-card">
              <div className="trend-icon">{getTrendIcon(data.trends.performanceTrend)}</div>
              <div className="trend-info">
                <div className="trend-label">Performance</div>
                <div className="trend-value">{data.trends.performanceTrend}</div>
              </div>
            </div>
            <div className="trend-card">
              <div className="trend-icon">{getTrendIcon(data.trends.reliabilityTrend)}</div>
              <div className="trend-info">
                <div className="trend-label">Reliability</div>
                <div className="trend-value">{data.trends.reliabilityTrend}</div>
              </div>
            </div>
            <div className="trend-card">
              <div className="trend-icon">{getTrendIcon(data.trends.capacityTrend)}</div>
              <div className="trend-info">
                <div className="trend-label">Capacity</div>
                <div className="trend-value">{data.trends.capacityTrend}</div>
              </div>
            </div>
            <div className="trend-card">
              <div className="trend-icon">{getTrendIcon(data.trends.errorTrend)}</div>
              <div className="trend-info">
                <div className="trend-label">Error Rate</div>
                <div className="trend-value">{data.trends.errorTrend}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="alerts-section">
          <h3>Recent Alerts ({data.alerts.filter(a => !a.acknowledged).length} active)</h3>
          <div className="alerts-list">
            {data.alerts.filter(alert => !alert.acknowledged).length === 0 ? (
              <div className="no-alerts">No active alerts</div>
            ) : (
              data.alerts
                .filter(alert => !alert.acknowledged)
                .slice(0, 5)
                .map(alert => (
                  <div key={alert.id} className={`alert-item alert-${alert.severity}`}>
                    <div className="alert-content">
                      <div className="alert-header">
                        <div className="alert-title">{alert.title}</div>
                        <div className="alert-time">{alert.timestamp.toLocaleTimeString()}</div>
                      </div>
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-services">
                        Services: {alert.affectedServices.join(', ')}
                      </div>
                    </div>
                    <div className="alert-actions">
                      <button 
                        className="acknowledge-btn"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfiguration && (
          <div className="configuration-section">
            <h3>System Configuration</h3>
            <div className="config-grid">
              <div className="config-card">
                <div className="config-label">Environment</div>
                <div className="config-value">{data.configuration.environment}</div>
              </div>
              <div className="config-card">
                <div className="config-label">Version</div>
                <div className="config-value">{data.configuration.version}</div>
              </div>
              <div className="config-card">
                <div className="config-label">Build Date</div>
                <div className="config-value">{data.configuration.buildDate.toLocaleDateString()}</div>
              </div>
              <div className="config-card">
                <div className="config-label">Features</div>
                <div className="features-list">
                  {Object.entries(data.configuration.features).map(([name, feature]) => (
                    <div key={name} className="feature-item">
                      <span className={`feature-status ${feature.enabled ? 'enabled' : 'disabled'}`}>
                        {feature.enabled ? '✓' : '✗'}
                      </span>
                      <span className="feature-name">{name.replace('_', ' ')}</span>
                      <span className="feature-version">v{feature.version}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .system-status-dashboard {
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          padding: 20px;
          border-radius: 8px;
          max-width: 1600px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 16px;
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-info h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #2196F3;
        }

        .system-overview {
          display: flex;
          gap: 16px;
          align-items: center;
          font-size: 14px;
        }

        .health-indicator {
          font-weight: 600;
          font-size: 16px;
        }

        .uptime-info {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .environment-badge {
          padding: 2px 8px;
          background: #2196F3;
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-range-selector select {
          padding: 6px 12px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#cccccc'};
          border-radius: 4px;
          background: ${theme === 'dark' ? '#404040' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          font-size: 14px;
        }

        .config-btn, .maintenance-btn, .export-btn, .restart-btn, .configure-btn, .acknowledge-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .config-btn {
          background: #2196F3;
          color: white;
        }

        .config-btn:hover {
          background: #1976D2;
        }

        .maintenance-btn {
          background: #FF9800;
          color: white;
        }

        .maintenance-btn:hover {
          background: #F57C00;
        }

        .export-btn {
          background: #4CAF50;
          color: white;
        }

        .export-btn:hover {
          background: #45a049;
        }

        .error-banner {
          background: #F44336;
          color: white;
          padding: 12px 16px;
          margin-bottom: 16px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-banner button {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .critical-alerts {
          background: #ffebee;
          border: 2px solid #F44336;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .critical-alerts h3 {
          margin: 0 0 12px 0;
          color: #F44336;
          font-size: 18px;
          font-weight: 600;
        }

        .critical-alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .alert-message {
          font-size: 14px;
          margin-bottom: 4px;
        }

        .alert-meta {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .acknowledge-btn {
          background: #F44336;
          color: white;
        }

        .acknowledge-btn:hover {
          background: #D32F2F;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .health-section, .services-section, .diagnostics-section, .trends-section, .alerts-section, .configuration-section {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .health-section h3, .services-section h3, .diagnostics-section h3, .trends-section h3, .alerts-section h3, .configuration-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .health-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .health-card {
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .health-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 8px;
        }

        .health-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .health-detail {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .health-bar {
          width: 100%;
          height: 6px;
          background: ${theme === 'dark' ? '#555555' : '#e0e0e0'};
          border-radius: 3px;
          overflow: hidden;
          margin-top: 8px;
        }

        .health-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .service-card {
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .service-card:hover {
          border-color: #2196F3;
          box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
        }

        .service-card.selected {
          border-color: #2196F3;
          background: ${theme === 'dark' ? '#1e3a8a20' : '#e3f2fd'};
        }

        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .service-info {
          flex: 1;
        }

        .service-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .service-type {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          text-transform: capitalize;
        }

        .service-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-text {
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .service-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          margin-bottom: 12px;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .metric-row span:first-child {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .metric-row span:last-child {
          font-weight: 500;
        }

        .service-issues {
          margin-bottom: 12px;
        }

        .issue {
          padding: 6px 8px;
          border-radius: 4px;
          margin-bottom: 4px;
          font-size: 11px;
        }

        .issue.issue-low {
          background: ${theme === 'dark' ? '#14532d20' : '#e8f5e8'};
          border-left: 3px solid #4CAF50;
        }

        .issue.issue-medium {
          background: ${theme === 'dark' ? '#92400e20' : '#fff3e0'};
          border-left: 3px solid #FF9800;
        }

        .issue.issue-high {
          background: ${theme === 'dark' ? '#7f1d1d20' : '#ffebee'};
          border-left: 3px solid #F44336;
        }

        .issue.issue-critical {
          background: ${theme === 'dark' ? '#7f1d1d40' : '#ffcdd2'};
          border-left: 3px solid #D32F2F;
        }

        .issue-type {
          font-weight: 500;
          text-transform: capitalize;
          margin-bottom: 2px;
        }

        .issue-message {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .more-issues {
          font-size: 11px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-style: italic;
        }

        .service-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .restart-btn {
          background: #FF9800;
          color: white;
        }

        .restart-btn:hover {
          background: #F57C00;
        }

        .configure-btn {
          background: #2196F3;
          color: white;
        }

        .configure-btn:hover {
          background: #1976D2;
        }

        .diagnostics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .diagnostic-card {
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .diagnostic-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .diagnostic-metrics {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metric {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .metric span:first-child {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .metric span:last-child {
          font-weight: 500;
        }

        .trends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .trend-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .trend-icon {
          font-size: 24px;
        }

        .trend-info {
          flex: 1;
        }

        .trend-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 4px;
        }

        .trend-value {
          font-size: 16px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
        }

        .no-alerts {
          text-align: center;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-style: italic;
          padding: 20px;
        }

        .alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .alert-item.alert-info {
          background: ${theme === 'dark' ? '#1e3a8a20' : '#e3f2fd'};
          border-color: #2196F3;
        }

        .alert-item.alert-warning {
          background: ${theme === 'dark' ? '#92400e20' : '#fff3e0'};
          border-color: #FF9800;
        }

        .alert-item.alert-error {
          background: ${theme === 'dark' ? '#7f1d1d20' : '#ffebee'};
          border-color: #F44336;
        }

        .alert-item.alert-critical {
          background: ${theme === 'dark' ? '#7f1d1d40' : '#ffcdd2'};
          border-color: #D32F2F;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .alert-title {
          font-weight: 600;
          font-size: 14px;
        }

        .alert-time {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .alert-message {
          font-size: 13px;
          margin-bottom: 4px;
        }

        .alert-services {
          font-size: 11px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .alert-actions {
          margin-left: 12px;
        }

        .config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .config-card {
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .config-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 8px;
        }

        .config-value {
          font-size: 16px;
          font-weight: 600;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .feature-status {
          width: 16px;
          text-align: center;
          font-weight: bold;
        }

        .feature-status.enabled {
          color: #4CAF50;
        }

        .feature-status.disabled {
          color: #F44336;
        }

        .feature-name {
          flex: 1;
          text-transform: capitalize;
        }

        .feature-version {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-size: 10px;
        }

        @media (max-width: 1024px) {
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
          }

          .system-overview {
            flex-wrap: wrap;
            justify-content: center;
          }

          .header-controls {
            flex-wrap: wrap;
            justify-content: center;
          }

          .health-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .diagnostics-grid {
            grid-template-columns: 1fr;
          }

          .trends-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .config-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .system-status-dashboard {
            padding: 16px;
          }

          .health-grid {
            grid-template-columns: 1fr;
          }

          .trends-grid {
            grid-template-columns: 1fr;
          }

          .service-metrics {
            grid-template-columns: 1fr;
          }

          .alert-item {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .alert-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .alert-actions {
            margin-left: 0;
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default SystemStatusDashboard;