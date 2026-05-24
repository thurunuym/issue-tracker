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
  RotateCcw
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

  // Global mutator for ticket patches (workflow updates)
  const patchMutation = useMutation({
    mutationFn: (payload: any) => issuesApi.updateIssue(id!, payload),
    onSuccess: (updatedData) => {
      toast.success('Ticket updated successfully!');
      // Backend returns { issue: ... } — unwrap before caching
      const issueObj = updatedData.issue || updatedData;
      queryClient.setQueryData(queryKeyArr, issueObj);
      queryClient.invalidateQueries({ queryKey: ['issueActivities', id] });
      queryClient.invalidateQueries({ queryKey: ['issueStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Access Denied: You do not have permissions to modify this ticket.');
    }
  });


  // Mutator for attachment deletion
  const deleteAttachmentMutation = useMutation({
    mutationFn: (publicId: string) => issuesApi.deleteAttachment(id!, publicId),
    onSuccess: () => {
      toast.success('Attachment removed from ticket.');
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
        <p className="mt-4 text-sm text-gray-550 font-medium">Re-populating ticket detail registers...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-350 rounded-xl max-w-2xl mx-auto">
        <h3 className="font-bold text-lg">Failed to retrieve ticket details</h3>
        <p className="text-sm mt-1">Please ensure you have permissions or seek administrator authorization credentials.</p>
        <Link to="/issues" className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Issues
        </Link>
      </div>
    );
  }

  // Determine fine-grained user edit permission
  const creatorId = typeof issue.createdBy === 'object' ? issue.createdBy?._id : issue.createdBy;
  const isCreatorClient = String(creatorId) === String(currentUserId);
  const assigneeId = typeof issue.assignedTo === 'object' ? issue.assignedTo?._id : issue.assignedTo;
  const isAssignee = !!assigneeId && String(assigneeId) === String(currentUserId);
  const canModifyTicket = canEditAny || (canEditOwn && isCreatorClient) || isAssignee;

  // For non-admin users: hide "Edit Details" when the issue is assigned to them but not created by them
  const isAssigneeOnly = !isCreatorClient && isAssignee;
  const showEditButton = isAdmin || !isAssigneeOnly;

  // Workflow transitions trigger handlers
  const handleStartProgress = () => {
    patchMutation.mutate({ status: 'In Progress' });
  };

  const handleResolveConfirm = () => {
    patchMutation.mutate({ status: 'Resolved' });
    setResolveOpen(false);
  };

  const handleCloseConfirm = () => {
    patchMutation.mutate({ status: 'Closed' });
    setCloseOpen(false);
  };

  const handleReopen = () => {
    patchMutation.mutate({ status: 'Open' });
  };


  const attachments = issue.attachments || [];
  const commentsFeed = activityData?.activities || [];

  return (
    <div className="space-y-6 text-left p-1">
      {/* Detail header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 pb-5 dark:border-gray-800">
        <div className="space-y-2">
          <Link
            to="/issues"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-blue-500 hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Issues registry
          </Link>
          <div className="flex flex-wrap items-center gap-3.5">
            <h1 className="text-xl md:text-2xl font-bold text-gray-901 dark:text-white tracking-tight leading-8">
              {issue.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <Badge type="status" value={issue.status} />
              <Badge type="priority" value={issue.priority} />
              <Badge type="severity" value={issue.severity} />
            </div>
          </div>
        </div>

        {canModifyTicket && (
          <div className="flex flex-wrap items-center gap-2">
            {issue.status === 'Open' && (
              <Button variant="secondary" size="sm" onClick={handleStartProgress} isLoading={patchMutation.isPending}>
                <Play className="h-4 w-4 mr-1.5 fill-current" />
                Start Progress
              </Button>
            )}

            {issue.status === 'In Progress' && (
              <Button variant="success" size="sm" onClick={() => setResolveOpen(true)} isLoading={patchMutation.isPending}>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Resolve Ticket
              </Button>
            )}

            {(issue.status === 'Resolved' || issue.status === 'In Progress' || issue.status === 'Open') && (
              <Button variant="danger" size="sm" onClick={() => setCloseOpen(true)} isLoading={patchMutation.isPending}>
                <XCircle className="h-4 w-4 mr-1.5" />
                Close Ticket
              </Button>
            )}

            {(issue.status === 'Resolved' || issue.status === 'Closed') && (
              <Button variant="outline" size="sm" onClick={handleReopen} isLoading={patchMutation.isPending}>
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Reopen Ticket
              </Button>
            )}

            {showEditButton && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/issues/${issue._id}/edit`)}>
                <Edit className="h-4 w-4 mr-1.5" />
                Edit Details
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main detail layout columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6.5">
        {/* Left Column (Description, attachments, comments) */}
        <div className="lg:col-span-2 space-y-6.5 animate-fadeIn">
          {/* Issue Description detail */}
          <div className="bg-white p-6 border border-gray-150 dark:bg-gray-901 dark:border-gray-800 rounded-xl shadow-sm text-left">
            <h2 className="text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-3.5 leading-4">
              Ticket Description Notes
            </h2>
            <p className="text-gray-800 dark:text-gray-300 text-sm leading-6 whitespace-pre-wrap">
              {issue.description}
            </p>
          </div>

          {/* Attachments panel */}
          <div className="bg-white p-6 border border-gray-150 dark:bg-gray-901 dark:border-gray-800 rounded-xl shadow-sm text-left">
            <h2 className="text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-4 leading-4">
              File Attachments List
            </h2>

            {attachments.length === 0 ? (
              <p className="text-sm text-gray-550 dark:text-gray-550 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-5 text-center">
                No files uploaded to this ticket.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachments.map((file: any, idx: number) => {
                  const isImage = /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(file.filename || '') ||
                                  /\.(jpe?g|png|gif|webp|svg|bmp)/i.test(file.url || '');

                  return (
                    <div
                      key={file.publicId || idx}
                      className="overflow-hidden border border-gray-150 bg-gray-50/50 rounded-lg dark:border-gray-805 dark:bg-gray-900 shadow-xs text-left"
                    >
                      {/* Image preview */}
                      {isImage && (
                        <a href={file.url} target="_blank" rel="noreferrer" className="block">
                          <img
                            src={file.url}
                            alt={file.filename}
                            className="w-full h-44 object-cover bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
                            loading="lazy"
                          />
                        </a>
                      )}

                      {/* File info row */}
                      <div className="flex items-center justify-between p-3.5">
                        <div className="flex items-center space-x-3 truncate">
                          {!isImage && <FileText className="h-5.5 w-5.5 text-blue-600 flex-shrink-0" />}
                          <div className="truncate text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                              {file.filename}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wide">
                              {formatDate(file.uploadedAt).split(',')[0]}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 pl-2 shrink-0">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-505 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                            title="Download Attachment"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          {canModifyTicket && (
                            <button
                              onClick={() => deleteAttachmentMutation.mutate(file.publicId)}
                              className="p-1.5 text-gray-505 hover:text-red-650 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                              title="Delete Attachment"
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

          {/* Timeline and commentary logs */}
          <div className="bg-white p-6 border border-gray-150 dark:bg-gray-901 dark:border-gray-800 rounded-xl shadow-sm text-left">
            <h2 className="text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-5 leading-4">
              Audit Timeline & Comments Logs
            </h2>

            {/* Activity entries */}
            {commentsFeed.length === 0 ? (
              <p className="text-sm text-gray-550 dark:text-gray-500 text-center py-6">
                No active audit entries logged.
              </p>
            ) : (
              <div className="flow-root mt-4.5 border-t border-gray-150 pt-5 dark:border-gray-800 max-h-[500px] overflow-y-auto">
                <ul role="list" className="-mb-8">
                  {commentsFeed.map((activity: any, idx: number) => {
                    const author = activity.performedBy || { name: 'System User' };
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
                              <p className="text-xs font-bold font-mono tracking-wider text-blue-600 dark:text-blue-450 mt-1 uppercase">
                                Action: {activity.action}
                              </p>
                              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1.5 leading-5 whitespace-pre-wrap">
                                {activity.message || `Recorded action: ${activity.action}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Column (Properties bar: timestamps, assignee, tags) */}
        <div className="space-y-6 animate-fadeIn">
          {/* Metadata attributes box */}
          <div className="bg-white p-5 border border-gray-150 dark:bg-gray-901 dark:border-gray-800 rounded-xl shadow-sm text-left">
            <h2 className="text-xs font-semibold tracking-wider text-gray-450 dark:text-gray-505 uppercase mb-4">
              Ticket Properties
            </h2>

            <div className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
              <div className="flex justify-between py-3">
                <span className="text-gray-500 dark:text-gray-400">Created By</span>
                <div className="flex items-center space-x-1.5">
                  <Avatar src={issue.createdBy?.avatar} name={issue.createdBy?.name || 'Unknown'} size="xs" />
                  <span className="font-semibold text-gray-905 dark:text-gray-150">{issue.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-gray-500 dark:text-gray-400">Assigned To</span>
                <div>
                  {issue.assignedTo ? (
                    <div className="flex items-center space-x-1.5">
                      <Avatar src={issue.assignedTo.avatar} name={issue.assignedTo.name} size="xs" />
                      <span className="font-semibold text-gray-905 dark:text-gray-150">{issue.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-505 font-mono">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between py-3 whitespace-nowrap">
                <span className="text-gray-500 dark:text-gray-400">Due Target</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'None'}
                </span>
              </div>

              <div className="flex justify-between py-3 whitespace-nowrap">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Logged Date</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDate(issue.createdAt).split('at')[0]}
                </span>
              </div>

              {issue.resolvedAt && (
                <div className="flex justify-between py-3">
                  <span className="text-emerald-650 font-medium dark:text-emerald-400">Resolved Date</span>
                  <span className="text-gray-750 dark:text-gray-300">{formatDate(issue.resolvedAt).split('at')[0]}</span>
                </div>
              )}

              {issue.closedAt && (
                <div className="flex justify-between py-3">
                  <span className="text-red-550 font-medium dark:text-red-400">Closed Date</span>
                  <span className="text-gray-750 dark:text-gray-300">{formatDate(issue.closedAt).split('at')[0]}</span>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Confirmation transitions dialog screens */}
      <Modal
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onConfirm={handleResolveConfirm}
        title="Resolve Ticket Issue"
        description="Are you sure you want to mark this issue as resolved? This will log a resolved timestamp on the issue and record a resolved action in audit entries."
        confirmText="Confirm Resolved"
        cancelText="Cancel"
        variant="success"
        isConfirmLoading={patchMutation.isPending}
      />

      <Modal
        isOpen={closeOpen}
        onClose={() => setCloseOpen(false)}
        onConfirm={handleCloseConfirm}
        title="Close Ticket Issue"
        description="Are you sure you want to close this issue? This will archive the operational status and log a closure timestamp automatically."
        confirmText="Confirm Closure"
        cancelText="Cancel"
        variant="danger"
        isConfirmLoading={patchMutation.isPending}
      />
    </div>
  );
};

export default IssueDetail;
