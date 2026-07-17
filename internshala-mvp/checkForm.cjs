const fs = require('fs');
const content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');
const lines = content.split('\n');
const formIdx = lines.findIndex(l => l.includes('id="certifications"'));
console.log(lines.slice(formIdx, formIdx + 30).join('\n'));
