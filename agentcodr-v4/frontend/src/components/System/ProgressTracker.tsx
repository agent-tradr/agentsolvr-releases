import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

export interface ProgressTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
  progress: number; // 0-1
  startTime: Date | null;
  estimatedDuration: number | null; // milliseconds
  actualDuration: number | null; // milliseconds
  dependencies: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'testing' | 'development' | 'deployment' | 'optimization' | 'maintenance';
  assignedTo: string | null;
  metadata: {
    subTasks?: {
      id: string;
      name: string;
      completed: boolean;
    }[];
    metrics?: {
      [key: string]: number | string;
    };
    errors?: string[];
  };
}

export interface ProgressMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completedDate: Date | null;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  dependentTasks: string[];
  criticalPath: boolean;
  weight: number; // 0-1, importance of this milestone
}

export interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pausedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overallProgress: number; // 0-1
  estimatedCompletion: Date | null;
  timeRemaining: number | null; // milliseconds
  onTrack: boolean;
  velocity: number; // tasks per hour
  burndownRate: number; // progress per hour
}

export interface ProgressTrackerData {
  tasks: ProgressTask[];
  milestones: ProgressMilestone[];
  summary: ProgressSummary;
  timeline: {
    timestamp: Date;
    progress: number;
    tasksCompleted: number;
    velocity: number;
  }[];
  criticalPath: string[]; // task IDs
  bottlenecks: {
    taskId: string;
    type: 'dependency' | 'resource' | 'complexity' | 'external';
    impact: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }[];
  predictedMetrics: {
    completionDate: Date;
    confidence: number; // 0-1
    riskFactors: string[];
    recommendations: string[];
  };
}

