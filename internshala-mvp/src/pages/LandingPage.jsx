import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import CompanyLogo from '../components/common/CompanyLogo';
import {
  FiSearch,
  FiMapPin,
  FiCode,
  FiPenTool,
  FiDatabase,
  FiLayers,
  FiTrendingUp,
  FiDollarSign,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiBriefcase,
  FiArrowRight,
  FiAward,
  FiUsers,
  FiClock,
  FiHeart,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const LandingPage = () => {
  const { jobs, setSearchQuery, setFilters, resetFilters, saveJob, unsaveJob, isJobSaved } = useJobs();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Hero search
  const [searchVal, setSearchVal] = useState('');
  const [locationVal, setLocationVal] = useState('');

  // Skills matcher
  const availableSkills = ['React', 'JavaScript', 'Node.js', 'Python', 'Figma', 'TypeScript', 'Tailwind CSS', 'SQL'];
  const [selectedSkills, setSelectedSkills] = useState(['React', 'JavaScript']);

  // Testimonials
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Horizontal scroll for Jobs section
  const jobScrollRef = useRef(null);
  const [jobScrollThumbStyle, setJobScrollThumbStyle] = useState({ width: '0%', left: '0%' });
  const [isJobScrollAtStart, setIsJobScrollAtStart] = useState(true);
  const [isJobScrollAtEnd, setIsJobScrollAtEnd] = useState(false);

  // Filters & Categories for Jobs section
  const [activeJobFilter, setActiveJobFilter] = useState('');
  const jobFilters = ['Big brands', 'Work from home', 'Part-time', 'MBA', 'Engineering', 'Media', 'Design', 'Data Science'];

  // Horizontal scroll for Internships section  
  const intScrollRef = useRef(null);
  const [intScrollThumbStyle, setIntScrollThumbStyle] = useState({ width: '0%', left: '0%' });
  const [isIntScrollAtStart, setIsIntScrollAtStart] = useState(true);
  const [isIntScrollAtEnd, setIsIntScrollAtEnd] = useState(false);

  // Filters for Internship section
  const intFilters = ['Big brands', 'Work from home', 'Part-time', 'MBA', 'Engineering', 'Media', 'Design', 'Data Science'];
  const [activeIntFilter, setActiveIntFilter] = useState('');

  // Trending section scroll
  const [activeTrend, setActiveTrend] = useState('Fresher jobs');

  // Testimonials auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle scroll position tracking in real-time
  const handleScrollUpdate = (container, setThumb, setAtStart, setAtEnd) => {
    if (!container.current) return;
    window.requestAnimationFrame(() => {
      if (!container.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = container.current;
      
      setAtStart(scrollLeft <= 5);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 10);

      const maxScrollLeft = scrollWidth - clientWidth;
      if (maxScrollLeft <= 0) {
        setThumb({ width: '100%', left: '0%' });
        return;
      }
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 2;
      const ratio = isAtEnd ? 1 : Math.min(1, Math.max(0, scrollLeft / maxScrollLeft));
      const thumbWidth = Math.max(25, Math.min(45, (clientWidth / scrollWidth) * 100));
      const thumbLeft = ratio * (100 - thumbWidth);
      setThumb({ width: `${thumbWidth}%`, left: `${thumbLeft}%` });
    });
  };

  const scrollTo = (ref, direction) => {
    if (ref.current) {
      const amount = ref.current.clientWidth * 0.7;
      ref.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const updateThumbs = () => {
      handleScrollUpdate(jobScrollRef, setJobScrollThumbStyle, setIsJobScrollAtStart, setIsJobScrollAtEnd);
      handleScrollUpdate(intScrollRef, setIntScrollThumbStyle, setIsIntScrollAtStart, setIsIntScrollAtEnd);
    };
    updateThumbs();
    window.addEventListener('resize', updateThumbs);
    return () => window.removeEventListener('resize', updateThumbs);
  }, [jobs, activeJobFilter, activeIntFilter]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    resetFilters();
    setSearchQuery(searchVal);
    setFilters(prev => ({ ...prev, location: locationVal }));
    navigate('/jobs');
  };

  const openJobsListing = (filterType, value) => {
    resetFilters();
    if (filterType === 'query') setSearchQuery(value);
    else if (filterType === 'location') setFilters(prev => ({ ...prev, location: value }));
    else if (filterType === 'employmentType') setFilters(prev => ({ ...prev, employmentType: value }));
    navigate('/jobs');
  };

  const toggleSkillInSandbox = (skill) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const getSandboxMatchingJobs = () => {
    return jobs.map(job => {
      const matches = job.skills.filter(s => selectedSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase()));
      const score = job.skills.length > 0 ? Math.round((matches.length / job.skills.length) * 100) : 0;
      return { ...job, sandboxScore: score };
    }).filter(j => j.sandboxScore > 0).sort((a, b) => b.sandboxScore - a.sandboxScore).slice(0, 3);
  };

  const sandboxJobs = getSandboxMatchingJobs();

  const handleSaveToggle = async (e, jId) => {
    e.stopPropagation();
    if (!isAuthenticated) { addToast('Please login to save jobs.', 'info'); return; }
    try {
      if (isJobSaved(jId)) { await unsaveJob(jId); addToast('Removed from saved list.', 'success'); }
      else { await saveJob(jId); addToast('Added to saved list!', 'success'); }
    } catch (err) { addToast('Action failed.', 'error'); }
  };

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // ==================== DATA ====================

  const categories = [
    { name: 'Software Development', icon: FiCode, filter: 'developer', count: '4,200+ Openings' },
    { name: 'Data Science & AI', icon: FiDatabase, filter: 'data', count: '950+ Openings' },
    { name: 'Design & Creative', icon: FiPenTool, filter: 'ui', count: '1,800+ Openings' },
    { name: 'Product Mgmt', icon: FiLayers, filter: 'product', count: '600+ Openings' },
    { name: 'Marketing & Sales', icon: FiTrendingUp, filter: 'marketing', count: '1,200+ Openings' },
    { name: 'Finance & Business', icon: FiDollarSign, filter: 'finance', count: '780+ Openings' },
  ];

  const testimonials = [
    { quote: 'I secured a React Intern position at Google through this portal. The skill match score helped me tailor my profile exactly to what recruiters wanted.', name: 'Tanya Sharma', role: 'Frontend Engineer Intern', company: 'Google', avatar: 'bg-red-500' },
    { quote: 'The resume builder is phenomenal. I built my profile in 10 minutes and got hired by Stripe within a week!', name: 'Rohit Verma', role: 'React Developer', company: 'Stripe', avatar: 'bg-indigo-500' },
    { quote: 'Finding verified internships with good stipends was tough. Now I\'m interning at Slack with a ₹35k/month stipend.' , name: 'Ananya Iyer', role: 'SWE Intern', company: 'Slack', avatar: 'bg-amber-500' },
  ];

  // Dynamic filter lists for Jobs and Internships showcases
  const getFilteredInternships = () => {
    let list = jobs.filter(j => j.employmentType === 'Internship');
    if (activeIntFilter) {
      const filterVal = activeIntFilter.toLowerCase();
      if (filterVal === 'big brands') {
        const bigBrands = ['google', 'stripe', 'canva', 'slack', 'netflix', 'meta', 'figma', 'spotify', 'airbnb', 'purplle', 'tripjack', 'jsw severfield structures ltd. (jssl)'];
        list = list.filter(j => bigBrands.includes(j.company.toLowerCase()));
      } else if (filterVal === 'work from home') {
        list = list.filter(j => j.location.toLowerCase().includes('remote') || j.location.toLowerCase().includes('work from home'));
      } else if (filterVal === 'part-time') {
        list = list.filter(j => j.employmentType === 'Part-time' || j.title.toLowerCase().includes('part-time'));
      } else if (filterVal === 'mba') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('sales') || 
          j.title.toLowerCase().includes('business') || 
          j.title.toLowerCase().includes('marketing') ||
          j.title.toLowerCase().includes('hr') ||
          j.title.toLowerCase().includes('talent') ||
          j.title.toLowerCase().includes('recruitment')
        );
      } else if (filterVal === 'engineering') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('engineer') || 
          j.title.toLowerCase().includes('developer') || 
          j.title.toLowerCase().includes('web') || 
          j.title.toLowerCase().includes('tech') || 
          j.title.toLowerCase().includes('code') || 
          j.title.toLowerCase().includes('software') || 
          j.skills.some(s => ['react', 'node.js', 'javascript', 'python', 'sql', 'css', 'html'].includes(s.toLowerCase()))
        );
      } else if (filterVal === 'media') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('video') || 
          j.title.toLowerCase().includes('editing') || 
          j.title.toLowerCase().includes('media') || 
          j.title.toLowerCase().includes('content') || 
          j.title.toLowerCase().includes('write')
        );
      } else if (filterVal === 'design') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('design') || 
          j.title.toLowerCase().includes('figma') || 
          j.title.toLowerCase().includes('ui') || 
          j.title.toLowerCase().includes('ux') || 
          j.title.toLowerCase().includes('graphic')
        );
      } else if (filterVal === 'data science') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('data') || 
          j.title.toLowerCase().includes('analyst') || 
          j.title.toLowerCase().includes('science') || 
          j.title.toLowerCase().includes('python') || 
          j.title.toLowerCase().includes('database') ||
          j.title.toLowerCase().includes('ai')
        );
      }
    }
    return list;
  };

  const getFilteredJobs = () => {
    let list = jobs.filter(j => j.employmentType !== 'Internship');
    if (activeJobFilter) {
      const filterVal = activeJobFilter.toLowerCase();
      if (filterVal === 'big brands') {
        const bigBrands = ['google', 'stripe', 'canva', 'slack', 'netflix', 'meta', 'figma', 'spotify', 'airbnb'];
        list = list.filter(j => bigBrands.includes(j.company.toLowerCase()));
      } else if (filterVal === 'work from home') {
        list = list.filter(j => j.location.toLowerCase().includes('remote') || j.location.toLowerCase().includes('work from home'));
      } else if (filterVal === 'part-time') {
        list = list.filter(j => j.employmentType === 'Part-time' || j.title.toLowerCase().includes('part-time'));
      } else if (filterVal === 'mba') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('sales') || 
          j.title.toLowerCase().includes('business') || 
          j.title.toLowerCase().includes('marketing') ||
          j.title.toLowerCase().includes('hr') ||
          j.title.toLowerCase().includes('talent') ||
          j.title.toLowerCase().includes('recruitment')
        );
      } else if (filterVal === 'engineering') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('engineer') || 
          j.title.toLowerCase().includes('developer') || 
          j.title.toLowerCase().includes('web') || 
          j.title.toLowerCase().includes('tech') || 
          j.title.toLowerCase().includes('code') || 
          j.title.toLowerCase().includes('software') || 
          j.skills.some(s => ['react', 'node.js', 'javascript', 'python', 'sql', 'css', 'html'].includes(s.toLowerCase()))
        );
      } else if (filterVal === 'media') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('video') || 
          j.title.toLowerCase().includes('editing') || 
          j.title.toLowerCase().includes('media') || 
          j.title.toLowerCase().includes('content') || 
          j.title.toLowerCase().includes('write')
        );
      } else if (filterVal === 'design') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('design') || 
          j.title.toLowerCase().includes('figma') || 
          j.title.toLowerCase().includes('ui') || 
          j.title.toLowerCase().includes('ux') || 
          j.title.toLowerCase().includes('graphic')
        );
      } else if (filterVal === 'data science') {
        list = list.filter(j => 
          j.title.toLowerCase().includes('data') || 
          j.title.toLowerCase().includes('analyst') || 
          j.title.toLowerCase().includes('science') || 
          j.title.toLowerCase().includes('python') || 
          j.title.toLowerCase().includes('database') ||
          j.title.toLowerCase().includes('ai')
        );
      }
    }
    return list;
  };

  const allInternshipPosts = getFilteredInternships().slice(0, 8);
  const allJobPosts = getFilteredJobs().slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      {/* Hero Section - Matching Internshala's style */}
      <section className="bg-gradient-to-b from-sky-50 to-white dark:from-sky-950/40 dark:to-slate-950 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
                India's #1 platform <br />
                for <span className="text-sky-600 dark:text-sky-400">fresher jobs</span> and internships
              </h1>
              <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 font-medium">
                Discover opportunities from top companies, get skill-matched, and apply instantly.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {isAuthenticated ? (
                  <button onClick={() => navigate('/dashboard')} className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-sky-600/20">
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('/register')} className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-sky-600/20">
                      Candidate Sign up
                    </button>
                    <button onClick={() => addToast('Employer registration coming soon!', 'info')} className="px-8 py-3.5 border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-xl font-bold text-sm transition-all cursor-pointer">
                      Employer sign up
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="hidden lg:flex flex-col items-center justify-center bg-sky-50 dark:bg-sky-950/20 rounded-3xl p-8 border border-sky-100 dark:border-sky-900/30 shadow-md">
              <div className="text-center space-y-3">
                <p className="text-5xl font-black text-sky-600">10K+</p>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">Openings daily</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <p className="text-2xl font-bold text-emerald-600">4.4</p>
                  <p className="text-xs text-slate-400">42K Reviews</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <p className="text-2xl font-bold text-sky-600">50L+</p>
                  <p className="text-xs text-slate-400">Downloads</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleHeroSearch} className="mt-12 max-w-3xl mx-auto bg-white dark:bg-slate-900 p-2 rounded-2xl sm:rounded-full border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100 dark:shadow-slate-900/50 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 flex items-center w-full px-3 gap-2">
              <FiSearch className="text-slate-400 dark:text-slate-500 shrink-0 w-5 h-5" />
              <input type="text" placeholder="Search jobs, internships, companies..." value={searchVal} onChange={e => setSearchVal(e.target.value)} className="w-full py-2 bg-transparent text-slate-800 dark:text-white text-sm font-semibold focus:outline-none placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex-1 flex items-center w-full px-3 gap-2">
              <FiMapPin className="text-slate-400 dark:text-slate-500 shrink-0 w-4 h-4" />
              <input type="text" placeholder="City or Remote" value={locationVal} onChange={e => setLocationVal(e.target.value)} className="w-full py-2 bg-transparent text-slate-800 dark:text-white text-sm font-semibold focus:outline-none placeholder-slate-400 dark:placeholder-slate-500" />
            </div>
            <button type="submit" className="w-full sm:w-auto px-8 py-3 rounded-xl sm:rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] cursor-pointer">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-8 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Trending now</h2>
          <div className="flex flex-wrap gap-3">
            {['Fresher jobs', 'Work from home', 'Software Developer', 'Data Analyst', 'Marketing', 'Graphic Design', 'Business Development', 'MBA'].map((trend, idx) => (
              <button
                key={trend}
                onClick={() => openJobsListing('query', trend)}
                className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-600 dark:text-slate-400 font-semibold text-xs transition-all cursor-pointer"
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section - matching Internshala's layout and scroll mechanism */}
      <section className="py-14 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Jobs</h2>
              <p className="text-sm text-slate-500">Handpicked opportunities for you</p>
            </div>
            <button onClick={() => navigate('/jobs')} className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer">
              View all <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="mb-8 overflow-x-auto flex gap-2 no-scrollbar pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {jobFilters.map(f => (
              <button
                key={f}
                onClick={() => setActiveJobFilter(activeJobFilter === f ? '' : f)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  activeJobFilter === f
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-800 hover:border-sky-300 hover:text-sky-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Scroll container */}
          <div className="relative">
            <div
              ref={jobScrollRef}
              onScroll={() => handleScrollUpdate(jobScrollRef, setJobScrollThumbStyle, setIsJobScrollAtStart, setIsJobScrollAtEnd)}
              className="flex overflow-x-auto gap-4 pb-4 scroll-smooth hide-scrollbar"
            >
              {allJobPosts.length > 0 ? (
                allJobPosts.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="group min-w-[280px] sm:min-w-[300px] md:min-w-[320px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800/40 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo logo={job.companyLogo} name={job.logoText || job.company.charAt(0)} color={job.logoColor || 'bg-slate-800'} size="sm" />
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{job.title}</h3>
                            <p className="text-xs text-slate-400 font-medium">{job.company}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{job.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold">
                          <FiMapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] font-semibold">
                          {job.employmentType}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-600">{job.salary}</span>
                        <span className="text-xs text-sky-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details <FiArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 text-center py-16 text-slate-400 font-medium">No jobs found. Check back later!</div>
              )}
              {/* View all card */}
              <div
                onClick={() => navigate('/jobs')}
                className="min-w-[240px] bg-cover bg-center rounded-2xl p-6 flex flex-col justify-between cursor-pointer"
                style={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <p className="text-white text-lg font-extrabold">Unlock your true potential</p>
                <p className="text-white/80 text-sm font-medium">Explore more than {jobs.length}+ jobs</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-white text-sm font-bold">View jobs </span>
                  <i className="text-white"><FiArrowRight /></i>
                </div>
              </div>
            </div>

            {/* Scroll controller */}
            <div className="flex items-center justify-center mt-4 gap-4">
              <button
                disabled={isJobScrollAtStart}
                onClick={() => scrollTo(jobScrollRef, 'left')}
                className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${isJobScrollAtStart ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 bg-sky-500 rounded-full will-change-[left]" style={jobScrollThumbStyle} />
              </div>
              <button
                disabled={isJobScrollAtEnd}
                onClick={() => scrollTo(jobScrollRef, 'right')}
                className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${isJobScrollAtEnd ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Internships Section - same pattern as Jobs section */}
      <section className="py-14 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Internships</h2>
              <p className="text-sm text-slate-500">Start your career with top companies</p>
            </div>
            <button onClick={() => { resetFilters(); setFilters(prev => ({ ...prev, employmentType: 'Internship' })); navigate('/jobs'); }} className="text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer">
              View all <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="mb-8 overflow-x-auto flex gap-2 no-scrollbar pb-2">
            {intFilters.map(f => (
              <button
                key={f}
                onClick={() => setActiveIntFilter(activeIntFilter === f ? '' : f)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  activeIntFilter === f
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:text-sky-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Scroll container */}
          <div className="relative">
            <div
              ref={intScrollRef}
              onScroll={() => handleScrollUpdate(intScrollRef, setIntScrollThumbStyle, setIsIntScrollAtStart, setIsIntScrollAtEnd)}
              className="flex overflow-x-auto gap-4 pb-4 scroll-smooth hide-scrollbar"
            >
              {allInternshipPosts.length > 0 ? (
                allInternshipPosts.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="group min-w-[280px] sm:min-w-[300px] md:min-w-[320px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800/40 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Actively Hiring Badge */}
                      <div className="flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-md border border-sky-100 dark:border-sky-900/30 w-fit mb-3">
                        <FiTrendingUp className="w-3.5 h-3.5" />
                        <span>Actively hiring</span>
                      </div>

                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm sm:text-base leading-snug group-hover:text-sky-600 transition-colors">{job.title}</h3>
                          <span className="text-xs text-slate-400 font-bold block mt-1">{job.company}</span>
                        </div>
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt="logo" className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-100" />
                        ) : (
                          <CompanyLogo logo={job.companyLogo} name={job.logoText || job.company.charAt(0)} color={job.logoColor || 'bg-sky-600'} size="sm" />
                        )}
                      </div>

                      <ul className="flex flex-col gap-2 mb-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <li className="flex items-center gap-2"><FiMapPin className="w-4 h-4 text-slate-400 shrink-0" /> {job.location}</li>
                        <li className="flex items-center gap-2"><FiDollarSign className="w-4 h-4 text-slate-400 shrink-0" /> {job.salary}</li>
                        <li className="flex items-center gap-2"><FiClock className="w-4 h-4 text-slate-400 shrink-0" /> {job.duration || '3 Months'}</li>
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded">Internship</span>
                      <span className="text-xs text-sky-600 dark:text-sky-400 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                        View details <FiChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex-1 text-center py-16 text-slate-400 font-medium">No internships found. Check back later!</div>
              )}
              {/* View all card */}
              <div
                onClick={() => { resetFilters(); setFilters(prev => ({ ...prev, employmentType: 'Internship' })); navigate('/jobs'); }}
                className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 flex flex-col justify-between cursor-pointer border border-slate-800 relative overflow-hidden group/viewall"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 to-sky-950/60 opacity-90 group-hover/viewall:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <p className="text-white text-lg font-black tracking-tight mb-2">Unlock your true potential</p>
                  <p className="text-white/70 text-xs font-semibold">Explore more than {jobs.filter(j => j.employmentType === 'Internship').length || '15,000'}+ internships</p>
                </div>
                <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 mt-8">
                  <span className="text-white text-xs font-extrabold">View internships</span>
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover/viewall:bg-white/20 transition-colors flex items-center justify-center text-white">
                    <FiArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll controller */}
            <div className="flex items-center justify-center mt-4 gap-4">
              <button
                disabled={isIntScrollAtStart}
                onClick={() => scrollTo(intScrollRef, 'left')}
                className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${isIntScrollAtStart ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute top-0 bottom-0 bg-sky-500 rounded-full will-change-[left]" style={intScrollThumbStyle} />
              </div>
              <button
                disabled={isIntScrollAtEnd}
                onClick={() => scrollTo(intScrollRef, 'right')}
                className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${isIntScrollAtEnd ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Explore top categories</h2>
            <p className="text-slate-500 mt-2">Find opportunities across different industries</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  onClick={() => { resetFilters(); setFilters(prev => ({ ...prev, role: cat.filter })); navigate('/jobs'); }}
                  className="group bg-slate-50 dark:bg-slate-900/60 hover:bg-sky-600 dark:hover:bg-sky-600 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center gap-3 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:bg-white/20 group-hover:text-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-white">{cat.name}</h3>
                  <span className="text-xs text-slate-400 group-hover:text-sky-100">{cat.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">How it works</h2>
            <p className="text-slate-500 mt-2">Three simple steps to start your career journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiSearch className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Find Opportunities</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Browse thousands of jobs and internships from top companies.</p>
            </div>
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Get Skill Matched</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Upload your resume and get matched with jobs that fit your skills.</p>
            </div>
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">Apply &amp; Get Hired</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Apply in one click and get placed with your dream company.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Match Sandbox - simplified */}
      <section className="py-16 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Instantly see how your skills match with jobs
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed">
                Select skills you have and we'll show you how well you match with real jobs.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkillInSandbox(skill)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-md'
                          : 'text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-300'
                      }`}
                    >
                      {skill} {isSelected && ' ✓'}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Top matches ({sandboxJobs.length})</h3>
              {sandboxJobs.length > 0 ? (
                sandboxJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                  >
                    <CompanyLogo logo={job.companyLogo} name={job.logoText || job.company.charAt(0)} color={job.logoColor || 'bg-sky-600'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{job.title}</h4>
                      <p className="text-xs text-slate-400">{job.company}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-sky-600">{job.sandboxScore}%</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Select some skills to get started
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Success stories</h2>
              <p className="text-slate-500 mt-1">Real people, real results</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentTestimonial(prev => (prev + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 shadow-sm animate-fade-in">
            <div className="flex items-center gap-1 text-yellow-400 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar key={star} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
              "{testimonials[currentTestimonial].quote}"
            </p>
            <div className="flex items-center gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${testimonials[currentTestimonial].avatar}`}>
                {testimonials[currentTestimonial].name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">{testimonials[currentTestimonial].name}</p>
                <p className="text-xs text-slate-500">{testimonials[currentTestimonial].role} at <strong>{testimonials[currentTestimonial].company}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-3xl font-extrabold">Start your career journey today!</h2>
          <p className="text-slate-300 mt-4 text-sm max-w-xl mx-auto">
            Create an account, upload your resume, get skill-matched and apply in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer">
                Go to Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/register')} className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer">
                Get Started Free
              </button>
            )}
            <button onClick={() => navigate('/jobs')} className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all cursor-pointer">
              Browse Openings
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
