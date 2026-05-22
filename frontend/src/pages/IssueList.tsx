import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, FileJson, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { setPageOnly, resetFilters } from '../features/issues/issueSlice';
import { useExport } from '../hooks/useExport';
import usePermission from '../hooks/usePermission';
import issuesApi from '../services/issuesApi';
import IssueFilters from '../components/issues/IssueFilters';
import IssueTable from '../components/issues/IssueTable';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export const IssueList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Retrieve current filters and pager offsets out of Redux
  const filters = useAppSelector((state) => state.issues.filters);

  const { exportData, exportStatus } = useExport();

  const canCreate = usePermission('issue:create');

  // Modal deletion confirmation states
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Hook up issues list fetcher via TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['issues', filters],
    queryFn: () => issuesApi.getIssues(filters),
    placeholderData: (previousData) => previousData, // smooth user experience when switching pages
  });

  // Mutator for deleting issues
  const deleteMutation = useMutation({
    mutationFn: (id: string) => issuesApi.deleteIssue(id),
    onSuccess: () => {
      toast.success('Issue deleted successfully.');
      setDeleteId(null);
      // Invalidate issues cache to force-update list
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Unauthorized: You do not have permission to delete this ticket.';
      toast.error(msg);
      setDeleteId(null);
    },
  });

  const handlePageChange = (page: number) => {
    dispatch(setPageOnly(page));
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const issues = data?.issues || [];
  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-6 text-left p-1">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-8">
            Issues Registry
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-0.5">
            Log, track, and export software bugs or requests
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('csv')}
            disabled={exportStatus === 'loading'}
            className="text-xs shrink-0"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => exportData('json')}
            disabled={exportStatus === 'loading'}
            className="text-xs shrink-0"
          >
            <FileJson className="h-4 w-4 mr-1.5" />
            Export JSON
          </Button>

          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/issues/create')}
              className="text-sm font-semibold h-9 shrink-0 shadow-md"
            >
              <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" />
              Create Issue
            </Button>
          )}
        </div>
      </div>

      {/* Filter controls panel */}
      <IssueFilters />

      {/* Issues Table loading/failures/display layouts */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-150 rounded-xl dark:bg-gray-901 dark:border-gray-800">
          <Spinner size="md" />
          <p className="mt-3 text-sm text-gray-400 font-medium">Re-indexing issues...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-350 rounded-xl">
          <h3 className="font-bold flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-1.5 text-current" />
            Failed to parse issues registry
          </h3>
          <p className="text-sm mt-1">Please ensure you are authenticated or try reloading the grid list.</p>
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          title="No matching issues found"
          description="We couldn't find any issues matching your search filters. Try adjusting your status or search text."
          action={
            <Button variant="secondary" size="sm" onClick={() => dispatch(resetFilters())}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <IssueTable issues={issues} onDeleteRequest={(id) => setDeleteId(id)} />
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Deletion Warning Dialog Modal (AlertDialog) */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tracker Issue"
        description="Are you absolutely sure you want to delete this issue? This will move it to trash and log an audit trail entry. This action cannot be undone."
        confirmText="Permanently Delete"
        cancelText="Keep Issue"
        variant="danger"
        isConfirmLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default IssueList;
