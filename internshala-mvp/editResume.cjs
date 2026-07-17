const fs = require('fs');
let content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');

// 1. Remove Achievements, Languages, Interests from SECTIONS array
content = content.replace(`    {
      id: 'achievements', label: 'Achievements', icon: FiAward,
      isDone: resume?.achievements?.length > 0,
    },`, '');
content = content.replace(`    {
      id: 'languages', label: 'Languages', icon: FiGlobe,
      isDone: resume?.languages?.length > 0,
    },`, '');
content = content.replace(`    {
      id: 'interests', label: 'Interests', icon: FiHeart,
      isDone: resume?.interests?.length > 0,
    },`, '');

// 2. Remove Gender and Location from Templates
content = content.replace('const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.portfolio].filter(Boolean);', 'const contacts = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio].filter(Boolean);');
content = content.replace('const extraDetails = [pi.dob && `DOB: ${pi.dob}`, pi.gender && `Gender: ${pi.gender}`].filter(Boolean);', 'const extraDetails = [pi.dob && `DOB: ${pi.dob}`].filter(Boolean);');
content = content.replace('const contacts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github, pi.portfolio, pi.website].filter(Boolean);', 'const contacts = [pi.email, pi.phone, pi.linkedin, pi.github, pi.portfolio, pi.website].filter(Boolean);');

// 3. Remove Gender and Location from Input form
// First, Gender
const genderStr = `                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                  <select value={pi.gender || ''} onChange={e => updatePersonalInfo({ gender: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>`;
content = content.replace(genderStr, '');

// Next, Location
const locationStr = `<Input label="Location (City, Country)" placeholder="New York, USA" value={pi.location || ''} onChange={e => updatePersonalInfo({ location: e.target.value })} />`;
content = content.replace(locationStr, '');

// 4. Remove Achievements, Languages, Interests render sections (Left form pane)
const achIdx = content.indexOf('<SectionCard id="achievements"');
if (achIdx > -1) {
  const achEnd = content.indexOf('</SectionCard>', achIdx) + '</SectionCard>'.length;
  content = content.slice(0, achIdx) + content.slice(achEnd);
}

const langIdx = content.indexOf('<SectionCard id="languages"');
if (langIdx > -1) {
  const langEnd = content.indexOf('</SectionCard>', langIdx) + '</SectionCard>'.length;
  content = content.slice(0, langIdx) + content.slice(langEnd);
}

const intIdx = content.indexOf('<SectionCard id="interests"');
if (intIdx > -1) {
  const intEnd = content.indexOf('</SectionCard>', intIdx) + '</SectionCard>'.length;
  content = content.slice(0, intIdx) + content.slice(intEnd);
}

// 5. Remove from ProfessionalTemplate
const proAchIdx = content.indexOf('{resume.achievements && resume.achievements.length > 0 && (');
if (proAchIdx > -1) {
  // It spans until the next div closing the section
  const nextSection = content.indexOf('{resume.languages', proAchIdx);
  if (nextSection > -1) {
    content = content.slice(0, proAchIdx) + content.slice(nextSection);
  }
}

const proLangIdx = content.indexOf('{resume.languages && resume.languages.length > 0 && (');
if (proLangIdx > -1) {
  const nextSection = content.indexOf('{resume.interests', proLangIdx);
  if (nextSection > -1) {
    content = content.slice(0, proLangIdx) + content.slice(nextSection);
  }
}

const proIntIdx = content.indexOf('{resume.interests && resume.interests.length > 0 && (');
if (proIntIdx > -1) {
  // Since Interests is the last section in Professional Template, we find the end of the template (</div> </div>)
  const endTemplate = content.indexOf('</div>', proIntIdx + 200); 
  // Let's just use regex for these specific blocks in the preview, as they are predictable:
}

