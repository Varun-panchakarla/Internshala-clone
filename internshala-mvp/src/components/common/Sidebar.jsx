import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { useResume } from '../../context/ResumeContext';
import { FiBriefcase, FiUser, FiHeart, FiFileText, FiGrid } from 'react-icons/fi';

const Sidebar = () => {
  const { isAuthenticated, profileCompletion } = useAuth();
  const { savedJobs } = useJobs();
  const { atsScore } = useResume();

  if (!isAuthenticated) return null;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/jobs', label: 'Search Jobs', icon: FiBriefcase },
    { to: '/saved-jobs', label: 'Saved Jobs', icon: FiHeart, badge: savedJobs?.length },
    { to: '/resume', label: 'Resume Builder', icon: FiFileText, scoreBadge: atsScore },
    { to: '/profile', label: 'My Profile', icon: FiUser, completenessBadge: profileCompletion },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-slate-100 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{link.label}</span>
              </div>
              
              {/* Conditional Badges */}
              {link.badge > 0 && (
                <span className="bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                  {link.badge}
                </span>
              )}
              {link.scoreBadge !== undefined && link.scoreBadge > 0 && (
                <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded-md shrink-0 border ${
                  link.scoreBadge >= 80 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  ATS: {link.scoreBadge}
                </span>
              )}
              {link.completenessBadge !== undefined && link.completenessBadge > 0 && link.completenessBadge < 100 && (
                <span className="bg-brand-50 text-brand-700 border border-brand-100 font-bold text-[10px] px-1.5 py-0.5 rounded-md shrink-0">
                  {link.completenessBadge}%
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Tiny banner displaying professional card at side footer */}
      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-md relative overflow-hidden">
        {/* Decorative ambient light */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-8 translate-x-8"></div>
        <h4 className="text-xs font-bold mb-1 relative z-10">Premium Match Engine</h4>
        <p className="text-[10px] text-white/80 leading-relaxed mb-3 relative z-10">
          Complete your profile and build a professional resume to activate 100% accurate job recommendation scores.
        </p>
        <div className="text-[9px] font-black uppercase tracking-wider bg-white/20 inline-block px-1.5 py-0.5 rounded text-white relative z-10">
          PRO MATCH ACTIVE
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
