import React from 'react';
import type { InputHTMLAttributes } from 'react';
import cn from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-350 mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          id={id}
          className={cn(
            'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900',
            'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-550',
            'dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : '',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-550">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
