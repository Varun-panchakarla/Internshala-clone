import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiSearch, FiMapPin, FiBriefcase, FiClock, FiHeart, FiSliders, FiX, FiRefreshCw, FiStar } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
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

  const dateOptions = [
    { label: 'Any Time', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' }
  ];

  // Render Filter Form Component (reusable)
  const FilterContent = () => (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
          <FiSliders /> Filter Criteria
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors focus:outline-none"
        >
          <FiRefreshCw className="w-3 h-3" /> Clear All
        </button>
      </div>

      <Input
        label="Role Type"
        id="filterRole"
        type="select"
        value={filters.role}
        onChange={(e) => handleFilterChange('role', e.target.value)}
        options={roleOptions}
      />

      <Input
        label="Location Type"
        id="filterLocation"
        type="select"
        value={filters.location}
        onChange={(e) => handleFilterChange('location', e.target.value)}
        options={locationOptions}
      />

      <Input
        label="Experience Range"
        id="filterExperience"
        type="select"
        value={filters.experience}
        onChange={(e) => handleFilterChange('experience', e.target.value)}
        options={experienceOptions}
      />

      <Input
        label="Employment Type"
        id="filterType"
        type="select"
        value={filters.employmentType}
        onChange={(e) => handleFilterChange('employmentType', e.target.value)}
        options={employmentTypeOptions}
      />

      <Input
        label="Company Name"
        id="filterCompany"
        type="text"
        placeholder="e.g. TCS, Accenture..."
        value={filters.company}
        onChange={(e) => handleFilterChange('company', e.target.value)}
      />

      <Input
        label="Salary Range"
        id="filterSalary"
        type="select"
        value={filters.salaryRange}
        onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
        options={salaryOptions}
      />

      <Input
        label="Date Posted"
        id="filterDate"
        type="select"
        value={filters.datePosted}
        onChange={(e) => handleFilterChange('datePosted', e.target.value)}
        options={dateOptions}
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full animate-slide-up">
      
      {/* 1. Desktop Filter Sidebar */}
      <div className="hidden lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 shadow-md sticky top-20">
        <FilterContent />
      </div>

      {/* 2. Main Browse Area */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Search header panel */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 text-slate-400 w-5 h-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job title, company, or skills (e.g. React)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 text-sm font-medium"
            />
          </div>
          
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            className="lg:hidden flex items-center gap-1.5 py-3"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <FiSliders /> Filters
          </Button>
        </div>

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
                      : 'bg-white border-slate-100 hover:border-slate-200'
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
                          <h3 className={`text-base font-extrabold leading-tight ${isFeatured ? 'text-white' : 'text-slate-800'}`}>
                            {job.title}
                          </h3>
                          <p className={`text-xs font-bold mt-0.5 ${isFeatured ? 'text-slate-200/80' : 'text-slate-400'}`}>
                            {job.company} • {job.location}
                          </p>
                        </div>
                      </div>

                      {/* Match percentage */}
                      {isAuthenticated && (
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 ${
                          isFeatured 
                            ? 'bg-emerald-400 text-slate-950 shadow-sm'
                            : 'bg-brand-50 text-brand-700 border border-brand-100'
                        }`}>
                          {job.matchScore}% Match
                        </div>
                      )}
                    </div>

                    {/* Description excerpt */}
                    <p className={`text-xs leading-relaxed line-clamp-2 mb-4 font-light ${
                      isFeatured ? 'text-slate-100/80' : 'text-slate-500'
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
                              : 'bg-slate-50 border border-slate-100 text-slate-600'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Metadata Footer Row */}
                    <div className={`flex flex-wrap items-center gap-y-2 gap-x-4 border-t pt-4 text-xs font-bold ${
                      isFeatured ? 'border-white/10 text-slate-200' : 'border-slate-50 text-slate-400'
                    }`}>
                      <span className="flex items-center gap-1">
                        <FiBriefcase className="opacity-60" /> {job.experience}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="opacity-60" /> {job.employmentType}
                      </span>
                      <span className="ml-auto font-black text-slate-800">
                        <span className={isFeatured ? 'text-emerald-400' : 'text-brand-600'}>{job.salary}</span>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className={`p-2.5 shrink-0 bg-white ${isFeatured ? 'hover:bg-slate-50 border-none' : ''}`}
                      onClick={(e) => handleSaveToggle(e, job.id)}
                    >
                      <FiHeart className={isJobSaved(job.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                    </Button>
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
