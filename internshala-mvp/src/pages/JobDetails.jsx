import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiChevronLeft, FiMapPin, FiBriefcase, FiClock, FiHeart, FiCheck, FiCpu, FiAward, FiInfo } from 'react-icons/fi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { addToast } = useToast();
  const { jobs, saveJob, unsaveJob, isJobSaved, applyToJob, isJobApplied } = useJobs();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);

  useEffect(() => {
    const fetchJobDetails = () => {
      setLoading(true);
      const selectedJob = jobs.find(j => j.id === id);
      if (selectedJob) {
        setJob(selectedJob);
      } else {
        addToast('Job not found.', 'error');
        navigate('/jobs');
      }
      setLoading(false);
    };

    if (jobs.length > 0) {
      fetchJobDetails();
    }
  }, [id, jobs]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      addToast('Please login to save jobs.', 'info');
      navigate('/login');
      return;
    }

    try {
      if (isJobSaved(job.id)) {
        await unsaveJob(job.id);
        addToast('Removed from saved list.', 'success');
      } else {
        await saveJob(job.id);
        addToast('Added to saved list!', 'success');
      }
    } catch (err) {
      addToast('Action failed.', 'error');
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      addToast('Please login to apply.', 'info');
      navigate('/login');
      return;
    }
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async () => {
    setSubmittingApply(true);
    try {
      await applyToJob(job.id);
      addToast(`Applied to ${job.title} successfully!`, 'success');
      setApplyModalOpen(false);
    } catch (err) {
      addToast('Failed to apply. Try again.', 'error');
    } finally {
      setSubmittingApply(false);
    }
  };

  if (loading || !job) {
    return <LoadingSpinner text="Fetching job specification..." />;
  }

  const isApplied = isJobApplied(job.id);

  // Compare skills to show user matching details
  const userSkills = currentUser?.profileData?.skills || [];
  const matchedSkills = job.skills.filter(skill =>
    userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
  );
  const missingSkills = job.skills.filter(skill =>
    !userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto w-full animate-slide-up pb-8">
      {/* Back link */}
      <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors mb-6 group focus:outline-none">
        <FiChevronLeft className="group-hover:-translate-x-0.5 transition-transform" /> Back to Browse Listing
      </Link>

      {/* Main Specifications Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-8">
        
        {/* Banner Overlay */}
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 md:p-8 text-white relative">
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center font-extrabold text-2xl text-white shadow-inner">
                {job.logoText}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black mb-1">{job.title}</h1>
                <p className="text-sm text-white/80 font-semibold">{job.company} • {job.location}</p>
              </div>
            </div>

            {isAuthenticated && (
              <span className="bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-md shrink-0">
                {job.matchScore}% Keyword Match
              </span>
            )}
          </div>
        </div>

        {/* Info Grid Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-slate-50/50 text-slate-500 py-5 px-6 md:px-8 text-xs font-bold gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Salary</span>
            <span className="text-slate-800 font-extrabold text-sm">{job.salary}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Experience</span>
            <span className="text-slate-800 font-extrabold text-sm">{job.experience}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Employment Type</span>
            <span className="text-slate-800 font-extrabold text-sm">{job.employmentType}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Posted</span>
            <span className="text-slate-800 font-extrabold text-sm">{job.postedAt || 'Just now'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Match Analysis Widget (only when logged in) */}
          {isAuthenticated && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-700 flex items-center gap-2 mb-3">
                <FiCpu /> ATS Match Audit
              </h3>
              
              <div className="space-y-4">
                {/* Matched skills */}
                {matchedSkills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Keywords in your Profile ({matchedSkills.length})</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {matchedSkills.map(skill => (
                        <span key={skill} className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <FiCheck /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing skills */}
                {missingSkills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Keywords missing in your Profile ({missingSkills.length})</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {missingSkills.map(skill => (
                        <span key={skill} className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-2">
                      💡 Tip: Add these missing keywords to your <Link to="/profile" className="text-brand-600 hover:underline">profile</Link> or <Link to="/resume" className="text-brand-600 hover:underline">resume</Link> to increase your match percentage!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job description */}
          <div>
            <h2 className="text-base font-extrabold text-slate-800 mb-2.5">Job Description</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-light">{job.description}</p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div>
              <h2 className="text-base font-extrabold text-slate-800 mb-3">Key Responsibilities</h2>
              <ul className="space-y-2.5 text-sm text-slate-600 font-light list-disc pl-5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h2 className="text-base font-extrabold text-slate-800 mb-3">What We Offer</h2>
              <ul className="space-y-2.5 text-sm text-slate-600 font-light list-disc pl-5">
                {job.benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            className="px-6 bg-white"
            onClick={handleSaveToggle}
          >
            <FiHeart className={`mr-2 w-4 h-4 ${isJobSaved(job.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            {isJobSaved(job.id) ? 'Saved' : 'Save Job'}
          </Button>

          <Button
            variant={isApplied ? 'outline' : 'primary'}
            className="px-10"
            disabled={isApplied}
            onClick={handleApplyClick}
          >
            {isApplied ? 'Application Submitted' : 'Apply Now'}
          </Button>
        </div>
      </div>

      {/* Confirmation Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Confirm Job Application"
        footer={
          <>
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmApply} loading={submittingApply}>
              Confirm & Submit
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 p-4 rounded-xl text-slate-700">
            <FiInfo className="w-5 h-5 text-brand-500 shrink-0" />
            <p className="text-xs leading-relaxed font-semibold">
              Applying will submit your current profile details and active ATS Resume to the recruiting team at <b>{job.company}</b>.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Application Summary:</span>
            <div className="text-xs grid grid-cols-2 gap-y-2 border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-500">Applying For:</span>
              <span className="font-extrabold text-slate-800 text-right">{job.title}</span>
              
              <span className="font-bold text-slate-500">Company:</span>
              <span className="font-extrabold text-slate-800 text-right">{job.company}</span>

              <span className="font-bold text-slate-500">Your Name:</span>
              <span className="font-extrabold text-slate-800 text-right">{currentUser?.profileData?.fullName || currentUser?.name}</span>

              <span className="font-bold text-slate-500">Attached Resume:</span>
              <span className="font-extrabold text-emerald-600 text-right">{currentUser?.profileData?.resumeUrl || 'Online Profile Resume'}</span>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default JobDetails;
