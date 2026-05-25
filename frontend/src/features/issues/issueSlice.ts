import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface IssueFilters {
  status: string;
  priority: string;
  severity: string;
  q: string;
  page: number;
  limit: number;
}

export interface IssueState {
  filters: IssueFilters;
  selectedIssueId: string | null;
  exportStatus: 'idle' | 'loading' | 'done' | 'error';
}

const initialState: IssueState = {
  filters: {
    status: '',
    priority: '',
    severity: '',
    q: '',
    page: 1,
    limit: 8,
  },
  selectedIssueId: null,
  exportStatus: 'idle',
};

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<IssueFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
        // Reset page if we filter something other than page itself to avoid getting stick on empty pages
        page: action.payload.page !== undefined ? action.payload.page : 1,
      };
    },
    setPageOnly(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    resetFilters(state) {
      state.filters = {
        status: '',
        priority: '',
        severity: '',
        q: '',
        page: 1,
        limit: 8,
      };
    },
    setSelectedIssueId(state, action: PayloadAction<string | null>) {
      state.selectedIssueId = action.payload;
    },
    setExportStatus(state, action: PayloadAction<'idle' | 'loading' | 'done' | 'error'>) {
      state.exportStatus = action.payload;
    },
  },
});

export const { setFilters, setPageOnly, resetFilters, setSelectedIssueId, setExportStatus } = issueSlice.actions;
export default issueSlice.reducer;
