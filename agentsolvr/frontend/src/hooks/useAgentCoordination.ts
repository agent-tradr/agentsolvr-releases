import { useState, useEffect, useCallback } from 'react';
import useWebSocket from './useWebSocket';

export interface AgentInfo {
  id: string;
  name: string;
  type: 'backend_core' | 'claude_integration' | 'security' | 'electron' | 'frontend' | 'infrastructure';
  status: 'active' | 'idle' | 'busy' | 'offline' | 'error';
  currentTask: string | null;
  progress: number;
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

export interface CoordinationAlert {
  id: string;
  type: 'performance_degradation' | 'communication_failure' | 'resource_exhaustion' | 'coordination_breakdown';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  affectedAgents: string[];
  actionRequired: boolean;
}

export interface AgentCoordinationData {
  agents: AgentInfo[];
  metrics: CoordinationMetrics;
  recentEvents: CoordinationEvent[];
  alerts: CoordinationAlert[];
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
  lastUpdate: Date;
}

export interface UseAgentCoordinationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableMockData?: boolean;
}

export interface UseAgentCoordinationReturn {
  data: AgentCoordinationData | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  refreshData: () => void;
  optimizeCoordination: () => Promise<{ success: boolean; error?: string }>;
  restartAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>;
  rebalanceTasks: () => Promise<{ success: boolean; error?: string }>;
  dismissAlert: (alertId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Agent management
  assignTask: (agentId: string, taskId: string) => Promise<{ success: boolean; error?: string }>;
  pauseAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>;
  resumeAgent: (agentId: string) => Promise<{ success: boolean; error?: string }>;
  updateAgentPriority: (agentId: string, priority: number) => Promise<{ success: boolean; error?: string }>;
  
  // Monitoring
  getAgentDetails: (agentId: string) => AgentInfo | null;
  getCoordinationHistory: (timeRange: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getPerformanceReport: (agentId?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useAgentCoordination = ({
  autoRefresh = true,
  refreshInterval = 5000,
  enableMockData = false
}: UseAgentCoordinationOptions = {}): UseAgentCoordinationReturn => {
  const [data, setData] = useState<AgentCoordinationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket connection for real-time updates
  const {
    isConnected,
    sendMessage,
    lastMessage
  } = useWebSocket({
    url: 'ws://localhost:8080/ws/agent-coordination',
    onConnect: () => {
      console.log('Connected to agent coordination WebSocket');
      if (!enableMockData) {
        refreshData();
      }
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
      setData(lastMessage.data);
      setLoading(false);
      setError(null);
    }
  }, [lastMessage]);

  // Mock data for development/testing
  const generateMockData = useCallback((): AgentCoordinationData => {
    const mockAgents: AgentInfo[] = [
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
        lastActivity: new Date(Date.now() - 30000),
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
      },
      {
        id: 'agent_3_security',
        name: 'Security Agent',
        type: 'security',
        status: 'idle',
        currentTask: null,
        progress: 1.0,
        lastActivity: new Date(Date.now() - 300000),
        performance: {
          tasksCompleted: 55,
          averageTime: 1.2,
          successRate: 0.98,
          efficiency: 0.94
        },
        resources: {
          cpuUsage: 12,
          memoryUsage: 34,
          load: 0.15
        },
        specialization: {
          domain: 'Security & Authentication',
          skills: ['Authentication', 'Security Audits', 'Access Control'],
          currentFocus: 'Monitoring'
        },
        coordination: {
          dependencies: [],
          dependents: ['agent_5_frontend'],
          communicationScore: 0.96,
          collaborationRating: 0.92
        }
      },
      {
        id: 'agent_4_electron',
        name: 'Electron Desktop Agent',
        type: 'electron',
        status: 'active',
        currentTask: 'Desktop notifications',
        progress: 0.85,
        lastActivity: new Date(Date.now() - 120000),
        performance: {
          tasksCompleted: 28,
          averageTime: 3.1,
          successRate: 0.89,
          efficiency: 0.76
        },
        resources: {
          cpuUsage: 38,
          memoryUsage: 45,
          load: 0.4
        },
        specialization: {
          domain: 'Desktop Application',
          skills: ['Window Management', 'System Integration', 'Auto-Updates'],
          currentFocus: 'Claude Desktop Integration'
        },
        coordination: {
          dependencies: ['agent_2_claude_integration'],
          dependents: [],
          communicationScore: 0.84,
          collaborationRating: 0.79
        }
      },
      {
        id: 'agent_5_frontend',
        name: 'Frontend Enhancement Agent',
        type: 'frontend',
        status: 'busy',
        currentTask: 'Phase 3 integration components',
        progress: 0.92,
        lastActivity: new Date(),
        performance: {
          tasksCompleted: 67,
          averageTime: 1.5,
          successRate: 0.97,
          efficiency: 0.91
        },
        resources: {
          cpuUsage: 55,
          memoryUsage: 67,
          load: 0.6
        },
        specialization: {
          domain: 'Frontend Integration',
          skills: ['React Components', 'UI/UX', 'Real-time Integration'],
          currentFocus: 'System Status Dashboard'
        },
        coordination: {
          dependencies: ['agent_1_backend_core', 'agent_2_claude_integration', 'agent_3_security'],
          dependents: [],
          communicationScore: 0.93,
          collaborationRating: 0.89
        }
      },
      {
        id: 'agent_6_infrastructure',
        name: 'Infrastructure Agent',
        type: 'infrastructure',
        status: 'idle',
        currentTask: null,
        progress: 1.0,
        lastActivity: new Date(Date.now() - 600000),
        performance: {
          tasksCompleted: 71,
          averageTime: 0.8,
          successRate: 0.99,
          efficiency: 0.96
        },
        resources: {
          cpuUsage: 8,
          memoryUsage: 28,
          load: 0.1
        },
        specialization: {
          domain: 'Infrastructure & Testing',
          skills: ['Test Management', 'CI/CD', 'Performance Monitoring'],
          currentFocus: 'System Monitoring'
        },
        coordination: {
          dependencies: [],
          dependents: ['agent_1_backend_core', 'agent_2_claude_integration'],
          communicationScore: 0.98,
          collaborationRating: 0.95
        }
      }
    ];

    return {
      agents: mockAgents,
      metrics: {
        totalAgents: 6,
        activeAgents: 4,
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
        bottlenecks: [
          {
            agentId: 'agent_2_claude_integration',
            type: 'resource',
            severity: 'medium',
            description: 'High CPU usage affecting response times',
            suggestion: 'Consider scaling or optimizing API processing'
          }
        ]
      },
      recentEvents: [
        {
          id: 'event_1',
          timestamp: new Date(Date.now() - 60000),
          type: 'task_completed',
          agentId: 'agent_3_security',
          description: 'Security frontend integration completed successfully'
        },
        {
          id: 'event_2',
          timestamp: new Date(Date.now() - 120000),
          type: 'task_assigned',
          agentId: 'agent_5_frontend',
          description: 'System status dashboard component assigned'
        },
        {
          id: 'event_3',
          timestamp: new Date(Date.now() - 180000),
          type: 'bottleneck_detected',
          agentId: 'agent_2_claude_integration',
          description: 'High CPU usage detected, monitoring performance'
        }
      ],
      alerts: [
        {
          id: 'alert_1',
          type: 'performance_degradation',
          severity: 'warning',
          message: 'Agent 2 Claude Integration showing elevated resource usage',
          timestamp: new Date(Date.now() - 300000),
          affectedAgents: ['agent_2_claude_integration'],
          actionRequired: false
        }
      ],
      networkMap: {
        nodes: mockAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status
        })),
        connections: [
          {
            source: 'agent_1_backend_core',
            target: 'agent_2_claude_integration',
            strength: 0.85,
            latency: 25,
            messageCount: 342
          },
          {
            source: 'agent_1_backend_core',
            target: 'agent_5_frontend',
            strength: 0.78,
            latency: 18,
            messageCount: 156
          },
          {
            source: 'agent_2_claude_integration',
            target: 'agent_5_frontend',
            strength: 0.92,
            latency: 32,
            messageCount: 423
          },
          {
            source: 'agent_3_security',
            target: 'agent_5_frontend',
            strength: 0.71,
            latency: 15,
            messageCount: 89
          },
          {
            source: 'agent_2_claude_integration',
            target: 'agent_4_electron',
            strength: 0.65,
            latency: 28,
            messageCount: 67
          }
        ]
      },
      lastUpdate: new Date()
    };
  }, []);