// Safer way to remove them from BOTH templates:
content = content.replace(/{resume\.achievements && resume\.achievements\.length > 0 && \([\s\S]*?<\/div>\s*\)}/g, '');
content = content.replace(/{resume\.languages && resume\.languages\.length > 0 && \([\s\S]*?<\/div>\s*\)}/g, '');
content = content.replace(/{resume\.interests && resume\.interests\.length > 0 && \([\s\S]*?<\/div>\s*\)}/g, '');

// 6. Fix Education section template format!
const proEduOld = `{resume.education && resume.education.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-2 border-b-2 border-brand-600 pb-1">
            Education
          </h3>
          <div className="flex flex-col gap-2">
            {resume.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-slate-800 text-[13px]">{edu.institution}</h4>
                  <div className="text-slate-600">
                    {edu.degree} {edu.board && \`| \${edu.board}\`}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-medium text-slate-700">{edu.year || edu.endYear}</div>
                  {(edu.cgpa || edu.score) && <div className="text-brand-600 font-semibold">{edu.cgpa || edu.score}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}`;

const proEduNew = `{resume.education && resume.education.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-2 border-b-2 border-brand-600 pb-1">
            Education
          </h3>
          <div className="flex flex-col gap-2">
            {resume.education.map((edu, i) => {
              const eduTypeLabel = edu.type === '10th' ? '10th / Secondary' : edu.type === '12th' ? '12th / Intermediate' : 'Graduation';
              return (
                <div key={i} className="mb-2">
                  <h4 className="font-bold text-brand-700 text-[12px]">{eduTypeLabel}</h4>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-slate-800 text-[13px]">{edu.institution}</div>
                      <div className="text-slate-600 text-[12px]">
                        {edu.type === 'graduation' ? \`Degree: \${edu.degree}\` : \`Board: \${edu.board || edu.degree}\`}
                        {edu.stream ? \` | Stream: \${edu.stream}\` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium text-slate-700 text-[12px]">Year: {edu.year || edu.endYear}</div>
                      {(edu.cgpa || edu.score) && <div className="text-brand-600 font-semibold text-[12px]">Score: {edu.cgpa || edu.score}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}`;

content = content.replace(proEduOld, proEduNew);

const modernEduOld = `{resume.education && resume.education.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[13px] font-bold text-brand-700 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Education
            </h3>
            <div className="flex flex-col gap-2">
              {resume.education.map((edu, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-slate-800 text-[13px]">{edu.degree}</h4>
                  <div className="text-slate-600 text-[12px]">{edu.institution} {edu.board && \`- \${edu.board}\`}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="text-brand-600 font-medium">{edu.year || edu.endYear}</span>
                    {(edu.cgpa || edu.score) && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="font-semibold text-slate-700">{edu.cgpa || edu.score}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}`;

const modernEduNew = `{resume.education && resume.education.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[13px] font-bold text-brand-700 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              Education
            </h3>
            <div className="flex flex-col gap-2">
              {resume.education.map((edu, i) => {
                const eduTypeLabel = edu.type === '10th' ? '10th / Secondary' : edu.type === '12th' ? '12th / Intermediate' : 'Graduation';
                return (
                  <div key={i} className="mb-2">
                    <h4 className="font-bold text-brand-600 text-[12px] mb-0.5">{eduTypeLabel}</h4>
                    <div className="font-semibold text-slate-800 text-[13px]">{edu.type === 'graduation' ? edu.degree : edu.board || edu.degree} {edu.stream ? \`- \${edu.stream}\` : ''}</div>
                    <div className="text-slate-600 text-[12px]">{edu.institution}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="text-slate-700 font-medium">Year: {edu.year || edu.endYear}</span>
                      {(edu.cgpa || edu.score) && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="font-semibold text-brand-600">Score: {edu.cgpa || edu.score}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}`;

content = content.replace(modernEduOld, modernEduNew);

fs.writeFileSync('src/pages/ResumeBuilder.jsx', content, 'utf8');
console.log('Script completed');
