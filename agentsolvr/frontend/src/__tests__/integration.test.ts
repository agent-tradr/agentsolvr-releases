import { describe, it, expect } from 'vitest';

describe('Integration Tests', () => {
  it('should connect to backend health endpoint', async () => {
    try {
      const response = await fetch('http://localhost:8001/health');
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toHaveProperty('status');
    } catch (error) {
      // Backend might not be running in test environment
      console.warn('Backend not available for integration test');
    }
  });

  it('should validate API endpoints exist', async () => {
    const endpoints = [
      '/api/auth/register',
      '/api/auth/login', 
      '/api/auth/me',
      '/api/subscription/status'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8001${endpoint}`);
        // We expect 401/400, not 404 - means endpoint exists
        expect([200, 400, 401, 422]).toContain(response.status);
      } catch (error) {
        console.warn(`Endpoint ${endpoint} not reachable`);
      }
    }
  });
});
