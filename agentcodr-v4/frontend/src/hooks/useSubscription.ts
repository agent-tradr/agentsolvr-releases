import { useState, useEffect } from 'react';
import axios from 'axios';

// Simple API client for subscription operations
const apiClient = axios.create({
  baseURL: 'http://localhost:8001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SubscriptionData {
  planType: string;
  price: number;
  status: string;
  nextBilling: string;
  usage: {
    voiceCommands: number;
    projectsAnalyzed: number;
    aiResponses: number;
  };
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await apiClient.get('/api/subscription/status');
        
        // Map backend response to frontend interface
        const subscription: SubscriptionData = {
          planType: response.data.plan_type === 'professional' ? 'Professional' : 'Starter',
          price: response.data.plan_type === 'professional' ? 99 : 39,
          status: response.data.status,
          nextBilling: 'March 15, 2024', // Mock data
          usage: {
            voiceCommands: 147,
            projectsAnalyzed: 23,
            aiResponses: 892
          }
        };
        
        setData(subscription);
      } catch (err) {
        setError('Failed to fetch subscription data');
        console.error('Subscription fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  return { data, loading, error };
}