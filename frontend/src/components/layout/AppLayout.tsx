import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 text-gray-901 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      {/* Top Header */}
      <Navbar />

      {/* Main Container Grid */}
      <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar />

        {/* Content canvas with safe scroll boundaries */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6.5 lg:p-8 bg-gray-50/50 dark:bg-gray-950/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
