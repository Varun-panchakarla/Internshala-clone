import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { calculateProfileCompletion, calculateTextAtsScore, calculateAtsScore } from '../utils/atsScorer';
import { extractTextFromPdf } from '../utils/pdfParser';
import {
  FiUser, FiBookOpen, FiBriefcase, FiCheck, FiCpu, FiAward,
  FiUpload, FiFileText, FiX, FiExternalLink, FiAlertTriangle,
  FiCamera, FiTrash2
} from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';

const Profile = () => {
  const { currentUser, updateProfile, profileCompletion } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const avatarFileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  // Check if user has a platform-built resume linked
  const builtResume = (currentUser?.profileData?.resumeInfo && currentUser.profileData.resumeInfo.source === 'builder')
    ? currentUser.profileData.resumeInfo
    : null;

  // Form State containing full onboarding integration
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    currentCity: '',
    gender: '',
    languages: 'English',
    currentStatus: 'College Student',
    course: '',
    college: '',
    stream: '',
    startYear: '',
    endYear: '',
    degree: '',
    skills: '',
    experience: 'Fresher',
    interests: '',
    lookingFor: '',
    workModes: '',
    preferredRole: '',
    preferredLocation: '',
    employmentType: 'Full-time',
    profilePhoto: '',
    resumeInfo: null
  });

  const [errors, setErrors] = useState({});

  // Reset photo error when profile photo URL changes
  useEffect(() => {
    setPhotoError(false);
  }, [currentUser?.profileData?.profilePhoto]);

  // Sync state with user profile data & onboarding data on load
  useEffect(() => {
    const ob = currentUser?.profileData?.resumeInfo?.onboardingData || {};
    const p = currentUser?.profileData || {};

    const initialFirstName = ob.firstName || (currentUser?.name ? currentUser.name.split(' ')[0] : '');
    const initialLastName = ob.lastName || (currentUser?.name && currentUser.name.split(' ').length > 1 ? currentUser.name.split(' ').slice(1).join(' ') : '');
    const computedFullName = p.fullName || (initialFirstName ? `${initialFirstName} ${initialLastName}`.trim() : currentUser?.name || '');

    setFormData({
      fullName: computedFullName,
      email: ob.email || currentUser?.email || '',
      contactNumber: ob.contactNumber || '',
      currentCity: ob.currentCity || p.preferredLocation || '',
      gender: ob.gender || '',
      languages: Array.isArray(ob.languages) ? ob.languages.join(', ') : (ob.languages || 'English'),
      currentStatus: ob.currentStatus || 'College Student',
      course: ob.course || p.degree || '',
      college: p.college || ob.collegeName || ob.schoolName || '',
      stream: ob.stream || '',
      startYear: ob.startYear || '',
      endYear: ob.endYear || '',
      degree: p.degree || ob.course || ob.schoolStandard || '',
      skills: p.skills ? p.skills.join(', ') : (Array.isArray(ob.interests) ? ob.interests.join(', ') : ''),
      experience: p.experience || (ob.experienceYears === '0' || !ob.experienceYears ? 'Fresher' : `${ob.experienceYears} years`) || 'Fresher',
      interests: Array.isArray(ob.interests) ? ob.interests.join(', ') : (p.skills ? p.skills.join(', ') : ''),
      lookingFor: Array.isArray(ob.lookingFor) ? ob.lookingFor.join(', ') : (ob.lookingFor || ''),
      workModes: Array.isArray(ob.workModes) ? ob.workModes.join(', ') : (ob.workModes || ''),
      preferredRole: p.preferredRole || (Array.isArray(ob.interests) ? ob.interests[0] : '') || '',
      preferredLocation: p.preferredLocation || ob.currentCity || '',
      employmentType: p.employmentType || (Array.isArray(ob.lookingFor) && ob.lookingFor.includes('Internships') ? 'Internship' : 'Full-time'),
      profilePhoto: p.profilePhoto || '',
      resumeInfo: p.resumeInfo || null
    });
  }, [currentUser]);

  // Derived dynamic completeness score based on active form state
  const currentSkillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const tempProfileData = {
    ...formData,
    skills: currentSkillsArray
  };
  const dynamicCompleteness = calculateProfileCompletion(tempProfileData);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required.';
    if (!formData.college.trim()) tempErrors.college = 'College/School name is required.';
    if (!formData.degree.trim() && !formData.course.trim()) tempErrors.degree = 'Degree/Course is required.';
    if (!formData.skills.trim()) tempErrors.skills = 'Please enter at least one skill or interest.';
    if (!formData.preferredRole.trim()) tempErrors.preferredRole = 'Preferred job role is required.';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const ob = currentUser?.profileData?.resumeInfo?.onboardingData || {};
      const updatedOnboardingData = {
        ...ob,
        contactNumber: formData.contactNumber,
        currentCity: formData.currentCity,
        gender: formData.gender,
        languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
        currentStatus: formData.currentStatus,
        course: formData.course || formData.degree,
        collegeName: formData.college,
        stream: formData.stream,
        startYear: formData.startYear,
        endYear: formData.endYear,
        lookingFor: formData.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
        workModes: formData.workModes.split(',').map(s => s.trim()).filter(Boolean)
      };

      const payload = {
        fullName: formData.fullName,
        college: formData.college,
        degree: formData.degree || formData.course,
        skills: skillsArray,
        experience: formData.experience,
        preferredRole: formData.preferredRole,
        preferredLocation: formData.preferredLocation || formData.currentCity,
        employmentType: formData.employmentType,
        profilePhoto: formData.profilePhoto,
        resumeInfo: {
          ...(currentUser?.profileData?.resumeInfo || {}),
          ...formData.resumeInfo,
          onboardingData: updatedOnboardingData
        }
      };

      await updateProfile(payload);
      addToast('Profile saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size must be under 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Photo = event.target.result;
      setFormData(prev => ({ ...prev, profilePhoto: base64Photo }));
      setPhotoError(false);

      try {
        const skillsArray = formData.skills
          ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        await updateProfile({
          fullName: formData.fullName,
          college: formData.college,
          degree: formData.degree || formData.course,
          skills: skillsArray,
          experience: formData.experience,
          preferredRole: formData.preferredRole,
          preferredLocation: formData.preferredLocation || formData.currentCity,
          employmentType: formData.employmentType,
          profilePhoto: base64Photo,
          resumeInfo: formData.resumeInfo
        });
        addToast('Profile picture updated successfully!', 'success');
      } catch (err) {
        console.error('Failed to save profile picture:', err);
        addToast('Failed to save profile picture.', 'error');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatarPhoto = async () => {
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
    setPhotoError(false);

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      await updateProfile({
        fullName: formData.fullName,
        college: formData.college,
        degree: formData.degree || formData.course,
        skills: skillsArray,
        experience: formData.experience,
        preferredRole: formData.preferredRole,
        preferredLocation: formData.preferredLocation || formData.currentCity,
        employmentType: formData.employmentType,
        profilePhoto: '',
        resumeInfo: formData.resumeInfo
      });
      addToast('Profile picture removed.', 'success');
    } catch (err) {
      console.error('Failed to remove profile picture:', err);
      addToast('Failed to remove profile picture.', 'error');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      addToast('Please upload a PDF or DOCX file.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be under 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      let atsResult = null;

      if (file.type === 'application/pdf') {
        const text = await extractTextFromPdf(base64Data);
        if (text) {
          const profileSkills = formData.skills
            ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
            : [];
          atsResult = calculateTextAtsScore(text, profileSkills);
        }
      } else {
        addToast('ATS analysis supports PDF files. DOCX uploaded but cannot be analyzed.', 'warning');
      }

      const updatedResumeInfo = {
        ...(formData.resumeInfo || {}),
        source: 'upload',
        fileName: file.name,
        fileData: base64Data,
        fileType: file.type,
        atsScore: atsResult?.score ?? null,
        atsSuggestions: atsResult?.suggestions ?? []
      };

      setFormData(prev => ({
        ...prev,
        resumeInfo: updatedResumeInfo
      }));

      // Automatically persist uploaded resume to backend database
      try {
        const skillsArray = formData.skills
          ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        await updateProfile({
          fullName: formData.fullName,
          college: formData.college,
          degree: formData.degree || formData.course,
          skills: skillsArray,
          experience: formData.experience,
          preferredRole: formData.preferredRole,
          preferredLocation: formData.preferredLocation || formData.currentCity,
          employmentType: formData.employmentType,
          profilePhoto: formData.profilePhoto,
          resumeInfo: updatedResumeInfo
        });
      } catch (err) {
        console.error('Failed to auto-save uploaded resume:', err);
      }

      if (atsResult) {
        addToast(`Uploaded ${file.name}. ATS Score: ${atsResult.score}/100`, atsResult.score >= 70 ? 'success' : 'warning');
      } else {
        addToast(`Uploaded ${file.name} successfully!`, 'success');
      }
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleUseBuilderResume = async () => {
    const builderScore = builtResume ? calculateAtsScore(builtResume) : null;
    const updatedResumeInfo = {
      ...(formData.resumeInfo || {}),
      source: 'builder',
      fileName: 'IncuXAI Resume Builder',
      builderId: currentUser?.id,
      atsScore: builderScore?.score ?? null,
      atsSuggestions: builderScore?.suggestions ?? []
    };

    setFormData(prev => ({
      ...prev,
      resumeInfo: updatedResumeInfo
    }));

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      await updateProfile({
        fullName: formData.fullName,
        college: formData.college,
        degree: formData.degree || formData.course,
        skills: skillsArray,
        experience: formData.experience,
        preferredRole: formData.preferredRole,
        preferredLocation: formData.preferredLocation || formData.currentCity,
        employmentType: formData.employmentType,
        profilePhoto: formData.profilePhoto,
        resumeInfo: updatedResumeInfo
      });
    } catch (err) {
      console.error('Failed to auto-save linked resume:', err);
    }

    addToast(builderScore ? `Platform resume linked. ATS Score: ${builderScore.score}/100` : 'Platform resume linked to your profile.', 'success');
  };

  const handleRemoveResume = async () => {
    const ob = currentUser?.profileData?.resumeInfo?.onboardingData || null;
    const updatedResumeInfo = ob ? { onboardingData: ob } : null;

    setFormData(prev => ({
      ...prev,
      resumeInfo: updatedResumeInfo
    }));

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        fullName: formData.fullName,
        college: formData.college,
        degree: formData.degree || formData.course,
        skills: skillsArray,
        experience: formData.experience,
        preferredRole: formData.preferredRole,
        preferredLocation: formData.preferredLocation || formData.currentCity,
        employmentType: formData.employmentType,
        profilePhoto: formData.profilePhoto,
        resumeInfo: updatedResumeInfo
      };

      await updateProfile(payload);
      addToast('Resume removed successfully.', 'success');
    } catch (err) {
      console.error('Failed to remove resume:', err);
      addToast('Failed to remove resume. Please try again.', 'error');
    }
  };

  const experienceOptions = ['Fresher', '1-3 years', '3+ years', '5+ years'];
  const employmentTypeOptions = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const statusOptions = ['College Student', 'Fresher', 'Working Professional', 'School Student', 'Women Returning to Work'];

  const hasUploadedResume = !!(formData.resumeInfo && (formData.resumeInfo.fileName || formData.resumeInfo.source));

  // Default initial from user's first name
  const userInitial = (formData.fullName || currentUser?.name || '').trim().charAt(0).toUpperCase() || 'U';

  // Wizard / Setup Screen (for incomplete profiles)
  if (!currentUser?.profileCompleted) {
    return (
      <div className="max-w-3xl mx-auto animate-slide-up w-full">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden mb-8">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
            <h1 className="text-2xl font-black mb-1">Set Up Your Profile</h1>
            <p className="text-sm text-white/80 font-medium">Complete these details to unlock personalized job recommendations and activate your resume score.</p>
          </div>

          <div className="p-6 md:p-8">
            {/* Progress Meter */}
            <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Profile Completeness Progress</span>
                <span className="text-brand-600">{dynamicCompleteness}%</span>
              </div>
              <ProgressBar value={dynamicCompleteness} showPercentage={false} size="md" />
              <p className="text-[11px] text-slate-400 font-medium">Tip: Completing college details, skills, and uploading a resume adds 15% each.</p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                1. Personal Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  id="fullName"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={errors.fullName}
                  required
                />

                <Input
                  label="Contact Number"
                  id="contactNumber"
                  placeholder="e.g. +91 9876543210"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Current City"
                  id="currentCity"
                  placeholder="e.g. Bangalore, Delhi"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange('currentCity', e.target.value)}
                />

                <Input
                  label="Gender"
                  id="gender"
                  placeholder="e.g. Female, Male"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                />

                <Input
                  label="Languages Spoken"
                  id="languages"
                  placeholder="e.g. English, Hindi, Tamil"
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                />
              </div>

              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mt-4">
                2. Academic Background
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="College / School Name"
                  id="college"
                  placeholder="e.g. Stanford University"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  error={errors.college}
                  required
                />

                <Input
                  label="Course / Degree"
                  id="degree"
                  placeholder="e.g. B.Tech, B.S. in Computer Science"
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  error={errors.degree}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Stream / Major"
                  id="stream"
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.stream}
                  onChange={(e) => handleInputChange('stream', e.target.value)}
                />

                <Input
                  label="Start Year"
                  id="startYear"
                  placeholder="e.g. 2021"
                  value={formData.startYear}
                  onChange={(e) => handleInputChange('startYear', e.target.value)}
                />

                <Input
                  label="End Year"
                  id="endYear"
                  placeholder="e.g. 2025"
                  value={formData.endYear}
                  onChange={(e) => handleInputChange('endYear', e.target.value)}
                />
              </div>

              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mt-4">
                3. Skills & Experience
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Skills & Areas of Interest (Comma-separated)"
                  id="skills"
                  placeholder="e.g. React, JavaScript, Web Development, UI/UX Design"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  error={errors.skills}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Experience Level"
                  id="experience"
                  type="select"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  options={experienceOptions}
                />

                <Input
                  label="Current Status"
                  id="currentStatus"
                  type="select"
                  value={formData.currentStatus}
                  onChange={(e) => handleInputChange('currentStatus', e.target.value)}
                  options={statusOptions}
                />
              </div>

              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mt-4">
                4. Job Preferences
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Preferred Role"
                  id="preferredRole"
                  placeholder="e.g. Frontend Developer"
                  value={formData.preferredRole}
                  onChange={(e) => handleInputChange('preferredRole', e.target.value)}
                  error={errors.preferredRole}
                  required
                />

                <Input
                  label="Looking For"
                  id="lookingFor"
                  placeholder="e.g. Jobs, Internships"
                  value={formData.lookingFor}
                  onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                />

                <Input
                  label="Preferred Work Mode"
                  id="workModes"
                  placeholder="e.g. Remote, In-office, Hybrid"
                  value={formData.workModes}
                  onChange={(e) => handleInputChange('workModes', e.target.value)}
                />
              </div>

              <div className="border-t border-slate-100 pt-6 mt-6 flex justify-end">
                <Button type="submit" variant="primary" className="px-10 py-3 text-sm shadow-md" loading={loading}>
                  Save & Complete Profile
                </Button>
              </div>

            </form>
          </div>
        </div>
      </div>
    );
  }

  // Profile Editor Tabbed Screen (completed profiles)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full animate-slide-up">
      
      {/* Left Column: Completeness Overview Widget */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Profile Card Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-md flex flex-col items-center text-center">
          
          {/* Avatar with Upload/Change Overlay Badge */}
          <div className="relative mb-3 group">
            {formData.profilePhoto && !photoError ? (
              <img
                src={formData.profilePhoto}
                alt={currentUser.name}
                onError={() => setPhotoError(true)}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg ring-2 ring-slate-100 dark:ring-slate-700 cursor-pointer"
                onClick={() => avatarFileInputRef.current?.click()}
              />
            ) : (
              <div
                onClick={() => avatarFileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-extrabold text-3xl shadow-inner border border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-105"
                title="Click to upload profile picture"
              >
                {userInitial}
              </div>
            )}

            {/* Small Camera / Edit Badge */}
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              title={formData.profilePhoto && !photoError ? "Change Profile Picture" : "Upload Profile Picture"}
              className="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-full shadow-md border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 cursor-pointer"
            >
              <FiCamera className="w-3.5 h-3.5" />
            </button>

            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Remove Profile Picture Action */}
          {formData.profilePhoto && !photoError && (
            <button
              type="button"
              onClick={handleRemoveAvatarPhoto}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline mb-2 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <FiTrash2 className="w-3 h-3" /> Remove Profile Picture
            </button>
          )}

          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 mt-1">{formData.fullName || currentUser.name}</h2>
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-2">{formData.preferredRole || 'Candidate'}</p>
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full mb-6">
            📍 {formData.currentCity || formData.preferredLocation || 'Location flexible'}
          </span>

          <div className="w-full text-left bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Profile Completed</span>
              <span className="text-brand-600 dark:text-brand-400">{profileCompletion}%</span>
            </div>
            <ProgressBar value={profileCompletion} showPercentage={false} size="sm" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
              Your profile is fully verified. Recruiters can search and view your matches.
            </p>
          </div>
        </div>

        {/* Dynamic skills preview box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-md">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
            <FiCpu className="text-slate-400" /> Active Keywords & Interests
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {formData.skills ? (
              formData.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill) => (
                <span key={skill} className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-400 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No active skills set</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Tabbed Profile Form */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FiUser /> Personal & Preferences
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'academic'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FiBookOpen /> Academic & Experience
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'skills'
                ? 'border-brand-600 text-brand-700 dark:text-brand-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FiAward /> Skills & Resume
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
            {/* 1. Personal & Preferences Tab */}
            {activeTab === 'personal' && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={errors.fullName}
                    required
                  />

                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Contact Number"
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  />

                  <Input
                    label="Current City"
                    id="currentCity"
                    value={formData.currentCity}
                    onChange={(e) => handleInputChange('currentCity', e.target.value)}
                  />

                  <Input
                    label="Gender"
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Languages Spoken"
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => handleInputChange('languages', e.target.value)}
                  />

                  <Input
                    label="Preferred Role"
                    id="preferredRole"
                    value={formData.preferredRole}
                    onChange={(e) => handleInputChange('preferredRole', e.target.value)}
                    error={errors.preferredRole}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Preferred Location"
                    id="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
                  />

                  <Input
                    label="Looking For"
                    id="lookingFor"
                    placeholder="e.g. Jobs, Internships"
                    value={formData.lookingFor}
                    onChange={(e) => handleInputChange('lookingFor', e.target.value)}
                  />

                  <Input
                    label="Preferred Work Mode"
                    id="workModes"
                    placeholder="e.g. Remote, In-office, Hybrid"
                    value={formData.workModes}
                    onChange={(e) => handleInputChange('workModes', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* 2. Academic & Experience Tab */}
            {activeTab === 'academic' && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="College / School Name"
                    id="college"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    error={errors.college}
                    required
                  />
                  <Input
                    label="Course / Degree"
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    error={errors.degree}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Stream / Major"
                    id="stream"
                    value={formData.stream}
                    onChange={(e) => handleInputChange('stream', e.target.value)}
                  />

                  <Input
                    label="Start Year"
                    id="startYear"
                    value={formData.startYear}
                    onChange={(e) => handleInputChange('startYear', e.target.value)}
                  />

                  <Input
                    label="End Year"
                    id="endYear"
                    value={formData.endYear}
                    onChange={(e) => handleInputChange('endYear', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Experience Level"
                    id="experience"
                    type="select"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    options={experienceOptions}
                  />

                  <Input
                    label="Current Status"
                    id="currentStatus"
                    type="select"
                    value={formData.currentStatus}
                    onChange={(e) => handleInputChange('currentStatus', e.target.value)}
                    options={statusOptions}
                  />
                </div>
              </div>
            )}

            {/* 3. Skills & Resume Tab */}
            {activeTab === 'skills' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <Input
                  label="Skills & Areas of Interest (Comma-separated)"
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  error={errors.skills}
                  required
                />
                <span className="text-[10px] -mt-2 text-slate-400 font-medium">Type your skills separated by commas (e.g. React, Web Development, Python).</span>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Resume</span>

                  {hasUploadedResume ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl px-3 py-2.5 max-w-sm">
                        <FiFileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex-1 truncate">
                          {formData.resumeInfo.fileName}
                        </span>
                        {formData.resumeInfo.source === 'builder' && (
                          <Link to="/resume" className="text-emerald-600 hover:text-emerald-700">
                            <FiExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button type="button" onClick={handleRemoveResume} className="text-emerald-400 hover:text-rose-500 cursor-pointer">
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {formData.resumeInfo.atsScore !== null && formData.resumeInfo.atsScore !== undefined && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            formData.resumeInfo.atsScore >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            ATS Score: {formData.resumeInfo.atsScore}/100
                          </span>
                          {formData.resumeInfo.atsScore < 70 && (
                            <Link to="/resume" className="text-xs font-bold text-brand-600 hover:text-brand-700 underline flex items-center gap-1">
                              <FiAlertTriangle className="w-3 h-3" /> Improve with Resume Builder
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button type="button" variant="outline" className="flex items-center gap-2 py-2 border-dashed" onClick={() => fileInputRef.current?.click()}>
                          <FiUpload className="w-4 h-4" /> Upload Resume
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        {builtResume && (
                          <Button type="button" variant="outline" className="flex items-center gap-2 py-2" onClick={handleUseBuilderResume}>
                            <FiFileText className="w-4 h-4" /> Use Resume from Builder
                          </Button>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 italic">Upload a PDF/DOCX or use your platform-built resume.</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                Completeness: <b className="text-slate-600 dark:text-slate-300">{dynamicCompleteness}%</b>
              </span>
              <Button type="submit" variant="primary" className="px-8" loading={loading}>
                Save Changes
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
