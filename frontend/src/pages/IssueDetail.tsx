import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Trash2,
  Download,
  ArrowLeft,
  Edit,
  Play,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calendar,
  User,
  UserCheck,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppSelector } from '../app/store';
import usePermission from '../hooks/usePermission';
import issuesApi from '../services/issuesApi';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import formatDate from '../utils/formatDate';
import toast from 'react-hot-toast';

export const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentUserId = localStorage.getItem('userId') || '';
  const { role } = useAppSelector((state) => state.auth);
  const isAdmin = role === 'admin';

  const canEditAny = usePermission('issue:update:any');
  const canEditOwn = usePermission('issue:update:own');
  const canViewActivities = usePermission('issueActivity:view');

  const [resolveOpen, setResolveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  // Fetch issue details
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesApi.getIssueById(id!),
    enabled: !!id,
  });

  // Fetch issue activities timeline
  const { data: activityData, refetch: refetchActivities } = useQuery({
    queryKey: ['issueActivities', id],
    queryFn: () => issuesApi.getIssueActivities(id!),
    enabled: !!id && canViewActivities,
  });

  const queryKeyArr = ['issue', id];

  const patchMutation = useMutation({
    mutationFn: (payload: any) => issuesApi.updateIssue(id!, payload),
    onSuccess: (updatedData) => {
      toast.success('Issue updated successfully!');
      const issueObj = updatedData.issue || updatedData;
      queryClient.setQueryData(queryKeyArr, issueObj);
      queryClient.invalidateQueries({ queryKey: ['issueActivities', id] });
      queryClient.invalidateQueries({ queryKey: ['issueStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update issue.');
    }
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (publicId: string) => issuesApi.deleteAttachment(id!, publicId),
    onSuccess: () => {
      toast.success('Attachment removed.');
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issueActivities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete attachment.');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-450 font-medium">Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-xl max-w-2xl mx-auto border border-red-200 dark:border-red-800/30">
        <h3 className="font-bold text-lg">Failed to load issue</h3>
        <p className="text-sm mt-1 text-red-600 dark:text-red-400/80">Please check your permissions or try again.</p>
        <Link to="/issues" className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Issues
        </Link>
      </div>
    );
  }

  // Permission checks
  const creatorId = typeof issue.createdBy === 'object' ? issue.createdBy?._id : issue.createdBy;
  const isCreatorClient = String(creatorId) === String(currentUserId);
  const assigneeId = typeof issue.assignedTo === 'object' ? issue.assignedTo?._id : issue.assignedTo;
  const isAssignee = !!assigneeId && String(assigneeId) === String(currentUserId);
  const canModifyTicket = canEditAny || (canEditOwn && isCreatorClient) || isAssignee;
  const isAssigneeOnly = !isCreatorClient && isAssignee;
  const showEditButton = isAdmin || !isAssigneeOnly;

  const handleStartProgress = () => patchMutation.mutate({ status: 'In Progress' });
  const handleResolveConfirm = () => { patchMutation.mutate({ status: 'Resolved' }); setResolveOpen(false); };
  const handleCloseConfirm = () => { patchMutation.mutate({ status: 'Closed' }); setCloseOpen(false); };
  const handleReopen = () => patchMutation.mutate({ status: 'Open' });

  const attachments = issue.attachments || [];
  const commentsFeed = activityData?.activities || [];

  // Helpers
  const PropertyRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex items-center justify-between py-3.5">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <Link
          to="/issues"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Issues
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-8">
              {issue.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge type="status" value={issue.status} />
              <Badge type="priority" value={issue.priority} />
              <Badge type="severity" value={issue.severity} />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                Created {formatDate(issue.createdAt)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          {canModifyTicket && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {issue.status === 'Open' && (
                <Button variant="secondary" size="sm" onClick={handleStartProgress} isLoading={patchMutation.isPending}>
                  <Play className="h-4 w-4 mr-1.5 fill-current" />
                  Start Progress
                </Button>
              )}
              {issue.status === 'In Progress' && (
                <Button variant="success" size="sm" onClick={() => setResolveOpen(true)} isLoading={patchMutation.isPending}>
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  Resolve
                </Button>
              )}
              {(issue.status === 'Resolved' || issue.status === 'In Progress' || issue.status === 'Open') && (
                <Button variant="danger" size="sm" onClick={() => setCloseOpen(true)} isLoading={patchMutation.isPending}>
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Close
                </Button>
              )}
              {(issue.status === 'Resolved' || issue.status === 'Closed') && (
                <Button variant="outline" size="sm" onClick={handleReopen} isLoading={patchMutation.isPending}>
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Reopen
                </Button>
              )}
              {showEditButton && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/issues/${issue._id}/edit`)}>
                  <Edit className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Description, Attachments, Timeline */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description */}
          <div className="bg-white dark:bg-gray-901 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Description
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {issue.description}
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white dark:bg-gray-901 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                Attachments
                {attachments.length > 0 && (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    ({attachments.length})
                  </span>
                )}
              </h2>
            </div>
            <div className="p-6">
              {attachments.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                  No files attached to this issue.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachments.map((file: any, idx: number) => {
                    const isImage = /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(file.filename || '') ||
                                    /\.(jpe?g|png|gif|webp|svg|bmp)/i.test(file.url || '');
                    return (
                      <div
                        key={file.publicId || idx}
                        className="overflow-hidden border border-gray-150 bg-gray-50/50 rounded-lg dark:border-gray-800 dark:bg-gray-900 group"
                      >
                        {isImage && (
                          <a href={file.url} target="_blank" rel="noreferrer" className="block">
                            <img
                              src={file.url}
                              alt={file.filename}
                              className="w-full h-40 object-cover bg-gray-100 dark:bg-gray-800 hover:opacity-90 transition-opacity"
                              loading="lazy"
                            />
                          </a>
                        )}
                        <div className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {!isImage && (
                              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                                {file.filename}
                              </p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                {formatDate(file.uploadedAt).split(',')[0]}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            {canModifyTicket && (
                              <button
                                onClick={() => deleteAttachmentMutation.mutate(file.publicId)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white dark:bg-gray-901 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Activity Timeline
                {commentsFeed.length > 0 && (
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    ({commentsFeed.length})
                  </span>
                )}
              </h2>
            </div>
            <div className="p-6">
              {commentsFeed.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-1">
                  <div className="flow-root">
                    <ul role="list" className="-mb-8">
                      {commentsFeed.map((activity: any, idx: number) => {
                        const author = activity.performedBy || { name: 'System' };
                        return (
                          <li key={activity._id || idx}>
                            <div className="relative pb-8 text-left">
                              {idx !== commentsFeed.length - 1 && (
                                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-150 dark:bg-gray-800" aria-hidden="true" />
                              )}
                              <div className="relative flex items-start space-x-3">
                                <Avatar src={author.avatar} name={author.name} size="sm" className="ring-4 ring-white dark:ring-gray-901" />
                                <div className="min-w-0 flex-1 text-left">
                                  <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{author.name}</span>
                                    <span>{formatDate(activity.createdAt)}</span>
                                  </div>
                                  <p className="text-xs font-bold font-mono tracking-wider text-blue-600 dark:text-blue-400 mt-1 uppercase">
                                    {activity.action}
                                  </p>
                                  <div className="text-sm text-gray-700 dark:text-gray-300 mt-1.5 leading-5 whitespace-pre-wrap">
                                    {activity.message || `Action: ${activity.action}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — Properties sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-901 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden sticky top-20">
            <div className="px-5 py-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                Properties
              </h2>
            </div>

            <div className="px-5 divide-y divide-gray-100 dark:divide-gray-800">
              <PropertyRow icon={<User className="h-4 w-4 text-gray-400" />} label="Created By">
                <div className="flex items-center gap-2">
                  <Avatar src={issue.createdBy?.avatar} name={issue.createdBy?.name || 'Unknown'} size="xs" />
                  <span>{issue.createdBy?.name || 'Unknown'}</span>
                </div>
              </PropertyRow>

              <PropertyRow icon={<UserCheck className="h-4 w-4 text-gray-400" />} label="Assigned To">
                {issue.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <Avatar src={issue.assignedTo.avatar} name={issue.assignedTo.name} size="xs" />
                    <span>{issue.assignedTo.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Unassigned</span>
                )}
              </PropertyRow>

              <PropertyRow icon={<Calendar className="h-4 w-4 text-gray-400" />} label="Due Date">
                <span className={!issue.dueDate ? 'text-gray-400 dark:text-gray-500 text-xs font-mono' : ''}>
                  {issue.dueDate
                    ? new Date(issue.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Not set'}
                </span>
              </PropertyRow>

              <PropertyRow icon={<Clock className="h-4 w-4 text-gray-400" />} label="Created">
                <span className="text-gray-600 dark:text-gray-300 font-normal">
                  {formatDate(issue.createdAt).split('at')[0]}
                </span>
              </PropertyRow>

              {issue.resolvedAt && (
                <PropertyRow icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} label="Resolved">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatDate(issue.resolvedAt).split('at')[0]}
                  </span>
                </PropertyRow>
              )}

              {issue.closedAt && (
                <PropertyRow icon={<XCircle className="h-4 w-4 text-red-500" />} label="Closed">
                  <span className="text-red-600 dark:text-red-400">
                    {formatDate(issue.closedAt).split('at')[0]}
                  </span>
                </PropertyRow>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onConfirm={handleResolveConfirm}
        title="Resolve Issue"
        description="Mark this issue as resolved? A resolved timestamp will be logged."
        confirmText="Confirm Resolve"
        cancelText="Cancel"
        variant="success"
        isConfirmLoading={patchMutation.isPending}
      />

      <Modal
        isOpen={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={handleCloseConfirm}
        title="Close Issue"
        description="Close this issue? It will be archived with a closure timestamp."
        confirmText="Confirm Close"
        cancelText="Cancel"
        variant="danger"
        isConfirmLoading={patchMutation.isPending}
      />
    </div>
  );
};

export default IssueDetail;
