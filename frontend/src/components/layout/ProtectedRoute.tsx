import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import Spinner from '../ui/Spinner';

interface ProtectedRouteProps {
  requiredPermission?: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, permissions } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500 font-sans font-medium">Authorizing system credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    // Show a clean access denied overlay if you are authorized generally but missing specific access
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="p-3.5 bg-red-105 rounded-full text-red-655 mb-4 dark:bg-red-950/20 dark:text-red-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m0-8v6m-5 2h10a2 2 0 002-2v-4a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-950 dark:text-gray-50">Operational Permission Blocked</h2>
        <p className="text-sm text-gray-550 dark:text-gray-400 mt-1.5 mb-6 leading-5">
          Your account role lacks the <code className="font-mono bg-gray-100 p-1 rounded font-bold dark:bg-gray-900 text-xs">{requiredPermission}</code> authority parameter.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
