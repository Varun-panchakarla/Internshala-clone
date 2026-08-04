import React, { useMemo, useState } from 'react';
import {
  FiBriefcase, FiPlus, FiSearch, FiEdit2, FiTrash2, FiUsers, FiMapPin,
  FiClock, FiX
} from 'react-icons/fi';
import {
  Card, SectionHeader, SearchInput, FilterSelect, StatusPill, EmptyState, Modal, Field, inputCls, textareaCls
} from './ui';
import Button from '../../../components/common/Button';

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const EMPTY_FORM = {
  title: '', location: '', salaryRange: '', experienceRequired: '',
  employmentType: 'Full-time', skills: '', description: '', lastDateToApply: ''
};

function JobForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Job title" required>
        <input className={inputCls} value={form.title} onChange={set('title')} placeholder="e.g. Frontend Developer" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Location" required>
          <input className={inputCls} value={form.location} onChange={set('location')} placeholder="e.g. Remote / Bengaluru" />
        </Field>
        <Field label="Employment type">
          <select className={inputCls} value={form.employmentType} onChange={set('employmentType')}>
            {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Salary">
          <input className={inputCls} value={form.salaryRange} onChange={set('salaryRange')} placeholder="e.g. ₹8-12 LPA" />
        </Field>
        <Field label="Experience required">
          <input className={inputCls} value={form.experienceRequired} onChange={set('experienceRequired')} placeholder="e.g. 2+ years / Fresher" />
        </Field>
      </div>
      <Field label="Last date to apply">
        <input type="date" className={inputCls} value={form.lastDateToApply} onChange={set('lastDateToApply')} />
      </Field>
      <Field label="Skills (comma separated)">
        <input className={inputCls} value={form.skills} onChange={set('skills')} placeholder="e.g. React, Node.js, SQL" />
      </Field>
      <Field label="Job description">
        <textarea className={textareaCls} rows={4} value={form.description} onChange={set('description')} placeholder="Describe the role, responsibilities and what you're looking for..." />
      </Field>
      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="primary" size="sm" className="flex-1" loading={submitting}>
          {initial ? 'Save changes' : 'Post job'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function JobsView({
  jobs,
  onPostJob,
  onUpdateJob,
  onToggleJob,
  onDeleteJob,
  getApplicantsForJob,
  onViewApplicant,
  postRequest,
  clearPostRequest
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPost, setShowPost] = useState(false);
  const [editing, setEditing] = useState(null);
  const [applicants, setApplicants] = useState(null);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (!postRequest) return;
    setEditing(null);
    setShowPost(true);
    clearPostRequest && clearPostRequest();
  }, [postRequest]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return jobs.filter(j => {
      if (statusFilter !== 'all' && j.status !== statusFilter) return false;
      if (q && !`${j.title} ${j.type} ${j.location} ${j.skills || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [jobs, query, statusFilter]);

  const openApplicants = async (job) => {
    setLoadingApplicants(true);
    setApplicants(null);
    const res = await getApplicantsForJob(job.id);
    setApplicants({ job, list: res?.applicants || [] });
    setLoadingApplicants(false);
  };

  const handleSubmit = async (form) => {
    setSubmitting(true);
    if (editing) {
      await onUpdateJob(editing.id, form);
      setEditing(null);
    } else {
      await onPostJob(form);
      setShowPost(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={FiBriefcase}
        title="Your Job Postings"
        subtitle={`${jobs.length} total · manage openings and applicants`}
        actions={
          <Button variant="primary" size="sm" className="text-[11px]" onClick={() => setShowPost(true)}>
            <FiPlus className="w-3.5 h-3.5 mr-1" /> Post a job
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Search jobs, skills, or locations..." className="flex-1" />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Closed', label: 'Closed' },
              { value: 'Expired', label: 'Expired' }
            ]}
            className="sm:w-44"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FiBriefcase}
            title="No job postings"
            subtitle="Post your first opening and start receiving applications."
            action={
              <Button variant="primary" size="sm" className="text-[11px]" onClick={() => setShowPost(true)}>
                <FiPlus className="w-3.5 h-3.5 mr-1" /> Post a job
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(job => (
            <Card key={job.id} padded={false} className="p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate">{job.title}</h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {job.type} · <FiMapPin className="inline w-3 h-3" /> {job.location}
                  </p>
                </div>
                <StatusPill status={job.status} />
              </div>

              <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" /> {job.applicants} applicants</span>
                <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {job.date}</span>
                {job.salary && job.salary !== 'Undisclosed' && <span className="truncate">{job.salary}</span>}
              </div>

              {job.skills && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {job.skills.split(',').slice(0, 4).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
                      {s.trim()}
                    </span>
                  ))}
                  {job.skills.split(',').length > 4 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                      +{job.skills.split(',').length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1.5 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openApplicants(job)}
                  className="px-2.5 py-1.5 text-[10px] font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 rounded-lg border border-brand-100 dark:border-brand-900/40 hover:underline cursor-pointer"
                >
                  View applicants
                </button>
                <button
                  onClick={() => { setEditing(job); setShowPost(true); }}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                  title="Edit job"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onToggleJob(job.id, job.status !== 'Active')}
                  className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer ${
                    job.status === 'Active'
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
                      : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40'
                  }`}
                  title={job.status === 'Active' ? 'Close job' : 'Reopen job'}
                >
                  {job.status === 'Active' ? 'Close' : 'Reopen'}
                </button>
                <button
                  onClick={() => onDeleteJob(job.id)}
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer ml-auto"
                  title="Delete job"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showPost} onClose={() => { setShowPost(false); setEditing(null); }} title={editing ? 'Edit job posting' : 'Post a new job'} wide>
        <JobForm
          initial={editing ? {
            title: editing.title, location: editing.location, salaryRange: editing.salary,
            experienceRequired: editing.experience, employmentType: editing.type,
            skills: editing.skills, description: editing.description, lastDateToApply: editing.lastDateToApply || ''
          } : null}
          onSubmit={handleSubmit}
          onCancel={() => { setShowPost(false); setEditing(null); }}
          submitting={submitting}
        />
      </Modal>

      <Modal isOpen={!!applicants || loadingApplicants} onClose={() => setApplicants(null)} title={applicants ? `Applicants · ${applicants.job.title}` : 'Loading applicants...'} wide>
        {loadingApplicants ? (
          <div className="text-center py-8 text-xs text-slate-400 font-semibold">Loading applicants...</div>
        ) : applicants?.list.length === 0 ? (
          <EmptyState icon={FiUsers} title="No applicants yet" subtitle="Share this job to start receiving applications." />
        ) : (
          <div className="space-y-2">
            {applicants.list.map(app => (
              <button
                key={app.applicationId}
                onClick={() => onViewApplicant(app)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-700 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {String(app.name).split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{app.name}</p>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{app.email} · {app.timeAgo}</p>
                </div>
                <StatusPill status={app.status} />
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
