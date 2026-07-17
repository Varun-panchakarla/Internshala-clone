const fs = require('fs');
const path = 'd:\\\\Internshala-clone\\\\internshala-mvp\\\\src\\\\pages\\\\ResumeBuilder.jsx';
let content = fs.readFileSync(path, 'utf8');

const importsPattern = /(import \{\s*FiSave.*?\} from 'react-icons\/fi';)/s;
const importsMatch = content.match(importsPattern);
if (importsMatch) {
    const originalImports = importsMatch[1];
    const newImports = originalImports.replace('FiLayout, FiZap, FiShield, FiEye,', 'FiLayout, FiZap, FiShield, FiEye, FiMenu, FiGrid,');
    content = content.replace(originalImports, newImports);
}

const statePattern = /(const \[activeSection, setActiveSection\] = useState\([^)]*\);)/;
const stateMatch = content.match(statePattern);
if (stateMatch) {
    content = content.replace(stateMatch[1], stateMatch[1] + '\n  const [sidebarOpen, setSidebarOpen] = useState(false);');
}

const returnPattern = /  return \(\n    <div className=\"animate-slide-up\">.*?    <\/div>\n  \);\n\};/s;
let newReturn = `  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden fixed inset-0 z-50 animate-slide-up">
      {/* Collapsible Sidebar */}
      <div className={\`flex flex-col bg-slate-900 text-white transition-all duration-300 \${sidebarOpen ? 'w-64' : 'w-16'} shrink-0 z-50\`}>
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <FiMenu className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-4 flex flex-col gap-2 px-3 overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap text-sm text-slate-300" title="Dashboard">
            <FiGrid className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link to="/resume" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-600/20 text-brand-400 font-medium transition-colors whitespace-nowrap text-sm" title="Resume Builder">
            <FiFileText className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Resume Builder</span>}
          </Link>
          <Link to="/resume-templates" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap text-sm text-slate-300" title="Templates">
            <FiLayout className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Templates</span>}
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        
        {/* Top Toolbar */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-slate-900 z-40">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight">Resume Builder</h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                Template: <span className="font-semibold text-slate-600 dark:text-slate-400">{currentTpl?.name}</span>
                {currentTpl?.isATS && (
                  <span className="ml-2 inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                    <FiShield className="w-2.5 h-2.5" /> ATS Friendly
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* ATS Score Mini Badge */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500">ATS Score</span>
              <span className={\`text-[12px] font-black \${atsScore >= 80 ? 'text-emerald-600' : atsScore >= 55 ? 'text-amber-500' : 'text-rose-500'}\`}>{atsScore}/100</span>
            </div>
            
            {/* Completion Mini Progress */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500">Completion</span>
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: \`\${resumeCompletion}%\` }} />
              </div>
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400">{resumeCompletion}%</span>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleDownloadTrigger} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[12px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                <FiDownload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Download PDF</span>
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-60">
                {saving ? (
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : <FiSave className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* 50/50 Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Form Column */}
          <div className="w-1/2 flex flex-col gap-4 overflow-y-auto px-8 py-6 pb-20 custom-scrollbar">
            
            {/* Template Switcher */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Select Template</p>
              <TemplateSwitcher selectedTemplate={selectedTemplate} onSwitch={setSelectedTemplate} />
            </div>

            {/* ATS Suggestions */}
            {atsSuggestions.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                      <FiAlertCircle className="w-3 h-3 text-rose-500" />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">ATS Suggestions</h3>
                  </div>
                  <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                    {atsSuggestions.length}
                  </span>
                </div>
                <div className="px-5 py-4 flex flex-col gap-2.5 max-h-52 overflow-y-auto scrollbar-none">
                  {atsSuggestions.map((sug) => {
                    const impactColor =
                      sug.impact === 'Critical' ? 'text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30' :
                      sug.impact === 'High'     ? 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30' :
                      'text-blue-500 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30';
                    return (
                      <div key={sug.id} className="flex gap-2.5 items-start p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <FiAlertCircle className={\`shrink-0 w-3.5 h-3.5 mt-0.5 \${sug.impact==='Critical'?'text-rose-500':sug.impact==='High'?'text-amber-500':'text-blue-500'}\`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{sug.category}</span>
                            <span className={\`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border \${impactColor}\`}>{sug.impact}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{sug.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section Accordions */}
            <div className="flex flex-col gap-2">
              {/* ACCORDIONS_PLACEHOLDER */}
            </div>
          </div>

          {/* Right Preview Column */}
          <div className="w-1/2 bg-slate-100 dark:bg-slate-800/50 overflow-y-auto py-8 flex flex-col items-center custom-scrollbar border-l border-slate-200 dark:border-slate-800">
            {/* Sticky Container */}
            <div className="sticky top-0 w-full max-w-[794px]">
              <div className="flex items-center justify-between mb-3 px-1 w-full">
                <div className="flex items-center gap-2">
                  <FiEye className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Live Preview — <span className="text-slate-600 dark:text-slate-400">{currentTpl?.name}</span></span>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5 w-[794px]" style={{ background: '#ffffff', minHeight: '1123px' }}>
                <ResumePreview ref={previewRef} resume={resume} templateId={selectedTemplate} />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <Modal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        title="Download Resume PDF"
        footer={!compilingResume && (
          <>
            <Button variant="outline" onClick={() => setDownloadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmDownload}>
              <FiDownload className="w-3.5 h-3.5 mr-1" /> Download PDF
            </Button>
          </>
        )}
      >
        {compilingResume ? (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-slate-700">Preparing your PDF…</h4>
              <p className="text-xs text-slate-400 mt-1">Template: <strong>{currentTpl?.name}</strong></p>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <FiCheckSquare className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800">Ready to Download</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Template: <strong>{currentTpl?.name}</strong> · ATS Score: <strong>{atsScore}/100</strong>
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};`;

const accordionsPattern = /\{sections\.map\(\(\{ id, label, icon: Icon \}\) => \(\n\s*<SectionCard.*?\n\s*<\/SectionCard>\n\s*\)\)\}/s;
const accordionsMatch = content.match(accordionsPattern);

if (accordionsMatch) {
    newReturn = newReturn.replace('{/* ACCORDIONS_PLACEHOLDER */}', accordionsMatch[0]);
    
    const returnMatch = content.match(returnPattern);
    if (returnMatch) {
        content = content.replace(returnMatch[0], newReturn);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Successfully rewrote ResumeBuilder.jsx");
    } else {
        console.log("Could not find return statement in ResumeBuilder.jsx");
    }
} else {
    console.log("Could not find accordions in ResumeBuilder.jsx");
}
