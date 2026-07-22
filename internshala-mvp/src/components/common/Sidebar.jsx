import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { useResume } from '../../context/ResumeContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  FiBriefcase, FiUser, FiBookmark, FiFileText,
  FiGrid, FiLayout, FiZap, FiX, FiMenu, FiAward
} from 'react-icons/fi';

const Sidebar = () => {
  const { isAuthenticated, profileCompletion, currentUser } = useAuth();
  const { savedJobs } = useJobs();
  const { atsScore: builderScore, resumeCompletion } = useResume();
  const { collapsed, toggleSidebar, mobileOpen, closeMobile } = useSidebar();

  const resumeInfo = currentUser?.profileData?.resumeInfo;
  const hasResume = !!(resumeInfo?.fileName);
  const effectiveAtsScore = resumeInfo?.atsScore ?? builderScore;

  if (!isAuthenticated) return null;

  const links = [
    { to: '/dashboard',        label: 'Dashboard',      icon: FiGrid,     description: 'Your overview' },
  ];

  if (['admin', 'super_admin'].includes(currentUser?.role)) {
    links.push({ to: '/admin', label: 'Admin Portal', icon: FiZap, description: 'Manage platform' });
  }

  links.push(
    { to: '/jobs',             label: 'Search Jobs',    icon: FiBriefcase, description: 'Find opportunities' },
    { to: '/saved-jobs',       label: 'Saved Jobs',     icon: FiBookmark, description: 'Your shortlist', badge: savedJobs?.length },
    { to: '/resume',           label: 'Resume Builder', icon: FiFileText, description: 'Build & export', scoreBadge: effectiveAtsScore },
    { to: '/resume-templates', label: 'Templates',      icon: FiLayout,   description: '8 pro designs' },
    { to: '/interview-prep',   label: 'Interview Prep', icon: FiAward,    description: 'Tech Q&As' },
    { to: '/profile',          label: 'My Profile',     icon: FiUser,     description: 'Edit your info', completenessBadge: profileCompletion }
  );

  return (
    <>
      {/* ── Desktop Collapsible Sidebar ───────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-slate-100 dark:border-slate-800/60 bg-white dark:bg-gray-950 h-[calc(100vh-4rem)] sticky top-16 z-30 overflow-y-auto custom-scrollbar will-change-[width] transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Top Sidebar Header with Perfectly Centered Hamburger Control */}
        <div className={`h-14 border-b border-slate-100 dark:border-slate-800/60 flex items-center shrink-0 ${collapsed ? 'justify-center w-16' : 'px-3.5'}`}>
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer focus:outline-none shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle Sidebar"
          >
            <FiMenu className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          <p
            className={`text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.12em] px-0.5 whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              collapsed ? 'opacity-0 max-h-0 mb-0 overflow-hidden' : 'opacity-100 max-h-6 mb-2'
            }`}
          >
            Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                title={collapsed ? link.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center h-10 px-2 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-[13px] font-medium overflow-hidden ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Fixed 28px icon box at 32px center line */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isActive
                          ? 'bg-brand-100 dark:bg-brand-800/30'
                          : 'bg-slate-100 dark:bg-white/8 group-hover:bg-slate-200 dark:group-hover:bg-white/12'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    </div>

                    {/* Fading & Sliding Label text */}
                    <div
                      className={`min-w-0 ml-2.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        collapsed
                          ? 'opacity-0 max-w-0 -translate-x-2 overflow-hidden pointer-events-none'
                          : 'opacity-100 max-w-[150px] translate-x-0'
                      }`}
                    >
                      <p className="leading-none truncate whitespace-nowrap">{link.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 font-normal leading-none mt-0.5 truncate whitespace-nowrap">{link.description}</p>
                    </div>

                    {/* Fading Badges */}
                    <div
                      className={`ml-auto flex items-center gap-1 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        collapsed
                          ? 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
                          : 'opacity-100 max-w-[60px]'
                      }`}
                    >
                      {link.badge > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">{link.badge}</span>
                      )}
                      {link.scoreBadge > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none border whitespace-nowrap ${
                          link.scoreBadge >= 80
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                            : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30'
                        }`}>
                          {link.scoreBadge}
                        </span>
                      )}
                      {link.completenessBadge > 0 && link.completenessBadge < 100 && (
                        <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800/30 text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none whitespace-nowrap">
                          {link.completenessBadge}%
                        </span>
                      )}
                    </div>

                    {/* Hover tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 hidden group-hover:flex items-center px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 animate-fade-in">
                        {link.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Resume stats quick view with synchronized fade */}
        <div className="px-3 pb-3 shrink-0">
          <div
            className={`space-y-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              collapsed ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none' : 'opacity-100 max-h-36'
            }`}
          >
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.12em] px-0.5 mb-2 whitespace-nowrap">Resume Stats</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2.5 text-center">
                <p className={`text-base font-black leading-none ${effectiveAtsScore >= 80 ? 'text-emerald-600' : effectiveAtsScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {hasResume ? effectiveAtsScore : '--'}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 uppercase tracking-wide truncate">
                  {hasResume ? (resumeInfo?.source === 'upload' ? 'Upload' : 'ATS') : 'No Resume'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2.5 text-center">
                <p className="text-base font-black text-brand-600 dark:text-brand-400 leading-none">{resumeCompletion}%</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 uppercase tracking-wide truncate">Complete</p>
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              collapsed ? 'opacity-100 max-h-12 py-2 border-t border-slate-100 dark:border-slate-800/60' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'
            }`}
            title={`Resume ATS Score: ${effectiveAtsScore || '--'}`}
          >
            <div className="flex items-center justify-center">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${effectiveAtsScore >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'}`}>
                {hasResume ? effectiveAtsScore : '--'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Overlay Drawer ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={closeMobile}
          />
          {/* Drawer content */}
          <aside className="relative w-64 bg-white dark:bg-gray-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full z-50 shadow-2xl animate-slide-right overflow-y-auto custom-scrollbar">
            <div className="h-16 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">Navigation Menu</span>
              <button onClick={closeMobile} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/8 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <p className="leading-none">{link.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5">{link.description}</p>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;