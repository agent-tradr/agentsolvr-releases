import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

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

export interface ClaudeConnectionStatus {
  isConnected: boolean;
  authMethod: 'browser' | 'api_key' | 'none';
  lastConnectionAttempt: Date | null;
  connectionErrors: string[];
  apiKeyValid: boolean;
  browserAuthValid: boolean;
}

export interface ClaudeIntegrationData {
  status: ClaudeConnectionStatus;
  metrics: ClaudeMetrics;
  recentRequests: {
    id: string;
    timestamp: Date;
    method: string;
    status: 'success' | 'failure' | 'pending';
    responseTime: number;
    tokensUsed: number;
    cost: number;
    cached: boolean;
  }[];
  costOptimization: {
    enabled: boolean;
    totalSavings: number;
    compressionSavings: number;
    batchOptimizations: number;
    recommendations: string[];
  };
}

export interface ClaudeIntegrationDashboardProps {
  onTestConnection?: () => void;
  onToggleCaching?: (enabled: boolean) => void;
  onOptimizeSettings?: () => void;
  refreshInterval?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

export const ClaudeIntegrationDashboard: React.FC<ClaudeIntegrationDashboardProps> = ({
  onTestConnection,
  onToggleCaching,
  onOptimizeSettings,
  refreshInterval = 5000,
  className = '',
  theme = 'light'
}) => {
  const [dashboardData, setDashboardData] = useState<ClaudeIntegrationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // WebSocket connection for real-time updates
  const {
    isConnected: wsConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/claude',
    onConnect: () => {
      console.log('Connected to Claude integration WebSocket');
      requestDashboardData();
    },
    onError: (error) => {
      console.error('Claude integration WebSocket error:', error);
      setError('Failed to connect to Claude integration service');
    },
    autoReconnect: true
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'claude_metrics_update') {
      setDashboardData(lastMessage.data);
      setIsLoading(false);
      setLastUpdate(new Date());
      setError(null);
    }
  }, [lastMessage]);

  // Request dashboard data
  const requestDashboardData = useCallback(() => {
    if (wsConnected) {
      sendMessage('request_claude_metrics', {
        timestamp: new Date().toISOString()
      });
    }
  }, [wsConnected, sendMessage]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0 && wsConnected) {
      const interval = setInterval(requestDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, wsConnected, requestDashboardData]);

  // Initial data load
  useEffect(() => {
    if (wsConnected) {
      requestDashboardData();
    }
  }, [wsConnected, requestDashboardData]);

  const handleTestConnection = () => {
    if (onTestConnection) {
      onTestConnection();
    }
    if (wsConnected) {
      sendMessage('test_claude_connection', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleToggleCaching = (enabled: boolean) => {
    if (onToggleCaching) {
      onToggleCaching(enabled);
    }
    if (wsConnected) {
      sendMessage('toggle_claude_caching', {
        enabled,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleOptimizeSettings = () => {
    if (onOptimizeSettings) {
      onOptimizeSettings();
    }
    if (wsConnected) {
      sendMessage('optimize_claude_settings', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleForceRefresh = () => {
    setIsLoading(true);
    requestDashboardData();
  };

  // Default data for when no real data is available
  const defaultData: ClaudeIntegrationData = {
    status: {
      isConnected: false,
      authMethod: 'none',
      lastConnectionAttempt: null,
      connectionErrors: [],
      apiKeyValid: false,
      browserAuthValid: false
    },
    metrics: {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      cachingEnabled: true,
      cacheHitRate: 0,
      currentRateLimit: 0,
      rateLimitRemaining: 0,
      activeConnections: 0,
      lastRequestTimestamp: null
    },
    recentRequests: [],
    costOptimization: {
      enabled: true,
      totalSavings: 0,
      compressionSavings: 0,
      batchOptimizations: 0,
      recommendations: []
    }
  };

  const data = dashboardData || defaultData;
  const containerClass = `claude-integration-dashboard ${theme} ${className}`;

  const getStatusColor = (status: boolean) => {
    return status ? '#4CAF50' : '#F44336';
  };

  const getSuccessRate = () => {
    const total = data.metrics.totalRequests;
    if (total === 0) return 0;
    return Math.round((data.metrics.successfulRequests / total) * 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (isLoading && !dashboardData) {
    return (
      <div className={containerClass}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading Claude integration data...</p>
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
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Claude Integration Dashboard</h2>
          <div className="connection-status">
            <div className={`status-indicator ${data.status.isConnected ? 'connected' : 'disconnected'}`}>
              <span className="status-dot" />
              {data.status.isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <div className="auth-method">
              Auth: {data.status.authMethod.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="last-update">
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <button 
            className="test-connection-btn"
            onClick={handleTestConnection}
            disabled={!wsConnected}
          >
            Test Connection
          </button>
          <button 
            className="refresh-btn"
            onClick={handleForceRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-message">{error}</span>
          <button 
            className="error-dismiss"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Connection Errors */}
      {data.status.connectionErrors.length > 0 && (
        <div className="connection-errors">
          <h4>Connection Issues:</h4>
          <ul>
            {data.status.connectionErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Key Metrics */}
        <div className="metrics-section">
          <h3>Key Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Requests</div>
              <div className="metric-value">{formatNumber(data.metrics.totalRequests)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Success Rate</div>
              <div className="metric-value">{getSuccessRate()}%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Response Time</div>
              <div className="metric-value">{data.metrics.averageResponseTime}ms</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Cost</div>
              <div className="metric-value">{formatCurrency(data.metrics.totalCost)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Tokens Used</div>
              <div className="metric-value">{formatNumber(data.metrics.totalTokensUsed)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Cache Hit Rate</div>
              <div className="metric-value">{Math.round(data.metrics.cacheHitRate * 100)}%</div>
            </div>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="rate-limit-section">
          <h3>Rate Limiting</h3>
          <div className="rate-limit-info">
            <div className="rate-limit-bar">
              <div className="rate-limit-label">
                Current Usage: {data.metrics.currentRateLimit - data.metrics.rateLimitRemaining} / {data.metrics.currentRateLimit}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${((data.metrics.currentRateLimit - data.metrics.rateLimitRemaining) / data.metrics.currentRateLimit) * 100}%`
                  }}
                />
              </div>
            </div>
            <div className="active-connections">
              Active Connections: {data.metrics.activeConnections}
            </div>
          </div>
        </div>

        {/* Cost Optimization */}
        <div className="cost-optimization-section">
          <h3>Cost Optimization</h3>
          <div className="optimization-controls">
            <div className="optimization-stats">
              <div className="stat-item">
                <span className="stat-label">Total Savings:</span>
                <span className="stat-value savings">{formatCurrency(data.costOptimization.totalSavings)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Compression Savings:</span>
                <span className="stat-value">{Math.round(data.costOptimization.compressionSavings / 1024)} KB</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Batch Optimizations:</span>
                <span className="stat-value">{data.costOptimization.batchOptimizations}</span>
              </div>
            </div>
            
            <div className="optimization-controls-buttons">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={data.metrics.cachingEnabled}
                  onChange={(e) => handleToggleCaching(e.target.checked)}
                />
                <span className="toggle-slider">Caching</span>
              </label>
              <button 
                className="optimize-btn"
                onClick={handleOptimizeSettings}
              >
                Optimize Settings
              </button>
            </div>
          </div>

          {/* Recommendations */}
          {data.costOptimization.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Optimization Recommendations:</h4>
              <ul>
                {data.costOptimization.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="recent-requests-section">
          <h3>Recent Requests</h3>
          <div className="requests-table">
            <div className="table-header">
              <div className="header-cell">Time</div>
              <div className="header-cell">Method</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Response Time</div>
              <div className="header-cell">Tokens</div>
              <div className="header-cell">Cost</div>
              <div className="header-cell">Cached</div>
            </div>
            {data.recentRequests.slice(0, 10).map((request, index) => (
              <div key={request.id || index} className="table-row">
                <div className="cell">{request.timestamp.toLocaleTimeString()}</div>
                <div className="cell">{request.method}</div>
                <div className={`cell status-${request.status}`}>{request.status}</div>
                <div className="cell">{request.responseTime}ms</div>
                <div className="cell">{formatNumber(request.tokensUsed)}</div>
                <div className="cell">{formatCurrency(request.cost)}</div>
                <div className="cell">{request.cached ? '✓' : '✗'}</div>
              </div>
            ))}
            {data.recentRequests.length === 0 && (
              <div className="no-data">No recent requests</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .claude-integration-dashboard {
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          padding: 20px;
          border-radius: 8px;
          max-width: 1200px;
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

        .connection-status {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-indicator.connected .status-dot {
          background: #4CAF50;
        }

        .status-indicator.disconnected .status-dot {
          background: #F44336;
        }

        .auth-method {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          text-transform: uppercase;
          font-weight: 500;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .last-update {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .test-connection-btn, .refresh-btn, .optimize-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .test-connection-btn {
          background: #4CAF50;
          color: white;
        }

        .test-connection-btn:hover:not(:disabled) {
          background: #45a049;
        }

        .refresh-btn {
          background: #2196F3;
          color: white;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #1976D2;
        }

        .optimize-btn {
          background: #FF9800;
          color: white;
        }

        .optimize-btn:hover:not(:disabled) {
          background: #F57C00;
        }

        .test-connection-btn:disabled, .refresh-btn:disabled, .optimize-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
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

        .error-dismiss {
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

        .connection-errors {
          background: ${theme === 'dark' ? '#7f1d1d20' : '#ffebee'};
          border: 1px solid #F44336;
          border-radius: 4px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .connection-errors h4 {
          margin: 0 0 8px 0;
          color: #F44336;
        }

        .connection-errors ul {
          margin: 0;
          padding-left: 20px;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .metrics-section, .rate-limit-section, .cost-optimization-section, .recent-requests-section {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .metrics-section h3, .rate-limit-section h3, .cost-optimization-section h3, .recent-requests-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .metric-card {
          text-align: center;
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .metric-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 20px;
          font-weight: bold;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .rate-limit-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rate-limit-bar {
          flex: 1;
        }

        .rate-limit-label {
          font-size: 14px;
          margin-bottom: 8px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #FF9800, #F44336);
          transition: width 0.3s ease;
        }

        .active-connections {
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .optimization-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .optimization-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .stat-value {
          font-weight: 600;
        }

        .stat-value.savings {
          color: #4CAF50;
        }

        .optimization-controls-buttons {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .toggle-switch input[type="checkbox"] {
          margin-right: 4px;
        }

        .recommendations {
          margin-top: 16px;
        }

        .recommendations h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #FF9800;
        }

        .recommendations ul {
          margin: 0;
          padding-left: 20px;
        }

        .recommendations li {
          margin-bottom: 4px;
          font-size: 14px;
        }

        .requests-table {
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
        }

        .header-cell {
          padding: 12px 8px;
          font-weight: 600;
          font-size: 14px;
          border-right: 1px solid ${theme === 'dark' ? '#555555' : '#e0e0e0'};
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .table-row:hover {
          background: ${theme === 'dark' ? '#333333' : '#f5f5f5'};
        }

        .cell {
          padding: 8px;
          font-size: 13px;
          border-right: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          display: flex;
          align-items: center;
        }

        .cell.status-success {
          color: #4CAF50;
          font-weight: 500;
        }

        .cell.status-failure {
          color: #F44336;
          font-weight: 500;
        }

        .cell.status-pending {
          color: #FF9800;
          font-weight: 500;
        }

        .no-data {
          padding: 20px;
          text-align: center;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-style: italic;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-controls {
            flex-wrap: wrap;
            justify-content: center;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .optimization-stats {
            grid-template-columns: 1fr;
          }

          .optimization-controls-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .table-header, .table-row {
            grid-template-columns: repeat(7, minmax(80px, 1fr));
            font-size: 12px;
          }

          .cell, .header-cell {
            padding: 6px 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClaudeIntegrationDashboard;