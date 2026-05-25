import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, FileText, Trash2, Download, Upload } from 'lucide-react';
import issuesApi from '../services/issuesApi';
import IssueForm from '../components/issues/IssueForm';
import FileUpload from '../components/ui/FileUpload';
import Spinner from '../components/ui/Spinner';
import formatDate from '../utils/formatDate';
import toast from 'react-hot-toast';

export const IssueEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesApi.getIssueById(id!),
    enabled: !!id,
  });

  const queryKeyArr = ['issue', id];

  const editMutation = useMutation({
    mutationFn: (payload: any) => issuesApi.updateIssue(id!, payload),
    onSuccess: (updatedData) => {
      toast.success('Issue updated successfully!');
      const issueObj = updatedData.issue || updatedData;
      queryClient.setQueryData(queryKeyArr, issueObj);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issueActivities', id] });
      navigate(`/issues/${id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update issue.');
    },
  });

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

  const handleEditSubmit = (formValues: any) => {
    const payload = {
      title: formValues.title,
      description: formValues.description,
      priority: formValues.priority,
      severity: formValues.severity,
      assignedTo: formValues.assignedTo || null,
      dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
    };
    editMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-450 font-medium">Loading issue data...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 rounded-xl max-w-2xl mx-auto border border-red-200 dark:border-red-800/30">
        <h3 className="font-bold text-lg">Error loading issue data</h3>
        <p className="text-sm mt-1">Please ensure you are authenticated or try reloading.</p>
        <Link to={`/issues/${id}`} className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Details
        </Link>
      </div>
    );
  }

  const assigneeId = typeof issue.assignedTo === 'object' ? issue.assignedTo?._id : issue.assignedTo;
  const formPreset = {
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
    severity: issue.severity,
    assignedTo: assigneeId || '',
    dueDate: issue.dueDate || '',
  };

  const attachments = issue.attachments || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <Link
          to={`/issues/${id}`}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Details
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Edit2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Edit Issue
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-450 mt-0.5">
              Update issue details and properties
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <IssueForm
        initialValues={formPreset}
        onSubmit={handleEditSubmit}
        isLoading={editMutation.isPending}
        submitButtonText="Save Changes"
      />

      {/* Attachments Section */}
      <div className="bg-white dark:bg-gray-901 rounded-xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 uppercase tracking-wider">
            <Upload className="h-4 w-4 text-blue-500" />
            Attachments
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Existing attachments */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((file: any, idx: number) => {
                const isImage = /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(file.filename || '') ||
                                /\.(jpe?g|png|gif|webp|svg|bmp)/i.test(file.url || '');
                return (
                  <div
                    key={file.publicId || idx}
                    className="group flex items-center justify-between p-3 border border-gray-150 bg-gray-50/50 rounded-lg dark:border-gray-800 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isImage ? (
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="h-10 w-10 rounded-lg object-cover bg-gray-200 dark:bg-gray-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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

                    <div className="flex items-center gap-1 pl-2 shrink-0">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => deleteAttachmentMutation.mutate(file.publicId)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload new */}
          <div className={attachments.length > 0 ? 'border-t border-gray-150 dark:border-gray-800 pt-5' : ''}>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-450 mb-3">
              Upload New Files
            </p>
            <FileUpload
              onUpload={(files) => uploadMutation.mutate(files)}
              isLoading={uploadMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueEdit;
