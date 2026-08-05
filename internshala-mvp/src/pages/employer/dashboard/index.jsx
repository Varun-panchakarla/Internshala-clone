import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiBriefcase, FiCalendar, FiMail, FiBarChart2, FiSettings, FiLogOut, FiBell
} from 'react-icons/fi';
import { useEmployerAuth } from '../../../context/EmployerAuthContext';
import { useToast } from '../../../components/common/Toast';
import ThemeToggle from '../../../components/common/ThemeToggle';
import Logo from '../../../components/common/Logo';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { employerDashboardService } from '../../../services/employerDashboard';
import { employerService } from '../../../services/mockApi';
import OverviewView from './OverviewView';
import ApplicationsView from './ApplicationsView';
import JobsView from './JobsView';
import InterviewsView from './InterviewsView';
import MessagesView from './MessagesView';
import AnalyticsView from './AnalyticsView';
import SettingsView from './SettingsView';

const TABS = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'applications', label: 'Applications', icon: FiUsers },
  { id: 'jobs', label: 'Jobs', icon: FiBriefcase },
  { id: 'interviews', label: 'Interviews', icon: FiCalendar },
  { id: 'messages', label: 'Messages', icon: FiMail },
  { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
  { id: 'settings', label: 'Settings', icon: FiSettings }
];

const dataUrlToBlob = (dataUrl, mime) => {
  const parts = String(dataUrl || '').split(',');
  const meta = parts[0] || '';
  const type = mime || (meta.match(/:(.*?);/) || [])[1] || 'application/pdf';
  const byteString = atob(parts[1] || '');
  const ab = new ArrayBuffer(byteString.length);
  const u8 = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) u8[i] = byteString.charCodeAt(i);
  return new Blob([ab], { type });
};

