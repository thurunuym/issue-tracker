import React from 'react';
import { LogOut, ClipboardList, Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebar } from '../../features/ui/uiSlice';
import authApi from '../../services/authApi';
import Avatar from '../ui/Avatar';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, role } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      dispatch(logout());
      toast.success('Successfully logged out.');
    } catch (err: any) {
      console.error(err);
      dispatch(logout()); // Ensure local logout even if request fails
    }
  };

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
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-800">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-4">
                {user.name}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize leading-3">
                {role || 'User'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-500 hover:text-red-650 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-950/20 cursor-pointer transition-colors"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
