import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Auth remains in localStorage (not affected by backend)
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email, password) => {
    await delay();
    const users = JSON.parse(localStorage.getItem('jobportal_users')) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found. Please register.');
    if (user.password !== password) throw new Error('Incorrect password. Please try again.');
    localStorage.setItem('jobportal_session', JSON.stringify(user));
    return { data: user };
  },

  register: async (name, email, password) => {
    await delay();
    const users = JSON.parse(localStorage.getItem('jobportal_users')) || [];
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('Email is already registered. Please login.');
    const newUser = { id: Date.now().toString(), name, email, password, profileCompleted: false, profileData: null };
    users.push(newUser);
    localStorage.setItem('jobportal_users', JSON.stringify(users));
    localStorage.setItem('jobportal_session', JSON.stringify(newUser));
    return { data: newUser };
  },

  getCurrentUser: async () => {
    await delay(100);
    const session = localStorage.getItem('jobportal_session');
    return { data: session ? JSON.parse(session) : null };
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem('jobportal_session');
    return { data: { success: true } };
  },

  googleAuth: async (googleUser) => {
    await delay();
    const users = JSON.parse(localStorage.getItem('jobportal_users')) || [];
    const existing = users.find(u => u.googleId === googleUser.sub);
    if (existing) {
      localStorage.setItem('jobportal_session', JSON.stringify(existing));
      return { data: existing, isNew: false };
    }
    const newUser = {
      id: Date.now().toString(),
      name: googleUser.name,
      email: googleUser.email,
      password: '',
      googleId: googleUser.sub,
      picture: googleUser.picture,
      profileCompleted: false,
      profileData: null
    };
    users.push(newUser);
    localStorage.setItem('jobportal_users', JSON.stringify(users));
    localStorage.setItem('jobportal_session', JSON.stringify(newUser));
    return { data: newUser, isNew: true };
  },

  updateProfile: async (profileData) => {
    await delay();
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');
    const users = JSON.parse(localStorage.getItem('jobportal_users'));
    const idx = users.findIndex(u => u.id === session.id);
    if (idx === -1) throw new Error('User not found.');
    const updatedUser = { ...users[idx], profileCompleted: true, profileData };
    users[idx] = updatedUser;
    localStorage.setItem('jobportal_users', JSON.stringify(users));
    localStorage.setItem('jobportal_session', JSON.stringify(updatedUser));
    return { data: updatedUser };
  }
};

export const jobService = {
  getAllJobs: async () => {
    const res = await api.get('/jobs');
    return { data: res.data.data };
  },

  getJobById: async (id) => {
    const res = await api.get(`/jobs/${id}`);
    return { data: res.data.data };
  },

  getSavedJobIds: async () => {
    const session = localStorage.getItem('jobportal_session');
    if (!session) return { data: [] };
    const parsed = JSON.parse(session);
    const saved = JSON.parse(localStorage.getItem('jobportal_saved_jobs')) || [];
    return { data: saved.filter(s => s.userId === parsed.id).map(s => s.jobId) };
  },

  saveJob: async (jobId) => {
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('You must be logged in to save jobs.');
    const saved = JSON.parse(localStorage.getItem('jobportal_saved_jobs')) || [];
    if (!saved.some(s => s.userId === session.id && s.jobId === jobId)) {
      saved.push({ userId: session.id, jobId });
      localStorage.setItem('jobportal_saved_jobs', JSON.stringify(saved));
    }
    return { data: { success: true } };
  },

  unsaveJob: async (jobId) => {
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('You must be logged in to save jobs.');
    let saved = JSON.parse(localStorage.getItem('jobportal_saved_jobs')) || [];
    saved = saved.filter(s => !(s.userId === session.id && s.jobId === jobId));
    localStorage.setItem('jobportal_saved_jobs', JSON.stringify(saved));
    return { data: { success: true } };
  },

  getAppliedJobIds: async () => {
    const session = localStorage.getItem('jobportal_session');
    if (!session) return { data: [] };
    const parsed = JSON.parse(session);
    const applied = JSON.parse(localStorage.getItem('jobportal_applied_jobs')) || [];
    return { data: applied.filter(a => a.userId === parsed.id).map(a => a.jobId) };
  },

  applyToJob: async (jobId) => {
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('You must be logged in to apply.');
    const applied = JSON.parse(localStorage.getItem('jobportal_applied_jobs')) || [];
    if (!applied.some(a => a.userId === session.id && a.jobId === jobId)) {
      applied.push({ userId: session.id, jobId, appliedAt: new Date().toISOString() });
      localStorage.setItem('jobportal_applied_jobs', JSON.stringify(applied));
    }
    return { data: { success: true } };
  }
};

export const resumeService = {
  getResume: async () => {
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');

    const resumes = JSON.parse(localStorage.getItem('jobportal_user_resumes')) || {};
    let userResume = resumes[session.id];

    if (!userResume) {
      const defaultTemplate = {
        personalInfo: { fullName: session.name || '', email: session.email, phone: '', location: '', linkedin: '', portfolio: '', title: '', summary: '' },
        education: [],
        experience: [],
        projects: [],
        skills: []
      };
      userResume = {
        ...defaultTemplate,
        personalInfo: {
          ...defaultTemplate.personalInfo,
          fullName: session.profileData?.fullName || session.name,
          email: session.email,
          location: session.profileData?.preferredLocation || ''
        }
      };
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
