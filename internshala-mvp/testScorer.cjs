const fs = require('fs');
const code = fs.readFileSync('src/utils/atsScorer.js', 'utf8').replace(/export const/g, 'const');
eval(code + '\nconsole.log(calculateResumeCompletion({ personalInfo: { fullName: "John", email: "a@b.com" } }));');
