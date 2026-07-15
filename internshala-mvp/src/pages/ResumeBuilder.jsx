/**
 * ResumeBuilder.jsx
 * Modern Canva-style Resume Builder with:
 *  - Left sidebar: accordion form panels
 *  - Right panel: live template-aware A4 preview
 *  - Template quick-switcher in toolbar
 *  - ATS Score card, Progress card, Suggestions
 */
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';
import { useToast } from '../components/common/Toast';
import { TEMPLATES, getTemplateById } from '../data/resumeTemplates';
import {
  FiSave, FiDownload, FiPlus, FiTrash, FiAward,
  FiAlertCircle, FiChevronRight, FiBriefcase, FiBookOpen,
  FiUser, FiCode, FiFileText, FiCheckSquare, FiLink,
  FiLayout, FiZap, FiShield, FiEye,
} from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';
import { toPng } from 'html-to-image';
import { jsPDF as JsPDF } from 'jspdf';

/* â”€â”€â”€ A4 canvas width (794px = 210mm at 96dpi). Height auto (no blank space) â”€ */
const A4W = 794;

/* â”€â”€â”€ ensure url has a protocol â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const toHref = (u) => (!u ? '#' : /^https?:\/\//i.test(u) ? u : `https://${u}`);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TEMPLATE RENDERERS
   Each renderer receives (resume, tpl) and returns JSX for the A4 canvas.
   tpl = the TEMPLATES entry (contains preview colors, fonts etc.)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/* â”€â”€ Shared sub-components used across templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const Bullet = ({ text, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '3px' }}>
    <span style={{ color, fontSize: '9px', marginTop: '3px', flexShrink: 0 }}>â–¸</span>
    <span style={{ fontSize: '10.5px', color: '#374151', lineHeight: '1.6' }}>{text}</span>
  </div>
);

/* â”€â”€ Professional Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ProfessionalTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const p  = tpl.preview;
  const SH = {
    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
    color: '#0d0d0d', letterSpacing: '0.14em',
    borderBottom: '1px solid #b0b0b0', paddingBottom: '3px', marginBottom: '7px',
  };
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean);
  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '11.5px', color: '#0d0d0d', lineHeight: 1.5 }}>
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.15, fontFamily: '"Arial", sans-serif' }}>
          {pi.fullName || 'YOUR FULL NAME'}
        </div>
        <div style={{ height: '1px', backgroundColor: '#0d0d0d', margin: '7px 0 6px' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px 0', fontSize: '10px', color: '#2d2d2d', fontFamily: '"Arial", sans-serif' }}>
          {contacts.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {i > 0 && <span style={{ margin: '0 6px', color: '#b0b0b0' }}>|</span>}
              <span>{c}</span>
            </span>
          ))}
        </div>
      </div>
      {pi.summary && <TemplateSection title="Professional Summary" SH={SH}><p style={{ fontSize: '11px', color: '#2d2d2d', lineHeight: 1.7, textAlign: 'justify', margin: 0 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.filter(e => e.institution).length > 0 && (
        <TemplateSection title="Education" SH={SH}>
          {resume.education.filter(e => e.institution).map((edu, i) => (
            <EduRow key={i} edu={edu} dark="#0d0d0d" mid="#2d2d2d" light="#5a5a5a" />
          ))}
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
      {resume.experience?.filter(e => e.company || e.role).length > 0 && (
        <TemplateSection title="Professional Experience" SH={SH}>
          {resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => (
            <ExpRow key={i} item={exp} dark="#0d0d0d" mid="#2d2d2d" accent="#0d0d0d" last={i===arr.length-1} />
          ))}
        </TemplateSection>
      )}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && (
        <TemplateSection title="Internship" SH={SH}>
          {resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => (
            <ExpRow key={i} item={exp} dark="#0d0d0d" mid="#2d2d2d" accent="#0d0d0d" last={i===arr.length-1} />
          ))}
        </TemplateSection>
      )}
      {resume.projects?.filter(p => p.title).length > 0 && (
        <TemplateSection title="Projects" SH={SH}>
          {resume.projects.filter(p => p.title).map((proj, i, arr) => (
            <ProjectRow key={i} proj={proj} accent="#1a1a1a" last={i===arr.length-1} />
          ))}
        </TemplateSection>
      )}
      {resume.certifications?.filter(c => c.name).length > 0 && (
        <TemplateSection title="Certifications" SH={SH}>
          {resume.certifications.filter(c => c.name).map((cert, i, arr) => (
            <CertRow key={i} cert={cert} accent="#1a1a1a" last={i===arr.length-1} />
          ))}
        </TemplateSection>
      )}
    </div>
  );
};

/* â”€â”€ Modern Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ModernTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const BLUE = '#2563eb';
  const SH = {
    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
    color: BLUE, letterSpacing: '0.12em',
    borderBottom: `2px solid ${BLUE}`, paddingBottom: '3px', marginBottom: '8px',
  };
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean);
  return (
    <div style={{ fontFamily: '"Arial", sans-serif', fontSize: '11px', color: '#1e293b', lineHeight: 1.55 }}>
      <div style={{ backgroundColor: '#1e40af', padding: '24px 30px', margin: '-52px -58px 18px', color: '#fff' }}>
        <div style={{ fontSize: '26px', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
          {pi.fullName || 'YOUR FULL NAME'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: '10px', opacity: 0.85 }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
      {pi.summary && <TemplateSection title="Summary" SH={SH}><p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.7, margin: 0 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.filter(e => e.institution).length > 0 && (
        <TemplateSection title="Education" SH={SH}>
          {resume.education.filter(e => e.institution).map((edu, i) => <EduRow key={i} edu={edu} dark="#0f172a" mid="#334155" light="#64748b" />)}
        </TemplateSection>
      )}
      {resume.skills?.length > 0 && (
        <TemplateSection title="Skills" SH={SH}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
            {resume.skills.map((sk, i) => (
              <span key={i} style={{ backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #93c5fd', borderRadius: '4px', padding: '2px 9px', fontSize: '10px', fontWeight: 700 }}>{sk}</span>
            ))}
          </div>
        </TemplateSection>
      )}
      {resume.experience?.filter(e => e.company || e.role).length > 0 && (
        <TemplateSection title="Experience" SH={SH}>
          {resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={BLUE} last={i===arr.length-1} />)}
        </TemplateSection>
      )}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && (
        <TemplateSection title="Internship" SH={SH}>
          {resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={BLUE} last={i===arr.length-1} />)}
        </TemplateSection>
      )}
      {resume.projects?.filter(p => p.title).length > 0 && (
        <TemplateSection title="Projects" SH={SH}>
          {resume.projects.filter(p => p.title).map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent={BLUE} last={i===arr.length-1} />)}
        </TemplateSection>
      )}
      {resume.certifications?.filter(c => c.name).length > 0 && (
        <TemplateSection title="Certifications" SH={SH}>
          {resume.certifications.filter(c => c.name).map((cert, i, arr) => <CertRow key={i} cert={cert} accent={BLUE} last={i===arr.length-1} />)}
        </TemplateSection>
      )}
    </div>
  );
};

/* â”€â”€ Executive Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const ExecutiveTemplate = ({ resume }) => {
  const pi = resume.personalInfo || {};
  const GOLD = '#d97706';
  const SH = {
    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
    color: '#0f172a', letterSpacing: '0.14em',
    borderBottom: `2px solid ${GOLD}`, paddingBottom: '3px', marginBottom: '8px',
  };
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean);
  return (
    <div style={{ fontFamily: '"Georgia", serif', fontSize: '11.5px', color: '#0f172a', lineHeight: 1.55 }}>
      <div style={{ backgroundColor: '#0f172a', padding: '22px 30px', margin: '-52px -58px 18px', color: '#fff', borderBottom: `4px solid ${GOLD}` }}>
        <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: '"Georgia", serif' }}>
          {pi.fullName || 'YOUR FULL NAME'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: '10px', color: '#94a3b8', fontFamily: '"Arial", sans-serif' }}>
          {contacts.map((c, i) => <span key={i}>{i>0?'Â· ':''}{c}</span>)}
        </div>
      </div>
      {pi.summary && <TemplateSection title="Executive Profile" SH={SH}><p style={{ fontSize: '11px', color: '#1e293b', lineHeight: 1.7, margin: 0 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.filter(e => e.institution).length > 0 && <TemplateSection title="Education" SH={SH}>{resume.education.filter(e => e.institution).map((edu, i) => <EduRow key={i} edu={edu} dark="#0f172a" mid="#334155" light="#64748b" />)}</TemplateSection>}
      {resume.skills?.length > 0 && <TemplateSection title="Core Competencies" SH={SH}><div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{resume.skills.map((sk, i) => <span key={i} style={{ backgroundColor: '#fef3c7', color: '#78350f', border: '1px solid #fcd34d', borderRadius: '3px', padding: '2px 8px', fontSize: '10px', fontWeight: 700, fontFamily: '"Arial", sans-serif' }}>{sk}</span>)}</div></TemplateSection>}
      {resume.experience?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Career History" SH={SH}>{resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={GOLD} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Internship" SH={SH}>{resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={GOLD} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.projects?.filter(p => p.title).length > 0 && <TemplateSection title="Notable Projects" SH={SH}>{resume.projects.filter(p => p.title).map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent={GOLD} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.certifications?.filter(c => c.name).length > 0 && <TemplateSection title="Certifications" SH={SH}>{resume.certifications.filter(c => c.name).map((cert, i, arr) => <CertRow key={i} cert={cert} accent={GOLD} last={i===arr.length-1} />)}</TemplateSection>}
    </div>
  );
};

/* â”€â”€ Creative Template (two-column) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CreativeTemplate = ({ resume }) => {
  const pi = resume.personalInfo || {};
  const PURPLE = '#7c3aed';
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean);
  const SHMain = { fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: PURPLE, letterSpacing: '0.12em', borderBottom: `1.5px solid ${PURPLE}`, paddingBottom: '3px', marginBottom: '7px' };
  const SHSide = { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.12em', borderBottom: '1px solid rgba(255,255,255,0.25)', paddingBottom: '3px', marginBottom: '6px', marginTop: '12px' };
  return (
    <div style={{ display: 'flex', fontFamily: '"Arial", sans-serif', fontSize: '11px', lineHeight: 1.55, margin: '-52px -58px', minHeight: 'auto' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', minWidth: '220px', backgroundColor: PURPLE, color: '#fff', padding: '28px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1.2, textTransform: 'uppercase', marginBottom: '8px' }}>
            {pi.fullName || 'Your Name'}
          </div>
          {contacts.map((c, i) => (
            <div key={i} style={{ fontSize: '9px', color: 'rgba(255,255,255,0.75)', marginBottom: '3px', wordBreak: 'break-all' }}>{c}</div>
          ))}
        </div>
        {resume.skills?.length > 0 && (
          <>
            <div style={SHSide}>Skills</div>
            {resume.skills.map((sk, i) => (
              <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.85)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                {sk}
              </div>
            ))}
          </>
        )}
        {resume.education?.filter(e => e.institution).length > 0 && (
          <>
            <div style={{ ...SHSide, marginTop: '14px' }}>Education</div>
            {resume.education.filter(e => e.institution).map((edu, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#fff' }}>{edu.institution}</div>
                <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.7)' }}>{[edu.degree, edu.branch].filter(Boolean).join(', ')}</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.55)' }}>{[edu.startYear, edu.endYear].filter(Boolean).join(' â€“ ')}</div>
              </div>
            ))}
          </>
        )}
      </div>
      {/* Main content */}
      <div style={{ flex: 1, padding: '28px 24px', backgroundColor: '#fff' }}>
        {pi.summary && <TemplateSection title="About Me" SH={SHMain}><p style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.7, margin: 0 }}>{pi.summary}</p></TemplateSection>}
        {resume.experience?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Experience" SH={SHMain}>{resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#111827" mid="#374151" accent={PURPLE} last={i===arr.length-1} />)}</TemplateSection>}
        {resume.internship?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Internship" SH={SHMain}>{resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#111827" mid="#374151" accent={PURPLE} last={i===arr.length-1} />)}</TemplateSection>}
        {resume.projects?.filter(p => p.title).length > 0 && <TemplateSection title="Projects" SH={SHMain}>{resume.projects.filter(p => p.title).map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent={PURPLE} last={i===arr.length-1} />)}</TemplateSection>}
        {resume.certifications?.filter(c => c.name).length > 0 && <TemplateSection title="Certifications" SH={SHMain}>{resume.certifications.filter(c => c.name).map((cert, i, arr) => <CertRow key={i} cert={cert} accent={PURPLE} last={i===arr.length-1} />)}</TemplateSection>}
      </div>
    </div>
  );
};

/* â”€â”€ Minimal Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const MinimalTemplate = ({ resume }) => {
  const pi = resume.personalInfo || {};
  const SH = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.16em', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' };
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.website].filter(Boolean);
  return (
    <div style={{ fontFamily: '"Inter", Arial, sans-serif', fontSize: '11px', color: '#0f172a', lineHeight: 1.6 }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 300, letterSpacing: '0.02em', color: '#0f172a', marginBottom: '6px' }}>
          {pi.fullName || 'Your Full Name'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', fontSize: '10px', color: '#64748b' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
        <div style={{ height: '1px', backgroundColor: '#e2e8f0', marginTop: '12px' }} />
      </div>
      {pi.summary && <TemplateSection title="Profile" SH={SH}><p style={{ fontSize: '10.5px', color: '#475569', lineHeight: 1.75, margin: 0 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.filter(e => e.institution).length > 0 && <TemplateSection title="Education" SH={SH}>{resume.education.filter(e => e.institution).map((edu, i) => <EduRow key={i} edu={edu} dark="#0f172a" mid="#475569" light="#94a3b8" />)}</TemplateSection>}
      {resume.skills?.length > 0 && <TemplateSection title="Skills" SH={SH}><div style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.8 }}>{resume.skills.join('  Â·  ')}</div></TemplateSection>}
      {resume.experience?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Experience" SH={SH}>{resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#475569" accent="#475569" last={i===arr.length-1} />)}</TemplateSection>}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Internship" SH={SH}>{resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#475569" accent="#475569" last={i===arr.length-1} />)}</TemplateSection>}
      {resume.projects?.filter(p => p.title).length > 0 && <TemplateSection title="Projects" SH={SH}>{resume.projects.filter(p => p.title).map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent="#475569" last={i===arr.length-1} />)}</TemplateSection>}
      {resume.certifications?.filter(c => c.name).length > 0 && <TemplateSection title="Certifications" SH={SH}>{resume.certifications.filter(c => c.name).map((cert, i, arr) => <CertRow key={i} cert={cert} accent="#475569" last={i===arr.length-1} />)}</TemplateSection>}
    </div>
  );
};

/* â”€â”€ Fresher Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const FresherTemplate = ({ resume }) => {
  const pi = resume.personalInfo || {};
  const GREEN = '#059669';
  const SH = { fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: GREEN, letterSpacing: '0.12em', borderBottom: `2px solid ${GREEN}`, paddingBottom: '3px', marginBottom: '8px' };
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean);
  return (
    <div style={{ fontFamily: '"Arial", sans-serif', fontSize: '11px', color: '#064e3b', lineHeight: 1.55 }}>
      <div style={{ backgroundColor: '#ecfdf5', padding: '18px 24px', margin: '-52px -58px 18px', borderBottom: `3px solid ${GREEN}` }}>
        <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#064e3b', marginBottom: '4px' }}>
          {pi.fullName || 'YOUR FULL NAME'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: '10px', color: '#065f46' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
      {pi.summary && <TemplateSection title="Objective" SH={SH}><p style={{ fontSize: '11px', color: '#1f2937', lineHeight: 1.7, margin: 0 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.filter(e => e.institution).length > 0 && <TemplateSection title="Education" SH={SH}>{resume.education.filter(e => e.institution).map((edu, i) => <EduRow key={i} edu={edu} dark="#064e3b" mid="#065f46" light="#6b7280" />)}</TemplateSection>}
      {resume.skills?.length > 0 && <TemplateSection title="Technical Skills" SH={SH}><div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{resume.skills.map((sk, i) => <span key={i} style={{ backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', borderRadius: '4px', padding: '2px 9px', fontSize: '10px', fontWeight: 700 }}>{sk}</span>)}</div></TemplateSection>}
      {resume.projects?.filter(p => p.title).length > 0 && <TemplateSection title="Projects" SH={SH}>{resume.projects.filter(p => p.title).map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent={GREEN} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Internship" SH={SH}>{resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#064e3b" mid="#374151" accent={GREEN} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.experience?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Experience" SH={SH}>{resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#064e3b" mid="#374151" accent={GREEN} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.certifications?.filter(c => c.name).length > 0 && <TemplateSection title="Certifications" SH={SH}>{resume.certifications.filter(c => c.name).map((cert, i, arr) => <CertRow key={i} cert={cert} accent={GREEN} last={i===arr.length-1} />)}</TemplateSection>}
    </div>
  );
};

/* â”€â”€ Simple ATS Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SimpleATSTemplate = ({ resume }) => {
  const pi = resume.personalInfo || {};
  const SH = { fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', letterSpacing: '0.06em', borderBottom: '1px solid #9ca3af', paddingBottom: '2px', marginBottom: '7px' };
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean);
  return (
    <div style={{ fontFamily: '"Arial", sans-serif', fontSize: '11.5px', color: '#111827', lineHeight: 1.6 }}>
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{pi.fullName || 'YOUR FULL NAME'}</div>
        <div style={{ fontSize: '10px', color: '#374151' }}>{contacts.join(' | ')}</div>
        <div style={{ height: '1px', backgroundColor: '#374151', marginTop: '8px' }} />
      </div>
      {pi.summary && <TemplateSection title="Summary" SH={SH}><p style={{ fontSize: '11px', color: '#1f2937', margin: 0, lineHeight: 1.65 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.filter(e => e.institution).length > 0 && <TemplateSection title="Education" SH={SH}>{resume.education.filter(e => e.institution).map((edu, i) => <EduRow key={i} edu={edu} dark="#111827" mid="#374151" light="#6b7280" />)}</TemplateSection>}
      {resume.skills?.length > 0 && <TemplateSection title="Skills" SH={SH}><div style={{ fontSize: '11px', color: '#1f2937' }}>{resume.skills.join(', ')}</div></TemplateSection>}
      {resume.experience?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Experience" SH={SH}>{resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#111827" mid="#374151" accent="#374151" last={i===arr.length-1} />)}</TemplateSection>}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Internship" SH={SH}>{resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#111827" mid="#374151" accent="#374151" last={i===arr.length-1} />)}</TemplateSection>}
      {resume.projects?.filter(p => p.title).length > 0 && <TemplateSection title="Projects" SH={SH}>{resume.projects.filter(p => p.title).map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent="#374151" last={i===arr.length-1} />)}</TemplateSection>}
      {resume.certifications?.filter(c => c.name).length > 0 && <TemplateSection title="Certifications" SH={SH}>{resume.certifications.filter(c => c.name).map((cert, i, arr) => <CertRow key={i} cert={cert} accent="#374151" last={i===arr.length-1} />)}</TemplateSection>}
    </div>
  );
};

/* â”€â”€ Corporate Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CorporateTemplate = ({ resume }) => {
  const pi = resume.personalInfo || {};
  const TEAL = '#0369a1';
  const SH = { fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: TEAL, letterSpacing: '0.12em', borderBottom: `2px solid ${TEAL}`, paddingBottom: '3px', marginBottom: '8px' };
  const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean);
  return (
    <div style={{ fontFamily: '"Arial", sans-serif', fontSize: '11px', color: '#1e293b', lineHeight: 1.55 }}>
      <div style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)', padding: '22px 30px', margin: '-52px -58px 18px', color: '#fff' }}>
        <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '5px' }}>
          {pi.fullName || 'YOUR FULL NAME'}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: '10px', color: '#bae6fd' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
      {pi.summary && <TemplateSection title="Professional Summary" SH={SH}><p style={{ fontSize: '11px', color: '#334155', lineHeight: 1.7, margin: 0 }}>{pi.summary}</p></TemplateSection>}
      {resume.education?.filter(e => e.institution).length > 0 && <TemplateSection title="Education" SH={SH}>{resume.education.filter(e => e.institution).map((edu, i) => <EduRow key={i} edu={edu} dark="#0f172a" mid="#334155" light="#64748b" />)}</TemplateSection>}
      {resume.skills?.length > 0 && <TemplateSection title="Technical Skills" SH={SH}><div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{resume.skills.map((sk, i) => <span key={i} style={{ backgroundColor: '#e0f2fe', color: '#075985', border: '1px solid #7dd3fc', borderRadius: '4px', padding: '2px 9px', fontSize: '10px', fontWeight: 700 }}>{sk}</span>)}</div></TemplateSection>}
      {resume.experience?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Professional Experience" SH={SH}>{resume.experience.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={TEAL} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.internship?.filter(e => e.company || e.role).length > 0 && <TemplateSection title="Internship" SH={SH}>{resume.internship.filter(e => e.company || e.role).map((exp, i, arr) => <ExpRow key={i} item={exp} dark="#0f172a" mid="#334155" accent={TEAL} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.projects?.filter(p => p.title).length > 0 && <TemplateSection title="Projects" SH={SH}>{resume.projects.filter(p => p.title).map((proj, i, arr) => <ProjectRow key={i} proj={proj} accent={TEAL} last={i===arr.length-1} />)}</TemplateSection>}
      {resume.certifications?.filter(c => c.name).length > 0 && <TemplateSection title="Certifications" SH={SH}>{resume.certifications.filter(c => c.name).map((cert, i, arr) => <CertRow key={i} cert={cert} accent={TEAL} last={i===arr.length-1} />)}</TemplateSection>}
    </div>
  );
};

/* â”€â”€ Shared section/row atoms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const TemplateSection = ({ title, SH, children }) => (
  <div style={{ marginBottom: '14px' }}>
    <div style={SH}>{title}</div>
    {children}
  </div>
);

const EduRow = ({ edu, dark, mid, light }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '7px' }}>
    <div>
      <div style={{ fontWeight: 700, fontSize: '11.5px', color: dark }}>{edu.institution}</div>
      <div style={{ fontSize: '10.5px', color: mid, marginTop: '1px' }}>
        {[edu.degree, edu.branch].filter(Boolean).join(', ')}
        {edu.cgpa && <span style={{ color: light, marginLeft: '10px' }}>CGPA: {edu.cgpa}</span>}
      </div>
    </div>
    {(edu.startYear || edu.endYear) && (
      <span style={{ fontSize: '10.5px', fontWeight: 600, color: mid, flexShrink: 0, marginLeft: '20px' }}>
        {[edu.startYear, edu.endYear].filter(Boolean).join(' â€“ ')}
      </span>
    )}
  </div>
);

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
    {(proj.githubLink || proj.liveDemo) && (
      <div style={{ display: 'flex', gap: '16px', fontSize: '10px', marginTop: '3px' }}>
        {proj.githubLink && <a href={toHref(proj.githubLink)} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline', fontWeight: 600 }}>GitHub â†—</a>}
        {proj.liveDemo && <a href={toHref(proj.liveDemo)} target="_blank" rel="noreferrer" style={{ color: accent, textDecoration: 'underline', fontWeight: 600 }}>Live Demo â†—</a>}
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
      {cert.organization && <span style={{ color: '#6b7280', fontSize: '10px', marginLeft: '8px' }}>â€” {cert.organization}</span>}
      {cert.link && <div style={{ fontSize: '8.5px', color: '#9ca3af', marginTop: '1px', wordBreak: 'break-all' }}>{cert.link}</div>}
    </div>
    {cert.year && <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#374151', flexShrink: 0, marginLeft: '20px' }}>{cert.year}</span>}
  </div>
);

/* â”€â”€ Template Dispatcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LIVE A4 PREVIEW CANVAS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TEMPLATE QUICK-SWITCHER  (horizontal pill row)
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SECTION ACCORDION CARD  â€” premium collapsible card with status dot
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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
      {/* Icon box */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
        isOpen
          ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Label + status */}
      <div className="flex-1 min-w-0">
        <span className={`text-[13px] font-semibold transition-colors ${
          isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
        }`}>{label}</span>
      </div>

      {/* Done indicator */}
      {isDone && !isOpen && (
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
      )}

      {/* Chevron */}
      <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {/* Collapsible body */}
    {isOpen && (
      <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 animate-fade-in">
        {children}
      </div>
    )}
  </div>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ATS SCORE RING  â€” circular SVG score indicator
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN PAGE COMPONENT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const ResumeBuilder = () => {
  const {
    resume, loading, saving,
    resumeCompletion, atsScore, atsSuggestions, atsBreakdown,
    selectedTemplate, setSelectedTemplate,
    updatePersonalInfo, updateEducation, updateExperience,
    updateInternship, updateProjects, updateCertifications,
    updateSkills, saveResume,
  } = useResume();

  const { addToast }  = useToast();
  const previewRef    = useRef(null);

  const [activeSection, setActiveSection]        = useState('details');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [compilingResume, setCompilingResume]     = useState(false);
  const [skillsInput, setSkillsInput]             = useState('');
  const skillsInit                                 = useRef(false);

  React.useEffect(() => {
    if (resume?.skills && !skillsInit.current) {
      setSkillsInput(resume.skills.join(', '));
      skillsInit.current = true;
    }
  }, [resume?.skills]);

  if (loading || !resume) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Loading your resumeâ€¦</p>
      </div>
    );
  }

  /* â”€â”€ Form handlers (unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handlePersonalChange = (field, val) => updatePersonalInfo({ [field]: val });

  const handleEduChange  = (i,f,v) => { const u=[...resume.education]; u[i]={...u[i],[f]:v}; updateEducation(u); };
  const addEdu     = () => { updateEducation([...resume.education,{institution:'',degree:'',branch:'',cgpa:'',startYear:'',endYear:''}]); addToast('Education entry added','info'); };
  const removeEdu  = (i) => { updateEducation(resume.education.filter((_,idx)=>idx!==i)); addToast('Removed','info'); };

  const handleSkillsChange = (e) => setSkillsInput(e.target.value);
  const handleSkillsBlur   = () => { const arr=skillsInput.split(',').map(s=>s.trim()).filter(Boolean); updateSkills(arr); setSkillsInput(arr.join(', ')); };

  const handleExpChange  = (i,f,v) => { const u=[...resume.experience]; u[i]={...u[i],[f]:v}; updateExperience(u); };
  const addExp     = () => { updateExperience([...resume.experience,{company:'',role:'',duration:'',description:''}]); addToast('Experience added','info'); };
  const removeExp  = (i) => { updateExperience(resume.experience.filter((_,idx)=>idx!==i)); addToast('Removed','info'); };

  const handleInternChange = (i,f,v) => { const u=[...(resume.internship||[])]; u[i]={...u[i],[f]:v}; updateInternship(u); };
  const addIntern    = () => { updateInternship([...(resume.internship||[]),{company:'',role:'',duration:'',description:''}]); addToast('Internship added','info'); };
  const removeIntern = (i) => { updateInternship((resume.internship||[]).filter((_,idx)=>idx!==i)); addToast('Removed','info'); };

  const handleProjChange = (i,f,v) => { const u=[...resume.projects]; u[i]={...u[i],[f]:v}; updateProjects(u); };
  const addProj    = () => { updateProjects([...resume.projects,{title:'',technologies:'',description:'',githubLink:'',liveDemo:''}]); addToast('Project added','info'); };
  const removeProj = (i) => { updateProjects(resume.projects.filter((_,idx)=>idx!==i)); addToast('Removed','info'); };

  const handleCertChange = (i,f,v) => { const u=[...(resume.certifications||[])]; u[i]={...u[i],[f]:v}; updateCertifications(u); };
  const addCert    = () => { updateCertifications([...(resume.certifications||[]),{name:'',organization:'',year:'',link:''}]); addToast('Certification added','info'); };
  const removeCert = (i) => { updateCertifications((resume.certifications||[]).filter((_,idx)=>idx!==i)); addToast('Removed','info'); };

  const handleSave = async () => {
    const arr=skillsInput.split(',').map(s=>s.trim()).filter(Boolean);
    updateSkills(arr);
    try { await saveResume(); addToast('Resume saved!','success'); }
    catch { addToast('Save failed.','error'); }
  };

  /* â”€â”€ PDF download (unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const handleDownloadTrigger = () => { setDownloadModalOpen(true); setCompilingResume(true); setTimeout(()=>setCompilingResume(false),1600); };

  const handleConfirmDownload = async () => {
    setDownloadModalOpen(false);
    const el = previewRef.current;
    if (!el) { addToast('Preview not found!','error'); return; }
    addToast('Generating PDF\u2026','info');
    try {
      const dataUrl = await toPng(el, {
        quality: 0.98,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#ffffff',
        width: A4W,
        style: { width: A4W + 'px', transform: 'none' },
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load rendered image'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pdf    = new JsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      const pdfW   = pdf.internal.pageSize.getWidth();
      const pdfH   = pdf.internal.pageSize.getHeight();
      const pxPerMm = canvas.width / pdfW;
      const pageHpx = Math.round(pdfH * pxPerMm);
      let yOff=0, page=0;
      while(yOff<canvas.height){
        if(page>0) pdf.addPage();
        const sliceH=Math.min(pageHpx,canvas.height-yOff);
        const pc=document.createElement('canvas'); pc.width=canvas.width; pc.height=Math.ceil(sliceH);
        const ctx2=pc.getContext('2d'); ctx2.fillStyle='#ffffff'; ctx2.fillRect(0,0,pc.width,pc.height);
        ctx2.drawImage(canvas,0,yOff,canvas.width,sliceH,0,0,canvas.width,sliceH);
        pdf.addImage(pc.toDataURL('image/jpeg',0.98),'JPEG',0,0,pdfW,sliceH/pxPerMm);
        yOff+=pageHpx; page++;
      }
      pdf.save('Resume.pdf');
      addToast('Resume.pdf downloaded!','success');
    } catch(err) { console.error(err); addToast(`PDF generation failed: ${err.message}`,'error'); }
  };

  /* â”€â”€ Derived values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const currentTpl = getTemplateById(selectedTemplate);

  const sectionsDone = {
    details:        !!(resume.personalInfo?.fullName && resume.personalInfo?.email),
    summary:        !!(resume.personalInfo?.summary),
    education:      !!(resume.education?.some(e=>e.institution)),
    skills:         !!(resume.skills?.length > 0),
    internship:     !!(resume.internship?.some(e=>e.company||e.role)),
    projects:       !!(resume.projects?.some(e=>e.title)),
    certifications: !!(resume.certifications?.some(e=>e.name)),
  };
  const completedCount = Object.values(sectionsDone).filter(Boolean).length;

  const scoreColor = atsScore >= 80 ? 'text-emerald-600' : atsScore >= 55 ? 'text-amber-500' : 'text-rose-500';
  const scoreLabel = atsScore >= 80 ? 'Excellent' : atsScore >= 55 ? 'Good' : 'Needs Work';

  /* ATS breakdown config */
  const atsConfig = {
    contactDetails:      { label: 'Contact Details',     max: 15, icon: FiUser },
    professionalSummary: { label: 'Summary',             max: 10, icon: FiFileText },
    education:           { label: 'Education',           max: 15, icon: FiBookOpen },
    skills:              { label: 'Skills',              max: 15, icon: FiAward },
    experience:          { label: 'Experience',          max: 15, icon: FiBriefcase },
    internship:          { label: 'Internship',          max: 10, icon: FiBriefcase },
    projects:            { label: 'Projects',            max: 10, icon: FiCode },
    certifications:      { label: 'Certifications',      max: 5,  icon: FiCheckSquare },
  };

  /* â”€â”€ Form sections config (ordered per requirement) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const sections = [
    { id:'details',        label:'Personal Information',    icon: FiUser },
    { id:'summary',        label:'Professional Summary',    icon: FiFileText },
    { id:'education',      label:'Education',               icon: FiBookOpen },
    { id:'skills',         label:'Skills',                  icon: FiAward },
    { id:'internship',     label:'Internship',              icon: FiBriefcase },
    { id:'projects',       label:'Projects',                icon: FiCode },
    { id:'certifications', label:'Certifications',          icon: FiCheckSquare },
  ];

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     RENDER â€” 3-column layout
     Left:  Form + ATS (independent scroll, fixed height viewport)
     Right: Sticky A4 preview (independent scroll)
  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <div className="animate-slide-up">

      {/* â•â•â• TOP HEADER BAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-5 overflow-hidden">

        {/* Primary toolbar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-y-3">
          {/* Title block */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ background: `linear-gradient(135deg, ${['#ffffff','#e2e8f0','#9ca3af'].includes(currentTpl?.preview?.accentBar) ? '#334155' : currentTpl?.preview?.accentBar} 0%, ${['#ffffff','#e2e8f0','#9ca3af'].includes(currentTpl?.preview?.headerBg) ? '#1e293b' : currentTpl?.preview?.headerBg} 100%)` }}
            >
              <FiFileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight">Resume Builder</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                Template: <span className="font-semibold text-slate-600 dark:text-slate-400">{currentTpl?.name}</span>
                {currentTpl?.isATS && (
                  <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                    <FiShield className="w-2.5 h-2.5" /> ATS Friendly
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/resume-templates"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-150"
            >
              <FiLayout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Templates</span>
            </Link>
            <button
              onClick={handleDownloadTrigger}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 transition-all duration-150 active:scale-95"
            >
              <FiDownload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold shadow-sm shadow-brand-500/25 hover:shadow-md hover:shadow-brand-500/30 transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            >
              {saving ? (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <FiSave className="w-3.5 h-3.5" />}
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Template switcher strip */}
        <div className="px-5 py-3">
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em] mb-2">Quick Switch Template</p>
          <TemplateSwitcher selectedTemplate={selectedTemplate} onSwitch={setSelectedTemplate} />
        </div>
      </div>

      {/* â•â•â• STATS STRIP â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* ATS Score */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex items-center gap-4">
          <div className="relative shrink-0">
            <ScoreRing score={atsScore} size={56} stroke={5} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-[13px] font-black ${scoreColor}`}>{atsScore}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ATS Score</p>
            <p className={`text-sm font-extrabold mt-0.5 ${scoreColor}`}>{scoreLabel}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">out of 100 pts</p>
          </div>
        </div>

        {/* Completion */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completion</p>
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-0.5 leading-none">
                {resumeCompletion}<span className="text-sm font-semibold text-slate-400">%</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
              <FiZap className="w-4 h-4 text-brand-500" />
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
              style={{ width: `${resumeCompletion}%` }}
            />
          </div>
        </div>

        {/* Sections done */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sections Done</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5 leading-none">
                {completedCount}<span className="text-sm font-semibold text-slate-400">/7</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <FiCheckSquare className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({length:7},(_,i)=>(
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i<completedCount?'bg-emerald-500':'bg-slate-100 dark:bg-slate-800'}`}/>
            ))}
          </div>
        </div>
      </div>

      {/* â•â•â• THREE-PANEL MAIN AREA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-5 items-start">

        {/* â”€â”€ LEFT COLUMN: Form + ATS (independent scroll) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div
          className="flex flex-col gap-4 xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto xl:pr-1 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >

          {/* â• ATS BREAKDOWN CARD â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <FiShield className="w-3 h-3 text-violet-500" />
                </div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">ATS Breakdown</h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                atsScore >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                atsScore >= 55 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' :
                'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
              }`}>{atsScore}/100</span>
            </div>

            <div className="px-5 py-4 flex flex-col gap-3">
              {Object.entries(atsBreakdown).map(([key, val]) => {
                const cfg = atsConfig[key];
                if (!cfg) return null;
                const pct   = cfg.max ? Math.round((val / cfg.max) * 100) : 0;
                const Icon  = cfg.icon;
                const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400';
                const tc    = pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500';
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{cfg.label}</span>
                      </div>
                      <span className={`text-[11px] font-bold ${tc}`}>{Math.round(val)}/{cfg.max}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* â• ATS SUGGESTIONS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {atsSuggestions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                  <FiAlertCircle className="w-3 h-3 text-rose-500" />
                </div>
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-white flex-1">Suggestions</h3>
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

          {/* â• SECTION ACCORDION CARDS â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          <div className="flex flex-col gap-2">
            {sections.map(({ id, label, icon }) => (
              <SectionCard
                key={id}
                id={id}
                label={label}
                icon={icon}
                isOpen={activeSection === id}
                isDone={sectionsDone[id]}
                onToggle={() => setActiveSection(activeSection === id ? '' : id)}
              >

                {/* â”€â”€ Personal Information â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {id === 'details' && (
                  <div className="flex flex-col gap-4">
                    <Input label="Full Name *" id="resName" placeholder="e.g. Rahul Sharma" value={resume.personalInfo.fullName||''} onChange={e=>handlePersonalChange('fullName',e.target.value)}/>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Email *" id="resEmail" placeholder="you@email.com" value={resume.personalInfo.email||''} onChange={e=>handlePersonalChange('email',e.target.value)}/>
                      <Input label="Phone" id="resPhone" placeholder="+91 9876543210" value={resume.personalInfo.phone||''} onChange={e=>handlePersonalChange('phone',e.target.value)}/>
                    </div>
                    <Input label="Location" id="resLoc" placeholder="Hyderabad, India" value={resume.personalInfo.location||''} onChange={e=>handlePersonalChange('location',e.target.value)}/>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="LinkedIn" id="resLI" placeholder="linkedin.com/in/username" value={resume.personalInfo.linkedin||''} onChange={e=>handlePersonalChange('linkedin',e.target.value)}/>
                      <Input label="GitHub" id="resGH" placeholder="github.com/username" value={resume.personalInfo.github||''} onChange={e=>handlePersonalChange('github',e.target.value)}/>
                    </div>
                    <Input label="Portfolio URL" id="resWeb" placeholder="yourportfolio.com" value={resume.personalInfo.website||''} onChange={e=>handlePersonalChange('website',e.target.value)}/>
                  </div>
                )}

                {/* â”€â”€ Professional Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {id === 'summary' && (
                  <div className="flex flex-col gap-3">
                    <Input label="Professional Summary" id="resSummary" type="textarea" rows={5}
                      placeholder="Results-driven software engineer with 3+ years of experience building scalable web applicationsâ€¦"
                      value={resume.personalInfo.summary||''} onChange={e=>handlePersonalChange('summary',e.target.value)}/>
                    <div className="flex items-start gap-2 p-3 bg-brand-50 dark:bg-brand-900/15 rounded-xl border border-brand-100 dark:border-brand-800/30">
                      <FiZap className="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0"/>
                      <p className="text-[11px] text-brand-700 dark:text-brand-400 leading-relaxed">
                        <strong>ATS Tip:</strong> Aim for 30â€“60 words. Include your job title, top skills, and years of experience. Avoid pronouns.
                      </p>
                    </div>
                  </div>
                )}

                {/* â”€â”€ Education â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {id === 'education' && (
                  <div className="flex flex-col gap-4">
                    {resume.education.map((edu,idx) => (
                      <div key={idx} className="relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entry #{idx+1}</span>
                          <button onClick={()=>removeEdu(idx)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            <FiTrash className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Input label="College / University" id={`eduInst-${idx}`} value={edu.institution||''} onChange={e=>handleEduChange(idx,'institution',e.target.value)}/>
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="Degree" id={`eduDeg-${idx}`} placeholder="B.Tech / MBA" value={edu.degree||''} onChange={e=>handleEduChange(idx,'degree',e.target.value)}/>
                            <Input label="Branch" id={`eduBranch-${idx}`} placeholder="Computer Science" value={edu.branch||''} onChange={e=>handleEduChange(idx,'branch',e.target.value)}/>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <Input label="CGPA" id={`eduCGPA-${idx}`} placeholder="8.5" value={edu.cgpa||''} onChange={e=>handleEduChange(idx,'cgpa',e.target.value)}/>
                            <Input label="From" id={`eduFrom-${idx}`} placeholder="2021" value={edu.startYear||''} onChange={e=>handleEduChange(idx,'startYear',e.target.value)}/>
                            <Input label="To" id={`eduTo-${idx}`} placeholder="2025" value={edu.endYear||''} onChange={e=>handleEduChange(idx,'endYear',e.target.value)}/>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={addEdu} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all">
                      <FiPlus className="w-4 h-4"/> Add Education
                    </button>
                  </div>
                )}

                {/* â”€â”€ Skills â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {id === 'skills' && (
                  <div className="flex flex-col gap-4">
                    <Input label="Skills (comma-separated)" id="resSkills"
                      placeholder="React, JavaScript, Node.js, Python, Git, Dockerâ€¦"
                      value={skillsInput} onChange={handleSkillsChange} onBlur={handleSkillsBlur}/>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 -mt-1 flex items-center gap-1">
                      <FiLink className="w-3 h-3"/> Separate with commas. Tags preview after you click away.
                    </p>
                    {resume.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                        {resume.skills.map((sk,i) => (
                          <span key={i} className="text-[11px] bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800/30 px-2.5 py-0.5 rounded-full font-medium">{sk}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* â”€â”€ Internship â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {id === 'internship' && (
                  <div className="flex flex-col gap-4">
                    {(resume.internship||[]).map((intern,idx) => (
                      <div key={idx} className="relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entry #{idx+1}</span>
                          <button onClick={()=>removeIntern(idx)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            <FiTrash className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="Company" id={`intCo-${idx}`} value={intern.company||''} onChange={e=>handleInternChange(idx,'company',e.target.value)}/>
                            <Input label="Role" id={`intRole-${idx}`} value={intern.role||''} onChange={e=>handleInternChange(idx,'role',e.target.value)}/>
                          </div>
                          <Input label="Duration" id={`intDur-${idx}`} placeholder="May 2023 â€“ Aug 2023" value={intern.duration||''} onChange={e=>handleInternChange(idx,'duration',e.target.value)}/>
                          <Input label="Description" id={`intDesc-${idx}`} type="textarea" rows={4}
                            placeholder="Describe your role, tools used, and impactâ€¦"
                            value={intern.description||''} onChange={e=>handleInternChange(idx,'description',e.target.value)}/>
                        </div>
                      </div>
                    ))}
                    <button onClick={addIntern} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all">
                      <FiPlus className="w-4 h-4"/> Add Internship
                    </button>
                  </div>
                )}

                {/* â”€â”€ Projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {id === 'projects' && (
                  <div className="flex flex-col gap-4">
                    {resume.projects.map((proj,idx) => (
                      <div key={idx} className="relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project #{idx+1}</span>
                          <button onClick={()=>removeProj(idx)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            <FiTrash className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Input label="Project Title" id={`projT-${idx}`} placeholder="e.g. AI Job Portal" value={proj.title||''} onChange={e=>handleProjChange(idx,'title',e.target.value)}/>
                          <Input label="Technologies Used" id={`projTech-${idx}`} placeholder="React, Node.js, MongoDB" value={proj.technologies||''} onChange={e=>handleProjChange(idx,'technologies',e.target.value)}/>
                          <Input label="Description" id={`projD-${idx}`} type="textarea" rows={4}
                            placeholder="Describe what you built, your contribution, and the impactâ€¦"
                            value={proj.description||''} onChange={e=>handleProjChange(idx,'description',e.target.value)}/>
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="GitHub Link" id={`projGH-${idx}`} placeholder="github.com/user/repo" value={proj.githubLink||''} onChange={e=>handleProjChange(idx,'githubLink',e.target.value)}/>
                            <Input label="Live Demo" id={`projDemo-${idx}`} placeholder="yourapp.com" value={proj.liveDemo||''} onChange={e=>handleProjChange(idx,'liveDemo',e.target.value)}/>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={addProj} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all">
                      <FiPlus className="w-4 h-4"/> Add Project
                    </button>
                  </div>
                )}

                {/* â”€â”€ Certifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {id === 'certifications' && (
                  <div className="flex flex-col gap-4">
                    {(resume.certifications||[]).map((cert,idx) => (
                      <div key={idx} className="relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certification #{idx+1}</span>
                          <button onClick={()=>removeCert(idx)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
                            <FiTrash className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Input label="Certification Name" id={`certN-${idx}`} placeholder="AWS Cloud Practitioner" value={cert.name||''} onChange={e=>handleCertChange(idx,'name',e.target.value)}/>
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="Issuing Organization" id={`certOrg-${idx}`} placeholder="Amazon / Google" value={cert.organization||''} onChange={e=>handleCertChange(idx,'organization',e.target.value)}/>
                            <Input label="Year" id={`certYr-${idx}`} placeholder="2024" value={cert.year||''} onChange={e=>handleCertChange(idx,'year',e.target.value)}/>
                          </div>
                          <Input label="Credential URL (optional)" id={`certLink-${idx}`} placeholder="https://credentials.example.com/â€¦" value={cert.link||''} onChange={e=>handleCertChange(idx,'link',e.target.value)}/>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 -mt-1">
                            <FiLink className="w-3 h-3"/> Link will appear as clickable credential in resume PDF.
                          </p>
                        </div>
                      </div>
                    ))}
                    <button onClick={addCert} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all">
                      <FiPlus className="w-4 h-4"/> Add Certification
                    </button>
                  </div>
                )}

              </SectionCard>
            ))}
          </div>

        </div>{/* end LEFT column */}

        {/* â”€â”€ RIGHT COLUMN: Sticky A4 Preview (independent scroll) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="xl:sticky xl:top-20 flex flex-col gap-3">

          {/* Preview label row */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <FiEye className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-[0.12em]">
                Live Preview â€” <span className="text-slate-600 dark:text-slate-400">{currentTpl?.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {currentTpl?.isATS && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 px-2.5 py-1 rounded-full">
                  <FiShield className="w-2.5 h-2.5"/> ATS Optimized
                </span>
              )}
            </div>
          </div>

          {/* Paper sheet wrapper â€” the shadow gives it the real paper feel */}
          <div
            className="xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto rounded-2xl scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 40px -10px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.06)',
                background: '#f8f9fa',
              }}
            >
              {/* Top paper edge highlight */}
              <div className="h-px bg-white/80" />
              <ResumePreview ref={previewRef} resume={resume} templateId={selectedTemplate} />
              {/* Bottom shadow */}
              <div style={{ height: '6px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.04), transparent)' }} />
            </div>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center px-4 leading-relaxed">
            PDF matches exactly what you see above. Save your work before downloading.
          </p>
        </div>

      </div>{/* end three-panel grid */}

      {/* â•â•â• DOWNLOAD MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
              <h4 className="text-sm font-bold text-slate-700 dark:text-white">Preparing your PDFâ€¦</h4>
              <p className="text-xs text-slate-400 mt-1">Template: <strong>{currentTpl?.name}</strong></p>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white">Ready to Download</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Template: <strong>{currentTpl?.name}</strong> Â· ATS Score: <strong>{atsScore}/100</strong> Â· Completion: <strong>{resumeCompletion}%</strong>
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ResumeBuilder;
