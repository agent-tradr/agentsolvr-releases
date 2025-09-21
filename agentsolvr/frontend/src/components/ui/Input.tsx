import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { InputProps } from '@/types';

interface ExtendedInputProps extends Omit<InputProps, 'onChange'> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = forwardRef<HTMLInputElement, ExtendedInputProps>(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  showPasswordToggle = false,
  className,
  name,
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const stateClasses = error 
    ? 'border-ctp-red focus:border-ctp-red focus:ring-2 focus:ring-ctp-red/20 bg-ctp-surface0' 
    : isFocused
    ? 'border-ctp-mauve focus:border-ctp-mauve focus:ring-2 focus:ring-ctp-mauve/20 bg-ctp-surface0'
    : 'border-ctp-surface1 focus:border-ctp-mauve focus:ring-2 focus:ring-ctp-mauve/20 bg-ctp-surface0 hover:border-ctp-surface2';

  const textClasses = 'text-ctp-text placeholder-ctp-subtext0';

  const inputClasses = clsx(
    baseClasses,
    stateClasses,
    textClasses,
    type === 'password' && showPasswordToggle && 'pr-12',
    className
  );

  const labelClasses = clsx(
    'block text-sm font-medium mb-2 transition-colors duration-200',
    error ? 'text-ctp-red' : 'text-ctp-subtext1'
  );

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
          {required && <span className="text-ctp-red ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ctp-subtext0 hover:text-ctp-text transition-colors duration-200"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center mt-2 text-sm text-ctp-red">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;