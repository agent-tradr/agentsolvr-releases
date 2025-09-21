import React, { useState, useEffect, useCallback } from 'react';
import AgentStatusGrid, { AgentStatus } from './AgentStatusGrid';
import ProgressVisualization, { ProgressData } from './ProgressVisualization';

export interface DashboardData {
  agents: AgentStatus[];
  progress: ProgressData[];
  systemStats: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTime: number;
    uptime: number;
  };
  realtimeMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkActivity: number;
  };
  notifications: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
    dismissed?: boolean;
  }[];
}

export interface RealtimeDashboardProps {
  data: DashboardData;
  onDataRefresh?: () => void;
  onAgentClick?: (agent: AgentStatus) => void;
  onProgressClick?: (progress: ProgressData) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  layout?: 'grid' | 'compact' | 'detailed';
  theme?: 'light' | 'dark';
  className?: string;
}

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({
  data,
  onDataRefresh,
  onAgentClick,
  onProgressClick,
  onNotificationDismiss,
  refreshInterval = 5000,
  enableAutoRefresh = true,
  layout = 'grid',
  theme = 'light',
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [visibleNotifications, setVisibleNotifications] = useState(data.notifications || []);

  useEffect(() => {
    setVisibleNotifications(data.notifications?.filter(n => !n.dismissed) || []);
  }, [data.notifications]);

  useEffect(() => {
    if (enableAutoRefresh && refreshInterval > 0 && onDataRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [enableAutoRefresh, refreshInterval, onDataRefresh]);

  const handleRefresh = useCallback(async () => {
    if (onDataRefresh && !isRefreshing) {
      setIsRefreshing(true);
      setConnectionStatus('reconnecting');
      
      try {
        await onDataRefresh();
        setLastUpdate(new Date());
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Dashboard refresh failed:', error);
        setConnectionStatus('disconnected');
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onDataRefresh, isRefreshing]);

  const handleNotificationDismiss = (notificationId: string) => {
    setVisibleNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    
    if (onNotificationDismiss) {
      onNotificationDismiss(notificationId);
    }
  };

  const getSystemHealthStatus = (): 'healthy' | 'warning' | 'critical' => {
    const { cpuUsage, memoryUsage, diskUsage } = data.realtimeMetrics;
    
    if (cpuUsage > 90 || memoryUsage > 90 || diskUsage > 95) {
      return 'critical';
    }
    
    if (cpuUsage > 70 || memoryUsage > 70 || diskUsage > 80) {
      return 'warning';
    }
    
    return 'healthy';
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getProgressFromSystemStats = (): ProgressData[] => {
    const { totalTasks, completedTasks, failedTasks } = data.systemStats;
    
    return [
      {
        id: 'completed',
        label: 'Completed Tasks',
        value: completedTasks,
        max: totalTasks,
        color: '#4CAF50',
        category: 'tasks'
      },
      {
        id: 'failed',
        label: 'Failed Tasks',
        value: failedTasks,
        max: totalTasks,
        color: '#F44336',
        category: 'tasks'
      },
      {
        id: 'pending',
        label: 'Pending Tasks',
        value: totalTasks - completedTasks - failedTasks,
        max: totalTasks,
        color: '#FF9800',
        category: 'tasks'
      }
    ];
  };

  const getResourceMetrics = (): ProgressData[] => {
    const { cpuUsage, memoryUsage, diskUsage, networkActivity } = data.realtimeMetrics;
    
    return [
      {
        id: 'cpu',
        label: 'CPU Usage',
        value: cpuUsage,
        max: 100,
        color: cpuUsage > 80 ? '#F44336' : cpuUsage > 60 ? '#FF9800' : '#4CAF50',
        category: 'resources'
      },
      {
        id: 'memory',
        label: 'Memory Usage',
        value: memoryUsage,
        max: 100,
        color: memoryUsage > 80 ? '#F44336' : memoryUsage > 60 ? '#FF9800' : '#4CAF50',
        category: 'resources'
      },
      {
        id: 'disk',
        label: 'Disk Usage',
        value: diskUsage,
        max: 100,
        color: diskUsage > 90 ? '#F44336' : diskUsage > 70 ? '#FF9800' : '#4CAF50',
        category: 'resources'
      },
      {
        id: 'network',
        label: 'Network Activity',
        value: networkActivity,
        max: 100,
        color: '#2196F3',
        category: 'resources'
      }
    ];
  };

  const healthStatus = getSystemHealthStatus();
  const containerClass = `realtime-dashboard ${layout} ${theme} ${className}`;

  return (
    <div className={containerClass}>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h2>Real-time Dashboard</h2>
          <div className="status-indicators">
            <div className={`connection-status ${connectionStatus}`}>
              <span className="status-dot" />
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </div>
            <div className={`health-status ${healthStatus}`}>
              System: {healthStatus}
            </div>
          </div>
        </div>
        
        <div className="header-controls">
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {visibleNotifications.length > 0 && (
        <div className="notifications-section">
          {visibleNotifications.slice(0, 3).map(notification => (
            <div key={notification.id} className={`notification ${notification.type}`}>
              <div className="notification-content">
                <span className="notification-message">{notification.message}</span>
                <span className="notification-time">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <button
                className="notification-dismiss"
                onClick={() => handleNotificationDismiss(notification.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {layout === 'grid' && (
          <>
            {/* System Overview */}
            <div className="dashboard-section system-overview">
              <h3>System Overview</h3>
              <div className="overview-stats">
                <div className="stat-card">
                  <div className="stat-label">Total Tasks</div>
                  <div className="stat-value">{data.systemStats.totalTasks}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completion Rate</div>
                  <div className="stat-value">
                    {Math.round((data.systemStats.completedTasks / data.systemStats.totalTasks) * 100)}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Average Time</div>
                  <div className="stat-value">{data.systemStats.averageTime}s</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Uptime</div>
                  <div className="stat-value">{formatUptime(data.systemStats.uptime)}</div>
                </div>
              </div>
            </div>

            {/* Agents Grid */}
            <div className="dashboard-section agents-section">
              <AgentStatusGrid
                agents={data.agents}
                onAgentClick={onAgentClick}
                onRefresh={handleRefresh}
                refreshInterval={0} // Disable internal refresh, we handle it here
                gridLayout="grid"
              />
            </div>

            {/* Task Progress */}
            <div className="dashboard-section progress-section">
              <h3>Task Progress</h3>
              <ProgressVisualization
                data={getProgressFromSystemStats()}
                type="ring"
                showLabels={true}
                showValues={true}
                onProgressClick={onProgressClick}
                theme={theme}
              />
            </div>

            {/* Resource Metrics */}
            <div className="dashboard-section metrics-section">
              <h3>Resource Metrics</h3>
              <ProgressVisualization
                data={getResourceMetrics()}
                type="bar"
                showLabels={true}
                showValues={true}
                showPercentages={true}
                onProgressClick={onProgressClick}
                theme={theme}
              />
            </div>

            {/* Additional Progress Data */}
            {data.progress && data.progress.length > 0 && (
              <div className="dashboard-section custom-progress">
                <h3>Custom Progress</h3>
                <ProgressVisualization
                  data={data.progress}
                  type="circle"
                  showLabels={true}
                  showValues={true}
                  onProgressClick={onProgressClick}
                  theme={theme}
                />
              </div>
            )}
          </>
        )}

        {layout === 'compact' && (
          <div className="compact-layout">
            <div className="compact-agents">
              <AgentStatusGrid
                agents={data.agents}
                onAgentClick={onAgentClick}
                gridLayout="list"
                showPerformance={false}
              />
            </div>
            <div className="compact-metrics">
              <ProgressVisualization
                data={getResourceMetrics()}
                type="bar"
                showLabels={false}
                showPercentages={true}
                height={200}
                theme={theme}
              />
            </div>
          </div>
        )}

        {layout === 'detailed' && (
          <div className="detailed-layout">
            {/* Full detailed view with all components */}
            <div className="detailed-grid">
              <div className="agents-detail">
                <AgentStatusGrid
                  agents={data.agents}
                  onAgentClick={onAgentClick}
                  gridLayout="grid"
                  showPerformance={true}
                />
              </div>
              <div className="progress-detail">
                <ProgressVisualization
                  data={[...getProgressFromSystemStats(), ...getResourceMetrics()]}
                  type="line"
                  showLabels={true}
                  showValues={true}
                  onProgressClick={onProgressClick}
                  height={400}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .realtime-dashboard {
          padding: 20px;
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          min-height: 100vh;
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
        }

        .status-indicators {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .connection-status, .health-status {
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

        .connection-status.connected .status-dot {
          background: #4CAF50;
        }

        .connection-status.disconnected .status-dot {
          background: #F44336;
        }

        .connection-status.reconnecting .status-dot {
          background: #FF9800;
          animation: pulse 1s infinite;
        }

        .health-status.healthy {
          color: #4CAF50;
        }

        .health-status.warning {
          color: #FF9800;
        }

        .health-status.critical {
          color: #F44336;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .last-update {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .refresh-button {
          padding: 8px 16px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .refresh-button:hover:not(:disabled) {
          background: #1976D2;
        }

        .refresh-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .notifications-section {
          margin-bottom: 24px;
        }

        .notification {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .notification.info {
          background: ${theme === 'dark' ? '#1e3a8a20' : '#e3f2fd'};
          border-color: #2196F3;
        }

        .notification.warning {
          background: ${theme === 'dark' ? '#92400e20' : '#fff3e0'};
          border-color: #FF9800;
        }

        .notification.error {
          background: ${theme === 'dark' ? '#7f1d1d20' : '#ffebee'};
          border-color: #F44336;
        }

        .notification.success {
          background: ${theme === 'dark' ? '#14532d20' : '#e8f5e8'};
          border-color: #4CAF50;
        }

        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notification-message {
          font-size: 14px;
        }

        .notification-time {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .notification-dismiss {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-section {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dashboard-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card {
          text-align: center;
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .stat-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .grid .dashboard-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }

        .compact-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .detailed-layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detailed-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
          }

          .overview-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .compact-layout {
            grid-template-columns: 1fr;
          }

          .detailed-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RealtimeDashboard;