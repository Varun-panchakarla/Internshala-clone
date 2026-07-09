import React, { createContext, useContext, useState, useEffect } from 'react';
import { jobService } from '../services/mockApi';
import { useAuth } from './AuthContext';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    location: '',
    experience: '',
    employmentType: '',
    skills: []
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getAllJobs();
      setJobs(res.data);

      if (isAuthenticated) {
        const savedRes = await jobService.getSavedJobIds();
        setSavedJobIds(savedRes.data);

        const appliedRes = await jobService.getAppliedJobIds();
        setAppliedJobIds(appliedRes.data);
      } else {
        setSavedJobIds([]);
        setAppliedJobIds([]);
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
      (filters.location.toLowerCase() === 'remote' && job.location.toLowerCase().includes('remote')) ||
      (filters.location.toLowerCase() !== 'remote' && !job.location.toLowerCase().includes('remote') && job.location.toLowerCase().includes(filters.location.toLowerCase()));

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

    return matchesSearch && matchesRole && matchesLocation && matchesExperience && matchesType && matchesSkills;
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
      skills: []
    });
    setSearchQuery('');
  };

  const value = {
    jobs: processedJobs,
    filteredJobs,
    recommendedJobs,
    savedJobs,
    appliedJobs,
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
