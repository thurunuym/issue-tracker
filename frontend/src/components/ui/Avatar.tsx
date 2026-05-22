import React from 'react';
import cn from '../../utils/cn';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const getInitials = () => {
    if (!name) return '?';
    const split = name.trim().split(' ');
    if (split.length >= 2) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getBackgroundColorClass = () => {
    // Return a determinisic bg class based on character hash of user name
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colors = [
      'bg-indigo-650 text-indigo-50',
      'bg-emerald-650 text-emerald-50',
      'bg-amber-650 text-amber-50',
      'bg-red-650 text-red-50',
      'bg-blue-650 text-blue-50',
      'bg-violet-650 text-violet-50',
      'bg-cyan-650 text-cyan-50'
    ];
    return colors[charCodeSum % colors.length];
  };

  const sizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-medium',
    lg: 'h-12 w-12 text-base font-semibold',
    xl: 'h-16 w-16 text-xl font-bold'
  };

  if (src && src.trim() !== '') {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={cn(
          'rounded-full object-cover border border-gray-150 dark:border-gray-800 flex-shrink-0',
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold tracking-wider select-none flex-shrink-0 uppercase',
        getBackgroundColorClass(),
        sizes[size],
        className
      )}
    >
      {getInitials()}
    </div>
  );
};

export default Avatar;
