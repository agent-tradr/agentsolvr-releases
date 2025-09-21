import React, { useState, useEffect } from 'react';

/**
 * SecurityDashboard Component
 * 
 * Main security dashboard providing oversight of authentication status,
 * security metrics, audit logs, and MFA configuration.
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

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'logout' | 'failed_auth' | 'mfa_challenge' | 'session_refresh' | 'rate_limit' | 'security_warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

interface SecurityDashboardProps {
  onMFASetupClick: () => void;
  onViewAuditLogs: () => void;
  onRefreshMetrics: () => void;
  theme?: 'light' | 'dark';
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  onMFASetupClick,
  onViewAuditLogs,
  onRefreshMetrics,
  theme = 'light'
}) => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for initial implementation
  const mockMetrics: SecurityMetrics = {
    activeSessionsCount: 1,
    failedAuthAttempts: 0,
    sessionDuration: 14.5, // hours
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
  };

  const mockEvents: SecurityEvent[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      eventType: 'login',
      severity: 'low',
      description: 'Successful authentication via browser',
      userAgent: 'AgentSOLVR/4.0',
      ipAddress: '192.168.1.100',
      location: 'Local Network'
    },
    {
      id: '2', 
      timestamp: new Date(Date.now() - 900000).toISOString(),
      eventType: 'session_refresh',
      severity: 'low',
      description: 'Session tokens refreshed automatically',
      userAgent: 'AgentSOLVR/4.0'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      eventType: 'security_warning',
      severity: 'medium',
      description: 'MFA not enabled - consider enabling for enhanced security',
      userAgent: 'System'
    }
  ];

  useEffect(() => {
    loadSecurityMetrics();
    const interval = autoRefresh ? setInterval(loadSecurityMetrics, 30000) : null;
    return () => interval && clearInterval(interval);
  }, [autoRefresh]);

  const loadSecurityMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In real implementation, this would fetch from backend API
      // const response = await fetch('/api/security/metrics');
      // const data = await response.json();
      
      setMetrics(mockMetrics);
      setRecentEvents(mockEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security metrics');
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score: number): string => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#FF9800'; // Orange  
    if (score >= 50) return '#FF5722'; // Red-Orange
    return '#F44336'; // Red
  };

  const getEventSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return theme === 'dark' ? '#81C784' : '#4CAF50';
      case 'medium': return theme === 'dark' ? '#FFB74D' : '#FF9800';
      case 'high': return theme === 'dark' ? '#FF8A65' : '#FF5722';
      case 'critical': return theme === 'dark' ? '#E57373' : '#F44336';
      default: return theme === 'dark' ? '#90A4AE' : '#607D8B';
    }
  };

  const handleManualRefresh = () => {
    loadSecurityMetrics();
    onRefreshMetrics();
  };

  if (loading && !metrics) {
    return (
      <div className={`security-dashboard loading ${theme}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading security metrics...</p>
        </div>
        <style>{`
          .security-dashboard.loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 8px;
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          }
          .loading-spinner {
            text-align: center;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
            border-top: 3px solid #2196F3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`security-dashboard error ${theme}`}>
        <div className="error-content">
          <h3>Security Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={handleManualRefresh} className="retry-button">
            Retry
          </button>
        </div>
        <style>{`
          .security-dashboard.error {
            padding: 24px;
            text-align: center;
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 8px;
            border: 1px solid #F44336;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          }
          .error-content h3 {
            color: #F44336;
            margin-bottom: 12px;
          }
          .retry-button {
            background: #2196F3;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`security-dashboard ${theme}`}>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Security Dashboard</h2>
          <div className="header-controls">
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <button onClick={handleManualRefresh} className="refresh-button">
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="metrics-grid">
        {/* Session Status Card */}
        <div className="metric-card">
          <div className="card-header">
            <h3>Session Status</h3>
            <div className={`status-indicator ${metrics?.sessionValid ? 'active' : 'inactive'}`}>
              {metrics?.sessionValid ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div className="card-content">
            <div className="metric-row">
              <span>Duration:</span>
              <span>{metrics?.sessionDuration.toFixed(1)}h</span>
            </div>
            <div className="metric-row">
              <span>Last Login:</span>
              <span>{metrics?.lastLoginTime ? new Date(metrics.lastLoginTime).toLocaleTimeString() : 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span>Active Sessions:</span>
              <span>{metrics?.activeSessionsCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Authentication Security Card */}
        <div className="metric-card">
          <div className="card-header">
            <h3>Authentication</h3>
            <div className={`security-score`} style={{ color: getSecurityScoreColor(metrics?.accountSecurityScore || 0) }}>
              {metrics?.accountSecurityScore || 0}%
            </div>
          </div>
          <div className="card-content">
            <div className="metric-row">
              <span>MFA Status:</span>
              <span className={metrics?.mfaEnabled ? 'enabled' : 'disabled'}>
                {metrics?.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="metric-row">
              <span>Failed Attempts:</span>
              <span>{metrics?.failedAuthAttempts || 0}</span>
            </div>
            <div className="metric-row">
              <span>Subscription:</span>
              <span className="subscription-tier">{metrics?.subscriptionTier || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Rate Limits Card */}
        <div className="metric-card">
          <div className="card-header">
            <h3>Rate Limits</h3>
            <div className="rate-status">
              {((metrics?.rateLimitStatus.requestsRemaining || 0) / 1000 * 100).toFixed(0)}%
            </div>
          </div>
          <div className="card-content">
            <div className="metric-row">
              <span>Requests:</span>
              <span>{metrics?.rateLimitStatus.requestsRemaining || 0}</span>
            </div>
            <div className="metric-row">
              <span>Tokens:</span>
              <span>{(metrics?.rateLimitStatus.tokensRemaining || 0).toLocaleString()}</span>
            </div>
            <div className="metric-row">
              <span>Resets:</span>
              <span>
                {metrics?.rateLimitStatus.resetTime 
                  ? new Date(metrics.rateLimitStatus.resetTime).toLocaleTimeString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="events-section">
        <div className="section-header">
          <h3>Recent Security Events</h3>
          <button onClick={onViewAuditLogs} className="view-all-button">
            View All Logs
          </button>
        </div>
        <div className="events-list">
          {recentEvents.length > 0 ? (
            recentEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-indicator" style={{ backgroundColor: getEventSeverityColor(event.severity) }}></div>
                <div className="event-content">
                  <div className="event-main">
                    <span className="event-description">{event.description}</span>
                    <span className="event-time">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="event-meta">
                    <span className="event-type">{event.eventType.replace('_', ' ')}</span>
                    {event.location && <span className="event-location">{event.location}</span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">No recent security events</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions-section">
        {!metrics?.mfaEnabled && (
          <button onClick={onMFASetupClick} className="action-button primary">
            🔒 Enable MFA
          </button>
        )}
        <button onClick={onViewAuditLogs} className="action-button secondary">
          📋 View Audit Logs
        </button>
        <button onClick={handleManualRefresh} className="action-button secondary">
          🔄 Refresh Metrics
        </button>
      </div>

      <style>{`
        .security-dashboard {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          padding: 24px;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .dashboard-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h2 {
          margin: 0;
          color: #2196F3;
          font-size: 24px;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .auto-refresh-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .refresh-button {
          background: #2196F3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-button:hover {
          background: #1976D2;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
          border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
          border-radius: 8px;
          padding: 20px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 16px;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .status-indicator {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-indicator.active {
          background: #E8F5E8;
          color: #2E7D2E;
        }

        .status-indicator.inactive {
          background: #FFEBEE;
          color: #C62828;
        }

        .security-score {
          font-size: 18px;
          font-weight: 600;
        }

        .rate-status {
          font-size: 14px;
          font-weight: 600;
          color: #4CAF50;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .metric-row span:first-child {
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .metric-row span:last-child {
          font-weight: 500;
        }

        .enabled {
          color: #4CAF50;
        }

        .disabled {
          color: #FF5722;
        }

        .subscription-tier {
          text-transform: capitalize;
          color: #2196F3;
          font-weight: 600;
        }

        .events-section {
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .view-all-button {
          background: none;
          border: 1px solid #2196F3;
          color: #2196F3;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .view-all-button:hover {
          background: #2196F3;
          color: white;
        }

        .events-list {
          background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
          border-radius: 6px;
          padding: 16px;
          max-height: 300px;
          overflow-y: auto;
        }

        .event-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
        }

        .event-item:last-child {
          border-bottom: none;
        }

        .event-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .event-content {
          flex: 1;
        }

        .event-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .event-description {
          font-size: 14px;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .event-time {
          font-size: 12px;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .event-meta {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .event-type {
          text-transform: capitalize;
        }

        .no-events {
          text-align: center;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
          font-style: italic;
          padding: 24px;
        }

        .actions-section {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action-button {
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          border: none;
          transition: all 0.2s ease;
        }

        .action-button.primary {
          background: #FF9800;
          color: white;
        }

        .action-button.primary:hover {
          background: #F57C00;
        }

        .action-button.secondary {
          background: ${theme === 'dark' ? '#404040' : '#e9ecef'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#dee2e6'};
        }

        .action-button.secondary:hover {
          background: ${theme === 'dark' ? '#4d4d4d' : '#dee2e6'};
        }

        @media (max-width: 768px) {
          .security-dashboard {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .actions-section {
            flex-direction: column;
          }

          .action-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SecurityDashboard;