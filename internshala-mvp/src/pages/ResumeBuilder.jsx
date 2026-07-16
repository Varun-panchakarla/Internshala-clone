import React, { useState, useRef } from 'react';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../components/common/Toast';
import {
  FiSave, FiDownload, FiPlus, FiTrash, FiAward,
  FiAlertCircle, FiChevronRight, FiBriefcase, FiBookOpen,
  FiUser, FiCode, FiFileText, FiCheckSquare, FiLink,
  FiMail, FiPhone, FiMapPin,
} from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS — Classic Black & White Professional Resume
   No blues, no colors. Clean typographic hierarchy only.
───────────────────────────────────────────────────────────────────────────── */
const DARK     = '#0d0d0d';   // near-black for headings & name
const MID      = '#2d2d2d';   // body text
const LIGHT    = '#5a5a5a';   // secondary / italic / dates
const RULE     = '#b0b0b0';   // thin section divider line
const CHIP_BG  = '#f4f4f4';   // skill chip background
const CHIP_BD  = '#c8c8c8';   // skill chip border
const LINK_COL = '#1a1a1a';   // links — dark, not blue

/* Section heading: bold uppercase, thin gray rule underneath, all black */
const SH = {
  fontSize: '11px',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: DARK,
  letterSpacing: '0.14em',
  borderBottom: `1px solid ${RULE}`,
  paddingBottom: '3px',
  marginTop: '0',
  marginBottom: '7px',
};

