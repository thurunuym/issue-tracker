import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import issuesApi from '../services/issuesApi';
import IssueForm from '../components/issues/IssueForm';
import toast from 'react-hot-toast';

export const IssueCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values: any) => {
      const payload = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        severity: values.severity,
        assignedTo: values.assignedTo || undefined,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      };
      return issuesApi.createIssue(payload);
    },
    onSuccess: (data) => {
      toast.success('Issue created successfully!');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issueStats'] });
      const issue = data.issue || data;
      navigate(`/issues/${issue._id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create issue. Please try again.');
    },
  });

  const handleCreateSubmit = (formValues: any) => {
    createMutation.mutate(formValues);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          to="/issues"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Issues
        </Link>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Create New Issue
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-450 mt-0.5">
              Log a new bug report or feature request
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <IssueForm
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        submitButtonText="Create Issue"
      />
    </div>
  );
};

export default IssueCreate;
