import React, { useState, useEffect } from 'react';

/**
 * AuditLogViewer Component
 * 
 * Displays comprehensive security audit logs with filtering,
 * searching, and detailed event information.
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: 'authentication' | 'authorization' | 'session' | 'security' | 'system' | 'error';
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  description: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  success: boolean;
}

export interface AuditLogFilters {
  eventTypes: string[];
  severityLevels: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  searchQuery: string;
  userId?: string;
  sessionId?: string;
}

interface AuditLogViewerProps {
  logs?: AuditLogEntry[];
  onLoadLogs?: (filters: AuditLogFilters, page: number, limit: number) => Promise<AuditLogEntry[]>;
  onExportLogs?: (filters: AuditLogFilters) => void;
  theme?: 'light' | 'dark';
  compact?: boolean;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  onLoadLogs,
  onExportLogs,
  theme = 'light',
  compact = false
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [filters, setFilters] = useState<AuditLogFilters>({
    eventTypes: [],
    severityLevels: [],
    dateRange: { start: null, end: null },
    searchQuery: '',
    userId: '',
    sessionId: ''
  });

  const itemsPerPage = compact ? 10 : 25;

  // Mock audit log data for development
  const mockLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      eventType: 'authentication',
      severity: 'info',
      action: 'login_success',
      description: 'User successfully authenticated via browser',
      userAgent: 'AgentSOLVR/4.0',
      ipAddress: '192.168.1.100',
      location: 'Local Network',
      sessionId: 'sess_12345',
      userId: 'user_12345',
      success: true,
      metadata: {
        authMethod: 'browser_auth',
        loginDuration: '2.3s'
      }
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      eventType: 'session',
      severity: 'info',
      action: 'session_refresh',
      description: 'Session tokens refreshed automatically',
      sessionId: 'sess_12345',
      userId: 'user_12345',
      success: true,
      metadata: {
        previousExpiry: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        newExpiry: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      eventType: 'security',
      severity: 'warning',
      action: 'mfa_recommendation',
      description: 'MFA not enabled - security recommendation generated',
      userId: 'user_12345',
      success: true,
      metadata: {
        securityScore: 75,
        recommendation: 'Enable multi-factor authentication'
      }
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      eventType: 'authorization',
      severity: 'info',
      action: 'api_access',
      description: 'API endpoint accessed successfully',
      userAgent: 'AgentSOLVR/4.0',
      ipAddress: '192.168.1.100',
      sessionId: 'sess_12345',
      userId: 'user_12345',
      success: true,
      metadata: {
        endpoint: '/api/security/metrics',
        responseTime: '145ms'
      }
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      eventType: 'system',
      severity: 'info',
      action: 'rate_limit_check',
      description: 'Rate limit status checked',
      userId: 'user_12345',
      success: true,
      metadata: {
        requestsRemaining: 850,
        requestsTotal: 1000
      }
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      eventType: 'authentication',
      severity: 'error',
      action: 'login_failed',
      description: 'Authentication attempt failed - invalid credentials',
      userAgent: 'Unknown/1.0',
      ipAddress: '192.168.1.50',
      location: 'Unknown',
      success: false,
      metadata: {
        failureReason: 'invalid_credentials',
        attemptsCount: 1
      }
    }
  ];

  useEffect(() => {
    loadAuditLogs();
  }, [filters, currentPage]);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      let results: AuditLogEntry[];
      
      if (onLoadLogs) {
        results = await onLoadLogs(filters, currentPage, itemsPerPage);
      } else {
        // Use mock data with filtering
        results = mockLogs.filter(log => {
          // Filter by event types
          if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(log.eventType)) {
            return false;
          }
          
          // Filter by severity levels
          if (filters.severityLevels.length > 0 && !filters.severityLevels.includes(log.severity)) {
            return false;
          }
          
          // Filter by search query
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (!log.description.toLowerCase().includes(query) && 
                !log.action.toLowerCase().includes(query)) {
              return false;
            }
          }
          
          // Filter by user ID
          if (filters.userId && log.userId !== filters.userId) {
            return false;
          }
          
          // Filter by session ID
          if (filters.sessionId && log.sessionId !== filters.sessionId) {
            return false;
          }
          
          return true;
        });
        
        // Simulate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        results = results.slice(startIndex, startIndex + itemsPerPage);
      }

      setAuditLogs(results);
      setTotalEntries(mockLogs.length); // In real app, this would come from API
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'info': return theme === 'dark' ? '#64B5F6' : '#2196F3';
      case 'warning': return theme === 'dark' ? '#FFB74D' : '#FF9800';
      case 'error': return theme === 'dark' ? '#FF8A65' : '#FF5722';
      case 'critical': return theme === 'dark' ? '#E57373' : '#F44336';
      default: return theme === 'dark' ? '#90A4AE' : '#607D8B';
    }
  };

  const getEventTypeIcon = (eventType: string): string => {
    switch (eventType) {
      case 'authentication': return '🔐';
      case 'authorization': return '🛡️';
      case 'session': return '⏱️';
      case 'security': return '🔒';
      case 'system': return '⚙️';
      case 'error': return '❌';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const handleEntryClick = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
  };

  const handleExport = () => {
    if (onExportLogs) {
      onExportLogs(filters);
    } else {
      // Default export implementation
      const csvContent = [
        'Timestamp,Event Type,Severity,Action,Description,User ID,Session ID,IP Address,Success',
        ...auditLogs.map(log => [
          log.timestamp,
          log.eventType,
          log.severity,
          log.action,
          `"${log.description}"`,
          log.userId || '',
          log.sessionId || '',
          log.ipAddress || '',
          log.success
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const totalPages = Math.ceil(totalEntries / itemsPerPage);

  return (
    <div className={`audit-log-viewer ${theme} ${compact ? 'compact' : ''}`}>
      {/* Header with Filters */}
      <div className="log-header">
        <div className="header-title">
          <h3>Security Audit Logs</h3>
          <span className="entry-count">
            {totalEntries} entries
          </span>
        </div>
        
        <div className="header-actions">
          <button onClick={handleExport} className="export-button">
            📁 Export
          </button>
          <button onClick={loadAuditLogs} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            placeholder="Search logs..."
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Event Type:</label>
          <select
            multiple
            value={filters.eventTypes}
            onChange={(e) => handleFilterChange({ 
              eventTypes: Array.from(e.target.selectedOptions, option => option.value)
            })}
            className="filter-select"
          >
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="session">Session</option>
            <option value="security">Security</option>
            <option value="system">System</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Severity:</label>
          <select
            multiple
            value={filters.severityLevels}
            onChange={(e) => handleFilterChange({ 
              severityLevels: Array.from(e.target.selectedOptions, option => option.value)
            })}
            className="filter-select"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Logs Table */}
      <div className="logs-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        ) : auditLogs.length > 0 ? (
          <div className="logs-table">
            <div className="table-header">
              <div className="col-timestamp">Timestamp</div>
              <div className="col-event">Event</div>
              <div className="col-severity">Severity</div>
              <div className="col-description">Description</div>
              <div className="col-user">User</div>
              <div className="col-status">Status</div>
            </div>
            
            <div className="table-body">
              {auditLogs.map(entry => (
                <div 
                  key={entry.id} 
                  className="table-row"
                  onClick={() => handleEntryClick(entry)}
                >
                  <div className="col-timestamp">
                    {formatTimestamp(entry.timestamp)}
                  </div>
                  <div className="col-event">
                    <span className="event-icon">{getEventTypeIcon(entry.eventType)}</span>
                    <span className="event-type">{entry.eventType}</span>
                  </div>
                  <div className="col-severity">
                    <span 
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(entry.severity) }}
                    >
                      {entry.severity}
                    </span>
                  </div>
                  <div className="col-description">
                    {entry.description}
                  </div>
                  <div className="col-user">
                    {entry.userId || 'N/A'}
                  </div>
                  <div className="col-status">
                    <span className={`status-indicator ${entry.success ? 'success' : 'failure'}`}>
                      {entry.success ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-logs">
            <p>No audit logs found matching the current filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="page-button"
          >
            ‹ Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Next ›
          </button>
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="entry-detail-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="entry-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Audit Log Details</h4>
              <button onClick={() => setSelectedEntry(null)} className="close-button">×</button>
            </div>
            
            <div className="modal-content">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Timestamp:</label>
                  <span>{formatTimestamp(selectedEntry.timestamp)}</span>
                </div>
                <div className="detail-item">
                  <label>Event Type:</label>
                  <span>{selectedEntry.eventType}</span>
                </div>
                <div className="detail-item">
                  <label>Severity:</label>
                  <span 
                    className="severity-badge"
                    style={{ backgroundColor: getSeverityColor(selectedEntry.severity) }}
                  >
                    {selectedEntry.severity}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Action:</label>
                  <span>{selectedEntry.action}</span>
                </div>
                <div className="detail-item">
                  <label>Success:</label>
                  <span className={selectedEntry.success ? 'success' : 'failure'}>
                    {selectedEntry.success ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <label>Description:</label>
                  <span>{selectedEntry.description}</span>
                </div>
                
                {selectedEntry.userId && (
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span>{selectedEntry.userId}</span>
                  </div>
                )}
                
                {selectedEntry.sessionId && (
                  <div className="detail-item">
                    <label>Session ID:</label>
                    <span>{selectedEntry.sessionId}</span>
                  </div>
                )}
                
                {selectedEntry.ipAddress && (
                  <div className="detail-item">
                    <label>IP Address:</label>
                    <span>{selectedEntry.ipAddress}</span>
                  </div>
                )}
                
                {selectedEntry.userAgent && (
                  <div className="detail-item full-width">
                    <label>User Agent:</label>
                    <span>{selectedEntry.userAgent}</span>
                  </div>
                )}
                
                {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
                  <div className="detail-item full-width">
                    <label>Metadata:</label>
                    <pre className="metadata-display">
                      {JSON.stringify(selectedEntry.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .audit-log-viewer {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .header-title h3 {
          margin: 0;
          color: #2196F3;
          font-size: 20px;
        }

        .entry-count {
          font-size: 14px;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
          margin-left: 12px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .export-button, .refresh-button {
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#dee2e6'};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .export-button:hover, .refresh-button:hover {
          background: ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
        }

        .filters-bar {
          display: flex;
          gap: 16px;
          padding: 16px 24px;
          background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 12px;
          font-weight: 500;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .search-input, .filter-select {
          padding: 6px 12px;
          border: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          border-radius: 4px;
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          font-size: 14px;
        }

        .search-input {
          min-width: 200px;
        }

        .filter-select {
          min-width: 120px;
          height: 60px;
        }

        .error-banner {
          background: #FFEBEE;
          color: #C62828;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logs-container {
          ${compact ? 'max-height: 400px;' : 'max-height: 600px;'}
          overflow-y: auto;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .spinner {
          width: 32px;
          height: 32px;
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

        .logs-table {
          width: 100%;
        }

        .table-header {
          display: grid;
          grid-template-columns: ${compact ? '1fr 1fr 1fr 2fr' : '160px 120px 100px 1fr 120px 80px'};
          gap: 12px;
          padding: 12px 24px;
          background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .table-body {
          max-height: 500px;
          overflow-y: auto;
        }

        .table-row {
          display: grid;
          grid-template-columns: ${compact ? '1fr 1fr 1fr 2fr' : '160px 120px 100px 1fr 120px 80px'};
          gap: 12px;
          padding: 12px 24px;
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
          cursor: pointer;
          transition: background 0.2s ease;
          font-size: ${compact ? '12px' : '14px'};
        }

        .table-row:hover {
          background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
        }

        .col-timestamp {
          font-size: ${compact ? '11px' : '12px'};
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .col-event {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .event-icon {
          font-size: ${compact ? '14px' : '16px'};
        }

        .event-type {
          text-transform: capitalize;
          font-size: ${compact ? '11px' : '12px'};
        }

        .severity-badge {
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: ${compact ? '10px' : '11px'};
          font-weight: 600;
          text-transform: uppercase;
        }

        .col-description {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .col-user {
          font-family: monospace;
          font-size: ${compact ? '11px' : '12px'};
        }

        .status-indicator {
          font-weight: bold;
        }

        .status-indicator.success {
          color: #4CAF50;
        }

        .status-indicator.failure {
          color: #F44336;
        }

        .no-logs {
          text-align: center;
          padding: 60px 20px;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-top: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .page-button {
          background: ${theme === 'dark' ? '#404040' : '#f8f9fa'};
          color: ${theme === 'dark' ? '#ffffff' : '#333333'};
          border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#dee2e6'};
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }

        .page-button:hover:not(:disabled) {
          background: ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .entry-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .entry-detail-modal {
          background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e0e0e0'};
        }

        .modal-header h4 {
          margin: 0;
          color: #2196F3;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
          padding: 0;
          width: 32px;
          height: 32px;
        }

        .modal-content {
          padding: 24px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-item.full-width {
          grid-column: 1 / -1;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 600;
          color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
          text-transform: uppercase;
        }

        .detail-item span {
          font-size: 14px;
        }

        .detail-item .success {
          color: #4CAF50;
        }

        .detail-item .failure {
          color: #F44336;
        }

        .metadata-display {
          background: ${theme === 'dark' ? '#3d3d3d' : '#f8f9fa'};
          padding: 12px;
          border-radius: 4px;
          font-size: 12px;
          border: 1px solid ${theme === 'dark' ? '#4d4d4d' : '#e9ecef'};
          margin: 0;
          overflow-x: auto;
        }

        .audit-log-viewer.compact .table-header {
          display: none;
        }

        .audit-log-viewer.compact .table-row {
          grid-template-columns: 1fr;
          gap: 8px;
          padding: 12px 16px;
        }

        .audit-log-viewer.compact .col-timestamp,
        .audit-log-viewer.compact .col-event,
        .audit-log-viewer.compact .col-severity,
        .audit-log-viewer.compact .col-user {
          display: none;
        }

        @media (max-width: 768px) {
          .log-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .filters-bar {
            flex-direction: column;
          }

          .table-header {
            display: none;
          }

          .table-row {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AuditLogViewer;