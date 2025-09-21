import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from '../../hooks/useWebSocket';

export interface CostMetrics {
  totalCost: number;
  monthlyCost: number;
  dailyCost: number;
  totalSavings: number;
  monthlySavings: number;
  costPerRequest: number;
  costPerToken: number;
  budgetLimit: number;
  budgetUtilization: number;
  projectedMonthlyCost: number;
}

export interface CostBreakdown {
  requestCosts: number;
  tokenCosts: number;
  cachingCosts: number;
  compressionCosts: number;
  batchingCosts: number;
}

export interface OptimizationStats {
  cacheHitRate: number;
  compressionRatio: number;
  batchingEfficiency: number;
  duplicateRequestsEliminated: number;
  totalOptimizationSavings: number;
  optimizationRecommendations: {
    type: 'caching' | 'compression' | 'batching' | 'request_optimization';
    title: string;
    description: string;
    potentialSavings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    priority: 'low' | 'medium' | 'high';
  }[];
}

export interface CostAlert {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'unusual_spending' | 'optimization_opportunity';
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  dismissed: boolean;
  actionRequired: boolean;
}

export interface CostOptimizationData {
  metrics: CostMetrics;
  breakdown: CostBreakdown;
  optimization: OptimizationStats;
  alerts: CostAlert[];
  historicalData: {
    timestamp: Date;
    cost: number;
    savings: number;
    requests: number;
  }[];
  settings: {
    budgetLimit: number;
    alertThresholds: {
      warning: number;
      critical: number;
    };
    optimizationLevel: 'conservative' | 'balanced' | 'aggressive';
    cachingEnabled: boolean;
    compressionEnabled: boolean;
    batchingEnabled: boolean;
  };
}

export interface CostOptimizationMonitorProps {
  onUpdateBudget?: (newBudget: number) => void;
  onToggleOptimization?: (type: string, enabled: boolean) => void;
  onDismissAlert?: (alertId: string) => void;
  onApplyRecommendation?: (recommendationType: string) => void;
  refreshInterval?: number;
  className?: string;
  theme?: 'light' | 'dark';
}

