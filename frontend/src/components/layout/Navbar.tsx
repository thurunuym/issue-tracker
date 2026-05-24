import React, { useState, useRef, useEffect } from 'react';
import { ClipboardList, Menu, ChevronDown, Shield, Mail as MailIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { toggleSidebar } from '../../features/ui/uiSlice';
import Avatar from '../ui/Avatar';
import ThemeToggle from './ThemeToggle';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, role } = useAppSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-150 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 transition-colors">
      <div className="flex items-center space-x-3.5">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-2">
          <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-450" />
          <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Issue Tracker
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3.5">
        <ThemeToggle />

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2.5 pl-3 border-l border-gray-200 dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-4">
                  {user.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize leading-3">
                  {role || 'User'}
                </span>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown card */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border-b border-gray-150 dark:border-gray-800">
                  <div className="flex items-center space-x-3">
                    <Avatar src={user.avatar} name={user.name} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <MailIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 leading-3">Role</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">{role || 'User'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
