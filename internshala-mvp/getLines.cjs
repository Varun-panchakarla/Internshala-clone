const fs = require('fs');
const content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');
const lines = content.split('\n');

const sectionsStart = lines.findIndex(l => l.includes('/* SECTIONS */'));
const sectionsEnd = lines.findIndex(l => l.includes('];') && l > sectionsStart);
console.log('--- SECTIONS ---');
lines.slice(sectionsStart, sectionsEnd + 1).forEach((l, i) => console.log(sectionsStart + i + 1, l));

const achStart = lines.findIndex(l => l.includes('id="achievements"') && l.includes('SectionCard'));
const intEnd = lines.findIndex(l => l.includes('id="interests"') && l.includes('SectionCard')) + 30;

console.log('--- ACHIEVEMENTS RENDER ---');
console.log('achStart:', achStart + 1, 'intEnd:', intEnd + 1);

console.log('--- GENDER/LOCATION/DOB ---');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('gender') || l.toLowerCase().includes('location') || l.toLowerCase().includes('dob')) {
    console.log(i + 1, l.trim());
  }
});
