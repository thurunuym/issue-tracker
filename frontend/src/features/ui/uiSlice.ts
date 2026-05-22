import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModal: string | null;
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return 'light'; // default light theme
};

const initialState: UiState = {
  theme: getInitialTheme(),
  sidebarOpen: true,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('theme', state.theme);
      }
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('theme', action.payload);
      }
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar, setSidebarOpen, setActiveModal } = uiSlice.actions;
export default uiSlice.reducer;
