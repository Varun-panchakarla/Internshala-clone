import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

export const jobService = {
  getAllJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getSavedJobIds: () => api.get('/saved'),
  saveJob: (jobId) => api.post(`/saved/${jobId}`),
  unsaveJob: (jobId) => api.delete(`/saved/${jobId}`),
  getAppliedJobIds: () => api.get('/applied'),
  applyToJob: (jobId) => api.post(`/applied/${jobId}`),
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
