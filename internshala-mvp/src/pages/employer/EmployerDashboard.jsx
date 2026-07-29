import React from 'react';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiTrendingUp, FiCheckSquare, FiPlus, FiGlobe, FiMapPin, FiLogOut, FiTrendingDown, FiShield } from 'react-icons/fi';
import Logo from '../../components/common/Logo';

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
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Recruiter Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-auto" mode="light" />
          <span className="h-6 w-[1px] bg-slate-200" />
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
              <span className="text-xs font-bold text-slate-800 leading-none">
                {currentEmployer?.recruiterName || 'Recruiter'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {currentEmployer?.companyName || 'Company'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 px-3 py-2 rounded-xl border border-slate-100 hover:border-rose-100 cursor-pointer"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Recruiter Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Welcome Recruiter Box */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="space-y-2 z-10">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {currentEmployer?.recruiterName || 'Recruiter'}!
            </h1>
            <p className="text-sky-100/90 text-sm font-semibold max-w-xl">
              Manage your company dashboard for <strong className="text-white">{currentEmployer?.companyName}</strong>, review candidate match scores, and hire the top developers.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-sky-100/80">
              {currentEmployer?.profileData?.website && (
                <span className="flex items-center gap-1">
                  <FiGlobe className="w-3.5 h-3.5" /> {currentEmployer.profileData.website}
                </span>
              )}
              {currentEmployer?.profileData?.headquarters && (
                <span className="flex items-center gap-1">
                  <FiMapPin className="w-3.5 h-3.5" /> {currentEmployer.profileData.headquarters}
                </span>
              )}
              <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md text-[10px] text-white uppercase font-bold">
                {currentEmployer?.profileData?.workMode || 'Remote'}
              </span>
            </div>
          </div>
          <div className="z-10 shrink-0">
            <button
              onClick={() => addToast('Posting jobs is coming soon in your next developer build!', 'info')}
              className="bg-white text-sky-700 hover:bg-sky-50 shadow-lg shadow-sky-950/20 active:scale-95 px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer border-none"
            >
              <FiPlus className="w-4 h-4" /> Post a New Job
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FiBriefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Job Posts</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">12</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Applicants</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">340</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiCheckSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shortlisted</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">48</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Interview Scheduled</p>
              <h3 className="text-2xl font-black text-slate-800 mt-0.5">18</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left: Recruiter Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h2 className="font-extrabold text-slate-800 text-base">Recent Job Post Activity</h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Showing 3 roles</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { title: 'Frontend Developer', type: 'Full-time', location: 'Bangalore / Remote', applications: 45, date: '2 days ago' },
                  { title: 'Backend Node.js Engineer', type: 'Full-time', location: 'Mumbai / Hybrid', applications: 29, date: '4 days ago' },
                  { title: 'Product Management Intern', type: 'Internship', location: 'Remote', applications: 112, date: '1 week ago' },
                ].map((job, idx) => (
                  <div key={idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-800 hover:text-sky-600 transition-colors cursor-pointer">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                        <span>{job.type}</span> &middot; <span>{job.location}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{job.applications}</span>
                        <span className="text-[9px] text-slate-400 font-black uppercase">Applications</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        {job.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-extrabold text-slate-800 text-base">AI Candidate Matching</h2>
              </div>
              <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <FiShield className="w-10 h-10 text-sky-500/40 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">AI Candidates list is processing...</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Our matching algorithm is analyzing resumes to present the best candidates.</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Recruiter Info Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-extrabold text-slate-800 text-base">Recruiter & Company Profile</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg rounded-xl border border-sky-100">
                    {companyInitial}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 leading-none">
                      {currentEmployer?.companyName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                      Industry: {currentEmployer?.profileData?.industry || 'Technology'}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-50 text-xs font-medium space-y-3">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Recruiter</span>
                    <span className="text-slate-700 font-bold">{currentEmployer?.recruiterName}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Designation</span>
                    <span className="text-slate-700 font-bold">{currentEmployer?.profileData?.designation || 'HR'}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Department</span>
                    <span className="text-slate-700 font-bold">{currentEmployer?.profileData?.department || 'Talent Acquisition'}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Official Email</span>
                    <span className="text-slate-700 font-bold">{currentEmployer?.email}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Office Phone</span>
                    <span className="text-slate-700 font-bold">{currentEmployer?.profileData?.officialPhone}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Company Size</span>
                    <span className="text-slate-700 font-bold">{currentEmployer?.profileData?.companySize}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-400">Founded Year</span>
                    <span className="text-slate-700 font-bold">{currentEmployer?.profileData?.foundedYear}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EmployerDashboard;
