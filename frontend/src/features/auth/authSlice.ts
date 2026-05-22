import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  accessToken: string | null;
  permissions: string[];
  role: 'admin' | 'user' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  permissions: [],
  role: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: any;
        accessToken: string;
        role: 'admin' | 'user';
        permissions: string[];
      }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
      state.permissions = action.payload.permissions;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    updateAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, updateAccessToken, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
