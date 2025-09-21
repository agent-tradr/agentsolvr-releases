import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-ctp-base/80 backdrop-blur-sm z-50'
    : 'flex items-center justify-center';

  return (
    <div className={clsx(containerClasses, className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 
          className={clsx(
            'animate-spin text-ctp-mauve',
            sizeClasses[size]
          )} 
        />
        {text && (
          <p className={clsx(
            'text-ctp-text font-medium',
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton loading component for content placeholders
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div 
    className={clsx(
      'animate-pulse bg-ctp-surface1 rounded',
      className
    )} 
  />
);

// Card skeleton for consistent loading states
export const CardSkeleton: React.FC = () => (
  <div className="card">
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

export default Loading;