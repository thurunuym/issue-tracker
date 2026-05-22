import React from 'react';
import { useAppSelector } from '../app/store';

export const Dashboard: React.FC = () => {
  const { user, role } = useAppSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You are successfully logged in. Your system role is: <strong className="uppercase text-blue-600 dark:text-blue-400">{role}</strong>.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;