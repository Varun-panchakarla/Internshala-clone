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

export const resumeService = {
  getResume: async () => {
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');

    const res = await api.get('/resume', {
      params: { 
        userId: session.id,
        name: session.name,
        email: session.email
      }
    });
    
    return { data: res.data.data };
  },

  saveResume: async (resumeData) => {
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');

    const res = await api.post('/resume', {
      userId: session.id,
      resumeData
    });

    return { data: res.data.data };
  }
};
