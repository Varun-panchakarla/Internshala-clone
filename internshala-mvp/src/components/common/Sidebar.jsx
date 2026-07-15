import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { useResume } from '../../context/ResumeContext';
import {
  FiBriefcase, FiUser, FiHeart, FiFileText,
  FiGrid, FiLayout, FiTrendingUp, FiZap,
} from 'react-icons/fi';

const Sidebar = () => {
  const { isAuthenticated, profileCompletion, currentUser } = useAuth();
  const { savedJobs } = useJobs();
  const { atsScore, resumeCompletion } = useResume();

  if (!isAuthenticated) return null;

  const links = [
    { to: '/dashboard',        label: 'Dashboard',      icon: FiGrid,     description: 'Your overview' },
    { to: '/jobs',             label: 'Search Jobs',    icon: FiBriefcase, description: 'Find opportunities' },
    { to: '/saved-jobs',       label: 'Saved Jobs',     icon: FiHeart,    description: 'Your shortlist', badge: savedJobs?.length },
    { to: '/resume',           label: 'Resume Builder', icon: FiFileText, description: 'Build & export', scoreBadge: atsScore },
    { to: '/resume-templates', label: 'Templates',      icon: FiLayout,   description: '8 pro designs' },
    { to: '/profile',          label: 'My Profile',     icon: FiUser,     description: 'Edit your info', completenessBadge: profileCompletion },
  ];

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-100 dark:border-slate-800/60 bg-white dark:bg-gray-950 min-h-[calc(100vh-4rem)] sticky top-16">

      {/* User mini-card */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-black flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate leading-tight">
              {currentUser?.name?.split(' ')[0] || 'User'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
              {currentUser?.email}
            </p>
          </div>
        </div>
        {/* Profile completeness */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
            <span>Profile</span>
            <span className={`font-bold ${profileCompletion === 100 ? 'text-emerald-500' : 'text-brand-600'}`}>
              {profileCompletion}%
            </span>
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                profileCompletion < 50 ? 'bg-amber-400' : profileCompletion < 80 ? 'bg-brand-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.12em] px-2 mb-2">Navigation</p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-brand-100 dark:bg-brand-800/30'
                        : 'bg-slate-100 dark:bg-white/8 group-hover:bg-slate-200 dark:group-hover:bg-white/12'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="leading-none">{link.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-600 font-normal leading-none mt-0.5">{link.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {link.badge > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">{link.badge}</span>
                    )}
                    {link.scoreBadge > 0 && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none border ${
                        link.scoreBadge >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                          : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30'
                      }`}>
                        {link.scoreBadge}
                      </span>
                    )}
                    {link.completenessBadge > 0 && link.completenessBadge < 100 && (
                      <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800/30 text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">
                        {link.completenessBadge}%
                      </span>
                    )}
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Resume stats quick view */}
      <div className="px-3 pb-3 space-y-2">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.12em] px-2 mb-2">Resume Stats</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2.5 text-center">
            <p className={`text-base font-black leading-none ${atsScore >= 80 ? 'text-emerald-600' : atsScore >= 55 ? 'text-amber-500' : 'text-rose-500'}`}>
              {atsScore}
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 uppercase tracking-wide">ATS Score</p>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-brand-600 dark:text-brand-400 leading-none">{resumeCompletion}%</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 uppercase tracking-wide">Complete</p>
          </div>
        </div>
      </div>

      {/* Bottom promo card */}
      <div className="px-3 pb-4">
        <Link to="/resume" className="block">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-4 text-white hover:shadow-xl hover:shadow-brand-600/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl translate-x-6 -translate-y-6" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-lg -translate-x-4 translate-y-4" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <FiZap className="w-3 h-3 text-amber-300" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">AI Powered</span>
              </div>
              <h4 className="text-xs font-bold mb-1.5 leading-snug">Build a Job-Ready Resume</h4>
              <p className="text-[10px] text-white/70 leading-relaxed mb-3">
                8 pro templates. ATS optimized. Auto-scored. Download as PDF.
              </p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 group-hover:gap-2 transition-all">
                <FiTrendingUp className="w-3 h-3" /> Open Builder →
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
