import React, { useState, useEffect } from 'react';
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
  FiInfo
} from 'react-icons/fi';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import ThemeToggle from '../../components/common/ThemeToggle';

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

const getCandidateSkills = (candidate) => {
  if (!candidate) return [];
  if (Array.isArray(candidate.skills)) return candidate.skills.map(s => String(s).trim()).filter(Boolean);
  return String(candidate.skills || '').split(',').map(s => s.trim()).filter(Boolean);
};

const getInitials = (name) => String(name || '?').split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() || '?';

const EmployerDashboard = () => {
  const { currentEmployer, logout } = useEmployerAuth();
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
    candidateEmail: '',
    jobId: '',
    scheduledAt: '',
    round: 'Technical Round'
  });

  // --- INITIAL DATA FETCH ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        metricsRes,
        jobsRes,
        companyRes,
        recentAppsRes,
        interviewsRes,
        notificationsRes,
        analyticsRes
      ] = await Promise.all([
        axios.get('/api/employer/dashboard/metrics'),
        axios.get('/api/employer/dashboard/jobs'),
        axios.get('/api/employer/dashboard/company'),
        axios.get('/api/employer/dashboard/recent-applications'),
        axios.get('/api/employer/dashboard/interviews'),
        axios.get('/api/employer/dashboard/notifications'),
        axios.get('/api/employer/dashboard/analytics')
      ]);

      setMetrics(metricsRes.data);
      setJobs(jobsRes.data.jobs || []);
      setCompany(companyRes.data.company || {});
      setRecentApplications(recentAppsRes.data.applications || []);
      setInterviews(interviewsRes.data.interviews || []);
      setNotifications(notificationsRes.data.notifications || []);
      setAnalytics(analyticsRes.data || {
        jobWiseApplicants: [],
        dailyTrend: [],
        monthlyTrend: [],
        hiringPipeline: []
      });
    } catch (err) {
      console.error('[Recruiter Dashboard Fetch Error]', err);
      addToast('Failed to load recruiter workspace dashboard.', 'error');
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
      candidateEmail: candidate.email,
      jobId: activeJobForApplicants?.id || jobs[0]?.id || '',
      scheduledAt: '',
      round: 'Technical Round'
    });
    setIsInterviewModalOpen(true);
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!interviewForm.scheduledAt) {
      addToast('Interview date and time are required.', 'error');
      return;
    }
    try {
      await axios.post('/api/employer/dashboard/interviews/schedule', interviewForm);
      addToast('Interview scheduled successfully!', 'success');
      setIsInterviewModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      addToast('Failed to schedule interview.', 'error');
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
    if (!candidate?.userId) {
      addToast('Candidate messaging unavailable for this application.', 'error');
      return;
    }
    setChatCandidate(candidate);
    setChatMessages([]);
    setChatText('');
    setChatLoading(true);
    axios.get(`/api/messages/employer-thread/${candidate.userId}`)
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
    if (!content || !chatCandidate?.userId) return;
    setChatSending(true);
    try {
      const res = await axios.post(`/api/messages/employer-send/${chatCandidate.userId}`, { content });
      setChatMessages(prev => [...prev, res.data.message]);
      setChatText('');
    } catch (err) {
      addToast('Failed to send message.', 'error');
    } finally {
      setChatSending(false);
    }
  };

  useEffect(() => {
    if (!chatCandidate?.userId) return;
    const interval = setInterval(() => {
      axios.get(`/api/messages/employer-thread/${chatCandidate.userId}`)
        .then(res => setChatMessages(res.data.messages || []))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [chatCandidate?.userId]);

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
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-sky-500/20">
              {companyInitial}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-105 leading-none">
                {currentEmployer?.recruiterName || 'Recruiter'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {company?.company_name || currentEmployer?.companyName || 'Company'}
              </span>
            </div>
          </div>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 dark:bg-slate-850 dark:hover:bg-rose-955/20 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4">Loading Recruiter Workspace...</p>
        </div>
      ) : (
        /* Recruiter Body Layout */
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6 animate-slide-up">
          
          {/* Top Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white">Workspace Dashboard</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Manage job postings, verify credentials and monitor candidate pipelines.</p>
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

          {/* Greeting Banner */}
          <div className="bg-gradient-to-br from-sky-700 via-sky-600 to-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex justify-between items-center">
            <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            
            <div className="space-y-1 z-10">
              <span className="text-[10px] font-black bg-white/20 uppercase tracking-widest px-2.5 py-1 rounded w-fit text-white">
                Recruiter Session Active
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5">
                Hello, {currentEmployer?.recruiterName || 'Recruiter'}!
              </h1>
              <p className="text-sky-100/90 text-xs font-semibold max-w-xl">
                Hiring overview and candidate metrics dashboard for <strong className="text-white">{company?.company_name || currentEmployer?.companyName}</strong>.
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
                color: 'text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
              },
              {
                label: 'Shortlisted Matches',
                value: metrics.shortlistedMatches,
                trend: metrics.trends.shortlistedMatchesTrend,
                icon: FiCheckSquare,
                color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30'
              },
              {
                label: 'Today\'s Interviews',
                value: metrics.todayInterviews,
                trend: metrics.trends.todayInterviewsTrend,
                icon: FiClock,
                color: 'text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
              }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-black uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stat.value}</h3>
                    <span className="text-[10px] font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md inline-block">
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

          {/* Listings and Company Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Left: Active Job Listings Table */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <FiList className="w-5 h-5 text-sky-600" />
                    <h2 className="font-extrabold text-slate-800 dark:text-white text-base">Active Job Listings</h2>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-550/10 px-2 py-0.5 rounded-full">
                    {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Listed
                  </span>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-450 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
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
                          <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                            <td className="py-3.5">
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{job.title}</span>
                              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold block">{job.type} - {job.location}</span>
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
                                  ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450'
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
                                className="p-1.5 text-slate-450 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-50 dark:bg-slate-850 rounded-lg inline-flex cursor-pointer border border-slate-100 dark:border-slate-800"
                                title="Edit Listing"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleJob(job)}
                                className={`p-1.5 rounded-lg inline-flex cursor-pointer border ${
                                  job.status === 'Closed' || job.status === 'Expired'
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                    : 'text-slate-450 hover:text-amber-600 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-850 border-slate-100 dark:border-slate-800'
                                }`}
                                title={job.status === 'Closed' || job.status === 'Expired' ? 'Reopen job for applications' : 'Close job for applications'}
                              >
                                {job.status === 'Closed' || job.status === 'Expired' ? <FiCheck className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-1.5 text-slate-450 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-850 rounded-lg inline-flex cursor-pointer border border-slate-100 dark:border-slate-800"
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

            {/* Right Sidebar: Compact Company Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                  <FiLayers className="w-5 h-5 text-sky-600" />
                  <h2 className="font-extrabold text-slate-800 dark:text-white text-base">Company Summary</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-600 text-white flex items-center justify-center font-black text-lg rounded-xl border border-sky-500 shadow-sm shadow-sky-500/20">
                      {companyInitial}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 leading-none">
                        {company?.company_name || currentEmployer?.companyName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold mt-1.5 block">
                        Industry: {company?.industry || 'Technology'}
                      </span>
                    </div>
                  </div>

                  {/* Profile Completion Bar */}
                  <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-200">
                      <span>Recruiter profile complete</span>
                      <span className="text-sky-650 dark:text-sky-400">{company?.onboarding_completed ? '100%' : '85%'}</span>
                    </div>
                    <ProgressBar value={company?.onboarding_completed ? 100 : 85} showPercentage={false} size="sm" />
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
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-400 font-bold">Location</span>
                      <span className="text-slate-700 dark:text-slate-200 font-bold">{company?.headquarters || 'Remote, India'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Widgets Grid: Recent Applications & Today's Interviews & Notifications Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Applications Widget */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <FiUsers className="w-5 h-5 text-sky-600" />
                <h2 className="font-extrabold text-slate-800 dark:text-white text-base">Recent Applications</h2>
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
                        <span className="font-extrabold text-slate-850 dark:text-slate-100 block">{app.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold block">{app.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                            : app.status === 'Rejected'
                            ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450'
                            : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                        }`}>
                          {app.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-100/50 dark:border-slate-800 hidden sm:inline-block">
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

            {/* Today's Interviews & Notifications Stack */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
              {/* Today's Interviews Sub-widget */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-250">
                  <FiCalendar className="w-4.5 h-4.5 text-sky-600" />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Today's Scheduled Interviews</h3>
                  <button
                    onClick={openCalendar}
                    className="ml-auto flex items-center gap-1 px-2 py-1 text-[9px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 rounded-lg border border-sky-100 dark:border-sky-900/30 cursor-pointer hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                  >
                    <FiCalendar className="w-3 h-3" /> View Calendar
                  </button>
                </div>
                {interviews.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-450 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No interviews scheduled for today's date.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {interviews.map((int, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-850/30 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{int.candidate}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">{int.round}</span>
                        </div>
                        <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900/30">
                          {int.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications Sub-widget */}
              <div className="space-y-3 pt-3 border-t border-slate-150 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-250">
                  <FiBell className="w-4.5 h-4.5 text-sky-600" />
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">System Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-3">
                    No active notifications.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs max-h-40 overflow-y-auto">
                    {notifications.map((note, idx) => (
                      <div key={idx} className="flex gap-2 items-start animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-500 mt-1.5 shrink-0" />
                        <p className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] leading-relaxed">
                          {note.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Redesigned Recruiter Analytics Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6">
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
                                <circle cx={p.x} cy={p.y} r="3" className="fill-sky-650 stroke-white dark:stroke-slate-900 stroke-2" />
                                <title>{`${p.data.label}: ${p.data.count} applications`}</title>
                              </g>
                            ))}
                          </svg>
                        );
                      })()}
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-450 dark:text-slate-500 font-bold px-8 mt-1">
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
                  <div className="h-44 flex items-center justify-center text-xs text-slate-450">No Job Listings Posted Yet</div>
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
                  <div className="h-44 flex items-center justify-center text-xs text-slate-450">No Postings in the Current Period</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="h-40 flex items-end justify-center gap-4 px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                      {(() => {
                        const trendMax = Math.max(...analytics.monthlyTrend.map(d => d.count), 1);
                        return analytics.monthlyTrend.map((data, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-1 group relative min-w-[24px]">
                            <div className="absolute bottom-[calc(100%-2px)] mb-1 bg-slate-900 dark:bg-slate-950 text-[8px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              {data.count} posted
                            </div>
                            <span className="text-[8px] text-slate-550 font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity">{data.count}</span>
                            <div
                              style={{ height: `${(data.count / trendMax) * 110}px` }}
                              className="w-4 min-h-[4px] bg-sky-600 hover:bg-sky-500 rounded-t-md transition-all shadow-sm"
                            ></div>
                          </div>
                        ));
                      })()}
                    </div>
                    <div className="flex justify-center gap-4 text-[9px] text-slate-500 font-bold px-2">
                      {analytics.monthlyTrend.map((d, idx) => (
                        <span key={idx} className="w-4 text-center truncate">{d.label}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </main>
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
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Schedule Candidate Interview</h3>
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
                  Schedule
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
                          <div key={iv.id} className="p-2.5 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs block">{iv.candidate}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">
                                {iv.round} · {iv.jobTitle}
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1 rounded-lg border border-sky-100 dark:border-sky-900/30">
                              {iv.time}
                            </span>
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
    </div>
  );
};

export default EmployerDashboard;
