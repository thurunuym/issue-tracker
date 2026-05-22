import { useAppDispatch, useAppSelector } from '../app/store';
import { setExportStatus } from '../features/issues/issueSlice';
import issuesApi from '../services/issuesApi';
import toast from 'react-hot-toast';

export const useExport = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.issues.filters);
  const exportStatus = useAppSelector((state) => state.issues.exportStatus);

  const exportData = async (format: 'csv' | 'json') => {
    dispatch(setExportStatus('loading'));
    const loadToast = toast.loading(`Exporting issues as ${format.toUpperCase()}...`);
    try {
      // Exclude page and limit from export requests to download all matching tickets
      const exportParams = { ...filters };
      delete (exportParams as any).page;
      delete (exportParams as any).limit;

      const blobData = await issuesApi.exportIssues(exportParams, format);
      
      const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
      const fileExtension = format;

      const blob = new Blob([blobData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `issues-${Date.now()}.${fileExtension}`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      dispatch(setExportStatus('done'));
      toast.success(`Exported successfully as ${format.toUpperCase()}!`, { id: loadToast });
    } catch (err: any) {
      console.error(err);
      dispatch(setExportStatus('error'));
      toast.error('Failed to export issues. Please try again.', { id: loadToast });
    }
  };

  return {
    exportData,
    exportStatus,
  };
};

export default useExport;
