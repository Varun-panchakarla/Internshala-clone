const fs = require('fs');
let content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');

// 1. Fix template fallbacks
content = content.replace(
  "const MinimalTemplate = ({resume}) => <ProfessionalTemplate resume={resume} tpl={{}}/>;",
  "const MinimalTemplate = ({resume, tpl}) => <ModernTemplate resume={resume} tpl={tpl}/>;"
);
content = content.replace(
  "const ExecutiveTemplate = ({resume}) => <ProfessionalTemplate resume={resume} tpl={{}}/>;",
  "const ExecutiveTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;"
);
content = content.replace(
  "const CreativeTemplate = ({resume}) => <ProfessionalTemplate resume={resume} tpl={{}}/>;",
  "const CreativeTemplate = ({resume, tpl}) => <ModernTemplate resume={resume} tpl={tpl}/>;"
);
content = content.replace(
  "const FresherTemplate = ({resume}) => <ProfessionalTemplate resume={resume} tpl={{}}/>;",
  "const FresherTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;"
);
content = content.replace(
  "const SimpleATSTemplate = ({resume}) => <ProfessionalTemplate resume={resume} tpl={{}}/>;",
  "const SimpleATSTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;"
);
content = content.replace(
  "const CorporateTemplate = ({resume}) => <ProfessionalTemplate resume={resume} tpl={{}}/>;",
  "const CorporateTemplate = ({resume, tpl}) => <ProfessionalTemplate resume={resume} tpl={tpl}/>;"
);

// 2. Fix h-screen for separate scroll bars
content = content.replace(
  '<div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]',
  '<div className="h-screen bg-slate-50 dark:bg-[#0B1120]'
);

// 3. Make certification link more explicit (if user expects it to say 'Link' or be visible)
// Let's modify CertRow
const oldCertRow = `const CertRow = ({ cert, accent, last }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: last ? 0 : '7px' }}>
    <div style={{ flex: 1 }}>
      {cert.link
        ? <a href={toHref(cert.link)} target="_blank" rel="noreferrer" style={{ fontWeight: 700, fontSize: '11px', color: accent, textDecoration: 'underline', textUnderlineOffset: '2px' }}>{cert.name}</a>
        : <span style={{ fontWeight: 700, fontSize: '11px', color: '#111827' }}>{cert.name}</span>
      }
      {cert.organization && <span style={{ color: '#6b7280', fontSize: '10px', marginLeft: '8px' }}>— {cert.organization}</span>}
    </div>
    {cert.year && <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#374151', flexShrink: 0, marginLeft: '20px' }}>{cert.year}</span>}
  </div>
);`;

const newCertRow = `const CertRow = ({ cert, accent, last }) => (
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
);`;
content = content.replace(oldCertRow, newCertRow);

fs.writeFileSync('src/pages/ResumeBuilder.jsx', content, 'utf8');
console.log('Script completed');
