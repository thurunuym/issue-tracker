import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2 } from 'lucide-react';
import issuesApi from '../services/issuesApi';
import IssueForm from '../components/issues/IssueForm';
import Spinner from '../components/ui/Spinner';
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

      <div className="max-w-4xl mx-auto">
        <IssueForm
          initialValues={formPreset}
          onSubmit={handleEditSubmit}
          isLoading={editMutation.isPending}
          submitButtonText="Save Ticket Changes"
        />
      </div>
    </div>
  );
};

export default IssueEdit;
