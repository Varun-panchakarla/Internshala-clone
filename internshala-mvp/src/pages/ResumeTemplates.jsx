import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { TEMPLATES } from '../data/resumeTemplates';
import {
  FiCheckCircle, FiEye, FiArrowRight, FiStar,
  FiTrendingUp, FiShield, FiZap, FiAward, FiFileText, FiMenu, FiGrid, FiLayout, FiArrowLeft,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────────────────────────────────────
   MINI RESUME PREVIEW — CSS-only, looks like a tiny A4 of the template
───────────────────────────────────────────────────────────────────────────── */
const TemplateMiniPreview = ({ template, isSelected }) => {
  const { preview: p, id } = template;
  const isCreative  = id === 'creative';
  const isExecutive = id === 'executive' || id === 'corporate' || id === 'modern';
  const isMinimal   = id === 'minimal' || id === 'simple-ats';

  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        backgroundColor: '#ffffff',
        border: isSelected ? `2px solid ${p.accentBar}` : '1px solid #e2e8f0',
        borderRadius: '6px',
        overflow: 'hidden',
        fontFamily: p.bodyFont,
        position: 'relative',
        transition: 'all 0.3s ease',
        boxShadow: isSelected ? `0 0 0 3px ${p.accentBar}30` : '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Two-column layout for Creative ── */}
      {isCreative ? (
        <div style={{ display: 'flex', height: '100%' }}>
          {/* Sidebar */}
          <div style={{ width: '32%', backgroundColor: p.headerBg, padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 auto 6px' }} />
            {[70, 55, 65].map((w, i) => (
              <div key={i} style={{ height: '4px', width: `${w}%`, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '2px' }} />
            ))}
            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '6px 0' }} />
            {[60, 80, 50, 70].map((w, i) => (
              <div key={i} style={{ height: '3px', width: `${w}%`, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
            ))}
          </div>
          {/* Main */}
          <div style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ height: '8px', width: '70%', backgroundColor: p.sectionColor, borderRadius: '2px', opacity: 0.8 }} />
            <div style={{ height: '3px', width: '90%', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
            {[80, 60, 70, 50, 65, 75].map((w, i) => (
              <div key={i} style={{ height: '3px', width: `${w}%`, backgroundColor: '#c8c8c8', borderRadius: '2px' }} />
            ))}
          </div>
        </div>
      ) : (
        /* ── Single-column layout ── */
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Header block */}
          <div style={{
            backgroundColor: isExecutive ? p.headerBg : '#fff',
            padding: isExecutive ? '10px 14px' : '0 0 8px 0',
            margin: isExecutive ? '-12px -14px 8px' : '0',
            borderBottom: isMinimal ? 'none' : isExecutive ? 'none' : `2px solid ${p.accentBar}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
          }}>
            <div style={{ height: '9px', width: '55%', backgroundColor: isExecutive ? p.headerColor : p.headerColor, borderRadius: '2px', opacity: 0.85 }} />
            <div style={{ height: '3px', width: '80%', backgroundColor: isExecutive ? 'rgba(255,255,255,0.4)' : '#d1d5db', borderRadius: '2px', marginTop: '2px' }} />
            <div style={{ height: '3px', width: '60%', backgroundColor: isExecutive ? 'rgba(255,255,255,0.3)' : '#d1d5db', borderRadius: '2px' }} />
          </div>

          {/* Section rows */}
          {[
            { label: 60, lines: [85, 70] },
            { label: 65, lines: [90, 75, 60] },
            { label: 55, lines: [80, 70] },
          ].map((sec, si) => (
            <div key={si} style={{ marginBottom: '7px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                <div style={{ height: '4px', width: `${sec.label}%`, backgroundColor: p.sectionColor, borderRadius: '1px', opacity: 0.7 }} />
              </div>
              <div style={{ height: '1px', backgroundColor: p.accentBar, opacity: 0.4, marginBottom: '3px' }} />
              {sec.lines.map((w, li) => (
                <div key={li} style={{ height: '3px', width: `${w}%`, backgroundColor: '#d1d5db', borderRadius: '2px', marginBottom: '2px' }} />
              ))}
            </div>
          ))}

          {/* Skills chips row */}
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '2px' }}>
            {[28, 22, 30, 25, 20].map((w, i) => (
              <div key={i} style={{
                height: '8px', width: `${w}px`,
                backgroundColor: p.chipBg,
                border: `1px solid ${p.chipBd}`,
                borderRadius: '3px',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Selected overlay checkmark */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: '6px', right: '6px',
          backgroundColor: p.accentBar,
          borderRadius: '50%', width: '20px', height: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FiCheckCircle style={{ color: '#fff', width: '12px', height: '12px' }} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   TEMPLATE CARD
───────────────────────────────────────────────────────────────────────────── */
const TemplateCard = ({ template, isSelected, onSelect, onPreview }) => {
  const { preview: p } = template;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex flex-col rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-brand-500 shadow-xl shadow-brand-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
      }`}
      style={{ transform: hovered ? 'translateY(-4px)' : 'none' }}
    >
      {/* Preview Area */}
      <div className="p-4 bg-slate-50 relative">
        <TemplateMiniPreview template={template} isSelected={isSelected} />

        {/* Hover overlay with action buttons */}
        <div className={`absolute inset-4 rounded-md flex items-center justify-center gap-3 transition-all duration-200 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`} style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
            className="flex items-center gap-1.5 bg-white text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-slate-50 transition-all"
          >
            <FiEye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(template.id); }}
            className="flex items-center gap-1.5 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-all"
            style={{ backgroundColor: p.accentBar === '#ffffff' || p.accentBar === '#e2e8f0' ? '#334155' : p.accentBar }}
          >
            <FiArrowRight className="w-3.5 h-3.5" /> Use This
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 bg-white flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">{template.name}</h3>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{template.category}</span>
          </div>
          {isSelected && (
            <span className="shrink-0 flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
              <FiCheckCircle className="w-3 h-3" /> Active
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">{template.description}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {template.isATS && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <FiShield className="w-2.5 h-2.5" /> ATS Friendly
            </span>
          )}
          {!template.isATS && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              <FiZap className="w-2.5 h-2.5" /> Visual
            </span>
          )}
          {template.isPopular && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full">
              <FiStar className="w-2.5 h-2.5" /> Popular
            </span>
          )}
          {template.isTrending && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              <FiTrendingUp className="w-2.5 h-2.5" /> Trending
            </span>
          )}
          {template.isBestATS && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
              <FiAward className="w-2.5 h-2.5" /> Best ATS Score
            </span>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onSelect(template.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isSelected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'
            }`}
          >
            {isSelected ? '✓ Selected' : 'Use Template'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   PREVIEW MODAL
───────────────────────────────────────────────────────────────────────────── */
const PreviewModal = ({ template, onClose, onSelect }) => {
  if (!template) return null;
  const { preview: p } = template;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}
      style={{ backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-800">{template.name}</h2>
            <p className="text-xs text-slate-400">{template.category} Template</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-lg font-bold">×</button>
        </div>

        {/* Large preview */}
        <div className="p-6 bg-slate-50">
          <div style={{ transform: 'scale(1.2)', transformOrigin: 'top center', marginBottom: '40px' }}>
            <TemplateMiniPreview template={template} isSelected={false} />
          </div>
        </div>

        {/* Info + actions */}
        <div className="px-6 py-4 flex flex-col gap-3">
          <p className="text-sm text-slate-600">{template.description}</p>
          <div className="flex flex-wrap gap-2">
            {template.isATS && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                <FiShield className="w-3 h-3" /> ATS Friendly
              </span>
            )}
            {template.tags?.map(tag => (
              <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{tag}</span>
            ))}
          </div>
          <div className="flex gap-3 mt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
              Close
            </button>
            <button
              onClick={() => { onSelect(template.id); onClose(); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: p.accentBar === '#ffffff' || p.accentBar === '#e2e8f0' || p.accentBar === '#9ca3af' ? '#334155' : p.accentBar }}
            >
              Use This Template →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
const CATEGORIES = ['All', 'Classic', 'Modern', 'Minimal', 'Executive', 'Creative', 'Entry Level', 'ATS Optimized', 'Corporate'];

const ResumeTemplates = () => {
  const { selectedTemplate, setSelectedTemplate } = useResume();
  const navigate = useNavigate();
  const [filter, setFilter]         = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [justSelected, setJustSelected]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = filter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === filter);

  const handleSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setJustSelected(templateId);
    setTimeout(() => {
      navigate('/resume');
    }, 600);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden fixed inset-0 z-50 animate-slide-up">
      {/* Collapsible Sidebar */}
      <div className={`flex flex-col bg-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} shrink-0 z-50`}>
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <FiMenu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap text-sm text-slate-300" title="Dashboard">
            <FiGrid className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link to="/resume" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap text-sm text-slate-300" title="Resume Builder">
            <FiFileText className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Resume Builder</span>}
          </Link>
          <Link to="/resume-templates" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-600/20 text-brand-400 font-medium transition-colors whitespace-nowrap text-sm" title="Templates">
            <FiLayout className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Templates</span>}
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 custom-scrollbar">
        <div className="max-w-screen-xl mx-auto w-full">
          {/* ── Page Header ─────────────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl mb-8"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)' }} />
            <div className="relative px-8 py-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
                <FiFileText className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-bold text-white/80 tracking-wider uppercase">Resume Templates</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
                Choose Your Perfect Template
              </h1>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                Pick a professionally designed template. Your resume data is saved and transfers automatically — switch anytime without losing a word.
              </p>
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{TEMPLATES.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Templates</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{TEMPLATES.filter(t => t.isATS).length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">ATS Friendly</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">Free</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">All Access</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Currently selected notice ────────────────────────────────────── */}
          {selectedTemplate && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 mb-6">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-bold text-emerald-800">
                  Active Template: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                </span>
                <span className="text-xs text-emerald-600 ml-2">— Your resume data is safe when you switch.</span>
              </div>
              <button
                onClick={() => navigate('/resume')}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Open Builder →
              </button>
            </div>
          )}

          {/* ── Category Filter Tabs ─────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-7">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  filter === cat
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Template Grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((template) => (
              <div
                key={template.id}
                className={`transition-all duration-500 ${
                  justSelected === template.id ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
                }`}
              >
                <TemplateCard
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={handleSelect}
                  onPreview={setPreviewTemplate}
                />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <FiFileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No templates found in this category.</p>
            </div>
          )}

          {/* ── Preview Modal ─────────────────────────────────────────────────── */}
          {previewTemplate && (
            <PreviewModal
              template={previewTemplate}
              onClose={() => setPreviewTemplate(null)}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplates;
