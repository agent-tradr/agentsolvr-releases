import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Input, Logo } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const success = await login(data.email, data.password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-ctp-base flex items-center justify-center container-padding">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-ctp-subtext1">Sign in to your AgentSOLVR account</p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 bg-ctp-red/10 border border-ctp-red/20 rounded-lg">
                <p className="text-ctp-red text-sm">{error}</p>
              </div>
            )}

            <div>
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                required
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                error={errors.email?.message}
              />
            </div>

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
                showPasswordToggle
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-ctp-mauve bg-ctp-surface0 border-ctp-surface1 rounded focus:ring-ctp-mauve focus:ring-2" 
                />
                <span className="text-ctp-subtext1">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-ctp-mauve hover:text-ctp-blue transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting || loading}
              className="w-full"
            >
              {isSubmitting || loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-ctp-surface1">
            <p className="text-center text-ctp-subtext1">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-ctp-mauve hover:text-ctp-blue font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-ctp-subtext1 hover:text-ctp-text"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Demo Credentials */}
        <Card className="p-4 bg-ctp-surface0/50">
          <h3 className="font-medium mb-3 text-center">Demo Credentials</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ctp-subtext1">Email:</span>
              <span className="text-ctp-text font-mono">demo@agentsolvr.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ctp-subtext1">Password:</span>
              <span className="text-ctp-text font-mono">demo123</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;