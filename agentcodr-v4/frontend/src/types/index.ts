// Core application types for AgentSOLVR V4

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  userId: string;
  planType: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
  features: string[];
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  planId?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface DownloadInfo {
  version: string;
  platform: 'windows' | 'macos' | 'linux';
  downloadUrl: string;
  size: string;
  checksum: string;
  releaseNotes: string;
}

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'offline' | 'error';
  performance: number;
  tasksCompleted: number;
  uptime: number;
  lastUpdate: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  systemUptime: number;
  lastUpdated: string;
}

export interface SecurityMetrics {
  threatsDetected: number;
  activeSessions: number;
  mfaEnabledUsers: number;
  auditEvents: number;
  lastSecurityScan: string;
}

export interface ClaudeMetrics {
  apiCallsToday: number;
  costToday: number;
  successRate: number;
  averageResponseTime: number;
  costOptimizationSavings: number;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  security: boolean;
  marketing: boolean;
  system: boolean;
}

export interface AppTheme {
  mode: 'dark' | 'light';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: AppTheme;
  notifications: NotificationPreferences;
  systemMetrics: SystemMetrics | null;
  agentStatuses: AgentStatus[];
}

// Form validation types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Stripe payment types
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends BaseComponentProps {
  elevated?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

// Navigation types
export type ViewType = 'landing' | 'login' | 'register' | 'dashboard' | 'pricing' | 'download' | 'account';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  requiresAuth?: boolean;
}