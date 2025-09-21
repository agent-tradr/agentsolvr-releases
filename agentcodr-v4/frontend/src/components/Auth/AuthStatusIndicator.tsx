import React, { useState, useEffect } from 'react';

/**
 * AuthStatusIndicator Component
 * 
 * Displays real-time authentication status, session information,
 * and quick access to security actions.
 */

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

interface AuthStatusIndicatorProps {
  authStatus?: AuthStatus;
  onRefresh?: () => void;
  onLogin?: () => void;
  onLogout?: () => void;
  onMFASetup?: () => void;
  onViewSecurity?: () => void;
  theme?: 'light' | 'dark';
  compact?: boolean;
}

export const AuthStatusIndicator: React.FC<AuthStatusIndicatorProps> = ({
  authStatus,
  onRefresh,
  onLogin,
  onLogout,
  onMFASetup,
  onViewSecurity,
  theme = 'light',
  compact = false
}) => {
  const [expanded, setExpanded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Mock default auth status for development
  const defaultAuthStatus: AuthStatus = {
    isAuthenticated: true,
    sessionValid: true,
    sessionExpiry: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(), // 14 hours from now
    userIdentifier: 'user_12345',
    subscriptionTier: 'pro',
    mfaEnabled: false,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    rateLimitStatus: {
      requestsRemaining: 850,
      requestsTotal: 1000,
      resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    },
    securityLevel: 'medium'
  };

  const status = authStatus || defaultAuthStatus;

  // Update time remaining until session expiry
  useEffect(() => {
    if (!status.sessionExpiry) return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(status.sessionExpiry!).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeRemaining('Expired');
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [status.sessionExpiry]);

  const getStatusColor = (): string => {
    if (!status.isAuthenticated) return '#F44336'; // Red
    if (!status.sessionValid) return '#FF5722'; // Red-Orange
    if (!status.mfaEnabled) return '#FF9800'; // Orange
    return '#4CAF50'; // Green
  };

  const getStatusText = (): string => {
    if (!status.isAuthenticated) return 'Not Authenticated';
    if (!status.sessionValid) return 'Session Invalid';
    if (!status.mfaEnabled) return 'Authenticated (MFA Disabled)';
    return 'Fully Authenticated';
  };

  const getSecurityLevelColor = (level: string): string => {
    switch (level) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getRateLimitPercentage = (): number => {
    return (status.rateLimitStatus.requestsRemaining / status.rateLimitStatus.requestsTotal) * 100;
  };

  const formatLastActivity = (): string => {
    if (!status.lastActivity) return 'Unknown';
    
    const now = new Date().getTime();
    const activity = new Date(status.lastActivity).getTime();
    const difference = now - activity;
    
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  // Compact view for minimal space usage
  if (compact) {
    return (
      <div className={`auth-indicator-compact ${theme}`}>
        <div 
          className="status-dot" 
          style={{ backgroundColor: getStatusColor() }}
          title={getStatusText()}
        ></div>
        <span className="status-text">{status.isAuthenticated ? 'Auth' : 'No Auth'}</span>
        {status.isAuthenticated && (
          <span className="time-remaining">{timeRemaining}</span>
        )}
        
        <style>{`
          .auth-indicator-compact {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          }

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .status-text {
            font-weight: 500;
          }

          .time-remaining {
            color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
            font-size: 11px;
          }
        `}</style>
      </div>
    );
  }

  // Full detailed view
  return (
    <div className={`auth-status-indicator ${theme} ${expanded ? 'expanded' : ''}`}>
      {/* Main Status Display */}
      <div 
        className="status-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="status-main">
          <div 
            className="status-dot" 
            style={{ backgroundColor: getStatusColor() }}
          ></div>
          <div className="status-info">
            <span className="status-label">{getStatusText()}</span>
            {status.isAuthenticated && (
              <span className="session-time">
                Session: {timeRemaining} remaining
              </span>
            )}
          </div>
        </div>
        <div className="expand-toggle">
          {expanded ? '▼' : '▶'}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="status-details">
          {status.isAuthenticated ? (
            <>
              {/* User Information */}
              <div className="detail-section">
                <h4>Session Details</h4>
                <div className="detail-row">
                  <span>User ID:</span>
                  <span>{status.userIdentifier}</span>
                </div>
                <div className="detail-row">
                  <span>Subscription:</span>
                  <span className="subscription-badge">{status.subscriptionTier}</span>
                </div>
                <div className="detail-row">
                  <span>Last Activity:</span>
                  <span>{formatLastActivity()}</span>
                </div>
              </div>

              {/* Security Status */}
              <div className="detail-section">
                <h4>Security</h4>
                <div className="detail-row">
                  <span>Security Level:</span>
                  <span 
                    className="security-level"
                    style={{ color: getSecurityLevelColor(status.securityLevel) }}
                  >
                    {status.securityLevel.toUpperCase()}
                  </span>
                </div>
                <div className="detail-row">
                  <span>MFA Status:</span>
                  <span className={status.mfaEnabled ? 'enabled' : 'disabled'}>
                    {status.mfaEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Rate Limits */}
              <div className="detail-section">
                <h4>Rate Limits</h4>
                <div className="rate-limit-bar">
                  <div className="rate-limit-label">
                    <span>API Requests</span>
                    <span>
                      {status.rateLimitStatus.requestsRemaining} / {status.rateLimitStatus.requestsTotal}
                    </span>
                  </div>
                  <div className="rate-limit-progress">
                    <div 
                      className="rate-limit-fill"
                      style={{ width: `${getRateLimitPercentage()}%` }}
                    ></div>
                  </div>
                </div>
                <div className="detail-row">
                  <span>Resets:</span>
                  <span>{new Date(status.rateLimitStatus.resetTime).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="actions-section">
                {!status.mfaEnabled && onMFASetup && (
                  <button 
                    onClick={onMFASetup}
                    className="action-button warning"
                  >
                    🔒 Enable MFA
                  </button>
                )}
                
                {onViewSecurity && (
                  <button 
                    onClick={onViewSecurity}
                    className="action-button secondary"
                  >
                    🛡️ Security
                  </button>
                )}
                
                {onRefresh && (
                  <button 
                    onClick={onRefresh}
                    className="action-button secondary"
                  >
                    🔄 Refresh
                  </button>
                )}
                
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="action-button danger"
                  >
                    🚪 Logout
                  </button>
                )}
              </div>
            </>
          ) : (
            // Not authenticated view
            <div className="not-authenticated">
              <p>You are not currently authenticated.</p>
              {onLogin && (
                <button 
                  onClick={onLogin}
                  className="action-button primary"
                >
                  🔑 Login
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        .auth-status-indicator {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 8px;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          user-select: none;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .status-header:hover {
          background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
        }

        .status-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-label {
          font-weight: 500;
          font-size: 14px;
        }

        .session-time {
          font-size: 12px;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .expand-toggle {
          font-size: 12px;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
          transition: transform 0.2s ease;
        }

        .auth-status-indicator.expanded .expand-toggle {
          transform: rotate(0deg);
        }

        .status-details {
          border-top: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          padding: 16px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #2196F3;
          font-weight: 600;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: 13px;
        }

        .detail-row span:first-child {
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .detail-row span:last-child {
          font-weight: 500;
        }

        .subscription-badge {
          background: #E3F2FD;
          color: #1976D2;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .security-level {
          font-weight: 600;
          font-size: 12px;
        }

        .enabled {
          color: #4CAF50;
        }

        .disabled {
          color: #FF5722;
        }

        .rate-limit-bar {
          margin-bottom: 8px;
        }

        .rate-limit-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .rate-limit-progress {
          width: 100%;
          height: 4px;
          background: ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 2px;
          overflow: hidden;
        }

        .rate-limit-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          transition: width 0.3s ease;
        }

        .actions-section {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .action-button {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .action-button.primary {
          background: #2196F3;
          color: white;
        }

        .action-button.primary:hover {
          background: #1976D2;
        }

        .action-button.secondary {
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#dee2e6'};
        }

        .action-button.secondary:hover {
          background: ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
        }

        .action-button.warning {
          background: #FF9800;
          color: white;
        }

        .action-button.warning:hover {
          background: #F57C00;
        }

        .action-button.danger {
          background: #F44336;
          color: white;
        }

        .action-button.danger:hover {
          background: #D32F2F;
        }

        .not-authenticated {
          text-align: center;
          padding: 20px 0;
        }

        .not-authenticated p {
          margin: 0 0 16px 0;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        @media (max-width: 768px) {
          .status-header {
            padding: 10px 12px;
          }

          .status-details {
            padding: 12px;
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

export default AuthStatusIndicator;