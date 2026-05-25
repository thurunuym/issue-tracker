import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, CheckCircle2, AlertCircle, Layers, Activity, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/store';
import issuesApi from '../services/issuesApi';
import StatCard from '../components/dashboard/StatCard';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import SeverityBarChart from '../components/dashboard/SeverityBarChart';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import formatDate from '../utils/formatDate';

// Helper to extract a count from the aggregation array by _id key
const getCount = (arr: { _id: string; count: number }[], key: string): number => {
  const item = arr.find((entry) => entry._id === key);
  return item ? item.count : 0;
};

export const Dashboard: React.FC = () => {
  const { user, role } = useAppSelector((state) => state.auth);
  const isAdmin = role === 'admin';

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
  const bySeverity: { _id: string; count: number }[] = data?.bySeverity ?? [];
  const recentActivities = data?.recentActivities ?? [];
  const myActiveTasks = data?.myActiveTasks ?? [];

  const openCount = getCount(byStatus, 'Open');
  const inProgressCount = getCount(byStatus, 'In Progress');

  // Transform aggregation data into chart-friendly shapes
  const statusChartData = ['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => ({
    name: status,
    value: getCount(byStatus, status),
  }));

  const severityChartData = ['Minor', 'Major', 'Critical'].map((sev) => ({
    name: sev,
    value: getCount(bySeverity, sev),
  }));

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.name ?? 'User'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-450 mt-1">
            Here's what needs your attention today
          </p>
        </div>
        
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-150 rounded-xl dark:bg-gray-901 dark:border-gray-800">
          <Spinner size="md" />
          <p className="mt-3 text-sm text-gray-400 dark:text-gray-500 font-medium">
            Loading dashboard metrics…
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/30">
          <h3 className="font-bold flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Failed to load dashboard metrics
          </h3>
          <p className="text-sm mt-1.5 text-red-600 dark:text-red-400/80">
            Please ensure you are authenticated or try reloading the page.
          </p>
        </div>
      )}

      {data && !isLoading && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Issues"
              value={total}
              icon={<Layers className="h-5 w-5" />}
              description="All tracked issues"
              color="blue"
            />
            <StatCard
              title="Open"
              value={openCount}
              icon={<AlertCircle className="h-5 w-5" />}
              description="Waiting for review"
              color="amber"
            />
            <StatCard
              title="In Progress"
              value={inProgressCount}
              icon={<BarChart3 className="h-5 w-5" />}
              description="Currently being worked on"
              color="violet"
            />
            <StatCard
              title="Resolved Today"
              value={resolvedToday}
              icon={<CheckCircle2 className="h-5 w-5" />}
              description="Closed since midnight"
              color="emerald"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-901 border border-gray-150 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5 uppercase tracking-wider">
                Issues by Status
              </h2>
              <StatusPieChart data={statusChartData} />
            </div>

            <div className="bg-white dark:bg-gray-901 border border-gray-150 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-5 uppercase tracking-wider">
                Issues by Severity
              </h2>
              <SeverityBarChart data={severityChartData} />
            </div>
          </div>

          {/* My Active Tasks (non-admin only) */}
          {!isAdmin && myActiveTasks.length > 0 && (
            <div className="bg-white dark:bg-gray-901 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wider">
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                  My Active Tasks
                </h2>
                <Link
                  to="/issues"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {myActiveTasks.map((task: any) => (
                  <Link
                    key={task._id}
                    to={`/issues/${task._id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-550 mt-0.5">
                        Updated {formatDate(task.updatedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <Badge type="status" value={task.status} />
                      <Badge type="priority" value={task.priority} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-901 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-800">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wider">
                <Activity className="h-4 w-4 text-blue-500" />
                Recent Activity
              </h2>
            </div>
            <div className="p-6">
              <ActivityFeed activities={recentActivities.slice(0, 10)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;