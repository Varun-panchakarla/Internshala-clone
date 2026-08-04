import axios from 'axios';
import { tokenStorage } from './mockApi';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1200;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
});

// This service is only used by the recruiter workspace, so it always attaches
// the employer JWT. Sending the token as an Authorization header keeps sessions
// alive across refreshes even when the cookie is blocked (cross-origin static host).
api.interceptors.request.use((config) => {
  const token = tokenStorage.getEmployer();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry idempotent GETs on transient failures (network timeout, cold-start 5xx).
const shouldRetry = (error) => {
  if (!error.config) return false;
  if (error.config.method !== 'get') return false;
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;
    if (!config || !shouldRetry(error)) {
      return Promise.reject(error);
    }
    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= MAX_RETRIES) {
      return Promise.reject(error);
    }
    config.__retryCount += 1;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * config.__retryCount));
    return api.request(config);
  }
);

export const employerDashboardService = {
  getMetrics: () => api.get('/employer/dashboard/metrics'),
  getJobs: () => api.get('/employer/dashboard/jobs'),
  postJob: (data) => api.post('/employer/dashboard/jobs', data),
  updateJob: (id, data) => api.put(`/employer/dashboard/jobs/${id}`, data),
  toggleJob: (id, isActive) => api.post(`/employer/dashboard/jobs/${id}/toggle`, { isActive }),
  deleteJob: (id) => api.delete(`/employer/dashboard/jobs/${id}`),

  getApplications: () => api.get('/employer/dashboard/applications'),
  getApplicantsForJob: (jobId) => api.get(`/employer/dashboard/applicants/${jobId}`),
  getApplicantDetail: (applicationId) => api.get(`/employer/dashboard/applicants/${applicationId}/detail`),
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
