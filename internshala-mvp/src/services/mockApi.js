import initialUsers from '../data/users.json';
import initialJobs from '../data/jobs.json';
import initialResume from '../data/resume.json';

// Initialize localStorage databases if empty
const initDatabase = () => {
  if (!localStorage.getItem('jobportal_users')) {
    localStorage.setItem('jobportal_users', JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem('jobportal_jobs')) {
    localStorage.setItem('jobportal_jobs', JSON.stringify(initialJobs));
  }
  if (!localStorage.getItem('jobportal_resume')) {
    localStorage.setItem('jobportal_resume', JSON.stringify(initialResume));
  }
  if (!localStorage.getItem('jobportal_saved_jobs')) {
    localStorage.setItem('jobportal_saved_jobs', JSON.stringify([]));
  }
  if (!localStorage.getItem('jobportal_applied_jobs')) {
    localStorage.setItem('jobportal_applied_jobs', JSON.stringify([]));
  }
};

initDatabase();

// Simulated network delay (ms)
const SIMULATED_DELAY = 400;
const delay = (ms = SIMULATED_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  login: async (email, password) => {
    await delay();
    const users = JSON.parse(localStorage.getItem('jobportal_users'));
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('User not found. Please register.');
    }
    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Set active session
    localStorage.setItem('jobportal_session', JSON.stringify(user));
    return { data: user };
  },

  register: async (name, email, password) => {
    await delay();
    const users = JSON.parse(localStorage.getItem('jobportal_users'));
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      throw new Error('Email is already registered. Please login.');
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      profileCompleted: false,
      profileData: null
    };

    users.push(newUser);
    localStorage.setItem('jobportal_users', JSON.stringify(users));
    localStorage.setItem('jobportal_session', JSON.stringify(newUser));

    return { data: newUser };
  },

  getCurrentUser: async () => {
    await delay(100);
    const session = localStorage.getItem('jobportal_session');
    return session ? { data: JSON.parse(session) } : { data: null };
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem('jobportal_session');
    return { data: { success: true } };
  },

  updateProfile: async (profileData) => {
    await delay();
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');

    const users = JSON.parse(localStorage.getItem('jobportal_users'));
    const userIndex = users.findIndex(u => u.id === session.id);

    if (userIndex === -1) throw new Error('User not found.');

    const updatedUser = {
      ...users[userIndex],
      profileCompleted: true,
      profileData
    };

    users[userIndex] = updatedUser;
    localStorage.setItem('jobportal_users', JSON.stringify(users));
    localStorage.setItem('jobportal_session', JSON.stringify(updatedUser));

    return { data: updatedUser };
  }
};

export const jobService = {
  getAllJobs: async () => {
    await delay();
    const jobs = JSON.parse(localStorage.getItem('jobportal_jobs'));
    return { data: jobs };
  },

  getJobById: async (id) => {
    await delay(200);
    const jobs = JSON.parse(localStorage.getItem('jobportal_jobs'));
    const job = jobs.find(j => j.id === id);
    if (!job) throw new Error('Job not found.');
    return { data: job };
  },

  getSavedJobIds: async () => {
    await delay(100);
    const saved = JSON.parse(localStorage.getItem('jobportal_saved_jobs')) || [];
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) return { data: [] };
    const userSaved = saved.filter(s => s.userId === session.id).map(s => s.jobId);
    return { data: userSaved };
  },

  saveJob: async (jobId) => {
    await delay(150);
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('You must be logged in to save jobs.');

    const saved = JSON.parse(localStorage.getItem('jobportal_saved_jobs')) || [];
    const alreadySaved = saved.some(s => s.userId === session.id && s.jobId === jobId);

    if (!alreadySaved) {
      saved.push({ userId: session.id, jobId });
      localStorage.setItem('jobportal_saved_jobs', JSON.stringify(saved));
    }
    return { data: { success: true } };
  },

  unsaveJob: async (jobId) => {
    await delay(150);
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('You must be logged in to save jobs.');

    let saved = JSON.parse(localStorage.getItem('jobportal_saved_jobs')) || [];
    saved = saved.filter(s => !(s.userId === session.id && s.jobId === jobId));
    localStorage.setItem('jobportal_saved_jobs', JSON.stringify(saved));
    return { data: { success: true } };
  },

  getAppliedJobIds: async () => {
    await delay(100);
    const applied = JSON.parse(localStorage.getItem('jobportal_applied_jobs')) || [];
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) return { data: [] };
    const userApplied = applied.filter(a => a.userId === session.id).map(a => a.jobId);
    return { data: userApplied };
  },

  applyToJob: async (jobId) => {
    await delay(200);
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('You must be logged in to apply for jobs.');

    const applied = JSON.parse(localStorage.getItem('jobportal_applied_jobs')) || [];
    const alreadyApplied = applied.some(a => a.userId === session.id && a.jobId === jobId);

    if (!alreadyApplied) {
      applied.push({ userId: session.id, jobId, appliedAt: new Date().toISOString() });
      localStorage.setItem('jobportal_applied_jobs', JSON.stringify(applied));
    }
    return { data: { success: true } };
  }
};

export const resumeService = {
  getResume: async () => {
    await delay(200);
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');

    const resumes = JSON.parse(localStorage.getItem('jobportal_user_resumes')) || {};
    let userResume = resumes[session.id];

    if (!userResume) {
      // Return template prefilled with user name if profile completed
      const defaultTemplate = JSON.parse(localStorage.getItem('jobportal_resume'));
      userResume = {
        ...defaultTemplate,
        personalInfo: {
          ...defaultTemplate.personalInfo,
          fullName: session.profileData?.fullName || session.name,
          email: session.email,
          location: session.profileData?.preferredLocation || defaultTemplate.personalInfo.location
        }
      };
      resumes[session.id] = userResume;
      localStorage.setItem('jobportal_user_resumes', JSON.stringify(resumes));
    }

    return { data: userResume };
  },

  saveResume: async (resumeData) => {
    await delay();
    const session = JSON.parse(localStorage.getItem('jobportal_session'));
    if (!session) throw new Error('Unauthenticated user session.');

    const resumes = JSON.parse(localStorage.getItem('jobportal_user_resumes')) || {};
    resumes[session.id] = resumeData;
    localStorage.setItem('jobportal_user_resumes', JSON.stringify(resumes));

    return { data: resumeData };
  }
};
