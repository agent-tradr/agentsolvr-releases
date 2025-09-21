import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

export interface AgentInfo {
  id: string;
  name: string;
  type: 'backend_core' | 'claude_integration' | 'security' | 'electron' | 'frontend' | 'infrastructure';
  status: 'active' | 'idle' | 'busy' | 'offline' | 'error';
  currentTask: string | null;
  progress: number; // 0-1
  lastActivity: Date;
  performance: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
    efficiency: number;
  };
  resources: {
    cpuUsage: number;
    memoryUsage: number;
    load: number;
  };
  specialization: {
    domain: string;
    skills: string[];
    currentFocus: string;
  };
  coordination: {
    dependencies: string[];
    dependents: string[];
    communicationScore: number;
    collaborationRating: number;
  };
}

export interface CoordinationMetrics {
  totalAgents: number;
  activeAgents: number;
  systemLoad: number;
  coordinationEfficiency: number;
  taskDistribution: {
    [agentType: string]: number;
  };
  communicationFlow: {
    totalMessages: number;
    messagesPerSecond: number;
    averageLatency: number;
    errorRate: number;
  };
  bottlenecks: {
    agentId: string;
    type: 'resource' | 'dependency' | 'communication' | 'overload';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion: string;
  }[];
}

export interface CoordinationEvent {
  id: string;
  timestamp: Date;
  type: 'task_assigned' | 'task_completed' | 'agent_communication' | 'resource_allocation' | 'bottleneck_detected' | 'coordination_optimized';
  agentId: string;
  description: string;
  metadata?: any;
}

export interface CoordinationData {
  agents: AgentInfo[];
  metrics: CoordinationMetrics;
  recentEvents: CoordinationEvent[];
  networkMap: {
    nodes: {
      id: string;
      name: string;
      type: string;
      status: string;
    }[];
    connections: {
      source: string;
      target: string;
      strength: number;
      latency: number;
      messageCount: number;
    }[];
  };
  alerts: {
    id: string;
    type: 'performance_degradation' | 'communication_failure' | 'resource_exhaustion' | 'coordination_breakdown';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: Date;
    affectedAgents: string[];
    actionRequired: boolean;
  }[];
}

export interface CoordinationStatusProps {
  onOptimizeCoordination?: () => void;
  onRestartAgent?: (agentId: string) => void;
  onRebalanceTasks?: () => void;
  onDismissAlert?: (alertId: string) => void;
  refreshInterval?: number;
  className?: string;
  theme?: 'light' | 'dark';
  viewMode?: 'grid' | 'list' | 'network';
}

