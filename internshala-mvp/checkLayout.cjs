const fs = require('fs');
const content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');
const lines = content.split('\n');
const s2 = lines.findIndex(l => l.includes('className="h-screen'));
console.log(lines.slice(s2 - 2, s2 + 30).join('\n'));