/* ensure links have a protocol */
const href = (u) => (!u ? '#' : /^https?:\/\//i.test(u) ? u : `https://${u}`);

/* ─── A4 width (794 px ≈ 210 mm at 96 dpi). Height is AUTO (content-driven) ─ */
const A4W = 794;

/* ═══════════════════════════════════════════════════════════════════════════
   RESUME PREVIEW COMPONENT  (exported separately so we can ref it)
═══════════════════════════════════════════════════════════════════════════ */
const ResumePreview = React.forwardRef(({ resume }, ref) => {
  if (!resume) return null;
  const pi = resume.personalInfo || {};

  const contactItems = [
    pi.email    && { label: pi.email,    link: `mailto:${pi.email}` },
    pi.phone    && { label: pi.phone,    link: `tel:${pi.phone}` },
    pi.location && { label: pi.location, link: null },
    pi.linkedin && { label: pi.linkedin, link: href(pi.linkedin) },
    pi.github   && { label: pi.github,   link: href(pi.github) },
    pi.website  && { label: pi.website,  link: href(pi.website) },
  ].filter(Boolean);

  return (
    <div
      ref={ref}
      id="resume-preview"
      style={{
        width: `${A4W}px`,
        /* NO minHeight — content height drives PDF height, zero blank space */
        backgroundColor: '#ffffff',
        padding: '52px 58px 52px 58px',
        boxSizing: 'border-box',
        fontFamily: '"Times New Roman", Times, serif',
        fontSize: '11.5px',
        lineHeight: '1.55',
        color: DARK,
      }}
    >
      {/* ══ HEADER ══════════════════════════════════════════════════════ */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>

        {/* Name */}
        <div style={{
          fontSize: '24px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: DARK,
          lineHeight: 1.15,
          fontFamily: '"Arial", "Helvetica Neue", Helvetica, sans-serif',
        }}>
          {pi.fullName || 'YOUR FULL NAME'}
        </div>

        {/* Thin rule under name */}
        <div style={{ height: '1px', backgroundColor: DARK, margin: '8px 0 7px 0' }} />

        {/* Contact items — plain dark text, pipe-separated */}
        {contactItems.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '2px 0', fontSize: '10px', color: MID,
            fontFamily: '"Arial", sans-serif',
          }}>
            {contactItems.map((c, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {i > 0 && <span style={{ margin: '0 6px', color: RULE }}>|</span>}
                {c.link
                  ? <a href={c.link} target="_blank" rel="noreferrer"
                      style={{ color: LINK_COL, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      {c.label}
                    </a>
                  : <span>{c.label}</span>
                }
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ══ PROFESSIONAL SUMMARY ════════════════════════════════════════ */}
      {pi.summary && (
        <Section title="Professional Summary">
          <p style={{
            fontSize: '11px', color: MID, lineHeight: '1.7',
            textAlign: 'justify', margin: 0,
          }}>
            {pi.summary}
          </p>
        </Section>
      )}

      {/* ══ EDUCATION ═══════════════════════════════════════════════════ */}
      {resume.education?.filter(e => e.institution).length > 0 && (
        <Section title="Education">
          {resume.education.filter(e => e.institution).map((edu, i, arr) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: i < arr.length - 1 ? '8px' : 0,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '11.5px', color: DARK }}>
                  {edu.institution}
                </div>
                <div style={{ fontSize: '10.5px', color: MID, marginTop: '1px' }}>
                  {[edu.degree, edu.branch].filter(Boolean).join(', ')}
                  {edu.cgpa
                    ? <span style={{ color: LIGHT, marginLeft: '10px' }}>CGPA: {edu.cgpa}</span>
                    : null
                  }
                </div>
              </div>
              {(edu.startYear || edu.endYear) && (
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: MID, flexShrink: 0, marginLeft: '20px' }}>
                  {[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ══ TECHNICAL SKILLS ════════════════════════════════════════════ */}
      {resume.skills?.length > 0 && (
        <Section title="Technical Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
            {resume.skills.map((sk, i) => (
              <span key={i} style={{
                backgroundColor: CHIP_BG,
                color: DARK,
                border: `1px solid ${CHIP_BD}`,
                borderRadius: '3px',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 600,
                fontFamily: '"Arial", sans-serif',
              }}>{sk}</span>
            ))}
          </div>
        </Section>
      )}

      {/* ══ PROFESSIONAL EXPERIENCE ═════════════════════════════════════ */}
      {resume.experience?.filter(e => e.company || e.role).length > 0 && (
        <Section title="Professional Experience">
          {resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => (
            <ExpBlock key={i} last={i === arr.length - 1}
              title={exp.role} subtitle={exp.company}
              duration={exp.duration} description={exp.description} />
          ))}
        </Section>
      )}

      {/* ══ INTERNSHIP ══════════════════════════════════════════════════ */}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && (
        <Section title="Internship">
          {resume.internship.filter(e => e.company || e.role).map((intern, i, arr) => (
            <ExpBlock key={i} last={i === arr.length - 1}
              title={intern.role} subtitle={intern.company}
              duration={intern.duration} description={intern.description} />
          ))}
        </Section>
      )}

      {/* ══ PROJECTS ════════════════════════════════════════════════════ */}
      {resume.projects?.filter(p => p.title).length > 0 && (
        <Section title="Projects">
          {resume.projects.filter(p => p.title).map((proj, i, arr) => (
            <div key={i} style={{ marginBottom: i < arr.length - 1 ? '11px' : 0 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', flexWrap: 'wrap', gap: '4px',
              }}>
                <span style={{ fontWeight: 700, fontSize: '11.5px', color: DARK }}>
                  {proj.title}
                </span>
                {proj.technologies && (
                  <span style={{ fontSize: '10px', color: LIGHT, fontStyle: 'italic' }}>
                    {proj.technologies}
                  </span>
                )}
              </div>
              {proj.description && (
                <p style={{
                  fontSize: '10.5px', color: MID, lineHeight: '1.65',
                  margin: '3px 0 3px 0', whiteSpace: 'pre-line',
                }}>
                  {proj.description}
                </p>
              )}
              {(proj.githubLink || proj.liveDemo) && (
                <div style={{ display: 'flex', gap: '16px', fontSize: '10px', marginTop: '3px' }}>
                  {proj.githubLink && (
                    <a href={href(proj.githubLink)} target="_blank" rel="noreferrer"
                      style={{ color: LINK_COL, textDecoration: 'underline', fontWeight: 600, textUnderlineOffset: '2px' }}>
                      GitHub ↗
                    </a>
                  )}
                  {proj.liveDemo && (
                    <a href={href(proj.liveDemo)} target="_blank" rel="noreferrer"
                      style={{ color: LINK_COL, textDecoration: 'underline', fontWeight: 600, textUnderlineOffset: '2px' }}>
                      Live Demo ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* ══ CERTIFICATIONS ══════════════════════════════════════════════ */}
      {resume.certifications?.filter(c => c.name).length > 0 && (
        <Section title="Certifications">
          {resume.certifications.filter(c => c.name).map((cert, i, arr) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: i < arr.length - 1 ? '7px' : 0,
            }}>
              <div style={{ flex: 1 }}>
                {/* Cert name: underlined link if has link, else plain bold */}
                {cert.link ? (
                  <a href={href(cert.link)} target="_blank" rel="noreferrer"
                    style={{
                      fontWeight: 700, fontSize: '11px',
                      color: LINK_COL,
                      textDecoration: 'underline',
                      textUnderlineOffset: '2px',
                    }}>
                    {cert.name}
                  </a>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: '11px', color: DARK }}>
                    {cert.name}
                  </span>
                )}
                {cert.organization && (
                  <span style={{ color: LIGHT, fontSize: '10px', marginLeft: '8px' }}>
                    — {cert.organization}
                  </span>
                )}
                {/* Print the URL in tiny gray text so it's visible in PDF */}
                {cert.link && (
                  <div style={{
                    fontSize: '8.5px', color: LIGHT, marginTop: '1px',
                    wordBreak: 'break-all', fontFamily: '"Arial", sans-serif',
                  }}>
                    {cert.link}
                  </div>
                )}
              </div>
              {cert.year && (
                <span style={{
                  fontSize: '10.5px', fontWeight: 600,
                  color: MID, flexShrink: 0, marginLeft: '20px',
                }}>
                  {cert.year}
                </span>
              )}
            </div>
          ))}
        </Section>
      )}

    </div>
  );
});

/* ── Section wrapper ─────────────────────────────────────────────────────── */
const Section = ({ title, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={SH}>{title}</div>
    {children}
  </div>
);

/* ── Experience / Internship block ───────────────────────────────────────── */
const ExpBlock = ({ title, subtitle, duration, description, last }) => (
  <div style={{ marginBottom: last ? 0 : '10px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '11px', color: DARK }}>{title || 'Role'}</div>
        <div style={{ fontSize: '10px', color: MID, fontStyle: 'italic', marginTop: '1px' }}>{subtitle || 'Company'}</div>
      </div>
      {duration && (
        <span style={{ fontSize: '10px', fontWeight: 600, color: MID, flexShrink: 0, marginLeft: '16px' }}>
          {duration}
        </span>
      )}
    </div>
    {description && (
      <p style={{ fontSize: '10.5px', color: MID, lineHeight: '1.65', margin: '4px 0 0 0', whiteSpace: 'pre-line' }}>
        {description}
      </p>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const ResumeBuilder = () => {
  const {
    resume, loading, saving,
    resumeCompletion, atsScore, atsSuggestions, atsBreakdown,
    updatePersonalInfo, updateEducation, updateExperience,
    updateInternship, updateProjects, updateCertifications,
    updateSkills, saveResume,
  } = useResume();

  const { addToast }  = useToast();
  const previewRef    = useRef(null);

  const [activeSection, setActiveSection]         = useState('details');
  const [downloadModalOpen, setDownloadModalOpen]  = useState(false);
  const [compilingResume, setCompilingResume]      = useState(false);
  const [downloading, setDownloading]              = useState(false);

  /* ── Skills: parse only on blur so comma+space mid-type doesn't reset ── */
  const [skillsInput, setSkillsInput]  = useState('');
  const skillsInit                     = useRef(false);

  React.useEffect(() => {
    if (resume?.skills && !skillsInit.current) {
      setSkillsInput(resume.skills.join(', '));
      skillsInit.current = true;
    }
  }, [resume?.skills]);

  if (loading || !resume) {
    return (
      <div className="flex justify-center items-center p-12">
        <svg className="animate-spin h-8 w-8 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  /* ── Personal ── */
  const handlePersonalChange = (field, val) => updatePersonalInfo({ [field]: val });

  /* ── Education ── */
  const handleEducationChange = (i, f, v) => {
    const u = [...resume.education]; u[i] = { ...u[i], [f]: v }; updateEducation(u);
  };
  const addEducation    = () => { updateEducation([...resume.education, { institution: '', degree: '', branch: '', cgpa: '', startYear: '', endYear: '' }]); addToast('Education entry added.', 'info'); };
  const removeEducation = (i) => { updateEducation(resume.education.filter((_, idx) => idx !== i)); addToast('Entry removed.', 'info'); };

  /* ── Skills ── */
  const handleSkillsChange = (e) => setSkillsInput(e.target.value);
  const handleSkillsBlur   = () => {
    const arr = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    updateSkills(arr);
    setSkillsInput(arr.join(', '));
  };

  /* ── Experience ── */
  const handleExpChange = (i, f, v) => { const u = [...resume.experience]; u[i] = { ...u[i], [f]: v }; updateExperience(u); };
  const addExp    = () => { updateExperience([...resume.experience, { company: '', role: '', duration: '', description: '' }]); addToast('Experience entry added.', 'info'); };
  const removeExp = (i) => { updateExperience(resume.experience.filter((_, idx) => idx !== i)); addToast('Entry removed.', 'info'); };

  /* ── Internship ── */
  const handleInternChange = (i, f, v) => { const u = [...(resume.internship || [])]; u[i] = { ...u[i], [f]: v }; updateInternship(u); };
  const addIntern    = () => { updateInternship([...(resume.internship || []), { company: '', role: '', duration: '', description: '' }]); addToast('Internship entry added.', 'info'); };
  const removeIntern = (i) => { updateInternship((resume.internship || []).filter((_, idx) => idx !== i)); addToast('Entry removed.', 'info'); };

  /* ── Projects ── */
  const handleProjChange = (i, f, v) => { const u = [...resume.projects]; u[i] = { ...u[i], [f]: v }; updateProjects(u); };
  const addProj    = () => { updateProjects([...resume.projects, { title: '', technologies: '', description: '', githubLink: '', liveDemo: '' }]); addToast('Project entry added.', 'info'); };
  const removeProj = (i) => { updateProjects(resume.projects.filter((_, idx) => idx !== i)); addToast('Entry removed.', 'info'); };

  /* ── Certifications ── */
  const handleCertChange = (i, f, v) => { const u = [...(resume.certifications || [])]; u[i] = { ...u[i], [f]: v }; updateCertifications(u); };
  const addCert    = () => { updateCertifications([...(resume.certifications || []), { name: '', organization: '', year: '', link: '' }]); addToast('Certification added.', 'info'); };
  const removeCert = (i) => { updateCertifications((resume.certifications || []).filter((_, idx) => idx !== i)); addToast('Entry removed.', 'info'); };

  /* ── Save ── */
  const handleSave = async () => {
    const arr = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    updateSkills(arr);
    try   { await saveResume(); addToast('Resume saved!', 'success'); }
    catch { addToast('Save failed.', 'error'); }
  };

  /* ── PDF Download ──────────────────────────────────────────────────────
     Strategy: capture the preview div as-is (NO min-height means the canvas
     will be exactly as tall as the content — no blank space at bottom).
     Slice into A4 pages only if content overflows one page.
  ─────────────────────────────────────────────────────────────────────── */
  const handleDownloadTrigger = () => {
    setDownloadModalOpen(true);
    setCompilingResume(true);
    setTimeout(() => setCompilingResume(false), 1600);
  };

  const handleConfirmDownload = async () => {
    setDownloadModalOpen(false);
    const el = previewRef.current;
    if (!el) { addToast('Preview not found!', 'error'); return; }

    setDownloading(true);
    addToast('Generating your PDF…', 'info');

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF: JsPDF } = await import('jspdf');

      /* ── 1. Capture at 3× scale for sharp text ── */
      const canvas = await html2canvas(el, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: A4W,
        scrollX: 0,
        scrollY: 0,
      });

      /* ── 2. A4 page dimensions ── */
      const pdf   = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW  = pdf.internal.pageSize.getWidth();   // 210 mm
      const pdfH  = pdf.internal.pageSize.getHeight();  // 297 mm

      /* px-per-mm based on captured canvas width */
      const pxPerMm   = canvas.width / pdfW;
      const pageHpx   = Math.round(pdfH * pxPerMm);
      const totalHpx  = canvas.height;

      /* ── 3. Slice canvas into A4 pages ── */
      let yOff = 0, page = 0;
      while (yOff < totalHpx) {
        if (page > 0) pdf.addPage();

        const sliceH  = Math.min(pageHpx, totalHpx - yOff);
        const pc      = document.createElement('canvas');
        pc.width      = canvas.width;
        pc.height     = Math.ceil(sliceH);
        const ctx     = pc.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pc.width, pc.height);
        ctx.drawImage(canvas, 0, yOff, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        pdf.addImage(pc.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, pdfW, sliceH / pxPerMm);
        yOff += pageHpx;
        page++;
      }

      pdf.save('Resume.pdf');
      addToast('✅ Resume.pdf downloaded!', 'success');
    } catch (err) {
      console.error(err);
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setDownloading(false);
    }
  };

  /* ── Accordion config ── */
  const sections = [
    { id: 'details',        label: '1. Personal Details',        icon: FiUser },
    { id: 'summary',        label: '2. Professional Summary',    icon: FiFileText },
    { id: 'education',      label: '3. Education',               icon: FiBookOpen },
    { id: 'skills',         label: '4. Skills',                  icon: FiAward },
    { id: 'experience',     label: '5. Professional Experience', icon: FiBriefcase },
    { id: 'internship',     label: '6. Internship',              icon: FiBriefcase },
    { id: 'projects',       label: '7. Projects',                icon: FiCode },
    { id: 'certifications', label: '8. Certifications',          icon: FiCheckSquare },
  ];

  const scoreColor = (s) => s >= 80 ? 'emerald' : s >= 55 ? 'amber' : 'rose';
  const sc = scoreColor(atsScore);
  const cc = scoreColor(resumeCompletion);

  /* ════════════════════════ RENDER ════════════════════════════════════ */
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start w-full animate-slide-up">

      {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
      <div className="xl:col-span-5 flex flex-col gap-5 w-full">

        {/* Profile Completion */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Profile Completion</h3>
              <p className="text-xs text-slate-400">Fill all fields to reach 100%</p>
            </div>
            <span className={`text-2xl font-black px-3 py-1.5 rounded-2xl border bg-${cc}-50 text-${cc}-700 border-${cc}-100`}>
              {resumeCompletion}%
            </span>
          </div>
          <ProgressBar value={resumeCompletion} showPercentage size="sm" />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" className="flex-1 font-bold" onClick={handleSave} loading={saving}>
              <FiSave className="mr-1.5" /> Save Changes
            </Button>
            <Button variant="outline" size="sm" className="bg-white" onClick={handleDownloadTrigger} loading={downloading}>
              <FiDownload />
            </Button>
          </div>
        </div>

        {/* ATS Score */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">ATS Score</h3>
              <p className="text-xs text-slate-400">Applicant Tracking System readiness</p>
            </div>
            <span className={`text-2xl font-black px-3 py-1.5 rounded-2xl border bg-${sc}-50 text-${sc}-700 border-${sc}-100`}>
              {atsScore}/100
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(atsBreakdown).map(([key, val]) => {
              const labels = { contactDetails:'Contact', professionalSummary:'Summary', education:'Education', skills:'Skills', experience:'Experience', internship:'Internship', projects:'Projects', certifications:'Certs' };
              const maxMap = { contactDetails:15, professionalSummary:10, education:15, skills:15, experience:15, internship:10, projects:10, certifications:5 };
              const pct = maxMap[key] ? Math.round((val / maxMap[key]) * 100) : 0;
              return (
                <div key={key} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{labels[key] || key}</span>
                  <span className={`text-[9px] font-black ${pct>=80?'text-emerald-600':pct>=50?'text-amber-600':'text-rose-500'}`}>
                    {Math.round(val)}/{maxMap[key]||'?'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ATS Suggestions */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-md">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-4">
            ATS Recommendations ({atsSuggestions.length})
          </h4>
          {atsSuggestions.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {atsSuggestions.map((sug) => (
                <div key={sug.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex gap-2.5 items-start">
                  <FiAlertCircle className={`shrink-0 w-4 h-4 mt-0.5 ${sug.impact==='Critical'?'text-rose-500':sug.impact==='High'?'text-amber-500':sug.impact==='Medium'?'text-blue-500':'text-slate-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{sug.category}</span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded ${sug.impact==='Critical'?'bg-rose-50 text-rose-600 border border-rose-100':sug.impact==='High'?'bg-amber-50 text-amber-600 border border-amber-100':sug.impact==='Medium'?'bg-blue-50 text-blue-600 border border-blue-100':'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                        {sug.impact} Impact
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{sug.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex gap-2.5 items-center">
              <FiAward className="text-emerald-500 w-5 h-5 shrink-0" />
              <p className="text-xs font-bold">Excellent! Your resume passes all ATS checks.</p>
            </div>
          )}
        </div>

        {/* ── Accordions ── */}
        <div className="flex flex-col gap-2">
          {sections.map(({ id, label, icon: Icon }) => {
            const isOpen = activeSection === id;
            return (
              <div key={id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveSection(isOpen ? '' : id)}
                  className={`w-full flex items-center justify-between p-4 font-extrabold text-sm text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none ${isOpen ? 'border-b border-slate-100 bg-slate-50/50' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="text-slate-400 w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  <FiChevronRight className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {isOpen && (
                  <div className="p-5 flex flex-col gap-4 animate-fade-in">

                    {/* 1. DETAILS */}
                    {id === 'details' && (
                      <div className="flex flex-col gap-4">
                        <Input label="Full Name" id="resName" value={resume.personalInfo.fullName||''} onChange={e=>handlePersonalChange('fullName',e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="Email" id="resEmail" value={resume.personalInfo.email||''} onChange={e=>handlePersonalChange('email',e.target.value)} />
                          <Input label="Phone" id="resPhone" value={resume.personalInfo.phone||''} onChange={e=>handlePersonalChange('phone',e.target.value)} />
                        </div>
                        <Input label="Location" id="resLoc" placeholder="e.g. Hyderabad, India" value={resume.personalInfo.location||''} onChange={e=>handlePersonalChange('location',e.target.value)} />
                        <div className="grid grid-cols-2 gap-4">
                          <Input label="LinkedIn URL" id="resLI" placeholder="linkedin.com/in/username" value={resume.personalInfo.linkedin||''} onChange={e=>handlePersonalChange('linkedin',e.target.value)} />
                          <Input label="GitHub URL" id="resGH" placeholder="github.com/username" value={resume.personalInfo.github||''} onChange={e=>handlePersonalChange('github',e.target.value)} />
                        </div>
                        <Input label="Portfolio Website" id="resWeb" placeholder="https://yourportfolio.com" value={resume.personalInfo.website||''} onChange={e=>handlePersonalChange('website',e.target.value)} />
                      </div>
                    )}

                    {/* 2. SUMMARY */}
                    {id === 'summary' && (
                      <div className="flex flex-col gap-2">
                        <Input label="Professional Summary" id="resSummary" type="textarea" rows={5}
                          placeholder="Write 2–4 sentences about your skills, experience, and career goals…"
                          value={resume.personalInfo.summary||''} onChange={e=>handlePersonalChange('summary',e.target.value)} />
                        <span className="text-[10px] text-slate-400">Aim for 30–60 words. ATS parsers weigh summary keywords heavily.</span>
                      </div>
                    )}

                    {/* 3. EDUCATION */}
                    {id === 'education' && (
                      <div className="flex flex-col gap-6">
                        {resume.education.map((edu, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button onClick={()=>removeEducation(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"><FiTrash className="w-4 h-4"/></button>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx+1}</span>
                            <Input label="College / University" id={`eduInst-${idx}`} value={edu.institution||''} onChange={e=>handleEducationChange(idx,'institution',e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Degree" id={`eduDeg-${idx}`} placeholder="B.Tech / BCA / MBA" value={edu.degree||''} onChange={e=>handleEducationChange(idx,'degree',e.target.value)} />
                              <Input label="Branch" id={`eduBranch-${idx}`} placeholder="Computer Science" value={edu.branch||''} onChange={e=>handleEducationChange(idx,'branch',e.target.value)} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <Input label="CGPA" id={`eduCGPA-${idx}`} placeholder="8.5" value={edu.cgpa||''} onChange={e=>handleEducationChange(idx,'cgpa',e.target.value)} />
                              <Input label="From" id={`eduFrom-${idx}`} placeholder="2021" value={edu.startYear||''} onChange={e=>handleEducationChange(idx,'startYear',e.target.value)} />
                              <Input label="To" id={`eduTo-${idx}`} placeholder="2025" value={edu.endYear||''} onChange={e=>handleEducationChange(idx,'endYear',e.target.value)} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-dashed bg-white" onClick={addEducation}><FiPlus className="mr-1.5"/>Add Education</Button>
                      </div>
                    )}

                    {/* 4. SKILLS */}
                    {id === 'skills' && (
                      <div className="flex flex-col gap-4">
                        <Input label="Skills (comma-separated)" id="resSkills"
                          placeholder="React, JavaScript, Node.js, Git…"
                          value={skillsInput}
                          onChange={handleSkillsChange}
                          onBlur={handleSkillsBlur} />
                        <span className="text-[10px] -mt-2 text-slate-400">Tags appear after you click away (on blur).</span>
                        {resume.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {resume.skills.map((sk, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">{sk}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 5. EXPERIENCE */}
                    {id === 'experience' && (
                      <div className="flex flex-col gap-6">
                        {resume.experience.map((exp, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button onClick={()=>removeExp(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"><FiTrash className="w-4 h-4"/></button>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx+1}</span>
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Company" id={`expCo-${idx}`} value={exp.company||''} onChange={e=>handleExpChange(idx,'company',e.target.value)} />
                              <Input label="Role / Title" id={`expRole-${idx}`} value={exp.role||''} onChange={e=>handleExpChange(idx,'role',e.target.value)} />
                            </div>
                            <Input label="Duration" id={`expDur-${idx}`} placeholder="June 2022 – Present" value={exp.duration||''} onChange={e=>handleExpChange(idx,'duration',e.target.value)} />
                            <Input label="Description" id={`expDesc-${idx}`} type="textarea" rows={4} placeholder="Use action verbs: Developed, Led, Optimized…" value={exp.description||''} onChange={e=>handleExpChange(idx,'description',e.target.value)} />
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-dashed bg-white" onClick={addExp}><FiPlus className="mr-1.5"/>Add Experience</Button>
                      </div>
                    )}

                    {/* 6. INTERNSHIP */}
                    {id === 'internship' && (
                      <div className="flex flex-col gap-6">
                        {(resume.internship||[]).map((intern, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button onClick={()=>removeIntern(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"><FiTrash className="w-4 h-4"/></button>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx+1}</span>
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Company" id={`intCo-${idx}`} value={intern.company||''} onChange={e=>handleInternChange(idx,'company',e.target.value)} />
                              <Input label="Role" id={`intRole-${idx}`} value={intern.role||''} onChange={e=>handleInternChange(idx,'role',e.target.value)} />
                            </div>
                            <Input label="Duration" id={`intDur-${idx}`} placeholder="May 2023 – Aug 2023" value={intern.duration||''} onChange={e=>handleInternChange(idx,'duration',e.target.value)} />
                            <Input label="Description" id={`intDesc-${idx}`} type="textarea" rows={4} placeholder="What did you work on?" value={intern.description||''} onChange={e=>handleInternChange(idx,'description',e.target.value)} />
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-dashed bg-white" onClick={addIntern}><FiPlus className="mr-1.5"/>Add Internship</Button>
                      </div>
                    )}

                    {/* 7. PROJECTS */}
                    {id === 'projects' && (
                      <div className="flex flex-col gap-6">
                        {resume.projects.map((proj, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button onClick={()=>removeProj(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"><FiTrash className="w-4 h-4"/></button>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx+1}</span>
                            <Input label="Project Title" id={`projT-${idx}`} value={proj.title||''} onChange={e=>handleProjChange(idx,'title',e.target.value)} />
                            <Input label="Technologies Used" id={`projTech-${idx}`} placeholder="React, Node.js, MongoDB" value={proj.technologies||''} onChange={e=>handleProjChange(idx,'technologies',e.target.value)} />
                            <Input label="Description" id={`projD-${idx}`} type="textarea" rows={4} value={proj.description||''} onChange={e=>handleProjChange(idx,'description',e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="GitHub Link" id={`projGH-${idx}`} placeholder="github.com/user/repo" value={proj.githubLink||''} onChange={e=>handleProjChange(idx,'githubLink',e.target.value)} />
                              <Input label="Live Demo (optional)" id={`projDemo-${idx}`} placeholder="https://yourapp.com" value={proj.liveDemo||''} onChange={e=>handleProjChange(idx,'liveDemo',e.target.value)} />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-dashed bg-white" onClick={addProj}><FiPlus className="mr-1.5"/>Add Project</Button>
                      </div>
                    )}

                    {/* 8. CERTIFICATIONS */}
                    {id === 'certifications' && (
                      <div className="flex flex-col gap-6">
                        {(resume.certifications||[]).map((cert, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-4 relative">
                            <button onClick={()=>removeCert(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 p-1"><FiTrash className="w-4 h-4"/></button>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Entry #{idx+1}</span>
                            <Input label="Certification Name" id={`certN-${idx}`} placeholder="AWS Cloud Practitioner" value={cert.name||''} onChange={e=>handleCertChange(idx,'name',e.target.value)} />
                            <div className="grid grid-cols-2 gap-4">
                              <Input label="Issuing Organization" id={`certOrg-${idx}`} placeholder="Amazon Web Services" value={cert.organization||''} onChange={e=>handleCertChange(idx,'organization',e.target.value)} />
                              <Input label="Year" id={`certYr-${idx}`} placeholder="2024" value={cert.year||''} onChange={e=>handleCertChange(idx,'year',e.target.value)} />
                            </div>
                            <Input label="Certificate Link (optional)" id={`certLink-${idx}`} placeholder="https://credentials.example.com/cert-id" value={cert.link||''} onChange={e=>handleCertChange(idx,'link',e.target.value)} />
                            <span className="text-[10px] -mt-2 text-slate-400 flex items-center gap-1">
                              <FiLink className="w-3 h-3"/> Link appears as a clickable credential in your resume.
                            </span>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="w-full border-dashed bg-white" onClick={addCert}><FiPlus className="mr-1.5"/>Add Certification</Button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ RIGHT PANEL — Live A4 Preview ══════════════════════════════ */}
      <div className="xl:col-span-7 flex flex-col gap-3 items-center w-full sticky top-20">
        <div className="flex items-center gap-3 self-center">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-100 px-3 py-1 rounded-full">
            📄 Live Preview — A4 Format
          </span>
          <button
            onClick={handleDownloadTrigger}
            className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
          >
            <FiDownload className="w-3 h-3"/> Download PDF
          </button>
        </div>

        {/* Scroll wrapper for smaller screens */}
        <div className="w-full overflow-x-auto rounded-xl shadow-2xl border border-slate-200">
          <ResumePreview ref={previewRef} resume={resume} />
        </div>

        <p className="text-[10px] text-slate-400 text-center">
          PDF captures exactly what you see above. Save first, then download.
        </p>
      </div>

      {/* ══ Download Modal ══════════════════════════════════════════════ */}
      <Modal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Download Resume PDF"
        footer={
          !compilingResume && (
            <>
              <Button variant="outline" onClick={() => setDownloadModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmDownload}>⬇ Download PDF</Button>
            </>
          )
        }
      >
        {compilingResume ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-brand-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-700">Preparing your resume…</h4>
              <p className="text-xs text-slate-400 mt-1">Laying out content, checking quality…</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto text-xl">✓</div>
            <div>
              <h3 className="font-extrabold text-slate-700 text-sm">Ready!</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                ATS Score: <b>{atsScore}/100</b> · Profile: <b>{resumeCompletion}%</b><br/>
                The PDF will be exactly as tall as your content — no blank pages.
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ResumeBuilder;