export const CostOptimizationMonitor: React.FC<CostOptimizationMonitorProps> = ({
  onUpdateBudget,
  onToggleOptimization,
  onDismissAlert,
  onApplyRecommendation,
  refreshInterval = 30000, // 30 seconds for cost monitoring
  className = '',
  theme = 'light'
}) => {
  const [costData, setCostData] = useState<CostOptimizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudgetValue, setNewBudgetValue] = useState<string>('');

  // WebSocket connection for real-time cost updates
  const {
    isConnected: wsConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/cost-optimization',
    onConnect: () => {
      console.log('Connected to cost optimization WebSocket');
      requestCostData();
    },
    onError: (error) => {
      console.error('Cost optimization WebSocket error:', error);
      setError('Failed to connect to cost optimization service');
    },
    autoReconnect: true
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'cost_optimization_update') {
      setCostData(lastMessage.data);
      setIsLoading(false);
      setLastUpdate(new Date());
      setError(null);
    }
  }, [lastMessage]);

  // Request cost data
  const requestCostData = useCallback(() => {
    if (wsConnected) {
      sendMessage('request_cost_data', {
        timestamp: new Date().toISOString()
      });
    }
  }, [wsConnected, sendMessage]);

  // Auto-refresh data
  useEffect(() => {
    if (refreshInterval > 0 && wsConnected) {
      const interval = setInterval(requestCostData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, wsConnected, requestCostData]);

  // Initial data load
  useEffect(() => {
    if (wsConnected) {
      requestCostData();
    }
  }, [wsConnected, requestCostData]);

  const handleUpdateBudget = () => {
    const budget = parseFloat(newBudgetValue);
    if (isNaN(budget) || budget <= 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    if (onUpdateBudget) {
      onUpdateBudget(budget);
    }

    if (wsConnected) {
      sendMessage('update_budget', {
        newBudget: budget,
        timestamp: new Date().toISOString()
      });
    }

    setShowBudgetModal(false);
    setNewBudgetValue('');
  };

  const handleToggleOptimization = (type: string, enabled: boolean) => {
    if (onToggleOptimization) {
      onToggleOptimization(type, enabled);
    }

    if (wsConnected) {
      sendMessage('toggle_optimization', {
        type,
        enabled,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleDismissAlert = (alertId: string) => {
    if (onDismissAlert) {
      onDismissAlert(alertId);
    }

    if (wsConnected) {
      sendMessage('dismiss_alert', {
        alertId,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleApplyRecommendation = (recommendationType: string) => {
    if (onApplyRecommendation) {
      onApplyRecommendation(recommendationType);
    }

    if (wsConnected) {
      sendMessage('apply_recommendation', {
        type: recommendationType,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Default data for when no real data is available
  const defaultData: CostOptimizationData = {
    metrics: {
      totalCost: 0,
      monthlyCost: 0,
      dailyCost: 0,
      totalSavings: 0,
      monthlySavings: 0,
      costPerRequest: 0,
      costPerToken: 0,
      budgetLimit: 100,
      budgetUtilization: 0,
      projectedMonthlyCost: 0
    },
    breakdown: {
      requestCosts: 0,
      tokenCosts: 0,
      cachingCosts: 0,
      compressionCosts: 0,
      batchingCosts: 0
    },
    optimization: {
      cacheHitRate: 0,
      compressionRatio: 0,
      batchingEfficiency: 0,
      duplicateRequestsEliminated: 0,
      totalOptimizationSavings: 0,
      optimizationRecommendations: []
    },
    alerts: [],
    historicalData: [],
    settings: {
      budgetLimit: 100,
      alertThresholds: {
        warning: 80,
        critical: 95
      },
      optimizationLevel: 'balanced',
      cachingEnabled: true,
      compressionEnabled: true,
      batchingEnabled: true
    }
  };

  const data = costData || defaultData;
  const containerClass = `cost-optimization-monitor ${theme} ${className}`;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`;
  };

  const getBudgetStatusColor = (utilization: number) => {
    if (utilization >= 0.95) return '#F44336';
    if (utilization >= 0.8) return '#FF9800';
    return '#4CAF50';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget_warning': return '⚠️';
      case 'budget_exceeded': return '🚨';
      case 'unusual_spending': return '📈';
      case 'optimization_opportunity': return '💡';
      default: return 'ℹ️';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  if (isLoading && !costData) {
    return (
      <div className={containerClass}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading cost optimization data...</p>
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
      <div className="monitor-header">
        <div className="header-info">
          <h2>Cost Optimization Monitor</h2>
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        <div className="header-controls">
          <button 
            className="budget-btn"
            onClick={() => setShowBudgetModal(true)}
          >
            Set Budget
          </button>
          <button 
            className="refresh-btn"
            onClick={requestCostData}
            disabled={isLoading}
          >
            Refresh
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
      {data.alerts.filter(alert => !alert.dismissed).length > 0 && (
        <div className="alerts-section">
          <h3>Cost Alerts</h3>
          {data.alerts.filter(alert => !alert.dismissed).map(alert => (
            <div key={alert.id} className={`alert alert-${alert.level}`}>
              <div className="alert-content">
                <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                <div className="alert-info">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-time">{alert.timestamp.toLocaleTimeString()}</div>
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
      <div className="monitor-content">
        {/* Cost Overview */}
        <div className="cost-overview-section">
          <h3>Cost Overview</h3>
          <div className="overview-grid">
            <div className="metric-card">
              <div className="metric-label">Total Cost</div>
              <div className="metric-value">{formatCurrency(data.metrics.totalCost)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Monthly Cost</div>
              <div className="metric-value">{formatCurrency(data.metrics.monthlyCost)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Daily Cost</div>
              <div className="metric-value">{formatCurrency(data.metrics.dailyCost)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total Savings</div>
              <div className="metric-value savings">{formatCurrency(data.metrics.totalSavings)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Cost per Request</div>
              <div className="metric-value">{formatCurrency(data.metrics.costPerRequest)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Cost per Token</div>
              <div className="metric-value">{formatCurrency(data.metrics.costPerToken)}</div>
            </div>
          </div>
        </div>

        {/* Budget Status */}
        <div className="budget-section">
          <h3>Budget Status</h3>
          <div className="budget-info">
            <div className="budget-progress">
              <div className="budget-labels">
                <span>Budget: {formatCurrency(data.metrics.budgetLimit)}</span>
                <span>Used: {formatCurrency(data.metrics.monthlyCost)}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${Math.min(data.metrics.budgetUtilization * 100, 100)}%`,
                    backgroundColor: getBudgetStatusColor(data.metrics.budgetUtilization)
                  }}
                />
              </div>
              <div className="budget-stats">
                <span>Utilization: {formatPercentage(data.metrics.budgetUtilization)}</span>
                <span>Projected: {formatCurrency(data.metrics.projectedMonthlyCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="breakdown-section">
          <h3>Cost Breakdown</h3>
          <div className="breakdown-chart">
            <div className="breakdown-item">
              <div className="breakdown-label">Request Costs</div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill" 
                  style={{width: `${(data.breakdown.requestCosts / data.metrics.totalCost) * 100}%`}}
                />
              </div>
              <div className="breakdown-value">{formatCurrency(data.breakdown.requestCosts)}</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">Token Costs</div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill" 
                  style={{width: `${(data.breakdown.tokenCosts / data.metrics.totalCost) * 100}%`}}
                />
              </div>
              <div className="breakdown-value">{formatCurrency(data.breakdown.tokenCosts)}</div>
            </div>
            <div className="breakdown-item">
              <div className="breakdown-label">Caching Overhead</div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill" 
                  style={{width: `${(data.breakdown.cachingCosts / data.metrics.totalCost) * 100}%`}}
                />
              </div>
              <div className="breakdown-value">{formatCurrency(data.breakdown.cachingCosts)}</div>
            </div>
          </div>
        </div>

        {/* Optimization Status */}
        <div className="optimization-section">
          <h3>Optimization Status</h3>
          <div className="optimization-grid">
            <div className="optimization-card">
              <div className="optimization-label">Cache Hit Rate</div>
              <div className="optimization-value">{formatPercentage(data.optimization.cacheHitRate)}</div>
              <div className="optimization-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={data.settings.cachingEnabled}
                    onChange={(e) => handleToggleOptimization('caching', e.target.checked)}
                  />
                  Enabled
                </label>
              </div>
            </div>
            <div className="optimization-card">
              <div className="optimization-label">Compression Ratio</div>
              <div className="optimization-value">{formatPercentage(data.optimization.compressionRatio)}</div>
              <div className="optimization-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={data.settings.compressionEnabled}
                    onChange={(e) => handleToggleOptimization('compression', e.target.checked)}
                  />
                  Enabled
                </label>
              </div>
            </div>
            <div className="optimization-card">
              <div className="optimization-label">Batching Efficiency</div>
              <div className="optimization-value">{formatPercentage(data.optimization.batchingEfficiency)}</div>
              <div className="optimization-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={data.settings.batchingEnabled}
                    onChange={(e) => handleToggleOptimization('batching', e.target.checked)}
                  />
                  Enabled
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Recommendations */}
        {data.optimization.optimizationRecommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>Optimization Recommendations</h3>
            <div className="recommendations-list">
              {data.optimization.optimizationRecommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <div className="recommendation-title">{rec.title}</div>
                    <div className="recommendation-meta">
                      <span 
                        className="priority-badge"
                        style={{backgroundColor: getPriorityColor(rec.priority)}}
                      >
                        {rec.priority}
                      </span>
                      <span className="savings">{formatCurrency(rec.potentialSavings)} savings</span>
                    </div>
                  </div>
                  <div className="recommendation-description">{rec.description}</div>
                  <div className="recommendation-footer">
                    <span className="difficulty">Difficulty: {rec.difficulty}</span>
                    <button 
                      className="apply-btn"
                      onClick={() => handleApplyRecommendation(rec.type)}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Set Monthly Budget</h3>
              <button 
                className="modal-close"
                onClick={() => setShowBudgetModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Monthly Budget ($)</label>
                <input
                  type="number"
                  value={newBudgetValue}
                  onChange={(e) => setNewBudgetValue(e.target.value)}
                  placeholder="Enter budget amount"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="current-budget">
                Current budget: {formatCurrency(data.metrics.budgetLimit)}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowBudgetModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleUpdateBudget}
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cost-optimization-monitor {
          background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          padding: 20px;
          border-radius: 8px;
          max-width: 1200px;
        }

        .monitor-header {
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

        .last-update {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .header-controls {
          display: flex;
          gap: 12px;
        }

        .budget-btn, .refresh-btn, .apply-btn, .save-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .budget-btn {
          background: #4CAF50;
          color: white;
        }

        .budget-btn:hover {
          background: #45a049;
        }

        .refresh-btn {
          background: #2196F3;
          color: white;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #1976D2;
        }

        .refresh-btn:disabled {
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

        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-icon {
          font-size: 20px;
        }

        .alert-info {
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

        .monitor-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .cost-overview-section, .budget-section, .breakdown-section, .optimization-section, .recommendations-section {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .cost-overview-section h3, .budget-section h3, .breakdown-section h3, .optimization-section h3, .recommendations-section h3 {
          margin: 0 0 16px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .overview-grid {
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
          font-size: 18px;
          font-weight: bold;
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .metric-value.savings {
          color: #4CAF50;
        }

        .budget-progress {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .budget-labels, .budget-stats {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
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

        .breakdown-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-item {
          display: grid;
          grid-template-columns: 150px 1fr 100px;
          gap: 12px;
          align-items: center;
        }

        .breakdown-label {
          font-size: 14px;
        }

        .breakdown-bar {
          height: 8px;
          background: ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 4px;
          overflow: hidden;
        }

        .breakdown-fill {
          height: 100%;
          background: #2196F3;
          transition: width 0.3s ease;
        }

        .breakdown-value {
          font-size: 14px;
          font-weight: 500;
          text-align: right;
        }

        .optimization-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .optimization-card {
          padding: 16px;
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          border-radius: 6px;
          text-align: center;
        }

        .optimization-label {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 8px;
        }

        .optimization-value {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 12px;
        }

        .optimization-toggle label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .recommendation-card {
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 6px;
          padding: 16px;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .recommendation-title {
          font-size: 16px;
          font-weight: 600;
        }

        .recommendation-meta {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .priority-badge {
          padding: 2px 8px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .savings {
          font-size: 12px;
          color: #4CAF50;
          font-weight: 500;
        }

        .recommendation-description {
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .recommendation-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .difficulty {
          font-size: 12px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .apply-btn {
          background: #4CAF50;
          color: white;
        }

        .apply-btn:hover {
          background: #45a049;
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
          width: 400px;
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

        .modal-close {
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

        .input-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#cccccc'};
          border-radius: 4px;
          background: ${theme === 'dark' ? '#404040' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          font-size: 14px;
          box-sizing: border-box;
        }

        .current-budget {
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

        .cancel-btn {
          padding: 8px 16px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#cccccc'};
          border-radius: 4px;
          background: transparent;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          cursor: pointer;
          font-size: 14px;
        }

        .cancel-btn:hover {
          background: ${theme === 'dark' ? '#404040' : '#f5f5f5'};
        }

        .save-btn {
          background: #4CAF50;
          color: white;
        }

        .save-btn:hover {
          background: #45a049;
        }

        @media (max-width: 768px) {
          .monitor-header {
            flex-direction: column;
            gap: 16px;
          }

          .overview-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .optimization-grid {
            grid-template-columns: 1fr;
          }

          .breakdown-item {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .recommendation-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .recommendation-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default CostOptimizationMonitor;