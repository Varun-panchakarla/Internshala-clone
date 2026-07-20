const fs = require('fs');
let content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');

// Replace ProfessionalTemplate color
content = content.replace(
  `const ProfessionalTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const BLUE = '#2563eb';`,
  `const ProfessionalTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const BLUE = tpl?.color || '#2563eb';`
);

// Replace ModernTemplate color
content = content.replace(
  `const ModernTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const BLUE = '#2563eb';`,
  `const ModernTemplate = ({ resume, tpl }) => {
  const pi = resume.personalInfo || {};
  const BLUE = tpl?.color || '#2563eb';`
);

content = content.replace(
  `backgroundColor: '#1e40af'`,
  `backgroundColor: BLUE`
);

fs.writeFileSync('src/pages/ResumeBuilder.jsx', content, 'utf8');
console.log('Templates patched');
