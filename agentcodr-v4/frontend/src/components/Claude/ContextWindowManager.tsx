import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

export interface ContextItem {
  id: string;
  content: string;
  type: 'user_input' | 'ai_response' | 'system_message' | 'code_context' | 'file_content';
  tokens: number;
  timestamp: Date;
  relevanceScore: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  locked: boolean; // Prevents auto-removal
  source?: string; // File path or source identifier
}

export interface ContextSummary {
  totalTokens: number;
  itemCount: number;
  utilization: number; // 0-1 ratio of used/max tokens
  maxTokens: number;
  optimizationNeeded: boolean;
  distribution: {
    user_input: number;
    ai_response: number;
    system_message: number;
    code_context: number;
    file_content: number;
  };
}

export interface ContextOptimization {
  enabled: boolean;
  strategy: 'oldest_first' | 'lowest_relevance' | 'balanced' | 'smart';
  autoOptimizeThreshold: number; // 0-1 ratio
  preserveRecent: boolean;
  preserveHighPriority: boolean;
  maxItemsToRemove: number;
}

export interface ContextWindowData {
  items: ContextItem[];
  summary: ContextSummary;
  optimization: ContextOptimization;
  recommendations: {
    type: 'remove_duplicates' | 'compress_content' | 'archive_old' | 'reduce_verbosity';
    title: string;
    description: string;
    tokensSaved: number;
    itemsAffected: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  alerts: {
    id: string;
    type: 'approaching_limit' | 'limit_exceeded' | 'optimization_needed' | 'memory_pressure';
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: Date;
    actionRequired: boolean;
  }[];
}

export interface ContextWindowManagerProps {
  onAddContext?: (content: string, type: string) => void;
  onRemoveContext?: (itemId: string) => void;
  onOptimizeContext?: () => void;
  onUpdateOptimization?: (settings: Partial<ContextOptimization>) => void;
  onLockItem?: (itemId: string, locked: boolean) => void;
  refreshInterval?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

export const ContextWindowManager: React.FC<ContextWindowManagerProps> = ({
  onAddContext,
  onRemoveContext,
  onOptimizeContext,
  onUpdateOptimization,
  onLockItem,
  refreshInterval = 10000, // 10 seconds
  className = '',
  theme = 'light'
}) => {
  const [contextData, setContextData] = useState<ContextWindowData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAddContextModal, setShowAddContextModal] = useState(false);
  const [showOptimizationSettings, setShowOptimizationSettings] = useState(false);
  const [newContextContent, setNewContextContent] = useState('');
  const [newContextType, setNewContextType] = useState<string>('user_input');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // WebSocket connection for real-time context updates
  const {
    isConnected: wsConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/context-manager',
    onConnect: () => {
      console.log('Connected to context manager WebSocket');
      requestContextData();
    },
    onError: (error) => {
      console.error('Context manager WebSocket error:', error);
      setError('Failed to connect to context manager service');
    },
    autoReconnect: true
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'context_window_update') {
      setContextData(lastMessage.data);
      setIsLoading(false);
      setLastUpdate(new Date());
      setError(null);
    }
  }, [lastMessage]);

  // Request context data
  const requestContextData = useCallback(() => {
    if (wsConnected) {
      sendMessage('request_context_data', {
        timestamp: new Date().toISOString()
      });
    }
  }, [wsConnected, sendMessage]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0 && wsConnected) {
      const interval = setInterval(requestContextData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, wsConnected, requestContextData]);

  // Initial data load
  useEffect(() => {
    if (wsConnected) {
      requestContextData();
    }
  }, [wsConnected, requestContextData]);

  const handleAddContext = () => {
    if (!newContextContent.trim()) {
      alert('Please enter content to add to context');
      return;
    }

    if (onAddContext) {
      onAddContext(newContextContent, newContextType);
    }

    if (wsConnected) {
      sendMessage('add_context', {
        content: newContextContent,
        type: newContextType,
        timestamp: new Date().toISOString()
      });
    }

    setNewContextContent('');
    setShowAddContextModal(false);
  };

  const handleRemoveContext = (itemId: string) => {
    if (onRemoveContext) {
      onRemoveContext(itemId);
    }

    if (wsConnected) {
      sendMessage('remove_context', {
        itemId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleOptimizeContext = () => {
    if (onOptimizeContext) {
      onOptimizeContext();
    }

    if (wsConnected) {
      sendMessage('optimize_context', {
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleLockItem = (itemId: string, locked: boolean) => {
    if (onLockItem) {
      onLockItem(itemId, locked);
    }

    if (wsConnected) {
      sendMessage('lock_context_item', {
        itemId,
        locked,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleBulkRemove = () => {
    if (selectedItems.size === 0) return;

    selectedItems.forEach(itemId => {
      handleRemoveContext(itemId);
    });

    setSelectedItems(new Set());
  };

  const handleSelectItem = (itemId: string, selected: boolean) => {
    const newSelected = new Set(selectedItems);
    if (selected) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && contextData) {
      setSelectedItems(new Set(contextData.items.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Default data for when no real data is available
  const defaultData: ContextWindowData = {
    items: [],
    summary: {
      totalTokens: 0,
      itemCount: 0,
      utilization: 0,
      maxTokens: 100000,
      optimizationNeeded: false,
      distribution: {
        user_input: 0,
        ai_response: 0,
        system_message: 0,
        code_context: 0,
        file_content: 0
      }
    },
    optimization: {
      enabled: true,
      strategy: 'balanced',
      autoOptimizeThreshold: 0.85,
      preserveRecent: true,
      preserveHighPriority: true,
      maxItemsToRemove: 10
    },
    recommendations: [],
    alerts: []
  };

  const data = contextData || defaultData;
  const containerClass = `context-window-manager ${theme} ${className}`;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user_input': return '#2196F3';
      case 'ai_response': return '#4CAF50';
      case 'system_message': return '#FF9800';
      case 'code_context': return '#9C27B0';
      case 'file_content': return '#607D8B';
      default: return '#777777';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      case 'low': return '#4CAF50';
      default: return '#777777';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 0.9) return '#F44336';
    if (utilization >= 0.7) return '#FF9800';
    return '#4CAF50';
  };

  if (isLoading && !contextData) {
    return (
      <div className={containerClass}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading context window data...</p>
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
      <div className="manager-header">
        <div className="header-info">
          <h2>Context Window Manager</h2>
          <div className="context-stats">
            <span>{formatTokens(data.summary.totalTokens)} / {formatTokens(data.summary.maxTokens)} tokens</span>
            <span className="utilization" style={{color: getUtilizationColor(data.summary.utilization)}}>
              ({Math.round(data.summary.utilization * 100)}% used)
            </span>
          </div>
        </div>
        <div className="header-controls">
          <button 
            className="add-context-btn"
            onClick={() => setShowAddContextModal(true)}
          >
            Add Context
          </button>
          <button 
            className="optimize-btn"
            onClick={handleOptimizeContext}
            disabled={!data.summary.optimizationNeeded}
          >
            Optimize
          </button>
          <button 
            className="settings-btn"
            onClick={() => setShowOptimizationSettings(true)}
          >
            Settings
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
          {data.alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.severity}`}>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{formatRelativeTime(alert.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="manager-content">
        {/* Context Summary */}
        <div className="summary-section">
          <h3>Context Summary</h3>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-label">Total Items</div>
              <div className="summary-value">{data.summary.itemCount}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Token Utilization</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${Math.min(data.summary.utilization * 100, 100)}%`,
                    backgroundColor: getUtilizationColor(data.summary.utilization)
                  }}
                />
              </div>
              <div className="progress-text">{Math.round(data.summary.utilization * 100)}%</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Distribution</div>
              <div className="distribution-chart">
                {Object.entries(data.summary.distribution).map(([type, count]) => (
                  <div key={type} className="distribution-item">
                    <div 
                      className="distribution-bar"
                      style={{
                        width: `${(count / data.summary.itemCount) * 100}%`,
                        backgroundColor: getTypeColor(type)
                      }}
                    />
                    <span className="distribution-label">{type.replace('_', ' ')}: {count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {data.items.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-selection">
              <label>
                <input
                  type="checkbox"
                  checked={selectedItems.size === data.items.length && data.items.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                Select All ({selectedItems.size} selected)
              </label>
            </div>
            {selectedItems.size > 0 && (
              <div className="bulk-buttons">
                <button 
                  className="bulk-remove-btn"
                  onClick={handleBulkRemove}
                >
                  Remove Selected ({selectedItems.size})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Context Items */}
        <div className="items-section">
          <h3>Context Items ({data.items.length})</h3>
          <div className="items-list">
            {data.items.length === 0 ? (
              <div className="no-items">No context items</div>
            ) : (
              data.items.map(item => (
                <div key={item.id} className="context-item">
                  <div className="item-header">
                    <div className="item-selection">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                    </div>
                    <div className="item-info">
                      <div className="item-meta">
                        <span 
                          className="item-type"
                          style={{backgroundColor: getTypeColor(item.type)}}
                        >
                          {item.type.replace('_', ' ')}
                        </span>
                        <span 
                          className="item-priority"
                          style={{color: getPriorityColor(item.priority)}}
                        >
                          {item.priority}
                        </span>
                        <span className="item-tokens">{formatTokens(item.tokens)} tokens</span>
                        <span className="item-time">{formatRelativeTime(item.timestamp)}</span>
                        {item.source && (
                          <span className="item-source">from {item.source}</span>
                        )}
                      </div>
                      <div className="item-relevance">
                        Relevance: {Math.round(item.relevanceScore * 100)}%
                      </div>
                    </div>
                    <div className="item-actions">
                      <button
                        className={`lock-btn ${item.locked ? 'locked' : ''}`}
                        onClick={() => handleLockItem(item.id, !item.locked)}
                        title={item.locked ? 'Unlock item' : 'Lock item'}
                      >
                        {item.locked ? '🔒' : '🔓'}
                      </button>
                      {!item.locked && (
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveContext(item.id)}
                          title="Remove item"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="item-content">
                    {item.content.length > 200 
                      ? `${item.content.substring(0, 200)}...`
                      : item.content
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>Optimization Recommendations</h3>
            <div className="recommendations-list">
              {data.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <div className="recommendation-title">{rec.title}</div>
                    <div className="recommendation-savings">
                      {formatTokens(rec.tokensSaved)} tokens saved
                    </div>
                  </div>
                  <div className="recommendation-description">{rec.description}</div>
                  <div className="recommendation-footer">
                    <span className="recommendation-impact">
                      Affects {rec.itemsAffected} items
                    </span>
                    <span className="recommendation-difficulty">
                      Difficulty: {rec.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Context Modal */}
      {showAddContextModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Context</h3>
              <button onClick={() => setShowAddContextModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Content Type</label>
                <select
                  value={newContextType}
                  onChange={(e) => setNewContextType(e.target.value)}
                >
                  <option value="user_input">User Input</option>
                  <option value="code_context">Code Context</option>
                  <option value="file_content">File Content</option>
                  <option value="system_message">System Message</option>
                </select>
              </div>
              <div className="input-group">
                <label>Content</label>
                <textarea
                  value={newContextContent}
                  onChange={(e) => setNewContextContent(e.target.value)}
                  placeholder="Enter content to add to context window..."
                  rows={6}
                />
              </div>
              <div className="estimated-tokens">
                Estimated tokens: {Math.ceil(newContextContent.length / 4)}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddContextModal(false)}>Cancel</button>
              <button onClick={handleAddContext}>Add Context</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .context-window-manager {
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          padding: 20px;
          border-radius: 8px;
          max-width: 1200px;
        }

        .manager-header {
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
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: #2196F3;
        }

        .context-stats {
          display: flex;
          gap: 12px;
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .utilization {
          font-weight: 500;
        }

        .header-controls {
          display: flex;
          gap: 12px;
        }

        .add-context-btn, .optimize-btn, .settings-btn, .bulk-remove-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .add-context-btn {
          background: #4CAF50;
          color: white;
        }

        .add-context-btn:hover {
          background: #45a049;
        }

        .optimize-btn {
          background: #FF9800;
          color: white;
        }

        .optimize-btn:hover:not(:disabled) {
          background: #F57C00;
        }

        .optimize-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .settings-btn {
          background: #2196F3;
          color: white;
        }

        .settings-btn:hover {
          background: #1976D2;
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

        .alert {
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

        .alert-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .alert-message {
          font-size: 14px;
          font-weight: 500;
        }

        .alert-time {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .manager-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .summary-section, .items-section, .recommendations-section {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .summary-section h3, .items-section h3, .recommendations-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .summary-card {
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
        }

        .summary-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 8px;
        }

        .summary-value {
          font-size: 24px;
          font-weight: bold;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: ${theme === 'dark' ? '#555555' : '#e0e0e0'};
          border-radius: 4px;
          overflow: hidden;
          margin: 8px 0;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 12px;
          text-align: center;
        }

        .distribution-chart {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .distribution-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .distribution-bar {
          height: 4px;
          min-width: 20px;
          border-radius: 2px;
        }

        .distribution-label {
          font-size: 11px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .bulk-actions {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bulk-selection label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .bulk-remove-btn {
          background: #F44336;
          color: white;
        }

        .bulk-remove-btn:hover {
          background: #D32F2F;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .no-items {
          text-align: center;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-style: italic;
          padding: 40px 20px;
        }

        .context-item {
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 6px;
          padding: 16px;
          background: ${theme === 'dark' ? '#333333' : '#fafafa'};
        }

        .item-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .item-selection {
          padding-top: 2px;
        }

        .item-info {
          flex: 1;
        }

        .item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 4px;
        }

        .item-type {
          padding: 2px 8px;
          border-radius: 12px;
          color: white;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .item-priority {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .item-tokens, .item-time, .item-source {
          font-size: 11px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .item-relevance {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }

        .lock-btn, .remove-btn {
          background: none;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#cccccc'};
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .lock-btn:hover, .remove-btn:hover {
          background: ${theme === 'dark' ? '#404040' : '#f5f5f5'};
        }

        .lock-btn.locked {
          color: #FF9800;
          border-color: #FF9800;
        }

        .remove-btn {
          color: #F44336;
          border-color: #F44336;
        }

        .item-content {
          font-size: 14px;
          line-height: 1.4;
          white-space: pre-wrap;
          background: ${theme === 'dark' ? '#2a2a2a' : '#ffffff'};
          padding: 12px;
          border-radius: 4px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recommendation-card {
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 6px;
          padding: 16px;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .recommendation-title {
          font-size: 16px;
          font-weight: 600;
        }

        .recommendation-savings {
          font-size: 14px;
          color: #4CAF50;
          font-weight: 500;
        }

        .recommendation-description {
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 8px;
        }

        .recommendation-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          width: 500px;
          max-width: 90vw;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .modal-header button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-body {
          padding: 20px;
        }

        .input-group {
          margin-bottom: 16px;
        }

        .input-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        .input-group select, .input-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#cccccc'};
          border-radius: 4px;
          background: ${theme === 'dark' ? '#404040' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          font-size: 14px;
          box-sizing: border-box;
        }

        .input-group textarea {
          resize: vertical;
          font-family: inherit;
          line-height: 1.4;
        }

        .estimated-tokens {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .modal-footer button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .modal-footer button:first-child {
          background: transparent;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          border: 1px solid ${theme === 'dark' ? '#404040' : '#cccccc'};
        }

        .modal-footer button:last-child {
          background: #4CAF50;
          color: white;
        }

        .modal-footer button:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .manager-header {
            flex-direction: column;
            gap: 16px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .bulk-actions {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .item-header {
            flex-direction: column;
            gap: 8px;
          }

          .item-meta {
            flex-direction: column;
            gap: 4px;
          }

          .recommendation-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .modal {
            width: 95vw;
          }
        }
      `}</style>
    </div>
  );
};

export default ContextWindowManager;