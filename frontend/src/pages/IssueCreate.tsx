import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Ticket } from 'lucide-react';
import issuesApi from '../services/issuesApi';
import IssueForm from '../components/issues/IssueForm';
import toast from 'react-hot-toast';

export const IssueCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create mutation
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
      toast.success('Ticket created successfully!');
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issueStats'] });
      // Reroute to newly logged ticket — backend returns { issue: ... }
      const issue = data.issue || data;
      navigate(`/issues/${issue._id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Access Denied: Inadequate authorization to log tickets.');
    },
  });

  const handleCreateSubmit = (formValues: any) => {
    createMutation.mutate(formValues);
  };

  return (
    <div className="space-y-6 text-left p-1 animate-fadeIn">
      {/* Title */}
      <div className="space-y-2 border-b border-gray-150 pb-5 dark:border-gray-800">
        <Link
          to="/issues"
          className="inline-flex items-center text-xs font-semibold text-gray-550 hover:text-blue-500 hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to list
        </Link>
        <div className="flex items-center space-x-2">
          <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-450" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-901 dark:text-white tracking-tight">
            Log New Issue Ticket
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <IssueForm
          onSubmit={handleCreateSubmit}
          isLoading={createMutation.isPending}
          submitButtonText="Submit New Issue"
        />
      </div>
    </div>
  );
};

export default IssueCreate;
