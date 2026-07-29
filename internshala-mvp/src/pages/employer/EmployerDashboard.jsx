import React from 'react';
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
  FiSearch
} from 'react-icons/fi';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';

const EmployerDashboard = () => {
  const { currentEmployer, logout } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Logged out successfully from recruiter portal.', 'success');
      navigate('/');
    } catch (err) {
      addToast('Failed to log out.', 'error');
    }
  };

  const companyInitial = currentEmployer?.companyName
    ? currentEmployer.companyName.charAt(0).toUpperCase()
    : 'C';

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
                {currentEmployer?.companyName || 'Company'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 dark:bg-slate-850 dark:hover:bg-rose-955/20 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Recruiter Body Layout */}
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
                placeholder="Search candidates, roles..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100"
                onChange={() => addToast('Search is coming soon!', 'info')}
              />
            </div>
            <Button
              onClick={() => addToast('Posting jobs is coming soon in your next developer build!', 'info')}
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
              Hiring overview and candidate metrics dashboard for <strong className="text-white">{currentEmployer?.companyName}</strong>.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Active Job Posts',
              value: '12',
              trend: '+3 this week',
              icon: FiBriefcase,
              color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30'
            },
            {
              label: 'Total Applicants',
              value: '340',
              trend: '+18 since yesterday',
              icon: FiUsers,
              color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
            },
            {
              label: 'Shortlisted Matches',
              value: '48',
              trend: '+5 this week',
              icon: FiCheckSquare,
              color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30'
            },
            {
              label: 'Today\'s Interviews',
              value: '4',
              trend: '2 upcoming rounds',
              icon: FiClock,
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
            }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-black uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stat.value}</h3>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md inline-block">
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
                <button
                  onClick={() => addToast('Viewing all job postings...', 'info')}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer border-none bg-transparent"
                >
                  View All
                </button>
              </div>

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
                    {[
                      { title: 'Frontend Developer', type: 'Full-time', status: 'Active', applicants: 45, views: 320, date: '2 days ago' },
                      { title: 'Backend Node.js Engineer', type: 'Full-time', status: 'Active', applicants: 29, views: 198, date: '4 days ago' },
                      { title: 'Product Management Intern', type: 'Internship', status: 'Closed', applicants: 112, views: 840, date: '1 week ago' },
                    ].map((job, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                        <td className="py-3.5">
                          <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{job.title}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">{job.type}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                            job.status === 'Active'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                              : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-center font-bold text-slate-700 dark:text-slate-200">{job.applicants}</td>
                        <td className="py-3.5 text-center font-bold text-slate-500 dark:text-slate-400">{job.views}</td>
                        <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">{job.date}</td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => addToast(`Opening applications pipeline for ${job.title}...`, 'info')}
                            className="px-2.5 py-1 text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/20 rounded-lg hover:underline cursor-pointer border-none"
                          >
                            View Applicants
                          </button>
                          <button
                            onClick={() => addToast(`Opening edit wizard for ${job.title}...`, 'info')}
                            className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-850 rounded-lg inline-flex cursor-pointer"
                            title="Edit Listing"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <div className="w-12 h-12 bg-sky-600 text-white flex items-center justify-center font-bold text-lg rounded-xl border border-sky-500 shadow-sm shadow-sky-500/20">
                    {companyInitial}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-100 leading-none">
                      {currentEmployer?.companyName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                      Industry: {currentEmployer?.profileData?.industry || 'Technology'}
                    </span>
                  </div>
                </div>

                {/* Profile Completion Bar */}
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-200">
                    <span>Recruiter profile complete</span>
                    <span className="text-sky-600 dark:text-sky-400">85%</span>
                  </div>
                  <ProgressBar value={85} showPercentage={false} size="sm" />
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-850/40 text-xs font-medium space-y-3 pt-1">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Lead Recruiter</span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{currentEmployer?.recruiterName}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Company Size</span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{currentEmployer?.profileData?.companySize || '51-200 employees'}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Work mode</span>
                    <span className="text-slate-700 dark:text-slate-200 font-bold">{currentEmployer?.profileData?.workMode || 'Remote'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Intelligence & Hiring Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Hiring Insights Card */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <FiShield className="w-5 h-5 text-sky-600" />
              <h2 className="font-extrabold text-slate-800 dark:text-white text-base">AI Hiring Insights</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">Best Matching Candidate</span>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-white mt-0.5">Jane Doe</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Software Developer Intern</p>
                  </div>
                  <span className="flex items-center justify-center w-11 h-11 rounded-full bg-sky-600 text-white font-black text-xs shadow-sm shadow-sky-500/20">
                    97%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Recommended Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'Node.js', 'SQL', 'TypeScript'].map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] text-slate-650 dark:text-slate-350 font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => addToast("Opening Jane Doe's resume matching dashboard report...", 'success')}
                  className="w-full text-center py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-none block"
                >
                  Quick View Resume
                </button>
              </div>
            </div>
          </div>

          {/* Recent Applications Widget */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-sky-600" />
              <h2 className="font-extrabold text-slate-800 dark:text-white text-base">Recent Applications</h2>
            </div>
            
            <div className="divide-y divide-slate-50 dark:divide-slate-850/40 text-xs space-y-3.5">
              {[
                { name: 'Rahul Sharma', role: 'Frontend Developer', time: '12 mins ago' },
                { name: 'Priya Patel', role: 'Backend Engineer', time: '1 hour ago' },
                { name: 'Dev Dixit', role: 'Python Developer', time: '3 hours ago' }
              ].map((app, idx) => (
                <div key={idx} className="pt-3.5 flex justify-between items-center first:pt-0">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-850 dark:text-slate-100 block">{app.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{app.role}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-100/50 dark:border-slate-800">
                    {app.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Interviews & Notifications Stack */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            {/* Today's Interviews Sub-widget */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-250">
                <FiCalendar className="w-4.5 h-4.5 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Today's Interviews</h3>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { candidate: 'Amit Kumar', time: '2:00 PM', round: 'Technical Round' },
                  { candidate: 'Neha Singh', time: '4:30 PM', round: 'HR Evaluation' }
                ].map((int, idx) => (
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
            </div>

            {/* Notifications Sub-widget */}
            <div className="space-y-3 pt-3 border-t border-slate-150 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-250">
                <FiBell className="w-4.5 h-4.5 text-sky-600" />
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">System Notifications</h3>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  'New application received for Backend Node.js Engineer.',
                  'Jane Doe scheduled her interview for tomorrow.'
                ].map((note, idx) => (
                  <div key={idx} className="flex gap-2 items-start animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-500 mt-1.5 shrink-0" />
                    <p className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] leading-relaxed">
                      {note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default EmployerDashboard;
