import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Import visual routing components
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Import visual screen pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IssueList from './pages/IssueList';
import IssueCreate from './pages/IssueCreate';
import IssueDetail from './pages/IssueDetail';
import IssueEdit from './pages/IssueEdit';
import Users from './pages/Users';

// Instantiate TanStack state query engine cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              {/* Public Accounts Credentials Screens */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Private Authorized Session Terminals */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Dashboard metrics view */}
                  <Route path="/" element={<Dashboard />} />

                  {/* Operational Issue ticketing registry */}
                  <Route path="/issues" element={<IssueList />} />
                  <Route path="/issues/create" element={<IssueCreate />} />
                  <Route path="/issues/:id" element={<IssueDetail />} />
                  <Route path="/issues/:id/edit" element={<IssueEdit />} />

                  {/* Administration user directory */}
                  <Route element={<ProtectedRoute requiredPermission="user:view" />}>
                    <Route path="/admin/users" element={<Users />} />
                  </Route>
                </Route>
              </Route>

              {/* Secure fallback router */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Flash Alerts element */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-800 text-sm font-medium',
                duration: 4005,
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
