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
  FiSearch,
  FiFileText,
  FiDownload,
  FiExternalLink,
  FiMail,
  FiPhone,
  FiX,
  FiBookOpen,
  FiAward,
  FiCheck
} from 'react-icons/fi';
import Logo from '../../components/common/Logo';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import ThemeToggle from '../../components/common/ThemeToggle';

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

  // --- MOCK CANDIDATES DATA ---
  const initialCandidates = {
    'Rahul Sharma': {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 9876543210',
      location: 'Bangalore, India',
      linkedin: 'linkedin.com/in/rahulsharma',
      github: 'github.com/rahulsharma',
      portfolio: 'rahulsharma.dev',
      professionalSummary: 'Passionate and detail-oriented frontend developer with a strong foundation in modern web technologies. Experienced in building responsive, scalable user interfaces using React, Redux, and Tailwind CSS. Committed to delivering clean code and optimal user experiences.',
      experience: 'Frontend Developer Intern at TechCorp (6 months), Freelance React Dev (1 year)',
      skills: 'React, Tailwind CSS, JavaScript, TypeScript, Redux, Git',
      education: 'B.Tech in Computer Science, IIT Bombay (2025)',
      projects: 'E-commerce Store Front, Personal Portfolio with dark mode',
      certifications: 'Meta Frontend Developer Professional Certificate',
      resumeUrl: 'rahul_sharma_resume.pdf',
      matchScore: '92%',
      applicationStatus: 'Applied'
    },
    'Priya Patel': {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      phone: '+91 8765432109',
      location: 'Mumbai, India',
      linkedin: 'linkedin.com/in/priyapatel',
      github: 'github.com/priyapatel',
      portfolio: 'priyapatel.tech',
      professionalSummary: 'Backend software engineer specializing in JavaScript, Node.js, and relational database systems. Enthusiastic about building efficient server-side systems, microservice architectures, and secure API gateways.',
      experience: 'Backend Intern at DevSolutions (4 months), Open Source Contributor to Node.js',
      skills: 'Node.js, Express, PostgreSQL, MongoDB, REST APIs, Docker',
      education: 'B.E. in Information Technology, K.J. Somaiya (2024)',
      projects: 'Realtime Chat Application, REST API Gateway for microservices',
      certifications: 'AWS Certified Developer Associate',
      resumeUrl: 'priya_patel_resume.pdf',
      matchScore: '89%',
      applicationStatus: 'Under Review'
    },
    'Dev Dixit': {
      name: 'Dev Dixit',
      email: 'dev.dixit@example.com',
      phone: '+91 7654321098',
      location: 'Delhi, India',
      linkedin: 'linkedin.com/in/devdixit',
      github: 'github.com/devdixit',
      portfolio: 'devdixit.me',
      professionalSummary: 'Data engineer and Python developer skilled in web scraping, database optimization, and data preprocessing. Experienced in constructing web applications with Django and FastAPI.',
      experience: 'Python Intern at DataMetrics (6 months)',
      skills: 'Python, Django, FastAPI, SQL, Pandas, NumPy, Machine Learning Basics',
      education: 'M.Sc. in Data Science, Delhi University (2025)',
      projects: 'Predictive Sales Dashboard, Scraper for Job Boards',
      certifications: 'Google Advanced Data Analytics Certificate',
      resumeUrl: 'dev_dixit_resume.pdf',
      matchScore: '85%',
      applicationStatus: 'Applied'
    },
    'Jane Doe': {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+91 6543210987',
      location: 'Remote, India',
      linkedin: 'linkedin.com/in/janedoe',
      github: 'github.com/janedoe',
      portfolio: 'janedoe.io',
      professionalSummary: 'Results-driven full stack software developer with hands-on experience in building enterprise-grade applications. Proficient across the MERN stack with expertise in cloud architectures and system engineering.',
      experience: 'Software Intern at IncuxAI (8 months), Web Dev Intern at StartCorp (3 months)',
      skills: 'React, Node.js, Express, MongoDB, Tailwind CSS, REST APIs',
      education: 'B.Tech in Computer Engineering, NIT Trichy (2024)',
      projects: 'AI Interview Prep portal, Company Workspace Dashboard',
      certifications: 'IncuxAI Hiring Certified Developer',
      resumeUrl: 'jane_doe_resume.pdf',
      matchScore: '97%',
      applicationStatus: 'Shortlisted'
    }
  };

  const [candidates, setCandidates] = React.useState(initialCandidates);

  // --- CORE STATE ---
  const [jobs, setJobs] = React.useState([
    { id: 1, title: 'Frontend Developer', type: 'Full-time', status: 'Active', applicants: 45, views: 320, date: '2 days ago', location: 'Bangalore, India', salary: '$80,000 - $100,000', experience: '1-3 years', skills: 'React, Tailwind CSS, JavaScript', description: 'We are looking for a skilled Frontend Developer to build clean, responsive, and performant web interfaces.' },
    { id: 2, title: 'Backend Node.js Engineer', type: 'Full-time', status: 'Active', applicants: 29, views: 198, date: '4 days ago', location: 'Remote, India', salary: '$90,000 - $120,000', experience: '3+ years', skills: 'Node.js, Express, PostgreSQL', description: 'Join us to design and scale powerful microservices, data schemas, and API gateways.' },
    { id: 3, title: 'Product Management Intern', type: 'Internship', status: 'Closed', applicants: 112, views: 840, date: '1 week ago', location: 'Mumbai, India', salary: '$20,000 - $30,000 / month', experience: 'No experience required', skills: 'Product Strategy, Agile, Wireframing', description: 'An internship role for aspiring Product Managers to shadow senior leads, draft product specs, and coordinate sprints.' },
  ]);

  const [applications, setApplications] = React.useState([
    { name: 'Rahul Sharma', role: 'Frontend Developer', time: '12 mins ago' },
    { name: 'Priya Patel', role: 'Backend Engineer', time: '1 hour ago' },
    { name: 'Dev Dixit', role: 'Python Developer', time: '3 hours ago' }
  ]);

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = React.useState(false);
  const [jobModalMode, setJobModalMode] = React.useState('create'); // 'create' or 'edit'
  const [editingJobId, setEditingJobId] = React.useState(null);
  
  // Job Form state
  const [jobForm, setJobForm] = React.useState({
    title: '',
    companyName: currentEmployer?.companyName || '',
    location: '',
    salaryRange: '',
    experienceRequired: '',
    employmentType: 'Full-time',
    skills: '',
    description: ''
  });

  // Applicants List modal state
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = React.useState(false);
  const [activeJobForApplicants, setActiveJobForApplicants] = React.useState(null);

  // Selected Candidate Profile modal state
  const [selectedCandidate, setSelectedCandidate] = React.useState(null);

  // --- ACTIONS HANDLERS ---
  const handleOpenPostJob = () => {
    setJobForm({
      title: '',
      companyName: currentEmployer?.companyName || '',
      location: '',
      salaryRange: '',
      experienceRequired: '',
      employmentType: 'Full-time',
      skills: '',
      description: ''
    });
    setJobModalMode('create');
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job) => {
    setJobForm({
      title: job.title,
      companyName: currentEmployer?.companyName || '',
      location: job.location || '',
      salaryRange: job.salary || '',
      experienceRequired: job.experience || '',
      employmentType: job.type || 'Full-time',
      skills: job.skills || '',
      description: job.description || ''
    });
    setEditingJobId(job.id);
    setJobModalMode('edit');
    setIsJobModalOpen(true);
  };

  const handleJobSubmit = (e) => {
    e.preventDefault();
    if (!jobForm.title.trim()) {
      addToast('Job title is required.', 'error');
      return;
    }
    
    if (jobModalMode === 'create') {
      const newJob = {
        id: Date.now(),
        title: jobForm.title,
        type: jobForm.employmentType,
        status: 'Active',
        applicants: 0,
        views: 0,
        date: 'Just now',
        location: jobForm.location,
        salary: jobForm.salaryRange,
        experience: jobForm.experienceRequired,
        skills: jobForm.skills,
        description: jobForm.description
      };
      setJobs([newJob, ...jobs]);
      addToast('Job posting created successfully!', 'success');
    } else {
      setJobs(jobs.map(j => j.id === editingJobId ? {
        ...j,
        title: jobForm.title,
        type: jobForm.employmentType,
        location: jobForm.location,
        salary: jobForm.salaryRange,
        experience: jobForm.experienceRequired,
        skills: jobForm.skills,
        description: jobForm.description
      } : j));
      addToast('Job posting updated successfully!', 'success');
    }
    setIsJobModalOpen(false);
  };

  const handleViewApplicants = (job) => {
    setActiveJobForApplicants(job);
    setIsApplicantsModalOpen(true);
  };

  const handleViewProfile = (candidateName) => {
    const details = candidates[candidateName] || {
      name: candidateName,
      email: `${candidateName.toLowerCase().replace(' ', '.')}@example.com`,
      phone: '+91 9999999999',
      location: 'Remote, India',
      linkedin: 'linkedin.com',
      github: 'github.com',
      portfolio: 'portfolio.com',
      professionalSummary: 'Experienced software developer.',
      experience: 'Internship or project experience (6 months)',
      skills: 'React, Node.js, Web Development',
      education: 'B.Tech in Computer Science',
      projects: 'Personal Web Project',
      certifications: 'Standard Developer Certification',
      resumeUrl: 'sample_resume.pdf',
      matchScore: '80%',
      applicationStatus: 'Applied'
    };
    setSelectedCandidate(details);
  };

  const handleUpdateStatus = (name, newStatus) => {
    setCandidates(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        applicationStatus: newStatus
      }
    }));
    
    // Also update selectedCandidate modal view if open
    setSelectedCandidate(prev => prev && prev.name === name ? {
      ...prev,
      applicationStatus: newStatus
    } : prev);
  };

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
          <ThemeToggle />
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
              onClick={handleOpenPostJob}
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
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
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
                            onClick={() => handleViewApplicants(job)}
                            className="px-2.5 py-1 text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/20 rounded-lg hover:underline cursor-pointer border-none"
                          >
                            View Applicants
                          </button>
                          <button
                            onClick={() => handleOpenEditJob(job)}
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
                  onClick={() => handleViewProfile('Jane Doe')}
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
              {applications.map((app, idx) => (
                <div key={idx} className="pt-3.5 flex justify-between items-center first:pt-0">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-850 dark:text-slate-100 block">{app.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{app.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-lg border border-slate-100/50 dark:border-slate-800 hidden sm:inline-block">
                      {app.time}
                    </span>
                    <button
                      onClick={() => handleViewProfile(app.name)}
                      className="px-2.5 py-1 text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/20 rounded-lg hover:underline cursor-pointer border-none"
                    >
                      View Profile
                    </button>
                  </div>
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

      {/* 1. JOB FORM MODAL (CREATE / EDIT) */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                {jobModalMode === 'create' ? 'Create New Job Listing' : 'Edit Job Listing'}
              </h3>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="text-slate-450 hover:text-slate-650 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleJobSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="e.g. Frontend Engineer"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Company Name</label>
                  <input
                    type="text"
                    value={jobForm.companyName}
                    onChange={e => setJobForm({ ...jobForm, companyName: e.target.value })}
                    placeholder="Company Name"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-850 dark:text-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Location *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.location}
                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                    placeholder="e.g. Bangalore, Remote"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={e => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    placeholder="e.g. $80k - $100k"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Experience Required</label>
                  <input
                    type="text"
                    value={jobForm.experienceRequired}
                    onChange={e => setJobForm({ ...jobForm, experienceRequired: e.target.value })}
                    placeholder="e.g. 1-3 years"
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Employment Type</label>
                  <select
                    value={jobForm.employmentType}
                    onChange={e => setJobForm({ ...jobForm, employmentType: e.target.value })}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-850 dark:text-slate-100 font-semibold"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={jobForm.skills}
                  onChange={e => setJobForm({ ...jobForm, skills: e.target.value })}
                  placeholder="React, Tailwind, Node.js"
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Job Description</label>
                <textarea
                  rows={4}
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Provide a detailed description of the role responsibilities..."
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-100 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 py-2 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {jobModalMode === 'create' ? 'Post Job' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. APPLICANTS LIST MODAL */}
      {isApplicantsModalOpen && activeJobForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-4xl w-full flex flex-col p-6 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Applicants Pipeline</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">{activeJobForApplicants.title} ({activeJobForApplicants.type})</p>
              </div>
              <button
                onClick={() => setIsApplicantsModalOpen(false)}
                className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto mt-4 max-h-[50vh]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="pb-3 font-black">Candidate</th>
                    <th className="pb-3 font-black text-center">Match Score</th>
                    <th className="pb-3 font-black">Experience</th>
                    <th className="pb-3 font-black">Skills</th>
                    <th className="pb-3 font-black text-center">Status</th>
                    <th className="pb-3 font-black">Resume</th>
                    <th className="pb-3 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850/40 text-xs">
                  {(activeJobForApplicants.title.includes('Frontend')
                    ? ['Rahul Sharma', 'Jane Doe']
                    : activeJobForApplicants.title.includes('Backend')
                      ? ['Priya Patel']
                      : ['Rahul Sharma', 'Dev Dixit']
                  ).map((name) => {
                    const cand = candidates[name] || {
                      name,
                      email: 'candidate@example.com',
                      experience: 'Intern',
                      skills: 'Web Development',
                      matchScore: '80%',
                      applicationStatus: 'Applied',
                      resumeUrl: 'resume.pdf'
                    };
                    const initials = cand.name.split(' ').map(n => n.charAt(0)).join('');
                    
                    return (
                      <tr key={cand.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-955/30 text-sky-650 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                              {initials}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 block">{cand.name}</span>
                              <span className="text-[10px] text-slate-400 block">{cand.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 font-black text-[10px] border border-emerald-100 dark:border-emerald-900/30">
                            {cand.matchScore}
                          </span>
                        </td>
                        <td className="py-3 text-slate-650 dark:text-slate-350 max-w-[150px] truncate font-medium" title={cand.experience}>
                          {cand.experience}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {cand.skills.split(',').slice(0, 2).map((s, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-50 dark:bg-slate-800 text-[9px] text-slate-500 dark:text-slate-400 font-bold border border-slate-100 dark:border-slate-700/60">
                                {s.trim()}
                              </span>
                            ))}
                            {cand.skills.split(',').length > 2 && (
                              <span className="text-[9px] text-slate-450 font-bold">+{cand.skills.split(',').length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                            cand.applicationStatus === 'Shortlisted'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450'
                              : cand.applicationStatus === 'Rejected'
                                ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-450'
                                : cand.applicationStatus === 'Under Review'
                                  ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-955/20 dark:border-amber-900/30 dark:text-amber-450'
                                  : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400'
                          }`}>
                            {cand.applicationStatus}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <FiFileText className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[10px] font-semibold max-w-[100px] truncate" title={cand.resumeUrl}>
                              {cand.resumeUrl}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setIsApplicantsModalOpen(false);
                              handleViewProfile(cand.name);
                            }}
                            className="px-2.5 py-1 text-[10px] font-bold text-sky-655 bg-sky-50 dark:bg-sky-955/20 rounded-lg hover:underline cursor-pointer border-none"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={() => setIsApplicantsModalOpen(false)}
                variant="outline"
                className="px-4 py-1.5 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CANDIDATE PROFILE & RESUME MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-955/30 text-sky-650 dark:text-sky-400 flex items-center justify-center font-black text-base shadow-sm">
                  {selectedCandidate.name.split(' ').map(n => n.charAt(0)).join('')}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                    {selectedCandidate.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-450 dark:text-slate-500 font-bold">
                    <span className="flex items-center gap-1"><FiMail /> {selectedCandidate.email}</span>
                    <span className="flex items-center gap-1"><FiPhone /> {selectedCandidate.phone}</span>
                    <span className="flex items-center gap-1"><FiMapPin /> {selectedCandidate.location}</span>
                  </div>
                  
                  {/* Clickable Social Badge Links */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a
                      href={`https://${selectedCandidate.linkedin || 'linkedin.com'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400 font-bold text-[9px] hover:underline flex items-center gap-1 border border-blue-100 dark:border-blue-900/30"
                    >
                      <FiExternalLink className="w-2.5 h-2.5" /> LinkedIn
                    </a>
                    <a
                      href={`https://${selectedCandidate.github || 'github.com'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-[9px] hover:underline flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                    >
                      <FiExternalLink className="w-2.5 h-2.5" /> GitHub
                    </a>
                    <a
                      href={`https://${selectedCandidate.portfolio || 'portfolio.com'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-955/20 text-sky-655 dark:text-sky-400 font-bold text-[9px] hover:underline flex items-center gap-1 border border-sky-100 dark:border-sky-900/30"
                    >
                      <FiExternalLink className="w-2.5 h-2.5" /> Portfolio
                    </a>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-slate-450 hover:text-slate-655 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer border-none bg-transparent"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
              {/* Profile Details (Left) */}
              <div className="md:col-span-7 space-y-4">
                {/* Professional Summary */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1 font-sans">
                    Professional Summary
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                    {selectedCandidate.professionalSummary || 'Highly motivated software engineering professional seeking to build elegant architectures.'}
                  </p>
                </div>

                {/* Experience */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiBriefcase className="w-3 h-3" /> Experience
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-bold leading-relaxed">
                    {selectedCandidate.experience}
                  </p>
                </div>

                {/* Skills */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiLayers className="w-3 h-3" /> Skills
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCandidate.skills.split(',').map((skill, sIdx) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] text-slate-755 dark:text-slate-300 font-bold">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiBookOpen className="w-3 h-3" /> Education
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-bold">
                    {selectedCandidate.education}
                  </p>
                </div>

                {/* Projects */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiGlobe className="w-3 h-3" /> Key Projects
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-bold">
                    {selectedCandidate.projects}
                  </p>
                </div>

                {/* Certifications */}
                <div className="space-y-1 bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1">
                    <FiAward className="w-3 h-3" /> Certifications & Achievements
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-bold">
                    {selectedCandidate.certifications}
                  </p>
                </div>
              </div>

              {/* Resume Preview & Recruiter Actions (Right) */}
              <div className="md:col-span-5 flex flex-col gap-4">
                {/* Resume Preview Section */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 bg-slate-50 dark:bg-slate-955/40">
                  <FiFileText className="w-12 h-12 text-slate-350 dark:text-slate-500" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">
                      {selectedCandidate.resumeUrl}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      PDF Document (1.2 MB)
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                    <button
                      onClick={() => addToast(`Previewing resume in popout for ${selectedCandidate.name}...`, 'success')}
                      className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-extrabold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-955/20 rounded-xl border border-sky-100 dark:border-sky-900/30 cursor-pointer transition-colors"
                    >
                      <FiSearch className="w-3.5 h-3.5" /> Preview Resume
                    </button>
                    <button
                      onClick={() => addToast(`Downloading ${selectedCandidate.resumeUrl}...`, 'success')}
                      className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white bg-slate-100 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                    >
                      <FiDownload className="w-3.5 h-3.5" /> Download Resume
                    </button>
                    <a
                      href={`/resumes/${selectedCandidate.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-900 dark:text-slate-350 dark:hover:text-white bg-slate-100 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors text-center"
                      onClick={(e) => {
                        e.preventDefault();
                        addToast(`Opening resume in new tab for ${selectedCandidate.name}...`, 'success');
                      }}
                    >
                      <FiExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                    </a>
                  </div>
                </div>

                {/* Recruiter Decision Block */}
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-850/45 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest block mb-1">
                    Recruiter Actions
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedCandidate.name, 'Shortlisted');
                        setSelectedCandidate(null);
                      }}
                      className="py-2.5 text-xs font-bold text-emerald-750 hover:text-white bg-emerald-50 dark:bg-emerald-955/20 hover:bg-emerald-600 dark:hover:bg-emerald-600 rounded-xl border border-emerald-250 dark:border-emerald-900/30 transition-all cursor-pointer"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedCandidate.name, 'Rejected');
                        setSelectedCandidate(null);
                      }}
                      className="py-2.5 text-xs font-bold text-rose-700 hover:text-white bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-600 dark:hover:bg-rose-600 rounded-xl border border-rose-250 dark:border-rose-900/30 transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>

                  <button
                    onClick={() => addToast(`Interview scheduler opened for ${selectedCandidate.name}.`, 'success')}
                    className="w-full py-2.5 text-xs font-bold text-sky-650 dark:text-sky-300 hover:text-white bg-sky-50 dark:bg-sky-955/20 hover:bg-sky-600 dark:hover:bg-sky-600 rounded-xl border border-sky-250 dark:border-sky-900/30 transition-all cursor-pointer mt-1"
                  >
                    Schedule Interview
                  </button>

                  <button
                    onClick={() => addToast(`Email composer opened for ${selectedCandidate.email}.`, 'success')}
                    className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-slate-350 hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-650 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    Contact Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
