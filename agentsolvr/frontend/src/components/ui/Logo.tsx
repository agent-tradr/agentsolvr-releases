import React from 'react';
import { clsx } from 'clsx';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showIcon = true,
  showText = true,
  className
}) => {
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      icon: 'w-8 h-8',
      text: 'text-lg',
      subtitle: 'text-xs'
    },
    md: {
      container: 'gap-3',
      icon: 'w-12 h-12',
      text: 'text-2xl',
      subtitle: 'text-sm'
    },
    lg: {
      container: 'gap-4',
      icon: 'w-16 h-16',
      text: 'text-3xl',
      subtitle: 'text-base'
    },
    xl: {
      container: 'gap-4',
      icon: 'w-20 h-20',
      text: 'text-4xl',
      subtitle: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={clsx('flex items-center', classes.container, className)}>
      {showIcon && (
        <div className={clsx('relative', classes.icon)}>
          {/* AgentSOLVR Logo with gradient border effect */}
          <div className="relative w-full h-full">
            {/* Logo without circular border */}
            <img 
              src="/agentsolvr-logo.png" 
              alt="AgentSOLVR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      
      {showText && (
        <div className="flex flex-col">
          <div className={clsx('font-bold leading-none', classes.text)}>
            <span className="text-ctp-blue">Agent</span><span className="text-ctp-mauve">SOLVR</span>
          </div>
          <span className={clsx('text-ctp-subtext1 font-medium leading-none', classes.subtitle)}>
            Multi-Agent Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;