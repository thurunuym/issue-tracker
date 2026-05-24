import React from 'react';
import cn from '../../utils/cn';

export interface BadgeProps {
  type: 'status' | 'priority' | 'severity' | 'generic';
  value: string;
  className?: string;
}

const PriorityIcon: React.FC<{ level: string }> = ({ level }) => {
  switch (level) {
    case 'low':
      return (
        <svg className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v6M3 7l3 3 3-3" />
        </svg>
      );
    case 'medium':
      return (
        <svg className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h6" />
        </svg>
      );
    case 'high':
      return (
        <svg className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V3M3 5l3-3 3 3" />
        </svg>
      );
    case 'critical':
      return (
        <svg className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2v5M6 9.5v.01" />
        </svg>
      );
    default:
      return null;
  }
};

const SeverityIcon: React.FC<{ level: string }> = ({ level }) => {
  switch (level) {
    case 'minor':
      return (
        <svg className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="6" cy="6" r="3" />
        </svg>
      );
    case 'major':
      return (
        <svg className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 2v5M6 9.5v.01" />
        </svg>
      );
    case 'critical':
      return (
        <svg className="h-3.5 w-3.5 mr-1 flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
          <path d="M5.13 1.86L.82 9.14c-.37.64.1 1.44.87 1.44h8.62c.77 0 1.24-.8.87-1.44L6.87 1.86c-.38-.65-1.36-.65-1.74 0zM6 4.5v2.5M6 9h.01" />
        </svg>
      );
    default:
      return null;
  }
};

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

  const val = value.toLowerCase().trim();

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStyles(),
        className
      )}
    >
      {type === 'priority' && <PriorityIcon level={val} />}
      {type === 'severity' && <SeverityIcon level={val} />}
      {value}
    </span>
  );
};

export default Badge;
