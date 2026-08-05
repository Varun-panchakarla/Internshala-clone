import React from 'react';
import {
  FiBriefcase, FiUsers, FiCheckCircle, FiCalendar, FiBell, FiArrowRight, FiPlus
} from 'react-icons/fi';
import { Card, KpiCard, StatusPill, Avatar, EmptyState, timeAgo } from './ui';
import Button from '../../../components/common/Button';

function formatScheduled(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function OverviewView({
  metrics,
  recentApplications,
  interviews,
  notifications,
  loading,
  onGoTo,
  onViewApplication,
  onScheduleInterview,
  onMarkNotificationsRead
}) {
  const upcoming = (interviews || [])
    .filter(iv => new Date(iv.scheduledAt) >= new Date() && iv.status === 'Scheduled')
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 5);
  const unread = (notifications || []).filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Welcome back</h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Here's what's happening with your hiring today.</p>
        </div>
        <Button variant="primary" size="sm" className="text-[11px]" onClick={() => onGoTo('jobs', { post: true })}>
          <FiPlus className="w-3.5 h-3.5 mr-1" /> Post a job
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Active jobs" value={metrics?.activeJobs ?? '—'} trend={metrics?.trends?.activeJobsTrend} icon={FiBriefcase} accent="sky" />
        <KpiCard label="Total applicants" value={metrics?.totalApplicants ?? '—'} trend={metrics?.trends?.totalApplicantsTrend} icon={FiUsers} accent="emerald" />
        <KpiCard label="Shortlisted" value={metrics?.shortlistedMatches ?? '—'} trend={metrics?.trends?.shortlistedMatchesTrend} icon={FiCheckCircle} accent="indigo" />
        <KpiCard label="Interviews today" value={metrics?.todayInterviews ?? '—'} trend={metrics?.trends?.todayInterviewsTrend} icon={FiCalendar} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <Card padded={false}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Recent applications</p>
              <button onClick={() => onGoTo('applications')} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer">
                View all <FiArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="px-5 pb-5">
              {loading ? (
                <p className="text-center text-xs text-slate-400 font-semibold py-8">Loading...</p>
              ) : recentApplications.length === 0 ? (
                <EmptyState icon={FiUsers} title="No applications yet" subtitle="New applicants will show up here as they apply." />
              ) : (
                <div className="space-y-1">
                  {recentApplications.map(app => (
                    <button
                      key={app.applicationId}
                      onClick={() => onViewApplication(app)}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <Avatar name={app.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{app.name}</p>
                          <span className="text-[10px] text-slate-400 font-semibold shrink-0">{app.time || app.timeAgo}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{app.role}</p>
                      </div>
                      <StatusPill status={app.status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card padded={false}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Upcoming interviews</p>
              <button onClick={() => onGoTo('interviews')} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer">
                Open calendar <FiArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="px-5 pb-5">
              {loading ? (
                <p className="text-center text-xs text-slate-400 font-semibold py-8">Loading...</p>
              ) : upcoming.length === 0 ? (
                <EmptyState
                  icon={FiCalendar}
                  title="No upcoming interviews"
                  subtitle="Schedule interviews with shortlisted candidates."
                  action={
                    <Button variant="primary" size="sm" className="text-[11px]" onClick={() => onGoTo('interviews')}>
                      <FiCalendar className="w-3.5 h-3.5 mr-1" /> Schedule
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-1">
                  {upcoming.map(iv => (
                    <button
                      key={iv.id}
                      onClick={() => onGoTo('interviews')}
                      className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                        <FiCalendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{iv.candidate} · {iv.round}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{iv.jobTitle} · {formatScheduled(iv.scheduledAt)}</p>
                      </div>
                      <StatusPill status={iv.status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card padded={false}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <FiBell className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                Notifications
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">{unread}</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {unread > 0 && onMarkNotificationsRead && (
                  <button
                    onClick={onMarkNotificationsRead}
                    className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => onGoTo('notifications')} className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer">
                  View all
                </button>
              </div>
            </div>
            <div className="px-5 pb-5">
              {loading ? (
                <p className="text-center text-xs text-slate-400 font-semibold py-6">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="text-center text-xs text-slate-400 font-medium py-8">You're all caught up.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n.id} className={`flex gap-2.5 ${!n.read ? '' : 'opacity-60'}`}>
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!n.read ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">{n.message}</p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {metrics && typeof onScheduleInterview === 'function' && (
            <Card className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
              <FiCalendar className="w-8 h-8 text-white/40 mb-3" />
              <p className="text-sm font-black">Move candidates forward</p>
              <p className="text-[11px] text-brand-100 font-medium mt-1 leading-relaxed">
                Shortlist strong applicants and schedule interviews to keep your pipeline moving.
              </p>
              <button
                onClick={() => onGoTo('applications')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-white text-brand-700 text-[10px] font-extrabold hover:bg-brand-50 transition-colors cursor-pointer"
              >
                Review applications
              </button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
