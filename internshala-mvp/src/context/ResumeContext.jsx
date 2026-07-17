import React, { createContext, useContext, useState, useEffect } from 'react';
import { resumeService } from '../services/mockApi';
import { useAuth } from './AuthContext';
import { calculateAtsScore, calculateResumeCompletion } from '../utils/atsScorer';

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

  // ─── Update Handlers ────────────────────────────────────────────────────────

  const updatePersonalInfo = (info) => {
    setResume(prev => {
      if (!prev) return null;
      return { ...prev, personalInfo: { ...prev.personalInfo, ...info } };
    });
  };

  const updateEducation = (education) => {
    setResume(prev => (prev ? { ...prev, education } : null));
  };

  const updateExperience = (experience) => {
    setResume(prev => (prev ? { ...prev, experience } : null));
  };

  const updateInternship = (internship) => {
    setResume(prev => (prev ? { ...prev, internship } : null));
  };

  const updateProjects = (projects) => {
    setResume(prev => (prev ? { ...prev, projects } : null));
  };

  const updateCertifications = (certifications) => {
    setResume(prev => (prev ? { ...prev, certifications } : null));
  };

  const updateSkills = (skills) => {
    setResume(prev => (prev ? { ...prev, skills } : null));
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

  // ─── Derived Values ─────────────────────────────────────────────────────────

  // Profile Completion — separate from ATS Score
  const resumeCompletion = calculateResumeCompletion(resume);

  // ATS Score — evaluates content quality for ATS parsers
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
    updateInternship,
    updateProjects,
    updateCertifications,
    updateSkills,
    saveResume,
    refreshResume: fetchResume,
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
