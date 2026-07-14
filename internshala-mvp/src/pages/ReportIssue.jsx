import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../components/common/Toast';
import { FiAlertCircle, FiCheckCircle, FiUploadCloud, FiX, FiChevronDown } from 'react-icons/fi';
import Button from '../components/common/Button';

const ReportIssue = () => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [areaOfConcern, setAreaOfConcern] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  // Validation/Alert states
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const concernOptions = [
    'Account & Login',
    'Google Sign-In',
    'Job Listings',
    'Internship Listings',
    'Resume Builder',
    'Dashboard',
    'Saved Jobs',
    'Profile',
    'AI Recommendations',
    'Technical Issue',
    'Bug Report',
    'Feature Request',
    'Other'
  ];

  // Handle file validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        screenshot: 'Supported file formats are PNG, JPG, and JPEG only.'
      }));
      setScreenshot(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const maxSizeInBytes = 150 * 1024; // 150 KB
    if (file.size > maxSizeInBytes) {
      setErrors(prev => ({
        ...prev,
        screenshot: 'File size exceeds the 150 KB limit.'
      }));
      setScreenshot(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Clear file error if valid
    setErrors(prev => {
      const updated = { ...prev };
      delete updated.screenshot;
      return updated;
    });
    setScreenshot(file);
  };

  const removeFile = () => {
    setScreenshot(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const newErrors = {};

    // Validate Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    // Validate Email Address
    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    // Validate Area of Concern
    if (!areaOfConcern) {
      newErrors.areaOfConcern = 'Please select your area of concern.';
    }

    // Validate Subject
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }

    // Validate Description
    if (!description.trim()) {
      newErrors.description = 'Please describe the issue in detail.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please correct the highlighted errors before submitting.', 'error');
      return;
    }

    // Clear errors
    setErrors({});

    // Success Actions
    setSuccessMessage(
      'Thank you for contacting IncuXAI Careers. Your issue has been recorded successfully. Our support team will review your request and respond as soon as possible.'
    );
    addToast('Issue report recorded successfully!', 'success');

    // Reset Form Fields
    setFullName('');
    setEmail('');
    setContactNumber('');
    setAreaOfConcern('');
    setSubject('');
    setDescription('');
    setScreenshot(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-slide-up py-12 px-6 sm:px-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
          Report an Issue
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
          If you're experiencing any issues while using IncuXAI Careers or would like to report a bug, please complete the form below. Our support team will review your request and respond to the email address provided as soon as possible.
        </p>
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* Success Banner */}
        {successMessage && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold animate-fade-in">
            <FiCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Info box */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-550 dark:text-slate-400 flex flex-col gap-2 shadow-sm">
          <h4 className="text-slate-800 dark:text-slate-100 font-bold uppercase tracking-wider text-[10px] mb-1">
            Before reporting an issue:
          </h4>
          <ul className="list-disc pl-5 space-y-1.5 font-medium leading-relaxed">
            <li>Refresh the page and try again.</li>
            <li>Include the Job Title or Job Link if your issue relates to a specific job listing.</li>
            <li>Attach a screenshot whenever possible to help us investigate the issue faster.</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold ${
                errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.fullName && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.fullName}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. janedoe@email.com"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {/* Helper Text */}
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
              We'll use this email address to respond to your issue.
            </p>
            {errors.email && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.email}
              </span>
            )}
          </div>

          {/* Contact Number */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                Contact Number
              </label>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Optional</span>
            </div>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold"
            />
          </div>

          {/* Area of Concern */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
              Area of Concern <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={areaOfConcern}
                onChange={(e) => setAreaOfConcern(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold appearance-none cursor-pointer ${
                  errors.areaOfConcern ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <option value="" disabled>Select your concern area</option>
                {concernOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FiChevronDown className="w-4 h-4" />
              </div>
            </div>
            {errors.areaOfConcern && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.areaOfConcern}
              </span>
            )}
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of the issue"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold ${
                errors.subject ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.subject && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.subject}
              </span>
            )}
          </div>

          {/* Describe Your Issue */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
              Describe Your Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide steps to reproduce the issue, details of the browser or device used, or links to the specific pages where you experienced it."
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold resize-y min-h-[120px] ${
                errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.description && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.description}
              </span>
            )}
          </div>

          {/* File Upload Field */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                Attach Screenshot
              </label>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Optional</span>
            </div>
            
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center ${
              errors.screenshot ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-slate-50/20 dark:bg-slate-900/10'
            }`}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg"
                className="hidden"
                id="screenshot-file-upload"
              />
              
              {!screenshot ? (
                <label htmlFor="screenshot-file-upload" className="cursor-pointer flex flex-col items-center gap-2 select-none">
                  <FiUploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-650" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to upload screenshot
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Supported formats: PNG, JPG, JPEG (Max size: 150 KB)
                  </span>
                </label>
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 py-2.5 px-4 rounded-xl border border-slate-100 dark:border-slate-800 max-w-md w-full justify-between animate-fade-in">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[280px]">
                    {screenshot.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {errors.screenshot && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.screenshot}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-4">
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto px-8 py-3 text-xs font-extrabold tracking-wider uppercase"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
