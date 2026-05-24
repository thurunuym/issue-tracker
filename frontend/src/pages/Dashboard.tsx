import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CheckCircle2, AlertCircle, Layers, Activity } from 'lucide-react';
import { useAppSelector } from '../app/store';
import issuesApi from '../services/issuesApi';
import StatCard from '../components/dashboard/StatCard';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import PriorityBarChart from '../components/dashboard/PriorityBarChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import Spinner from '../components/ui/Spinner';

// Helper to extract a count from the aggregation array by _id key
const getCount = (arr: { _id: string; count: number }[], key: string): number => {
  const item = arr.find((entry) => entry._id === key);
  return item ? item.count : 0;
};

export const Dashboard: React.FC = () => {
  const { user, role } = useAppSelector((state) => state.auth);

  const { data, isLoading, error } = useQuery({
    queryKey: ['issueStats'],
    queryFn: () => issuesApi.getIssueStats(),
    refetchInterval: 60_000, // auto-refresh every 60s
  });

  // Derive display values from API response
  const total = data?.total ?? 0;
  const resolvedToday = data?.resolvedToday ?? 0;
  const byStatus: { _id: string; count: number }[] = data?.byStatus ?? [];
  const byPriority: { _id: string; count: number }[] = data?.byPriority ?? [];
  const recentActivities = data?.recentActivities ?? [];

  const openCount = getCount(byStatus, 'Open');
  const inProgressCount = getCount(byStatus, 'In Progress');

  // Transform aggregation data into chart-friendly shapes
  const statusChartData = ['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => ({
    name: status,
    value: getCount(byStatus, status),
  }));

  const priorityChartData = ['Low', 'Medium', 'High', 'Critical'].map((priority) => ({
    name: priority,
    value: getCount(byPriority, priority),
  }));

  return (
    <div className="space-y-6 text-left p-1">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-8">
          Welcome back, {user?.name ?? 'User'}!
        </h1>
        <p className="text-sm text-gray-550 dark:text-gray-400 mt-0.5">
          Your system role is{' '}
          <strong className="uppercase text-blue-600 dark:text-blue-400">{role}</strong>.
          Here's an overview of the issue tracker.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-150 rounded-xl dark:bg-gray-901 dark:border-gray-800">
          <Spinner size="md" />
          <p className="mt-3 text-sm text-gray-400 font-medium">Loading dashboard metrics…</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-350 rounded-xl">
          <h3 className="font-bold flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-1.5 text-current" />
            Failed to load dashboard metrics
          </h3>
          <p className="text-sm mt-1">Please ensure you are authenticated or try reloading the page.</p>
        </div>
      )}

      {/* Data loaded */}
      {data && !isLoading && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Issues"
              value={total}
              icon={<Layers className="h-5 w-5" />}
              description="All tracked issues"
            />
            <StatCard
              title="Open"
              value={openCount}
              icon={<AlertCircle className="h-5 w-5" />}
              description="Awaiting triage"
            />
            <StatCard
              title="In Progress"
              value={inProgressCount}
              icon={<BarChart3 className="h-5 w-5" />}
              description="Currently being worked on"
            />
            <StatCard
              title="Resolved Today"
              value={resolvedToday}
              icon={<CheckCircle2 className="h-5 w-5" />}
              description="Closed since midnight"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-901 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Issues by Status
              </h2>
              <StatusPieChart data={statusChartData} />
            </div>

            <div className="bg-white dark:bg-gray-901 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Issues by Priority
              </h2>
              <PriorityBarChart data={priorityChartData} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-901 border border-gray-150 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Recent Activity
            </h2>
            <ActivityFeed activities={recentActivities} />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;