export default function EmployerDashboard() {
  const { currentEmployer, logout } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [company, setCompany] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [openCandidate, setOpenCandidate] = useState(null);
  const [focusApplication, setFocusApplication] = useState(null);
  const [schedulePrefill, setSchedulePrefill] = useState(null);
  const [postJobRequest, setPostJobRequest] = useState(false);
  const [saveProfileState, setSaveProfileState] = useState({ saving: false, saved: false });

  const loadingRef = useRef(false);

  const fetchAll = useCallback(async (silent = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    if (!silent) setLoading(true);

    const results = await Promise.allSettled([
      employerDashboardService.getMetrics(),
      employerDashboardService.getJobs(),
      employerDashboardService.getApplications(),
      employerDashboardService.getInterviews(),
      employerDashboardService.getNotifications(),
      employerDashboardService.getAnalytics(),
      employerDashboardService.getCompany(),
      employerDashboardService.getEmployerConversations(),
      employerDashboardService.getEmployerUnread()
    ]);

    const data = results.map(r => (r.status === 'fulfilled' ? r.value.data : null));

    const [m, j, a, iv, n, an, c, con, unread] = data;
    if (m) setMetrics(m);
    if (j?.jobs) setJobs(j.jobs);
    if (a?.applications) setApplications(a.applications);
    if (iv?.interviews) setInterviews(iv.interviews);
    if (n?.notifications) setNotifications(n.notifications);
    if (an) setAnalytics(an);
    if (c?.company) setCompany(c.company);
    if (con) setConversations(Array.isArray(con) ? con : con.conversations || []);
    if (unread) setUnreadCount(unread.count ?? 0);

    loadingRef.current = false;
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(() => fetchAll(true), 60000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const handleLogout = async () => {
    await logout();
    navigate('/employer/login');
  };

  const toast = (msg, type = 'success') => addToast(msg, type);

  // ---------- Applications ----------
  const onStatusChange = useCallback(async (applicationId, status) => {
    try {
      await employerDashboardService.updateApplicationStatus(applicationId, status);
      setApplications(prev => prev.map(app =>
        app.applicationId === applicationId ? { ...app, status } : app
      ));
      toast(status === 'Rejected' ? 'Application rejected.' : `Application moved to ${status}.`);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update status', 'error');
    }
  }, [toast]);

  const getResume = useCallback(async (app) => {
    try {
      const res = await employerDashboardService.getResume(app.applicationId);
      const { fileData, fileType, fileName } = res.data || {};
      return { fileData, fileType, fileName };
    } catch (err) {
      return { error: err.response?.data?.error || 'Failed to load resume.' };
    }
  }, []);

  const getApplicantDetail = useCallback(async (applicationId) => {
    try {
      const res = await employerDashboardService.getApplicantDetail(applicationId);
      return res.data;
    } catch (err) {
      return { error: err.response?.data?.error || 'Failed to load applicant details.' };
    }
  }, []);

  const downloadResume = useCallback(async (app) => {
    try {
      const res = await employerDashboardService.getResume(app.applicationId);
      const { fileData, fileType, fileName } = res.data || {};
      if (!fileData) throw new Error('No resume file');
      const blob = dataUrlToBlob(fileData, fileType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `resume_${app.name || 'candidate'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Resume downloaded.');
    } catch (err) {
      toast(err.response?.data?.error || 'No resume uploaded for this candidate.', 'error');
    }
  }, [toast]);

  const previewResume = useCallback(async (app) => {
    const r = await getResume(app);
    return r;
  }, [getResume]);

  const openMessages = useCallback((app) => {
    setOpenCandidate({ userId: app.userId, name: app.name, email: app.email });
    setActiveTab('messages');
  }, []);

  const onScheduleInterview = useCallback(async (data) => {
    try {
      const res = await employerDashboardService.scheduleInterview(data);
      toast(res.data?.message || 'Interview scheduled.');
      fetchAll(true);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to schedule interview.', 'error');
      throw err;
    }
  }, [toast, fetchAll]);

  const onScheduleInterviewFromApp = useCallback((app) => {
    setSchedulePrefill({ email: app.email, jobId: app.jobId });
    setActiveTab('interviews');
  }, []);

  // ---------- Jobs ----------
  const onPostJob = useCallback(async (form) => {
    try {
      await employerDashboardService.postJob(form);
      toast('Job posted successfully!');
      fetchAll(true);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to post job.', 'error');
    }
  }, [toast, fetchAll]);

  const onUpdateJob = useCallback(async (id, form) => {
    try {
      await employerDashboardService.updateJob(id, form);
      toast('Job updated.');
      fetchAll(true);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update job.', 'error');
    }
  }, [toast, fetchAll]);

  const onToggleJob = useCallback(async (id, isActive) => {
    try {
      await employerDashboardService.toggleJob(id, isActive);
      setJobs(prev => prev.map(j =>
        j.id === id ? { ...j, status: isActive ? 'Active' : 'Closed', isActive } : j
      ));
      toast(isActive ? 'Job reopened.' : 'Job closed for applications.');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update job.', 'error');
    }
  }, [toast]);

  const onDeleteJob = useCallback(async (id) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await employerDashboardService.deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
      toast('Job deleted.');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete job.', 'error');
    }
  }, [toast]);

  const getApplicantsForJob = useCallback(async (jobId) => {
    try {
      const res = await employerDashboardService.getApplicantsForJob(jobId);
      return res.data;
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to load applicants.', 'error');
      return { applicants: [] };
    }
  }, [toast]);

  const onViewApplicant = useCallback((app) => {
    setActiveTab('applications');
    setFocusApplication(app);
  }, []);

  // ---------- Interviews ----------
  const onUpdateInterview = useCallback(async (id, data) => {
    try {
      const res = await employerDashboardService.updateInterview(id, data);
      toast(res.data?.message || 'Interview updated.');
      fetchAll(true);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to update interview.', 'error');
    }
  }, [toast, fetchAll]);

  // ---------- Notifications ----------
  const onMarkNotificationsRead = useCallback(async () => {
    try {
      await employerDashboardService.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  }, []);

  // ---------- Company ----------
  const onSaveCompany = useCallback(async (form) => {
    setSaveProfileState({ saving: true, saved: false });
    try {
      const res = await employerService.updateProfile(form);
      const profile = res.data?.profile;
      if (profile) {
        setCompany(prev => ({ ...(prev || {}), ...form, ...profile }));
      }
      toast('Company profile saved.');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to save profile.', 'error');
    } finally {
      setSaveProfileState({ saving: false, saved: true });
    }
  }, [toast]);

  // ---------- Messages ----------
  const getThread = useCallback(async (userId) => {
    try {
      const res = await employerDashboardService.getEmployerThread(userId);
      fetchAll(true);
      return res.data;
    } catch (err) {
      toast('Failed to load conversation.', 'error');
      return { messages: [] };
    }
  }, [toast, fetchAll]);

  const sendMessage = useCallback(async (userId, content) => {
    try {
      await employerDashboardService.sendEmployerMessage(userId, content);
      fetchAll(true);
      return true;
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to send message.', 'error');
      return false;
    }
  }, [toast, fetchAll]);

  const goTo = useCallback((tab, opts = {}) => {
    if (opts.post) {
      setPostJobRequest(true);
      setActiveTab('jobs');
    } else {
      setActiveTab(tab);
    }
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewView
            metrics={metrics}
            recentApplications={applications.slice(0, 6)}
            interviews={interviews}
            notifications={notifications}
            loading={loading}
            onGoTo={goTo}
            onViewApplication={onViewApplicant}
            onScheduleInterview={() => goTo('interviews')}
            onMarkNotificationsRead={onMarkNotificationsRead}
          />
        );
      case 'applications':
        return (
          <ApplicationsView
            applications={applications}
            jobs={jobs}
            onStatusChange={onStatusChange}
            onScheduleInterview={onScheduleInterviewFromApp}
            onMessage={openMessages}
            getResume={getResume}
            previewResume={previewResume}
            downloadResume={downloadResume}
            getApplicantDetail={getApplicantDetail}
            focusApplication={focusApplication}
            clearFocus={() => setFocusApplication(null)}
          />
        );
      case 'jobs':
        return (
          <JobsView
            jobs={jobs}
            onPostJob={onPostJob}
            onUpdateJob={onUpdateJob}
            onToggleJob={onToggleJob}
            onDeleteJob={onDeleteJob}
            getApplicantsForJob={getApplicantsForJob}
            onViewApplicant={onViewApplicant}
            postRequest={postJobRequest}
            clearPostRequest={() => setPostJobRequest(false)}
          />
        );
      case 'interviews':
        return (
          <InterviewsView
            interviews={interviews}
            applications={applications}
            jobs={jobs}
            onSchedule={onScheduleInterview}
            onUpdate={onUpdateInterview}
            loading={loading}
            schedulePrefill={schedulePrefill}
            clearSchedulePrefill={() => setSchedulePrefill(null)}
          />
        );
      case 'messages':
        return (
          <MessagesView
            conversations={conversations}
            getThread={getThread}
            sendMessage={sendMessage}
            openCandidate={openCandidate}
            clearOpenCandidate={() => setOpenCandidate(null)}
            loading={loading}
          />
        );
      case 'analytics':
        return <AnalyticsView analytics={analytics} loading={loading} />;
      case 'settings':
        return (
          <SettingsView
            company={company}
            onSave={onSaveCompany}
            saving={saveProfileState.saving}
            saved={saveProfileState.saved}
          />
        );
      default:
        return null;
    }
  };

  // Prefill interview scheduling from an application when arriving from Applications

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
          <button onClick={() => navigate('/')} className="shrink-0 cursor-pointer">
            <Logo />
          </button>
          <div className="hidden sm:block min-w-0 flex-1 ml-2">
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">
              {currentEmployer?.companyName || 'Company Dashboard'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              {currentEmployer?.recruiterName ? `${currentEmployer.recruiterName} · ` : ''}Recruiter workspace
            </p>
          </div>

          <div className="flex-1 sm:hidden" />

          <button
            onClick={() => setActiveTab('overview')}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Notifications"
          >
            <FiBell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            title="Logout"
          >
            <FiLogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex flex-col w-56 shrink-0 sticky top-14 h-[calc(100vh-56px)] px-3 py-4 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id === 'messages' && unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">{unreadCount}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold px-3">
              {currentEmployer?.recruiterName || 'Recruiter'} · {currentEmployer?.companyName || 'Company'}
            </p>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="md:hidden px-4 pt-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <main className="p-4 sm:p-6 max-w-7xl mx-auto">
            {loading && !metrics ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <LoadingSpinner />
                <p className="text-xs font-semibold mt-3">Loading your dashboard...</p>
              </div>
            ) : (
              renderTab()
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
