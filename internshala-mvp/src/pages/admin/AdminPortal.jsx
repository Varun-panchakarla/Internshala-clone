import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import axios from 'axios';
import {
  FiUsers, FiBriefcase, FiFolder, FiFileText, FiTrendingUp, FiActivity,
  FiBell, FiSettings, FiLogOut, FiPlus, FiTrash2, FiEdit, FiSearch,
  FiSliders, FiCheck, FiX, FiCheckCircle, FiInfo, FiChevronRight,
  FiChevronLeft, FiExternalLink, FiUpload, FiMenu, FiCpu, FiGrid, FiUser, FiMapPin, FiClock
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminPortal = () => {
  const { currentUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Navigation View (Dashboard by default)
  const currentView = searchParams.get('view') || 'dashboard';

  // State Management
  const [stats, setStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [recentRegs, setRecentRegs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // CRUD specific states
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('');

  const [jobs, setJobs] = useState([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsSearch, setJobsSearch] = useState('');

  const [applications, setApplications] = useState([]);
  const [appsTotal, setAppsTotal] = useState(0);
  const [appsPage, setAppsPage] = useState(1);
  const [appsSearch, setAppsSearch] = useState('');
  const [appsStatusFilter, setAppsStatusFilter] = useState('');

  const [companies, setCompanies] = useState([]);
  
  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'candidate' });

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '', company: '', location: '', salary: '', experience: '', employmentType: 'Full-time', skills: '', description: ''
  });

  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null, message: '' });

  // Load Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
      setGrowthData(res.data.growthData);
      setRecentRegs(res.data.recentRegistrations);
      setRecentJobs(res.data.recentJobs);
    } catch (err) {
      addToast('Failed to fetch dashboard metrics.', 'error');
    }
  };

  // Load Users List
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        params: { search: usersSearch, role: usersRoleFilter, page: usersPage, limit: 8 }
      });
      setUsers(res.data.users);
      setUsersTotal(res.data.total);
    } catch (err) {
      addToast('Failed to load users list.', 'error');
    }
  };

  // Load Jobs List
  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/admin/jobs', {
        params: { search: jobsSearch, page: jobsPage, limit: 8 }
      });
      setJobs(res.data.jobs);
      setJobsTotal(res.data.total);
    } catch (err) {
      addToast('Failed to load jobs list.', 'error');
    }
  };

  // Load Applications List
  const fetchApplications = async () => {
    try {
      const res = await axios.get('/api/admin/applications', {
        params: { search: appsSearch, status: appsStatusFilter, page: appsPage, limit: 8 }
      });
      setApplications(res.data.applications);
      setAppsTotal(res.data.total);
    } catch (err) {
      addToast('Failed to load applications.', 'error');
    }
  };

  // Load Companies List
  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/admin/companies');
      setCompanies(res.data.companies);
    } catch (err) {
      addToast('Failed to load companies.', 'error');
    }
  };

  // Effect to load data based on selected view
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (currentView === 'dashboard') {
        await fetchStats();
      } else if (currentView === 'users' || currentView === 'recruiters') {
        // Reset query filter on change
        setUsersRoleFilter(currentView === 'recruiters' ? 'recruiter' : '');
        setUsersPage(1);
      } else if (currentView === 'jobs') {
        setJobsPage(1);
        await fetchJobs();
      } else if (currentView === 'applications') {
        setAppsPage(1);
        await fetchApplications();
      } else if (currentView === 'companies') {
        await fetchCompanies();
      }
      setLoading(false);
    };
    loadData();
  }, [currentView]);

  // Effect to trigger search/pagination re-fetches
  useEffect(() => {
    if (currentView === 'users' || currentView === 'recruiters') {
      fetchUsers();
    }
  }, [usersPage, usersSearch, usersRoleFilter]);

  useEffect(() => {
    if (currentView === 'jobs') {
      fetchJobs();
    }
  }, [jobsPage, jobsSearch]);

  useEffect(() => {
    if (currentView === 'applications') {
      fetchApplications();
    }
  }, [appsPage, appsSearch, appsStatusFilter]);

  // CRUD - User save (Create / Update)
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/admin/users/${editingUser.id}`, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role
        });
        addToast('User details updated successfully!', 'success');
      } else {
        await axios.post('/api/admin/users', userForm);
        addToast('New user account created successfully!', 'success');
      }
      setUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save user.', 'error');
    }
  };

  // CRUD - Job save (Create / Update)
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await axios.put(`/api/admin/jobs/${editingJob.id}`, jobForm);
        addToast('Job details updated successfully!', 'success');
      } else {
        await axios.post('/api/admin/jobs', jobForm);
        addToast('New job opportunity posted successfully!', 'success');
      }
      setJobModalOpen(false);
      fetchJobs();
    } catch (err) {
      addToast('Failed to save job details.', 'error');
    }
  };

  // CRUD - Delete handler
  const handleConfirmDelete = async () => {
    const { type, id } = confirmModal;
    try {
      if (type === 'user') {
        await axios.delete(`/api/admin/users/${id}`);
        addToast('User account successfully deleted.', 'success');
        fetchUsers();
      } else if (type === 'job') {
        await axios.delete(`/api/admin/jobs/${id}`);
        addToast('Job posting successfully deleted.', 'success');
        fetchJobs();
      } else if (type === 'application') {
        await axios.delete(`/api/admin/applications/${id}`);
        addToast('Application log successfully deleted.', 'success');
        fetchApplications();
      }
      setConfirmModal({ open: false, type: '', id: null, message: '' });
    } catch (err) {
      addToast('Failed to delete item.', 'error');
    }
  };

  // CRUD - Application status change
  const handleAppStatusChange = async (appId, newStatus) => {
    try {
      await axios.put(`/api/admin/applications/${appId}`, { status: newStatus });
      addToast(`Application status updated to ${newStatus}.`, 'success');
      fetchApplications();
    } catch (err) {
      addToast('Failed to update status.', 'error');
    }
  };

  // Helper: sets the view parameter in search params
  const setView = (viewName) => {
    setSearchParams({ view: viewName });
    setMobileSidebarOpen(false);
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  // Sidebar Links config
  const navLinks = [
    { name: 'Dashboard', icon: FiGrid, view: 'dashboard' },
    { name: 'Users', icon: FiUser, view: 'users' },
    { name: 'Recruiters', icon: FiUsers, view: 'recruiters' },
    { name: 'Companies', icon: FiBriefcase, view: 'companies' },
    { name: 'Jobs', icon: FiCpu, view: 'jobs' },
    { name: 'Applications', icon: FiFolder, view: 'applications' },
    { name: 'Resume Templates', icon: FiFileText, view: 'templates' },
    { name: 'Analytics', icon: FiTrendingUp, view: 'analytics' },
    { name: 'Reports', icon: FiActivity, view: 'reports' },
    { name: 'Notifications', icon: FiBell, view: 'notifications' },
    { name: 'Settings', icon: FiSettings, view: 'settings' }
  ];

  return (
    <div className="min-h-screen bg-[#060d1b] text-slate-100 flex font-sans">
      
      {/* ─── DESKTOP SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a1222] border-r border-slate-800/80 shrink-0 sticky top-0 h-screen transition-all">
        <div className="h-16 px-6 border-b border-slate-800/85 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-black text-white text-base">
              I
            </div>
            <div>
              <p className="font-extrabold text-sm tracking-tight leading-none">IncuXAI Careers</p>
              <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider mt-0.5">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.view;
            return (
              <button
                key={link.view}
                onClick={() => setView(link.view)}
                className={`w-full group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-650/15 text-brand-400 border-l-4 border-brand-500'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/85">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER SIDEBAR ───────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setMobileSidebarOpen(false)}>
          <aside className="w-64 bg-[#0a1222] border-r border-slate-800 flex flex-col h-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center font-black text-white text-base">I</div>
                <span className="font-extrabold text-sm">IncuXAI Admin</span>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentView === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => setView(link.view)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold ${
                      isActive ? 'bg-brand-500/10 text-brand-400' : 'text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button onClick={handleLogoutClick} className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-semibold text-rose-450 hover:bg-rose-500/10 cursor-pointer">
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── MAIN APP CONTENT AREA ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top navigation control bar */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0a1222] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-xl"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-extrabold capitalize tracking-tight text-white flex items-center gap-2">
              <span>Admin</span>
              <FiChevronRight className="w-4 h-4 text-slate-500" />
              <span className="text-brand-400">{currentView}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-200">{currentUser?.name}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{currentUser?.role || 'Admin'}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-850 flex items-center justify-center font-black text-white text-sm shadow-md ring-1 ring-slate-700/60">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content body container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-screen-xl w-full mx-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner text="Retrieving administrative data..." />
            </div>
          ) : (
            <div className="animate-slide-up">
              
              {/* ──────────────────────────────────────────────────────────────
                 VIEW: DASHBOARD
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'dashboard' && stats && (
                <div className="flex flex-col gap-6">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'from-brand-500 to-brand-600', trend: `Candidates: ${stats.candidates} | Recruiters: ${stats.recruiters}` },
                      { name: 'Active Jobs', value: stats.activeJobs, icon: FiCpu, color: 'from-emerald-500 to-emerald-600', trend: 'Fresh postings active' },
                      { name: 'Applications', value: stats.totalApplications, icon: FiFolder, color: 'from-indigo-500 to-indigo-600', trend: `${stats.pendingApplications} pending review` },
                      { name: 'Estimated Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: FiActivity, color: 'from-amber-500 to-amber-600', trend: 'Mock revenue projections' }
                    ].map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <div key={i} className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group shadow-lg">
                          <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${card.color} opacity-[0.03] rounded-bl-full group-hover:scale-110 transition-transform duration-300`}></div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.name}</span>
                            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                              <Icon className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                          <p className="text-2xl font-black text-white leading-none mb-2">{card.value}</p>
                          <p className="text-[10px] text-slate-555 font-medium leading-none truncate">{card.trend}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual Growth SVG Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-6">User & Application Growth Trend</h3>
                      <div className="relative w-full h-48 flex items-end">
                        <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2"/>
                              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
                            </linearGradient>
                            <linearGradient id="chartGradApps" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2"/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                          {/* Grid Lines */}
                          <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.5"/>
                          <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.5"/>
                          <line x1="0" y1="150" x2="500" y2="150" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.5"/>

                          {/* Users Line & Area */}
                          <path d="M 10 180 L 100 160 L 190 135 L 280 110 L 370 85 L 460 50" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
                          <path d="M 10 180 L 100 160 L 190 135 L 280 110 L 370 85 L 460 50 L 460 190 L 10 190 Z" fill="url(#chartGradUsers)" />

                          {/* Apps Line & Area */}
                          <path d="M 10 190 L 100 178 L 190 150 L 280 120 L 370 95 L 460 70" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
                          <path d="M 10 190 L 100 178 L 190 150 L 280 120 L 370 95 L 460 70 L 460 190 L 10 190 Z" fill="url(#chartGradApps)" />
                        </svg>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold px-2 mt-3">
                        {growthData.map((d, i) => (
                          <span key={i}>{d.month}</span>
                        ))}
                      </div>
                      <div className="flex justify-center items-center gap-6 mt-4 pt-4 border-t border-slate-800/80 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span> New Candidates</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span> Job Applications</span>
                      </div>
                    </div>

                    <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-6">Quick Shortcuts</h3>
                        <div className="grid grid-cols-1 gap-2.5">
                          <button onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', password: '', role: 'candidate' }); setUserModalOpen(true); }} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors text-left cursor-pointer">
                            <span className="flex items-center gap-2"><FiPlus className="text-brand-400" /> Register User Account</span>
                            <FiChevronRight className="text-slate-500" />
                          </button>
                          <button onClick={() => { setEditingJob(null); setJobForm({ title: '', company: '', location: '', salary: '', experience: '', employmentType: 'Full-time', skills: '', description: '' }); setJobModalOpen(true); }} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors text-left cursor-pointer">
                            <span className="flex items-center gap-2"><FiPlus className="text-emerald-400" /> Post New Job Opportunity</span>
                            <FiChevronRight className="text-slate-500" />
                          </button>
                          <button onClick={() => setView('notifications')} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors text-left cursor-pointer">
                            <span className="flex items-center gap-2"><FiBell className="text-violet-400" /> Broadcast System Alert</span>
                            <FiChevronRight className="text-slate-500" />
                          </button>
                          <button onClick={() => setView('reports')} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors text-left cursor-pointer">
                            <span className="flex items-center gap-2"><FiFileText className="text-amber-400" /> Print Summary Report</span>
                            <FiChevronRight className="text-slate-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 text-xs text-brand-400 leading-normal flex items-start gap-2.5 mt-4">
                        <FiInfo className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>System metrics synced. Local server and Supabase Postgres database links are fully operational.</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Registrations */}
                    <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Recent Registrations</h3>
                        <button onClick={() => setView('users')} className="text-xs font-bold text-brand-450 hover:underline">View All</button>
                      </div>
                      <div className="divide-y divide-slate-800/80">
                        {recentRegs.map((user) => (
                          <div key={user.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">{user.name}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{user.email}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              user.role === 'admin' || user.role === 'super_admin'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : user.role === 'recruiter'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Job Postings */}
                    <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Recent Job Postings</h3>
                        <button onClick={() => setView('jobs')} className="text-xs font-bold text-brand-450 hover:underline">View All</button>
                      </div>
                      <div className="divide-y divide-slate-800/80">
                        {recentJobs.map((job) => (
                          <div key={job.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                                {job.company.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white leading-none">{job.title}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{job.company} • {job.location}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-550 font-bold whitespace-nowrap">{job.employment_type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: USERS & RECRUITERS
              ────────────────────────────────────────────────────────────── */}
              {(currentView === 'users' || currentView === 'recruiters') && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  {/* List Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <div className="relative flex-1 flex items-center">
                        <FiSearch className="absolute left-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={usersSearch}
                          onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-slate-200"
                        />
                      </div>
                      {currentView === 'users' && (
                        <select
                          value={usersRoleFilter}
                          onChange={(e) => { setUsersRoleFilter(e.target.value); setUsersPage(1); }}
                          className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
                        >
                          <option value="">All Roles</option>
                          <option value="candidate">Candidate</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setUserForm({ name: '', email: '', password: '', role: currentView === 'recruiters' ? 'recruiter' : 'candidate' });
                        setUserModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4" /> Add User Account
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-550 font-bold">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Academic Background</th>
                          <th className="py-3 px-4">Registered On</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {users.map((user) => (
                          <tr key={user.id} className="text-xs hover:bg-slate-800/10 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300 shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 font-semibold">{user.email}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                user.role === 'admin' || user.role === 'super_admin'
                                  ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                                  : user.role === 'recruiter'
                                  ? 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {user.college ? (
                                <p className="truncate max-w-xs">{user.college} ({user.degree || 'N/A'})</p>
                              ) : (
                                <span className="text-slate-600 italic">No academic data</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-medium">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingUser(user);
                                    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
                                    setUserModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-700/50 bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-white"
                                  title="Edit User"
                                >
                                  <FiEdit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({
                                    open: true,
                                    type: 'user',
                                    id: user.id,
                                    message: `Are you sure you want to delete user "${user.name}"? This action will permanently remove their profile, applications, and credentials.`
                                  })}
                                  className="p-1.5 rounded-lg border border-rose-900/40 bg-rose-950/15 text-rose-400 hover:bg-rose-900/35 hover:text-white"
                                  title="Delete User"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {users.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-25" />
                      <p className="font-bold text-sm">No user accounts found matching query parameters.</p>
                    </div>
                  )}

                  {/* Pagination footer controls */}
                  {usersTotal > 8 && (
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Showing {(usersPage - 1) * 8 + 1} - {Math.min(usersPage * 8, usersTotal)} of {usersTotal} Users</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                          disabled={usersPage === 1}
                          className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setUsersPage(prev => Math.min(Math.ceil(usersTotal / 8), prev + 1))}
                          disabled={usersPage * 8 >= usersTotal}
                          className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: COMPANIES
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'companies' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Registered Companies</h3>
                    <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full uppercase">{companies.length} Total</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {companies.map((comp, i) => (
                      <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center hover:border-slate-700 transition-all shadow-md">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white mb-3 shadow-inner border border-slate-800"
                          style={{ backgroundColor: comp.logo_color || '#1e293b' }}
                        >
                          {comp.company.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="text-xs font-bold text-white leading-tight mb-1">{comp.company}</h4>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Recruiter Profile</span>
                      </div>
                    ))}
                  </div>

                  {companies.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                      <FiBriefcase className="w-12 h-12 mx-auto mb-4 opacity-25" />
                      <p className="font-bold text-sm">No companies registered in database.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: JOBS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'jobs' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  {/* List Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="relative flex-1 max-w-md flex items-center">
                      <FiSearch className="absolute left-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search jobs by title or company..."
                        value={jobsSearch}
                        onChange={(e) => { setJobsSearch(e.target.value); setJobsPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-slate-200"
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        setEditingJob(null);
                        setJobForm({ title: '', company: '', location: '', salary: '', experience: '', employmentType: 'Full-time', skills: '', description: '' });
                        setJobModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 rounded-xl text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4" /> Post New Job
                    </button>
                  </div>

                  {/* Jobs List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-5 flex items-start gap-4 hover:border-slate-700 transition-all relative group shadow-lg">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base text-white shadow-inner border border-slate-800"
                          style={{ backgroundColor: job.logo_color || '#1e293b' }}
                        >
                          {job.company.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-white leading-tight mb-1 truncate">{job.title}</h4>
                          <p className="text-[10px] text-brand-400 font-bold mb-3">{job.company}</p>
                          
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-semibold mb-3">
                            <span className="flex items-center gap-1"><FiMapPin className="text-slate-550" /> {job.location}</span>
                            <span className="flex items-center gap-1"><FiClock className="text-slate-550" /> {job.employment_type}</span>
                            <span className="text-emerald-450 font-bold">{job.salary}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {job.skills.slice(0, 3).map((skill, si) => (
                              <span key={si} className="bg-slate-800/70 border border-slate-700/40 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                            {job.skills.length > 3 && (
                              <span className="text-[9px] text-slate-500 font-bold py-0.5">+{job.skills.length - 3} more</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0 self-start">
                          <button
                            onClick={() => {
                              setEditingJob(job);
                              setJobForm({
                                title: job.title,
                                company: job.company,
                                location: job.location,
                                salary: job.salary,
                                experience: job.experience,
                                employmentType: job.employment_type,
                                skills: job.skills.join(', '),
                                description: job.description
                              });
                              setJobModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-700/50 bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-white"
                            title="Edit Job"
                          >
                            <FiEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmModal({
                              open: true,
                              type: 'job',
                              id: job.id,
                              message: `Are you sure you want to delete job posting "${job.title}" at "${job.company}"? This will remove all associated applications and candidate logs.`
                            })}
                            className="p-1.5 rounded-lg border border-rose-900/40 bg-rose-950/15 text-rose-450 hover:bg-rose-900/35 hover:text-white"
                            title="Delete Job"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {jobs.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <FiBriefcase className="w-12 h-12 mx-auto mb-4 opacity-25" />
                      <p className="font-bold text-sm">No jobs listed matching query.</p>
                    </div>
                  )}

                  {/* Pagination footer controls */}
                  {jobsTotal > 8 && (
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Showing {(jobsPage - 1) * 8 + 1} - {Math.min(jobsPage * 8, jobsTotal)} of {jobsTotal} Jobs</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setJobsPage(prev => Math.max(1, prev - 1))}
                          disabled={jobsPage === 1}
                          className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setJobsPage(prev => Math.min(Math.ceil(jobsTotal / 8), prev + 1))}
                          disabled={jobsPage * 8 >= jobsTotal}
                          className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: APPLICATIONS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'applications' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  {/* List Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <div className="relative flex-1 flex items-center">
                        <FiSearch className="absolute left-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search candidates, roles, companies..."
                          value={appsSearch}
                          onChange={(e) => { setAppsSearch(e.target.value); setAppsPage(1); }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-slate-200"
                        />
                      </div>
                      <select
                        value={appsStatusFilter}
                        onChange={(e) => { setAppsStatusFilter(e.target.value); setAppsPage(1); }}
                        className="px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Applications List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-550 font-bold">
                          <th className="py-3 px-4">Candidate</th>
                          <th className="py-3 px-4">Job Opportunity</th>
                          <th className="py-3 px-4">Applied Date</th>
                          <th className="py-3 px-4">Status Review</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {applications.map((app) => (
                          <tr key={app.id} className="text-xs hover:bg-slate-800/10 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">
                              <p className="font-bold text-white">{app.candidate_name}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{app.candidate_email}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 font-semibold">
                              <p className="text-white">{app.job_title}</p>
                              <p className="text-[10px] text-brand-400 mt-0.5">{app.job_company}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-medium">
                              {new Date(app.applied_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={app.status}
                                onChange={(e) => handleAppStatusChange(app.id, e.target.value)}
                                className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider focus:outline-none border cursor-pointer ${
                                  app.status === 'Accepted'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : app.status === 'Rejected'
                                    ? 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                                    : app.status === 'Shortlisted' || app.status === 'Interviewing'
                                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700/50'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setConfirmModal({
                                  open: true,
                                  type: 'application',
                                  id: app.id,
                                  message: `Are you sure you want to delete application logs for candidate "${app.candidate_name}" applying to "${app.job_title}"?`
                                })}
                                className="p-1.5 rounded-lg border border-rose-900/40 bg-rose-950/15 text-rose-450 hover:bg-rose-900/35 hover:text-white"
                                title="Delete Log"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {applications.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <FiFolder className="w-12 h-12 mx-auto mb-4 opacity-25" />
                      <p className="font-bold text-sm">No applications found matching parameters.</p>
                    </div>
                  )}

                  {/* Pagination footer controls */}
                  {appsTotal > 8 && (
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Showing {(appsPage - 1) * 8 + 1} - {Math.min(appsPage * 8, appsTotal)} of {appsTotal} Apps</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAppsPage(prev => Math.max(1, prev - 1))}
                          disabled={appsPage === 1}
                          className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAppsPage(prev => Math.min(Math.ceil(appsTotal / 8), prev + 1))}
                          disabled={appsPage * 8 >= appsTotal}
                          className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                        >
                          <FiChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: RESUME TEMPLATES
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'templates' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">System Resume Templates</h3>
                    <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full uppercase">8 Templates</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { id: 'simple-ats', name: 'ATS Minimalist', category: 'Classic', description: 'Plain layout optimized for high parsing rate on greenhouse/workday.' },
                      { id: 'modern', name: 'Modern Line', category: 'Modern', description: 'Clean top line accent bar with two-column profile summary structure.' },
                      { id: 'creative', name: 'Creative Designer', category: 'Creative', description: 'Split background grid sidebar layout suitable for portfolio designs.' },
                      { id: 'executive', name: 'Executive Corporate', category: 'Executive', description: 'Double border structured template suited for management roles.' }
                    ].map((temp, i) => (
                      <div key={i} className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md">
                        <div>
                          <span className="text-[9px] font-black text-brand-400 bg-brand-500/15 border border-brand-500/25 px-2 py-0.5 rounded uppercase tracking-wider">{temp.category}</span>
                          <h4 className="text-xs font-bold text-white leading-tight mt-2.5 mb-1.5">{temp.name}</h4>
                          <p className="text-[10px] text-slate-500 leading-normal">{temp.description}</p>
                        </div>
                        <div className="flex gap-2 border-t border-slate-800/80 pt-3 mt-4 text-[10px] font-bold text-slate-400">
                          <span className="bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded">ATS Friendly</span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded">Free</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: ANALYTICS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'analytics' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-800/80 pb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Platform Analytics</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Growth Chart */}
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Candidate Sign-ups Growth</h4>
                      <div className="h-44 flex items-end gap-2 px-2 border-b border-slate-800 pb-2">
                        {[15, 32, 58, 89, 124, 185].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                            <div
                              style={{ height: `${(val / 185) * 120}px` }}
                              className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg shadow-lg"
                            ></div>
                            <span className="text-[9px] text-slate-500 font-bold">{val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold px-2 mt-2">
                        <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                      </div>
                    </div>

                    {/* Applications Rate */}
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-wider">Job Application Trends</h4>
                      <div className="h-44 flex items-end gap-2 px-2 border-b border-slate-800 pb-2">
                        {[45, 98, 180, 310, 450, 672].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                            <div
                              style={{ height: `${(val / 672) * 120}px` }}
                              className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg shadow-lg"
                            ></div>
                            <span className="text-[9px] text-slate-500 font-bold">{val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold px-2 mt-2">
                        <span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: REPORTS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'reports' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-800/80 pb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Reports Generation</h3>
                  </div>

                  <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full">
                    <FiFileText className="w-16 h-16 text-slate-600 mb-4" />
                    <h4 className="text-sm font-bold text-white mb-2">Generate Platform Analytics Summary</h4>
                    <p className="text-xs text-slate-450 leading-relaxed mb-6">Click compile to generate a summary PDF containing users registrations growth, active companies lists, active recruiters profiles, and recent jobs metrics.</p>
                    <button
                      onClick={() => addToast('PDF report compiled and sent to printer queue!', 'success')}
                      className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-xs font-bold text-white rounded-xl shadow transition-all cursor-pointer"
                    >
                      Compile Report PDF
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: NOTIFICATIONS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'notifications' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-800/80 pb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Notifications Broadcast Center</h3>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addToast('Global push alert broadcasted to all active platform clients!', 'success');
                      e.target.reset();
                    }}
                    className="flex flex-col gap-4 max-w-xl w-full mx-auto p-6 rounded-2xl bg-slate-900/40 border border-slate-800"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Alert Title</label>
                      <input type="text" required placeholder="e.g. Scheduled Maintenance Notice" className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-200" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Message Content</label>
                      <textarea rows="4" required placeholder="Alert description message text..." className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-200 resize-none"></textarea>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-xs font-extrabold text-white rounded-xl shadow cursor-pointer transition-all">
                      Broadcast Global Notification
                    </button>
                  </form>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: SETTINGS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'settings' && (
                <div className="bg-[#0a1222] border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-800/80 pb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Portal Settings</h3>
                  </div>

                  <div className="divide-y divide-slate-800/85">
                    {[
                      { title: 'Enable Candidate Sign-ups', desc: 'Allows new candidates to register via email or Google auth.' },
                      { title: 'Maintenance Mode Toggle', desc: 'Puts the public job portal into read-only maintenance mode.' },
                      { title: 'Auto-approve Job Postings', desc: 'Bypasses the administrative approval queue for newly submitted jobs.' },
                      { title: 'SMTP Mailer Broadcasts', desc: 'Sends email notification alerts on application updates.' }
                    ].map((set, i) => (
                      <div key={i} className="py-4 flex items-center justify-between gap-6">
                        <div className="max-w-md">
                          <p className="text-xs font-bold text-white">{set.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-normal">{set.desc}</p>
                        </div>
                        <button
                          onClick={() => addToast('Setting configuration saved.', 'success')}
                          className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700/50 p-1 flex items-center justify-start cursor-pointer relative"
                        >
                          <span className="w-4 h-4 rounded-full bg-brand-500 shadow-md"></span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
         MODAL: USER ADD / EDIT
      ─────────────────────────────────────────────────────────────────────── */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={() => setUserModalOpen(false)}>
          <div className="bg-[#0a1222] border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                {editingUser ? 'Edit User details' : 'Register New User Account'}
              </h2>
              <button onClick={() => setUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUserSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                  placeholder="name@example.com"
                />
              </div>

              {!editingUser && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Password</label>
                  <input
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="Min 6 characters"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Role Privilege</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 border-t border-slate-800/80 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-450 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-xs font-extrabold text-white rounded-xl shadow-md"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
         MODAL: JOB ADD / EDIT
      ─────────────────────────────────────────────────────────────────────── */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={() => setJobModalOpen(false)}>
          <div className="bg-[#0a1222] border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="font-extrabold text-sm text-white uppercase tracking-wider">
                {editingJob ? 'Edit Job Posting Details' : 'Post New Job Opportunity'}
              </h2>
              <button onClick={() => setJobModalOpen(false)} className="text-slate-400 hover:text-white">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleJobSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh] custom-scrollbar">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Backend Software Engineer"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Company Name</label>
                  <input
                    type="text"
                    required
                    value={jobForm.company}
                    onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Stripe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Bangalore, India"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. ₹12L - ₹18L"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Experience Needed</label>
                  <input
                    type="text"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. 1-3 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Employment Type</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={(e) => setJobForm(prev => ({ ...prev, employmentType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Skills (Comma-separated)</label>
                  <input
                    type="text"
                    value={jobForm.skills}
                    onChange={(e) => setJobForm(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                    placeholder="e.g. React, Node, Git"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Job Description</label>
                <textarea
                  rows="4"
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500 resize-none"
                  placeholder="Outline responsibilities and requirements..."
                ></textarea>
              </div>

              <div className="flex gap-3 border-t border-slate-800/80 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-450 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-xs font-extrabold text-white rounded-xl shadow-md"
                >
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
         CONFIRMATION DIALOG MODAL (Users/Jobs/Applications deletion)
      ─────────────────────────────────────────────────────────────────────── */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>
          <div className="bg-[#0a1222] border border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 text-rose-450 mb-3">
                <FiInfo className="w-5 h-5" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-250">Confirm Deletion</h3>
              </div>
              <p className="text-xs text-slate-400 leading-normal mb-5">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ open: false, type: '', id: null, message: '' })}
                  className="flex-1 py-2.5 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-450 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-xs font-extrabold text-white rounded-xl shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
