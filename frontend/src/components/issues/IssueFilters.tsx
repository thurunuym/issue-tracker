import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { setFilters } from '../../features/issues/issueSlice';
import useDebounce from '../../hooks/useDebounce';
import Input from '../ui/Input';
import Select from '../ui/Select';

export const IssueFilters: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.issues.filters);

  // Maintain local search state for fluid, non-blocking typing
  const [searchValue, setSearchValue] = useState(filters.q);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Is the debounce still pending?
  const isSearchPending = searchValue !== debouncedSearch;

  // Sync debounced search to Redux
  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      dispatch(setFilters({ q: debouncedSearch, page: 1 }));
    }
  }, [debouncedSearch, filters.q, dispatch]);

  // Sync external filter resets back to local state
  useEffect(() => {
    setSearchValue(filters.q);
  }, [filters.q]);

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value, page: 1 }));
  };

  const statusOpts = [
    { label: 'All Statuses', value: '' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' },
  ];

  const priorityOpts = [
    { label: 'All Priorities', value: '' },
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Critical', value: 'Critical' },
  ];

  const severityOpts = [
    { label: 'All Severities', value: '' },
    { label: 'Minor', value: 'Minor' },
    { label: 'Major', value: 'Major' },
    { label: 'Critical', value: 'Critical' },
  ];

  // Focus shortcut registration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '/' focuses search
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('issue-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5 bg-white dark:bg-gray-901 p-5 border border-gray-150 dark:border-gray-800 rounded-xl shadow-sm">
      <div className="relative">
        <Input
          id="issue-search"
          placeholder="Search by title & description... (press '/')"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9.5"
        />
        <div className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500 pointer-events-none">
          {isSearchPending ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-blue-500" />
          ) : (
            <Search className="h-4.5 w-4.5" />
          )}
        </div>
      </div>

      <Select
        name="status"
        options={statusOpts}
        value={filters.status}
        onChange={handleDropdownChange}
      />

      <Select
        name="priority"
        options={priorityOpts}
        value={filters.priority}
        onChange={handleDropdownChange}
      />

      <Select
        name="severity"
        options={severityOpts}
        value={filters.severity}
        onChange={handleDropdownChange}
      />
    </div>
  );
};

export default IssueFilters;
