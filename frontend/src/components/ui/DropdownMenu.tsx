import React, { useState, useEffect, useRef } from 'react';
import cn from '../../utils/cn';

export interface DropdownItem {
  label: string;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-850 dark:ring-gray-800 z-30 transition-all border border-gray-100 dark:border-gray-800',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center px-4 py-2 text-sm text-gray-750 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors',
                  item.className
                )}
              >
                {item.icon && <span className="mr-2 flex items-center">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