  // Auto-refresh with mock data
  useEffect(() => {
    if (enableMockData) {
      setData(generateMockData());
      setLoading(false);
      setError(null);

      if (autoRefresh && refreshInterval > 0) {
        const interval = setInterval(() => {
          setData(generateMockData());
        }, refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [enableMockData, autoRefresh, refreshInterval, generateMockData]);

  // Auto-refresh data
  useEffect(() => {
    if (!enableMockData && autoRefresh && refreshInterval > 0 && isConnected) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, isConnected, enableMockData]);

  const refreshData = useCallback(() => {
    if (enableMockData) {
      setData(generateMockData());
      return;
    }

    if (isConnected) {
      setLoading(true);
      sendMessage('request_coordination_data', {
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, sendMessage, enableMockData, generateMockData]);

  const optimizeCoordination = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('optimize_coordination', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const restartAgent = useCallback(async (agentId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Update mock data to show agent restarting
      if (data) {
        const updatedAgents = data.agents.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'active' as const, lastActivity: new Date() }
            : agent
        );
        setData({ ...data, agents: updatedAgents });
      }
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('restart_agent', {
      agentId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const rebalanceTasks = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('rebalance_tasks', {
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const dismissAlert = useCallback(async (alertId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Remove alert from mock data
      if (data) {
        const updatedAlerts = data.alerts.filter(alert => alert.id !== alertId);
        setData({ ...data, alerts: updatedAlerts });
      }
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('dismiss_coordination_alert', {
      alertId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const assignTask = useCallback(async (agentId: string, taskId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('assign_task', {
      agentId,
      taskId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const pauseAgent = useCallback(async (agentId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (data) {
        const updatedAgents = data.agents.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'idle' as const }
            : agent
        );
        setData({ ...data, agents: updatedAgents });
      }
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('pause_agent', {
      agentId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const resumeAgent = useCallback(async (agentId: string): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (data) {
        const updatedAgents = data.agents.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: 'active' as const, lastActivity: new Date() }
            : agent
        );
        setData({ ...data, agents: updatedAgents });
      }
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('resume_agent', {
      agentId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData, data]);

  const updateAgentPriority = useCallback(async (agentId: string, priority: number): Promise<{ success: boolean; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { success: true };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('update_agent_priority', {
      agentId,
      priority,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const getAgentDetails = useCallback((agentId: string): AgentInfo | null => {
    if (!data) return null;
    return data.agents.find(agent => agent.id === agentId) || null;
  }, [data]);

  const getCoordinationHistory = useCallback(async (timeRange: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        data: {
          timeRange,
          events: [
            { timestamp: new Date(Date.now() - 3600000), type: 'optimization', description: 'System coordination optimized' },
            { timestamp: new Date(Date.now() - 7200000), type: 'task_completion', description: 'Agent batch completed successfully' }
          ],
          metrics: {
            averageEfficiency: 0.87,
            totalMessages: 2456,
            avgLatency: 42
          }
        }
      };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('get_coordination_history', {
      timeRange,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  const getPerformanceReport = useCallback(async (agentId?: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (enableMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        success: true,
        data: {
          agentId: agentId || 'all',
          report: {
            tasksCompleted: agentId ? 42 : 301,
            averageTime: agentId ? 2.3 : 1.8,
            successRate: agentId ? 0.95 : 0.93,
            efficiency: agentId ? 0.87 : 0.89,
            trends: {
              performance: 'improving',
              efficiency: 'stable',
              reliability: 'improving'
            }
          }
        }
      };
    }

    if (!isConnected) {
      return { success: false, error: 'Not connected to service' };
    }

    sendMessage('get_performance_report', {
      agentId,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  }, [isConnected, sendMessage, enableMockData]);

  return {
    data,
    loading,
    error,
    isConnected,
    refreshData,
    optimizeCoordination,
    restartAgent,
    rebalanceTasks,
    dismissAlert,
    assignTask,
    pauseAgent,
    resumeAgent,
    updateAgentPriority,
    getAgentDetails,
    getCoordinationHistory,
    getPerformanceReport
  };
};

export default useAgentCoordination;