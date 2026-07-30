import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiChevronLeft, FiMapPin, FiBriefcase, FiClock, FiBookmark, FiCheck, FiCpu, FiAward, FiInfo, FiX, FiFileText, FiExternalLink, FiDownload, FiUploadCloud } from 'react-icons/fi';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CompanyLogo from '../components/common/CompanyLogo';

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

  // Requirement verification states
  const [selectedFile, setSelectedFile] = useState(null);
  const [changeResume, setChangeResume] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      addToast('Only PDF and DOCX formats are supported.', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size exceeds 5 MB limit.', 'error');
      return;
    }
    
    setSelectedFile(file);
    addToast('Resume selected successfully!', 'success');
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      addToast('Please login to apply.', 'info');
      navigate('/login');
      return;
    }
    if (job.redirect_url) {
      window.open(job.redirect_url, '_blank', 'noopener,noreferrer');
      return;
    }
    setSelectedFile(null);
    setChangeResume(false);
    setCoverLetterText('');
    setPortfolioUrl('');
    setLinkedinUrl('');
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async () => {
    setSubmittingApply(true);
    
    // 1. Enforce requirements checks
    const hasExistingResume = !!(currentUser?.profileData?.resumeInfo?.fileName);
    const isResumeReq = job.requirements?.resumeRequired;
    
    if (isResumeReq) {
      if ((!hasExistingResume || changeResume) && !selectedFile) {
        addToast('A resume is required to apply for this job.', 'error');
        setSubmittingApply(false);
        return;
      }
    }

    if (job.requirements?.coverLetterRequired && !coverLetterText.trim()) {
      addToast('A cover letter is required for this job.', 'error');
      setSubmittingApply(false);
      return;
    }

    if (job.requirements?.portfolioRequired && !portfolioUrl.trim()) {
      addToast('A portfolio URL is required for this job.', 'error');
      setSubmittingApply(false);
      return;
    }

    if (job.requirements?.linkedinRequired && !linkedinUrl.trim()) {
      addToast('A LinkedIn profile is required for this job.', 'error');
      setSubmittingApply(false);
      return;
    }

    try {
      // 2. Perform backend API application submission
      await applyToJob(job.id);

      // 3. Save custom application record to recruiter_applications in localStorage
      const appResumeName = selectedFile
        ? selectedFile.name
        : (currentUser?.profileData?.resumeInfo?.fileName || 'candidate_resume.pdf');

      const newApp = {
        id: Date.now(),
        jobId: job.id,
        candidateName: currentUser?.profileData?.fullName || currentUser?.name || 'Jane Doe',
        candidateEmail: currentUser?.email || 'jane.doe@example.com',
        appliedAt: new Date().toISOString(),
        resumeUrl: appResumeName,
        status: 'Applied',
        experience: currentUser?.profileData?.experience || 'Fresher',
        skills: (currentUser?.profileData?.skills || ['React', 'JavaScript']).join(', '),
        education: `${currentUser?.profileData?.degree || 'B.Tech'}, ${currentUser?.profileData?.college || 'IIT Bombay'}`,
        projects: 'E-commerce website, Chat application',
        certifications: 'Standard Certificate',
        linkedin: linkedinUrl.trim() || currentUser?.profileData?.linkedin || 'linkedin.com/in/janedoe',
        github: currentUser?.profileData?.github || 'github.com/janedoe',
        portfolio: portfolioUrl.trim() || currentUser?.profileData?.portfolio || 'janedoe.dev',
        professionalSummary: 'Detail-oriented software developer.',
        matchScore: `${job.matchScore || 85}%`
      };

      const existingApps = JSON.parse(localStorage.getItem('recruiter_applications') || '[]');
      localStorage.setItem('recruiter_applications', JSON.stringify([newApp, ...existingApps]));

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

  const hasExistingResume = !!(currentUser?.profileData?.resumeInfo?.fileName);
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
              <CompanyLogo logo={job.companyLogo} name={job.logoText || job.company} color="bg-white/15" size="lg" />
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
            <FiBookmark className={`mr-2 w-4 h-4 ${isJobSaved(job.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            {isJobSaved(job.id) ? 'Saved' : 'Save Job'}
          </Button>

          <Button
            variant={isApplied ? 'outline' : 'primary'}
            className="px-10"
            disabled={isApplied}
            onClick={handleApplyClick}
          >
            {isApplied ? 'Application Submitted' : job.redirect_url ? `Apply on ${job.source === 'adzuna' ? 'Adzuna' : 'Indeed'}` : 'Apply Now'}
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
          <div className="flex items-center gap-3 bg-brand-50/50 border border-brand-100 p-4 rounded-xl text-slate-700 dark:text-slate-350">
            <FiInfo className="w-5 h-5 text-brand-500 shrink-0" />
            <p className="text-xs leading-relaxed font-semibold">
              Applying will submit your current profile details and active ATS Resume to the recruiting team at <b>{job.company}</b>.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider">Application Summary:</span>
            <div className="text-xs grid grid-cols-2 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-bold text-slate-500">Applying For:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-205 text-right">{job.title}</span>
              
              <span className="font-bold text-slate-500">Company:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-205 text-right">{job.company}</span>

              <span className="font-bold text-slate-500">Your Name:</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-205 text-right">{currentUser?.profileData?.fullName || currentUser?.name}</span>
            </div>
          </div>

          {/* Conditional Resume Required */}
          {job.requirements?.resumeRequired ? (
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-202 dark:border-slate-800">
              <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                Resume Submission (Required)
              </span>
              
              {hasExistingResume && !changeResume ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-100 block">
                        {currentUser?.profileData?.resumeInfo?.fileName}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Profile ATS Resume
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChangeResume(true)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 cursor-pointer border-none bg-transparent"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 relative hover:border-sky-500/50 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <FiUploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-350 text-center">
                      {selectedFile ? selectedFile.name : 'Click to select or drag resume file'}
                    </span>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5">
                      PDF, DOCX formats supported (Max 5 MB)
                    </span>
                  </div>
                  {selectedFile && (
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                      <span className="text-slate-600 dark:text-slate-350">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-rose-600 hover:text-rose-700 cursor-pointer border-none bg-transparent"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {hasExistingResume && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setChangeResume(false)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer border-none bg-transparent"
                      >
                        Use Profile Resume
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs grid grid-cols-2 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-bold text-slate-500">Attached Resume:</span>
              <span className="font-extrabold text-emerald-600 text-right">
                {currentUser?.profileData?.resumeInfo?.fileName || 'Online Profile Resume'}
              </span>
            </div>
          )}

          {/* Conditional Cover Letter */}
          {job.requirements?.coverLetterRequired && (
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Cover Letter *
              </label>
              <textarea
                rows={3}
                required
                value={coverLetterText}
                onChange={e => setCoverLetterText(e.target.value)}
                placeholder="Why do you want to apply for this role? Share your key achievements..."
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-sans font-semibold"
              />
            </div>
          )}

          {/* Conditional Portfolio Link */}
          {job.requirements?.portfolioRequired && (
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Portfolio URL *
              </label>
              <input
                type="url"
                required
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="e.g. https://yourportfolio.dev"
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-850 dark:text-slate-100 font-semibold"
              />
            </div>
          )}

          {/* Conditional LinkedIn Link */}
          {job.requirements?.linkedinRequired && (
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                LinkedIn Profile URL *
              </label>
              <input
                type="url"
                required
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="e.g. https://linkedin.com/in/username"
                className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-850 dark:text-slate-100 font-semibold"
              />
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default JobDetails;
