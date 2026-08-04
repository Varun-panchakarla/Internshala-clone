import React, { useMemo, useState } from 'react';
import {
  FiCalendar, FiPlus, FiEdit2, FiClock, FiUsers, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import {
  Card, SectionHeader, StatusPill, Avatar, EmptyState, Modal, Field, inputCls, toDatetimeLocal
} from './ui';
import Button from '../../../components/common/Button';

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay() || 7;
  x.setDate(x.getDate() - day + 1);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}

function ScheduleModal({ open, onClose, onSave, applications, jobs, initial }) {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [jobId, setJobId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [round, setRound] = useState('Technical Round');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!open) return;
    setCandidateEmail(initial?.email || (applications[0]?.email || ''));
    setJobId(initial?.jobId || (jobs[0]?.id || ''));
    setScheduledAt(toDatetimeLocal(initial?.scheduledAt) || '');
    setRound(initial?.round || 'Technical Round');
  }, [open, initial]);

  const submit = async (e) => {
    e.preventDefault();
    if (!candidateEmail || !jobId || !scheduledAt) return;
    setSaving(true);
    await onSave({
      candidateEmail,
      jobId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      round
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={initial ? 'Reschedule interview' : 'Schedule interview'} wide>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Candidate" required>
          <select className={inputCls} value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} disabled={!!initial}>
            {applications.length === 0 && <option value="">No applicants available</option>}
            {applications.map(a => (
              <option key={a.applicationId} value={a.email}>{a.name} ({a.email})</option>
            ))}
          </select>
        </Field>
        <Field label="Job" required>
          <select className={inputCls} value={jobId} onChange={e => setJobId(e.target.value)} disabled={!!initial}>
            {jobs.length === 0 && <option value="">No jobs</option>}
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date & time" required>
            <input type="datetime-local" className={inputCls} value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </Field>
          <Field label="Round">
            <select className={inputCls} value={round} onChange={e => setRound(e.target.value)}>
              {['Technical Round', 'HR Round', 'Managerial Round', 'Assignment Round'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" variant="primary" size="sm" className="flex-1" loading={saving}>
            {initial ? 'Save changes' : 'Schedule'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function InterviewsView({
  interviews,
  applications,
  jobs,
  onSchedule,
  onUpdate,
  loading,
  schedulePrefill,
  clearSchedulePrefill
}) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [dayFilter, setDayFilter] = useState('all');
  const [showSchedule, setShowSchedule] = useState(false);
  const [editing, setEditing] = useState(null);
  const [prefill, setPrefill] = useState(null);

  React.useEffect(() => {
    if (!schedulePrefill) return;
    setEditing(null);
    setPrefill(schedulePrefill);
    setShowSchedule(true);
    clearSchedulePrefill && clearSchedulePrefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedulePrefill]);

  const closeSchedule = () => {
    setShowSchedule(false);
    setEditing(null);
    setPrefill(null);
  };

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekLabel = useMemo(() => {
    const a = week[0];
    const b = week[6];
    const fmt = d => d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return a.getMonth() === b.getMonth() ? `${fmt(a)} – ${b.getFullYear()}` : `${fmt(a)} – ${fmt(b)}`;
  }, [week]);

  const grouped = useMemo(() => {
    const map = {};
    interviews.forEach(iv => {
      const k = iv.date || new Date(iv.scheduledAt).toISOString().slice(0, 10);
      (map[k] = map[k] || []).push(iv);
    });
    Object.keys(map).forEach(k => map[k].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
    return map;
  }, [interviews]);

  const visible = useMemo(() => {
    if (dayFilter === 'all') return interviews;
    return (grouped[dayFilter] || []);
  }, [interviews, grouped, dayFilter]);

  const today = dateKey(new Date());
  const upcomingCount = interviews.filter(iv => new Date(iv.scheduledAt) >= new Date() && iv.status === 'Scheduled').length;

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={FiCalendar}
        title="Interview Calendar"
        subtitle={`${upcomingCount} upcoming · schedule and manage interviews`}
        actions={
          <Button variant="primary" size="sm" className="text-[11px]" onClick={() => setShowSchedule(true)}>
            <FiPlus className="w-3.5 h-3.5 mr-1" /> Schedule interview
          </Button>
        }
      />

      <Card>
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <FiChevronLeft className="w-4 h-4" />
          </Button>
          <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{weekLabel}</p>
          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <FiChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {week.map(d => {
            const k = dateKey(d);
            const count = (grouped[k] || []).length;
            const isToday = k === today;
            const selected = dayFilter === k;
            return (
              <button
                key={k}
                onClick={() => setDayFilter(selected ? 'all' : k)}
                className={`text-center rounded-xl px-1 py-2 border transition-colors cursor-pointer ${
                  selected
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : isToday
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900/50 text-brand-700 dark:text-brand-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-300'
                }`}
              >
                <p className={`text-[9px] font-bold uppercase ${selected ? 'opacity-80' : 'text-slate-400'} `}>
                  {d.toLocaleDateString([], { weekday: 'short' })}
                </p>
                <p className="text-sm font-black leading-tight mt-0.5">{d.getDate()}</p>
                {count > 0 && (
                  <span className={`inline-block mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${selected ? 'bg-white/20' : 'bg-brand-600 text-white'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {loading ? (
        <Card className="text-center py-10 text-xs text-slate-400 font-semibold">Loading interviews...</Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={FiCalendar}
            title="No interviews here"
            subtitle="Schedule interviews with shortlisted candidates to see them on your calendar."
            action={
              <Button variant="primary" size="sm" className="text-[11px]" onClick={() => setShowSchedule(true)}>
                <FiPlus className="w-3.5 h-3.5 mr-1" /> Schedule interview
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {visible.map(iv => (
            <Card key={iv.id} padded={false} className="p-4 flex items-center gap-3">
              <Avatar name={iv.candidate} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-extrabold text-slate-800 dark:text-slate-100 truncate">{iv.candidate}</span>
                  <StatusPill status={iv.status} />
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">{iv.jobTitle} · {iv.email}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold mt-1 flex items-center gap-1">
                  <FiClock className="w-3.5 h-3.5" />
                  {new Date(iv.scheduledAt).toLocaleString([], {
                    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                  <span className="text-slate-400 font-semibold ml-1">· {iv.round}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => { setEditing(iv); setShowSchedule(true); }}
                  className="px-2.5 py-1 text-[10px] font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 rounded-lg border border-brand-100 dark:border-brand-900/40 hover:underline cursor-pointer"
                >
                  <FiEdit2 className="inline w-3 h-3 mr-0.5" /> Reschedule
                </button>
                <select
                  value={iv.status}
                  onChange={(e) => onUpdate(iv.id, { status: e.target.value })}
                  className="px-2 py-1 text-[10px] font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ScheduleModal
        open={showSchedule}
        onClose={closeSchedule}
        onSave={editing ? (data) => onUpdate(editing.id, { scheduledAt: data.scheduledAt, round: data.round }) : onSchedule}
        applications={applications}
        jobs={jobs}
        initial={editing || prefill}
      />
    </div>
  );
}
