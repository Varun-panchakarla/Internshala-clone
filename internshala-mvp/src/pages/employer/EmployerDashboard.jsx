import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import {
  FiBriefcase,
  FiUsers,
  FiTrendingUp,
  FiCheckSquare,
  FiPlus,
  FiGlobe,
  FiMapPin,
  FiLogOut,
  FiShield,
  FiClock,
  FiLayers,
  FiList,
  FiCalendar,
  FiBell,
  FiEdit2,
  FiSearch,
  FiFileText,
  FiDownload,
  FiExternalLink,
  FiMail,
  FiPhone,
  FiX,
  FiBookOpen,
  FiAward,
  FiCheck,
  FiTrash2,
  FiInfo,
  FiUser,
  FiChevronDown,
  FiSettings,
  FiGrid,
  FiMessageSquare,
  FiSend
} from 'react-icons/fi';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import ThemeToggle from '../../components/common/ThemeToggle';
import { employerService } from '../../services/mockApi';

const dataUrlToBlob = (dataUrl) => {
  const parts = String(dataUrl || '').split(',');
  const meta = parts[0] || '';
  const mime = (meta.match(/:(.*?);/) || [])[1] || 'application/pdf';
  const byteString = atob(parts[1] || '');
  const ab = new ArrayBuffer(byteString.length);
  const u8 = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) u8[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type: mime });
};

const formatISODate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatTime = (iso) =>
  new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const formatDay = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const getCandidateSkills = (candidate) => {
  if (!candidate) return [];
  if (Array.isArray(candidate.skills)) return candidate.skills.map(s => String(s).trim()).filter(Boolean);
  return String(candidate.skills || '').split(',').map(s => s.trim()).filter(Boolean);
};

const getInitials = (name) => String(name || '?').split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';

