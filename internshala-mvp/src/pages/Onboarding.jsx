import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { FiArrowRight, FiCheck, FiPlus, FiX, FiCheckCircle, FiClock } from 'react-icons/fi';
import { authService } from '../services/mockApi';

const Onboarding = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Onboarding Page Loading State
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [gender, setGender] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState(['English']);
  const [customLanguage, setCustomLanguage] = useState('');
  const [showAddLanguageInput, setShowAddLanguageInput] = useState(false);

  const [availableLanguages, setAvailableLanguages] = useState([
    'English', 'Hindi', 'Telugu', 'Tamil', 'Marathi', 'French', 'Japanese'
  ]);

  // Current Status selection
  const [currentStatus, setCurrentStatus] = useState('College Student');

  // Education/Professional Fields State
  const [course, setCourse] = useState('B.Tech');
  const [customCourse, setCustomCourse] = useState('');
  const [customCourseActive, setCustomCourseActive] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [stream, setStream] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  // Experience level for Fresher/Professional/Return-to-work
  const [experienceYears, setExperienceYears] = useState('0');

  // Professional details
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentJobTitle, setCurrentJobTitle] = useState('');

  // Return to work details
  const [careerBreak, setCareerBreak] = useState('6 Months');

  // School Student details
  const [schoolStandard, setSchoolStandard] = useState('Class XII');
  const [schoolName, setSchoolName] = useState('');

  // Inline Validation Errors State
  const [errors, setErrors] = useState({});

  // Phone Verification States
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifiedNumber, setVerifiedNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Years generation lists
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 25 }, (_, i) => String(currentYear - 10 + i));

  // Populate saved step 1 data or fallback to currentUser.name
  useEffect(() => {
    const dataKey = currentUser?.id ? `onboarding_step1_${currentUser.id}` : 'onboarding_step1_guest';
    const saved = localStorage.getItem(dataKey);
    let loadedContactNumber = '';
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.firstName) setFirstName(d.firstName);
        if (d.lastName) setLastName(d.lastName);
        if (d.contactNumber) {
          setContactNumber(d.contactNumber);
          loadedContactNumber = d.contactNumber;
        }
        if (d.currentCity) setCurrentCity(d.currentCity);
        if (d.gender) setGender(d.gender);
        if (Array.isArray(d.selectedLanguages)) setSelectedLanguages(d.selectedLanguages);
        if (d.currentStatus) setCurrentStatus(d.currentStatus);
        if (d.course) setCourse(d.course);
        if (d.collegeName) setCollegeName(d.collegeName);
        if (d.stream) setStream(d.stream);
        if (d.startYear) setStartYear(d.startYear);
        if (d.endYear) setEndYear(d.endYear);
        if (d.experienceYears) setExperienceYears(d.experienceYears);
      } catch (e) {
        console.error('Failed to parse saved step 1 data', e);
      }
    } else if (currentUser?.name) {
      const parts = currentUser.name.trim().split(/\s+/);
      if (parts.length > 0) {
        setFirstName(parts[0]);
        if (parts.length > 1) {
          setLastName(parts.slice(1).join(' '));
        }
      }
    }

    if (currentUser?.profileData) {
      const isVerified = currentUser.profileData.phoneVerified === true;
      const dbContact = currentUser.profileData.contactNumber || '';
      
      if (loadedContactNumber) {
        if (isVerified && loadedContactNumber === dbContact) {
          setPhoneVerified(true);
          setVerifiedNumber(dbContact);
        } else {
          setPhoneVerified(false);
        }
      } else {
        setPhoneVerified(isVerified);
        if (isVerified) {
          setVerifiedNumber(dbContact);
          setContactNumber(dbContact);
        }
      }
    }
  }, [currentUser]);

  // Handle phoneTimer countdown
  useEffect(() => {
    if (phoneTimer <= 0) return;
    const interval = setInterval(() => {
      setPhoneTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneTimer]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChangePhoneClick = () => {
    setPhoneVerified(false);
    setOtpSent(false);
    setPhoneOtp('');
    setOtpError('');
  };

  const handlePhoneChange = (val) => {
    setContactNumber(val);
    if (val !== verifiedNumber) {
      setPhoneVerified(false);
      setOtpSent(false);
    } else {
      setPhoneVerified(true);
    }
  };

  const handleSendPhoneOtp = async () => {
    const cleanPhone = contactNumber.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d{8,15}$/.test(cleanPhone)) {
      addToast('Please enter a valid phone number (minimum 8 digits).', 'error');
      return;
    }

    setSendingPhoneOtp(true);
    setOtpError('');
    try {
      await authService.sendPhoneOtp(cleanPhone);
      addToast('Verification code sent to your phone number.', 'success');
      setOtpSent(true);
      setPhoneTimer(60);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send verification code.', 'error');
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (phoneTimer > 0) return;
    const cleanPhone = contactNumber.replace(/[\s\-\(\)]/g, '');
    
    setSendingPhoneOtp(true);
    setOtpError('');
    try {
      const res = await authService.resendPhoneOtp(cleanPhone);
      addToast('A new verification code has been sent to your phone.', 'success');
      setPhoneTimer(60);
      setPhoneOtp('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to resend verification code.', 'error');
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      addToast('OTP must be a 6-digit number.', 'warning');
      return;
    }

    setVerifyingPhoneOtp(true);
    setOtpError('');
    try {
      const res = await authService.verifyPhoneOtp(phoneOtp);
      addToast('Phone number verified successfully!', 'success');
      setPhoneVerified(true);
      setVerifiedNumber(contactNumber);
      setOtpSent(false);
      
      // Update local storage step 1 data
      const dataKey = currentUser?.id ? `onboarding_step1_${currentUser.id}` : 'onboarding_step1_guest';
      const saved = localStorage.getItem(dataKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.contactNumber = contactNumber;
          localStorage.setItem(dataKey, JSON.stringify(parsed));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid verification code.';
      setOtpError(errMsg);
      addToast(errMsg, 'error');
    } finally {
      setVerifyingPhoneOtp(false);
    }
  };

  // Handle Dynamic Course toggle
  const toggleCustomCourse = (active) => {
    setCustomCourseActive(active);
    if (active) {
      setCourse('');
    } else {
      setCourse('B.Tech');
    }
  };

  // Toggle Language Chip
  const handleLanguageToggle = (lang) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(prev => prev.filter(l => l !== lang));
      } else {
        addToast('Please select at least one language.', 'warning');
      }
    } else {
      setSelectedLanguages(prev => [...prev, lang]);
    }
  };

  // Add custom typed language
  const handleAddCustomLanguage = (e) => {
    e.preventDefault();
    const cleanLang = customLanguage.trim();
    if (!cleanLang) return;

    if (!availableLanguages.includes(cleanLang)) {
      setAvailableLanguages(prev => [...prev, cleanLang]);
    }
    if (!selectedLanguages.includes(cleanLang)) {
      setSelectedLanguages(prev => [...prev, cleanLang]);
    }

    setCustomLanguage('');
    setShowAddLanguageInput(false);
  };

  // Validation Routine
  const validateForm = (isSubmitting = false) => {
    const tempErrors = {};

    // 1. Personal Details
    if (!firstName.trim()) tempErrors.firstName = 'First name is required.';
    if (!lastName.trim()) tempErrors.lastName = 'Last name is required.';
    
    // Contact Validation
    const cleanPhone = contactNumber.replace(/[\s\-()]/g, '');
    if (!contactNumber.trim()) {
      tempErrors.contactNumber = 'Contact number is required.';
    } else if (!/^\+?\d{8,15}$/.test(cleanPhone)) {
      tempErrors.contactNumber = 'Enter a valid phone number (minimum 8 digits).';
    }

    if (!currentCity.trim()) tempErrors.currentCity = 'Current city is required.';
    if (!gender) tempErrors.gender = 'Please select your gender.';

    // 2. Status Specific Validation
    const courseValue = customCourseActive ? customCourse.trim() : course;

    if (currentStatus === 'College Student') {
      if (!courseValue) tempErrors.course = 'Please select or enter your course.';
      if (!collegeName.trim()) tempErrors.collegeName = 'College name is required.';
      if (!startYear) tempErrors.startYear = 'Start year is required.';
      if (!endYear) tempErrors.endYear = 'End year is required.';
      if (startYear && endYear && parseInt(startYear) > parseInt(endYear)) {
        tempErrors.endYear = 'End year cannot be before start year.';
      }
    } else if (currentStatus === 'Fresher') {
      if (!courseValue) tempErrors.course = 'Please select or enter your course.';
      if (!collegeName.trim()) tempErrors.collegeName = 'College name is required.';
      if (!startYear) tempErrors.startYear = 'Start year is required.';
      if (!endYear) tempErrors.endYear = 'End year is required.';
      if (startYear && endYear && parseInt(startYear) > parseInt(endYear)) {
        tempErrors.endYear = 'End year cannot be before start year.';
      }
    } else if (currentStatus === 'Working Professional' || currentStatus === 'Women Returning to Work') {
      if (!courseValue) tempErrors.course = 'Please select or enter your course.';
      if (!collegeName.trim()) tempErrors.collegeName = 'College name is required.';
      if (!startYear) tempErrors.startYear = 'Start year is required.';
      if (!endYear) tempErrors.endYear = 'End year is required.';
      if (startYear && endYear && parseInt(startYear) > parseInt(endYear)) {
        tempErrors.endYear = 'End year cannot be before start year.';
      }
    } else if (currentStatus === 'School Student') {
      if (!schoolStandard) tempErrors.schoolStandard = 'Standard is required.';
      if (!schoolName.trim()) tempErrors.schoolName = 'School name is required.';
    }

    if (isSubmitting) {
      setErrors(tempErrors);
    }
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Handler
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) {
      addToast('Please correct the validation errors in the form.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const step1Data = {
        firstName,
        lastName,
        contactNumber,
        currentCity,
        gender,
        selectedLanguages,
        currentStatus,
        course: customCourseActive ? customCourse : course,
        collegeName: currentStatus === 'School Student' ? schoolName : collegeName,
        stream,
        startYear,
        endYear,
        experienceYears,
        currentCompany,
        currentJobTitle,
        careerBreak,
        schoolStandard
      };
      const dataKey = currentUser?.id ? `onboarding_step1_${currentUser.id}` : 'onboarding_step1_guest';
      localStorage.setItem(dataKey, JSON.stringify(step1Data));

      addToast('Step 1 Saved successfully!', 'success');
      navigate('/onboarding/step2');
    }, 600);
  };

  // Form validity check for disabled state of button
  const isFormFilled = () => {
    const courseValue = customCourseActive ? customCourse.trim() : course;
    const personalFilled = firstName.trim() && lastName.trim() && contactNumber.trim() && currentCity.trim() && gender;
    
    if (!personalFilled) return false;

    if (currentStatus === 'College Student') {
      return courseValue && collegeName.trim() && startYear && endYear;
    } else if (currentStatus === 'Fresher') {
      return courseValue && collegeName.trim() && startYear && endYear;
    } else if (currentStatus === 'Working Professional' || currentStatus === 'Women Returning to Work') {
      return courseValue && collegeName.trim() && startYear && endYear;
    } else if (currentStatus === 'School Student') {
      return schoolStandard && schoolName.trim();
    }
    return false;
  };

  // Helper values
  const genderOptions = [
    { label: 'Female', value: 'Female' },
    { label: 'Male', value: 'Male' },
    { label: 'Prefer not to say', value: 'Prefer not to say' },
  ];

  const statusOptions = [
    'College Student',
    'Fresher',
    'Working Professional',
    'School Student',
    'Women Returning to Work',
  ];

  return (
    <div className="max-w-3xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
      {/* ── Progress Bar ── */}
      <div className="mb-10 w-full animate-fade-in">
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out" 
            style={{ width: '33.3%' }}
          />
        </div>
        <div className="flex justify-between items-center mt-2.5 text-xs text-slate-400 dark:text-slate-500 font-bold">
          <span>Step 1 of 3</span>
          <span>33% Complete</span>
        </div>
      </div>

      {/* ── Main Onboarding Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl animate-slide-up">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hi There 👋
          </h1>
          <span className="text-sm font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest block mt-1 mb-1">
            Let's get started
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed">
            Tell us a little about yourself so we can personalize your job recommendations and experience.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-8">
          
          {/* Section: Personal Information */}
          <div className="flex flex-col gap-5">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">
              1. Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="First Name" 
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
                required
              />
              <Input 
                label="Last Name" 
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Email Address" 
                id="emailAddress"
                type="email"
                value={currentUser?.email || 'guest@incuxai.com'}
                disabled
                required
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="contactNumber" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center">
                  Contact Number
                  <span className="text-rose-500 ml-0.5">*</span>
                  {!phoneVerified && <span className="ml-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">(Verify for better reach)</span>}
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="contactNumber"
                    type="tel"
                    placeholder="e.g. +91 9999999999"
                    value={contactNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={phoneVerified}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 text-sm dark:bg-gray-800 dark:text-slate-100 dark:disabled:bg-gray-700 dark:disabled:text-slate-500 border-slate-200 dark:border-slate-600"
                  />
                  {phoneVerified ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30 whitespace-nowrap">
                        <FiCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                      <button
                        type="button"
                        onClick={handleChangePhoneClick}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 underline focus:outline-none cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSendPhoneOtp}
                      disabled={sendingPhoneOtp || !/^\+?\d{8,15}$/.test(contactNumber.replace(/[\s\-\(\)]/g, ''))}
                      className="whitespace-nowrap rounded-xl font-bold py-2.5 px-4 text-xs h-[42px] min-w-[90px] cursor-pointer"
                    >
                      {sendingPhoneOtp ? 'Sending...' : 'Verify'}
                    </Button>
                  )}
                </div>
                {errors.contactNumber && <span className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-0.5">{errors.contactNumber}</span>}

                {/* Phone OTP Verification Section */}
                {otpSent && !phoneVerified && (
                  <div className="flex flex-col gap-3.5 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mt-3 animate-fade-in">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone-otp-input" className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Enter OTP
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          id="phone-otp-input"
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={phoneOtp}
                          onChange={(e) => {
                            setPhoneOtp(e.target.value.replace(/\D/g, ''));
                            setOtpError('');
                          }}
                          className="text-center font-mono tracking-widest text-lg font-bold w-36 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-brand-600 focus:outline-none dark:bg-slate-950 text-slate-850 dark:text-slate-200"
                          disabled={verifyingPhoneOtp}
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleVerifyPhoneOtp}
                          disabled={verifyingPhoneOtp || phoneOtp.length !== 6}
                          isLoading={verifyingPhoneOtp}
                          className="font-bold rounded-xl text-xs py-2.5 px-4 cursor-pointer"
                        >
                          Verify OTP
                        </Button>
                      </div>
                    </div>

                    {otpError && (
                      <span className="text-xs text-rose-500 font-bold animate-fade-in">
                        {otpError}
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      {phoneTimer > 0 ? (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          Resend OTP in {formatTimer(phoneTimer)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendPhoneOtp}
                          disabled={sendingPhoneOtp}
                          className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors cursor-pointer underline hover:no-underline"
                        >
                          {sendingPhoneOtp ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Input 
              label="Current City" 
              id="currentCity"
              placeholder="e.g. Bangalore, Mumbai"
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              error={errors.currentCity}
              required
            />
          </div>

          {/* Section: Gender */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
              Gender <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-6 items-center">
              {genderOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={gender === opt.value}
                    onChange={() => setGender(opt.value)}
                    className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.gender && <span className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-1">{errors.gender}</span>}
          </div>

          {/* Section: Languages Known */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
              Languages Known (Select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map(lang => {
                const isSelected = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageToggle(lang)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                      isSelected
                        ? 'bg-brand-500 text-white border-transparent shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {lang}
                    {isSelected && <FiCheck className="w-3.5 h-3.5" />}
                  </button>
                );
              })}

              {!showAddLanguageInput ? (
                <button
                  type="button"
                  onClick={() => setShowAddLanguageInput(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <FiPlus /> Add Language
                </button>
              ) : (
                <div className="flex items-center gap-1.5 animate-scale-in">
                  <input
                    type="text"
                    placeholder="Type language..."
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCustomLanguage(e);
                      }
                    }}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLanguage}
                    className="p-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
                  >
                    <FiCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddLanguageInput(false); setCustomLanguage(''); }}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Current Status */}
          <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-250 uppercase tracking-wider">
              2. Current Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {statusOptions.map(opt => {
                const isSelected = currentStatus === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCurrentStatus(opt)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 hover:scale-[1.01] hover:shadow-sm ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/15'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-750'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                        {opt === 'College Student' ? '🎓 Academy' : opt === 'Fresher' ? '🌱 Start' : opt === 'Working Professional' ? '💼 Career' : opt === 'School Student' ? '🏫 School' : '↩️ Return'}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300'}`}>
                        {isSelected && <FiCheck className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <span className="text-[13px] font-black text-slate-850 dark:text-slate-200">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Dynamic Sub-form fields */}
          <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800/40 rounded-3xl p-5 sm:p-7 flex flex-col gap-5 animate-fade-in">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Fill details for {currentStatus}
            </h4>

            {currentStatus !== 'School Student' && (
              <>
                {/* Years of Experience (For Fresher / Pro / Return to work) */}
                {currentStatus !== 'College Student' && (
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                      Years of Experience
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['0', '1', '2', '3', '4', '5+'].map(yr => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setExperienceYears(yr)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            experienceYears === yr
                              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Selection */}
                <div className="flex flex-col gap-1.5 w-full">
                  {!customCourseActive ? (
                    <>
                      <Input
                        label="Course"
                        id="courseSelect"
                        type="select"
                        placeholder="Select course..."
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        options={['B.Tech', 'B.E.', 'B.Com', 'MBA', 'B.A.']}
                        error={errors.course}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleCustomCourse(true)}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 self-start hover:underline focus:outline-none"
                      >
                        Find More Courses ▼
                      </button>
                    </>
                  ) : (
                    <>
                      <Input
                        label="Enter Course Name"
                        id="courseCustom"
                        placeholder="e.g. Master of Science, BCA"
                        value={customCourse}
                        onChange={(e) => setCustomCourse(e.target.value)}
                        error={errors.course}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => toggleCustomCourse(false)}
                        className="text-xs font-bold text-slate-500 dark:text-slate-450 self-start hover:underline focus:outline-none"
                      >
                        ▲ Back to Default Courses
                      </button>
                    </>
                  )}
                </div>

                {/* College, Stream & Years Grid */}
                <Input
                  label="College/University Name"
                  id="collegeName"
                  placeholder="e.g. Delhi University, IIT Bombay"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  error={errors.collegeName}
                  required
                />

                <Input
                  label="Stream / Branch (Optional)"
                  id="stream"
                  placeholder="e.g. Computer Science, Mechanical Engineering"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Year"
                    id="startYear"
                    type="select"
                    placeholder="Select start year..."
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    options={yearOptions}
                    error={errors.startYear}
                    required
                  />
                  <Input
                    label="End Year"
                    id="endYear"
                    type="select"
                    placeholder="Select end year..."
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    options={yearOptions}
                    error={errors.endYear}
                    required
                  />
                </div>

                {/* Company / Job Title for Professionals and Women returning to work */}
                {(currentStatus === 'Working Professional' || currentStatus === 'Women Returning to Work') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/50 dark:border-slate-700/50 pt-4 mt-2">
                    <Input
                      label="Current/Most Recent Company (Optional)"
                      id="currentCompany"
                      placeholder="e.g. Infosys, Google"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                    />
                    <Input
                      label="Current/Most Recent Job Title (Optional)"
                      id="currentJobTitle"
                      placeholder="e.g. Software Engineer"
                      value={currentJobTitle}
                      onChange={(e) => setCurrentJobTitle(e.target.value)}
                    />
                  </div>
                )}

                {/* Career Break option for women returning to work */}
                {currentStatus === 'Women Returning to Work' && (
                  <div className="flex flex-col gap-2.5 border-t border-slate-200/50 dark:border-slate-700/50 pt-4 mt-2">
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                      Career Break (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['6 Months', '1 Year', '2 Years', '3+ Years'].map(brk => (
                        <button
                          key={brk}
                          type="button"
                          onClick={() => setCareerBreak(brk)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            careerBreak === brk
                              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {brk}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {currentStatus === 'School Student' && (
              <>
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                    Standard <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Class XII', 'Class XI', 'Class X or Below'].map(std => (
                      <button
                        key={std}
                        type="button"
                        onClick={() => setSchoolStandard(std)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          schoolStandard === std
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {std}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="School Name"
                  id="schoolName"
                  placeholder="e.g. St. Xavier's High School"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  error={errors.schoolName}
                  required
                />
              </>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-sm font-black tracking-wide cursor-pointer py-3 rounded-2xl"
              disabled={!isFormFilled()}
              loading={loading}
            >
              Save & Continue <FiArrowRight className="ml-1" />
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Onboarding;
