const fs = require('fs');
const content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');
const lines = content.split('\n');
const rowIdx = lines.findIndex(l => l.includes('const EduRow ='));
console.log(lines.slice(rowIdx, rowIdx + 20).join('\n'));

const templateIdx = lines.findIndex(l => l.includes('title="Education"'));
if(templateIdx > -1) {
  console.log(lines.slice(templateIdx - 2, templateIdx + 15).join('\n'));
} else {
  console.log('No title="Education" found. Checking for "resume.education" in templates.');
  const edu2 = lines.findIndex(l => l.includes('resume.education'));
  console.log(lines.slice(edu2 - 2, edu2 + 15).join('\n'));
}
