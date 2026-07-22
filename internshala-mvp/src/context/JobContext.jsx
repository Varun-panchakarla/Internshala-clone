import React, { createContext, useContext, useState, useEffect } from 'react';
import { jobService } from '../services/mockApi';
import { useAuth } from './AuthContext';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [appliedDetails, setAppliedDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    location: '',
    experience: '',
    employmentType: '',
    skills: [],
    company: '',
    salaryRange: '',
    datePosted: '',
    workMode: '',
    sortBy: 'relevance'
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getAllJobs();
      setJobs(res.data.data || res.data);

      if (isAuthenticated) {
        const savedRes = await jobService.getSavedJobIds();
        setSavedJobIds(savedRes.data.data || []);

        const appliedRes = await jobService.getAppliedJobIds();
        setAppliedJobIds(appliedRes.data.data || []);

        const detailsRes = await jobService.getAppliedJobDetails();
        setAppliedDetails(detailsRes.data.data || []);
      } else {
        setSavedJobIds([]);
        setAppliedJobIds([]);
        setAppliedDetails([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [isAuthenticated, currentUser?.id]);

  const saveJob = async (jobId) => {
    try {
      await jobService.saveJob(jobId);
      setSavedJobIds(prev => [...prev, jobId]);
    } catch (err) {
      console.error('Failed to save job', err);
      throw err;
    }
  };

  const unsaveJob = async (jobId) => {
    try {
      await jobService.unsaveJob(jobId);
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job', err);
      throw err;
    }
  };

  const applyToJob = async (jobId) => {
    try {
      await jobService.applyToJob(jobId);
      setAppliedJobIds(prev => [...prev, jobId]);
      setAppliedDetails(prev => [{ job_id: jobId, status: 'Pending', applied_at: new Date().toISOString() }, ...prev]);
    } catch (err) {
      console.error('Failed to apply to job', err);
      throw err;
    }
  };

  const isJobSaved = (jobId) => savedJobIds.includes(jobId);
  const isJobApplied = (jobId) => appliedJobIds.includes(jobId);

  // Calculate skill matches for each job based on user profile skills
  const calculateSkillMatch = (jobSkills) => {
    if (!currentUser?.profileData?.skills || !jobSkills) return 0;
    const userSkills = currentUser.profileData.skills.map(s => s.toLowerCase());
    const matches = jobSkills.filter(s => userSkills.includes(s.toLowerCase()));
    return Math.round((matches.length / jobSkills.length) * 100);
  };

  // Enhance jobs with user-specific match percentage
  const processedJobs = jobs.map(job => {
    const calculatedMatch = isAuthenticated ? calculateSkillMatch(job.skills) : 0;
    return {
      ...job,
      matchScore: calculatedMatch
    };
  });

  // Parse salary string like "₹10.0L - ₹12.0L / year" to numeric Lakhs
  const parseSalaryLakhs = (salaryStr) => {
    if (!salaryStr || salaryStr === 'Undisclosed') return null;
    const nums = [...salaryStr.matchAll(/₹?(\d+\.?\d*)L/g)].map(m => parseFloat(m[1]));
    return nums.length > 0 ? nums : null;
  };

  // Parse formatted date back to approximate days ago
  const daysAgo = (postedAt) => {
    if (!postedAt) return null;
    const lower = postedAt.toLowerCase();
    if (lower === 'today' || lower === 'just now') return 0;
    if (lower === 'yesterday') return 1;
    const match = postedAt.match(/^(\w{3})\s+(\d{1,2})$/);
    if (match) {
      const months = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
      const month = months[match[1].toLowerCase()];
      const day = parseInt(match[2]);
      if (month !== undefined) {
        const then = new Date(new Date().getFullYear(), month, day);
        const now = new Date();
        return Math.floor((now - then) / (1000 * 60 * 60 * 24));
      }
    }
    return null;
  };

  // Filter jobs based on search query and filters
  const filteredJobs = processedJobs.filter(job => {
    // 1. Search Query Check (title, company, skills)
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Role Filter Check
    const matchesRole = filters.role === '' || 
      job.title.toLowerCase().includes(filters.role.toLowerCase());

    // 3. Location Filter Check
    const matchesLocation = filters.location === '' || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());

    // 4. Experience Filter Check
    const matchesExperience = filters.experience === '' || 
      job.experience.toLowerCase().includes(filters.experience.toLowerCase()) ||
      (filters.experience === 'Fresher' && job.experience === 'Fresher') ||
      (filters.experience === '1-3 years' && job.experience.includes('1-3')) ||
      (filters.experience === '3+ years' && (job.experience.includes('3+') || job.experience.includes('5+')));

    // 5. Employment Type Filter Check
    const matchesType = filters.employmentType === '' || 
      job.employmentType.toLowerCase() === filters.employmentType.toLowerCase();

    // 6. Skills Filter Check
    const matchesSkills = filters.skills.length === 0 || 
      filters.skills.every(skill => 
        job.skills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      );

    // 7. Company Filter Check
    const matchesCompany = filters.company === '' || 
      job.company.toLowerCase().includes(filters.company.toLowerCase());

    // 8. Salary Range Filter Check
    let matchesSalary = true;
    if (filters.salaryRange) {
      const parsed = parseSalaryLakhs(job.salary);
      if (parsed) {
        const avg = (parsed[0] + (parsed[1] || parsed[0])) / 2;
        switch (filters.salaryRange) {
          case 'below-3': matchesSalary = avg < 3; break;
          case '3-6': matchesSalary = avg >= 3 && avg <= 6; break;
          case '6-12': matchesSalary = avg > 6 && avg <= 12; break;
          case 'above-12': matchesSalary = avg > 12; break;
          default: matchesSalary = true;
        }
      } else {
        matchesSalary = false;
      }
    }

    // 9. Date Posted Filter Check
    let matchesDate = true;
    if (filters.datePosted) {
      const days = daysAgo(job.postedAt);
      if (days !== null) {
        switch (filters.datePosted) {
          case 'today': matchesDate = days <= 0; break;
          case 'week': matchesDate = days <= 7; break;
          case 'month': matchesDate = days <= 30; break;
          default: matchesDate = true;
        }
      }
    }

    // 10. Work Mode Filter Check
    const matchesWorkMode = filters.workMode === '' ||
      (filters.workMode.toLowerCase() === 'remote' && job.location.toLowerCase().includes('remote')) ||
      (filters.workMode.toLowerCase() === 'hybrid' && job.location.toLowerCase().includes('hybrid')) ||
      (filters.workMode.toLowerCase() === 'on-site' && !job.location.toLowerCase().includes('remote') && !job.location.toLowerCase().includes('hybrid'));

    return matchesSearch && matchesRole && matchesLocation && matchesExperience && matchesType && matchesSkills && matchesCompany && matchesSalary && matchesDate && matchesWorkMode;
  });

  // Sort the filtered jobs
  const sortedFilteredJobs = [...filteredJobs].sort((a, b) => {
    if (filters.sortBy === 'salary') {
      const parsedA = parseSalaryLakhs(a.salary);
      const parsedB = parseSalaryLakhs(b.salary);
      const avgA = parsedA ? (parsedA[0] + (parsedA[1] || parsedA[0])) / 2 : 0;
      const avgB = parsedB ? (parsedB[0] + (parsedB[1] || parsedB[0])) / 2 : 0;
      return avgB - avgA;
    }
    if (filters.sortBy === 'newest') {
      const daysA = daysAgo(a.postedAt) ?? 999;
      const daysB = daysAgo(b.postedAt) ?? 999;
      return daysA - daysB;
    }
    // Default 'relevance'
    return b.matchScore - a.matchScore;
  });

  // Recommended jobs: High skill match or matches preferred role/location
  const recommendedJobs = processedJobs
    .filter(job => {
      if (!isAuthenticated || !currentUser?.profileData) return false;
      const prefRole = currentUser.profileData.preferredRole?.toLowerCase();
      const prefLoc = currentUser.profileData.preferredLocation?.toLowerCase();
      
      const roleMatches = prefRole ? job.title.toLowerCase().includes(prefRole) : false;
      const locationMatches = prefLoc ? job.location.toLowerCase().includes(prefLoc) : false;
      const highSkillMatch = job.matchScore >= 50;

      return roleMatches || locationMatches || highSkillMatch;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const savedJobs = processedJobs.filter(job => savedJobIds.includes(job.id));
  const appliedJobs = processedJobs.filter(job => appliedJobIds.includes(job.id));

  const resetFilters = () => {
    setFilters({
      role: '',
      location: '',
      experience: '',
      employmentType: '',
      skills: [],
      company: '',
      salaryRange: '',
      datePosted: '',
      workMode: '',
      sortBy: 'relevance'
    });
    setSearchQuery('');
  };

  const value = {
    jobs: processedJobs,
    filteredJobs: sortedFilteredJobs,
    recommendedJobs,
    savedJobs,
    appliedJobs,
    appliedDetails,
    savedJobIds,
    appliedJobIds,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    saveJob,
    unsaveJob,
    applyToJob,
    isJobSaved,
    isJobApplied,
    resetFilters,
    refreshJobs: fetchJobs
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
