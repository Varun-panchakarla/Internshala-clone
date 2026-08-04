import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const employerDashboardService = {
  getMetrics: () => api.get('/employer/dashboard/metrics'),
  getJobs: () => api.get('/employer/dashboard/jobs'),
  postJob: (data) => api.post('/employer/dashboard/jobs', data),
  updateJob: (id, data) => api.put(`/employer/dashboard/jobs/${id}`, data),
  toggleJob: (id, isActive) => api.post(`/employer/dashboard/jobs/${id}/toggle`, { isActive }),
  deleteJob: (id) => api.delete(`/employer/dashboard/jobs/${id}`),

  getApplications: () => api.get('/employer/dashboard/applications'),
  getApplicantsForJob: (jobId) => api.get(`/employer/dashboard/applicants/${jobId}`),
  getResume: (applicationId) => api.get(`/employer/dashboard/applicants/${applicationId}/resume`),
  updateApplicationStatus: (applicationId, status) =>
    api.post(`/employer/dashboard/applications/${applicationId}/status`, { status }),

  getInterviews: (from, to) =>
    api.get('/employer/dashboard/interviews', {
      params: { from: from || undefined, to: to || undefined }
    }),
  scheduleInterview: (data) => api.post('/employer/dashboard/interviews/schedule', data),
  updateInterview: (id, data) => api.put(`/employer/dashboard/interviews/${id}`, data),

  getNotifications: () => api.get('/employer/dashboard/notifications'),
  markNotificationsRead: () => api.post('/employer/dashboard/notifications/read'),

  getCompany: () => api.get('/employer/dashboard/company'),
  getAnalytics: () => api.get('/employer/dashboard/analytics'),

  getEmployerConversations: () => api.get('/messages/employer-conversations'),
  getEmployerThread: (userId) => api.get(`/messages/employer-thread/${userId}`),
  sendEmployerMessage: (userId, content) =>
    api.post(`/messages/employer-send/${userId}`, { content }),
  getEmployerUnread: () => api.get('/messages/employer-unread')
};
