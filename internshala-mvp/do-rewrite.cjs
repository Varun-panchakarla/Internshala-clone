const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ResumeBuilder.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const startStr = '{sections.map(({ id, label, icon }) => (';
const endStr = '</SectionCard>\n            ))}';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr, startIndex) + endStr.length;

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find accordions');
    process.exit(1);
}

const accordionsStr = content.slice(startIndex, endIndex);

const newReturnTemplate = fs.readFileSync(path.join(__dirname, 'rewrite-resume.cjs'), 'utf8')
    .match(/let newReturn = `([\s\S]*?)`;/)[1];

const finalReturn = newReturnTemplate.replace('{/* ACCORDIONS_PLACEHOLDER */}', accordionsStr);

const returnStartIndex = content.indexOf('  return (\r\n    <div className="animate-slide-up">') !== -1 
    ? content.indexOf('  return (\r\n    <div className="animate-slide-up">')
    : content.indexOf('  return (\n    <div className="animate-slide-up">');
if (returnStartIndex === -1) {
    console.error('Could not find return statement');
    process.exit(1);
}

const beforeReturn = content.slice(0, returnStartIndex);

content = beforeReturn + finalReturn + '\n};\n\nexport default ResumeBuilder;\n';

fs.writeFileSync(filePath, content, 'utf8');
console.log('Success');
