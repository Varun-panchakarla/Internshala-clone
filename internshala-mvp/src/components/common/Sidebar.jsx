import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { useResume } from '../../context/ResumeContext';
import {
  FiBriefcase, FiUser, FiBookmark, FiFileText,
  FiGrid, FiLayout, FiTrendingUp, FiZap,
} from 'react-icons/fi';

const Sidebar = () => {
  const { isAuthenticated, profileCompletion, currentUser } = useAuth();
  const { savedJobs } = useJobs();
  const { atsScore: builderScore, resumeCompletion } = useResume();

  const resumeInfo = currentUser?.profileData?.resumeInfo;
  const hasResume = !!(resumeInfo?.fileName);
  const effectiveAtsScore = resumeInfo?.atsScore ?? builderScore;

  if (!isAuthenticated) return null;

  const links = [
    { to: '/dashboard',        label: 'Dashboard',      icon: FiGrid,     description: 'Your overview' },
    { to: '/jobs',             label: 'Search Jobs',    icon: FiBriefcase, description: 'Find opportunities' },
    { to: '/saved-jobs',       label: 'Saved Jobs',     icon: FiBookmark, description: 'Your shortlist', badge: savedJobs?.length },
    { to: '/resume',           label: 'Resume Builder', icon: FiFileText, description: 'Build & export', scoreBadge: effectiveAtsScore },
    { to: '/resume-templates', label: 'Templates',      icon: FiLayout,   description: '8 pro designs' },
    { to: '/profile',          label: 'My Profile',     icon: FiUser,     description: 'Edit your info', completenessBadge: profileCompletion },
  ];

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-100 dark:border-slate-800/60 bg-white dark:bg-gray-950 h-[calc(100vh-4rem)] sticky top-16 z-30 overflow-y-auto custom-scrollbar">

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
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
            <p className={`text-base font-black leading-none ${effectiveAtsScore >= 80 ? 'text-emerald-600' : effectiveAtsScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
              {hasResume ? effectiveAtsScore : '--'}
            </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 uppercase tracking-wide">
              {hasResume ? (resumeInfo?.source === 'upload' ? 'Upload Score' : 'ATS Score') : 'No Resume'}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-2.5 text-center">
            <p className="text-base font-black text-brand-600 dark:text-brand-400 leading-none">{resumeCompletion}%</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 uppercase tracking-wide">Complete</p>
          </div>
        </div>
      </div>

      {/* Bottom promo card removed */}
    </aside>
  );
};

export default Sidebar;