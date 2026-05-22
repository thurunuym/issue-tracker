import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-901 border border-gray-200 transition-all dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300 dark:border-gray-800 cursor-pointer active:scale-95"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
};

export default ThemeToggle;
