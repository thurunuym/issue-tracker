import axiosInstance from './axiosInstance';

export const authApi = {
  register: async (payload: any) => {
    const res = await axiosInstance.post('/auth/register', payload);
    return res.data;
  },
  login: async (payload: any) => {
    const res = await axiosInstance.post('/auth/login', payload);
    return res.data;
  },
  logout: async () => {
    const res = await axiosInstance.post('/auth/logout');
    return res.data;
  },
};

export default authApi;
