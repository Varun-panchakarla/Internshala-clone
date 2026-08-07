import React, { useEffect, useRef, useState } from 'react';
import {
  FiUser, FiBookOpen, FiAward, FiCamera, FiTrash2, FiUpload, FiMapPin
} from 'react-icons/fi';
import { useEmployerAuth } from '../../../context/EmployerAuthContext';
import { useToast } from '../../../components/common/Toast';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import ProgressBar from '../../../components/common/ProgressBar';

function buildInitial(company) {
  if (!company) return {};
  const map = {
    companyName: company.company_name,
    recruiterName: company.recruiter_name,
    industry: company.industry,
    companySize: company.company_size,
    foundedYear: company.founded_year,
    website: company.website,
    linkedin: company.linkedin,
    description: company.description,
    headquarters: company.headquarters,
    officeLocations: company.office_locations,
    hiringLocations: company.hiring_locations,
    workMode: company.work_mode || 'Remote',
    designation: company.designation,
    department: company.department,
    officialPhone: company.official_phone,
    companyLogo: company.company_logo || ''
  };
  const clean = {};
  Object.keys(map).forEach(k => { clean[k] = map[k] ?? ''; });
  return clean;
}

const COMPLETENESS_FIELDS = [
  'companyName', 'recruiterName', 'industry', 'companySize', 'foundedYear',
  'website', 'linkedin', 'description', 'headquarters', 'workMode',
  'designation', 'department', 'officialPhone', 'companyLogo'
];

const computeCompleteness = (form) => {
  const filled = COMPLETENESS_FIELDS.filter(f => String(form[f] || '').trim().length > 0).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
};

const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];
const workModeOptions = ['Remote', 'Hybrid', 'On-site'];