export const CoordinationStatus: React.FC<CoordinationStatusProps> = ({
  onOptimizeCoordination,
  onRestartAgent,
  onRebalanceTasks,
  onDismissAlert,
  refreshInterval = 5000, // 5 seconds for real-time coordination
  className = '',
  theme = 'light',
  viewMode = 'grid'
}) => {
  const [coordinationData, setCoordinationData] = useState<CoordinationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  // WebSocket connection for real-time coordination updates
  const {
    isConnected: wsConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/agent-coordination',
    onConnect: () => {
      console.log('Connected to agent coordination WebSocket');
      requestCoordinationData();
    },
    onError: (error) => {
      console.error('Agent coordination WebSocket error:', error);
      setError('Failed to connect to agent coordination service');
    },
    autoReconnect: true
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'coordination_update') {
      setCoordinationData(lastMessage.data);
      setIsLoading(false);
      setLastUpdate(new Date());
      setError(null);
    }
  }, [lastMessage]);

  // Request coordination data
  const requestCoordinationData = useCallback(() => {
    if (wsConnected) {
      sendMessage('request_coordination_data', {
        timestamp: new Date().toISOString()
      });
    }
  }, [wsConnected, sendMessage]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0 && wsConnected) {
      const interval = setInterval(requestCoordinationData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, wsConnected, requestCoordinationData]);

  // Initial data load
  useEffect(() => {
    if (wsConnected) {
      requestCoordinationData();
    }
  }, [wsConnected, requestCoordinationData]);

  const handleOptimizeCoordination = () => {
    if (onOptimizeCoordination) {
      onOptimizeCoordination();
    }

    if (wsConnected) {
      sendMessage('optimize_coordination', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleRestartAgent = (agentId: string) => {
    if (onRestartAgent) {
      onRestartAgent(agentId);
    }

    if (wsConnected) {
      sendMessage('restart_agent', {
        agentId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleRebalanceTasks = () => {
    if (onRebalanceTasks) {
      onRebalanceTasks();
    }

    if (wsConnected) {
      sendMessage('rebalance_tasks', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleDismissAlert = (alertId: string) => {
    if (onDismissAlert) {
      onDismissAlert(alertId);
    }

    if (wsConnected) {
      sendMessage('dismiss_coordination_alert', {
        alertId,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Default data for when no real data is available
  const defaultData: CoordinationData = {
    agents: [
      {
        id: 'agent_1_backend_core',
        name: 'Backend Core Agent',
        type: 'backend_core',
        status: 'active',
        currentTask: 'Processing intelligence data',
        progress: 0.75,
        lastActivity: new Date(),
        performance: {
          tasksCompleted: 42,
          averageTime: 2.3,
          successRate: 0.95,
          efficiency: 0.87
        },
        resources: {
          cpuUsage: 45,
          memoryUsage: 62,
          load: 0.5
        },
        specialization: {
          domain: 'Backend Core Systems',
          skills: ['Intelligence Processing', 'Coordination', 'Resource Management'],
          currentFocus: 'Progression Intelligence'
        },
        coordination: {
          dependencies: [],
          dependents: ['agent_2_claude_integration', 'agent_5_frontend'],
          communicationScore: 0.92,
          collaborationRating: 0.88
        }
      },
      {
        id: 'agent_2_claude_integration',
        name: 'Claude Integration Agent',
        type: 'claude_integration',
        status: 'busy',
        currentTask: 'Optimizing API calls',
        progress: 0.45,
        lastActivity: new Date(),
        performance: {
          tasksCompleted: 38,
          averageTime: 1.8,
          successRate: 0.91,
          efficiency: 0.83
        },
        resources: {
          cpuUsage: 72,
          memoryUsage: 58,
          load: 0.7
        },
        specialization: {
          domain: 'Claude Integration',
          skills: ['API Integration', 'Cost Optimization', 'Rate Limiting'],
          currentFocus: 'Frontend API Creation'
        },
        coordination: {
          dependencies: ['agent_1_backend_core'],
          dependents: ['agent_5_frontend'],
          communicationScore: 0.89,
          collaborationRating: 0.91
        }
      }
    ],
    metrics: {
      totalAgents: 6,
      activeAgents: 5,
      systemLoad: 0.65,
      coordinationEfficiency: 0.87,
      taskDistribution: {
        backend_core: 3,
        claude_integration: 2,
        security: 1,
        electron: 1,
        frontend: 2,
        infrastructure: 1
      },
      communicationFlow: {
        totalMessages: 1248,
        messagesPerSecond: 12.4,
        averageLatency: 45,
        errorRate: 0.02
      },
      bottlenecks: []
    },
    recentEvents: [],
    networkMap: {
      nodes: [],
      connections: []
    },
    alerts: []
  };

  const data = coordinationData || defaultData;
  const containerClass = `coordination-status ${theme} ${className}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'busy': return '#FF9800';
      case 'idle': return '#2196F3';
      case 'offline': return '#9E9E9E';
      case 'error': return '#F44336';
      default: return '#777777';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'backend_core': return '🏗️';
      case 'claude_integration': return '🤖';
      case 'security': return '🔒';
      case 'electron': return '💻';
      case 'frontend': return '🎨';
      case 'infrastructure': return '🔧';
      default: return '⚙️';
    }
  };

  const formatUptime = (lastActivity: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastActivity.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  if (isLoading && !coordinationData) {
    return (
      <div className={containerClass}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading agent coordination data...</p>
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
      <div className="coordination-header">
        <div className="header-info">
          <h2>Agent Coordination Status</h2>
          <div className="system-metrics">
            <span>{data.metrics.activeAgents}/{data.metrics.totalAgents} agents active</span>
            <span>Efficiency: {formatPercentage(data.metrics.coordinationEfficiency)}</span>
            <span>Load: {formatPercentage(data.metrics.systemLoad)}</span>
          </div>
        </div>
        <div className="header-controls">
          <div className="view-selector">
            <button 
              className={currentViewMode === 'grid' ? 'active' : ''}
              onClick={() => setCurrentViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={currentViewMode === 'list' ? 'active' : ''}
              onClick={() => setCurrentViewMode('list')}
            >
              List
            </button>
            <button 
              className={currentViewMode === 'network' ? 'active' : ''}
              onClick={() => setCurrentViewMode('network')}
            >
              Network
            </button>
          </div>
          <button 
            className="optimize-btn"
            onClick={handleOptimizeCoordination}
          >
            Optimize
          </button>
          <button 
            className="rebalance-btn"
            onClick={handleRebalanceTasks}
          >
            Rebalance
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

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="alerts-section">
          <h3>Coordination Alerts</h3>
          {data.alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.severity}`}>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  <span>Affects: {alert.affectedAgents.join(', ')}</span>
                  <span>{alert.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
              <button 
                className="alert-dismiss"
                onClick={() => handleDismissAlert(alert.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="coordination-content">
        {/* System Overview */}
        <div className="overview-section">
          <h3>System Overview</h3>
          <div className="overview-metrics">
            <div className="metric-card">
              <div className="metric-label">Communication Flow</div>
              <div className="metric-value">{data.metrics.communicationFlow.messagesPerSecond.toFixed(1)}/s</div>
              <div className="metric-detail">
                {data.metrics.communicationFlow.totalMessages} total messages
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Average Latency</div>
              <div className="metric-value">{data.metrics.communicationFlow.averageLatency}ms</div>
              <div className="metric-detail">
                {formatPercentage(data.metrics.communicationFlow.errorRate)} error rate
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Task Distribution</div>
              <div className="distribution-chart">
                {Object.entries(data.metrics.taskDistribution).map(([type, count]) => (
                  <div key={type} className="distribution-item">
                    <span className="type-name">{type.replace('_', ' ')}</span>
                    <span className="type-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Agents Display */}
        <div className="agents-section">
          <h3>Agents ({data.agents.length})</h3>
          
          {currentViewMode === 'grid' && (
            <div className="agents-grid">
              {data.agents.map(agent => (
                <div 
                  key={agent.id} 
                  className={`agent-card ${selectedAgent === agent.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                >
                  <div className="agent-header">
                    <div className="agent-icon">{getTypeIcon(agent.type)}</div>
                    <div className="agent-info">
                      <div className="agent-name">{agent.name}</div>
                      <div className="agent-type">{agent.type.replace('_', ' ')}</div>
                    </div>
                    <div 
                      className="agent-status"
                      style={{color: getStatusColor(agent.status)}}
                    >
                      {agent.status}
                    </div>
                  </div>
                  
                  <div className="agent-current-task">
                    {agent.currentTask || 'No active task'}
                  </div>
                  
                  {agent.currentTask && (
                    <div className="agent-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{width: `${agent.progress * 100}%`}}
                        />
                      </div>
                      <span className="progress-text">{formatPercentage(agent.progress)}</span>
                    </div>
                  )}
                  
                  <div className="agent-metrics">
                    <div className="metric-row">
                      <span>Success Rate:</span>
                      <span>{formatPercentage(agent.performance.successRate)}</span>
                    </div>
                    <div className="metric-row">
                      <span>Efficiency:</span>
                      <span>{formatPercentage(agent.performance.efficiency)}</span>
                    </div>
                    <div className="metric-row">
                      <span>CPU Usage:</span>
                      <span>{agent.resources.cpuUsage}%</span>
                    </div>
                    <div className="metric-row">
                      <span>Memory:</span>
                      <span>{agent.resources.memoryUsage}%</span>
                    </div>
                  </div>
                  
                  <div className="agent-actions">
                    <button 
                      className="restart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestartAgent(agent.id);
                      }}
                    >
                      Restart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentViewMode === 'list' && (
            <div className="agents-list">
              <div className="list-header">
                <div className="header-cell">Agent</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Current Task</div>
                <div className="header-cell">Progress</div>
                <div className="header-cell">Performance</div>
                <div className="header-cell">Resources</div>
                <div className="header-cell">Actions</div>
              </div>
              {data.agents.map(agent => (
                <div key={agent.id} className="list-row">
                  <div className="list-cell">
                    <div className="agent-name-cell">
                      <span className="agent-icon">{getTypeIcon(agent.type)}</span>
                      <div>
                        <div className="agent-name">{agent.name}</div>
                        <div className="agent-type">{agent.specialization.domain}</div>
                      </div>
                    </div>
                  </div>
                  <div className="list-cell">
                    <span 
                      className="status-badge"
                      style={{backgroundColor: getStatusColor(agent.status)}}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <div className="list-cell">
                    <div className="task-info">
                      <div className="task-name">{agent.currentTask || 'Idle'}</div>
                      <div className="task-focus">{agent.specialization.currentFocus}</div>
                    </div>
                  </div>
                  <div className="list-cell">
                    {agent.currentTask && (
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{width: `${agent.progress * 100}%`}}
                          />
                        </div>
                        <span>{formatPercentage(agent.progress)}</span>
                      </div>
                    )}
                  </div>
                  <div className="list-cell">
                    <div className="performance-metrics">
                      <div>Success: {formatPercentage(agent.performance.successRate)}</div>
                      <div>Efficiency: {formatPercentage(agent.performance.efficiency)}</div>
                    </div>
                  </div>
                  <div className="list-cell">
                    <div className="resource-metrics">
                      <div>CPU: {agent.resources.cpuUsage}%</div>
                      <div>Memory: {agent.resources.memoryUsage}%</div>
                    </div>
                  </div>
                  <div className="list-cell">
                    <button 
                      className="restart-btn"
                      onClick={() => handleRestartAgent(agent.id)}
                    >
                      Restart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentViewMode === 'network' && (
            <div className="network-view">
              <div className="network-placeholder">
                <div className="network-info">
                  <h4>Agent Network Visualization</h4>
                  <p>Interactive network map showing agent dependencies and communication flows</p>
                  <div className="network-legend">
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#4CAF50'}} />
                      <span>Active Communication</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#FF9800'}} />
                      <span>High Latency</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color" style={{backgroundColor: '#F44336'}} />
                      <span>Communication Error</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottlenecks */}
        {data.metrics.bottlenecks.length > 0 && (
          <div className="bottlenecks-section">
            <h3>System Bottlenecks</h3>
            <div className="bottlenecks-list">
              {data.metrics.bottlenecks.map((bottleneck, index) => (
                <div key={index} className={`bottleneck-card bottleneck-${bottleneck.severity}`}>
                  <div className="bottleneck-header">
                    <div className="bottleneck-agent">Agent: {bottleneck.agentId}</div>
                    <div className="bottleneck-type">{bottleneck.type}</div>
                    <div className="bottleneck-severity">{bottleneck.severity}</div>
                  </div>
                  <div className="bottleneck-description">{bottleneck.description}</div>
                  <div className="bottleneck-suggestion">
                    <strong>Suggestion:</strong> {bottleneck.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        {data.recentEvents.length > 0 && (
          <div className="events-section">
            <h3>Recent Events</h3>
            <div className="events-list">
              {data.recentEvents.slice(0, 10).map(event => (
                <div key={event.id} className="event-item">
                  <div className="event-time">{event.timestamp.toLocaleTimeString()}</div>
                  <div className="event-type">{event.type.replace('_', ' ')}</div>
                  <div className="event-agent">{event.agentId}</div>
                  <div className="event-description">{event.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .coordination-status {
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          padding: 20px;
          border-radius: 8px;
          max-width: 1400px;
        }

        .coordination-header {
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

        .system-metrics {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .view-selector {
          display: flex;
          background: ${theme === 'dark' ? '#404040' : '#f0f0f0'};
          border-radius: 4px;
          overflow: hidden;
        }

        .view-selector button {
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .view-selector button.active {
          background: #2196F3;
          color: white;
        }

        .view-selector button:hover:not(.active) {
          background: ${theme === 'dark' ? '#555555' : '#e0e0e0'};
        }

        .optimize-btn, .rebalance-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .optimize-btn {
          background: #4CAF50;
          color: white;
        }

        .optimize-btn:hover {
          background: #45a049;
        }

        .rebalance-btn {
          background: #FF9800;
          color: white;
        }

        .rebalance-btn:hover {
          background: #F57C00;
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

        .alerts-section {
          margin-bottom: 24px;
        }

        .alerts-section h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          margin-bottom: 8px;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .alert.alert-info {
          background: ${theme === 'dark' ? '#1e3a8a20' : '#e3f2fd'};
          border-color: #2196F3;
        }

        .alert.alert-warning {
          background: ${theme === 'dark' ? '#92400e20' : '#fff3e0'};
          border-color: #FF9800;
        }

        .alert.alert-error {
          background: ${theme === 'dark' ? '#7f1d1d20' : '#ffebee'};
          border-color: #F44336;
        }

        .alert.alert-critical {
          background: ${theme === 'dark' ? '#7f1d1d40' : '#ffcdd2'};
          border-color: #D32F2F;
        }

        .alert-content {
          flex: 1;
        }

        .alert-message {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .alert-meta {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          display: flex;
          gap: 12px;
        }

        .alert-dismiss {
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

        .coordination-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .overview-section, .agents-section, .bottlenecks-section, .events-section {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .overview-section h3, .agents-section h3, .bottlenecks-section h3, .events-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .overview-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .metric-card {
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .metric-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .metric-detail {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .distribution-chart {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .distribution-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .type-name {
          text-transform: capitalize;
        }

        .type-count {
          font-weight: 500;
        }

        .agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }

        .agent-card {
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .agent-card:hover {
          border-color: #2196F3;
          box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
        }

        .agent-card.selected {
          border-color: #2196F3;
          background: ${theme === 'dark' ? '#1e3a8a20' : '#e3f2fd'};
        }

        .agent-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .agent-icon {
          font-size: 24px;
        }

        .agent-info {
          flex: 1;
        }

        .agent-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .agent-type {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          text-transform: capitalize;
        }

        .agent-status {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
        }

        .agent-current-task {
          font-size: 14px;
          margin-bottom: 8px;
          padding: 8px;
          background: ${theme === 'dark' ? '#333333' : '#f5f5f5'};
          border-radius: 4px;
          min-height: 20px;
        }

        .agent-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #2196F3;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          font-weight: 500;
        }

        .agent-metrics {
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

        .agent-actions {
          display: flex;
          justify-content: flex-end;
        }

        .restart-btn {
          padding: 6px 12px;
          border: 1px solid #FF9800;
          border-radius: 4px;
          background: transparent;
          color: #FF9800;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .restart-btn:hover {
          background: #FF9800;
          color: white;
        }

        .agents-list {
          display: flex;
          flex-direction: column;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 8px;
          overflow: hidden;
        }

        .list-header {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr 1fr 1fr 1fr 1fr;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          font-weight: 600;
          font-size: 14px;
        }

        .header-cell {
          padding: 12px 8px;
          border-right: 1px solid ${theme === 'dark' ? '#555555' : '#e0e0e0'};
        }

        .list-row {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr 1fr 1fr 1fr 1fr;
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .list-row:hover {
          background: ${theme === 'dark' ? '#333333' : '#f5f5f5'};
        }

        .list-cell {
          padding: 8px;
          border-right: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          display: flex;
          align-items: center;
          font-size: 13px;
        }

        .agent-name-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .agent-name-cell .agent-name {
          font-weight: 500;
          margin-bottom: 2px;
        }

        .agent-name-cell .agent-type {
          font-size: 11px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .task-info .task-name {
          font-weight: 500;
          margin-bottom: 2px;
        }

        .task-info .task-focus {
          font-size: 11px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .progress-container .progress-bar {
          flex: 1;
          height: 4px;
        }

        .performance-metrics, .resource-metrics {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 11px;
        }

        .network-view {
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .network-placeholder {
          text-align: center;
          padding: 40px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .network-placeholder h4 {
          margin: 0 0 12px 0;
          font-size: 18px;
        }

        .network-placeholder p {
          margin: 0 0 20px 0;
          font-size: 14px;
        }

        .network-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .bottlenecks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bottleneck-card {
          border-radius: 6px;
          padding: 16px;
          border-left: 4px solid;
        }

        .bottleneck-card.bottleneck-low {
          background: ${theme === 'dark' ? '#14532d20' : '#e8f5e8'};
          border-color: #4CAF50;
        }

        .bottleneck-card.bottleneck-medium {
          background: ${theme === 'dark' ? '#92400e20' : '#fff3e0'};
          border-color: #FF9800;
        }

        .bottleneck-card.bottleneck-high {
          background: ${theme === 'dark' ? '#7f1d1d20' : '#ffebee'};
          border-color: #F44336;
        }

        .bottleneck-card.bottleneck-critical {
          background: ${theme === 'dark' ? '#7f1d1d40' : '#ffcdd2'};
          border-color: #D32F2F;
        }

        .bottleneck-header {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .bottleneck-agent {
          color: #2196F3;
        }

        .bottleneck-type {
          text-transform: capitalize;
        }

        .bottleneck-severity {
          text-transform: uppercase;
          font-size: 12px;
        }

        .bottleneck-description {
          font-size: 14px;
          margin-bottom: 8px;
        }

        .bottleneck-suggestion {
          font-size: 13px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .event-item {
          display: grid;
          grid-template-columns: 80px 120px 150px 1fr;
          gap: 12px;
          padding: 8px;
          background: ${theme === 'dark' ? '#333333' : '#f5f5f5'};
          border-radius: 4px;
          font-size: 12px;
        }

        .event-time {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .event-type {
          text-transform: capitalize;
          font-weight: 500;
        }

        .event-agent {
          color: #2196F3;
        }

        .event-description {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        @media (max-width: 1024px) {
          .coordination-header {
            flex-direction: column;
            gap: 16px;
          }

          .header-controls {
            flex-wrap: wrap;
            justify-content: center;
          }

          .overview-metrics {
            grid-template-columns: 1fr;
          }

          .agents-grid {
            grid-template-columns: 1fr;
          }

          .list-header, .list-row {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(7, auto);
          }

          .header-cell, .list-cell {
            border-right: none;
            border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          }

          .event-item {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, auto);
          }

          .bottleneck-header {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default CoordinationStatus;