import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Button from '../components/common/Button';
import { FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const CAREER_GOALS = [
  { id: 'online_degree', label: 'Get an online degree from a premium institute in India' },
  { id: 'study_abroad', label: 'Go for study abroad' },
  { id: 'bootcamp', label: 'Enroll in a job bootcamp (paid training to get a job)' },
  { id: 'gov_exams', label: 'Prepare for government exams' }
];

const OnboardingStep3 = () => {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // State Management
  const [lookingFor, setLookingFor] = useState([]);
  const [workModes, setWorkModes] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toggle Looking For Chips
  const handleToggleLookingFor = (option) => {
    if (lookingFor.includes(option)) {
      setLookingFor(prev => prev.filter(item => item !== option));
    } else {
      setLookingFor(prev => [...prev, option]);
    }
  };

  // Toggle Work Mode Chips
  const handleToggleWorkMode = (option) => {
    if (workModes.includes(option)) {
      setWorkModes(prev => prev.filter(item => item !== option));
    } else {
      setWorkModes(prev => [...prev, option]);
    }
  };

  // Toggle Career Goals Checkboxes
  const handleToggleGoal = (goalId) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(prev => prev.filter(id => id !== goalId));
    } else {
      setSelectedGoals(prev => [...prev, goalId]);
    }
  };

  // Onboarding Submit
  const handleFinish = async (e) => {
    e.preventDefault();

    if (lookingFor.length === 0) {
      addToast('Please select what you are currently looking for.', 'error');
      return;
    }
    if (workModes.length === 0) {
      addToast('Please select your preferred work mode.', 'error');
      return;
    }

    setLoading(true);
    try {
      const step1Key = currentUser?.id ? `onboarding_step1_${currentUser.id}` : 'onboarding_step1_guest';
      const step2Key = currentUser?.id ? `onboarding_step2_${currentUser.id}` : 'onboarding_step2_guest';

      const step1 = JSON.parse(localStorage.getItem(step1Key) || '{}');
      const step2 = JSON.parse(localStorage.getItem(step2Key) || '{}');

      const firstName = step1.firstName || (currentUser?.name ? currentUser.name.split(' ')[0] : '');
      const lastName = step1.lastName || (currentUser?.name && currentUser.name.split(' ').length > 1 ? currentUser.name.split(' ').slice(1).join(' ') : '');
      const fullName = `${firstName} ${lastName}`.trim() || currentUser?.name || '';
      const college = step1.collegeName || step1.schoolName || '';
      const degree = step1.course || step1.schoolStandard || '';
      const interests = step2.selectedInterests || [];
      const experience = step1.experienceYears === '0' || !step1.experienceYears ? 'Fresher' : (step1.experienceYears === '1' ? '1-3 years' : '3+ years');
      const preferredRole = (interests && interests[0]) || '';
      const preferredLocation = step1.currentCity || '';
      const employmentType = (lookingFor.includes('Internships') && !lookingFor.includes('Jobs')) ? 'Internship' : 'Full-time';

      const onboardingData = {
        firstName,
        lastName,
        email: currentUser?.email || '',
        contactNumber: step1.contactNumber || '',
        currentCity: step1.currentCity || '',
        gender: step1.gender || '',
        languages: step1.selectedLanguages || ['English'],
        currentStatus: step1.currentStatus || 'College Student',
        course: step1.course || '',
        collegeName: step1.collegeName || step1.schoolName || '',
        stream: step1.stream || '',
        startYear: step1.startYear || '',
        endYear: step1.endYear || '',
        experienceYears: step1.experienceYears || '0',
        interests: interests,
        lookingFor: lookingFor,
        workModes: workModes,
        careerGoals: selectedGoals.map(id => CAREER_GOALS.find(g => g.id === id)?.label || id),
        currentCompany: step1.currentCompany || '',
        currentJobTitle: step1.currentJobTitle || '',
        careerBreak: step1.careerBreak || '',
        schoolStandard: step1.schoolStandard || ''
      };

      const profilePayload = {
        fullName,
        college,
        degree,
        skills: interests,
        experience,
        preferredRole,
        preferredLocation,
        employmentType,
        resumeInfo: {
          ...(currentUser?.profileData?.resumeInfo || {}),
          onboardingData
        }
      };

      await updateProfile(profilePayload);

      const key = currentUser?.id ? `onboarding_completed_${currentUser.id}` : 'onboarding_completed_guest';
      localStorage.setItem(key, 'true');

      addToast('Welcome to your career portal! Onboarding complete.', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update profile from onboarding:', err);
      const key = currentUser?.id ? `onboarding_completed_${currentUser.id}` : 'onboarding_completed_guest';
      localStorage.setItem(key, 'true');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Button disabled state
  const isFormValid = lookingFor.length > 0 && workModes.length > 0;

  return (
    <div className="max-w-3xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
      {/* ── Progress Bar ── */}
      <div className="mb-10 w-full animate-fade-in">
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out" 
            style={{ width: '100%' }}
          />
        </div>
        <div className="flex justify-between items-center mt-2.5 text-xs text-slate-400 dark:text-slate-500 font-bold">
          <span>Step 3 of 3</span>
          <span>100% Complete</span>
        </div>
      </div>

      {/* ── Main Preferences Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl animate-slide-up">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
            Help us match you with the best career opportunities.
          </p>
        </div>

        <form onSubmit={handleFinish} className="flex flex-col gap-8">
          
          {/* Section: Currently Looking For */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Currently Looking For <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {['Internships', 'Jobs'].map(option => {
                const isSelected = lookingFor.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleToggleLookingFor(option)}
                    className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 hover:scale-[1.01] ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Work Mode */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
              Work Mode <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {['In-office', 'Work from home'].map(option => {
                const isSelected = workModes.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleToggleWorkMode(option)}
                    className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 hover:scale-[1.01] ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Current Career Goal */}
          <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
              Current Career Goal
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {CAREER_GOALS.map(goal => {
                const isChecked = selectedGoals.includes(goal.id);
                return (
                  <label
                    key={goal.id}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.005] cursor-pointer ${
                      isChecked
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/15'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-750'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleGoal(goal.id)}
                      className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-normal">
                      {goal.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
            <Button
              variant="outline"
              size="lg"
              className="py-3 rounded-2xl text-sm font-bold w-full sm:w-auto flex items-center justify-center gap-2"
              onClick={() => navigate('/onboarding/step2')}
              disabled={loading}
            >
              <FiArrowLeft className="shrink-0 w-4 h-4" /> Previous
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="py-3 rounded-2xl text-sm font-black tracking-wide w-full sm:w-auto flex items-center justify-center gap-2"
              disabled={!isFormValid}
              loading={loading}
            >
              Find Me Opportunities <FiArrowRight className="shrink-0 w-4 h-4" />
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default OnboardingStep3;
