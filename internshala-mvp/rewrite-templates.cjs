const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'ResumeTemplates.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const importsPattern = /(import \{\s*FiCheckCircle.*?\} from 'react-icons\/fi';)/s;
const importsMatch = content.match(importsPattern);
if (importsMatch) {
    const originalImports = importsMatch[1];
    const newImports = originalImports.replace('FiFileText,', 'FiFileText, FiMenu, FiGrid, FiLayout, FiArrowLeft,');
    content = content.replace(originalImports, newImports);
}

const statePattern = /(const \[justSelected, setJustSelected\]\s*= useState\(null\);)/;
const stateMatch = content.match(statePattern);
if (stateMatch) {
    content = content.replace(stateMatch[1], stateMatch[1] + '\n  const [sidebarOpen, setSidebarOpen] = useState(false);');
}

const returnStartIndex = content.indexOf('  return (\r\n    <div className="w-full animate-slide-up">') !== -1 
    ? content.indexOf('  return (\r\n    <div className="w-full animate-slide-up">')
    : content.indexOf('  return (\n    <div className="w-full animate-slide-up">');
if (returnStartIndex === -1) {
    console.error('Could not find return statement in Templates');
    process.exit(1);
}

const beforeReturn = content.slice(0, returnStartIndex);

const newReturn = `  return (
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
          <Link to="/resume" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap text-sm text-slate-300" title="Resume Builder">
            <FiFileText className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Resume Builder</span>}
          </Link>
          <Link to="/resume-templates" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-600/20 text-brand-400 font-medium transition-colors whitespace-nowrap text-sm" title="Templates">
            <FiLayout className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Templates</span>}
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 custom-scrollbar">
        <div className="max-w-screen-xl mx-auto w-full">
          {/* ── Page Header ─────────────────────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-3xl mb-8"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)' }} />
            <div className="relative px-8 py-10 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
                <FiFileText className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-bold text-white/80 tracking-wider uppercase">Resume Templates</span>
              </div>
              <h1 className="text-3xl font-black text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
                Choose Your Perfect Template
              </h1>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                Pick a professionally designed template. Your resume data is saved and transfers automatically — switch anytime without losing a word.
              </p>
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{TEMPLATES.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Templates</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{TEMPLATES.filter(t => t.isATS).length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">ATS Friendly</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-black text-white">Free</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">All Access</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Currently selected notice ────────────────────────────────────── */}
          {selectedTemplate && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 mb-6">
              <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-bold text-emerald-800">
                  Active Template: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                </span>
                <span className="text-xs text-emerald-600 ml-2">— Your resume data is safe when you switch.</span>
              </div>
              <button
                onClick={() => navigate('/resume')}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Open Builder →
              </button>
            </div>
          )}

          {/* ── Category Filter Tabs ─────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mb-7">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={\`px-4 py-2 rounded-full text-xs font-bold transition-all \${
                  filter === cat
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }\`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* ── Template Grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((template) => (
              <div
                key={template.id}
                className={\`transition-all duration-500 \${
                  justSelected === template.id ? 'scale-95 opacity-70' : 'scale-100 opacity-100'
                }\`}
              >
                <TemplateCard
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={handleSelect}
                  onPreview={setPreviewTemplate}
                />
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <FiFileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No templates found in this category.</p>
            </div>
          )}

          {/* ── Preview Modal ─────────────────────────────────────────────────── */}
          {previewTemplate && (
            <PreviewModal
              template={previewTemplate}
              onClose={() => setPreviewTemplate(null)}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplates;
`;

content = beforeReturn + newReturn;
fs.writeFileSync(filePath, content, 'utf8');
console.log('Success templates');