export interface ProgressTrackerProps {
  onStartTask?: (taskId: string) => void;
  onPauseTask?: (taskId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onRetryTask?: (taskId: string) => void;
  onUpdatePriority?: (taskId: string, priority: string) => void;
  refreshInterval?: number;
  className?: string;
  theme?: 'light' | 'dark';
  viewMode?: 'grid' | 'timeline' | 'gantt' | 'summary';
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  onStartTask,
  onPauseTask,
  onCompleteTask,
  onRetryTask,
  onUpdatePriority,
  refreshInterval = 10000, // 10 seconds
  className = '',
  theme = 'light',
  viewMode = 'grid'
}) => {
  const [progressData, setProgressData] = useState<ProgressTrackerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  // WebSocket connection for real-time progress updates
  const {
    isConnected: wsConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/progress-tracker',
    onConnect: () => {
      console.log('Connected to progress tracker WebSocket');
      requestProgressData();
    },
    onError: (error) => {
      console.error('Progress tracker WebSocket error:', error);
      setError('Failed to connect to progress tracking service');
    },
    autoReconnect: true
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'progress_update') {
      setProgressData(lastMessage.data);
      setIsLoading(false);
      setLastUpdate(new Date());
      setError(null);
    }
  }, [lastMessage]);

  // Request progress data
  const requestProgressData = useCallback(() => {
    if (wsConnected) {
      sendMessage('request_progress_data', {
        timestamp: new Date().toISOString()
      });
    }
  }, [wsConnected, sendMessage]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0 && wsConnected) {
      const interval = setInterval(requestProgressData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, wsConnected, requestProgressData]);

  // Initial data load
  useEffect(() => {
    if (wsConnected) {
      requestProgressData();
    }
  }, [wsConnected, requestProgressData]);

  const handleTaskAction = (action: string, taskId: string) => {
    const handlers = {
      start: onStartTask,
      pause: onPauseTask,
      complete: onCompleteTask,
      retry: onRetryTask
    };

    const handler = handlers[action as keyof typeof handlers];
    if (handler) {
      handler(taskId);
    }

    if (wsConnected) {
      sendMessage(`${action}_task`, {
        taskId,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Default data for when no real data is available
  const defaultData: ProgressTrackerData = {
    tasks: [
      {
        id: 'task_1',
        name: 'Frontend Integration Testing',
        description: 'Complete integration testing for all frontend components',
        status: 'in_progress',
        progress: 0.75,
        startTime: new Date(Date.now() - 3600000),
        estimatedDuration: 7200000, // 2 hours
        actualDuration: null,
        dependencies: [],
        priority: 'high',
        category: 'testing',
        assignedTo: 'Agent 5',
        metadata: {
          subTasks: [
            { id: 'sub_1', name: 'Claude Dashboard Tests', completed: true },
            { id: 'sub_2', name: 'Cost Monitor Tests', completed: true },
            { id: 'sub_3', name: 'Context Manager Tests', completed: true },
            { id: 'sub_4', name: 'Coordination Status Tests', completed: false }
          ],
          metrics: {
            testsCompleted: 24,
            testsTotal: 32,
            coverage: 0.87
          }
        }
      },
      {
        id: 'task_2',
        name: 'API Documentation',
        description: 'Generate comprehensive API documentation',
        status: 'completed',
        progress: 1.0,
        startTime: new Date(Date.now() - 7200000),
        estimatedDuration: 3600000, // 1 hour
        actualDuration: 2700000, // 45 minutes
        dependencies: ['task_1'],
        priority: 'medium',
        category: 'development',
        assignedTo: 'Agent 2',
        metadata: {
          metrics: {
            endpointsDocumented: 15,
            examplesGenerated: 45
          }
        }
      }
    ],
    milestones: [
      {
        id: 'milestone_1',
        name: 'Phase 3 Frontend Integration',
        description: 'Complete integration of all backend features into frontend',
        targetDate: new Date(Date.now() + 3600000),
        completedDate: null,
        status: 'in_progress',
        dependentTasks: ['task_1'],
        criticalPath: true,
        weight: 0.8
      }
    ],
    summary: {
      totalTasks: 15,
      completedTasks: 12,
      failedTasks: 0,
      pausedTasks: 1,
      inProgressTasks: 2,
      pendingTasks: 0,
      overallProgress: 0.85,
      estimatedCompletion: new Date(Date.now() + 3600000),
      timeRemaining: 3600000,
      onTrack: true,
      velocity: 1.5,
      burndownRate: 0.12
    },
    timeline: [],
    criticalPath: ['task_1'],
    bottlenecks: [],
    predictedMetrics: {
      completionDate: new Date(Date.now() + 3600000),
      confidence: 0.92,
      riskFactors: ['API integration complexity'],
      recommendations: ['Focus on remaining integration tests']
    }
  };

  const data = progressData || defaultData;
  const containerClass = `progress-tracker ${theme} ${className}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'failed': return '#F44336';
      case 'paused': return '#FF9800';
      case 'pending': return '#9E9E9E';
      default: return '#777777';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'testing': return '🧪';
      case 'development': return '💻';
      case 'deployment': return '🚀';
      case 'optimization': return '⚡';
      case 'maintenance': return '🔧';
      default: return '📋';
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const getFilteredTasks = () => {
    return data.tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      return true;
    });
  };

  const getTaskProgress = (task: ProgressTask) => {
    if (task.metadata.subTasks) {
      const completed = task.metadata.subTasks.filter(st => st.completed).length;
      return completed / task.metadata.subTasks.length;
    }
    return task.progress;
  };

  if (isLoading && !progressData) {
    return (
      <div className={containerClass}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading progress data...</p>
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

  const filteredTasks = getFilteredTasks();

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="tracker-header">
        <div className="header-info">
          <h2>Progress Tracker</h2>
          <div className="progress-summary">
            <div className="summary-stat">
              <span className="stat-value">{formatPercentage(data.summary.overallProgress)}</span>
              <span className="stat-label">Complete</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{data.summary.completedTasks}/{data.summary.totalTasks}</span>
              <span className="stat-label">Tasks</span>
            </div>
            <div className="summary-stat">
              <span className="stat-value">{formatDuration(data.summary.timeRemaining)}</span>
              <span className="stat-label">Remaining</span>
            </div>
            <div className={`track-indicator ${data.summary.onTrack ? 'on-track' : 'off-track'}`}>
              {data.summary.onTrack ? '✓ On Track' : '⚠ Behind'}
            </div>
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
              className={currentViewMode === 'timeline' ? 'active' : ''}
              onClick={() => setCurrentViewMode('timeline')}
            >
              Timeline
            </button>
            <button 
              className={currentViewMode === 'summary' ? 'active' : ''}
              onClick={() => setCurrentViewMode('summary')}
            >
              Summary
            </button>
          </div>
          <div className="filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="testing">Testing</option>
              <option value="development">Development</option>
              <option value="deployment">Deployment</option>
              <option value="optimization">Optimization</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-message">{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Overall Progress Bar */}
      <div className="overall-progress">
        <div className="progress-info">
          <span className="progress-label">Overall Progress</span>
          <span className="progress-percentage">{formatPercentage(data.summary.overallProgress)}</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{
              width: `${data.summary.overallProgress * 100}%`,
              backgroundColor: data.summary.onTrack ? '#4CAF50' : '#FF9800'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="tracker-content">
        {currentViewMode === 'grid' && (
          <div className="tasks-grid">
            {filteredTasks.map(task => (
              <div 
                key={task.id} 
                className={`task-card ${selectedTask === task.id ? 'selected' : ''}`}
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
              >
                <div className="task-header">
                  <div className="task-info">
                    <div className="task-icon">{getCategoryIcon(task.category)}</div>
                    <div className="task-details">
                      <div className="task-name">{task.name}</div>
                      <div className="task-assignee">{task.assignedTo || 'Unassigned'}</div>
                    </div>
                  </div>
                  <div className="task-meta">
                    <div 
                      className="status-badge"
                      style={{backgroundColor: getStatusColor(task.status)}}
                    >
                      {task.status.replace('_', ' ')}
                    </div>
                    <div 
                      className="priority-badge"
                      style={{backgroundColor: getPriorityColor(task.priority)}}
                    >
                      {task.priority}
                    </div>
                  </div>
                </div>

                <div className="task-description">{task.description}</div>

                <div className="task-progress">
                  <div className="progress-info">
                    <span>Progress</span>
                    <span>{formatPercentage(getTaskProgress(task))}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${getTaskProgress(task) * 100}%`,
                        backgroundColor: getStatusColor(task.status)
                      }}
                    />
                  </div>
                </div>

                {task.metadata.subTasks && (
                  <div className="subtasks">
                    <div className="subtasks-header">
                      Subtasks ({task.metadata.subTasks.filter(st => st.completed).length}/{task.metadata.subTasks.length})
                    </div>
                    <div className="subtasks-list">
                      {task.metadata.subTasks.slice(0, 3).map(subtask => (
                        <div key={subtask.id} className="subtask">
                          <span className={`subtask-status ${subtask.completed ? 'completed' : 'pending'}`}>
                            {subtask.completed ? '✓' : '○'}
                          </span>
                          <span className="subtask-name">{subtask.name}</span>
                        </div>
                      ))}
                      {task.metadata.subTasks.length > 3 && (
                        <div className="more-subtasks">
                          +{task.metadata.subTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="task-timing">
                  <div className="timing-info">
                    <span>Duration:</span>
                    <span>{formatDuration(task.actualDuration || task.estimatedDuration)}</span>
                  </div>
                  {task.startTime && (
                    <div className="timing-info">
                      <span>Started:</span>
                      <span>{task.startTime.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                <div className="task-actions">
                  {task.status === 'pending' && (
                    <button 
                      className="action-btn start-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskAction('start', task.id);
                      }}
                    >
                      Start
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button 
                      className="action-btn pause-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskAction('pause', task.id);
                      }}
                    >
                      Pause
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button 
                      className="action-btn complete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskAction('complete', task.id);
                      }}
                    >
                      Complete
                    </button>
                  )}
                  {task.status === 'failed' && (
                    <button 
                      className="action-btn retry-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskAction('retry', task.id);
                      }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {currentViewMode === 'timeline' && (
          <div className="timeline-view">
            <div className="timeline-header">
              <h3>Project Timeline</h3>
            </div>
            <div className="timeline-content">
              {data.milestones.map(milestone => (
                <div key={milestone.id} className="milestone-item">
                  <div className="milestone-marker">
                    <div 
                      className={`milestone-dot ${milestone.status}`}
                      style={{
                        backgroundColor: milestone.status === 'completed' ? '#4CAF50' : 
                                         milestone.status === 'overdue' ? '#F44336' : '#2196F3'
                      }}
                    />
                  </div>
                  <div className="milestone-content">
                    <div className="milestone-header">
                      <div className="milestone-name">{milestone.name}</div>
                      <div className="milestone-date">
                        Target: {milestone.targetDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="milestone-description">{milestone.description}</div>
                    <div className="milestone-tasks">
                      Dependent tasks: {milestone.dependentTasks.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentViewMode === 'summary' && (
          <div className="summary-view">
            <div className="summary-grid">
              <div className="summary-card">
                <h3>Task Distribution</h3>
                <div className="distribution-chart">
                  <div className="distribution-item">
                    <span className="distribution-label">Completed:</span>
                    <span className="distribution-value">{data.summary.completedTasks}</span>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill"
                        style={{
                          width: `${(data.summary.completedTasks / data.summary.totalTasks) * 100}%`,
                          backgroundColor: '#4CAF50'
                        }}
                      />
                    </div>
                  </div>
                  <div className="distribution-item">
                    <span className="distribution-label">In Progress:</span>
                    <span className="distribution-value">{data.summary.inProgressTasks}</span>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill"
                        style={{
                          width: `${(data.summary.inProgressTasks / data.summary.totalTasks) * 100}%`,
                          backgroundColor: '#2196F3'
                        }}
                      />
                    </div>
                  </div>
                  <div className="distribution-item">
                    <span className="distribution-label">Pending:</span>
                    <span className="distribution-value">{data.summary.pendingTasks}</span>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill"
                        style={{
                          width: `${(data.summary.pendingTasks / data.summary.totalTasks) * 100}%`,
                          backgroundColor: '#9E9E9E'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h3>Performance Metrics</h3>
                <div className="metrics-list">
                  <div className="metric-item">
                    <span className="metric-label">Velocity:</span>
                    <span className="metric-value">{data.summary.velocity.toFixed(1)} tasks/hour</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Burndown Rate:</span>
                    <span className="metric-value">{formatPercentage(data.summary.burndownRate)}/hour</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Estimated Completion:</span>
                    <span className="metric-value">
                      {data.summary.estimatedCompletion?.toLocaleDateString() || 'TBD'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h3>Predictions</h3>
                <div className="predictions">
                  <div className="prediction-item">
                    <span className="prediction-label">Confidence:</span>
                    <span className="prediction-value">
                      {formatPercentage(data.predictedMetrics.confidence)}
                    </span>
                  </div>
                  <div className="prediction-recommendations">
                    <h4>Recommendations:</h4>
                    <ul>
                      {data.predictedMetrics.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .progress-tracker {
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          padding: 20px;
          border-radius: 8px;
          max-width: 1400px;
        }

        .tracker-header {
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

        .progress-summary {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
        }

        .stat-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .track-indicator {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .track-indicator.on-track {
          background: #4CAF50;
          color: white;
        }

        .track-indicator.off-track {
          background: #FF9800;
          color: white;
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

        .filters {
          display: flex;
          gap: 8px;
        }

        .filters select {
          padding: 6px 12px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#cccccc'};
          border-radius: 4px;
          background: ${theme === 'dark' ? '#404040' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          font-size: 14px;
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

        .overall-progress {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          font-size: 16px;
          font-weight: 600;
        }

        .progress-percentage {
          font-size: 18px;
          font-weight: bold;
        }

        .progress-bar {
          width: 100%;
          height: 12px;
          background: ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .tracker-content {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 16px;
        }

        .task-card {
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .task-card:hover {
          border-color: #2196F3;
          box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
        }

        .task-card.selected {
          border-color: #2196F3;
          background: ${theme === 'dark' ? '#1e3a8a20' : '#e3f2fd'};
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .task-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .task-icon {
          font-size: 20px;
        }

        .task-details {
          flex: 1;
        }

        .task-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .task-assignee {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .task-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .status-badge, .priority-badge {
          padding: 2px 8px;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
          text-align: center;
        }

        .task-description {
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .task-progress {
          margin-bottom: 12px;
        }

        .task-progress .progress-info {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .task-progress .progress-bar {
          height: 6px;
        }

        .subtasks {
          margin-bottom: 12px;
        }

        .subtasks-header {
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .subtasks-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .subtask {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
        }

        .subtask-status {
          width: 12px;
          text-align: center;
        }

        .subtask-status.completed {
          color: #4CAF50;
        }

        .subtask-status.pending {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .subtask-name {
          flex: 1;
        }

        .more-subtasks {
          font-size: 11px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-style: italic;
          padding-left: 18px;
        }

        .task-timing {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .timing-info {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }

        .timing-info span:first-child {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .timing-info span:last-child {
          font-weight: 500;
        }

        .task-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .action-btn {
          padding: 4px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .start-btn {
          background: #4CAF50;
          color: white;
        }

        .start-btn:hover {
          background: #45a049;
        }

        .pause-btn {
          background: #FF9800;
          color: white;
        }

        .pause-btn:hover {
          background: #F57C00;
        }

        .complete-btn {
          background: #2196F3;
          color: white;
        }

        .complete-btn:hover {
          background: #1976D2;
        }

        .retry-btn {
          background: #F44336;
          color: white;
        }

        .retry-btn:hover {
          background: #D32F2F;
        }

        .timeline-view {
          padding: 20px 0;
        }

        .timeline-header h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .timeline-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .milestone-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .milestone-marker {
          padding-top: 4px;
        }

        .milestone-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .milestone-content {
          flex: 1;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .milestone-name {
          font-size: 16px;
          font-weight: 600;
        }

        .milestone-date {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .milestone-description {
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 4px;
        }

        .milestone-tasks {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .summary-view {
          padding: 20px 0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .summary-card {
          padding: 20px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 8px;
        }

        .summary-card h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
        }

        .distribution-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .distribution-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .distribution-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .distribution-value {
          font-size: 14px;
          font-weight: 500;
        }

        .distribution-bar {
          height: 4px;
          background: ${theme === 'dark' ? '#555555' : '#e0e0e0'};
          border-radius: 2px;
          overflow: hidden;
        }

        .distribution-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .metric-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .metric-label {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .metric-value {
          font-weight: 500;
        }

        .predictions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .prediction-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .prediction-label {
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .prediction-value {
          font-weight: 500;
        }

        .prediction-recommendations h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .prediction-recommendations ul {
          margin: 0;
          padding-left: 20px;
        }

        .prediction-recommendations li {
          font-size: 12px;
          margin-bottom: 4px;
        }

        @media (max-width: 1024px) {
          .tracker-header {
            flex-direction: column;
            gap: 16px;
          }

          .progress-summary {
            flex-wrap: wrap;
            justify-content: center;
          }

          .header-controls {
            flex-wrap: wrap;
            justify-content: center;
          }

          .tasks-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .progress-tracker {
            padding: 16px;
          }

          .task-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .task-meta {
            flex-direction: row;
            gap: 8px;
          }

          .task-timing {
            grid-template-columns: 1fr;
          }

          .task-actions {
            justify-content: flex-start;
          }

          .milestone-item {
            flex-direction: column;
            gap: 8px;
          }

          .milestone-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressTracker;