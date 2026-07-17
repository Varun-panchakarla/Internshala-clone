/**
 * ResumeBuilder.jsx
 * Massively redesigned Canva-style Resume Builder.
 * Features:
 *  - 50/50 Split Screen Layout
 *  - Extended Form Fields (DOB, Gender, Photo, 10th/12th Academics)
 *  - New Sections: Achievements, Languages, Interests
 *  - Live ATS-friendly A4 Preview
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../components/common/Toast';
import { TEMPLATES, getTemplateById } from '../data/resumeTemplates';
import {
  FiSave, FiDownload, FiPlus, FiTrash, FiAward,
  FiAlertCircle, FiChevronRight, FiBriefcase, FiBookOpen,
  FiUser, FiCode, FiFileText, FiCheckSquare, FiLink,
  FiLayout, FiZap, FiShield, FiEye, FiMenu, FiGrid,
  FiMapPin, FiCalendar, FiGlobe, FiImage, FiList, FiMessageCircle, FiHeart
} from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';
import { toPng } from 'html-to-image';
import { jsPDF as JsPDF } from 'jspdf';

/* ─── A4 canvas width ── */
const A4W = 794;
const toHref = (u) => (!u ? '#' : /^https?:\/\//i.test(u) ? u : `https://${u}`);

/* ═════════════════════════════════════════════════════════════════════════
   TEMPLATE RENDERERS
══════════════════════════════════════════════════════════════════════════ */

const Bullet = ({ text, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '3px' }}>
    <span style={{ color, fontSize: '9px', marginTop: '3px', flexShrink: 0 }}>▸</span>
    <span style={{ fontSize: '10.5px', color: '#374151', lineHeight: '1.6' }}>{text}</span>
  </div>
);

const TemplateSection = ({ title, SH, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={SH}>{title}</div>
    {children}
  </div>
);

const EduRow = ({ edu, dark, mid, light }) => {
  let title = edu.institution;
  let subtitle = [edu.degree, edu.branch].filter(Boolean).join(', ');
  if (edu.type === '10th') {
    title = edu.institution || 'High School (10th)';
    subtitle = edu.board || 'Board of Education';
  } else if (edu.type === '12th') {
    title = edu.institution || 'Senior Secondary (12th / Diploma)';
    subtitle = [edu.board, edu.degree].filter(Boolean).join(', ');
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '7px' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '11.5px', color: dark }}>{title}</div>
        <div style={{ fontSize: '10.5px', color: mid, marginTop: '1px' }}>
          {subtitle}
          {edu.cgpa && <span style={{ color: light, marginLeft: '10px' }}>{edu.cgpa.includes('%') ? 'Score' : 'CGPA'}: {edu.cgpa}</span>}
        </div>
      </div>
      {(edu.startYear || edu.endYear) && (
        <span style={{ fontSize: '10.5px', fontWeight: 600, color: mid, flexShrink: 0, marginLeft: '20px' }}>
          {[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}
        </span>
      )}
    </div>
  );
};

