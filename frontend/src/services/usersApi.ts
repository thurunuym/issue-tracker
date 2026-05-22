import axiosInstance from './axiosInstance';

export const usersApi = {
  getUsers: async () => {
    const res = await axiosInstance.get('/users');
    return res.data;
  },
  updateUser: async (id: string, payload: any) => {
    const res = await axiosInstance.patch(`/users/${id}`, payload);
    return res.data;
  },
};

export default usersApi;
