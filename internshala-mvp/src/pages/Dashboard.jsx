import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useResume } from '../context/ResumeContext';
import { FiBriefcase, FiBookmark, FiCheckCircle, FiFileText, FiAward, FiArrowRight, FiUserCheck, FiAlertTriangle, FiUpload } from 'react-icons/fi';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import CompanyLogo from '../components/common/CompanyLogo';

const Dashboard = () => {
  const { currentUser, profileCompletion } = useAuth();
  const { jobs, recommendedJobs, savedJobs, appliedJobs, saveJob, unsaveJob, isJobSaved, isJobApplied } = useJobs();
  const { atsScore: builderScore } = useResume();
  const navigate = useNavigate();

  const resumeInfo = currentUser?.profileData?.resumeInfo;
  const hasResume = !!(resumeInfo?.fileName);
  const effectiveAtsScore = resumeInfo?.atsScore ?? builderScore;
  const fromUpload = resumeInfo?.source === 'upload' && resumeInfo?.atsScore != null;

  // Stats definition
  const stats = [
    {
      label: 'Jobs Applied',
      value: appliedJobs?.length || 0,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40',
      icon: FiCheckCircle
    },
    {
      label: 'Saved Jobs',
      value: savedJobs?.length || 0,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40',
      icon: FiBookmark
    },
    {
      label: 'Recommended Jobs',
      value: recommendedJobs?.length || 0,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40',
      icon: FiBriefcase
    }
  ];

  const handleApplyClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleSaveToggle = async (jobId) => {
    if (isJobSaved(jobId)) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-slide-up">
      {/* Greeting Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-2 max-w-xl">
          <span className="text-xs font-black bg-white/20 uppercase tracking-widest px-2.5 py-1 rounded w-fit text-white">
            Welcome back
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Hello, {currentUser.profileData?.fullName || currentUser.name}!</h1>
          <p className="text-slate-100/90 text-sm font-medium leading-relaxed mt-2">
            Your portal dashboard compiles active listings, custom match algorithms, and your resume score metrics in one place. Explore recommendations below.
          </p>
        </div>
      </div>

      {/* Profile completion & ATS score twin grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <FiUserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Profile Completion</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Keep details complete for better matches</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-200">
                <span>Completeness Ratio</span>
                <span className="text-brand-600 dark:text-brand-400">{profileCompletion}%</span>
              </div>
              <ProgressBar value={profileCompletion} showPercentage={false} size="sm" />
            </div>
          </div>

          <Link to="/profile">
            <Button variant="light" size="sm" className="w-full">
              {profileCompletion === 100 ? 'Edit Profile Details' : 'Complete Setup Fields'} <FiArrowRight className="ml-1" />
            </Button>
          </Link>
        </div>

        {/* ATS Score Card Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FiAward className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">ATS Resume Score</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {fromUpload ? 'From your uploaded resume' : hasResume ? 'From Resume Builder' : 'No resume linked'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl p-4 mb-4">
              {hasResume ? (
                <>
                  <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-200">
                    <span>ATS Quality Indicator</span>
                    <span className={effectiveAtsScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : effectiveAtsScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                      {effectiveAtsScore}/100
                    </span>
                  </div>
                  <ProgressBar value={effectiveAtsScore} showPercentage={false} size="sm" colorScheme="dynamic" />
                  {effectiveAtsScore < 70 && (
                    <div className="flex items-start gap-2 mt-1 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl">
                      <FiAlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
                        Your ATS score is below the recommended threshold. Use our Resume Builder to improve it.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-start gap-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <FiUpload className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                    Upload your resume in the Profile section or use our Resume Builder to get your ATS score.
                  </p>
                </div>
              )}
            </div>
          </div>

          <Link to={hasResume && effectiveAtsScore >= 70 ? '/resume' : '/profile'}>
            <Button variant="light" size="sm" className="w-full">
              {hasResume
                ? effectiveAtsScore >= 70
                  ? 'Open Resume Builder' 
                  : 'Improve with Resume Builder'
                : 'Add Resume in Profile'
              }
              <FiArrowRight className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats counter rows */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{stat.label}</span>
                <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Jobs Panel */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white">⭐ Recommended For You</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Custom matched based on preferred role and active skill density</p>
          </div>
          <Link to="/jobs" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 hover:underline">
            View All Jobs <FiArrowRight />
          </Link>
        </div>

        {recommendedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedJobs.slice(0, 2).map((job) => (
              <div key={job.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-4 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo logo={job.companyLogo} name={job.logoText || job.company} color={job.logoColor} size="sm" />
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{job.title}</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{job.company} • {job.location}</p>
                      </div>
                    </div>
                    {/* Matching score indicator */}
                    <span className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-400 font-black text-[10px] px-2 py-0.5 rounded-md shrink-0">
                      {job.matchScore}% Match
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 self-center">+{job.skills.length - 3} more</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="font-extrabold text-brand-600 dark:text-brand-400">💰 {job.salary}</span>
                    <span>💼 {job.experience}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Button variant="primary" size="sm" className="flex-1 font-bold shadow-sm" onClick={() => handleApplyClick(job.id)}>
                    {isJobApplied(job.id) ? 'Applied' : 'Apply Now'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="p-2.5 shrink-0 bg-white dark:bg-slate-900"
                    onClick={() => handleSaveToggle(job.id)}
                  >
                    <FiBookmark className={isJobSaved(job.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 italic">No recommendations found yet. Complete your profile details and skills to activate the match engine.</p>
          </div>
        )}
      </div>

      {/* Latest Jobs Panel */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-black text-slate-800 dark:text-white">Latest Job Openings</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.slice(0, 3).map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between gap-4 transition-all duration-200 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md">
              <div className="flex flex-col gap-3.5">
                {/* Logo & Employment Type Badge */}
                <div className="flex items-center justify-between gap-3">
                  <CompanyLogo logo={job.companyLogo} name={job.logoText || job.company} color={job.logoColor} size="sm" />
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold shrink-0">
                    {job.employmentType}
                  </span>
                </div>

                {/* Job Title & Company */}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1">{job.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{job.company}</p>
                </div>

                {/* Metadata Details */}
                <div className="flex flex-col gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span className="truncate">📍 {job.location}</span>
                  <span>💼 Experience: {job.experience}</span>
                  <span className="font-extrabold text-brand-600 dark:text-brand-400">💰 {job.salary || 'Undisclosed'}</span>
                </div>
              </div>

              <div className="mt-2 shrink-0">
                <Button variant="outline" size="sm" className="w-full font-bold shadow-sm py-2 bg-white dark:bg-slate-900" onClick={() => handleApplyClick(job.id)}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
