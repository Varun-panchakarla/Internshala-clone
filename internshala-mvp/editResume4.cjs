const fs = require('fs');

// --- 1. Fix backend route ---
let backendStr = fs.readFileSync('backend/routes/resume.js', 'utf8');
backendStr = backendStr.replace(
  `    if (!userResume.personalInfo.photo && userResume.personalInfo.photo !== '') { userResume.personalInfo.photo = ''; updated = true; }`,
  `    if (!userResume.personalInfo) { userResume.personalInfo = {}; updated = true; }
    if (!userResume.personalInfo.photo && userResume.personalInfo.photo !== '') { userResume.personalInfo.photo = ''; updated = true; }`
);
// Also remove gender fallback if present, but since the condition above avoids TypeError, it's fine.
fs.writeFileSync('backend/routes/resume.js', backendStr, 'utf8');

// --- 2. Fix EduRow in ResumeBuilder.jsx ---
let resumeBuilderStr = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');

const oldEduRow = `const EduRow = ({ edu, dark, mid, light }) => {
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
        <div style={{ fontSize: '10.5px', fontWeight: 600, color: light, flexShrink: 0, marginLeft: '20px' }}>
          {[edu.startYear, edu.endYear].filter(Boolean).join(' - ')}
        </div>
      )}
    </div>
  );
};`;

const newEduRow = `const EduRow = ({ edu, dark, mid, light }) => {
  const typeLabel = edu.type === '10th' ? '10th / Secondary' : edu.type === '12th' ? '12th / Intermediate (or Diploma)' : 'Graduation';
  const schoolLabel = edu.type === 'graduation' ? 'College' : 'School';
  const streamLabel = edu.type === 'graduation' ? 'Degree' : 'Stream';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '12px', color: dark, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{typeLabel}</div>
        {edu.institution && <div style={{ fontSize: '10.5px', color: mid, marginTop: '1px' }}><strong>{schoolLabel}:</strong> {edu.institution}</div>}
        {edu.board && <div style={{ fontSize: '10.5px', color: mid, marginTop: '1px' }}><strong>Board/University:</strong> {edu.board}</div>}
        {edu.degree && <div style={{ fontSize: '10.5px', color: mid, marginTop: '1px' }}><strong>{streamLabel}:</strong> {edu.degree}</div>}
        {edu.cgpa && <div style={{ fontSize: '10.5px', color: mid, marginTop: '1px' }}><strong>Score:</strong> {edu.cgpa}</div>}
        {(edu.startYear || edu.endYear) && <div style={{ fontSize: '10.5px', color: mid, marginTop: '1px' }}><strong>Year:</strong> {[edu.startYear, edu.endYear].filter(Boolean).join(' - ')}</div>}
      </div>
    </div>
  );
};`;

resumeBuilderStr = resumeBuilderStr.replace(oldEduRow, newEduRow);
fs.writeFileSync('src/pages/ResumeBuilder.jsx', resumeBuilderStr, 'utf8');

// --- 3. Fix resumeCompletion in ResumeContext.jsx ---
let contextStr = fs.readFileSync('src/context/ResumeContext.jsx', 'utf8');
if (contextStr.includes('const [resumeCompletion, setResumeCompletion] = useState(0);')) {
  contextStr = contextStr.replace(
    /const \[resumeCompletion, setResumeCompletion\] = useState\(0\);\s*useEffect\(\(\) => \{\s*if \(resume\) \{\s*setResumeCompletion\(calculateResumeCompletion\(resume\)\);\s*\}\s*\}, \[resume\]\);/,
    'const resumeCompletion = resume ? calculateResumeCompletion(resume) : 0;'
  );
} else {
  // if already modified or different syntax
  const match = contextStr.match(/const \[resumeCompletion/);
  if(match) console.log("resumeCompletion state found but regex didn't match.");
}
fs.writeFileSync('src/context/ResumeContext.jsx', contextStr, 'utf8');

console.log('Script completed');
