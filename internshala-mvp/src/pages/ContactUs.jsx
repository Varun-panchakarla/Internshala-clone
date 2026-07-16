import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { FiMail, FiClock, FiCheckCircle, FiAlertCircle, FiChevronDown, FiBriefcase, FiArrowRight, FiInfo } from 'react-icons/fi';
import Button from '../components/common/Button';

const ContactUs = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');

  // Validation / Alert states
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'General Enquiry',
    'Business Enquiry',
    'Partnership',
    'Feedback',
    'Media',
    'Careers',
    'Other'
  ];

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

    // Validate Subject
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }

    // Validate Category
    if (!category) {
      newErrors.category = 'Please select a category.';
    }

    // Validate Message
    if (!message.trim()) {
      newErrors.message = 'Message is required.';
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
      'Thank you for contacting IncuXAI Careers. We have received your message and will get back to you as soon as possible.'
    );
    addToast('Your message has been sent successfully!', 'success');

    // Reset Form Fields
    setFullName('');
    setEmail('');
    setSubject('');
    setCategory('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-slide-up py-12 px-6 sm:px-8 flex flex-col gap-16">
      
      {/* 1. Hero Section */}
      <section className="text-center max-w-2xl mx-auto flex flex-col gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 font-heading">
          Contact Us
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
          We're here to help. Whether you have a question, feedback, partnership opportunity, or general enquiry, we'd love to hear from you.
        </p>
      </section>

      {/* 2. Contact Information Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        {/* Company Card */}
        <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FiBriefcase className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider">Company</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
            IncuXAI Private Limited
          </p>
        </div>

        {/* Email Card */}
        <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FiMail className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider">Email</h3>
          </div>
          <p className="text-brand-600 dark:text-brand-400 text-xs font-semibold leading-relaxed truncate">
            contact@incuxai.com
          </p>
        </div>

        {/* Business Hours Card */}
        <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <FiClock className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider">Business Hours</h3>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
            <p>Monday – Friday</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">9:00 AM – 6:00 PM (IST)</p>
          </div>
        </div>
      </section>

      {/* 3. Contact Form & Success Messages */}
      <section className="max-w-2xl mx-auto w-full flex flex-col gap-8">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-semibold animate-fade-in">
            <FiCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-850 dark:text-slate-200 tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
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
            <label className="text-xs font-black uppercase text-slate-850 dark:text-slate-200 tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="janedoe@email.com"
              className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.email && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.email}
              </span>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-850 dark:text-slate-200 tracking-wider">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold appearance-none cursor-pointer ${
                  errors.category ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <option value="" disabled>Select enquiry category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <FiChevronDown className="w-4 h-4" />
              </div>
            </div>
            {errors.category && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.category}
              </span>
            )}
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-850 dark:text-slate-200 tracking-wider">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What is this regarding?"
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

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase text-slate-850 dark:text-slate-200 tracking-wider">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you? Please describe in detail."
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs font-semibold resize-y min-h-[120px] ${
                errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.message && (
              <span className="text-red-500 text-[10px] font-bold flex items-center gap-1 mt-1">
                <FiAlertCircle className="w-3.5 h-3.5" /> {errors.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto px-8 py-3 text-xs font-extrabold tracking-wider uppercase"
            >
              Send Message
            </Button>
          </div>
        </form>
      </section>

      {/* 5. Closing Section */}
      <section className="text-center max-w-xl mx-auto flex flex-col items-center gap-6 p-8 rounded-2xl bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100/50 dark:border-brand-900/10 shadow-xs">
        <div className="flex flex-col gap-2">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
            We appreciate your interest in IncuXAI Careers and look forward to hearing from you.
          </p>
        </div>
        <Button
          onClick={() => navigate('/jobs')}
          variant="secondary"
          className="flex items-center gap-2 px-8 py-3 text-xs font-extrabold tracking-wider uppercase"
        >
          <span>Browse Jobs</span>
          <FiArrowRight className="w-4 h-4" />
        </Button>
      </section>

    </div>
  );
};

export default ContactUs;
