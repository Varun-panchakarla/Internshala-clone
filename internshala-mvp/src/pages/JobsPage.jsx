import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiSearch, FiMapPin, FiBriefcase, FiClock, FiBookmark, FiSliders, FiX, FiRefreshCw, FiStar } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import FilterDropdown from '../components/common/FilterDropdown';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobsPage = () => {
  const {
    filteredJobs,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    saveJob,
    unsaveJob,
    isJobSaved,
    isJobApplied,
    resetFilters
  } = useJobs();

  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const filterPanelRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (key) => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  useEffect(() => {
    if (location.state && location.state.filterType) {
      setFilters(prev => ({
        ...prev,
        employmentType: location.state.filterType
      }));
      // Clear location state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setFilters]);

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

  const handleApplyClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const roleOptions = [
    { label: 'All Roles', value: '' },
    { label: 'Frontend Developer', value: 'frontend' },
    { label: 'React Developer', value: 'react' },
    { label: 'Full Stack Developer', value: 'full stack' },
    { label: 'Backend Engineer', value: 'backend' },
    { label: 'UI/UX & Design', value: 'ui' }
  ];

  const locationOptions = [
    { label: 'All Locations', value: '' },
    { label: 'Remote', value: 'remote' },
    { label: 'Bangalore', value: 'bangalore' },
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Chennai', value: 'chennai' }
  ];

  const experienceOptions = [
    { label: 'All Experience', value: '' },
    { label: 'Fresher (0 years)', value: 'Fresher' },
    { label: '1-3 Years', value: '1-3 years' },
    { label: '3+ Years', value: '3+ years' }
  ];

  const employmentTypeOptions = [
    { label: 'All Job Types', value: '' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Internship', value: 'Internship' },
    { label: 'Contract', value: 'Contract' }
  ];

  const salaryOptions = [
    { label: 'All Salaries', value: '' },
    { label: 'Below ₹3 LPA', value: 'below-3' },
    { label: '₹3 - ₹6 LPA', value: '3-6' },
    { label: '₹6 - ₹12 LPA', value: '6-12' },
    { label: 'Above ₹12 LPA', value: 'above-12' }
  ];

  const workModeOptions = [
    { label: 'All Modes', value: '' },
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'On-site', value: 'on-site' }
  ];

  const sortByOptions = [
    { label: 'Most Relevant', value: 'relevance' },
    { label: 'Newest First', value: 'newest' },
    { label: 'Highest Salary', value: 'salary' }
  ];

  // Render Filter Form Component (reusable for mobile drawer)
  const FilterContent = () => (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <FiSliders /> Filter Criteria
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 transition-colors focus:outline-none"
        >
          <FiRefreshCw className="w-3 h-3" /> Clear All
        </button>
      </div>

      <FilterDropdown label="Role Type" id="mFilterRole" value={filters.role} onChange={(val) => handleFilterChange('role', val)} options={roleOptions} isOpen={openDropdown === 'mRole'} onToggle={() => toggleDropdown('mRole')} onClose={() => setOpenDropdown(null)} searchable={true} searchPlaceholder="Search roles..." />
      <FilterDropdown label="Location Type" id="mFilterLocation" value={filters.location} onChange={(val) => handleFilterChange('location', val)} options={locationOptions} isOpen={openDropdown === 'mLocation'} onToggle={() => toggleDropdown('mLocation')} onClose={() => setOpenDropdown(null)} />
      <FilterDropdown label="Work Mode" id="mFilterWorkMode" value={filters.workMode} onChange={(val) => handleFilterChange('workMode', val)} options={workModeOptions} isOpen={openDropdown === 'mWorkMode'} onToggle={() => toggleDropdown('mWorkMode')} onClose={() => setOpenDropdown(null)} />
      <FilterDropdown label="Employment Type" id="mFilterType" value={filters.employmentType} onChange={(val) => handleFilterChange('employmentType', val)} options={employmentTypeOptions} isOpen={openDropdown === 'mType'} onToggle={() => toggleDropdown('mType')} onClose={() => setOpenDropdown(null)} />
      <FilterDropdown label="Experience Range" id="mFilterExperience" value={filters.experience} onChange={(val) => handleFilterChange('experience', val)} options={experienceOptions} isOpen={openDropdown === 'mExperience'} onToggle={() => toggleDropdown('mExperience')} onClose={() => setOpenDropdown(null)} />
      <Input label="Company Name" id="mFilterCompany" type="text" placeholder="e.g. TCS..." value={filters.company} onChange={(e) => handleFilterChange('company', e.target.value)} onFocus={() => setOpenDropdown(null)} />
      <FilterDropdown label="Sort By" id="mFilterSort" value={filters.sortBy} onChange={(val) => handleFilterChange('sortBy', val)} options={sortByOptions} isOpen={openDropdown === 'mSort'} onToggle={() => toggleDropdown('mSort')} onClose={() => setOpenDropdown(null)} />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 items-start w-full animate-slide-up pb-8">
      
      {/* 1. Top Filter Panel */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-5" ref={filterPanelRef}>
        
        {/* Search header panel */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 text-slate-400 dark:text-slate-500 w-5 h-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, company, or skills (e.g. React)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setOpenDropdown(null)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-slate-100 text-sm font-medium"
            />
          </div>
          
          <Button
            variant="light"
            className="hidden lg:flex items-center gap-1.5 py-3 whitespace-nowrap"
            onClick={resetFilters}
          >
            <FiRefreshCw /> Clear All Filters
          </Button>

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden flex items-center gap-1.5 py-3"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <FiSliders /> Filters
          </Button>
        </div>

        {/* Desktop Filter Grid */}
        <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 items-end">
          <FilterDropdown label="Role" id="filterRole" value={filters.role} onChange={(val) => handleFilterChange('role', val)} options={roleOptions} isOpen={openDropdown === 'role'} onToggle={() => toggleDropdown('role')} onClose={() => setOpenDropdown(null)} searchable={true} searchPlaceholder="Search roles..." />
          <FilterDropdown label="Location" id="filterLocation" value={filters.location} onChange={(val) => handleFilterChange('location', val)} options={locationOptions} isOpen={openDropdown === 'location'} onToggle={() => toggleDropdown('location')} onClose={() => setOpenDropdown(null)} />
          <FilterDropdown label="Work Mode" id="filterWorkMode" value={filters.workMode} onChange={(val) => handleFilterChange('workMode', val)} options={workModeOptions} isOpen={openDropdown === 'workMode'} onToggle={() => toggleDropdown('workMode')} onClose={() => setOpenDropdown(null)} />
          <FilterDropdown label="Job Type" id="filterType" value={filters.employmentType} onChange={(val) => handleFilterChange('employmentType', val)} options={employmentTypeOptions} isOpen={openDropdown === 'employmentType'} onToggle={() => toggleDropdown('employmentType')} onClose={() => setOpenDropdown(null)} />
          <FilterDropdown label="Experience" id="filterExperience" value={filters.experience} onChange={(val) => handleFilterChange('experience', val)} options={experienceOptions} isOpen={openDropdown === 'experience'} onToggle={() => toggleDropdown('experience')} onClose={() => setOpenDropdown(null)} />
          <Input label="Company" type="text" placeholder="e.g. TCS..." value={filters.company} onChange={(e) => handleFilterChange('company', e.target.value)} onFocus={() => setOpenDropdown(null)} />
          <FilterDropdown label="Sort By" id="filterSort" value={filters.sortBy} onChange={(val) => handleFilterChange('sortBy', val)} options={sortByOptions} isOpen={openDropdown === 'sortBy'} onToggle={() => toggleDropdown('sortBy')} onClose={() => setOpenDropdown(null)} />
        </div>
      </div>

      {/* 2. Main Browse Area */}
      <div className="w-full flex flex-col gap-6">

        {/* Listing Stats */}
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
          <span>Found {filteredJobs.length} active listings</span>
        </div>

        {/* Jobs List Grid */}
        {loading ? (
          <LoadingSpinner text="Searching jobs..." />
        ) : filteredJobs.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filteredJobs.map((job, index) => {
              // Highlight cards differently after every 5 jobs (6th, 12th, etc.)
              const isFeatured = (index + 1) % 6 === 0;

              return (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className={`relative overflow-hidden rounded-2xl p-6 border shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col justify-between gap-4 ${
                    isFeatured
                      ? 'bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-900 border-indigo-200 text-white hover:scale-[1.01]'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {isFeatured && (
                    <>
                      {/* Ambient glows and star banner for featured jobs */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -translate-y-8 translate-x-8 pointer-events-none" />
                      <div className="absolute top-4 right-4 bg-emerald-400 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                        <FiStar className="fill-slate-950" /> Recommended For You
                      </div>
                    </>
                  )}

                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center font-extrabold text-xl shadow-sm ${
                          isFeatured ? 'bg-white/10 text-white' : `${job.logoColor} text-white`
                        }`}>
                          {job.logoText}
                        </div>
                        <div>
                          <h3 className={`text-base font-extrabold leading-tight ${isFeatured ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                            {job.title}
                          </h3>
                          <p className={`text-xs font-bold mt-0.5 ${isFeatured ? 'text-slate-200/80' : 'text-slate-400 dark:text-slate-500'}`}>
                            {job.company} • {job.location}
                          </p>
                        </div>
                      </div>

                      {/* Match percentage */}
                      {isAuthenticated && (
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 ${
                          isFeatured 
                            ? 'bg-emerald-400 text-slate-950 shadow-sm'
                            : 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-900/50'
                        }`}>
                          {job.matchScore}% Match
                        </div>
                      )}
                    </div>

                    {/* Description excerpt */}
                    <p className={`text-xs leading-relaxed line-clamp-2 mb-4 font-light ${
                      isFeatured ? 'text-slate-100/80' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {job.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                            isFeatured
                              ? 'bg-white/10 text-white border border-white/10'
                              : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Metadata Footer Row */}
                    <div className={`flex flex-wrap items-center gap-y-2 gap-x-4 border-t pt-4 text-xs font-bold ${
                      isFeatured ? 'border-white/10 text-slate-200' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <span className="flex items-center gap-1">
                        <FiBriefcase className="opacity-60" /> {job.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="opacity-60" /> {job.employmentType}
                      </span>
                      <span className="ml-auto font-black text-slate-800 dark:text-white">
                        <span className={isFeatured ? 'text-emerald-400' : 'text-brand-600 dark:text-brand-400'}>{job.salary}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant={isFeatured ? 'secondary' : 'primary'}
                      size="sm"
                      className="flex-1 font-bold shadow-sm"
                      onClick={() => handleApplyClick(job.id)}
                    >
                      {isJobApplied(job.id) ? 'Applied' : 'Apply Details'}
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => handleSaveToggle(e, job.id)}
                      className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                      title={isJobSaved(job.id) ? 'Remove from saved' : 'Save job'}
                    >
                      <FiBookmark className={`w-4 h-4 ${isJobSaved(job.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-400'}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
            <p className="text-sm font-medium text-slate-400 italic">No job listings matched your filters.</p>
            <Button variant="light" size="sm" onClick={resetFilters}>
              Reset Search Filters
            </Button>
          </div>
        )}
      </div>

      {/* 3. Mobile Filters Slideover Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Overlay */}
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setMobileFiltersOpen(false)} />
          
          {/* Drawer container */}
          <div className="relative ml-auto max-w-xs w-full h-full bg-white shadow-2xl p-6 flex flex-col overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-bold text-slate-800">Filters</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <FilterContent />

            <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
              <Button variant="outline" className="flex-1 py-3" onClick={resetFilters}>
                Clear
              </Button>
              <Button variant="primary" className="flex-1 py-3" onClick={() => setMobileFiltersOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobsPage;
