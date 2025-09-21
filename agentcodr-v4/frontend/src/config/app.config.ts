/**
 * AgentSOLVR Application Configuration
 * Centralized configuration for app-wide settings
 */

export interface AppConfig {
  // Agent System Configuration
  agents: {
    totalCount: number;
    maxConcurrent: number;
    specializations: string[];
  };
  
  // Trial & Subscription Configuration
  trial: {
    durationDays: number;
    features: string[];
  };
  
  // Pricing Configuration
  pricing: {
    starter: number;
    professional: number;
    enterprise: number;
  };
  
  // Application Metadata
  app: {
    name: string;
    version: string;
    description: string;
  };
  
  // Feature Flags
  features: {
    voiceCommands: boolean;
    realTimeCollaboration: boolean;
    enterpriseFeatures: boolean;
  };
  
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
  };
}

// Default configuration
export const defaultConfig: AppConfig = {
  agents: {
    totalCount: 9,
    maxConcurrent: 6,
    specializations: [
      'Syntax Fixing (Agents 1-3)',
      'Testing (Agents 4-6)',
      'Documentation (Agent 7)', 
      'Integration (Agent 8)',
      'Quality Assurance (Agent 9)'
    ]
  },
  
  trial: {
    durationDays: 3,
    features: [
      'Voice commands for common development tasks',
      'Project analysis (up to 50 files)',
      'All agent specializations',
      'Email support'
    ]
  },
  
  pricing: {
    starter: 39,
    professional: 99,
    enterprise: 299
  },
  
  app: {
    name: 'AgentSOLVR',
    version: '1.0.0',
    description: 'Voice-controlled AI development platform with multiple specialized agents'
  },
  
  features: {
    voiceCommands: true,
    realTimeCollaboration: true,
    enterpriseFeatures: true
  },
  
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8001',
    timeout: 10000
  }
};

// Configuration context for runtime updates
class ConfigManager {
  private config: AppConfig = { ...defaultConfig };
  
  get(): AppConfig {
    return this.config;
  }
  
  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  // Specific getters for commonly used values
  getAgentCount(): number {
    return this.config.agents.totalCount;
  }
  
  getTrialDays(): number {
    return this.config.trial.durationDays;
  }
  
  getAppName(): string {
    return this.config.app.name;
  }
  
  getAppVersion(): string {
    return this.config.app.version;
  }
  
  getSpecializations(): string[] {
    return this.config.agents.specializations;
  }
  
  // Environment-specific configuration
  loadEnvironmentConfig(): void {
    // Override with environment variables if available
    if (process.env.REACT_APP_AGENT_COUNT) {
      this.config.agents.totalCount = parseInt(process.env.REACT_APP_AGENT_COUNT);
    }
    
    if (process.env.REACT_APP_TRIAL_DAYS) {
      this.config.trial.durationDays = parseInt(process.env.REACT_APP_TRIAL_DAYS);
    }
    
    if (process.env.REACT_APP_API_URL) {
      this.config.api.baseUrl = process.env.REACT_APP_API_URL;
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

// Initialize with environment config
configManager.loadEnvironmentConfig();

// Export convenience functions
export const getConfig = () => configManager.get();
export const getAgentCount = () => configManager.getAgentCount();
export const getTrialDays = () => configManager.getTrialDays();
export const getAppName = () => configManager.getAppName();
export const getAppVersion = () => configManager.getAppVersion();
export const getSpecializations = () => configManager.getSpecializations();

// Export for testing
export { ConfigManager };