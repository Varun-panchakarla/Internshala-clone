import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
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
  FiHeart
} from 'react-icons/fi';

const LandingPage = () => {
  const { jobs, setSearchQuery, setFilters, resetFilters, saveJob, unsaveJob, isJobSaved } = useJobs();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Hero Search State
  const [searchVal, setSearchVal] = useState('');
  const [locationVal, setLocationVal] = useState('');

  // Skill Matcher Sandbox State
  const availableSkills = [
    'React', 'JavaScript', 'Node.js', 'Python', 'Figma', 'TypeScript', 'Tailwind CSS', 'SQL', 'Docker', 'CSS'
  ];
  const [selectedSkills, setSelectedSkills] = useState(['React', 'JavaScript']);

  // Featured Jobs Tab State
  const [activeTab, setActiveTab] = useState('All'); // All, Internship, Full-time, Remote

  // Testimonials Slider State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-slide testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    resetFilters();
    setSearchQuery(searchVal);
    setFilters(prev => ({
      ...prev,
      location: locationVal
    }));
    navigate('/jobs');
  };

  const handleQuickTagClick = (tagType, value) => {
    resetFilters();
    if (tagType === 'query') {
      setSearchQuery(value);
    } else if (tagType === 'location') {
      setFilters(prev => ({ ...prev, location: value }));
    } else if (tagType === 'experience') {
      setFilters(prev => ({ ...prev, experience: value }));
    }
    navigate('/jobs');
  };

  const handleCategoryClick = (categoryRole) => {
    resetFilters();
    setFilters(prev => ({
      ...prev,
      role: categoryRole
    }));
    navigate('/jobs');
  };

  const toggleSkillInSandbox = (skill) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(prev => prev.filter(s => s !== skill));
      } else {
        addToast('Select at least one skill to calculate matches!', 'info');
      }
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  // Calculate skill matches for sandbox jobs
  const getSandboxMatchingJobs = () => {
    return jobs.map(job => {
      const matches = job.skills.filter(s => 
        selectedSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase())
      );
      const score = job.skills.length > 0 
        ? Math.round((matches.length / job.skills.length) * 100) 
        : 0;
      
      return {
        ...job,
        sandboxScore: score,
        matchedSkillsCount: matches.length
      };
    })
    .filter(job => job.sandboxScore > 0)
    .sort((a, b) => b.sandboxScore - a.sandboxScore)
    .slice(0, 3);
  };

  const sandboxJobs = getSandboxMatchingJobs();

  // Filter featured jobs based on active tab
  const getFeaturedJobs = () => {
    return jobs.filter(job => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Internship') return job.employmentType === 'Internship';
      if (activeTab === 'Full-time') return job.employmentType === 'Full-time';
      if (activeTab === 'Remote') return job.location.toLowerCase().includes('remote');
      return true;
    }).slice(0, 4);
  };

  const featuredJobs = getFeaturedJobs();

  const handleSaveToggle = async (e, jobId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please login to save jobs.', 'info');
      navigate('/login');
      return;
    }

    try {
      if (isJobSaved(jobId)) {
        await unsaveJob(jobId);
        addToast('Removed from saved list.', 'success');
      } else {
        await saveJob(jobId);
        addToast('Added to saved list!', 'success');
      }
    } catch (err) {
      addToast('Action failed.', 'error');
    }
  };

  // Design static content
  const categories = [
    { name: 'Software Development', icon: FiCode, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20 dark:text-sky-400', count: '4,200+ Openings', filter: 'developer' },
    { name: 'UI/UX & Design', icon: FiPenTool, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400', count: '1,800+ Openings', filter: 'ui' },
    { name: 'Data Science & AI', icon: FiDatabase, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400', count: '950+ Openings', filter: 'data' },
    { name: 'Product Management', icon: FiLayers, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400', count: '600+ Openings', filter: 'product' },
    { name: 'Growth & Marketing', icon: FiTrendingUp, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400', count: '1,200+ Openings', filter: 'marketing' },
    { name: 'Finance & Business', icon: FiDollarSign, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400', count: '780+ Openings', filter: 'finance' },
  ];

  const testimonials = [
    {
      quote: "I managed to secure a React Intern position at Google through the portal. The automated skill match score helped me fine-tune my profile to match exactly what Google recruiters wanted.",
      name: "Tanya Sharma",
      role: "Frontend Engineer Intern",
      company: "Google",
      rating: 5,
      avatar: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
    },
    {
      quote: "The resume builder on this site is phenomenal. It took me 10 minutes to compile my projects, audit keyword density, and start applying. I got hired by Stripe as a full-time Dev within a week!",
      name: "Rohit Verma",
      role: "React Developer",
      company: "Stripe",
      rating: 5,
      avatar: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
    },
    {
      quote: "As a fresher, finding verified internships with good stipends was tough. Here, every employer is vetted. I'm currently interning at Slack with a ₹35k/month stipend, and learning so much.",
      name: "Ananya Iyer",
      role: "Software Engineering Intern",
      company: "Slack",
      rating: 5,
      avatar: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
    }
  ];

  const partners = [
    { name: 'Google', logoText: 'Google', color: 'text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400' },
    { name: 'Stripe', logoText: 'Stripe', color: 'text-slate-400 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400' },
    { name: 'Canva', logoText: 'Canva', color: 'text-slate-400 dark:text-slate-600 hover:text-purple-500 dark:hover:text-purple-400' },
    { name: 'Airbnb', logoText: 'Airbnb', color: 'text-slate-400 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400' },
    { name: 'Slack', logoText: 'Slack', color: 'text-slate-400 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400' },
    { name: 'Spotify', logoText: 'Spotify', color: 'text-slate-400 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400' },
    { name: 'Netflix', logoText: 'Netflix', color: 'text-slate-400 dark:text-slate-600 hover:text-red-600 dark:hover:text-red-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-350">
        {/* Background Mesh Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-radial from-brand-100/40 dark:from-brand-950/20 via-transparent to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-radial from-violet-100/30 dark:from-violet-950/15 via-transparent to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
              
              {/* Micro badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs font-bold self-center lg:self-start border border-brand-100/55 dark:border-brand-900/40 animate-fade-in shadow-xs">
                <FiAward className="w-3.5 h-3.5 animate-pulse" />
                <span>India's Premium Career Launchpad MVP</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] animate-slide-up">
                Find your dream <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">job or internship</span> today.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-semibold max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Connect with vetted companies, calculate real-time compatibility scores based on your skills, and apply with a single click.
              </p>

              {/* Search Console */}
              <form onSubmit={handleHeroSearch} className="w-full max-w-2xl mt-2 bg-white dark:bg-slate-950 p-2 rounded-2xl sm:rounded-full border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100/85 dark:shadow-none flex flex-col sm:flex-row gap-2 items-center transition-colors">
                <div className="flex-1 flex items-center w-full px-3 gap-2">
                  <FiSearch className="text-slate-400 dark:text-slate-500 shrink-0 w-5 h-5" />
                  <input 
                    type="text"
                    placeholder="Job title, skills, or company..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full py-2 bg-transparent text-slate-800 dark:text-white text-sm font-semibold focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
                
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                <div className="flex-1 flex items-center w-full px-3 gap-2">
                  <FiMapPin className="text-slate-400 dark:text-slate-500 shrink-0 w-4 h-4" />
                  <input 
                    type="text"
                    placeholder="City or 'Remote'..."
                    value={locationVal}
                    onChange={(e) => setLocationVal(e.target.value)}
                    className="w-full py-2 bg-transparent text-slate-800 dark:text-white text-sm font-semibold focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/10 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Search Opportunities
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <span>Popular Searches:</span>
                <button type="button" onClick={() => handleQuickTagClick('query', 'React')} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors">React</button>
                <button type="button" onClick={() => handleQuickTagClick('location', 'Remote')} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-655 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors">Remote</button>
                <button type="button" onClick={() => handleQuickTagClick('experience', 'Fresher')} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-655 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors">Fresher</button>
                <button type="button" onClick={() => handleQuickTagClick('query', 'UI UX')} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-655 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors">UI/UX Design</button>
              </div>

              {/* Action Buttons for Auth */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-4">
                {isAuthenticated ? (
                  <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
                    Go to My Dashboard
                  </Button>
                ) : (
                  <>
                    <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
                      Register for Free
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                      Login
                    </Button>
                  </>
                )}
              </div>

            </div>

            {/* Right Graphics */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Glassmorphic Stats Stack */}
              <div className="relative w-full max-w-sm aspect-square bg-gradient-to-tr from-brand-500/10 via-indigo-500/5 to-transparent rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl"></div>
                
                {/* Visual card top */}
                <div className="glass-panel dark:glass-panel-dark p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-md flex items-center gap-3 animate-fade-in hover:scale-105 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow shadow-emerald-500/20">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">100% Verified Recruiter</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Only secure placements</p>
                  </div>
                </div>

                {/* Visual card middle (Match rating) */}
                <div className="glass-panel dark:glass-panel-dark p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-md flex items-center gap-3 self-end w-4/5 translate-x-4 hover:scale-105 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-lg shadow-indigo-500/20">
                    94%
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">Skills Matching Score</h4>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[94%] rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Visual card bottom */}
                <div className="glass-panel dark:glass-panel-dark p-4 rounded-2xl border border-white/50 dark:border-white/5 shadow-md flex items-center gap-3 hover:scale-105 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow shadow-rose-500/20">
                    <FiHeart className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white">Job Saved</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Tanya saved Frontend Intern</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Trust Banner (Company Marquee) */}
      <section className="bg-slate-50 dark:bg-slate-950 py-10 overflow-hidden border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
            Leading companies hiring from our portal
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {partners.map((company) => (
              <div 
                key={company.name}
                className={`text-xl font-extrabold tracking-tight transition-all duration-300 scale-100 hover:scale-110 cursor-default ${company.color}`}
              >
                {company.logoText}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Explorer */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Opportunities by Category
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
              Click on any sector below to browse live job openings and internships filtered by industry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.filter)}
                  className="group relative bg-slate-50 dark:bg-slate-900/60 hover:bg-brand-600 dark:hover:bg-brand-600 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-brand-600/10"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-white/20 group-hover:text-white ${cat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white group-hover:text-white transition-colors text-base mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-slate-400 dark:text-slate-500 group-hover:text-brand-100 transition-colors text-xs font-bold">
                        {cat.count}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <FiArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Interactive Skill Match Sandbox (AI Match Preview) */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Interactive Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <span className="text-xs font-black text-brand-600 tracking-wider uppercase mb-1.5 block">
                  AI match simulation
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Simulate your Match Rate instantly.
                </h2>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Click on the skill badges below to add them to your profile. Watch the match score of real jobs on the right update reactively!
              </p>

              {/* Skills Box */}
              <div className="flex flex-wrap gap-2.5 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkillInSandbox(skill)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-600 text-white shadow shadow-brand-500/20 scale-[1.03]'
                          : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400 border border-slate-205/50 dark:border-slate-800'
                      }`}
                    >
                      {skill} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>

              <div className="bg-brand-50 dark:bg-brand-950/20 p-4 rounded-xl border border-brand-100/50 dark:border-brand-900/30 flex gap-3 text-xs font-semibold text-brand-800 dark:text-brand-400">
                <FiAward className="w-5 h-5 shrink-0 text-brand-600" />
                <span>Our actual matcher compares your skills, experience, and projects in <strong>Profile Setup</strong> to provide ATS score recommendations.</span>
              </div>
            </div>

            {/* Right: Dynamic Match Listings */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-wider">
                  Live Compatible Jobs ({sandboxJobs.length})
                </h3>
                <span className="text-xs text-slate-450 dark:text-slate-500 font-bold">
                  Simulating matching based on {selectedSkills.length} selected skills
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {sandboxJobs.length > 0 ? (
                  sandboxJobs.map((job) => (
                    <div 
                      key={job.id}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                    >
                      {/* Job details */}
                      <div className="flex gap-4 items-start">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 font-black text-lg ${job.logoColor || 'bg-slate-800'}`}>
                          {job.logoText || job.company.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-white group-hover:text-brand-600 transition-colors text-base">
                            {job.title}
                          </h4>
                          <p className="text-slate-400 dark:text-slate-550 text-xs font-bold mb-2">
                            {job.company} &bull; {job.location}
                          </p>
                          {/* Matching skills indicators */}
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.map((s) => {
                              const matches = selectedSkills.map(sk => sk.toLowerCase()).includes(s.toLowerCase());
                              return (
                                <span 
                                  key={s}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    matches 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border border-emerald-100/40 dark:border-emerald-900/30'
                                      : 'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800'
                                  }`}
                                >
                                  {s}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Matching Ring Score */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-right">
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Compatibility</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                            {job.sandboxScore}% Match
                          </p>
                        </div>
                        
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                          {/* SVG Circular indicator */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle 
                              cx="24" cy="24" r="18" 
                              stroke="#f1f5f9" strokeWidth="4.5" fill="transparent" 
                              className="dark:stroke-slate-800"
                            />
                            <circle 
                              cx="24" cy="24" r="18" 
                              stroke={job.sandboxScore >= 75 ? '#10b981' : job.sandboxScore >= 40 ? '#f59e0b' : '#64748b'} 
                              strokeWidth="4.5" fill="transparent" 
                              strokeDasharray={2 * Math.PI * 18}
                              strokeDashoffset={2 * Math.PI * 18 * (1 - job.sandboxScore / 100)}
                            />
                          </svg>
                          <span className="absolute text-[10px] font-black text-slate-700 dark:text-slate-300">
                            {job.sandboxScore}%
                          </span>
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
                    <FiBriefcase className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-bold">No jobs matching selected skills</p>
                    <p className="text-xs text-slate-455">Toggle some other skill options on the left to see matches</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Featured Jobs Showcase */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-black text-brand-600 tracking-wider uppercase mb-1.5 block">
                Top opportunities
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Featured Jobs & Internships
              </h2>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-850 gap-1 pb-1">
              {['All', 'Internship', 'Full-time', 'Remote'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border-b-2 border-brand-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {tab === 'All' ? 'All Roles' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <div 
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="group bg-white dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 hover:border-slate-200/90 dark:hover:border-slate-750 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between gap-5 relative hover:-translate-y-1"
              >
                
                <div>
                  {/* Top line info */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3.5 items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 font-black text-lg ${job.logoColor || 'bg-slate-800'}`}>
                        {job.logoText || job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-white group-hover:text-brand-600 transition-colors text-base">
                          {job.title}
                        </h3>
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">
                          {job.company}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleSaveToggle(e, job.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isJobSaved(job.id)
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-405 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FiHeart className={`w-4 h-4 ${isJobSaved(job.id) ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  {/* Core description snippet */}
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-4 line-clamp-2 leading-relaxed font-semibold">
                    {job.description}
                  </p>

                  {/* Tags row */}
                  <div className="flex flex-wrap gap-2 mt-4 text-[10px] font-bold text-slate-550 dark:text-slate-400">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850">
                      <FiMapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850">
                      <FiBriefcase className="w-3.5 h-3.5" />
                      {job.employmentType}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-850">
                      <FiClock className="w-3.5 h-3.5" />
                      {job.postedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850 pt-4 mt-2">
                  <span className="text-xs font-black text-brand-700 dark:text-brand-400">
                    {job.salary}
                  </span>
                  
                  <span className="text-xs text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                    View Details & Apply
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" onClick={() => navigate('/jobs')}>
              Explore All Live Roles ({jobs.length} total)
            </Button>
          </div>

        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Seamless Career Experience
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
              Whether you are looking to secure a dream internship or hire top talent, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* For Students Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-205/50 dark:border-slate-800 shadow-sm flex flex-col gap-6 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                  <FiUsers className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  For Job Seekers
                </h3>
              </div>

              <div className="space-y-6 mt-2">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Build Your Resume</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-relaxed">
                      Use our resume builder tool to compile credentials, layout formatting, and review keyword density instantly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Calculate Compatibility</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-relaxed">
                      Simulate match rates, see recommendations, and know where you stand before applying.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">1-Click Fast Apply</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-relaxed">
                      Apply easily to top-tier companies. Track real-time progress on your candidate dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="light" className="mt-4" onClick={() => navigate('/register')}>
                Start Seeking Work <FiArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </div>

            {/* For Employers Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-205/50 dark:border-slate-800 shadow-sm flex flex-col gap-6 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <FiBriefcase className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  For Recruiters & Brands
                </h3>
              </div>

              <div className="space-y-6 mt-2">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Create Free Job Listings</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-relaxed">
                      Detail requirements, stipends/salaries, location parameters, and required skill keywords.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Automate Profile Screening</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-relaxed">
                      Let our automated engine screen profiles and calculate score cards to find the top candidates.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Direct Message & Close</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1 leading-relaxed">
                      Coordinate interviews, offer feedback, and hire high-fidelity candidates effortlessly.
                    </p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="mt-4 border-indigo-200 text-indigo-700 hover:border-indigo-600 hover:text-indigo-800 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:border-indigo-650" onClick={() => addToast('Employer accounts interface is set to release soon!', 'info')}>
                Register as Employer <FiArrowRight className="ml-1.5 w-4 h-4" />
              </Button>
            </div>

          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-14">
            <div className="max-w-xl text-center md:text-left flex flex-col gap-2">
              <span className="text-xs font-black text-brand-600 tracking-wider uppercase">
                Success Stories
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Placements that inspire.
              </h2>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-350 cursor-pointer"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-350 cursor-pointer"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Testimonial slider container */}
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 rounded-3xl p-8 sm:p-12 shadow-sm animate-fade-in transition-colors">
              <div className="absolute top-6 left-6 text-brand-200 dark:text-brand-900/30 font-serif text-7xl select-none leading-none">
                “
              </div>
              
              <div className="relative z-10 flex flex-col gap-6">
                
                {/* Rating stars */}
                <div className="flex gap-1 text-amber-400">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base md:text-lg font-semibold italic leading-relaxed">
                  {testimonials[currentTestimonial].quote}
                </p>

                {/* User card info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-slate-200/60 dark:border-slate-850 mt-2">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${testimonials[currentTestimonial].avatar}`}>
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold">
                      {testimonials[currentTestimonial].role} at <span className="text-brand-600 dark:text-brand-450 font-extrabold">{testimonials[currentTestimonial].company}</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800 dark:border-slate-900 relative overflow-hidden transition-colors">
        {/* Decorative Grid Light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 relative z-10 flex flex-col gap-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Kickstart Your Career Journey Today.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Create an account, build your AI-evaluated resume, calculate skill matches on live jobs, and apply within minutes.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {isAuthenticated ? (
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                Get Started for Free
              </button>
            )}
            
            <button 
              type="button" 
              onClick={() => navigate('/jobs')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-bold text-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
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
