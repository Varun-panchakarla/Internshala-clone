import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { FiBriefcase, FiMapPin, FiClock, FiBookmark, FiArrowRight, FiUser } from 'react-icons/fi';
import Button from '../components/common/Button';

const RecommendedJobs = () => {
  const { recommendedJobs, saveJob, unsaveJob, isJobSaved, isJobApplied } = useJobs();
  const navigate = useNavigate();

  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleSaveToggle = async (e, jobId) => {
    e.stopPropagation();
    if (isJobSaved(jobId)) {
      await unsaveJob(jobId);
    } else {
      await saveJob(jobId);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white">Recommended Jobs</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Personalized matching based on preferred role, location, and your skills density.</p>
      </div>

      {recommendedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedJobs.map((job) => {
            const isApplied = isJobApplied(job.id);
            const isSaved = isJobSaved(job.id);
            return (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${job.logoColor || 'bg-brand-500'} text-white flex items-center justify-center font-extrabold text-lg shrink-0`}>
                        {job.logoText || job.company.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{job.company} • {job.location}</p>
                      </div>
                    </div>
                    
                    <span className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-400 font-black text-[10px] px-2 py-0.5 rounded-md shrink-0">
                      {job.matchScore}% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><FiBriefcase className="opacity-60" /> {job.experience}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FiClock className="opacity-60" /> {job.employmentType}</span>
                  </div>

                  <p className="text-xs font-extrabold text-brand-600 dark:text-brand-400 mt-3">{job.salary || 'Salary Undisclosed'}</p>
                </div>

                <div className="flex items-center gap-2 mt-2 border-t border-slate-50 dark:border-slate-800 pt-4">
                  <Button
                    variant={isApplied ? 'outline' : 'primary'}
                    size="sm"
                    className="flex-1 font-bold text-xs"
                    disabled={isApplied}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(job.id);
                    }}
                  >
                    {isApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2.5 bg-white dark:bg-slate-800 dark:border-slate-700"
                    onClick={(e) => handleSaveToggle(e, job.id)}
                  >
                    <FiBookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-400'}`} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
            <FiUser className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Profile Setup Incomplete</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Complete your profile to receive personalized job recommendations.</p>
          </div>
          <Link to="/profile">
            <Button variant="primary" size="sm" className="mt-2">
              Complete Profile <FiArrowRight className="ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;
