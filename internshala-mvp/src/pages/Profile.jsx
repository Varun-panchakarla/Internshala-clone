import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { calculateProfileCompletion, calculateTextAtsScore, calculateAtsScore } from '../utils/atsScorer';
import { extractTextFromPdf } from '../utils/pdfParser';
import {
  FiUser, FiBookOpen, FiBriefcase, FiCheck, FiCpu, FiAward,
  FiUpload, FiFileText, FiX, FiExternalLink, FiAlertTriangle
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

  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  // Check if user has a resume in the Resume Builder
  const builtResume = currentUser?.profileData?.resumeInfo || null;

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    profilePhoto: '',
    college: '',
    degree: '',
    skills: '',
    experience: '',
    preferredRole: '',
    preferredLocation: '',
    employmentType: '',
    resumeInfo: null // { source: 'upload'|'builder', fileName, fileData?, fileType? }
  });

  const [errors, setErrors] = useState({});

  // Reset photo error when profile photo URL changes
  useEffect(() => {
    setPhotoError(false);
  }, [currentUser?.profileData?.profilePhoto]);

  // Sync state with user profile data on load
  useEffect(() => {
    if (currentUser?.profileData) {
      setFormData({
        fullName: currentUser.profileData.fullName || '',
        profilePhoto: currentUser.profileData.profilePhoto || '',
        college: currentUser.profileData.college || '',
        degree: currentUser.profileData.degree || '',
        skills: currentUser.profileData.skills ? currentUser.profileData.skills.join(', ') : '',
        experience: currentUser.profileData.experience || '',
        preferredRole: currentUser.profileData.preferredRole || '',
        preferredLocation: currentUser.profileData.preferredLocation || '',
        employmentType: currentUser.profileData.employmentType || '',
        resumeInfo: currentUser.profileData.resumeInfo || null
      });
    } else {
      setFormData({
        fullName: currentUser?.name || '',
        profilePhoto: '',
        college: '',
        degree: '',
        skills: '',
        experience: 'Fresher',
        preferredRole: '',
        preferredLocation: '',
        employmentType: 'Full-time',
        resumeInfo: null
      });
    }
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
    if (!formData.college.trim()) tempErrors.college = 'College name is required.';
    if (!formData.degree.trim()) tempErrors.degree = 'Degree name is required.';
    if (!formData.skills.trim()) tempErrors.skills = 'Please enter at least one skill.';
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

      const payload = {
        ...formData,
        skills: skillsArray
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
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be under 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, profilePhoto: event.target.result }));
      setPhotoError(false);
    };
    reader.readAsDataURL(file);
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

      setFormData(prev => ({
        ...prev,
        resumeInfo: {
          source: 'upload',
          fileName: file.name,
          fileData: base64Data,
          fileType: file.type,
          atsScore: atsResult?.score ?? null,
          atsSuggestions: atsResult?.suggestions ?? []
        }
      }));

      if (atsResult) {
        addToast(`Uploaded ${file.name}. ATS Score: ${atsResult.score}/100`, atsResult.score >= 70 ? 'success' : 'warning');
      } else {
        addToast(`Uploaded ${file.name} successfully!`, 'success');
      }
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleUseBuilderResume = () => {
    const builderScore = builtResume ? calculateAtsScore(builtResume) : null;
    setFormData(prev => ({
      ...prev,
      resumeInfo: {
        source: 'builder',
        fileName: 'IncuXAI Resume Builder',
        builderId: currentUser?.id,
        atsScore: builderScore?.score ?? null,
        atsSuggestions: builderScore?.suggestions ?? []
      }
    }));
    addToast(builderScore ? `Platform resume linked. ATS Score: ${builderScore.score}/100` : 'Platform resume linked to your profile.', 'success');
  };

  const handleRemoveResume = () => {
    setFormData(prev => ({ ...prev, resumeInfo: null }));
  };

  const experienceOptions = ['Fresher', '1-3 years', '3+ years', '5+ years'];
  const employmentTypeOptions = ['Full-time', 'Part-time', 'Internship', 'Contract'];

  // Wizard / Setup Screen
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
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Photo</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      {formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {formData.profilePhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, profilePhoto: '' }));
                          setPhotoError(false);
                        }}
                        className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mt-4">
                2. Academic Background
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="College / University"
                  id="college"
                  placeholder="e.g. Stanford University"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  error={errors.college}
                  required
                />

                <Input
                  label="Degree / Major"
                  id="degree"
                  placeholder="e.g. B.S. in Computer Science"
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  error={errors.degree}
                  required
                />
              </div>

              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 mt-4">
                3. Skills & Experience
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Skills (Comma-separated)"
                  id="skills"
                  placeholder="e.g. React, JavaScript, Node.js, Python, CSS"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  error={errors.skills}
                  required
                />
                <span className="text-[10px] text-slate-400 -mt-2">Type your skills separated by commas to associate them with job listings.</span>
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

                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-xs font-semibold text-slate-600">Resume</span>

                  {formData.resumeInfo ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 max-w-sm">
                        <FiFileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-800 flex-1 truncate">
                          {formData.resumeInfo.fileName}
                        </span>
                        {formData.resumeInfo.source === 'builder' && (
                          <Link to="/resume" className="text-emerald-600 hover:text-emerald-700">
                            <FiExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button type="button" onClick={handleRemoveResume} className="text-emerald-400 hover:text-rose-500">
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {formData.resumeInfo.atsScore !== null && formData.resumeInfo.atsScore !== undefined && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            formData.resumeInfo.atsScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
                        <Button type="button" variant="outline" className="shrink-0 flex items-center gap-2 py-2.5 border-dashed" onClick={() => fileInputRef.current?.click()}>
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
                          <Button type="button" variant="outline" className="shrink-0 flex items-center gap-2 py-2.5" onClick={handleUseBuilderResume}>
                            <FiFileText className="w-4 h-4" /> Use Resume from Builder
                          </Button>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 italic">Upload a PDF/DOCX or use your platform-built resume.</span>
                    </>
                  )}
                </div>
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
                  label="Preferred Location"
                  id="preferredLocation"
                  placeholder="e.g. Remote, Bangalore, Delhi"
                  value={formData.preferredLocation}
                  onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
                />

                <Input
                  label="Employment Type"
                  id="employmentType"
                  type="select"
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  options={employmentTypeOptions}
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
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md flex flex-col items-center text-center">
          <div className="relative mb-4">
            {formData.profilePhoto && !photoError ? (
              <img
                src={formData.profilePhoto}
                alt={currentUser.name}
                onError={() => setPhotoError(true)}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-3xl shadow-inner border border-slate-200">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight mb-1">{currentUser.profileData?.fullName || currentUser.name}</h2>
          <p className="text-sm font-semibold text-brand-600 mb-2">{currentUser.profileData?.preferredRole || 'Candidate'}</p>
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full mb-6">
            📍 {currentUser.profileData?.preferredLocation || 'Location flexible'}
          </span>

          <div className="w-full text-left bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Profile Completed</span>
              <span className="text-brand-600">{profileCompletion}%</span>
            </div>
            <ProgressBar value={profileCompletion} showPercentage={false} size="sm" />
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Your profile is fully verified. Recruiters can search and view your matches.
            </p>
          </div>
        </div>

        {/* Dynamic skills preview box */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <FiCpu className="text-slate-400" /> Active Keywords
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {currentUser.profileData?.skills?.map((skill) => (
              <span key={skill} className="bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Tabbed Profile Form */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'personal'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiUser /> Personal & Preferences
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'academic'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiBookOpen /> Academic Info
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'skills'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FiAward /> Skills & Resume
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 md:p-8">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            
            {activeTab === 'personal' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    error={errors.fullName}
                    required
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile Photo</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors cursor-pointer"
                      >
                        {formData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      {formData.profilePhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, profilePhoto: '' }));
                            setPhotoError(false);
                          }}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Preferred Role"
                    id="preferredRole"
                    value={formData.preferredRole}
                    onChange={(e) => handleInputChange('preferredRole', e.target.value)}
                    error={errors.preferredRole}
                    required
                  />
                  <Input
                    label="Preferred Location"
                    id="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={(e) => handleInputChange('preferredLocation', e.target.value)}
                  />
                  <Input
                    label="Employment Type"
                    id="employmentType"
                    type="select"
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    options={employmentTypeOptions}
                  />
                </div>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="College / University"
                    id="college"
                    value={formData.college}
                    onChange={(e) => handleInputChange('college', e.target.value)}
                    error={errors.college}
                    required
                  />
                  <Input
                    label="Degree / Major"
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => handleInputChange('degree', e.target.value)}
                    error={errors.degree}
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
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <Input
                  label="Skills (Comma-separated)"
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  error={errors.skills}
                  required
                />
                <span className="text-[10px] -mt-2 text-slate-400 font-medium">Type your skills separated by commas (e.g. React, CSS, Node.js).</span>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-xs font-semibold text-slate-600">Resume</span>

                  {formData.resumeInfo ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 max-w-sm">
                        <FiFileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-semibold text-emerald-800 flex-1 truncate">
                          {formData.resumeInfo.fileName}
                        </span>
                        {formData.resumeInfo.source === 'builder' && (
                          <Link to="/resume" className="text-emerald-600 hover:text-emerald-700">
                            <FiExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button type="button" onClick={handleRemoveResume} className="text-emerald-400 hover:text-rose-500">
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {formData.resumeInfo.atsScore !== null && formData.resumeInfo.atsScore !== undefined && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            formData.resumeInfo.atsScore >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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

            <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                Completeness: <b className="text-slate-600">{dynamicCompleteness}%</b>
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
