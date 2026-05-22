import React from 'react';
import cn from '../../utils/cn';

export interface BadgeProps {
  type: 'status' | 'priority' | 'severity' | 'generic';
  value: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, className }) => {
  const getStyles = () => {
    const val = value.toLowerCase().trim();

    if (type === 'status') {
      switch (val) {
        case 'open':
          return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40';
        case 'in progress':
          return 'bg-amber-100 text-amber-805 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40';
        case 'resolved':
          return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40';
        case 'closed':
          return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }

    if (type === 'priority') {
      switch (val) {
        case 'low':
          return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        case 'medium':
          return 'bg-yellow-100 text-yellow-805 border-yellow-200 dark:bg-yellow-905_10 dark:text-yellow-300 dark:border-yellow-800/40';
        case 'high':
          return 'bg-orange-100 text-orange-850 border-orange-200 dark:bg-orange-950_10 dark:text-orange-300 dark:border-orange-800/40';
        case 'critical':
          return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40 animate-pulse';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }

    if (type === 'severity') {
      switch (val) {
        case 'minor':
          return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/40';
        case 'major':
          return 'bg-orange-100 text-orange-850 border-orange-200 dark:bg-orange-950_10 dark:text-orange-300 dark:border-orange-800/40';
        case 'critical':
          return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/40 font-semibold';
        default:
          return 'bg-gray-150 text-gray-700 border-gray-250';
      }
    }

    // Generic
    return 'bg-blue-50 text-blue-700 border-blue-150 dark:bg-blue-950/20 dark:text-blue-200 dark:border-blue-900/30';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStyles(),
        className
      )}
    >
      {value}
    </span>
  );
};

export default Badge;
