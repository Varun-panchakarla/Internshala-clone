const fs = require('fs');
const content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');
const lines = content.split('\n');
const formStart = lines.findIndex(l => l.includes('label="Full Name"'));
if (formStart > -1) {
  console.log(lines.slice(formStart - 2, formStart + 10).join('\n'));
} else {
  console.log('Not found');
}
