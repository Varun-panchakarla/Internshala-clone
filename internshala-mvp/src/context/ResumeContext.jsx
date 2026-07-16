import React, { createContext, useContext, useState, useEffect } from 'react';
import { resumeService } from '../services/mockApi';
import { useAuth } from './AuthContext';
import { calculateAtsScore } from '../utils/atsScorer';

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchResume = async () => {
    if (!isAuthenticated) {
      setResume(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await resumeService.getResume();
      setResume(res.data?.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, [isAuthenticated, currentUser?.id]);

  const updatePersonalInfo = (info) => {
    setResume(prev => {
      if (!prev) return null;
      return {
        ...prev,
        personalInfo: { ...prev.personalInfo, ...info }
      };
    });
  };

  const updateEducation = (education) => {
    setResume(prev => {
      if (!prev) return null;
      return { ...prev, education };
    });
  };

  const updateExperience = (experience) => {
    setResume(prev => {
      if (!prev) return null;
      return { ...prev, experience };
    });
  };

  const updateProjects = (projects) => {
    setResume(prev => {
      if (!prev) return null;
      return { ...prev, projects };
    });
  };

  const updateSkills = (skills) => {
    setResume(prev => {
      if (!prev) return null;
      return { ...prev, skills };
    });
  };

  const saveResume = async (customData = null) => {
    const dataToSave = customData || resume;
    if (!dataToSave) return;
    setSaving(true);
    try {
      const res = await resumeService.saveResume(dataToSave);
      setResume(res.data?.data || dataToSave);
      return res.data?.data;
    } catch (err) {
      console.error('Failed to save resume details', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };
// Calculate Resume Completion Percentage
const calculateResumeCompletion = (resume) => {
  if (!resume) return 0;

  let score = 0;

  // Personal Information (20%)
  const personal = resume.personalInfo || {};
  if (
    personal.fullName &&
    personal.email &&
    personal.phone &&
    personal.location
  ) {
    score += 20;
  }

  // Education (20%)
  if (
    resume.education?.length > 0 &&
    resume.education[0].institution &&
    resume.education[0].degree
  ) {
    score += 20;
  }

  // Experience (20%)
  if (
    resume.experience?.length > 0 &&
    resume.experience[0].role &&
    resume.experience[0].company
  ) {
    score += 20;
  }

  // Projects (15%)
  if (
    resume.projects?.length > 0 &&
    resume.projects[0].title
  ) {
    score += 15;
  }

  // Skills (15%)
  if (resume.skills?.length > 0) {
    score += 15;
  }

  // Professional Summary (10%)
  if (personal.summary && personal.summary.length > 30) {
    score += 10;
  }

  return score;
};

const resumeCompletion = calculateResumeCompletion(resume);
console.log("Resume Completion:", resumeCompletion);
  // Derive ATS score results
  const atsResults = calculateAtsScore(resume);

  const value = {
    resume,
    loading,
    saving,
    error,
    resumeCompletion,
    atsScore: atsResults.score,
    atsSuggestions: atsResults.suggestions,
    atsBreakdown: atsResults.breakdown,
    updatePersonalInfo,
    updateEducation,
    updateExperience,
    updateProjects,
    updateSkills,
    saveResume,
    refreshResume: fetchResume
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};