const ExpRow = ({ item, dark, mid, accent, last }) => (
  <div style={{ marginBottom: last ? 0 : '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '11.5px', color: dark }}>{item.role || 'Role'}</div>
        <div style={{ fontSize: '10.5px', color: mid, fontStyle: 'italic', marginTop: '1px' }}>{item.company}</div>
      </div>
      {item.duration && <span style={{ fontSize: '10px', fontWeight: 600, color: mid, flexShrink: 0, marginLeft: '16px' }}>{item.duration}</span>}
    </div>
    {item.description && <p style={{ fontSize: '10.5px', color: mid, lineHeight: 1.65, margin: '4px 0 0', whiteSpace: 'pre-line' }}>{item.description}</p>}
  </div>
);

const ProjectRow = ({ proj, accent, last }) => (
  <div style={{ marginBottom: last ? 0 : '11px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
      <span style={{ fontWeight: 700, fontSize: '11.5px', color: '#111827' }}>{proj.title}</span>
      {proj.technologies && <span style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic' }}>{proj.technologies}</span>}
    </div>
    {proj.description && <p style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.65, margin: '3px 0', whiteSpace: 'pre-line' }}>{proj.description}</p>}
    {(proj.githubLink || proj.liveDemo || proj.portfolio) && (
      <div style={{ display: 'flex', gap: '16px', fontSize: '10px', marginTop: '3px' }}>
        {proj.githubLink && <a href={toHref(proj.githubLink)} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline', fontWeight: 600 }}>GitHub ↗</a>}
        {proj.liveDemo && <a href={toHref(proj.liveDemo)} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline', fontWeight: 600 }}>Live Demo ↗</a>}
      </div>
    )}
  </div>
);

const CertRow = ({ cert, accent, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: last ? 0 : '7px' }}>
    <div style={{ flex: 1 }}>
      {cert.link
        ? <a href={toHref(cert.link)} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: '11px', color: accent, textDecoration: 'underline', textUnderlineOffset: '2px' }}>{cert.name}</a>
        : <span style={{ fontWeight: 700, fontSize: '11px', color: '#111827' }}>{cert.name}</span>
      }
      {cert.organization && <span style={{ color: '#6b7280', fontSize: '10px', marginLeft: '8px' }}>— {cert.organization}</span>}
      {cert.link && <span style={{ color: '#6b7280', fontSize: '10px', marginLeft: '8px', display: 'block' }}><a href={toHref(cert.link)} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'none' }}>{cert.link}</a></span>}
    </div>
    {cert.year && <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827', flexShrink: 0, marginLeft: '20px' }}>{cert.year}</span>}
  </div>
);

/* ── Professional Template ── */
const ProfessionalTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const SH = {
    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#0d0d0d', letterSpacing: '0.14em',
    borderBottom: '1px solid #b0b0b0', paddingBottom: '3px', marginBottom: '7px',
  };
  const contacts = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio].filter(Boolean);
  const extraDetails = [pi.dob && `DOB: ${pi.dob}`].filter(Boolean);

  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '11.5px', color: '#0d0d0d', lineHeight: 1.5 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: pi.photo ? 'space-between' : 'center', marginBottom: '14px', textAlign: pi.photo ? 'left' : 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.15, fontFamily: '"Arial", sans-serif' }}>
            {pi.fullName || 'YOUR FULL NAME'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: pi.photo ? 'flex-start' : 'center', gap: '2px 0', fontSize: '10px', color: '#2d2d2d', fontFamily: '"Arial", sans-serif', marginTop: '6px' }}>
            {contacts.map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {i > 0 && <span style={{ margin: '0 6px', color: '#b0b0b0' }}>|</span>}<span>{c}</span>
              </span>
            ))}
          </div>
          {extraDetails.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: pi.photo ? 'flex-start' : 'center', gap: '2px 0', fontSize: '10px', color: '#5a5a5a', fontFamily: '"Arial", sans-serif', marginTop: '3px' }}>
              {extraDetails.map((c, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {i > 0 && <span style={{ margin: '0 6px', color: '#b0b0b0' }}>|</span>}<span>{c}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {pi.photo && (
          <div style={{ marginLeft: '20px' }}>
            <img src={pi.photo} alt="Profile" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
        )}
      </div>
      {!pi.photo && <div style={{ height: '1px', backgroundColor: '#0d0d0d', margin: '7px 0 10px' }} />}
      
      {pi.summary && <TemplateSection title="Professional Summary" SH={SH}><p style={{ fontSize: '11px', color: '#2d2d2d', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>{pi.summary}</p></TemplateSection>}
      
      {resume.education?.length > 0 && (
        <TemplateSection title="Education" SH={SH}>
          {resume.education.map((edu, i) => <EduRow key={i} edu={edu} dark="#0d0d0d" mid="#2d2d2d" light="#5a5a5a" />)}
        </TemplateSection>
      )}
      
      {resume.skills?.length > 0 && (
        <TemplateSection title="Technical Skills" SH={SH}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
            {resume.skills.map((sk, i) => (
              <span key={i} style={{ backgroundColor: '#f4f4f4', color: '#0d0d0d', border: '1px solid #c8c8c8', borderRadius: '3px', padding: '2px 8px', fontSize: '10px', fontWeight: 600, fontFamily: '"Arial", sans-serif' }}>{sk}</span>
            ))}
          </div>
        </TemplateSection>
      )}
      
      {resume.experience?.length > 0 && (
        <TemplateSection title="Professional Experience" SH={SH}>
          {resume.experience.map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0d0d0d" mid="#2d2d2d" accent="#0d0d0d" last={i===arr.length-1} />)}
        </TemplateSection>
      )}
      
      {resume.internship?.length > 0 && (
        <TemplateSection title="Internship" SH={SH}>
          {resume.internship.map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0d0d0d" mid="#2d2d2d" accent="#0d0d0d" last={i===arr.length-1} />)}
        </TemplateSection>
      )}
      
      {resume.projects?.length > 0 && (
        <TemplateSection title="Projects" SH={SH}>
          {resume.projects.map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent="#1a1a1a" last={i===arr.length-1} />)}
        </TemplateSection>
      )}
      
      {resume.certifications?.length > 0 && (
        <TemplateSection title="Certifications" SH={SH}>
          {resume.certifications.map((cert, i, arr) => <CertRow key={i} cert={cert} accent="#1a1a1a" last={i===arr.length-1} />)}
        </TemplateSection>
      )}

      {resume.achievements?.length > 0 && (
        <TemplateSection title="Achievements" SH={SH}>
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: '#2d2d2d', lineHeight: 1.6 }}>
            {resume.achievements.map((ach, i) => (
              <li key={i}>{ach.text || ach}</li>
            ))}
          </ul>
        </TemplateSection>
      )}


    </div>
  );
};

/* ── Modern Template ── */
const ModernTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const BLUE = '#2563eb';
  const SH = {
    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: BLUE, letterSpacing: '0.12em',
    borderBottom: `2px solid ${BLUE}`, paddingBottom: '3px', marginBottom: '8px',
  };
  const contacts = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio, pi.website].filter(Boolean);
  
  return (
    <div style={{ fontFamily: '"Arial", sans-serif', fontSize: '11px', color: '#1e293b', lineHeight: 1.55 }}>
      <div style={{ backgroundColor: '#1e40af', padding: '24px 30px', margin: '-52px -58px 18px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {pi.fullName || 'YOUR FULL NAME'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: '10px', opacity: 0.85 }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        </div>
        {pi.photo && (
          <img src={pi.photo} alt="Profile" style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' }} />
        )}
      </div>
      
      {pi.summary && <TemplateSection title="Summary" SH={SH}><p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.7, margin: 0 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.length > 0 && <TemplateSection title="Education" SH={SH}>{resume.education.map((edu, i) => <EduRow key={i} edu={edu} dark="#0f172a" mid="#334155" light="#64748b" />)}</TemplateSection>}
      {resume.skills?.length > 0 && <TemplateSection title="Skills" SH={SH}><div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>{resume.skills.map((sk, i) => <span key={i} style={{ backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '4px', padding: '2px 9px', fontSize: '10px', fontWeight: 700 }}>{sk}</span>)}</div></TemplateSection>}
      {resume.experience?.length > 0 && <TemplateSection title="Experience" SH={SH}>{resume.experience.map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={BLUE} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.internship?.length > 0 && <TemplateSection title="Internship" SH={SH}>{resume.internship.map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={BLUE} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.projects?.length > 0 && <TemplateSection title="Projects" SH={SH}>{resume.projects.map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent={BLUE} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.certifications?.length > 0 && <TemplateSection title="Certifications" SH={SH}>{resume.certifications.map((cert, i, arr) => <CertRow key={i} cert={cert} accent={BLUE} last={i===arr.length-1} />)}</TemplateSection>}

    </div>
  );
};

/* Provide fallbacks for minimal templates (they will ignore extra fields for simplicity unless added later) */
const MinimalTemplate = ({resume, tpl}) => <ModernTemplate resume={resume} tpl={tpl}/>;
const ExecutiveTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;
const CreativeTemplate = ({resume, tpl}) => <ModernTemplate resume={resume} tpl={tpl}/>;
const FresherTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;
const SimpleATSTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;
const CorporateTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;

const RENDERERS = {
  'professional': ProfessionalTemplate,
  'modern':       ModernTemplate,
  'minimal':      MinimalTemplate,
  'executive':    ExecutiveTemplate,
  'creative':     CreativeTemplate,
  'fresher':      FresherTemplate,
  'simple-ats':   SimpleATSTemplate,
  'corporate':    CorporateTemplate,
};

const ResumePreview = React.forwardRef(({ resume, templateId }, ref) => {
  if (!resume) return null;
  const tpl        = getTemplateById(templateId);
  const TemplateEl = RENDERERS[templateId] || ProfessionalTemplate;
  const isCreative = templateId === 'creative';

  return (
    <div
      ref={ref}
      id="resume-preview"
      style={{
        width: `${A4W}px`,
        backgroundColor: '#ffffff',
        padding: isCreative ? '0' : '52px 58px',
        boxSizing: 'border-box',
        lineHeight: 1.55,
        color: '#111827',
      }}
    >
      <TemplateEl resume={resume} tpl={tpl} />
    </div>
  );
});

const TemplateSwitcher = ({ selectedTemplate, onSwitch }) => (
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
    {TEMPLATES.map(tpl => {
      const isActive = selectedTemplate === tpl.id;
      const dotColor = ['#ffffff','#e2e8f0','#9ca3af'].includes(tpl.preview.accentBar)
        ? '#334155' : tpl.preview.accentBar;
      return (
        <button
          key={tpl.id}
          onClick={() => onSwitch(tpl.id)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 border ${
            isActive
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
          {tpl.name}
        </button>
      );
    })}
  </div>
);

const SectionCard = ({ id, label, icon: Icon, isOpen, isDone, onToggle, children }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
    isOpen
      ? 'border-brand-200 dark:border-brand-800/50 shadow-md shadow-brand-500/5'
      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
  }`}>
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-5 py-4 text-left focus:outline-none group"
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
        isOpen
          ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] font-semibold transition-colors ${
          isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
        }`}>{label}</span>
      </div>
      {isDone && !isOpen && (
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
      )}
      <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && (
      <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 animate-fade-in">
        {children}
      </div>
    )}
  </div>
);

const ScoreRing = ({ score, size = 72, stroke = 6 }) => {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 55 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

/* ═════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
const ResumeBuilder = () => {
  const {
    resume, loading, saving, error,
    resumeCompletion, atsScore, atsSuggestions, atsBreakdown,
    selectedTemplate, setSelectedTemplate,
    updatePersonalInfo, updateEducation, updateExperience,
    updateInternship, updateProjects, updateCertifications,
    updateSkills, updateAchievements, updateLanguages, updateInterests, saveResume,
  } = useResume();

  const { addToast }  = useToast();
  const previewRef    = useRef(null);

  const [activeSection, setActiveSection]        = useState('details');
  const [sidebarOpen, setSidebarOpen]            = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [compilingResume, setCompilingResume]     = useState(false);
  const [skillsInput, setSkillsInput]             = useState('');
  const skillsInit                                 = useRef(false);

  useEffect(() => {
    if (resume?.skills && !skillsInit.current) {
      setSkillsInput(resume.skills.join(', '));
      skillsInit.current = true;
    }
  }, [resume?.skills]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-slate-500 font-medium animate-pulse">Loading Resume...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-rose-500">
        <FiAlertCircle className="w-10 h-10" />
        <span className="font-semibold">{error}</span>
      </div>
    );
  }
  if (!resume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-slate-500 font-medium">Please log in to view your resume.</span>
      </div>
    );
  }

  const handleDownloadPDF = () => setDownloadModalOpen(true);
  const handleConfirmDownload = async () => {
    setCompilingResume(true);
    try {
      const el = previewRef.current;
      if (!el) throw new Error('Preview not found');
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
      const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (el.offsetHeight * pdfW) / el.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save('Resume.pdf');
      addToast('success', 'Resume downloaded successfully!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to generate PDF. Please try again.');
    } finally {
      setCompilingResume(false);
      setDownloadModalOpen(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveResume();
      addToast('success', 'Resume saved successfully!');
    } catch (e) {
      addToast('error', 'Failed to save resume.');
    }
  };

  const currentTpl = getTemplateById(selectedTemplate);
  const pi = resume?.personalInfo || {};

  /* Helpers for Arrays */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { updatePersonalInfo({ photo: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const addArrayItem = (key, updater, templateObj) => {
    const arr = [...(resume[key] || [])];
    arr.push(templateObj);
    updater(arr);
  };
  const removeArrayItem = (key, index, updater) => {
    const arr = [...(resume[key] || [])];
    arr.splice(index, 1);
    updater(arr);
  };
  const updateArrayItem = (key, index, field, value, updater) => {
    const arr = [...(resume[key] || [])];
    arr[index] = { ...arr[index], [field]: value };
    updater(arr);
  };

  /* SECTIONS */
  const sections = [
    {
      id: 'details', label: 'Personal Information', icon: FiUser,
      isDone: !!(pi.fullName && pi.email && pi.phone),
    },
    {
      id: 'summary', label: 'Professional Summary', icon: FiFileText,
      isDone: !!pi.summary,
    },
    {
      id: 'education', label: 'Academic Information', icon: FiBookOpen,
      isDone: resume?.education?.length > 0,
    },
    {
      id: 'skills', label: 'Technical Skills', icon: FiCode,
      isDone: resume?.skills?.length > 0,
    },
    {
      id: 'experience', label: 'Work Experience', icon: FiBriefcase,
      isDone: resume?.experience?.length > 0,
    },
    {
      id: 'internship', label: 'Internships', icon: FiAward,
      isDone: resume?.internship?.length > 0,
    },
    {
      id: 'projects', label: 'Projects', icon: FiLayout,
      isDone: resume?.projects?.length > 0,
    },
    {
      id: 'certifications', label: 'Certifications', icon: FiShield,
      isDone: resume?.certifications?.length > 0,
    },



  ];

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar / Toolbar */}
      <div className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        
        {/* Hamburger + Title */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors xl:hidden">
            <FiMenu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              Resume Workspace
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Auto-saving enabled</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            </p>
          </div>
        </div>

        {/* Global Toolbar (ATS, Progress, Actions) */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden lg:flex items-center gap-4">
            {/* ATS Score Mini-Card */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <ScoreRing score={atsScore} size={36} stroke={3} />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ATS Score</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">{atsScore}/100</p>
              </div>
            </div>
            {/* Progress Mini-Card */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="w-36">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <span>Profile</span>
                  <span className="text-brand-600 dark:text-brand-400">{resumeCompletion}%</span>
                </div>
                <ProgressBar progress={resumeCompletion} height="h-1.5" />
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave} disabled={saving} className="h-9 px-4 hidden sm:flex bg-white dark:bg-slate-900">
              {saving ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <FiSave className="w-4 h-4 mr-1.5" />}
              Save
            </Button>
            <Button variant="primary" onClick={handleDownloadPDF} className="h-9 px-5 shadow-lg shadow-brand-500/20">
              <FiDownload className="w-4 h-4 mr-1.5" /> Download
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Collapsible Sidebar / Drawer (Hidden by default on Desktop, toggleable) */}
        {sidebarOpen && (
          <div className="absolute inset-0 z-40 flex">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-64 bg-[#0B1120] border-r border-white/10 flex flex-col shadow-2xl animate-slide-in">
              <div className="h-16 flex items-center justify-center border-b border-white/10">
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors absolute right-2">
                  <FiMenu className="w-5 h-5" />
                </button>
                <div className="font-bold text-white tracking-wider flex items-center gap-2">
                  <FiLayout className="w-5 h-5 text-brand-500" />
                  WORKSPACE
                </div>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <FiGrid className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/resume" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  <FiFileText className="w-4 h-4" /> Builder
                </Link>
                <Link to="/resume-templates" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <FiLayout className="w-4 h-4" /> Templates
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 50/50 Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Form Column */}
          <div className="w-1/2 flex flex-col gap-4 overflow-y-auto px-8 py-6 pb-20 custom-scrollbar">
            
            {/* Template Switcher */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Select Template</p>
              <TemplateSwitcher selectedTemplate={selectedTemplate} onSwitch={setSelectedTemplate} />
            </div>

            {/* ATS Suggestions */}
            {atsSuggestions.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                      <FiAlertCircle className="w-3 h-3 text-rose-500" />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">ATS Suggestions</h3>
                  </div>
                  <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                    {atsSuggestions.length}
                  </span>
                </div>
                <div className="px-5 py-4 flex flex-col gap-2.5 max-h-52 overflow-y-auto scrollbar-none">
                  {atsSuggestions.map((sug) => {
                    const impactColor =
                      sug.impact === 'Critical' ? 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30' :
                      sug.impact === 'High'     ? 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30' :
                      'text-blue-500 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30';
                    return (
                      <div key={sug.id} className="flex gap-2.5 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <FiAlertCircle className={`shrink-0 w-3.5 h-3.5 mt-0.5 ${sug.impact==='Critical'?'text-rose-500':sug.impact==='High'?'text-amber-500':'text-blue-500'}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{sug.category}</span>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${impactColor}`}>{sug.impact}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{sug.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section Accordions */}
            <div className="flex flex-col gap-2">
              
              {/* Personal Information */}
              <SectionCard id="details" label="Personal Information" icon={FiUser} isOpen={activeSection === 'details'} isDone={sections[0].isDone} onToggle={() => setActiveSection(activeSection === 'details' ? '' : 'details')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-2 mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      {pi.photo ? (
                        <img src={pi.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-slate-300" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700"><FiImage className="w-6 h-6 text-slate-400" /></div>
                      )}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
                    </div>
                  </div>
                  <Input label="Full Name" placeholder="John Doe" value={pi.fullName || ''} onChange={e => updatePersonalInfo({ fullName: e.target.value })} />
                  <Input label="Email Address" type="email" placeholder="john@example.com" value={pi.email || ''} onChange={e => updatePersonalInfo({ email: e.target.value })} />
                  <Input label="Phone Number" placeholder="+1 234 567 8900" value={pi.phone || ''} onChange={e => updatePersonalInfo({ phone: e.target.value })} />
                  <Input label="Date of Birth" type="date" value={pi.dob || ''} onChange={e => updatePersonalInfo({ dob: e.target.value })} />

                  
                  <Input label="LinkedIn URL" placeholder="linkedin.com/in/johndoe" value={pi.linkedin || ''} onChange={e => updatePersonalInfo({ linkedin: e.target.value })} />
                  <Input label="GitHub URL" placeholder="github.com/johndoe" value={pi.github || ''} onChange={e => updatePersonalInfo({ github: e.target.value })} />
                  <Input label="Portfolio / Website URL" placeholder="johndoe.com" value={pi.portfolio || ''} onChange={e => updatePersonalInfo({ portfolio: e.target.value })} />
                </div>
              </SectionCard>

              {/* Professional Summary */}
              <SectionCard id="summary" label="Professional Summary" icon={FiFileText} isOpen={activeSection === 'summary'} isDone={sections[1].isDone} onToggle={() => setActiveSection(activeSection === 'summary' ? '' : 'summary')}>
                <textarea rows="4" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-slate-900 dark:text-white" placeholder="Write a brief professional summary..." value={pi.summary || ''} onChange={e => updatePersonalInfo({ summary: e.target.value })} />
              </SectionCard>

              {/* Academic Information */}
              <SectionCard id="education" label="Academic Information" icon={FiBookOpen} isOpen={activeSection === 'education'} isDone={sections[2].isDone} onToggle={() => setActiveSection(activeSection === 'education' ? '' : 'education')}>
                <div className="flex flex-col gap-6">
                  {(resume.education || []).map((edu, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative">
                      <button onClick={() => removeArrayItem('education', i, updateEducation)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"><FiTrash className="w-4 h-4" /></button>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 capitalize">{edu.type === 'graduation' ? 'College/Graduation' : edu.type === '12th' ? '12th / Diploma' : '10th / Secondary'}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={edu.type === 'graduation' ? 'University / College' : 'School / Institution'} value={edu.institution || ''} onChange={e => updateArrayItem('education', i, 'institution', e.target.value, updateEducation)} />
                        {edu.type !== '10th' && <Input label={edu.type === 'graduation' ? 'Degree (e.g., B.Tech)' : 'Stream (e.g., Science)'} value={edu.degree || ''} onChange={e => updateArrayItem('education', i, 'degree', e.target.value, updateEducation)} />}
                        <Input label={edu.type === 'graduation' ? 'Branch (e.g., CSE)' : 'Board (e.g., CBSE)'} value={edu.board || edu.branch || ''} onChange={e => { updateArrayItem('education', i, 'board', e.target.value, updateEducation); updateArrayItem('education', i, 'branch', e.target.value, updateEducation); }} />
                        <Input label="Score (CGPA or %)" value={edu.cgpa || ''} onChange={e => updateArrayItem('education', i, 'cgpa', e.target.value, updateEducation)} />
                        <Input label="Start Year" value={edu.startYear || ''} onChange={e => updateArrayItem('education', i, 'startYear', e.target.value, updateEducation)} />
                        <Input label="End Year (or Expected)" value={edu.endYear || ''} onChange={e => updateArrayItem('education', i, 'endYear', e.target.value, updateEducation)} />
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="text-xs py-1.5" onClick={() => addArrayItem('education', updateEducation, { type: '10th', institution: '', board: '', cgpa: '', startYear: '', endYear: '' })}><FiPlus className="w-3.5 h-3.5 mr-1" /> Add 10th</Button>
                    <Button variant="outline" className="text-xs py-1.5" onClick={() => addArrayItem('education', updateEducation, { type: '12th', institution: '', board: '', degree: '', cgpa: '', startYear: '', endYear: '' })}><FiPlus className="w-3.5 h-3.5 mr-1" /> Add 12th</Button>
                    <Button variant="outline" className="text-xs py-1.5" onClick={() => addArrayItem('education', updateEducation, { type: 'graduation', institution: '', degree: '', branch: '', cgpa: '', startYear: '', endYear: '' })}><FiPlus className="w-3.5 h-3.5 mr-1" /> Add Graduation</Button>
                  </div>
                </div>
              </SectionCard>

              {/* Skills */}
              <SectionCard id="skills" label="Technical Skills" icon={FiCode} isOpen={activeSection === 'skills'} isDone={sections[3].isDone} onToggle={() => setActiveSection(activeSection === 'skills' ? '' : 'skills')}>
                <div className="flex flex-col gap-2">
                  <Input label="Enter skills (comma separated)" placeholder="React, Node.js, Python..." value={skillsInput} onChange={e => {
                    setSkillsInput(e.target.value);
                    updateSkills(e.target.value.split(',').map(s => s.trim()).filter(Boolean));
                  }} />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(resume.skills || []).map((sk, i) => (
                      <span key={i} className="px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-full border border-brand-100 dark:border-brand-800/30">{sk}</span>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Work Experience */}
              <SectionCard id="experience" label="Work Experience" icon={FiBriefcase} isOpen={activeSection === 'experience'} isDone={sections[4].isDone} onToggle={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')}>
                <div className="flex flex-col gap-4">
                  {(resume.experience || []).map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative">
                      <button onClick={() => removeArrayItem('experience', i, updateExperience)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"><FiTrash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Input label="Job Title" value={exp.role || ''} onChange={e => updateArrayItem('experience', i, 'role', e.target.value, updateExperience)} />
                        <Input label="Company Name" value={exp.company || ''} onChange={e => updateArrayItem('experience', i, 'company', e.target.value, updateExperience)} />
                        <Input label="Duration (e.g. Jan 2020 - Present)" value={exp.duration || ''} onChange={e => updateArrayItem('experience', i, 'duration', e.target.value, updateExperience)} />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description / Achievements</label>
                        <textarea rows="3" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-slate-900 dark:text-white" value={exp.description || ''} onChange={e => updateArrayItem('experience', i, 'description', e.target.value, updateExperience)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('experience', updateExperience, { role: '', company: '', duration: '', description: '' })}>
                    <FiPlus className="w-4 h-4 mr-2" /> Add Experience
                  </Button>
                </div>
              </SectionCard>

              {/* Internships */}
              <SectionCard id="internship" label="Internships" icon={FiAward} isOpen={activeSection === 'internship'} isDone={sections[5].isDone} onToggle={() => setActiveSection(activeSection === 'internship' ? '' : 'internship')}>
                <div className="flex flex-col gap-4">
                  {(resume.internship || []).map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative">
                      <button onClick={() => removeArrayItem('internship', i, updateInternship)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"><FiTrash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Input label="Role" value={exp.role || ''} onChange={e => updateArrayItem('internship', i, 'role', e.target.value, updateInternship)} />
                        <Input label="Company" value={exp.company || ''} onChange={e => updateArrayItem('internship', i, 'company', e.target.value, updateInternship)} />
                        <Input label="Duration" value={exp.duration || ''} onChange={e => updateArrayItem('internship', i, 'duration', e.target.value, updateInternship)} />
                      </div>
                      <div className="mt-4">
                        <textarea rows="3" placeholder="Description" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-slate-900 dark:text-white" value={exp.description || ''} onChange={e => updateArrayItem('internship', i, 'description', e.target.value, updateInternship)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('internship', updateInternship, { role: '', company: '', duration: '', description: '' })}><FiPlus className="w-4 h-4 mr-2" /> Add Internship</Button>
                </div>
              </SectionCard>

              {/* Projects */}
              <SectionCard id="projects" label="Projects" icon={FiLayout} isOpen={activeSection === 'projects'} isDone={sections[6].isDone} onToggle={() => setActiveSection(activeSection === 'projects' ? '' : 'projects')}>
                <div className="flex flex-col gap-4">
                  {(resume.projects || []).map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative">
                      <button onClick={() => removeArrayItem('projects', i, updateProjects)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 rounded-md transition-colors"><FiTrash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Input label="Project Title" value={proj.title || ''} onChange={e => updateArrayItem('projects', i, 'title', e.target.value, updateProjects)} />
                        <Input label="Technologies Used" placeholder="React, Node..." value={proj.technologies || ''} onChange={e => updateArrayItem('projects', i, 'technologies', e.target.value, updateProjects)} />
                        <Input label="GitHub Link" value={proj.githubLink || ''} onChange={e => updateArrayItem('projects', i, 'githubLink', e.target.value, updateProjects)} />
                        <Input label="Live Demo Link" value={proj.liveDemo || ''} onChange={e => updateArrayItem('projects', i, 'liveDemo', e.target.value, updateProjects)} />
                      </div>
                      <div className="mt-4">
                        <textarea rows="3" placeholder="Project Description" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 rounded-xl text-sm focus:ring-brand-500 outline-none resize-none text-slate-900 dark:text-white" value={proj.description || ''} onChange={e => updateArrayItem('projects', i, 'description', e.target.value, updateProjects)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('projects', updateProjects, { title: '', technologies: '', githubLink: '', liveDemo: '', description: '' })}><FiPlus className="w-4 h-4 mr-2" /> Add Project</Button>
                </div>
              </SectionCard>

              {/* Certifications */}
              <SectionCard id="certifications" label="Certifications" icon={FiShield} isOpen={activeSection === 'certifications'} isDone={sections[7].isDone} onToggle={() => setActiveSection(activeSection === 'certifications' ? '' : 'certifications')}>
                <div className="flex flex-col gap-4">
                  {(resume.certifications || []).map((cert, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative">
                      <button onClick={() => removeArrayItem('certifications', i, updateCertifications)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-500 rounded-md"><FiTrash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <Input label="Certification Name" value={cert.name || ''} onChange={e => updateArrayItem('certifications', i, 'name', e.target.value, updateCertifications)} />
                        <Input label="Issuing Organization" value={cert.organization || ''} onChange={e => updateArrayItem('certifications', i, 'organization', e.target.value, updateCertifications)} />
                        <Input label="Year" value={cert.year || ''} onChange={e => updateArrayItem('certifications', i, 'year', e.target.value, updateCertifications)} />
                        <Input label="Link" value={cert.link || ''} onChange={e => updateArrayItem('certifications', i, 'link', e.target.value, updateCertifications)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full border-dashed" onClick={() => addArrayItem('certifications', updateCertifications, { name: '', organization: '', year: '', link: '' })}><FiPlus className="w-4 h-4 mr-2" /> Add Certification</Button>
                </div>
              </SectionCard>

              {/* Achievements */}
              

              {/* Languages */}
              

              {/* Interests */}
              

            </div>
          </div>

          {/* Right Preview Column */}
          <div className="w-1/2 bg-slate-100 dark:bg-slate-800/50 overflow-y-auto py-8 flex flex-col items-center custom-scrollbar border-l border-slate-200 dark:border-slate-800">
            {/* Sticky Container */}
            <div className="sticky top-0 w-full max-w-[794px]">
              <div className="flex items-center justify-between mb-3 px-1 w-full">
                <div className="flex items-center gap-2">
                  <FiEye className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Live Preview — <span className="text-slate-600 dark:text-slate-400">{currentTpl?.name}</span></span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5 w-[794px]" style={{ background: '#ffffff', minHeight: '1123px' }}>
                <ResumePreview ref={previewRef} resume={resume} templateId={selectedTemplate} />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <Modal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Download Resume PDF"
        footer={!compilingResume && (
          <>
            <Button variant="outline" onClick={() => setDownloadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmDownload}>
              <FiDownload className="w-3.5 h-3.5 mr-1" /> Download PDF
            </Button>
          </>
        )}
      >
        {compilingResume ? (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-700">Preparing your PDF…</h4>
              <p className="text-xs text-slate-400 mt-1">Template: <strong>{currentTpl?.name}</strong></p>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <FiCheckSquare className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800">Ready to Download</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Template: <strong>{currentTpl?.name}</strong> — ATS Score: <strong>{atsScore}/100</strong>
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResumeBuilder;
