import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, FileText, Trash2, Download } from 'lucide-react';
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

  // Query actual issue entries
  const { data: issue, isLoading, error } = useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesApi.getIssueById(id!),
    enabled: !!id,
  });

  const queryKeyArr = ['issue', id];

  // Mutator for ticket edit submissions
  const editMutation = useMutation({
    mutationFn: (payload: any) => issuesApi.updateIssue(id!, payload),
    onSuccess: (updatedData) => {
      toast.success('Issue updated successfully!');
      // Update cache in place — backend returns { issue: ... }
      const issueObj = updatedData.issue || updatedData;
      queryClient.setQueryData(queryKeyArr, issueObj);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issueActivities', id] });
      // Go back to details view
      navigate(`/issues/${id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Access Denied: You do not have permissions to edit this ticket.');
    },
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

  const handleEditSubmit = (formValues: any) => {
    const payload = {
      title: formValues.title,
      description: formValues.description,
      priority: formValues.priority,
      severity: formValues.severity,
      assignedTo: formValues.assignedTo || null, // null removes current assignment
      dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
    };

    editMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-gray-500 font-medium">Downloading ticket variables for editing...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-350 rounded-xl max-w-2xl mx-auto">
        <h3 className="font-bold text-lg">Error loading issue data</h3>
        <p className="text-sm mt-1">Please ensure you are authenticated or try reloading.</p>
        <Link to={`/issues/${id}`} className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Details
        </Link>
      </div>
    );
  }

  // Map database format to form prefilled standards
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
    <div className="space-y-6 text-left p-1">
      {/* Detail header */}
      <div className="space-y-2 border-b border-gray-150 pb-5 dark:border-gray-800">
        <Link
          to={`/issues/${id}`}
          className="inline-flex items-center text-xs font-semibold text-gray-550 hover:text-blue-500 hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to details
        </Link>
        <div className="flex items-center space-x-2">
          <Edit2 className="h-6 w-6 text-blue-600 dark:text-blue-450" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-901 dark:text-white tracking-tight">
            Modify Ticket
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <IssueForm
          initialValues={formPreset}
          onSubmit={handleEditSubmit}
          isLoading={editMutation.isPending}
          submitButtonText="Save Ticket Changes"
        />

        {/* File Attachments Section */}
        <div className="bg-white p-6 border border-gray-150 dark:bg-gray-901 dark:border-gray-800 rounded-xl shadow-sm text-left max-w-2xl mx-auto">
          <h2 className="text-sm font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-4 leading-4">
            File Attachments
          </h2>

          {/* Existing attachments preview */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
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
                    <button
                      onClick={() => deleteAttachmentMutation.mutate(file.publicId)}
                      className="p-1.5 text-gray-505 hover:text-red-650 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors"
                      title="Delete Attachment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload new files */}
          <div className={attachments.length > 0 ? 'border-t border-gray-150 pt-5 dark:border-gray-800' : ''}>
            <p className="text-xs font-semibold text-gray-655 dark:text-gray-350 mb-3 block">
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
