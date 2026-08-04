import axios from 'axios';

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

// Retry idempotent GETs on transient failures (network timeout, cold-start 5xx)
// so a slow Render boot or a dropped connection doesn't nuke the session.
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

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  googleAuth: (payload) => api.post('/auth/google', typeof payload === 'string' ? { credential: payload } : payload),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
  deleteAccount: () => api.delete('/auth/account'),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
};

export const employerService = {
  login: (email, password) => api.post('/employer/auth/login', { email, password }),
  register: (data) => api.post('/employer/auth/register', data),
  verifyOtp: (email, otp) => api.post('/employer/auth/verify-email', { email, otp }),
  resendOtp: (email) => api.post('/employer/auth/resend-otp', { email }),
  forgotPassword: (email) => api.post('/employer/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/employer/auth/reset-password', { token, password }),
  logout: () => api.post('/employer/auth/logout'),
  getCurrentEmployer: () => api.get('/employer/auth/me'),
  getProfile: () => api.get('/employer/profile'),
  updateProfile: (profileData) => api.put('/employer/profile', profileData),
  getNotifications: () => api.get('/employer/dashboard/notifications'),
  markNotificationsRead: () => api.post('/employer/dashboard/notifications/read'),
};

export const jobService = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getSavedJobIds: () => api.get('/saved'),
  saveJob: (jobId) => api.post(`/saved/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/saved/${jobId}`),
  getAppliedJobIds: () => api.get('/applied'),
  getAppliedJobDetails: () => api.get('/applied/details'),
  getInterviews: () => api.get('/applied/interviews'),
  applyToJob: (jobId) => api.post(`/applied/${jobId}`),
};

export const messageService = {
  getConversations: () => api.get('/messages/conversations'),
  getThread: (employerId) => api.get(`/messages/employer/${employerId}`),
  sendMessage: (employerId, content) => api.post(`/messages/employer/${employerId}`, { content }),
  getUnreadCount: () => api.get('/messages/unread'),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAllRead: () => api.post('/notifications/read'),
  markRead: (id) => api.post(`/notifications/${id}/read`),
};

const getDefaultResumeTemplate = (session) => ({
  personalInfo: {
    fullName: session?.name || '',
    email: session?.email || '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    dob: '',
    gender: '',
    photo: '',
  },
  education: [],
  experience: [],
  internship: [],
  projects: [],
  certifications: [],
  skills: [],
  achievements: [],
  languages: [],
  interests: [],
});

export const resumeService = {
  getResume: async () => {
    try {
      const res = await api.get('/resume');
      if (res.data?.data) {
        return res;
      }
    } catch {
      // fall through to default
    }
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    return { data: { data: getDefaultResumeTemplate(session) } };
  },

  saveResume: async (resumeData) => {
    return api.put('/resume', { resumeData });
  },

  getTemplates: async () => {
    return api.get('/resume/templates');
  }
};
