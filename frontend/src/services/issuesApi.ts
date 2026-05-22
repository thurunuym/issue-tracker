import axiosInstance from './axiosInstance';

export const issuesApi = {
  getIssues: async (params: any) => {
    const res = await axiosInstance.get('/issues', { params });
    return res.data;
  },
  getIssueById: async (id: string) => {
    const res = await axiosInstance.get(`/issues/${id}`);
    return res.data;
  },
  getIssueStats: async () => {
    const res = await axiosInstance.get('/issues/stats');
    return res.data;
  },
  createIssue: async (payload: any) => {
    const res = await axiosInstance.post('/issues', payload);
    return res.data;
  },
  updateIssue: async (id: string, payload: any) => {
    const res = await axiosInstance.patch(`/issues/${id}`, payload);
    return res.data;
  },
  deleteIssue: async (id: string) => {
    const res = await axiosInstance.delete(`/issues/${id}`);
    return res.data;
  },
  addAttachments: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await axiosInstance.post(`/issues/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  deleteAttachment: async (id: string, publicId: string) => {
    const res = await axiosInstance.delete(`/issues/${id}/attachments/${publicId}`);
    return res.data;
  },
  getIssueActivities: async (id: string) => {
    const res = await axiosInstance.get(`/issues/${id}/activity`);
    return res.data;
  },
  addComment: async (id: string, message: string) => {
    const res = await axiosInstance.post(`/issues/${id}/comments`, { message });
    return res.data;
  },
  exportIssues: async (params: any, format: 'csv' | 'json') => {
    const res = await axiosInstance.get('/issues/export', {
      params: { ...params, format },
      responseType: 'blob', // crucial to load raw file streams
    });
    return res.data;
  },
};

export default issuesApi;
