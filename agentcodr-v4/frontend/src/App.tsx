import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import Landing from '@/components/pages/Landing';
import Login from '@/components/pages/Login';
import Register from '@/components/pages/Register';
import Dashboard from '@/components/pages/Dashboard';
import Pricing from '@/components/pages/Pricing';
import Downloads from '@/components/pages/Downloads';
import Contact from '@/components/pages/Contact';
import FAQ from '@/components/pages/FAQ';
import Privacy from '@/components/pages/Privacy';
import Terms from '@/components/pages/Terms';
import Security from '@/components/pages/Security';

// Import providers and hooks
import { AuthProvider } from '@/hooks/useAuth';
import ScrollToTop from '@/components/ScrollToTop';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For now, we'll make this a simple wrapper
  // In production, this would check authentication status
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <div className="min-h-screen bg-ctp-base text-ctp-text">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/security" element={<Security />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;