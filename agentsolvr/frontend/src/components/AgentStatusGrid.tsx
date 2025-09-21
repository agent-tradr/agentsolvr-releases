import React, { useState, useEffect } from 'react';

export interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  lastSeen: Date;
  currentTask?: string;
  progress?: number;
  performance?: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
  };
}

export interface AgentStatusGridProps {
  agents: AgentStatus[];
  onAgentClick?: (agent: AgentStatus) => void;
  onRefresh?: () => void;
  refreshInterval?: number;
  showPerformance?: boolean;
  gridLayout?: 'grid' | 'list';
  className?: string;
}

export const AgentStatusGrid: React.FC<AgentStatusGridProps> = ({
  agents,
  onAgentClick,
  onRefresh,
  refreshInterval = 5000,
  showPerformance = true,
  gridLayout = 'grid',
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (refreshInterval > 0 && onRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, onRefresh]);

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastRefresh(new Date());
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleAgentClick = (agent: AgentStatus) => {
    if (onAgentClick) {
      onAgentClick(agent);
    }
  };

  const getStatusColor = (status: AgentStatus['status']): string => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#9E9E9E';
      case 'error':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const containerClass = `agent-status-grid ${gridLayout} ${className}`;

  return (
    <div className={containerClass}>
      <div className="grid-header">
        <h3>Agent Status</h3>
        <div className="header-controls">
          <span className="last-refresh">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className={`agents-container ${gridLayout}`}>
        {agents.map(agent => (
          <div
            key={agent.id}
            className={`agent-card ${agent.status}`}
            onClick={() => handleAgentClick(agent)}
            style={{ cursor: onAgentClick ? 'pointer' : 'default' }}
          >
            <div className="agent-header">
              <div className="agent-name">{agent.name}</div>
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(agent.status) }}
              >
                {agent.status}
              </div>
            </div>

            <div className="agent-details">
              <div className="last-seen">
                Last seen: {formatLastSeen(agent.lastSeen)}
              </div>
              
              {agent.currentTask && (
                <div className="current-task">
                  Task: {agent.currentTask}
                </div>
              )}

              {agent.progress !== undefined && (
                <div className="progress-container">
                  <div className="progress-label">Progress: {agent.progress}%</div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${agent.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {showPerformance && agent.performance && (
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Tasks:</span>
                  <span className="metric-value">{agent.performance.tasksCompleted}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Avg Time:</span>
                  <span className="metric-value">{agent.performance.averageTime}s</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Success:</span>
                  <span className="metric-value">{agent.performance.successRate}%</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="empty-state">
          <p>No agents available</p>
          <button onClick={handleRefresh}>Refresh</button>
        </div>
      )}

      <style>{`
        .agent-status-grid {
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        .grid-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #ddd;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .last-refresh {
          font-size: 12px;
          color: #666;
        }

        .refresh-button {
          padding: 6px 12px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .refresh-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .agents-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .agents-container.list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .agent-card {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }

        .agent-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }

        .agent-card.active {
          border-left: 4px solid #4CAF50;
        }

        .agent-card.error {
          border-left: 4px solid #F44336;
        }

        .agent-card.pending {
          border-left: 4px solid #FF9800;
        }

        .agent-card.inactive {
          border-left: 4px solid #9E9E9E;
        }

        .agent-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .agent-name {
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }

        .status-indicator {
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .agent-details {
          margin-bottom: 12px;
        }

        .last-seen, .current-task {
          font-size: 14px;
          color: #666;
          margin-bottom: 6px;
        }

        .progress-container {
          margin-top: 8px;
        }

        .progress-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #eee;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #2196F3;
          transition: width 0.3s ease;
        }

        .performance-metrics {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }

        .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .metric-label {
          color: #666;
          margin-bottom: 2px;
        }

        .metric-value {
          font-weight: 600;
          color: #333;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .empty-state button {
          margin-top: 16px;
          padding: 8px 16px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AgentStatusGrid;