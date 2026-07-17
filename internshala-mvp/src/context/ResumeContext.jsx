import React, { createContext, useContext, useState, useEffect } from 'react';
import { resumeService } from '../services/mockApi';
import { useAuth } from './AuthContext';
import { calculateAtsScore, calculateResumeCompletion } from '../utils/atsScorer';

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [resume, setResume]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const [selectedTemplate, setSelectedTemplateState] = useState(
    () => localStorage.getItem('jobportal_selected_template') || 'professional'
  );

  const setSelectedTemplate = (templateId) => {
    setSelectedTemplateState(templateId);
    localStorage.setItem('jobportal_selected_template', templateId);
  };

  const fetchResume = async () => {
    if (!isAuthenticated) { setResume(null); setLoading(false); return; }
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

  useEffect(() => { fetchResume(); }, [isAuthenticated, currentUser?.id]);

  const updatePersonalInfo = (info) =>
    setResume(prev => prev ? { ...prev, personalInfo: { ...prev.personalInfo, ...info } } : null);

  const updateEducation      = (v) => setResume(p => p ? { ...p, education: v }      : null);
  const updateExperience     = (v) => setResume(p => p ? { ...p, experience: v }     : null);
  const updateInternship     = (v) => setResume(p => p ? { ...p, internship: v }     : null);
  const updateProjects       = (v) => setResume(p => p ? { ...p, projects: v }       : null);
  const updateCertifications = (v) => setResume(p => p ? { ...p, certifications: v } : null);
  const updateSkills         = (v) => setResume(p => p ? { ...p, skills: v }         : null);

  const saveResume = async (customData = null) => {
    const dataToSave = customData || resume;
    if (!dataToSave) return;
    setSaving(true);
    try {
      const res = await resumeService.saveResume(dataToSave);
      setResume(res.data?.data || dataToSave);
      return res.data?.data;
    } catch (err) {
      console.error('Failed to save resume', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const resumeCompletion = calculateResumeCompletion(resume);
  const atsResults       = calculateAtsScore(resume);

  const value = {
    resume,
    loading,
    saving,
    error,
    resumeCompletion,
    atsScore:       atsResults.score,
    atsSuggestions: atsResults.suggestions,
    atsBreakdown:   atsResults.breakdown,
    selectedTemplate,
    setSelectedTemplate,
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
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within a ResumeProvider');
  return ctx;
};