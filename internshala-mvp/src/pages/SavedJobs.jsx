import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useToast } from '../components/common/Toast';
import { FiBookmark, FiBriefcase, FiMapPin, FiClock, FiTrash2, FiArrowRight } from 'react-icons/fi';
import Button from '../components/common/Button';

const SavedJobs = () => {
  const { savedJobs, unsaveJob, isJobApplied } = useJobs();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRemove = async (e, jobId) => {
    e.stopPropagation();
    try {
      await unsaveJob(jobId);
      addToast('Removed from saved jobs.', 'success');
    } catch (err) {
      addToast('Failed to remove job.', 'error');
    }
  };

  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Saved Jobs</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Review and manage positions you have saved for later.</p>
      </div>

      {savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedJobs.map((job) => {
            const isApplied = isJobApplied(job.id);
            return (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${job.logoColor} text-white flex items-center justify-center font-extrabold text-lg shrink-0`}>
                        {job.logoText}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{job.title}</h4>
                        <p className="text-xs font-bold text-slate-400">{job.company} • {job.location}</p>
                      </div>
                    </div>
                    
                    <span className="bg-brand-50 border border-brand-100 text-brand-700 font-black text-[10px] px-2 py-0.5 rounded-md shrink-0">
                      {job.matchScore}% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><FiBriefcase className="opacity-60" /> {job.experience}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FiClock className="opacity-60" /> {job.employmentType}</span>
                  </div>

                  <p className="text-xs font-extrabold text-brand-600 mt-3">{job.salary}</p>
                </div>

                <div className="flex items-center gap-2 mt-2 border-t border-slate-50 pt-4">
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
                    className="p-2.5 hover:text-rose-600 hover:border-rose-200 bg-white"
                    onClick={(e) => handleRemove(e, job.id)}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
            <FiBookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-700 text-base">Your Saved List is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              Explore job opportunities and click the bookmark icon on any card to save listings here.
            </p>
          </div>
          <Link to="/jobs">
            <Button variant="primary" size="sm">
              Browse Available Jobs <FiArrowRight className="ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
