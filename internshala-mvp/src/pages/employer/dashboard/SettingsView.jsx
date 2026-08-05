import React, { useEffect, useState } from 'react';
import { FiSettings, FiCheck } from 'react-icons/fi';
import { Card, SectionHeader, Field, inputCls, textareaCls } from './ui';
import Button from '../../../components/common/Button';

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
    officialPhone: company.official_phone
  };
  const clean = {};
  Object.keys(map).forEach(k => { clean[k] = map[k] ?? ''; });
  return clean;
}

export default function SettingsView({ company, onSave, saving, saved }) {
  const [form, setForm] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (company && !loaded) {
      setForm(buildInitial(company));
      setLoaded(true);
    }
  }, [company, loaded]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(buildInitial(company));

  const submit = (e) => {
    e.preventDefault();
    if (!form.companyName?.trim()) return;
    onSave(form);
  };

  return (
    <div className="space-y-4">
      <SectionHeader icon={FiSettings} title="Company Profile" subtitle="Keep your company information up to date" />

      <form onSubmit={submit} className="space-y-4">
        <Card>
          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wider">Company details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company name" required>
              <input className={inputCls} value={form.companyName} onChange={set('companyName')} />
            </Field>
            <Field label="Industry">
              <input className={inputCls} value={form.industry} onChange={set('industry')} placeholder="e.g. SaaS, EdTech" />
            </Field>
            <Field label="Company size">
              <select className={inputCls} value={form.companySize} onChange={set('companySize')}>
                <option value="">Select size</option>
                {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => (
                  <option key={s} value={s}>{s} employees</option>
                ))}
              </select>
            </Field>
            <Field label="Founded year">
              <input className={inputCls} value={form.foundedYear} onChange={set('foundedYear')} placeholder="e.g. 2020" />
            </Field>
            <Field label="Website">
              <input className={inputCls} value={form.website} onChange={set('website')} placeholder="https://..." />
            </Field>
            <Field label="LinkedIn">
              <input className={inputCls} value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/company/..." />
            </Field>
            <Field label="Headquarters">
              <input className={inputCls} value={form.headquarters} onChange={set('headquarters')} placeholder="City, Country" />
            </Field>
            <Field label="Work mode">
              <select className={inputCls} value={form.workMode} onChange={set('workMode')}>
                {['Remote', 'Hybrid', 'On-site'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="About the company">
                <textarea className={textareaCls} rows={3} value={form.description} onChange={set('description')} placeholder="Short description of what your company does..." />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 mb-4 uppercase tracking-wider">Recruiter details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Recruiter name">
              <input className={inputCls} value={form.recruiterName} onChange={set('recruiterName')} />
            </Field>
            <Field label="Designation">
              <input className={inputCls} value={form.designation} onChange={set('designation')} placeholder="e.g. HR Manager" />
            </Field>
            <Field label="Department">
              <input className={inputCls} value={form.department} onChange={set('department')} placeholder="e.g. People & Culture" />
            </Field>
            <Field label="Official phone">
              <input className={inputCls} value={form.officialPhone} onChange={set('officialPhone')} placeholder="+91..." />
            </Field>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" size="sm" loading={saving} disabled={!dirty && !saved}>
            <FiCheck className="w-3.5 h-3.5 mr-1" /> Save changes
          </Button>
          {saved && <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Profile saved!</span>}
          {!dirty && !saved && <span className="text-[11px] text-slate-400 font-medium">No changes yet</span>}
        </div>
      </form>
    </div>
  );
}
