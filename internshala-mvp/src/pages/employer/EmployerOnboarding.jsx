import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { FiBriefcase, FiMapPin, FiUser, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';

const EmployerOnboarding = () => {
  const { currentEmployer, updateEmployerProfile, logout } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [foundedYear, setFoundedYear] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [description, setDescription] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [officeLocations, setOfficeLocations] = useState('');
  const [hiringLocations, setHiringLocations] = useState('');
  const [workMode, setWorkMode] = useState('Remote');

  const [recruiterName, setRecruiterName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [officialPhone, setOfficialPhone] = useState('');

  // Load existing profile values if any
  useEffect(() => {
    if (currentEmployer) {
      setCompanyName(currentEmployer.companyName || '');
      setRecruiterName(currentEmployer.recruiterName || '');
      setOfficialPhone(currentEmployer.profileData?.officialPhone || currentEmployer.profileData?.phone || '');
      
      const p = currentEmployer.profileData || {};
      setCompanyLogo(p.companyLogo || '');
      setIndustry(p.industry || '');
      setCompanySize(p.companySize || '');
      setFoundedYear(p.foundedYear || '');
      setWebsite(p.website || '');
      setLinkedin(p.linkedin || '');
      setDescription(p.description || '');
      setHeadquarters(p.headquarters || '');
      setOfficeLocations(p.officeLocations || '');
      setHiringLocations(p.hiringLocations || '');
      setWorkMode(p.workMode || 'Remote');
      setDesignation(p.designation || '');
      setDepartment(p.department || '');
    }
  }, [currentEmployer]);

  const [errors, setErrors] = useState({});

  const validateStep = (s) => {
    const tempErrors = {};
    if (s === 1) {
      if (!companyName.trim()) tempErrors.companyName = 'Company name is required.';
      if (!industry) tempErrors.industry = 'Industry is required.';
      if (!companySize) tempErrors.companySize = 'Company size is required.';
      if (!foundedYear.trim()) tempErrors.foundedYear = 'Founded year is required.';
      else if (!/^\d{4}$/.test(foundedYear.trim())) tempErrors.foundedYear = 'Please enter a valid 4-digit year.';
      
      if (website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(website.trim())) {
        tempErrors.website = 'Please enter a valid URL.';
      }
      if (linkedin && !/^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/.test(linkedin.trim())) {
        tempErrors.linkedin = 'Please enter a valid LinkedIn URL.';
      }
    } else if (s === 2) {
      if (!description.trim() || description.length < 20) {
        tempErrors.description = 'Please provide a description (min 20 characters).';
      }
      if (!headquarters.trim()) tempErrors.headquarters = 'Headquarters location is required.';
    } else if (s === 3) {
      if (!recruiterName.trim()) tempErrors.recruiterName = 'Recruiter name is required.';
      if (!designation.trim()) tempErrors.designation = 'Designation is required.';
      if (!department.trim()) tempErrors.department = 'Department is required.';
      if (!officialPhone.trim()) tempErrors.officialPhone = 'Official contact phone is required.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      await updateEmployerProfile({
        companyLogo,
        industry,
        companySize,
        foundedYear,
        website,
        linkedin,
        description,
        headquarters,
        officeLocations,
        hiringLocations,
        workMode,
        designation,
        department,
        officialPhone,
        onboardingCompleted: true
      });
      addToast('Onboarding complete! Recruiter profile updated.', 'success');
      navigate('/employer/dashboard');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to complete recruiter onboarding.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-955 font-sans flex flex-col transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <Logo className="h-10 w-auto" mode="light" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={logout}
            className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors bg-slate-50 hover:bg-rose-50 dark:bg-slate-850 dark:hover:bg-rose-955/20 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 flex flex-col gap-8">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Onboard Your Company</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Complete these details to set up your Recruiter Profile.</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {/* Progress bar background line */}
          <div className="absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-slate-100 dark:bg-slate-800 z-0 hidden sm:block" />
          {/* Active progress fill */}
          <div
            className="absolute top-[44px] left-[15%] h-0.5 bg-sky-600 transition-all duration-300 z-0 hidden sm:block"
            style={{ width: step === 1 ? '0%' : step === 2 ? '35%' : '70%' }}
          />

          <div className="flex flex-col items-center gap-1.5 sm:w-1/3 z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
              step >= 1
                ? 'bg-sky-600 border-sky-600 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
            }`}>
              {step > 1 ? <FiCheck className="w-5 h-5" /> : '1'}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider ${step === 1 ? 'text-sky-600' : 'text-slate-400 dark:text-slate-500'}`}>
              Company Details
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 sm:w-1/3 z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
              step >= 2
                ? 'bg-sky-600 border-sky-600 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
            }`}>
              {step > 2 ? <FiCheck className="w-5 h-5" /> : '2'}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider ${step === 2 ? 'text-sky-600' : 'text-slate-400 dark:text-slate-500'}`}>
              Offices & Culture
            </span>
          </div>

          <div className="flex flex-col items-center gap-1.5 sm:w-1/3 z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
              step === 3
                ? 'bg-sky-600 border-sky-600 text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
            }`}>
              '3'
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider ${step === 3 ? 'text-sky-600' : 'text-slate-400 dark:text-slate-500'}`}>
              Recruiter Info
            </span>
          </div>
        </div>

        {/* Form Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md p-6 sm:p-8">
          
          {/* STEP 1: COMPANY BASICS */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center gap-2 text-sky-600 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FiBriefcase className="w-5 h-5" />
                <h2 className="font-extrabold text-slate-900 dark:text-white">Company Overview</h2>
              </div>

              <Input
                label="Company Logo Image URL"
                id="companyLogo"
                placeholder="e.g. https://logo.clearbit.com/incuxai.com"
                value={companyLogo}
                onChange={(e) => setCompanyLogo(e.target.value)}
                error={errors.companyLogo}
              />

              <Input
                label="Company Name"
                id="companyName"
                placeholder="e.g. IncuXAI Tech"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                error={errors.companyName}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="industry" className="text-xs font-semibold text-slate-655 dark:text-slate-400">
                    Industry <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="">Select Industry</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Finance & Fintech">Finance & Fintech</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="EdTech">EdTech</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Marketing & Consulting">Marketing & Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && <span className="text-xs text-rose-500 font-medium">{errors.industry}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companySize" className="text-xs font-semibold text-slate-655 dark:text-slate-400">
                    Company Size <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="companySize"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="">Select Company Size</option>
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="51-200 employees">51-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                    <option value="501-1000 employees">501-1000 employees</option>
                    <option value="1000+ employees">1000+ employees</option>
                  </select>
                  {errors.companySize && <span className="text-xs text-rose-500 font-medium">{errors.companySize}</span>}
                </div>
              </div>

              <Input
                label="Founded Year"
                id="foundedYear"
                placeholder="e.g. 2024"
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
                error={errors.foundedYear}
                required
              />

              <Input
                label="Company Website URL"
                id="website"
                placeholder="e.g. https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                error={errors.website}
              />

              <Input
                label="LinkedIn Page URL"
                id="linkedin"
                placeholder="e.g. https://linkedin.com/company/incuxai"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                error={errors.linkedin}
              />

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleNext}
                  variant="primary"
                  className="font-bold text-xs h-10 px-6 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  Continue <FiArrowRight />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: OFFICES & CULTURE */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center gap-2 text-sky-600 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FiMapPin className="w-5 h-5" />
                <h2 className="font-extrabold text-slate-900 dark:text-white">Offices & Locations</h2>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-655 dark:text-slate-400">
                  Company Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Tell candidates about your company mission, tech stack, and values..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans"
                />
                {errors.description && <span className="text-xs text-rose-500 font-medium">{errors.description}</span>}
              </div>

              <Input
                label="Headquarters Address"
                id="headquarters"
                placeholder="e.g. Bangalore, Karnataka, India"
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                error={errors.headquarters}
                required
              />

              <Input
                label="Office Locations (Comma Separated)"
                id="officeLocations"
                placeholder="e.g. Bangalore, Hyderabad, Pune"
                value={officeLocations}
                onChange={(e) => setOfficeLocations(e.target.value)}
                error={errors.officeLocations}
              />

              <Input
                label="Target Hiring Locations"
                id="hiringLocations"
                placeholder="e.g. India, Remote US"
                value={hiringLocations}
                onChange={(e) => setHiringLocations(e.target.value)}
                error={errors.hiringLocations}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="workMode" className="text-xs font-semibold text-slate-655 dark:text-slate-400">
                  Hiring/Work Mode <span className="text-rose-500">*</span>
                </label>
                <select
                  id="workMode"
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="In-office">In-office</option>
                </select>
              </div>

              <div className="flex justify-between mt-4">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  className="font-bold text-xs h-10 px-6 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <FiArrowLeft /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  variant="primary"
                  className="font-bold text-xs h-10 px-6 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  Continue <FiArrowRight />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: RECRUITER INFO */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center gap-2 text-sky-600 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FiUser className="w-5 h-5" />
                <h2 className="font-extrabold text-slate-900 dark:text-white">Recruiter Information</h2>
              </div>

              <Input
                label="Recruiter Full Name"
                id="recruiterName"
                placeholder="e.g. John Doe"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                error={errors.recruiterName}
                required
              />

              <Input
                label="Designation / Job Title"
                id="designation"
                placeholder="e.g. Talent Acquisition Manager"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                error={errors.designation}
                required
              />

              <Input
                label="Department"
                id="department"
                placeholder="e.g. Human Resources"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                error={errors.department}
                required
              />

              <Input
                label="Official Contact Phone"
                id="officialPhone"
                placeholder="e.g. +91 9999999999"
                value={officialPhone}
                onChange={(e) => setOfficialPhone(e.target.value)}
                error={errors.officialPhone}
                required
              />

              <div className="flex justify-between mt-4">
                <Button
                  onClick={handlePrev}
                  variant="outline"
                  className="font-bold text-xs h-10 px-6 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <FiArrowLeft /> Back
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  className="font-bold text-xs h-10 px-6 rounded-xl flex items-center gap-1 cursor-pointer"
                  disabled={loading}
                  loading={loading}
                >
                  Complete Onboarding <FiCheck />
                </Button>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
};

export default EmployerOnboarding;
