import React from 'react';
import cn from '../../utils/cn';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-gray-150 dark:bg-gray-900 dark:border-gray-800 shadow-sm', className)}>
      <div className="flex items-center justify-center text-gray-400 dark:text-gray-600 mb-4 h-16 w-16 bg-gray-50 dark:bg-gray-850 rounded-full">
        {icon ? (
          icon
        ) : (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-6">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
