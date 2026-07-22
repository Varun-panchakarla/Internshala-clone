import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/common/Toast';
import axios from 'axios';
import CompanyLogo from '../../components/common/CompanyLogo';

axios.defaults.withCredentials = true;
import {
  FiUsers, FiBriefcase, FiFolder, FiFileText, FiTrendingUp, FiActivity,
  FiBell, FiSettings, FiLogOut, FiPlus, FiTrash2, FiEdit, FiSearch,
  FiSliders, FiCheck, FiX, FiCheckCircle, FiInfo, FiChevronRight,
  FiChevronLeft, FiExternalLink, FiUpload, FiMenu, FiCpu, FiGrid, FiUser, FiMapPin, FiClock,
  FiSun, FiMoon, FiLock, FiHelpCircle, FiChevronDown
} from 'react-icons/fi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Logo from '../../components/common/Logo';

const AdminPortal = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("admin_sidebar_collapsed", JSON.stringify(isSidebarCollapsed));
    } catch (e) {
      console.error("Failed to save admin sidebar preference", e);
    }
  }, [isSidebarCollapsed]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

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
  
  // Accordion & Analytics states
  const [expandedSection, setExpandedSection] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Reports states
  const [reports, setReports] = useState([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsSearch, setReportsSearch] = useState('');
  const [reportsStatusFilter, setReportsStatusFilter] = useState('');
  const [reportsPriorityFilter, setReportsPriorityFilter] = useState('');
  const [reportsCategoryFilter, setReportsCategoryFilter] = useState('');
  const [reportsSort, setReportsSort] = useState('newest');
  const [reportsCounts, setReportsCounts] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, totalReports: 0 });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [adminNotesText, setAdminNotesText] = useState('');
  const [reportStatusUpdate, setReportStatusUpdate] = useState('');
  const [reportPriorityUpdate, setReportPriorityUpdate] = useState('');

  // Accordion auto-expansion on view change
  useEffect(() => {
    if (['users', 'recruiters', 'companies', 'jobs', 'applications'].includes(currentView)) {
      setExpandedSection('management');
    } else if (['analytics', 'reports'].includes(currentView)) {
      setExpandedSection('insights');
    } else if (['notifications', 'settings'].includes(currentView)) {
      setExpandedSection('system');
    }
  }, [currentView]);
  
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


  // Admin Profile Dropdown state & outside click handler
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    const handleEscapeMobile = (e) => {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscapeMobile);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
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

  // Load Analytics Data
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get('/api/admin/analytics');
      setAnalyticsData(res.data.signups || []);
    } catch (err) {
      addToast('Failed to load platform analytics.', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load Reports list
  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await axios.get('/api/admin/reports', {
        params: {
          search: reportsSearch,
          status: reportsStatusFilter,
          priority: reportsPriorityFilter,
          category: reportsCategoryFilter,
          sort: reportsSort,
          page: reportsPage,
          limit: 8
        }
      });
      setReports(res.data.reports);
      setReportsTotal(res.data.total);
      setReportsCounts(res.data.counts);
    } catch (err) {
      addToast('Failed to load issue reports.', 'error');
    } finally {
      setReportsLoading(false);
    }
  };

  // Update Report (status, priority, admin notes)
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      await axios.put(`/api/admin/reports/${selectedReport.id}`, {
        status: reportStatusUpdate,
        priority: reportPriorityUpdate,
        adminNotes: adminNotesText
      });
      addToast('Report updated successfully.', 'success');
      setReportModalOpen(false);
      await fetchReports();
    } catch (err) {
      addToast('Failed to update report details.', 'error');
    }
  };

  // Delete Report
  const handleReportDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(`/api/admin/reports/${id}`);
      addToast('Report deleted successfully.', 'success');
      setReportModalOpen(false);
      await fetchReports();
    } catch (err) {
      addToast('Failed to delete report.', 'error');
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
      } else if (currentView === 'analytics') {
        await fetchAnalytics();
      } else if (currentView === 'reports') {
        setReportsPage(1);
        await fetchReports();
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

  useEffect(() => {
    if (currentView === 'reports') {
      fetchReports();
    }
  }, [reportsPage, reportsSearch, reportsStatusFilter, reportsPriorityFilter, reportsCategoryFilter, reportsSort]);

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

  // Helper rendering functions for Sidebar Accordion sections
  const renderStandaloneLink = (name, icon, view) => {
    const Icon = icon;
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        title={isSidebarCollapsed ? name : ""}
        className={`w-full group flex items-center ${isSidebarCollapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-2.5"} rounded-xl text-[13px] font-medium transition-all duration-200 ease-in-out cursor-pointer active:scale-[0.98] ${
          isActive
            ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border-l-2 border-brand-600 dark:border-brand-500 shadow-2xs"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-0.5"
        }`}
      >
        <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`} />
        {!isSidebarCollapsed && <span className="truncate transition-opacity duration-200">{name}</span>}
      </button>
    );
  };

  const renderMobileStandaloneLink = (name, icon, view) => {
    const Icon = icon;
    const isActive = currentView === view;
    return (
      <button
        onClick={() => setView(view)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ease-in-out active:scale-[0.98] ${
          isActive ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40"
        }`}
      >
        <Icon className="w-4.5 h-4.5" />
        <span>{name}</span>
      </button>
    );
  };

  const renderAccordionSection = (sectionKey, name, icon, items) => {
    const Icon = icon;
    const isExpanded = expandedSection === sectionKey;
    const hasActiveChild = items.some(item => currentView === item.view);
    
    if (isSidebarCollapsed) {
      return (
        <button
          onClick={() => {
            const firstChildView = items[0]?.view;
            if (firstChildView) setView(firstChildView);
          }}
          title={name}
          className={`w-full group flex items-center justify-center py-3 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] ${
            hasActiveChild
              ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-l-2 border-brand-600 dark:border-brand-500 font-semibold shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${hasActiveChild ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`} />
        </button>
      );
    }

    return (
      <div className="space-y-1">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
          className={`w-full group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ease-in-out cursor-pointer active:scale-[0.98] ${
            hasActiveChild
              ? "text-slate-900 dark:text-slate-200 font-semibold bg-slate-100/80 dark:bg-slate-800/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-0.5"
          }`}
        >
          <Icon className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${hasActiveChild ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`} />
          <span className="truncate">{name}</span>
          <FiChevronRight 
            className={`w-4 h-4 ml-auto text-slate-400 dark:text-slate-500 transition-transform duration-300 ease-in-out ${
              isExpanded ? "rotate-90 text-brand-600 dark:text-brand-400" : "group-hover:text-slate-700 dark:group-hover:text-slate-300"
            }`} 
          />
        </button>
        
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: isExpanded ? `${items.length * 40 + 8}px` : "0px",
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div className="py-1 space-y-1">
            {items.map((item) => {
              const ChildIcon = item.icon;
              const isChildActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`w-full group flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ease-in-out cursor-pointer active:scale-[0.98] transform ${
                    isExpanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0 pointer-events-none"
                  } ${
                    isChildActive
                      ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-l-2 border-brand-600 dark:border-brand-500 font-semibold shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/20 hover:text-slate-900 dark:hover:text-slate-200 hover:translate-x-0.5"
                  }`}
                >
                  <ChildIcon className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${isChildActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`} />
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMobileAccordionSection = (sectionKey, name, icon, items) => {
    const Icon = icon;
    const isExpanded = expandedSection === sectionKey;
    const hasActiveChild = items.some(item => currentView === item.view);
    
    return (
      <div className="space-y-1">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ease-in-out active:scale-[0.98] ${
            hasActiveChild ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/5 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30"
          }`}
        >
          <Icon className="w-4.5 h-4.5" />
          <span>{name}</span>
          <FiChevronRight 
            className={`w-4 h-4 ml-auto text-slate-400 dark:text-slate-500 transition-transform duration-300 ease-in-out ${
              isExpanded ? "rotate-90 text-brand-600 dark:text-brand-400" : ""
            }`} 
          />
        </button>
        
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: isExpanded ? `${items.length * 40 + 8}px` : "0px",
            opacity: isExpanded ? 1 : 0,
          }}
        >
          <div className="py-1 space-y-1">
            {items.map((item) => {
              const ChildIcon = item.icon;
              const isChildActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`w-full flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ease-in-out active:scale-[0.98] transform ${
                    isExpanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0 pointer-events-none"
                  } ${
                    isChildActive ? "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <ChildIcon className="w-3.5 h-3.5 mr-2" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#060d1b] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      
      {/* ─── DESKTOP SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col ${isSidebarCollapsed ? "w-20" : "w-64"} bg-white dark:bg-[#0a1222] border-r border-slate-200/80 dark:border-slate-800/80 shrink-0 sticky top-0 h-screen transition-all duration-300 ease-in-out shadow-[1px_0_10px_rgba(0,0,0,0.03)] dark:shadow-none z-20`}>
        <div className={`h-12 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center shrink-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "justify-center" : "justify-end px-3.5"}`}>
          <button
            onClick={handleToggleSidebar}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-all duration-300 ease-in-out cursor-pointer focus:outline-none shrink-0"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle Sidebar"
          >
            <FiMenu className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isSidebarCollapsed ? "rotate-180 text-brand-600 dark:text-brand-400" : "rotate-0"}`} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto custom-scrollbar">
          {renderStandaloneLink('Dashboard', FiGrid, 'dashboard')}

          <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

          {renderAccordionSection('management', 'Management', FiSliders, [
            { name: 'Users', icon: FiUser, view: 'users' },
            { name: 'Recruiters', icon: FiUsers, view: 'recruiters' },
            { name: 'Companies', icon: FiBriefcase, view: 'companies' },
            { name: 'Jobs', icon: FiCpu, view: 'jobs' },
            { name: 'Applications', icon: FiFolder, view: 'applications' }
          ])}

          <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

          {renderStandaloneLink('Resume Templates', FiFileText, 'templates')}

          <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

          {renderAccordionSection('insights', 'Insights', FiTrendingUp, [
            { name: 'Analytics', icon: FiTrendingUp, view: 'analytics' },
            { name: 'Reports', icon: FiActivity, view: 'reports' }
          ])}

          <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

          {renderAccordionSection('system', 'System', FiSettings, [
            { name: 'Notifications', icon: FiBell, view: 'notifications' },
            { name: 'Settings', icon: FiSettings, view: 'settings' }
          ])}
        </nav>


      </aside>

      {/* ─── MOBILE DRAWER SIDEBAR ───────────────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={() => setMobileSidebarOpen(false)}>
          <aside className="w-64 bg-white dark:bg-[#0a1222] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                <Logo className="h-10 w-auto" mode="auto" />
              </Link>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
              {renderMobileStandaloneLink('Dashboard', FiGrid, 'dashboard')}

              <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

              {renderMobileAccordionSection('management', 'Management', FiSliders, [
                { name: 'Users', icon: FiUser, view: 'users' },
                { name: 'Recruiters', icon: FiUsers, view: 'recruiters' },
                { name: 'Companies', icon: FiBriefcase, view: 'companies' },
                { name: 'Jobs', icon: FiCpu, view: 'jobs' },
                { name: 'Applications', icon: FiFolder, view: 'applications' }
              ])}

              <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

              {renderMobileStandaloneLink('Resume Templates', FiFileText, 'templates')}

              <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

              {renderMobileAccordionSection('insights', 'Insights', FiTrendingUp, [
                { name: 'Analytics', icon: FiTrendingUp, view: 'analytics' },
                { name: 'Reports', icon: FiActivity, view: 'reports' }
              ])}

              <hr className="border-slate-200/60 dark:border-slate-800/60 my-2 mx-2" />

              {renderMobileAccordionSection('system', 'System', FiSettings, [
                { name: 'Notifications', icon: FiBell, view: 'notifications' },
                { name: 'Settings', icon: FiSettings, view: 'settings' }
              ])}
            </nav>

          </aside>
        </div>
      )}

      {/* ─── MAIN APP CONTENT AREA ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top navigation header — matching User Portal header styling & branding */}
        <header className="h-16 border-b border-slate-200/80 dark:border-slate-900 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all duration-200 shadow-[0_2px_15px_-3px_rgba(15,23,42,0.05)] dark:shadow-none">
          <div className="flex items-center gap-4">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer focus:outline-none shrink-0"
              aria-label="Open Mobile Menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            
            {/* Desktop & Mobile IncuXAI Careers Logo in Top Header */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <Logo className="h-10 w-auto" mode="auto" />
            </Link>

            <span className="hidden sm:inline-block w-px h-5 bg-slate-200 dark:bg-slate-800"></span>

            {/* Current Page Title */}
            <h1 className="text-base sm:text-lg font-extrabold capitalize tracking-tight text-slate-900 dark:text-white">
              {currentView === 'templates' ? 'Resume Templates' : currentView === 'change-password' ? 'Change Password' : currentView === 'profile' ? 'Admin Profile' : currentView}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle — matching User Portal Navbar */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white transition-all duration-150 focus:outline-none cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark
                ? <FiSun className="w-4 h-4 text-amber-400" />
                : <FiMoon className="w-4 h-4" />
              }
            </button>

            {/* Admin Profile Dropdown Trigger */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer focus:outline-none group"
                aria-expanded={profileDropdownOpen}
                aria-label="Admin Profile Menu"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{currentUser?.name}</p>
                  <p className="text-[9px] text-brand-600 dark:text-brand-400 uppercase tracking-widest font-black mt-0.5">{currentUser?.role || "Admin"}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-md ring-1 ring-slate-200 dark:ring-slate-700/60 group-hover:scale-105 transition-transform duration-200">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
                <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180 text-brand-500" : "group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
              </button>

              {/* Admin Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 py-2 animate-scale-in z-50">
                  
                  {/* Header Info */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                        {currentUser?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentUser?.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-2 py-0.5 rounded-md">
                          {currentUser?.role || "ADMIN"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <button
                      onClick={() => { setProfileDropdownOpen(false); setView("profile"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors cursor-pointer"
                    >
                      <FiUser className="w-4 h-4 text-slate-400" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => { setProfileDropdownOpen(false); setView("settings"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors cursor-pointer"
                    >
                      <FiSettings className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => { setProfileDropdownOpen(false); setView("change-password"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors cursor-pointer"
                    >
                      <FiLock className="w-4 h-4 text-slate-400" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => { setProfileDropdownOpen(false); setView("analytics"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors cursor-pointer"
                    >
                      <FiActivity className="w-4 h-4 text-slate-400" />
                      <span>Activity Log</span>
                    </button>

                    <button
                      onClick={() => { setProfileDropdownOpen(false); setView("reports"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors cursor-pointer"
                    >
                      <FiHelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  {/* Sign Out Footer */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => { setProfileDropdownOpen(false); handleLogoutClick(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors cursor-pointer"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
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
                        <div key={i} className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg">
                          <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${card.color} opacity-[0.05] rounded-bl-full group-hover:scale-110 transition-transform duration-300`}></div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{card.name}</span>
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
                              <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </div>
                          </div>
                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">{card.value}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none truncate">{card.trend}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Visual Growth SVG Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col">
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

                    <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">Quick Shortcuts</h3>
                        <div className="grid grid-cols-1 gap-2.5">
                          <button onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', password: '', role: 'candidate' }); setUserModalOpen(true); }} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 hover:border-brand-300 dark:hover:border-brand-500/50 hover:bg-white dark:hover:bg-slate-800/80 hover:-translate-y-0.5 hover:shadow-xs text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all duration-200 text-left cursor-pointer group">
                            <span className="flex items-center gap-2"><FiPlus className="text-brand-600 dark:text-brand-400" /> Register User Account</span>
                            <FiChevronRight className="text-slate-400 dark:text-slate-500" />
                          </button>
                          <button onClick={() => { setEditingJob(null); setJobForm({ title: '', company: '', location: '', salary: '', experience: '', employmentType: 'Full-time', skills: '', description: '' }); setJobModalOpen(true); }} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer">
                            <span className="flex items-center gap-2"><FiPlus className="text-emerald-600 dark:text-emerald-400" /> Post New Job Opportunity</span>
                            <FiChevronRight className="text-slate-400 dark:text-slate-500" />
                          </button>
                          <button onClick={() => setView('notifications')} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer">
                            <span className="flex items-center gap-2"><FiBell className="text-violet-600 dark:text-violet-400" /> Broadcast System Alert</span>
                            <FiChevronRight className="text-slate-400 dark:text-slate-500" />
                          </button>
                          <button onClick={() => setView('reports')} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors text-left cursor-pointer">
                            <span className="flex items-center gap-2"><FiFileText className="text-amber-600 dark:text-amber-400" /> Print Summary Report</span>
                            <FiChevronRight className="text-slate-400 dark:text-slate-500" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10 text-xs text-brand-600 dark:text-brand-400 leading-normal flex items-start gap-2.5 mt-4">
                        <FiInfo className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>System metrics synced. Local server and PostgreSQL database links are fully operational.</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Registrations */}
                    <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Registrations</h3>
                        <button onClick={() => setView('users')} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">View All</button>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {recentRegs.map((user) => (
                          <div key={user.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              user.role === 'admin' || user.role === 'super_admin'
                                ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                                : user.role === 'recruiter'
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Job Postings */}
                    <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg transition-colors duration-200">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Job Postings</h3>
                        <button onClick={() => setView("jobs")} className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">View All</button>
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {recentJobs.map((job) => (
                          <div key={job.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 px-2 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                              <CompanyLogo logo={job.companyLogo} name={job.company} color="bg-slate-100" size="xs" />
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{job.title}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{job.company} • {job.location}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold whitespace-nowrap bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 px-2 py-0.5 rounded-md">{job.employment_type}</span>
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
              {/* ──────────────────────────────────────────────────────────────
                 VIEW: USERS & RECRUITERS
              ────────────────────────────────────────────────────────────── */}
              {(currentView === 'users' || currentView === 'recruiters') && (
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-lg flex flex-col gap-6">
                  {/* List Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <div className="relative flex-1 flex items-center">
                        <FiSearch className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search users by name or email..."
                          value={usersSearch}
                          onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-200 shadow-2xs"
                        />
                      </div>
                      {currentView === 'users' && (
                        <select
                          value={usersRoleFilter}
                          onChange={(e) => { setUsersRoleFilter(e.target.value); setUsersPage(1); }}
                          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer shadow-2xs"
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
                        <tr className="border-b border-slate-200/90 dark:border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-550 font-bold">
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Academic Background</th>
                          <th className="py-3 px-4">Registered On</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
                        {users.map((user) => (
                          <tr key={user.id} className="text-xs hover:bg-slate-50/90 dark:hover:bg-slate-800/10 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0 shadow-2xs">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{user.name}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-semibold">{user.email}</td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                user.role === 'admin' || user.role === 'super_admin'
                                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-450 border border-rose-200/90 dark:border-rose-500/20'
                                  : user.role === 'recruiter'
                                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-450 border border-amber-200/90 dark:border-amber-500/20'
                                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border border-emerald-200/90 dark:border-emerald-500/20'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                              {user.college ? (
                                <p className="truncate max-w-xs">{user.college} ({user.degree || 'N/A'})</p>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600 italic">No academic data</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-500 font-medium">
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
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/35 hover:text-rose-700 dark:hover:text-white transition-colors"
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
                    <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                      <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-25" />
                      <p className="font-bold text-sm">No user accounts found matching query parameters.</p>
                    </div>
                  )}

                  {/* Pagination footer controls */}
                  {usersTotal > 8 && (
                    <div className="flex items-center justify-between border-t border-slate-200/90 dark:border-slate-800/80 pt-4 mt-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase">Showing {(usersPage - 1) * 8 + 1} - {Math.min(usersPage * 8, usersTotal)} of {usersTotal} Users</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setUsersPage(prev => Math.max(1, prev - 1))}
                          disabled={usersPage === 1}
                          className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-colors"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setUsersPage(prev => Math.min(Math.ceil(usersTotal / 8), prev + 1))}
                          disabled={usersPage * 8 >= usersTotal}
                          className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl transition-colors"
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
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Registered Companies</h3>
                    <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-2.5 py-1 rounded-full uppercase">{companies.length} Total</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {companies.map((comp, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
                        <CompanyLogo logo={comp.companyLogo} name={comp.company} color={comp.logo_color || '#1e293b'} size="md" className="mb-3" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">{comp.company}</h4>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Active Recruiter Profile</span>
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
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6">
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
                      <CompanyLogo logo={job.companyLogo} name={job.company} color={job.logo_color || '#1e293b'} size="sm" />
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
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6">
                  {/* List Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3 flex-1 max-w-md">
                      <div className="relative flex-1 flex items-center">
                        <FiSearch className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search candidates, roles, companies..."
                          value={appsSearch}
                          onChange={(e) => { setAppsSearch(e.target.value); setAppsPage(1); }}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 text-slate-900 dark:text-slate-200"
                        />
                      </div>
                      <select
                        value={appsStatusFilter}
                        onChange={(e) => { setAppsStatusFilter(e.target.value); setAppsPage(1); }}
                        className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-300 focus:outline-none focus:border-brand-500 cursor-pointer"
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
                        <tr className="border-b border-slate-200/90 dark:border-slate-800/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                          <th className="py-3 px-4">Candidate</th>
                          <th className="py-3 px-4">Job Opportunity</th>
                          <th className="py-3 px-4">Applied Date</th>
                          <th className="py-3 px-4">Status Review</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {applications.map((app) => (
                          <tr key={app.id} className="text-xs hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              <p className="font-bold text-slate-900 dark:text-white">{app.candidate_name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{app.candidate_email}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                              <p className="text-slate-900 dark:text-white">{app.job_title}</p>
                              <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-0.5">{app.job_company}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                              {new Date(app.applied_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={app.status}
                                onChange={(e) => handleAppStatusChange(app.id, e.target.value)}
                                className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider focus:outline-none border cursor-pointer ${
                                  app.status === 'Accepted'
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                    : app.status === 'Rejected'
                                    ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                                    : app.status === 'Shortlisted' || app.status === 'Interviewing'
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700/50'
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
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/15 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/35 transition-colors cursor-pointer"
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
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Showing {(appsPage - 1) * 8 + 1} - {Math.min(appsPage * 8, appsTotal)} of {appsTotal} Apps</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAppsPage(prev => Math.max(1, prev - 1))}
                          disabled={appsPage === 1}
                          className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                        >
                          <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAppsPage(prev => Math.min(Math.ceil(appsTotal / 8), prev + 1))}
                          disabled={appsPage * 8 >= appsTotal}
                          className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
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
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">System Resume Templates</h3>
                    <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-2.5 py-1 rounded-full uppercase">8 Templates</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                      { id: 'simple-ats', name: 'ATS Minimalist', category: 'Classic', description: 'Plain layout optimized for high parsing rate on greenhouse/workday.' },
                      { id: 'modern', name: 'Modern Line', category: 'Modern', description: 'Clean top line accent bar with two-column profile summary structure.' },
                      { id: 'creative', name: 'Creative Designer', category: 'Creative', description: 'Split background grid sidebar layout suitable for portfolio designs.' },
                      { id: 'executive', name: 'Executive Corporate', category: 'Executive', description: 'Double border structured template suited for management roles.' }
                    ].map((temp, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
                        <div>
                          <span className="text-[9px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/15 border border-brand-200 dark:border-brand-500/25 px-2 py-0.5 rounded uppercase tracking-wider">{temp.category}</span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mt-2.5 mb-1.5">{temp.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{temp.description}</p>
                        </div>
                        <div className="flex gap-2 border-t border-slate-200/80 dark:border-slate-800/80 pt-3 mt-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded">ATS Friendly</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Free</span>
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
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Platform Analytics</h3>
                    <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-2.5 py-1 rounded-full uppercase">Real-Time Student Metrics</span>
                  </div>

                  {analyticsLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <LoadingSpinner text="Analyzing student sign-up metrics..." />
                    </div>
                  ) : analyticsData.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-200 dark:border-slate-800/60 rounded-2xl">
                      <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-25 text-slate-400 dark:text-slate-600" />
                      <p className="font-bold text-sm">No student registrations exist in the database.</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider">Student Sign-up Growth</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Monthly registration volume of candidate accounts</p>
                      </div>
                      
                      <div className="h-64 flex items-end justify-center gap-8 px-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                        {(() => {
                          const maxCount = Math.max(...analyticsData.map(d => d.count), 1);
                          return analyticsData.map((data) => (
                            <div key={data.monthKey} className="w-16 flex flex-col items-center gap-2 group relative">
                              <div className="absolute bottom-[calc(100%-8px)] mb-2 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 text-[10px] font-black text-white dark:text-brand-400 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl z-10 whitespace-nowrap">
                                {data.count} {data.count === 1 ? 'student' : 'students'}
                              </div>
                              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{data.count}</span>
                              <div
                                style={{ height: `${(data.count / maxCount) * 160}px` }}
                                className="w-full min-h-[6px] bg-gradient-to-t from-brand-600 via-brand-500 to-indigo-500 rounded-t-xl shadow-md group-hover:from-brand-500 group-hover:to-brand-400 transition-all duration-200"
                              ></div>
                            </div>
                          ));
                        })()}
                      </div>
                      
                      <div className="flex justify-center gap-8 text-[10px] text-slate-500 dark:text-slate-400 font-bold px-4">
                        {analyticsData.map(d => (
                          <span key={d.monthKey} className="w-16 text-center">{d.month}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: REPORTS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'reports' && (
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6 animate-fade-in">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">User Complaints & Bug Reports</h3>
                    <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-2.5 py-1 rounded-full uppercase">Manage Support Tickets</span>
                  </div>

                  {/* Status metrics grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow-xs">
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Open Reports</span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{reportsCounts.open || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow-xs">
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Progress</span>
                      <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-500">{reportsCounts.inProgress || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow-xs">
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolved</span>
                      <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{reportsCounts.resolved || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow-xs">
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Closed</span>
                      <span className="text-2xl font-extrabold text-slate-500 dark:text-slate-400">{reportsCounts.closed || 0}</span>
                    </div>
                  </div>
                  <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">User Complaints & Bug Reports</h3>
                    <span className="text-[10px] font-black text-brand-450 bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full uppercase">Manage Support Tickets</span>
                  </div>

                  {/* Status metrics grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
                    <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Open Reports</span>
                      <span className="text-2xl font-extrabold text-blue-450">{reportsCounts.open || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">In Progress</span>
                      <span className="text-2xl font-extrabold text-amber-500">{reportsCounts.inProgress || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Resolved</span>
                      <span className="text-2xl font-extrabold text-emerald-450">{reportsCounts.resolved || 0}</span>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col gap-1 shadow">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Closed</span>
                      <span className="text-2xl font-extrabold text-slate-400">{reportsCounts.closed || 0}</span>
                    </div>
                  </div>

                  {/* Filters and search block */}
                  <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center">
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                      {/* Search Input */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={reportsSearch}
                          onChange={(e) => {
                            setReportsSearch(e.target.value);
                            setReportsPage(1);
                          }}
                          placeholder="Search reports by ID, Name, Email, Subject..."
                          className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-200 focus:outline-none focus:border-brand-500"
                        />
                        <FiSearch className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {/* Status filter */}
                      <select
                        value={reportsStatusFilter}
                        onChange={(e) => {
                          setReportsStatusFilter(e.target.value);
                          setReportsPage(1);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-350 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>

                      {/* Priority filter */}
                      <select
                        value={reportsPriorityFilter}
                        onChange={(e) => {
                          setReportsPriorityFilter(e.target.value);
                          setReportsPage(1);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-350 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Normal">Normal</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>

                      {/* Sort option */}
                      <select
                        value={reportsSort}
                        onChange={(e) => {
                          setReportsSort(e.target.value);
                          setReportsPage(1);
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-350 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        <option value="newest">Sort: Newest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="priority">Sort: Priority</option>
                        <option value="status">Sort: Status</option>
                      </select>
                    </div>
                  </div>

                  {/* Main reports grid/table view */}
                  {reportsLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <LoadingSpinner text="Querying platform issues database..." />
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800/80 rounded-2xl">
                      <FiFileText className="w-12 h-12 mx-auto mb-4 opacity-25" />
                      <p className="font-bold text-sm">No matching issue reports found.</p>
                      <p className="text-xs text-slate-600 mt-1">Try relaxing filters or changing your search criteria.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
                        <table className="w-full border-collapse text-left text-slate-300">
                          <thead className="bg-[#0e1626]/80 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/80">
                            <tr>
                              <th className="px-5 py-3.5">ID</th>
                              <th className="px-5 py-3.5">User Details</th>
                              <th className="px-5 py-3.5">Issue Category</th>
                              <th className="px-5 py-3.5">Subject</th>
                              <th className="px-5 py-3.5">Priority</th>
                              <th className="px-5 py-3.5">Status</th>
                              <th className="px-5 py-3.5">Date Submitted</th>
                              <th className="px-5 py-3.5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-900/10 text-xs font-semibold">
                            {reports.map((report) => (
                              <tr key={report.id} className="hover:bg-slate-800/20 transition-colors">
                                <td className="px-5 py-4 text-slate-500 font-bold">#{report.id}</td>
                                <td className="px-5 py-4">
                                  <div className="font-bold text-slate-200">{report.full_name}</div>
                                  <div className="text-[10px] text-slate-500 font-medium">{report.email}</div>
                                </td>
                                <td className="px-5 py-4 text-brand-400 font-bold">{report.category}</td>
                                <td className="px-5 py-4 max-w-[200px] truncate text-slate-250 font-bold">{report.subject}</td>
                                <td className="px-5 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                    report.priority === 'Critical' ? 'bg-rose-500/10 text-rose-450 border-rose-500/25' :
                                    report.priority === 'High' ? 'bg-orange-500/10 text-orange-450 border-orange-500/25' :
                                    report.priority === 'Normal' || report.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/25' :
                                    'bg-slate-800 text-slate-400 border-slate-750'
                                  }`}>
                                    {report.priority}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    report.status === 'Open' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                                    report.status === 'In Progress' ? 'bg-amber-500/15 text-amber-450 border border-amber-500/20' :
                                    report.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-450 border border-emerald-500/20' :
                                    'bg-slate-800/80 text-slate-500 border border-slate-750'
                                  }`}>
                                    {report.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-slate-450">
                                  {new Date(report.created_at).toLocaleDateString('default', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="px-5 py-4 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedReport(report);
                                      setReportStatusUpdate(report.status);
                                      setReportPriorityUpdate(report.priority);
                                      setAdminNotesText(report.admin_notes || '');
                                      setReportModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-slate-750"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {reportsTotal > 8 && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            Showing {(reportsPage - 1) * 8 + 1} - {Math.min(reportsPage * 8, reportsTotal)} of {reportsTotal} Reports
                          </span>
                          <div className="flex gap-2">
                            <button
                              disabled={reportsPage === 1}
                              onClick={() => setReportsPage(prev => Math.max(prev - 1, 1))}
                              className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-350 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                            >
                              <FiChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              disabled={reportsPage * 8 >= reportsTotal}
                              onClick={() => setReportsPage(prev => prev + 1)}
                              className="p-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-350 disabled:opacity-30 disabled:pointer-events-none rounded-xl"
                            >
                              <FiChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: NOTIFICATIONS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'notifications' && (
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Notifications Broadcast Center</h3>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addToast('Global push alert broadcasted to all active platform clients!', 'success');
                      e.target.reset();
                    }}
                    className="flex flex-col gap-4 max-w-xl w-full mx-auto p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Alert Title</label>
                      <input type="text" required placeholder="e.g. Scheduled Maintenance Notice" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-900 dark:text-slate-200" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Message Content</label>
                      <textarea rows="4" required placeholder="Alert description message text..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-900 dark:text-slate-200 resize-none"></textarea>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-xs font-extrabold text-white rounded-xl shadow cursor-pointer transition-all">
                      Broadcast Global Notification
                    </button>
                  </form>
                </div>
              )}

{/* ──────────────────────────────────────────────────────────────
                 VIEW: ADMIN PROFILE
              ────────────────────────────────────────────────────────────── */}
              {currentView === "profile" && (
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6 max-w-3xl">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin Profile</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Administrator account credentials and access details.</p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 px-2.5 py-1 rounded-lg">
                      {currentUser?.role || "ADMIN"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{currentUser?.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{currentUser?.email}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium">Administrator Access Granted • Full Portal Rights</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={currentUser?.name || ""}
                        readOnly
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={currentUser?.email || ""}
                        readOnly
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────────────
                 VIEW: ADMIN CHANGE PASSWORD
              ────────────────────────────────────────────────────────────── */}
              {currentView === "change-password" && (
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6 max-w-xl">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Change Admin Password</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Update your administrator portal security password.</p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addToast("Admin password updated successfully.", "success");
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-md cursor-pointer mt-2"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              )}

                            {/* ──────────────────────────────────────────────────────────────
                 VIEW: SETTINGS
              ────────────────────────────────────────────────────────────── */}
              {currentView === 'settings' && (
                <div className="bg-white dark:bg-[#0a1222] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] dark:shadow-lg flex flex-col gap-6">
                  <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Portal Settings</h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/85">
                    {[
                      { title: 'Enable Candidate Sign-ups', desc: 'Allows new candidates to register via email or Google auth.' },
                      { title: 'Maintenance Mode Toggle', desc: 'Puts the public job portal into read-only maintenance mode.' },
                      { title: 'Auto-approve Job Postings', desc: 'Bypasses the administrative approval queue for newly submitted jobs.' },
                      { title: 'SMTP Mailer Broadcasts', desc: 'Sends email notification alerts on application updates.' }
                    ].map((set, i) => (
                      <div key={i} className="py-4 flex items-center justify-between gap-6">
                        <div className="max-w-md">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{set.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{set.desc}</p>
                        </div>
                        <button
                          onClick={() => addToast('Setting configuration saved.', 'success')}
                          className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/50 p-1 flex items-center justify-start cursor-pointer relative"
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
          <div className="bg-white dark:bg-[#0a1222] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white max-w-md w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
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
          <div className="bg-white dark:bg-[#0a1222] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white max-w-lg w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
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
          <div className="bg-white dark:bg-[#0a1222] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white max-w-sm w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
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

      {/* ───────────────────────────────────────────────────────────────────────
         MODAL: REPORT DETAIL & UPDATE
      ─────────────────────────────────────────────────────────────────────── */}
      {reportModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={() => setReportModalOpen(false)}>
          <div className="bg-white dark:bg-[#0a1222] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-white max-w-3xl w-full overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <h2 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <FiFileText className="text-brand-400" /> Report Details #{selectedReport.id}
              </h2>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleReportSubmit} className="p-6 flex flex-col md:flex-row gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* Left Column: Complaint info */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Submitted By</label>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">{selectedReport.full_name}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Email Address</label>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">{selectedReport.email}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Contact Number</label>
                    <p className="text-xs font-bold text-slate-300 mt-0.5">{selectedReport.contact_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Date Submitted</label>
                    <p className="text-xs font-bold text-slate-300 mt-0.5">
                      {new Date(selectedReport.created_at).toLocaleString('default', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <hr className="border-slate-800/60" />

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Category Area</label>
                  <p className="text-xs font-bold text-brand-400 mt-0.5">{selectedReport.category}</p>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Subject</label>
                  <p className="text-xs font-bold text-slate-100 mt-0.5">{selectedReport.subject}</p>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Detailed Description</label>
                  <p className="text-xs font-medium text-slate-300 bg-slate-900/40 border border-slate-800/80 p-3 rounded-xl whitespace-pre-wrap leading-relaxed mt-1">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.screenshot && (
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Attached Screenshot</label>
                    <div className="mt-1 bg-slate-950 p-2 rounded-xl border border-slate-800 flex justify-center">
                      <img 
                        src={selectedReport.screenshot} 
                        alt="User reported screenshot" 
                        className="max-h-60 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Admin Actions */}
              <div className="w-full md:w-64 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-800/60 pt-4 md:pt-0 md:pl-6 shrink-0">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Status</label>
                  <select
                    value={reportStatusUpdate}
                    onChange={(e) => setReportStatusUpdate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-350 focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Priority Level</label>
                  <select
                    value={reportPriorityUpdate}
                    onChange={(e) => setReportPriorityUpdate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-350 focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Internal Admin Notes</label>
                  <textarea
                    rows={5}
                    value={adminNotesText}
                    onChange={(e) => setAdminNotesText(e.target.value)}
                    placeholder="Add private developer/admin notes here..."
                    className="w-full flex-1 px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs font-medium text-slate-300 focus:outline-none focus:border-brand-500 resize-none min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4 mt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-xs font-extrabold text-white rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReportDelete(selectedReport.id)}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-white text-xs font-bold rounded-xl cursor-pointer transition-all border border-rose-500/20"
                  >
                    Delete Report
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
