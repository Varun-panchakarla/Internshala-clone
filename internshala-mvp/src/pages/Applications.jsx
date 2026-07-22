import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { FiCheckCircle, FiMapPin, FiCalendar, FiArrowRight, FiBriefcase, FiClock } from 'react-icons/fi';
import Button from '../components/common/Button';

const Applications = () => {
  const { appliedDetails, jobs } = useJobs();
  const navigate = useNavigate();

  // Map detailed application logs back to job details
  const applications = appliedDetails.map(app => {
    const jobDetail = jobs.find(j => j.id === app.job_id);
    return {
      ...app,
      job: jobDetail
    };
  }).filter(app => app.job != null); // filter out any null/undefined jobs

  const getStatusBadgeStyle = (status) => {
    const normalized = status?.toLowerCase() || 'applied';
    if (normalized === 'applied' || normalized === 'pending') {
      return 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20 text-brand-700 dark:text-brand-400';
    } else if (normalized.includes('review')) {
      return 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400';
    } else if (normalized.includes('interview')) {
      return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400';
    } else if (normalized.includes('offer')) {
      return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400';
    } else if (normalized.includes('reject')) {
      return 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400';
    }
    return 'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20 text-slate-700 dark:text-slate-400';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Date Unavailable';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Applied Jobs</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Track the status of your submitted applications.</p>
      </div>

      {applications.length > 0 ? (
        <div className="flex flex-col gap-4">
          {applications.map((app) => (
            <div
              key={app.job_id}
              onClick={() => navigate(`/jobs/${app.job_id}`)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${app.job.logoColor || 'bg-slate-200'} text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-inner border border-slate-100 dark:border-slate-800`}>
                  {app.job.logoText || app.job.company.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    {app.job.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{app.job.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><FiMapPin className="opacity-70" /> {app.job.location}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FiBriefcase className="opacity-70" /> {app.job.experience}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FiClock className="opacity-70" /> {app.job.employmentType}</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-3 sm:pt-0 gap-3 shrink-0">
                {/* Status Badge */}
                <span className={`text-[10px] font-black border px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusBadgeStyle(app.status)}`}>
                  {app.status}
                </span>

                {/* Application Date */}
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                  <FiCalendar className="w-3.5 h-3.5" />
                  Applied on {formatDate(app.applied_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
            <FiCheckCircle className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No Applications Yet</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">You haven't applied for any jobs yet.</p>
          </div>
          <Link to="/jobs">
            <Button variant="primary" size="sm" className="mt-2">
              Browse Available Jobs <FiArrowRight className="ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Applications;
