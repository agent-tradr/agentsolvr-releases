import React from 'react';
import { clsx } from 'clsx';
import type { CardProps } from '@/types';

const Card: React.FC<CardProps> = ({
  elevated = false,
  glass = false,
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'rounded-xl border transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-ctp-surface0 border-ctp-surface1 shadow-lg',
    elevated: 'bg-gradient-to-br from-ctp-surface0 to-ctp-surface1 border-ctp-surface1 shadow-xl',
    glass: 'bg-ctp-surface0/80 backdrop-blur-md border-ctp-surface1/50 shadow-lg',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variant = glass ? 'glass' : elevated ? 'elevated' : 'default';

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Card subcomponents for better composition
export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <div className={clsx('mb-4', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <h3 className={clsx('text-xl font-semibold text-ctp-text', className)}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <p className={clsx('text-ctp-subtext1 mt-1', className)}>
    {children}
  </p>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <div className={clsx(className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <div className={clsx('mt-6 pt-4 border-t border-ctp-surface1', className)}>
    {children}
  </div>
);

export default Card;