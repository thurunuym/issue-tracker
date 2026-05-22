import React from 'react';
import cn from '../../utils/cn';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  trend?: {
    value: string | number;
    type: 'up' | 'down' | 'neutral';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
  trend,
}) => {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-150 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-901 transition-all', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white leading-8 truncate">
            {value}
          </h4>
        </div>
        {icon && (
          <div className="p-3.5 rounded-xl bg-blue-50/70 text-blue-600 dark:bg-blue-950/25 dark:text-blue-300">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-3.5 flex items-center justify-between">
          {description && (
            <span className="text-xs text-gray-550 dark:text-gray-400">
              {description}
            </span>
          )}
          {trend && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                trend.type === 'up' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-300',
                trend.type === 'down' && 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-300',
                trend.type === 'neutral' && 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
