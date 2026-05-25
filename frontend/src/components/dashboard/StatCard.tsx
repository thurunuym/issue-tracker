import React from 'react';
import cn from '../../utils/cn';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  color?: 'blue' | 'amber' | 'emerald' | 'violet';
  trend?: {
    value: string | number;
    type: 'up' | 'down' | 'neutral';
  };
}

const colorMap = {
  blue: {
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    accent: 'border-l-blue-500',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    accent: 'border-l-amber-500',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    accent: 'border-l-emerald-500',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    accent: 'border-l-violet-500',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
  color = 'blue',
  trend,
}) => {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-gray-150 border-l-4 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-901',
        colors.accent,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-450 dark:text-gray-450 uppercase tracking-wider mb-1.5">
            {title}
          </p>
          <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-9 tracking-tight truncate">
            {value}
          </h4>
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl', colors.iconBg, colors.iconColor)}>
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-3 flex items-center justify-between">
          {description && (
            <span className="text-[13px] text-gray-500 dark:text-gray-450">
              {description}
            </span>
          )}
          {trend && (
            <span
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded-full',
                trend.type === 'up' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
                trend.type === 'down' && 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                trend.type === 'neutral' && 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
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