export default function SettingsView({ company, onSave, saving, saved }) {
  const { currentEmployer } = useEmployerAuth();
  const { addToast } = useToast();
  const logoInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState(() => buildInitial({}));
  const [loaded, setLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company && !loaded) {
      setForm(buildInitial(company));
      setLoaded(true);
    }
  }, [company, loaded]);

  useEffect(() => {
    setLogoError(false);
  }, [form.companyLogo]);

  const set = (k) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [k]: value }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: '' }));
  };

  const completeness = computeCompleteness(form);
  const dirty = loaded && company ? JSON.stringify(form) !== JSON.stringify(buildInitial(company)) : false;
  const hasLogo = !!(form.companyLogo && !logoError);

  const companyName = form.companyName || currentEmployer?.companyName || 'Company';
  const companyInitial = companyName.trim().charAt(0).toUpperCase() || 'C';
  const role = form.industry || form.designation || 'Recruiter';
  const location = form.headquarters || 'Location not set';

  const handleLogoUpload = (e) => {
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
    reader.onload = (event) => {
      setForm(prev => ({ ...prev, companyLogo: event.target.result }));
      setLogoError(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setForm(prev => ({ ...prev, companyLogo: '' }));
    setLogoError(false);
  };

  const validate = () => {
    const tempErrors = {};
    if (activeTab === 'personal' && !form.recruiterName?.trim()) {
      tempErrors.recruiterName = 'Recruiter name is required.';
    }
    if (activeTab === 'company' && !form.companyName?.trim()) {
      tempErrors.companyName = 'Company name is required.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }
    onSave(form);
  };

  const tags = [...new Set([
    ...String(form.hiringLocations || '').split(',').map(s => s.trim()).filter(Boolean),
    ...String(form.officeLocations || '').split(',').map(s => s.trim()).filter(Boolean)
  ])];

  const tabBtn = (tab, label, Icon) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
        activeTab === tab
          ? 'border-brand-600 text-brand-700 dark:text-brand-400 bg-white dark:bg-slate-900'
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon /> {label}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full animate-slide-up">
      {/* Left Column: Profile Card Summary */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-md flex flex-col items-center text-center">
          {/* Avatar / Logo with Upload Overlay Badge */}
          <div className="relative mb-3 group">
            {hasLogo ? (
              <img
                src={form.companyLogo}
                alt={companyName}
                onError={() => setLogoError(true)}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg ring-2 ring-slate-100 dark:ring-slate-700 cursor-pointer"
                onClick={() => logoInputRef.current?.click()}
              />
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-extrabold text-3xl shadow-inner border border-slate-200 dark:border-slate-700 cursor-pointer transition-transform hover:scale-105"
                title="Click to upload company logo"
              >
                {companyInitial}
              </div>
            )}

            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              title={hasLogo ? "Change Company Logo" : "Upload Company Logo"}
              className="absolute bottom-0 right-0 bg-brand-600 hover:bg-brand-700 text-white p-2 rounded-full shadow-md border-2 border-white dark:border-slate-900 transition-transform hover:scale-110 cursor-pointer"
            >
              <FiCamera className="w-3.5 h-3.5" />
            </button>

            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {hasLogo && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline mb-2 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <FiTrash2 className="w-3 h-3" /> Remove Logo
            </button>
          )}

          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 mt-1">{companyName}</h2>
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-2">{role}</p>
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full mb-6">
            📍 {location}
          </span>

          <div className="w-full text-left bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Profile Completed</span>
              <span className="text-brand-600 dark:text-brand-400">{completeness}%</span>
            </div>
            <ProgressBar value={completeness} showPercentage={false} size="sm" />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
              Your company profile is fully verified. Candidates can view your company and job matches.
            </p>
          </div>
        </div>

        {/* Recruiting Locations preview box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-md">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
            <FiMapPin className="text-slate-400" /> Recruiting Locations
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag} className="bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-400 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No locations set</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Tabbed Profile Form */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          {tabBtn('personal', 'Personal & Preferences', FiUser)}
          {tabBtn('company', 'Company Details', FiBookOpen)}
          {tabBtn('about', 'Logo & About', FiAward)}
        </div>

        {/* Tab Contents */}
        <div className="p-6 md:p-8">
          <form onSubmit={submit} className="flex flex-col gap-6">
            {/* 1. Personal & Preferences Tab */}
            {activeTab === 'personal' && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Recruiter Name"
                    id="recruiterName"
                    value={form.recruiterName}
                    onChange={set('recruiterName')}
                    error={errors.recruiterName}
                    required
                  />
                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    value={currentEmployer?.email || ''}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Official Phone"
                    id="officialPhone"
                    value={form.officialPhone}
                    onChange={set('officialPhone')}
                    placeholder="e.g. +91 9876543210"
                  />
                  <Input
                    label="Designation"
                    id="designation"
                    value={form.designation}
                    onChange={set('designation')}
                    placeholder="e.g. HR Manager"
                  />
                  <Input
                    label="Department"
                    id="department"
                    value={form.department}
                    onChange={set('department')}
                    placeholder="e.g. People & Culture"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Headquarters"
                    id="headquarters"
                    value={form.headquarters}
                    onChange={set('headquarters')}
                    placeholder="City, Country"
                  />
                  <Input
                    label="Work Mode"
                    id="workMode"
                    type="select"
                    value={form.workMode}
                    onChange={set('workMode')}
                    options={workModeOptions}
                  />
                </div>
              </div>
            )}

            {/* 2. Company Details Tab */}
            {activeTab === 'company' && (
              <div className="flex flex-col gap-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    id="companyName"
                    value={form.companyName}
                    onChange={set('companyName')}
                    error={errors.companyName}
                    required
                  />
                  <Input
                    label="Industry"
                    id="industry"
                    value={form.industry}
                    onChange={set('industry')}
                    placeholder="e.g. SaaS, EdTech"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Company Size"
                    id="companySize"
                    type="select"
                    value={form.companySize}
                    onChange={set('companySize')}
                    options={companySizeOptions.map(s => ({ label: `${s} employees`, value: s }))}
                  />
                  <Input
                    label="Founded Year"
                    id="foundedYear"
                    value={form.foundedYear}
                    onChange={set('foundedYear')}
                    placeholder="e.g. 2020"
                  />
                  <Input
                    label="Website"
                    id="website"
                    value={form.website}
                    onChange={set('website')}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="LinkedIn"
                    id="linkedin"
                    value={form.linkedin}
                    onChange={set('linkedin')}
                    placeholder="https://linkedin.com/company/..."
                  />
                  <Input
                    label="Office Locations"
                    id="officeLocations"
                    value={form.officeLocations}
                    onChange={set('officeLocations')}
                    placeholder="Comma-separated cities"
                  />
                  <Input
                    label="Hiring Locations"
                    id="hiringLocations"
                    value={form.hiringLocations}
                    onChange={set('hiringLocations')}
                    placeholder="Comma-separated cities"
                  />
                </div>
              </div>
            )}

            {/* 3. Logo & About Tab */}
            {activeTab === 'about' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Company Logo</span>
                  {hasLogo ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={form.companyLogo}
                          alt={companyName}
                          onError={() => setLogoError(true)}
                          className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button type="button" variant="outline" className="flex items-center gap-2 py-2" onClick={() => logoInputRef.current?.click()}>
                            <FiUpload className="w-4 h-4" /> Change Logo
                          </Button>
                          <Button type="button" variant="ghost" className="flex items-center gap-2 py-2 text-rose-500" onClick={handleRemoveLogo}>
                            <FiTrash2 className="w-4 h-4" /> Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button type="button" variant="outline" className="flex items-center gap-2 py-2 border-dashed" onClick={() => logoInputRef.current?.click()}>
                        <FiUpload className="w-4 h-4" /> Upload Logo
                      </Button>
                      <span className="text-xs text-slate-400 italic">Upload a PNG/JPG/WebP logo (max 5 MB).</span>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </div>

                <Input
                  label="About the Company"
                  id="description"
                  type="textarea"
                  rows={4}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Short description of what your company does..."
                />
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                Completeness: <b className="text-slate-600 dark:text-slate-300">{completeness}%</b>
              </span>
              <div className="flex items-center gap-3">
                {saved && <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Profile saved!</span>}
                {!dirty && !saved && <span className="text-[11px] text-slate-400 font-medium">No changes yet</span>}
                <Button type="submit" variant="primary" className="px-8" loading={saving}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
