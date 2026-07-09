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
      setResume(res.data);
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
      setResume(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to save resume details', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Derive ATS score results
  const atsResults = calculateAtsScore(resume);

  const value = {
    resume,
    loading,
    saving,
    error,
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
