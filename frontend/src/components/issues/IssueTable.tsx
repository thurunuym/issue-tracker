import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import type { Issue } from '../../types';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import formatDate from '../../utils/formatDate';

interface IssueTableProps {
  issues: Issue[];
  onDeleteRequest: (id: string) => void;
  /** Hide the entire Actions column (used for "All" tab when non-admin) */
  hideActions?: boolean;
  /** Hide only the Edit button inside Actions (used for "Assigned to Me" tab) */
  hideEdit?: boolean;
}

export const IssueTable: React.FC<IssueTableProps> = ({ issues, onDeleteRequest, hideActions = false, hideEdit = false }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-150 bg-white dark:border-gray-800 dark:bg-gray-901 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-150 text-xs font-semibold text-gray-550 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4 font-semibold">Severity</th>
              <th className="px-5 py-4">Assigned To</th>
              <th className="px-5 py-4">Due Date</th>
              <th className="px-5 py-4">Created</th>
              {!hideActions && <th className="px-5 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
            {issues.map((issue) => {
              const assigned = issue.assignedTo;
              const title = issue.title;
              const statusName = issue.status;
              const priorityName = issue.priority;
              const severityName = issue.severity;
              const dueDateText = issue.dueDate ? new Date(issue.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'None';

              return (
                <tr
                  key={issue._id}
                  className="hover:bg-gray-50/70 dark:hover:bg-gray-850/30 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/issues/${issue._id}`)}
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400 transition-colors truncate max-w-sm">
                      {title}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Badge type="status" value={statusName} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Badge type="priority" value={priorityName} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Badge type="severity" value={severityName} />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {assigned ? (
                      <div className="flex items-center space-x-2">
                        <Avatar src={assigned.avatar} name={assigned.name} size="xs" />
                        <span className="text-xs text-gray-650 dark:text-gray-300 truncate max-w-[120px]">
                          {assigned.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-650 dark:text-gray-300">{dueDateText}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(issue.createdAt).split(',')[0]}</span>
                  </td>
                  {!hideActions && (
                    <td className="px-5 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center space-x-2">
                        {!hideEdit && (
                          <button
                            onClick={() => navigate(`/issues/${issue._id}/edit`)}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-505 hover:text-blue-600 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer"
                            title="Edit Issue"
                          >
                            <Edit className="h-4.2 w-4.2" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteRequest(issue._id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-505 hover:text-red-650 dark:hover:bg-red-950/20 dark:text-gray-400 dark:hover:text-red-400 cursor-pointer"
                          title="Delete Issue"
                        >
                          <Trash2 className="h-4.2 w-4.2" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueTable;
