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

    const resumes = JSON.parse(localStorage.getItem('jobportal_user_resumes')) || {};
    let userResume = resumes[session.id];

    if (!userResume) {
      const defaultTemplate = {
        personalInfo: {
          fullName: session.name || '',
          email: session.email,
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          website: '',
          summary: ''
        },
        education: [],
        experience: [],
        internship: [],
        projects: [],
        certifications: [],   // each cert: { name, organization, year, link }
        skills: []
      };
      userResume = defaultTemplate;
      resumes[session.id] = userResume;
      localStorage.setItem('jobportal_user_resumes', JSON.stringify(resumes));
    }

    return { data: userResume };
  },

  saveResume: async (resumeData) => {
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');

    const resumes = JSON.parse(localStorage.getItem('jobportal_user_resumes')) || {};
    resumes[session.id] = resumeData;
    localStorage.setItem('jobportal_user_resumes', JSON.stringify(resumes));

    return { data: resumeData };
  }
};
