import axios from 'axios';
import { store } from '../app/store';
import { updateAccessToken, logout } from '../features/auth/authSlice';

const apiBase = import.meta.env.VITE_API_URL || '/api';

export const axiosInstance = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${apiBase}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = res.data;
        
        store.dispatch(updateAccessToken(accessToken));
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        // Redirect if on client
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
