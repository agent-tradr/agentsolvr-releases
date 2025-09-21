import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Simple API client for auth operations
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Landing Page Component
const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-purple-400">AgentSOLVR V4</div>
        <div className="space-x-4">
          <Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link>
          <Link to="/login" className="hover:text-purple-400 transition-colors">Login</Link>
          <Link to="/register" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          Transform Your Development with 
          <span className="text-purple-400"> AI Agents</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Voice-controlled AI development platform with 9 specialized agents that understand your codebase, 
          automate workflows, and accelerate development by 10x
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => navigate('/register')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Start Free Trial
          </button>
          <button 
            onClick={() => navigate('/pricing')}
            className="border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            View Pricing
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Powerful AI Development Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="w-12 h-12 bg-purple-600 rounded-lg mb-4 flex items-center justify-center">
              🎤
            </div>
            <h3 className="text-xl font-bold mb-3">"Talk to Code"</h3>
            <p className="text-gray-300">Voice commands that actually understand programming context</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="w-12 h-12 bg-purple-600 rounded-lg mb-4 flex items-center justify-center">
              🤖
            </div>
            <h3 className="text-xl font-bold mb-3">9 Specialized AI Agents</h3>
            <p className="text-gray-300">Smart ticket assignment to syntax, testing, docs, integration, and QA specialists</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="w-12 h-12 bg-purple-600 rounded-lg mb-4 flex items-center justify-center">
              ⚡
            </div>
            <h3 className="text-xl font-bold mb-3">10x Development Speed</h3>
            <p className="text-gray-300">Features that took hours now take minutes with parallel AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pricing Page Component
const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 39,
      description: 'Perfect for side projects and individual developers',
      features: [
        'AgentSOLVR Desktop App',
        'Voice commands for common tasks',
        '3 AI agents included',
        'Basic codebase analysis',
        'Email support'
      ]
    },
    {
      name: 'Professional',
      price: 99,
      description: 'Best for small teams and serious developers',
      features: [
        'Everything in Starter',
        'All 9 specialized AI agents',
        'Advanced codebase intelligence',
        'Team collaboration features',
        'Priority support',
        'Custom integrations'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 299,
      description: 'For large teams and organizations',
      features: [
        'Everything in Professional',
        'Enterprise security',
        'Custom AI agent training',
        'Dedicated account manager',
        'SLA guarantees',
        'On-premise deployment'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <Link to="/" className="text-2xl font-bold text-purple-400">AgentSOLVR V4</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
          <Link to="/login" className="hover:text-purple-400 transition-colors">Login</Link>
          <Link to="/register" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">Get Started</Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-300">Start your AI-powered development journey today</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative bg-gray-800 rounded-lg p-8 ${plan.popular ? 'ring-2 ring-purple-400' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  <span className="text-purple-400">${plan.price}</span>
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/register')}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Registration Page Component
const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/api/auth/register', formData);
      setMessage('Registration successful! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-purple-400">AgentSOLVR V4</Link>
          <h2 className="text-2xl font-bold mt-4">Create your AgentSOLVR account</h2>
          <p className="text-gray-300 mt-2">Join thousands of developers using AI-powered development</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.includes('successful') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

// Login Page Component
const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/api/auth/login', formData);
      setMessage('Login successful! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-purple-400">AgentSOLVR V4</Link>
          <h2 className="text-2xl font-bold mt-4">Sign in to AgentSOLVR</h2>
          <p className="text-gray-300 mt-2">Access your AI-powered development platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.includes('successful') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/register" className="text-purple-400 hover:text-purple-300">Create one</Link>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page Component
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-gray-700">
        <Link to="/" className="text-2xl font-bold text-purple-400">AgentSOLVR V4</Link>
        <div className="space-x-4">
          <Link to="/downloads" className="hover:text-purple-400 transition-colors">Downloads</Link>
          <Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors">Logout</button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-8">Welcome to AgentSOLVR Dashboard</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Subscription Status</h3>
            <p className="text-green-400 font-semibold">Professional Plan - Active</p>
            <p className="text-gray-300 mt-2">$99/month • Next billing: Dec 20, 2025</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Usage This Month</h3>
            <p className="text-2xl font-bold text-purple-400">1,247</p>
            <p className="text-gray-300">Voice commands processed</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Projects Analyzed</h3>
            <p className="text-2xl font-bold text-blue-400">23</p>
            <p className="text-gray-300">Codebases enhanced</p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/downloads" className="block bg-purple-600 hover:bg-purple-700 text-center py-2 rounded transition-colors">
                Download Desktop App
              </Link>
              <button className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors">
                View Documentation
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>React project analyzed</span>
                <span className="text-gray-400">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span>Voice command: "Add tests"</span>
                <span className="text-gray-400">1 day ago</span>
              </div>
              <div className="flex justify-between">
                <span>API integration completed</span>
                <span className="text-gray-400">3 days ago</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Support</h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors">
                Contact Support
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors">
                View Help Docs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Downloads Page Component
const Downloads: React.FC = () => {
  const downloads = [
    {
      platform: 'Windows',
      version: '4.0.1',
      size: '127 MB',
      icon: '🪟',
      requirements: ['Windows 10 or later', '4GB RAM', '1GB storage']
    },
    {
      platform: 'macOS',
      version: '4.0.1',
      size: '134 MB',
      icon: '🍎',
      requirements: ['macOS 11.0 or later', '4GB RAM', '1GB storage']
    },
    {
      platform: 'Linux',
      version: '4.0.1',
      size: '119 MB',
      icon: '🐧',
      requirements: ['Ubuntu 20.04+ or equivalent', '4GB RAM', '1GB storage']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <Link to="/" className="text-2xl font-bold text-purple-400">AgentSOLVR V4</Link>
        <div className="space-x-4">
          <Link to="/dashboard" className="hover:text-purple-400 transition-colors">Dashboard</Link>
          <Link to="/pricing" className="hover:text-purple-400 transition-colors">Pricing</Link>
          <Link to="/login" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">Login</Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Download AgentSOLVR</h1>
          <p className="text-xl text-gray-300">Get the desktop application and start transforming your development workflow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {downloads.map((download) => (
            <div key={download.platform} className="bg-gray-800 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">{download.icon}</div>
                <h3 className="text-2xl font-bold">{download.platform}</h3>
                <p className="text-gray-400">Version {download.version} • {download.size}</p>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {download.requirements.map((req, index) => (
                    <li key={index}>• {req}</li>
                  ))}
                </ul>
              </div>

              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors">
                Download for {download.platform}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Installation & Setup</h3>
            <div className="text-left space-y-4">
              <div>
                <h4 className="font-semibold text-purple-400">1. Download</h4>
                <p className="text-gray-300">Choose your platform and download the installer</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400">2. Install</h4>
                <p className="text-gray-300">Run the installer and follow the setup wizard</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400">3. Login</h4>
                <p className="text-gray-300">Sign in with your AgentSOLVR account to sync your settings</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400">4. Start Coding</h4>
                <p className="text-gray-300">Begin using voice commands and AI-powered development tools</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/downloads" element={<Downloads />} />
      </Routes>
    </Router>
  );
};

export default App;