// Convert an ISO timestamp into the value expected by <input type="datetime-local">
const toDatetimeLocal = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const EmployerDashboard = () => {
  const { currentEmployer, logout, updateEmployerProfile } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    shortlistedMatches: 0,
    todayInterviews: 0,
    trends: {
      activeJobsTrend: '+0 this week',
      totalApplicantsTrend: '+0 total',
      shortlistedMatchesTrend: '+0 matches',
      todayInterviewsTrend: '0 scheduled today'
    }
  });
  
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState({
    jobWiseApplicants: [],
    dailyTrend: [],
    monthlyTrend: [],
    hiringPipeline: []
  });

  const [searchTerm, setSearchTerm] = useState('');

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifUnread, setNotifUnread] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [conversations, setConversations] = useState([]);
  const [recruiterUnreadMessages, setRecruiterUnreadMessages] = useState(0);
  const [allApplications, setAllApplications] = useState([]);
  const messagesEndRef = useRef(null);
  const [profileForm, setProfileForm] = useState({
    companyName: currentEmployer?.companyName || '',
    recruiterName: currentEmployer?.recruiterName || '',
    companyLogo: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    linkedin: '',
    description: '',
    headquarters: '',
    officeLocations: '',
    hiringLocations: '',
    workMode: 'Remote',
    designation: '',
    department: '',
    officialPhone: ''
  });

  const notifRef = React.useRef(null);
  const profileDropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to bottom of messages when chatMessages updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Poll for messages in background
  useEffect(() => {
    if (!currentEmployer) return;
    const fetchUnreadAndConvs = async () => {
      try {
        const [unreadRes, convsRes] = await Promise.all([
          axios.get('/api/messages/employer-unread'),
          axios.get('/api/messages/employer-conversations')
        ]);
        setRecruiterUnreadMessages(unreadRes.data.count || 0);
        setConversations(convsRes.data.conversations || []);
      } catch {
        /* ignore */
      }
    };
    fetchUnreadAndConvs();
    const interval = setInterval(fetchUnreadAndConvs, 15000);
    return () => clearInterval(interval);
  }, [currentEmployer]);

  const handleOpenNotifs = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && notifUnread > 0) {
      setNotifUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      try {
        await employerService.markNotificationsRead();
      } catch (err) {
        console.error('Failed to mark recruiter notifications as read:', err);
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEmployerProfile(profileForm);
      addToast('Profile updated successfully!', 'success');
      setIsProfileModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update profile.', 'error');
    }
  };

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobModalMode, setJobModalMode] = useState('create'); // 'create' or 'edit'
  const [editingJobId, setEditingJobId] = useState(null);
  
  // Job Form state
  const [jobForm, setJobForm] = useState({
    title: '',
    companyName: currentEmployer?.companyName || '',
    location: '',
    salaryRange: '',
    experienceRequired: '',
    employmentType: 'Full-time',
    skills: '',
    description: '',
    lastDateToApply: ''
  });

  // Calendar modal state
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarInterviews, setCalendarInterviews] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalDate, setSelectedCalDate] = useState('');
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Chat modal state
  const [chatCandidate, setChatCandidate] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  // Applicants List modal state
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
  const [activeJobForApplicants, setActiveJobForApplicants] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // Selected Candidate Profile modal state
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Schedule Interview modal state
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    id: null, // null = create, set = updating an existing interview
    candidateEmail: '',
    jobId: '',
    scheduledAt: '',
    round: 'Technical Round',
    status: 'Scheduled'
  });

  // --- INITIAL DATA FETCH ---
  const fetchDashboardData = async () => {
    setLoading(true);
    const defaultMetrics = {
      activeJobs: 0,
      totalApplicants: 0,
      shortlistedMatches: 0,
      todayInterviews: 0,
      trends: {
        activeJobsTrend: '+0 this week',
        totalApplicantsTrend: '+0 total',
        shortlistedMatchesTrend: '+0 matches',
        todayInterviewsTrend: '0 scheduled today'
      }
    };
    // Fetch each endpoint independently so a single failing request
    // (e.g. a stale backend, a 500, or malformed data) cannot blank the
    // entire recruiter dashboard.
    const endpoints = [
      '/api/employer/dashboard/metrics',
      '/api/employer/dashboard/jobs',
      '/api/employer/dashboard/company',
      '/api/employer/dashboard/recent-applications',
      '/api/employer/dashboard/interviews',
      '/api/employer/dashboard/notifications',
      '/api/employer/dashboard/analytics',
      '/api/messages/employer-unread',
      '/api/messages/employer-conversations',
      '/api/employer/dashboard/applications'
    ];
    const settled = await Promise.allSettled(endpoints.map(u => axios.get(u)));
    const data = settled.map(r => (r.status === 'fulfilled' ? r.value.data : {}));
    const [
      metricsData,
      jobsData,
      companyData,
      recentAppsData,
      interviewsData,
      notificationsData,
      analyticsData,
      unreadMsgsData,
      convsData,
      allAppsData
    ] = data;

    try {
      setMetrics(metricsData && typeof metricsData === 'object' && metricsData.activeJobs !== undefined
        ? metricsData
        : defaultMetrics);
      setJobs(Array.isArray(jobsData?.jobs) ? jobsData.jobs : []);
      setRecruiterUnreadMessages(typeof unreadMsgsData?.count === 'number' ? unreadMsgsData.count : 0);
      setConversations(Array.isArray(convsData?.conversations) ? convsData.conversations : []);
      const comp = companyData && typeof companyData === 'object' ? companyData.company || {} : {};
      setCompany(comp);
      setProfileForm({
        companyName: comp.company_name || currentEmployer?.companyName || '',
        recruiterName: comp.recruiter_name || currentEmployer?.recruiterName || '',
        companyLogo: comp.company_logo || '',
        industry: comp.industry || '',
        companySize: comp.company_size || '',
        foundedYear: comp.founded_year || '',
        website: comp.website || '',
        linkedin: comp.linkedin || '',
        description: comp.description || '',
        headquarters: comp.headquarters || '',
        officeLocations: comp.office_locations || '',
        hiringLocations: comp.hiring_locations || '',
        workMode: comp.work_mode || 'Remote',
        designation: comp.designation || '',
        department: comp.department || '',
        officialPhone: comp.official_phone || ''
      });
      setRecentApplications(Array.isArray(recentAppsData?.applications) ? recentAppsData.applications : []);
      setAllApplications(Array.isArray(allAppsData?.applications) ? allAppsData.applications : []);
      setInterviews(Array.isArray(interviewsData?.interviews) ? interviewsData.interviews : []);
      const notifs = Array.isArray(notificationsData?.notifications) ? notificationsData.notifications : [];
      setNotifications(notifs);
      setNotifUnread(notifs.filter(n => !n.read).length);
      setAnalytics(analyticsData && typeof analyticsData === 'object'
        ? analyticsData
        : { jobWiseApplicants: [], dailyTrend: [], monthlyTrend: [], hiringPipeline: [] });
    } catch (err) {
      console.error('[Recruiter Dashboard Render Error]', err);
      addToast('Failed to load some recruiter dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentEmployer) {
      fetchDashboardData();
    }
  }, [currentEmployer]);

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully from recruiter portal.', 'success');
      navigate('/');
    } catch (err) {
      addToast('Failed to log out.', 'error');
    }
  };

  // --- JOB CRUD ACTIONS ---
  const handleOpenPostJob = () => {
    setJobForm({
      title: '',
      companyName: currentEmployer?.companyName || '',
      location: '',
      salaryRange: '',
      experienceRequired: '',
      employmentType: 'Full-time',
      skills: '',
      description: '',
      lastDateToApply: ''
    });
    setJobModalMode('create');
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job) => {
    setJobForm({
      title: job.title,
      companyName: currentEmployer?.companyName || '',
      location: job.location || '',
      salaryRange: job.salary || '',
      experienceRequired: job.experience || '',
      employmentType: job.type || 'Full-time',
      skills: job.skills || '',
      description: job.description || '',
      lastDateToApply: job.lastDateToApply || ''
    });
    setEditingJobId(job.id);
    setJobModalMode('edit');
    setIsJobModalOpen(true);
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.location.trim()) {
      addToast('Job title and location are required.', 'error');
      return;
    }
    
    try {
      if (jobModalMode === 'create') {
        await axios.post('/api/employer/dashboard/jobs', jobForm);
        addToast('Job listing created successfully!', 'success');
      } else {
        await axios.put(`/api/employer/dashboard/jobs/${editingJobId}`, jobForm);
        addToast('Job listing updated successfully!', 'success');
      }
      setIsJobModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to save job listing.', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job listing?')) {
      try {
        await axios.delete(`/api/employer/dashboard/jobs/${jobId}`);
        addToast('Job listing deleted successfully.', 'success');
        fetchDashboardData();
      } catch (err) {
        addToast('Failed to delete job listing.', 'error');
      }
    }
  };

  // --- APPLICANTS AND STATUS HANDLERS ---
  const handleViewApplicants = async (job) => {
    setActiveJobForApplicants(job);
    setIsApplicantsModalOpen(true);
    setApplicantsLoading(true);
    try {
      const res = await axios.get(`/api/employer/dashboard/applicants/${job.id}`);
      setApplicants(res.data.applicants || []);
    } catch (err) {
      addToast('Failed to load applicants list.', 'error');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await axios.post(`/api/employer/dashboard/applications/${applicationId}/status`, { status });
      addToast(`Candidate application status updated to ${status}.`, 'success');
      
      // Update local state to show change instantly
      setApplicants(prev => prev.map(app => app.applicationId === applicationId ? { ...app, status } : app));
      
      // Refresh background data
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  // --- INTERVIEW SCHEDULER ---
  const handleOpenScheduleInterview = (candidate) => {
    setInterviewForm({
      id: null,
      candidateEmail: candidate.email,
      jobId: activeJobForApplicants?.id || jobs[0]?.id || '',
      scheduledAt: '',
      round: 'Technical Round',
      status: 'Scheduled'
    });
    setIsInterviewModalOpen(true);
  };

  // Open the modal pre-filled to update an existing interview.
  const handleEditInterview = (iv) => {
    setInterviewForm({
      id: iv.id,
      candidateEmail: iv.email || '',
      jobId: iv.jobId || '',
      scheduledAt: toDatetimeLocal(iv.scheduledAt),
      round: iv.round || 'Technical Round',
      status: iv.status || 'Scheduled'
    });
    setIsInterviewModalOpen(true);
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!interviewForm.scheduledAt) {
      addToast('Interview date and time are required.', 'error');
      return;
    }
    const isEditing = Boolean(interviewForm.id);
    try {
      if (isEditing) {
        await axios.put(`/api/employer/dashboard/interviews/${interviewForm.id}`, {
          scheduledAt: interviewForm.scheduledAt,
          round: interviewForm.round,
          status: interviewForm.status
        });
        addToast('Interview updated successfully!', 'success');
      } else {
        await axios.post('/api/employer/dashboard/interviews/schedule', interviewForm);
        addToast('Interview scheduled successfully!', 'success');
      }
      setIsInterviewModalOpen(false);
      fetchDashboardData();
      // Refresh calendar data so the month view reflects the change
      if (isCalendarModalOpen) fetchCalendarInterviews(calendarMonth);
    } catch (err) {
      addToast(isEditing ? 'Failed to update interview.' : 'Failed to schedule interview.', 'error');
    }
  };

  // --- JOB CLOSE / REOPEN ---
  const handleToggleJob = async (job) => {
    const currentlyClosed = job.status === 'Closed' || job.status === 'Expired';
    try {
      await axios.post(`/api/employer/dashboard/jobs/${job.id}/toggle`, { isActive: currentlyClosed });
      addToast(currentlyClosed ? 'Job reopened for applications.' : 'Job closed for applications.', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to update job status.', 'error');
    }
  };

  // --- RESUME PREVIEW / DOWNLOAD ---
  const fetchResume = async (candidate) => {
    if (!candidate?.applicationId) {
      return { error: 'No resume file available for this candidate.' };
    }
    try {
      const res = await axios.get(`/api/employer/dashboard/applicants/${candidate.applicationId}/resume`);
      const { fileData, fileName, fileType } = res.data;
      if (!fileData) {
        return { error: 'Candidate has not uploaded a resume file.' };
      }
      return { fileData, fileName, fileType };
    } catch (err) {
      return { error: 'Failed to load resume. Please try again.' };
    }
  };

  const handlePreviewResume = async (candidate) => {
    const resume = await fetchResume(candidate);
    if (resume.error) {
      addToast(resume.error, 'error');
      return;
    }
    const { fileData, fileType, fileName } = resume;
    const previewable = fileType && /pdf|image/.test(fileType);
    if (!previewable) {
      // Non-PDF/non-image files can't render in a tab — download instead
      const a = document.createElement('a');
      a.href = String(fileData).startsWith('data:') ? fileData : URL.createObjectURL(dataUrlToBlob(fileData));
      a.download = fileName || 'resume';
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    const url = URL.createObjectURL(dataUrlToBlob(fileData));
    window.open(url, '_blank');
  };

  const handleDownloadResume = async (candidate) => {
    const resume = await fetchResume(candidate);
    if (resume.error) {
      addToast(resume.error, 'error');
      return;
    }
    const { fileData, fileName } = resume;
    const a = document.createElement('a');
    a.href = String(fileData).startsWith('data:') ? fileData : URL.createObjectURL(dataUrlToBlob(fileData));
    a.download = fileName || 'resume.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // --- CANDIDATE CHAT ---
  const openChat = (candidate) => {
    const targetUserId = candidate?.userId || candidate?.id;
    if (!targetUserId) {
      addToast('Candidate messaging unavailable for this application.', 'error');
      return;
    }
    setChatCandidate(candidate);
    setChatMessages([]);
    setChatText('');
    setChatLoading(true);
    setActiveSection('messages');
    axios.get(`/api/messages/employer-thread/${targetUserId}`)
      .then(res => setChatMessages(res.data.messages || []))
      .catch(() => addToast('Failed to load conversation.', 'error'))
      .finally(() => setChatLoading(false));
  };

  const closeChat = () => {
    setChatCandidate(null);
    setChatMessages([]);
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    const content = chatText.trim();
    const targetUserId = chatCandidate?.userId || chatCandidate?.id;
    if (!content || !targetUserId) return;
    setChatSending(true);
    try {
      const res = await axios.post(`/api/messages/employer-send/${targetUserId}`, { content });
      setChatMessages(prev => [...prev, res.data.message]);
      setChatText('');
      const convsRes = await axios.get('/api/messages/employer-conversations');
      setConversations(convsRes.data.conversations || []);
    } catch (err) {
      addToast('Failed to send message.', 'error');
    } finally {
      setChatSending(false);
    }
  };

  useEffect(() => {
    const targetUserId = chatCandidate?.userId || chatCandidate?.id;
    if (!targetUserId) return;
    const interval = setInterval(() => {
      axios.get(`/api/messages/employer-thread/${targetUserId}`)
        .then(res => setChatMessages(res.data.messages || []))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [chatCandidate?.userId, chatCandidate?.id]);

  // --- INTERVIEW CALENDAR ---
  const fetchCalendarInterviews = async (month) => {
    setCalendarLoading(true);
    try {
      const first = new Date(month.getFullYear(), month.getMonth(), 1);
      const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const res = await axios.get('/api/employer/dashboard/interviews', {
        params: { from: formatISODate(first), to: formatISODate(last) }
      });
      setCalendarInterviews(res.data.interviews || []);
    } catch (err) {
      addToast('Failed to load interview calendar.', 'error');
    } finally {
      setCalendarLoading(false);
    }
  };

  const openCalendar = () => {
    const today = new Date();
    setCalendarMonth(today);
    setSelectedCalDate(formatISODate(today));
    setIsCalendarModalOpen(true);
    fetchCalendarInterviews(today);
  };

  const changeCalendarMonth = (delta) => {
    const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1);
    setCalendarMonth(next);
    setSelectedCalDate(formatISODate(new Date(next.getFullYear(), next.getMonth(), 1)));
    fetchCalendarInterviews(next);
  };

  // --- SEARCH FILTERING ---
  const filteredJobs = jobs.filter(job =>
    (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const companyInitial = company?.company_name
    ? company.company_name.charAt(0).toUpperCase()
    : currentEmployer?.companyName?.charAt(0).toUpperCase() || 'C';


  // ───────────────────────────────────────────────────────────────────────
  // TAB VIEWS RENDER LOGIC
  // ───────────────────────────────────────────────────────────────────────
  const renderDashboardView = () => {
    return (
      <div className="space-y-6">
        {/* Greeting Banner */}
        <div className="bg-gradient-to-br from-sky-700 via-sky-600 to-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex justify-between items-center text-left animate-fade-in">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          
          <div className="space-y-1 z-10">
            <span className="text-[10px] font-black bg-white/20 uppercase tracking-widest px-2.5 py-1 rounded w-fit text-white">
              Recruiter Session Active
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5">
              Hello, ${currentEmployer?.recruiterName || 'Recruiter'}!
            </h1>
            <p className="text-sky-100/90 text-xs font-semibold max-w-xl">
              Hiring overview and candidate metrics dashboard for <strong className="text-white">${company?.company_name || currentEmployer?.companyName}</strong>.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Active Job Posts',
              value: metrics.activeJobs,
              trend: metrics.trends.activeJobsTrend,
              icon: FiBriefcase,
              color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30'
            },
            {
              label: 'Total Applicants',
              value: metrics.totalApplicants,
              trend: metrics.trends.totalApplicantsTrend,
              icon: FiUsers,
              color: 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30'
            },
            {
              label: 'Shortlisted Candidates',
              value: metrics.shortlistedMatches,
              trend: metrics.trends.shortlistedMatchesTrend,
              icon: FiCheckSquare,
              color: 'text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
            },
            {
              label: 'Today\'s Interviews',
              value: metrics.todayInterviews,
              trend: metrics.trends.todayInterviewsTrend,
              icon: FiCalendar,
              color: 'text-rose-655 dark:text-rose-455 bg-rose-550/10 dark:bg-rose-955/10 border-rose-100 dark:border-rose-900/30'
            }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="space-y-1.5 text-left">
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-black uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none">{stat.value}</h3>
                  <span className="text-[10px] font-bold text-emerald-655 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-955/20 px-2 py-0.5 rounded-md inline-block">
                    {stat.trend}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold border ${stat.color}`}>
                  <Icon className="w-5.5 h-5.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Widgets Grid: Recent Applications & Today's Interviews & Notifications Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Area: Applications & Summary */}
          <div className="lg:col-span-8 space-y-6">
            {/* Recent Applications Widget */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 text-left">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-sky-600" />
                <h2 className="font-extrabold text-slate-850 dark:text-white text-base">Recent Applications</h2>
              </div>
              
              {recentApplications.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-semibold">
                  No recent candidate applications.
                </div>
              ) : (
                <div className="divide-y divide-slate-50 dark:divide-slate-850/40 text-xs space-y-3.5">
                  {recentApplications.map((app, idx) => (
                    <div key={idx} className="pt-3.5 flex justify-between items-center first:pt-0">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-855 dark:text-slate-105 block">{app.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">{app.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                            : app.status === 'Rejected'
                            ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-955/10 dark:border-rose-900/30 dark:text-rose-455'
                            : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-550/50 dark:bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-100/50 dark:border-slate-800 hidden sm:inline-block">
                          {app.time}
                        </span>
                        <button
                          onClick={() => setSelectedCandidate(app)}
                          className="px-2.5 py-1 text-[10px] font-bold text-sky-655 hover:text-sky-700 bg-sky-50 dark:bg-sky-955/20 rounded-lg hover:underline cursor-pointer border-none"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Compact Company Summary & Today's Interviews */}
          <div className="lg:col-span-4 space-y-6">
            {/* Company Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 text-left">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-sky-600" />
                  <h2 className="font-extrabold text-slate-850 dark:text-white text-base">Company Summary</h2>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200/80 dark:hover:bg-slate-750 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Edit Company Profile"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sky-600 text-white flex items-center justify-center font-black text-lg rounded-xl border border-sky-500 shadow-sm shadow-sky-500/20">
                    {companyInitial}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-105 leading-none">
                      {company?.company_name || currentEmployer?.companyName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold mt-1.5 block">
                      Industry: {company?.industry || 'Technology'}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-850/40 text-xs font-semibold space-y-3 pt-1">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400 font-bold">Lead Recruiter</span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{company?.recruiter_name || currentEmployer?.recruiterName}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400 font-bold">Total Jobs Posted</span>
                    <span className="text-slate-700 dark:text-slate-200 font-black">{company?.total_jobs || 0}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400 font-bold">Total Candidates</span>
                    <span className="text-slate-700 dark:text-slate-200 font-black">{company?.total_applicants || 0}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400 font-bold">Company Size</span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{company?.company_size || '51-200 employees'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interviews widget */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 text-left">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-250 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FiCalendar className="w-4.5 h-4.5 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">Today's Interviews</h3>
                <button
                  onClick={openCalendar}
                  className="ml-auto flex items-center gap-1 px-2 py-1 text-[9px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-955/20 rounded-lg border border-sky-100 dark:border-sky-900/30 cursor-pointer hover:bg-sky-105 dark:hover:bg-sky-900/30 transition-colors"
                >
                  View Calendar
                </button>
              </div>
              {interviews.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-455 dark:text-slate-500 bg-slate-50 dark:bg-slate-955/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No interviews scheduled.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {interviews.map((int, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-850/30 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{int.candidate}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold block">{int.round}</span>
                      </div>
                      <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-955/20 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900/30">
                        {int.time}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderJobsView = () => {
    return (
      <div className="space-y-6 text-left">
        {/* Top Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
          <div>
            <h2 className="text-lg font-black text-slate-850 dark:text-white">Active Job Listings</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Post job openings, track statuses, and manage candidate lists.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs by title or location..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleOpenPostJob}
              variant="primary"
              size="sm"
              className="font-bold text-xs h-9 px-4 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
            >
              <FiPlus className="w-3.5 h-3.5" /> Post Job
            </Button>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-slate-455 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <FiBriefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">No active job listings found matching query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="pb-3 font-black">Job Title</th>
                    <th className="pb-3 font-black">Status</th>
                    <th className="pb-3 font-black text-center">Applicants</th>
                    <th className="pb-3 font-black text-center">Views</th>
                    <th className="pb-3 font-black">Posted Date</th>
                    <th className="pb-3 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850/40 text-xs">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/10 transition-colors">
                      <td className="py-3.5">
                        <span className="font-extrabold text-slate-855 dark:text-slate-100 block">{job.title}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">{job.type} - {job.location}</span>
                        {job.lastDateToApply && (
                          <span className="text-[9px] text-amber-600 dark:text-amber-450 font-bold block mt-0.5">
                            Apply by {job.lastDateToApply}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                          job.status === 'Active'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                            : job.status === 'Expired'
                            ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-955/20 dark:border-amber-900/30 dark:text-amber-450'
                            : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center font-extrabold text-slate-700 dark:text-slate-200">{job.applicants}</td>
                      <td className="py-3.5 text-center font-bold text-slate-500 dark:text-slate-400">{job.views}</td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 font-bold">{job.date}</td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleViewApplicants(job)}
                          className="px-2.5 py-1 text-[10px] font-bold text-sky-655 hover:text-sky-700 bg-sky-50 dark:bg-sky-955/20 rounded-lg hover:underline cursor-pointer border-none"
                        >
                          View Applicants
                        </button>
                        <button
                          onClick={() => handleOpenEditJob(job)}
                          className="p-1.5 text-slate-455 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-50 dark:bg-slate-850 rounded-lg inline-flex cursor-pointer border border-slate-100 dark:border-slate-800"
                          title="Edit Listing"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleJob(job)}
                          className={`p-1.5 rounded-lg inline-flex cursor-pointer border ${
                            job.status === 'Closed' || job.status === 'Expired'
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                              : 'text-slate-455 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800'
                          }`}
                          title={job.status === 'Closed' || job.status === 'Expired' ? 'Reopen job' : 'Close job'}
                        >
                          {job.status === 'Closed' || job.status === 'Expired' ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-slate-455 hover:text-rose-600 dark:hover:text-rose-455 bg-slate-50 dark:bg-slate-850 rounded-lg inline-flex cursor-pointer border border-slate-100 dark:border-slate-800"
                          title="Delete Listing"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };


  const renderApplicationsView = () => {
    // Filter applications
    const filteredApps = allApplications.filter(app => {
      const q = searchTerm.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (app.role || '').toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-6 text-left animate-fade-in">
        {/* Top Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-855 dark:text-white">Candidate Applications</h2>
            <p className="text-xs text-slate-400 dark:text-slate-550 font-semibold mt-0.5">Review submissions, update stages, and schedule interviews.</p>
          </div>
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by candidate name, email, or role..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Applications Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          {filteredApps.length === 0 ? (
            <div className="text-center py-12 text-slate-455 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-bold">No candidate applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="pb-3 font-black">Candidate</th>
                    <th className="pb-3 font-black">Job Position</th>
                    <th className="pb-3 font-black">Applied</th>
                    <th className="pb-3 font-black">Update Status</th>
                    <th className="pb-3 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850/40 text-xs">
                  {filteredApps.map((app) => (
                    <tr key={app.applicationId} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/10 transition-colors">
                      <td className="py-3.5">
                        <span className="font-extrabold text-slate-855 dark:text-slate-100 block">{app.name}</span>
                        <span className="text-[10px] text-slate-450 font-semibold block">{app.email}</span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-700 dark:text-slate-250">
                        {app.role}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 font-bold">
                        {app.timeAgo}
                      </td>
                      <td className="py-3.5">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.applicationId, e.target.value)}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider focus:outline-none border cursor-pointer ${
                            app.status === 'Shortlisted' || app.status === 'Interview' || app.status === 'Offer'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-200 dark:border-rose-500/20'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Offer">Offer</option>
                        </select>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedCandidate(app)}
                          className="px-2.5 py-1 text-[10px] font-bold text-sky-655 hover:text-sky-700 bg-sky-50 dark:bg-sky-955/20 rounded-lg hover:underline cursor-pointer border-none"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => openChat(app)}
                          className="p-1.5 text-slate-455 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-50 dark:bg-slate-850 rounded-lg inline-flex cursor-pointer border border-slate-100 dark:border-slate-800"
                          title="Message Candidate"
                        >
                          <FiMail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenScheduleInterview(app)}
                          className="p-1.5 text-slate-455 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-850 rounded-lg inline-flex cursor-pointer border border-slate-100 dark:border-slate-800"
                          title="Schedule Interview"
                        >
                          <FiCalendar className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => {
    return (
      <div className="space-y-6 text-left animate-fade-in">
        {/* Recruiting Analytics Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-300">Recruiting Analytics</h3>
              <p className="text-[10px] text-slate-550 dark:text-slate-400 font-semibold mt-1">Real-time reports on applications flow, job postings, and pipelines</p>
            </div>
            <span className="text-[10px] font-black text-sky-600 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1 rounded-full uppercase border border-sky-100 dark:border-sky-900/30">
              SQL Data Driven
            </span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Daily Applications Trend (Line Chart) */}
            <div className="bg-slate-50 dark:bg-slate-955/30 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl flex flex-col gap-4">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Daily Applications (Last 30 Days)</span>
              {analytics.dailyTrend?.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400">No Data Available</div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="h-44 relative w-full pt-4">
                    {(() => {
                      const chartWidth = 500;
                      const chartHeight = 160;
                      const paddingLeft = 32;
                      const paddingRight = 16;
                      const paddingTop = 16;
                      const paddingBottom = 24;

                      const trendMax = Math.max(...analytics.dailyTrend.map(d => d.count), 1);
                      const points = analytics.dailyTrend.map((d, index) => {
                        const x = paddingLeft + (index / (analytics.dailyTrend.length - 1)) * (chartWidth - paddingLeft - paddingRight);
                        const y = chartHeight - paddingBottom - (d.count / trendMax) * (chartHeight - paddingTop - paddingBottom);
                        return { x, y, data: d };
                      });

                      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaD = points.length > 0
                        ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
                        : '';

                      return (
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible select-none">
                          <defs>
                            <linearGradient id="recruiter-line-area" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                            const y = chartHeight - paddingBottom - ratio * (chartHeight - paddingTop - paddingBottom);
                            return (
                              <line
                                key={idx}
                                x1={paddingLeft}
                                y1={y}
                                x2={chartWidth - paddingRight}
                                y2={y}
                                className="stroke-slate-200 dark:stroke-slate-800/40"
                                strokeDasharray="3 3"
                              />
                            );
                          })}
                          <path d={areaD} fill="url(#recruiter-line-area)" />
                          <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          {points.map((p, index) => (
                            <g key={index} className="group/dot cursor-pointer">
                              <circle cx={p.x} cy={p.y} r="3" className="fill-sky-655 stroke-white dark:stroke-slate-900 stroke-2" />
                              <title>{`${p.data.label}: ${p.data.count} applications`}</title>
                            </g>
                          ))}
                        </svg>
                      );
                    })()}
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-455 dark:text-slate-500 font-bold px-8 mt-1">
                    <span>{analytics.dailyTrend[0]?.label}</span>
                    <span>{analytics.dailyTrend[Math.floor(analytics.dailyTrend.length / 2)]?.label}</span>
                    <span>{analytics.dailyTrend[analytics.dailyTrend.length - 1]?.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hiring Pipeline State Counts */}
            <div className="bg-slate-50 dark:bg-slate-955/30 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl flex flex-col gap-4">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hiring Pipeline Progression</span>
              {analytics.hiringPipeline?.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-450">No Data Available</div>
              ) : (
                <div className="flex flex-col gap-4 justify-center h-44">
                  <div className="flex flex-wrap gap-2 justify-center items-center">
                    {analytics.hiringPipeline.map((stage, idx) => (
                      <React.Fragment key={idx}>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center min-w-[70px] shadow-sm">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{stage.stage}</span>
                          <span className="text-base font-black text-slate-800 dark:text-white mt-1 leading-none">{stage.count}</span>
                        </div>
                        {idx < analytics.hiringPipeline.length - 1 && (
                          <span className="text-slate-300 dark:text-slate-700 font-black text-sm">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job-wise Applicants Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-955/30 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl flex flex-col gap-4">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applicant Volume by Job Listing</span>
              {analytics.jobWiseApplicants?.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-455">No Job Listings Posted Yet</div>
              ) : (
                <div className="flex flex-col gap-3 max-h-44 overflow-y-auto">
                  {analytics.jobWiseApplicants.map((job, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="truncate max-w-[240px]">{job.title}</span>
                        <span className="font-extrabold">{job.count} applicants</span>
                      </div>
                      <ProgressBar value={Math.min(100, job.count * 10)} showPercentage={false} size="xs" variant="primary" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Postings graph */}
            <div className="bg-slate-50 dark:bg-slate-955/30 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl flex flex-col gap-4">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Job Postings</span>
              {analytics.monthlyTrend?.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-455">No Postings in the Current Period</div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="h-40 flex items-end justify-center gap-4 px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                    {(() => {
                      const trendMax = Math.max(...analytics.monthlyTrend.map(d => d.count), 1);
                      return analytics.monthlyTrend.map((data, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1 group relative min-w-[24px]">
                          <div className="absolute bottom-[calc(100%-2px)] mb-1 bg-slate-900 dark:bg-slate-955 text-[8px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {data.count} posted
                          </div>
                          <span className="text-[8px] text-slate-555 font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity">{data.count}</span>
                          <div
                            style={{ height: `${(data.count / trendMax) * 110}px` }}
                            className="w-4 min-h-[4px] bg-sky-600 hover:bg-sky-500 rounded-t-md transition-all shadow-sm"
                          ></div>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="flex justify-center gap-4 text-[9px] text-slate-550 font-bold px-2">
                    {analytics.monthlyTrend.map((d, idx) => (
                      <span key={idx} className="w-4 text-center truncate">{d.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMessagesView = () => {
    return (
      <div className="flex flex-col gap-6 w-full animate-slide-up text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Messages</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
            Chat with candidates you shortlisted.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Conversation List */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FiMail className="w-4 h-4 text-sky-600" />
              <h2 className="font-extrabold text-slate-800 dark:text-white text-sm">Inbox</h2>
              {conversations.some(cv => cv.unread > 0) && (
                <span className="ml-auto text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  {conversations.reduce((a, cv) => a + cv.unread, 0)} new
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-805/40 max-h-[520px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12 px-6">
                  <FiMessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">No conversations yet.</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Shortlist a candidate and send a message to start!
                  </p>
                </div>
              ) : (
                conversations.map(conv => {
                  const isSelected = chatCandidate?.userId === conv.userId;
                  return (
                    <button
                      key={conv.userId}
                      onClick={() => openChat(conv)}
                      className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors cursor-pointer border-none ${
                        isSelected
                          ? 'bg-sky-50/60 dark:bg-sky-900/15'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5 bg-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                        {(conv.candidateName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${conv.unread > 0 ? 'font-black text-slate-950 dark:text-white' : 'font-extrabold text-slate-800 dark:text-slate-100'}`}>
                            {conv.candidateName}
                          </span>
                          {conv.unread > 0 && (
                            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${conv.unread > 0 ? 'font-bold text-slate-700 dark:text-slate-300' : 'font-medium text-slate-550 dark:text-slate-400'}`}>
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 block">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Thread */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[520px] lg:sticky lg:top-6">
            {!chatCandidate ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <FiMail className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">Select a conversation</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Choose a candidate on the left to start chatting.</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    {(chatCandidate.candidateName || chatCandidate.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-800 dark:text-white text-sm leading-none">
                      {chatCandidate.candidateName || chatCandidate.name}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {chatCandidate.candidateEmail || chatCandidate.email}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[380px] max-h-[420px] space-y-2.5 bg-slate-50/20 dark:bg-slate-955/10">
                  {chatLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <FiClock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">No messages in this conversation yet.</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Say hello to get started.</p>
                    </div>
                  ) : (
                    (() => {
                      let lastDay = '';
                      return chatMessages.map((msg, idx) => {
                        const day = (msg.createdAt || msg.created_at) ? new Date(msg.createdAt || msg.created_at).toDateString() : '';
                        const showSep = day && day !== lastDay;
                        lastDay = day;
                        const isRecruiter = msg.sender === 'employer';
                        return (
                          <React.Fragment key={msg.id || idx}>
                            {showSep && (
                              <div className="flex justify-center py-2">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                  {formatDay(msg.createdAt || msg.created_at)}
                                </span>
                              </div>
                            )}
                            <div className={`flex items-end gap-2 ${isRecruiter ? 'justify-end' : 'justify-start'}`}>
                              {!isRecruiter && (
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-sky-655 dark:text-sky-400 flex items-center justify-center font-black text-[10px] shrink-0 mb-0.5">
                                  {(chatCandidate.candidateName || chatCandidate.name || 'C').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold shadow-sm ${
                                isRecruiter
                                  ? 'bg-sky-600 text-white rounded-br-sm'
                                  : 'bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-200/40 dark:border-slate-800/60'
                              }`}>
                                {msg.content}
                                <span className={`block text-[8px] mt-1 font-bold ${isRecruiter ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                                  {formatTime(msg.createdAt || msg.created_at)}
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      });
                    })()
                  )}
                </div>

                <form onSubmit={sendChatMessage} className="flex gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/50">
                  <input
                    type="text"
                    required
                    value={chatText}
                    onChange={e => setChatText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={chatSending || !chatText.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border-none transition-colors"
                  >
                    {chatSending ? 'Sending...' : <FiSend className="w-3 h-3" />} Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProfileView = () => {
    return (
      <div className="space-y-6 text-left animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden text-left p-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
            <h2 className="text-lg font-black text-slate-855 dark:text-white">Company Profile</h2>
            <p className="text-xs text-slate-400 dark:text-slate-550 font-semibold mt-0.5">Keep company summary, recruiter, and contact details up-to-date.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Recruiter Details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Recruiter Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.recruiterName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, recruiterName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="Recruiter Name"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Designation</label>
                <input
                  type="text"
                  value={profileForm.designation}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Talent Acquisition Manager"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Department</label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Human Resources"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Official Phone</label>
                <input
                  type="text"
                  value={profileForm.officialPhone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, officialPhone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. +1234567890"
                />
              </div>

              {/* Company Details */}
              <div className="flex flex-col gap-1.5 sm:col-span-2 border-t border-slate-100 dark:border-slate-850/60 pt-4 mt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Company Information</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Company Name *</label>
                <input
                  type="text"
                  required
                  value={profileForm.companyName}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-550 dark:bg-slate-955 text-xs font-semibold text-slate-855 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="Company Name"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">Industry</label>
                <input
                  type="text"
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-855 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Software Development"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">Company Size</label>
                <select
                  value={profileForm.companySize}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, companySize: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="">Select Size</option>
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="51-200 employees">51-200 employees</option>
                  <option value="201-500 employees">201-500 employees</option>
                  <option value="501-1000 employees">501-1000 employees</option>
                  <option value="1000+ employees">1000+ employees</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">Founded Year</label>
                <input
                  type="text"
                  value={profileForm.foundedYear}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, foundedYear: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-855 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. 2015"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">Website</label>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-855 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="https://company.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">LinkedIn Profile</label>
                <input
                  type="url"
                  value={profileForm.linkedin}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-855 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="https://linkedin.com/company/..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">Headquarters</label>
                <input
                  type="text"
                  value={profileForm.headquarters}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, headquarters: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-xs font-semibold text-slate-855 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">Work Mode Preference</label>
                <select
                  value={profileForm.workMode}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, workMode: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-550 dark:bg-slate-955 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500"
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-555">Company Description</label>
              <textarea
                rows={4}
                value={profileForm.description}
                onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-550 dark:bg-slate-955 text-xs font-semibold text-slate-855 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                placeholder="Describe your company culture, vision, and focus areas..."
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-xs font-extrabold text-white rounded-xl shadow-md transition-colors cursor-pointer border-none"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 font-sans flex flex-col transition-colors duration-200">
      {/* Recruiter Navigation Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-auto" mode="light" />
          <span className="h-6 w-[1px] bg-slate-200 dark:bg-slate-750" />
          <span className="text-[11px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900/30">
            Recruiter Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotifs}
              className="flex relative items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white transition-all duration-150 focus:outline-none cursor-pointer"
              title="Notifications"
            >
              <FiBell className="w-4 h-4" />
              {notifUnread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950 leading-none">
                  {notifUnread > 9 ? '9+' : notifUnread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 py-2 animate-scale-in z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">Notifications</span>
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                    {notifications.length} total
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="text-center py-10 px-6">
                      <FiBell className="w-7 h-7 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400">No notifications yet</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 text-center">
                        Applicant and system updates will show up here.
                      </p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-sky-500'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-extrabold text-slate-850 dark:text-white">
                              {n.type === 'new_application' ? 'New Application' : n.type === 'interview' ? 'Interview Scheduled' : 'System Notification'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">{n.message}</p>
                            <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold mt-1 block">
                              {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeToggle />

          {/* Profile dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 transition-all duration-150 focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {companyInitial}
              </div>
              <span className="hidden sm:inline text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {currentEmployer?.recruiterName || 'Recruiter'}
              </span>
              <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 py-2 animate-scale-in z-50">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-black text-slate-850 dark:text-slate-100 truncate">{currentEmployer?.recruiterName || 'Recruiter'}</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold truncate mt-0.5">{currentEmployer?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setDropdownOpen(false); setIsProfileModalOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-left border-none bg-transparent"
                  >
                    <FiUser className="w-4 h-4 text-slate-400" />
                    Edit Company Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-955/10 rounded-xl transition-colors cursor-pointer text-left border-none bg-transparent"
                  >
                    <FiLogOut className="w-4 h-4 text-slate-400" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4">Loading Recruiter Workspace...</p>
        </div>
      ) : (
        <div className="flex-1 flex w-full">
          {/* Recruiter Sidebar */}
          <aside className="w-64 border-r border-slate-105 dark:border-slate-800/60 bg-white dark:bg-gray-955 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] text-left">
            <nav className="flex-1 px-4 py-6 space-y-1">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-650 uppercase tracking-[0.12em] px-2 mb-3">
                Navigation
              </p>
              {[
                { id: 'dashboard', label: 'Dashboard', icon: FiGrid, desc: 'Hiring Overview' },
                { id: 'jobs', label: 'Jobs', icon: FiBriefcase, desc: 'Manage Listings', badge: jobs.length },
                { id: 'applications', label: 'Applications', icon: FiFileText, desc: 'Candidate Applications', badge: allApplications.length },
                { id: 'analytics', label: 'Analytics', icon: FiTrendingUp, desc: 'Pipeline Metrics' },
                { id: 'messages', label: 'Messages', icon: FiMail, desc: 'Candidate Chat', badge: recruiterUnreadMessages },
                { id: 'profile', label: 'Company Profile', icon: FiUser, desc: 'Company Details' }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full group relative flex items-center h-11 px-3 rounded-xl transition-all duration-200 text-left text-xs font-bold cursor-pointer border-none bg-transparent ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-655 dark:text-sky-400 font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-100 dark:bg-sky-900/30'
                        : 'bg-slate-100 dark:bg-white/8 group-hover:bg-slate-200 dark:group-hover:bg-white/12'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-655 dark:text-sky-400' : 'text-slate-400 dark:text-slate-550'}`} />
                    </div>
                    <div className="ml-2.5 flex-1 min-w-0">
                      <p className="leading-none truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-650 font-normal leading-none mt-0.5 truncate">{item.desc}</p>
                    </div>
                    {item.badge > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
                        item.id === 'messages' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Recruiter Workspace Content Area */}
          <main className="flex-1 min-w-0 overflow-y-auto px-6 py-8 flex flex-col gap-6 animate-slide-up">
            {activeSection === 'dashboard' && renderDashboardView()}
            {activeSection === 'jobs' && renderJobsView()}
            {activeSection === 'applications' && renderApplicationsView()}
            {activeSection === 'analytics' && renderAnalyticsView()}
            {activeSection === 'messages' && renderMessagesView()}
            {activeSection === 'profile' && renderProfileView()}
          </main>
        </div>
      )}

      {/* 1. JOB FORM MODAL (CREATE / EDIT) */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                {jobModalMode === 'create' ? 'Create New Job Listing' : 'Edit Job Listing'}
              </h3>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="text-slate-450 hover:text-slate-655 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleJobSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Frontend Engineer"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Bangalore, Remote"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={e => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    placeholder="e.g. $80k - $100k"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Experience Required</label>
                  <input
                    type="text"
                    value={jobForm.experienceRequired}
                    onChange={e => setJobForm({ ...jobForm, experienceRequired: e.target.value })}
                    placeholder="e.g. 1-3 years"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Employment Type</label>
                <select
                  value={jobForm.employmentType}
                  onChange={e => setJobForm({ ...jobForm, employmentType: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-850 dark:text-slate-100 font-semibold"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Last Date to Apply</label>
                <input
                  type="date"
                  value={jobForm.lastDateToApply || ''}
                  onChange={e => setJobForm({ ...jobForm, lastDateToApply: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                />
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">
                  Leave empty for no expiry. Candidates can no longer see this job after this date or once you close it.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={jobForm.skills}
                  onChange={e => setJobForm({ ...jobForm, skills: e.target.value })}
                  placeholder="React, Tailwind, Node.js"
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Description</label>
                <textarea
                  rows={4}
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Provide a detailed description of the role responsibilities..."
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-sans font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {jobModalMode === 'create' ? 'Post Job' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. APPLICANTS LIST MODAL */}
      {isApplicantsModalOpen && activeJobForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-xl w-full flex flex-col p-6 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Applicants</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{activeJobForApplicants.title} ({activeJobForApplicants.type})</p>
              </div>
              <button
                onClick={() => setIsApplicantsModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[50vh] overflow-y-auto mt-4 pr-1">
              {applicantsLoading ? (
                <div className="text-center py-10 text-xs font-bold text-slate-500">Loading applicants...</div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-10 text-xs font-bold text-slate-400">No applicants have applied yet for this job listing.</div>
              ) : (
                applicants.map((app, index) => (
                  <div key={index} className="py-3 flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-650 dark:text-sky-400 flex items-center justify-center font-black text-xs shrink-0">
                        {getInitials(app.name)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-850 dark:text-slate-100 text-xs block leading-none">{app.name}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">{app.education}</span>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">Skills: {app.skills || 'None'}</span>
                        <span className="text-[9px] text-slate-400 font-bold mt-1 block">Applied {app.timeAgo}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 shrink-0 items-end">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border leading-none block w-fit ${
                        app.status === 'Shortlisted'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                          : app.status === 'Rejected'
                          ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-455'
                          : app.status === 'Interview'
                          ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450'
                          : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            // Load candidate profile modal details
                            setSelectedCandidate(app);
                          }}
                          className="px-2 py-0.5 text-[9px] font-bold text-slate-700 hover:text-sky-655 bg-slate-100 dark:bg-slate-800 rounded-md cursor-pointer border-none"
                        >
                          View Resume
                        </button>
                        <button
                          onClick={() => openChat(app)}
                          className="px-2 py-0.5 text-[9px] font-bold text-sky-700 hover:text-white hover:bg-sky-600 bg-sky-50 dark:bg-sky-955/20 rounded-md cursor-pointer border-none"
                        >
                          Message
                        </button>
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(app.applicationId, 'Shortlisted')}
                              className="px-2 py-0.5 text-[9px] font-bold text-emerald-600 hover:text-white hover:bg-emerald-650 bg-emerald-50 dark:bg-emerald-955/20 rounded-md cursor-pointer border-none"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.applicationId, 'Rejected')}
                              className="px-2 py-0.5 text-[9px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 dark:bg-rose-955/20 rounded-md cursor-pointer border-none"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'Shortlisted' && (
                          <button
                            onClick={() => handleOpenScheduleInterview(app)}
                            className="px-2 py-0.5 text-[9px] font-bold text-amber-600 hover:text-white hover:bg-amber-550 bg-amber-50 dark:bg-amber-955/20 rounded-md cursor-pointer border-none"
                          >
                            Schedule
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={() => setIsApplicantsModalOpen(false)}
                variant="outline"
                className="px-4 py-1.5 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CANDIDATE PROFILE & RESUME MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-955/30 text-sky-650 dark:text-sky-400 flex items-center justify-center font-black text-base shadow-sm">
                  {getInitials(selectedCandidate.name)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                    {selectedCandidate.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><FiMail /> {selectedCandidate.email}</span>
                    <span className="flex items-center gap-1"><FiPhone /> {selectedCandidate.phone}</span>
                    <span className="flex items-center gap-1"><FiMapPin /> {selectedCandidate.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-450 hover:text-slate-655 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
              {/* Profile Details (Left) */}
              <div className="md:col-span-7 space-y-4">
                {/* Experience */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiBriefcase className="w-3 h-3" /> Experience
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-relaxed">
                    {selectedCandidate.experience}
                  </p>
                </div>

                {/* Skills */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiLayers className="w-3 h-3" /> Skills
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getCandidateSkills(selectedCandidate).length > 0 ? (
                      getCandidateSkills(selectedCandidate).map((skill, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] text-slate-750 dark:text-slate-300 font-bold">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">No skills listed.</span>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiBookOpen className="w-3 h-3" /> Education
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-bold">
                    {selectedCandidate.education}
                  </p>
                </div>
              </div>

              {/* Resume Preview & Recruiter Actions (Right) */}
              <div className="md:col-span-5 flex flex-col gap-4">
                {/* Resume Preview Section */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 bg-slate-50 dark:bg-slate-955/40">
                  {selectedCandidate.hasResume ? (
                    <>
                      <div className="w-14 h-14 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-center justify-center">
                        <FiFileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block break-all">
                          {selectedCandidate.resumeFileName || selectedCandidate.resumeUrl || 'Candidate Resume'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Candidate Resume
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 w-full mt-2">
                        <button
                          onClick={() => handlePreviewResume(selectedCandidate)}
                          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-extrabold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-955/20 rounded-xl border border-sky-100 dark:border-sky-900/30 cursor-pointer transition-colors"
                        >
                          <FiSearch className="w-3.5 h-3.5" /> Preview Resume
                        </button>
                        <button
                          onClick={() => handleDownloadResume(selectedCandidate)}
                          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white bg-slate-100 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                        >
                          <FiDownload className="w-3.5 h-3.5" /> Download Resume
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FiFileText className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 block">
                          No resume uploaded
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          This candidate hasn't uploaded a resume file yet.
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Recruiter Decision Block */}
                {selectedCandidate.applicationId && (
                  <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-850/45 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                      Recruiter Actions
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedCandidate.applicationId, 'Shortlisted');
                          setSelectedCandidate(null);
                        }}
                        className="py-2.5 text-xs font-bold text-emerald-750 hover:text-white bg-emerald-50 dark:bg-emerald-955/20 hover:bg-emerald-600 dark:hover:bg-emerald-600 rounded-xl border border-emerald-250 dark:border-emerald-900/30 transition-all cursor-pointer border-none"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedCandidate.applicationId, 'Rejected');
                          setSelectedCandidate(null);
                        }}
                        className="py-2.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-600 dark:hover:bg-rose-600 rounded-xl border border-rose-250 dark:border-rose-900/30 transition-all cursor-pointer border-none"
                      >
                        Reject
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        handleOpenScheduleInterview(selectedCandidate);
                        setSelectedCandidate(null);
                      }}
                      className="w-full py-2.5 text-xs font-bold text-sky-650 dark:text-sky-300 hover:text-white bg-sky-50 dark:bg-sky-955/20 hover:bg-sky-600 dark:hover:bg-sky-600 rounded-xl border border-sky-250 dark:border-sky-900/30 transition-all cursor-pointer mt-1 border-none"
                    >
                      Schedule Interview
                    </button>

                    <button
                      onClick={() => {
                        const cand = { ...selectedCandidate };
                        setSelectedCandidate(null);
                        openChat(cand);
                      }}
                      className="w-full py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-white bg-emerald-50 dark:bg-emerald-955/20 hover:bg-emerald-600 dark:hover:bg-emerald-600 rounded-xl border border-emerald-250 dark:border-emerald-900/30 transition-all cursor-pointer border-none"
                    >
                      Send Message
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SCHEDULE INTERVIEW MODAL */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                {interviewForm.id ? 'Update Interview' : 'Schedule Candidate Interview'}
              </h3>
              <button
                onClick={() => setIsInterviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInterviewSubmit} className="space-y-4 pt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Candidate Email</label>
                <input
                  type="email"
                  required
                  readOnly
                  value={interviewForm.candidateEmail}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Job Listing</label>
                <select
                  value={interviewForm.jobId}
                  onChange={e => setInterviewForm({ ...interviewForm, jobId: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-850 dark:text-slate-100 font-semibold"
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interview Round</label>
                <select
                  value={interviewForm.round}
                  onChange={e => setInterviewForm({ ...interviewForm, round: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="Technical Round">Technical Round</option>
                  <option value="HR Evaluation">HR Evaluation</option>
                  <option value="Managerial Assessment">Managerial Assessment</option>
                  <option value="System Design Round">System Design Round</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewForm.scheduledAt}
                  onChange={e => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
                />
              </div>

              {interviewForm.id && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Interview Status</label>
                  <select
                    value={interviewForm.status}
                    onChange={e => setInterviewForm({ ...interviewForm, status: e.target.value })}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 rounded-xl text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-4 py-2 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {interviewForm.id ? 'Save Changes' : 'Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CANDIDATE CHAT MODAL */}
      {chatCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full h-[560px] flex flex-col p-5 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {(chatCandidate.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-sm leading-none">{chatCandidate.name}</h3>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1">{chatCandidate.email}</p>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 py-4 pr-1">
              {chatLoading ? (
                <div className="text-center py-10 text-xs font-bold text-slate-500">Loading conversation...</div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-10 text-xs font-bold text-slate-400">
                  No messages yet. Say hello to {(chatCandidate.name || 'the candidate').split(' ')[0]}!
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex ${msg.sender === 'employer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-semibold ${
                      msg.sender === 'employer'
                        ? 'bg-sky-600 text-white rounded-br-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm'
                    }`}>
                      {msg.content}
                      <span className="block text-[8px] mt-1 opacity-70 font-bold">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendChatMessage} className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <input
                type="text"
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-semibold"
              />
              <button
                type="submit"
                disabled={chatSending || !chatText.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl cursor-pointer disabled:opacity-50 border-none"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. INTERVIEW CALENDAR MODAL */}
      {isCalendarModalOpen && (() => {
        const year = calendarMonth.getFullYear();
        const monthIdx = calendarMonth.getMonth();
        const firstWeekday = new Date(year, monthIdx, 1).getDay();
        const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const interviewsByDate = {};
        calendarInterviews.forEach(iv => {
          if (!interviewsByDate[iv.date]) interviewsByDate[iv.date] = [];
          interviewsByDate[iv.date].push(iv);
        });

        const selectedDateList = interviewsByDate[selectedCalDate] || [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-scale-in">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-sky-600" />
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Interview Calendar</h3>
                </div>
                <button
                  onClick={() => setIsCalendarModalOpen(false)}
                  className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => changeCalendarMonth(-1)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ‹ Prev
                </button>
                <span className="text-sm font-black text-slate-800 dark:text-white capitalize">
                  {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => changeCalendarMonth(1)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Next ›
                </button>
              </div>

              {calendarLoading ? (
                <div className="text-center py-14 text-xs font-bold text-slate-500">Loading calendar...</div>
              ) : (
                <div className="mt-4">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {weekdays.map(d => (
                      <span key={d} className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1.5">
                        {d}
                      </span>
                    ))}
                    {Array.from({ length: firstWeekday }).map((_, i) => (
                      <div key={`blank-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const hasInterviews = interviewsByDate[dateStr]?.length > 0;
                      const isSelected = selectedCalDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedCalDate(dateStr)}
                          className={`relative h-11 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer border transition-all ${
                            isSelected
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-500/30'
                              : hasInterviews
                              ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40 hover:bg-sky-100 dark:hover:bg-sky-900/30'
                              : 'text-slate-600 dark:text-slate-300 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-850'
                          }`}
                        >
                          {dayNum}
                          {hasInterviews && (
                            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-sky-500'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Interviews on {selectedCalDate || 'selected date'}
                    </span>
                    {selectedDateList.length === 0 ? (
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-semibold py-3">
                        No interviews scheduled for this date.
                      </div>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {selectedDateList.map(iv => (
                          <div key={iv.id} className="p-2.5 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center gap-2">
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs block truncate">{iv.candidate}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">
                                {iv.round} · {iv.jobTitle}
                              </span>
                              <span className={`inline-block mt-1 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                                iv.status === 'Cancelled'
                                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                                  : iv.status === 'Completed'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400'
                              }`}>
                                {iv.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900/30">
                                {iv.time}
                              </span>
                              <button
                                onClick={() => handleEditInterview(iv)}
                                className="flex items-center gap-1 text-[10px] font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 hover:bg-sky-50 dark:hover:bg-sky-950/30 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer transition-colors"
                                title="Update interview"
                              >
                                <FiEdit2 className="w-3 h-3" /> Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ───────────────────────────────────────────────────────────────────────
         MODAL: EDIT RECRUITER PROFILE
      ─────────────────────────────────────────────────────────────────────── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={() => setIsProfileModalOpen(false)}>
          <div className="bg-white dark:bg-[#0a1222] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white max-w-2xl w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <h2 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                Edit Recruiter & Company Profile
              </h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-white cursor-pointer bg-transparent border-none">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[75vh] custom-scrollbar text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Section: Recruiter Details */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Recruiter Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.recruiterName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, recruiterName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="Recruiter Name"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Official Designation</label>
                  <input
                    type="text"
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. HR Manager, Co-founder"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Department</label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Human Resources"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Official Phone</label>
                  <input
                    type="text"
                    value={profileForm.officialPhone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, officialPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. +1234567890"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850/60 my-2 pt-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Company Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="Company Name"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Industry</label>
                  <input
                    type="text"
                    value={profileForm.industry}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Software, E-Commerce"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Company Size</label>
                  <select
                    value={profileForm.companySize}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, companySize: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">Select Size</option>
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="501-1000 employees">501-1000 employees</option>
                    <option value="1000+ employees">1000+ employees</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Founded Year</label>
                  <input
                    type="text"
                    value={profileForm.foundedYear}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, foundedYear: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. 2018"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Company Website</label>
                  <input
                    type="url"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="https://company.com"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={profileForm.linkedin}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Headquarters</label>
                  <input
                    type="text"
                    value={profileForm.headquarters}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, headquarters: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                    placeholder="e.g. Bangalore, Karnataka"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Work Mode Preference</label>
                  <select
                    value={profileForm.workMode}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, workMode: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-550">Company Description</label>
                <textarea
                  rows={3}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-850 dark:text-slate-250 focus:outline-none focus:border-sky-500"
                  placeholder="Tell potential candidates about your company mission and culture..."
                />
              </div>

              <div className="flex gap-3 border-t border-slate-100 dark:border-slate-850/60 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-500 rounded-xl cursor-pointer bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-xs font-extrabold text-white rounded-xl shadow-md cursor-pointer border-none"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
