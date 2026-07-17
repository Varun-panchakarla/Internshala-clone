const fs = require('fs');
let content = fs.readFileSync('src/pages/ResumeBuilder.jsx', 'utf8');

// 1. Remove Gender Field
const genderStr = `                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
                    <select value={pi.gender || ''} onChange={e => updatePersonalInfo({ gender: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>`;
content = content.replace(genderStr, '');

// 2. Remove Languages/Interests from Template 1
const t1Str = `      {(resume.languages?.length > 0 || resume.interests?.length > 0) && (
        <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
          {resume.languages?.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={SH}>Languages</div>
              <div style={{ fontSize: '11px', color: '#2d2d2d' }}>{resume.languages.map(l => l.text || l).join(', ')}</div>
            </div>
          )}
          {resume.interests?.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={SH}>Interests</div>
              <div style={{ fontSize: '11px', color: '#2d2d2d' }}>{resume.interests.map(i => i.text || i).join(', ')}</div>
            </div>
          )}
        </div>
      )}`;
content = content.replace(t1Str, '');

// 3. Remove Languages/Interests and Achievements from Template 2
const t2Str = `      {resume.achievements?.length > 0 && <TemplateSection title="Achievements" SH={SH}><ul style={{ margin: 0, paddingLeft: '16px', color: '#334155' }}>{resume.achievements.map((ach, i) => <li key={i}>{ach.text || ach}</li>)}</ul></TemplateSection>}
      
      {(resume.languages?.length > 0 || resume.interests?.length > 0) && (
        <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
          {resume.languages?.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={SH}>Languages</div>
              <div style={{ fontSize: '11px', color: '#334155' }}>{resume.languages.map(l => l.text || l).join(', ')}</div>
            </div>
          )}
          {resume.interests?.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={SH}>Interests</div>
              <div style={{ fontSize: '11px', color: '#334155' }}>{resume.interests.map(i => i.text || i).join(', ')}</div>
            </div>
          )}
        </div>
      )}`;
content = content.replace(t2Str, '');

fs.writeFileSync('src/pages/ResumeBuilder.jsx', content, 'utf8');
console.log('Script completed');
