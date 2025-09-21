import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { ButtonProps } from '@/types';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ctp-base disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-ctp-mauve to-ctp-blue text-white hover:shadow-glow active:scale-95 focus:ring-ctp-mauve',
    secondary: 'bg-ctp-surface0 text-ctp-text border border-ctp-surface1 hover:bg-ctp-surface1 hover:border-ctp-surface2 focus:ring-ctp-surface2',
    outline: 'bg-transparent text-ctp-mauve border-2 border-ctp-mauve hover:bg-ctp-mauve hover:text-ctp-base focus:ring-ctp-mauve',
    ghost: 'bg-transparent text-ctp-subtext1 hover:bg-ctp-surface0 hover:text-ctp-text focus:ring-ctp-surface1',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-6 py-3 text-base rounded-lg',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;