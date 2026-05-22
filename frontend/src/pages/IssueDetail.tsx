import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tags,
  FileText,
  Trash2,
  Download,
  ArrowLeft,
  Edit,
  MessageSquare,
  Play,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import usePermission from '../hooks/usePermission';
import issuesApi from '../services/issuesApi';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import FileUpload from '../components/ui/FileUpload';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import formatDate from '../utils/formatDate';
import toast from 'react-hot-toast';

export const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const currentUserId = localStorage.getItem('userId') || '';

  const canEditAny = usePermission('issue:update:any');
  const canEditOwn = usePermission('issue:update:own');
  const canViewActivities = usePermission('issueActivity:view');

  // Interactive actions modals
  const [resolveOpen, setResolveOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);

  // Comments state
  const [newComment, setNewComment] = useState('');
  const [isCommentMutating, setIsCommentMutating] = useState(false);

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
      queryClient.setQueryData(queryKeyArr, updatedData);
      queryClient.invalidateQueries({ queryKey: ['issueActivities', id] });
      queryClient.invalidateQueries({ queryKey: ['issueStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Access Denied: You do not have permissions to modify this ticket.');
    }
  });

  // Mutator for file uploads
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => issuesApi.addAttachments(id!, files),
    onSuccess: () => {
      toast.success('File(s) uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issueActivities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'File upload failed.');
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
  const canModifyTicket = canEditAny || (canEditOwn && isCreatorClient);

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

  // Submit comments/audit messages
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommentMutating(true);
    const commentToast = toast.loading('Registering Comment...');
    try {
      await issuesApi.addComment(id!, newComment);
      setNewComment('');
      toast.success('Comment logged in timelines audit trail!', { id: commentToast });
      refetchActivities();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit comment log.', { id: commentToast });
    } finally {
      setIsCommentMutating(false);
    }
  };

  const attachments = issue.attachments || [];
  const tagsList = issue.tags || [];
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

            <Button variant="outline" size="sm" onClick={() => navigate(`/issues/${issue._id}/edit`)}>
              <Edit className="h-4 w-4 mr-1.5" />
              Edit Details
            </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((file: any, idx: number) => (
                  <div
                    key={file.publicId || idx}
                    className="flex items-center justify-between p-3.5 border border-gray-150 bg-gray-50/50 rounded-lg dark:border-gray-805 dark:bg-gray-900 shadow-xs text-left"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <FileText className="h-5.5 w-5.5 text-blue-600 flex-shrink-0" />
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
                ))}
              </div>
            )}

            {/* Render file uploader element */}
            {canModifyTicket && (
              <div className="mt-5.5 border-t border-gray-150 pt-5.5 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-655 dark:text-gray-350 mb-3 block">
                  Add New Files to Ticket
                </p>
                <FileUpload
                  onUpload={(files) => uploadMutation.mutate(files)}
                  isLoading={uploadMutation.isPending}
                />
              </div>
            )}
          </div>

          {/* Timeline and commentary logs */}
          <div className="bg-white p-6 border border-gray-150 dark:bg-gray-901 dark:border-gray-800 rounded-xl shadow-sm text-left">
            <h2 className="text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-5 leading-4">
              Audit Timeline & Comments Logs
            </h2>

            {/* Comment submittal form */}
            <form onSubmit={handleCommentSubmit} className="mb-6 space-y-3">
              <Textarea
                placeholder="Log a comment or make audit notes..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isCommentMutating}
                className="text-sm"
                rows={3}
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" type="submit" isLoading={isCommentMutating}>
                  <MessageSquare className="h-4 w-4 mr-1.5 stroke-[2.5]" />
                  Log Comment
                </Button>
              </div>
            </form>

            {/* Activity entries */}
            {commentsFeed.length === 0 ? (
              <p className="text-sm text-gray-550 dark:text-gray-500 text-center py-6">
                No active audit entries logged.
              </p>
            ) : (
              <div className="flow-root mt-4.5 border-t border-gray-150 pt-5 dark:border-gray-800">
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

          {/* Tags sidebar card */}
          <div className="bg-white p-5 border border-gray-150 dark:bg-gray-901 dark:border-gray-800 rounded-xl shadow-sm text-left">
            <h2 className="text-xs font-semibold tracking-wider text-gray-455 dark:text-gray-500 uppercase mb-3 flex items-center">
              <Tags className="h-4.5 w-4.5 mr-1.5 text-gray-400" />
              Indexed Tags List
            </h2>
            {tagsList.length === 0 ? (
              <span className="text-xs text-gray-400 dark:text-gray-550 italic block">No tags configured for this issue.</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tagsList.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-750 dark:bg-gray-800 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-750"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
