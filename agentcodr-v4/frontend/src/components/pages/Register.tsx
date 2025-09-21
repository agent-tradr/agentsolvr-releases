import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, Input, Logo } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterRequest } from '@/types';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const requirements = [
    { test: (p: string) => p.length >= 8, text: 'At least 8 characters' },
    { test: (p: string) => /[A-Z]/.test(p), text: 'One uppercase letter' },
    { test: (p: string) => /[a-z]/.test(p), text: 'One lowercase letter' },
    { test: (p: string) => /\d/.test(p), text: 'One number' },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), text: 'One special character' },
  ];

  const score = requirements.filter(req => req.test(password)).length;
  const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';
  
  const strengthColors = {
    weak: 'bg-ctp-red',
    medium: 'bg-ctp-yellow',
    strong: 'bg-ctp-green'
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-ctp-subtext1">Password strength:</span>
        <div className="flex-1 h-2 bg-ctp-surface1 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium capitalize ${
          strength === 'weak' ? 'text-ctp-red' : 
          strength === 'medium' ? 'text-ctp-yellow' : 
          'text-ctp-green'
        }`}>
          {strength}
        </span>
      </div>
      
      {password && (
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              {req.test(password) ? (
                <CheckCircle className="w-3 h-3 text-ctp-green" />
              ) : (
                <X className="w-3 h-3 text-ctp-red" />
              )}
              <span className={req.test(password) ? 'text-ctp-green' : 'text-ctp-subtext0'}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  // Removed plans usage for now
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      const success = await registerUser(data.email, data.password, data.fullName);
      if (!success) {
        setError('Registration failed. Please try again.');
        return;
      }
      
      setSuccess('Welcome to AgentSOLVR! Your 3-day free trial starts now. Check your email for next steps.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-ctp-base flex items-center justify-center container-padding py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Start Your Free Trial</h1>
          <p className="text-ctp-subtext1">Join thousands of developers using voice-controlled AI to ship code 10x faster</p>
        </div>

        {/* Registration Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 bg-ctp-red/10 border border-ctp-red/20 rounded-lg">
                <p className="text-ctp-red text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-ctp-green/10 border border-ctp-green/20 rounded-lg">
                <p className="text-ctp-green text-sm">{success}</p>
              </div>
            )}

            <div>
              <Input
                id="fullName"
                type="text"
                label="Full Name"
                placeholder="Enter your full name"
                required
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                error={errors.fullName?.message}
              />
            </div>

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
                placeholder="Create a strong password"
                required
                showPasswordToggle
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
                error={errors.password?.message}
              />
              <PasswordStrength password={password || ''} />
            </div>

            <div>
              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                showPasswordToggle
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 mt-1 text-ctp-mauve bg-ctp-surface0 border-ctp-surface1 rounded focus:ring-ctp-mauve focus:ring-2"
                  {...register('agreeToTerms', {
                    required: 'You must agree to the terms and conditions'
                  })}
                />
                <span className="text-sm text-ctp-subtext1">
                  I agree to the{' '}
                  <Link to="/terms" className="text-ctp-mauve hover:text-ctp-blue">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-ctp-mauve hover:text-ctp-blue">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-ctp-red text-sm">{errors.agreeToTerms.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              loading={isSubmitting || loading}
              className="w-full"
            >
              {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-ctp-surface1">
            <p className="text-center text-ctp-subtext1">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-ctp-mauve hover:text-ctp-blue font-medium transition-colors"
              >
                Sign in
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

        {/* Features Preview */}
        <Card className="p-6 bg-ctp-surface0/50">
          <h3 className="font-medium mb-4 text-center">What you'll get:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-ctp-green flex-shrink-0" />
              <span>3-day free trial of all features</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-ctp-green flex-shrink-0" />
              <span>Voice-controlled AI development agents</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-ctp-green flex-shrink-0" />
              <span>Real-time project analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-ctp-green flex-shrink-0" />
              <span>Priority customer support</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;