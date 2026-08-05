import React, { useMemo } from 'react';
import { FiBarChart2, FiTrendingUp, FiLayers } from 'react-icons/fi';
import { Card, SectionHeader, EmptyState } from './ui';

function BarChart({ data, height = 160, color = 'var(--brand-600, #0ea5e9)' }) {
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">
              {d.count}
            </span>
            <div
              className="w-full max-w-[28px] rounded-t-md bg-brand-500 dark:bg-brand-400 transition-all group-hover:bg-brand-600 dark:group-hover:bg-brand-300"
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
              title={`${d.label}: ${d.count}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1 mt-1.5">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[8px] font-bold text-slate-400 truncate">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

function HBar({ label, count, max, colorClass }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="font-bold text-slate-600 dark:text-slate-300 truncate">{label}</span>
        <span className="font-black text-slate-800 dark:text-white ml-2">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsView({ analytics, loading }) {
  const pipeline = useMemo(() => {
    if (!analytics?.hiringPipeline) return [];
    const colors = ['bg-slate-400', 'bg-brand-500', 'bg-sky-500', 'bg-violet-500', 'bg-rose-500'];
    const max = Math.max(1, ...analytics.hiringPipeline.map(p => p.count));
    return analytics.hiringPipeline.map((p, i) => ({ ...p, colorClass: colors[i] || 'bg-brand-500', max }));
  }, [analytics]);

  if (loading) {
    return <Card className="text-center py-10 text-xs text-slate-400 font-semibold">Loading analytics...</Card>;
  }

  if (!analytics || analytics.dailyTrend?.every(d => d.count === 0) && analytics.jobWiseApplicants?.length === 0) {
    return (
      <Card>
        <SectionHeader icon={FiBarChart2} title="Recruiting Analytics" subtitle="How your hiring is performing" />
        <EmptyState icon={FiTrendingUp} title="Not enough data yet" subtitle="Post jobs and receive applications to unlock insights." />
      </Card>
    );
  }

  const totalApplicants = analytics.jobWiseApplicants?.reduce((a, b) => a + b.count, 0) || 0;
  const pipelineTotal = pipeline.reduce((a, b) => a + b.count, 0) || 0;

  return (
    <div className="space-y-4">
      <SectionHeader icon={FiBarChart2} title="Recruiting Analytics" subtitle="Job performance, trends and your hiring funnel" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 mb-4">Applications · last 30 days</p>
          {analytics.dailyTrend?.length ? (
            <BarChart data={analytics.dailyTrend} height={170} />
          ) : (
            <EmptyState icon={FiTrendingUp} title="No daily data" />
          )}
        </Card>

        <Card>
          <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 mb-4">Jobs posted · this year</p>
          {analytics.monthlyTrend?.length ? (
            <BarChart data={analytics.monthlyTrend} height={170} color="var(--brand-500, #8b5cf6)" />
          ) : (
            <EmptyState icon={FiTrendingUp} title="No monthly data" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">Applicants by job</p>
            <span className="text-[10px] font-black text-brand-600 dark:text-brand-400">{totalApplicants} total</span>
          </div>
          {analytics.jobWiseApplicants?.length ? (
            <div className="space-y-3">
              {analytics.jobWiseApplicants.map((j, i) => (
                <HBar key={i} label={j.title} count={j.count} max={Math.max(1, ...analytics.jobWiseApplicants.map(x => x.count))} colorClass="bg-brand-500" />
              ))}
            </div>
          ) : (
            <EmptyState icon={FiLayers} title="No applicants by job" />
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">Hiring pipeline</p>
            <span className="text-[10px] font-black text-brand-600 dark:text-brand-400">{pipelineTotal} candidates</span>
          </div>
          {pipeline.length ? (
            <div className="space-y-3">
              {pipeline.map((p, i) => (
                <HBar key={i} label={p.stage} count={p.count} max={p.max} colorClass={p.colorClass} />
              ))}
            </div>
          ) : (
            <EmptyState icon={FiLayers} title="No pipeline data" />
          )}
        </Card>
      </div>
    </div>
  );
}
