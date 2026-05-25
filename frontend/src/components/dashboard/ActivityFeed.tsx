import React from 'react';
import { PlusCircle, Edit, CheckCircle2, UserPlus, MessageSquare, AlertCircle } from 'lucide-react';
import type { IssueActivity } from '../../types';
import Avatar from '../ui/Avatar';
import formatDate from '../../utils/formatDate';

interface ActivityFeedProps {
  activities?: IssueActivity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = [] }) => {
  const getIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <PlusCircle className="h-[18px] w-[18px] text-blue-600" />;
      case 'UPDATED':
        return <Edit className="h-[18px] w-[18px] text-amber-600" />;
      case 'STATUS_CHANGED':
      case 'RESOLVED':
      case 'CLOSED':
        return <CheckCircle2 className="h-[18px] w-[18px] text-emerald-600" />;
      case 'ASSIGNED':
        return <UserPlus className="h-[18px] w-[18px] text-indigo-600" />;
      case 'COMMENTED':
        return <MessageSquare className="h-[18px] w-[18px] text-purple-600" />;
      default:
        return <AlertCircle className="h-[18px] w-[18px] text-gray-500" />;
    }
  };

  const getActionBg = (action: string) => {
    switch (action) {
      case 'CREATED':
        return 'bg-blue-50 dark:bg-blue-950/25';
      case 'UPDATED':
        return 'bg-amber-50 dark:bg-amber-950/25';
      case 'STATUS_CHANGED':
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-50 dark:bg-emerald-950/25';
      case 'ASSIGNED':
        return 'bg-indigo-50 dark:bg-indigo-950/25';
      case 'COMMENTED':
        return 'bg-purple-50 dark:bg-purple-950/25';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-gray-400 dark:text-gray-500 border border-dashed border-gray-250 dark:border-gray-800 rounded-xl">
        No recent activities recorded.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, index) => {
          const user = activity.performedBy || { name: 'Unknown User' };
          return (
            <li key={activity._id || index}>
              <div className="relative pb-8 text-left">
                {index !== activities.length - 1 && (
                  <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-150 dark:bg-gray-800" aria-hidden="true" />
                )}
                <div className="relative flex items-start space-x-3.5">
                  <div className="relative">
                    <Avatar src={user.avatar} name={user.name} size="sm" className="ring-4 ring-white dark:ring-gray-901" />
                    <span className={`absolute -bottom-1 -right-1 rounded-full p-0.5 ring-2 ring-white dark:ring-gray-901 ${getActionBg(activity.action)}`}>
                      {getIcon(activity.action)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      <p className="leading-5">
                        {activity.message || `Performed "${activity.action}"`}
                        {activity.field && (
                          <span className="ml-1 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-550 dark:text-gray-450 font-mono">
                            {activity.field}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ActivityFeed;
