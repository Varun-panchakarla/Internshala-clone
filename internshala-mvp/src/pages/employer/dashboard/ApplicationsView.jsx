import React, { useMemo, useState } from 'react';
import {
  FiUsers, FiMail, FiFileText, FiCalendar, FiSearch, FiDownload,
  FiEye, FiX, FiPhone, FiMapPin, FiBriefcase, FiBookOpen, FiAward
} from 'react-icons/fi';
import {
  Card, SectionHeader, SearchInput, FilterSelect, StatusPill, Avatar, EmptyState, IconBtn, timeAgo
} from './ui';
import Button from '../../../components/common/Button';

const STATUS_OPTIONS = ['Pending', 'Shortlisted', 'Interview', 'Offer', 'Rejected'];

function CandidateDrawer({ candidate, onClose, onStatusChange, onScheduleInterview, onMessage, getResume, downloadResume, previewResume }) {
  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const loadResume = async () => {
    if (resume) return;
    setResumeLoading(true);
    const r = await getResume(candidate);
    setResume(r);
    setResumeLoading(false);
  };

  if (!candidate) return null;
  const previewable = resume?.fileType && /pdf|image/.test(resume.fileType);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in" onMouseDown={onClose}>
      <div
        className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-up"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Avatar name={candidate.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">{candidate.name}</h3>
            <p className="text-[11px] text-slate-400 font-medium truncate">{candidate.email}</p>
          </div>
          <IconBtn onClick={onClose} title="Close"><FiX className="w-4 h-4" /></IconBtn>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusPill status={candidate.status} />
            <span className="text-[11px] text-slate-400 font-semibold">Applied {candidate.timeAgo || timeAgo(candidate.appliedAt)}</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <InfoRow icon={<FiBriefcase />} label="Applied for" value={candidate.role} />
            <InfoRow icon={<FiPhone />} label="Phone" value={candidate.phone} />
            <InfoRow icon={<FiMapPin />} label="Location" value={candidate.location} />
            <InfoRow icon={<FiAward />} label="Experience" value={candidate.experience} />
            <InfoRow icon={<FiBookOpen />} label="Education" value={candidate.education} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {String(candidate.skills || '')
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
                .map((s, i) => (
                  <span key={i} className="px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/40 rounded-lg">
                    {s}
                  </span>
                ))}
              {!candidate.skills && <span className="text-[11px] text-slate-400">Not specified</span>}
            </div>
          </div>

          {candidate.hasResume && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Resume</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-[11px]" onClick={loadResume} loading={resumeLoading}>
                  <FiEye className="w-3.5 h-3.5 mr-1" /> Preview
                </Button>
                <Button variant="outline" size="sm" className="text-[11px]" onClick={() => downloadResume(candidate)}>
                  <FiDownload className="w-3.5 h-3.5 mr-1" /> Download
                </Button>
              </div>
              {resume && resume.error && (
                <p className="text-[11px] text-rose-500 font-medium mt-2">{resume.error}</p>
              )}
              {resume?.fileData && previewable && (
                <iframe
                  title="resume-preview"
                  src={String(resume.fileData).startsWith('data:') ? resume.fileData : `data:${resume.fileType};base64,${resume.fileData}`}
                  className="w-full h-64 mt-2 rounded-xl border border-slate-200 dark:border-slate-800"
                />
              )}
              {resume?.fileData && !previewable && (
                <p className="text-[11px] text-slate-400 mt-2">This file type can't be previewed — use Download.</p>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Update stage</span>
              <select
                value={candidate.status}
                onChange={(e) => onStatusChange(candidate.applicationId, e.target.value)}
                className="px-2.5 py-1.5 text-[11px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-lg focus:outline-none cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" className="text-[11px] flex-1" onClick={() => onScheduleInterview(candidate)}>
                <FiCalendar className="w-3.5 h-3.5 mr-1" /> Schedule Interview
              </Button>
              <Button variant="outline" size="sm" className="text-[11px] flex-1" onClick={() => onMessage(candidate)}>
                <FiMail className="w-3.5 h-3.5 mr-1" /> Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className="text-slate-400">{icon}</span>
      <span className="text-slate-400 font-medium w-24 shrink-0">{label}</span>
      <span className="text-slate-700 dark:text-slate-200 font-semibold min-w-0 truncate">{value || '—'}</span>
    </div>
  );
}

export default function ApplicationsView({
  applications,
  jobs,
  onStatusChange,
  onScheduleInterview,
  onMessage,
  getResume,
  previewResume,
  downloadResume,
  focusApplication,
  clearFocus
}) {
  const [query, setQuery] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [candidate, setCandidate] = useState(null);

  React.useEffect(() => {
    if (!focusApplication) return;
    setCandidate(focusApplication);
    clearFocus && clearFocus();
  }, [focusApplication]);

  const jobOptions = useMemo(() => [
    { value: 'all', label: 'All jobs' },
    ...jobs.map(j => ({ value: j.id, label: j.title }))
  ], [jobs]);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All stages' },
    ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))
  ], []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return applications.filter(app => {
      if (jobFilter !== 'all' && app.jobId !== jobFilter) return false;
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (q && !`${app.name || ''} ${app.email || ''} ${app.role || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [applications, query, jobFilter, statusFilter]);

  const counts = useMemo(() => {
    const c = { Pending: 0, Shortlisted: 0, Interview: 0, Offer: 0, Rejected: 0 };
    applications.forEach(a => { if (c[a.status] !== undefined) c[a.status] += 1; });
    return c;
  }, [applications]);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={FiUsers}
        title="Candidate Applications"
        subtitle={`${applications.length} total · manage every stage from here`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer ${
                    statusFilter === s
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-400'
                  }`}
                >
                  {s} <span className="opacity-70">{counts[s]}</span>
                </button>
              ))}
            </div>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name, email, or job..." className="flex-1" />
          <FilterSelect value={jobFilter} onChange={setJobFilter} options={jobOptions} className="sm:w-52" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FiFileText}
            title="No applications found"
            subtitle="Try a different search or filter, or wait for new applicants."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(app => (
            <Card key={app.applicationId} padded={false} className="p-4 flex items-start gap-3">
              <Avatar name={app.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate">{app.name}</span>
                  <StatusPill status={app.status} />
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">{app.email}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold truncate mt-0.5">
                  <FiBriefcase className="inline w-3 h-3 mr-1 opacity-60" />
                  {app.role}
                  <span className="text-slate-300 dark:text-slate-600 ml-2">· {app.timeAgo || timeAgo(app.appliedAt)}</span>
                </p>
                {app.experience && app.experience !== 'Fresher' && (
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{app.experience} experience</p>
                )}

                <div className="mt-3 flex items-center gap-1.5">
                  <button
                    onClick={() => setCandidate(app)}
                    className="px-2.5 py-1 text-[10px] font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 rounded-lg border border-brand-100 dark:border-brand-900/40 hover:underline cursor-pointer"
                  >
                    View Profile
                  </button>
                  {app.hasResume && (
                    <button
                      onClick={() => downloadResume(app)}
                      className="px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:underline cursor-pointer"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={() => onMessage(app)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="Message candidate"
                  >
                    <FiMail className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onScheduleInterview(app)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="Schedule interview"
                  >
                    <FiCalendar className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="shrink-0">
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app.applicationId, e.target.value)}
                  className="px-2 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-lg focus:outline-none cursor-pointer"
                  title="Change stage"
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CandidateDrawer
        candidate={candidate}
        onClose={() => setCandidate(null)}
        onStatusChange={onStatusChange}
        onScheduleInterview={onScheduleInterview}
        onMessage={onMessage}
        getResume={getResume}
        previewResume={previewResume}
        downloadResume={downloadResume}
      />
    </div>
  );
}
