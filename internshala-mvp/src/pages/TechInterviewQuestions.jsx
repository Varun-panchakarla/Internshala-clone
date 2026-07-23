import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { 
  FiChevronLeft, FiSearch, FiCode, FiCopy, 
  FiCheck, FiChevronDown, FiAlertCircle, FiAward,
  FiMaximize2, FiX
} from 'react-icons/fi';

// Simple HTML escaping helper
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Custom light token-based syntax highlighter for Python/JS/Java/C/C++/R/C# code
const highlightCode = (code, language) => {
  if (!code) return '';
  let lang = language?.toLowerCase() || 'python';
  if (lang === 'react' || lang === 'nodejs' || lang === 'express') {
    lang = 'javascript';
  } else if (lang === 'postgresql') {
    lang = 'sql';
  }
  if (lang !== 'python' && lang !== 'javascript' && lang !== 'java' && lang !== 'c' && lang !== 'cpp' && lang !== 'r' && lang !== 'csharp' && lang !== 'sql' && lang !== 'html' && lang !== 'css') {
    return escapeHtml(code);
  }

  const lines = code.split('\n');
  const highlightedLines = lines.map(line => {
    // Check if line is a full line comment
    if (
      ((lang === 'python' || lang === 'r') && line.trim().startsWith('#')) ||
      (lang === 'sql' && line.trim().startsWith('--')) ||
      (lang === 'html' && line.trim().startsWith('<!--')) ||
      (lang === 'css' && (line.trim().startsWith('/*') || line.trim().startsWith('//'))) ||
      ((lang !== 'python' && lang !== 'r' && lang !== 'sql' && lang !== 'html' && lang !== 'css') && line.trim().startsWith('//'))
    ) {
      return `___SPAN_SLATE_START___${escapeHtml(line)}___SPAN_END___`;
    }

    // Identify comment boundaries (ignoring quotes)
    let commentIndex = -1;
    let inDoubleQuote = false;
    let inSingleQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
      if (char === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      if (
        (char === '#' && (lang === 'python' || lang === 'r') && !inDoubleQuote && !inSingleQuote) ||
        (char === '/' && (lang === 'javascript' || lang === 'java' || lang === 'c' || lang === 'cpp') && line[i+1] === '/' && !inDoubleQuote && !inSingleQuote) ||
        (char === '/' && lang === 'css' && line[i+1] === '*' && !inDoubleQuote && !inSingleQuote) ||
        (char === '<' && lang === 'html' && line.slice(i, i+4) === '<!--' && !inDoubleQuote && !inSingleQuote) ||
        (char === '-' && lang === 'sql' && line[i+1] === '-' && !inDoubleQuote && !inSingleQuote)
      ) {
        commentIndex = i;
        break;
      }
    }

    let codePart = commentIndex !== -1 ? line.slice(0, commentIndex) : line;
    let commentPart = commentIndex !== -1 ? line.slice(commentIndex) : '';

    // Extract strings temporarily to prevent keyword highlighting inside quotes
    const strings = [];
    let stringPlaceholderIndex = 0;
    
    codePart = codePart.replace(/(".*?"|'.*?'|`.*?`)/g, (match) => {
      const letterToken = 'A'.repeat(stringPlaceholderIndex + 1);
      const placeholder = `___STR_PLACEHOLDER_${letterToken}___`;
      strings.push({ placeholder, value: match });
      stringPlaceholderIndex++;
      return placeholder;
    });

    // Escape code characters safely
    codePart = escapeHtml(codePart);

    // Color numeric digits (done first using placeholders to avoid tag collisions)
    codePart = codePart.replace(/\b(\d+)\b/g, '___SPAN_AMBER_START___$1___SPAN_END___');

    // Color keywords
    const keywords = lang === 'python'
      ? /\b(def|class|import|from|return|if|else|elif|for|while|in|is|and|or|not|try|except|finally|with|as|lambda|pass|break|continue)\b/g
      : lang === 'java'
      ? /\b(public|private|protected|class|interface|void|int|double|float|long|boolean|char|if|else|for|while|do|switch|case|break|continue|return|new|this|super|extends|implements|import|package|try|catch|finally|throw|throws|static|final|abstract)\b/g
      : lang === 'c'
      ? /\b(int|char|float|double|void|if|else|while|for|return|switch|case|break|continue|struct|union|typedef|const|static|sizeof|volatile|register|extern|auto|goto)\b/g
      : lang === 'cpp'
      ? /\b(class|public|private|protected|virtual|friend|template|typename|namespace|using|new|delete|this|const|static|inline|operator|throw|catch|try|int|char|float|double|void|if|else|while|for|return|switch|case|break|continue|struct|union|typedef|volatile|register|extern|auto|goto)\b/g
      : lang === 'r'
      ? /\b(function|if|else|while|for|in|repeat|break|next|return)\b/g
      : lang === 'sql'
      ? /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|ON|GROUP\s+BY|HAVING|ORDER\s+BY|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|WITH|AS|AND|OR|NOT|IN|EXISTS|UNION|ALL|INTO|VALUES|SET|LEFT|RIGHT|INNER|OUTER|CROSS|FULL|BY|DISTINCT|CASE|WHEN|THEN|ELSE|END|LIMIT|TOP|OFFSET)\b/gi
      : lang === 'html'
      ? /\b(html|body|head|title|meta|link|script|style|div|span|p|a|img|section|article|aside|header|footer|form|input|button|label|select|option|textarea|table|thead|tbody|tr|th|td|ul|ol|li|canvas|svg|iframe)\b/g
      : lang === 'css'
      ? /\b(color|background|margin|padding|display|position|flex|grid|width|height|border|font|outline|top|right|bottom|left|opacity|transition|animation|box-sizing|justify-content|align-items|flex-direction|grid-template)\b/g
      : lang === 'csharp'
      ? /\b(class|struct|interface|namespace|using|public|private|protected|internal|void|int|string|double|float|bool|char|if|else|while|for|foreach|switch|case|break|continue|return|new|this|base|override|virtual|abstract|static|readonly|const|try|catch|finally|throw|async|await|get|set|value|delegate|event)\b/g
      : /\b(function|const|let|var|return|if|else|for|while|in|of|try|catch|finally|import|from|export|default|class|extends|new|await|async)\b/g;
    codePart = codePart.replace(keywords, '___SPAN_PINK_START___$1___SPAN_END___');
    
    // Color built-in keywords/booleans
    const builtins = lang === 'python'
      ? /\b(print|len|range|str|int|float|list|dict|set|tuple|type|True|False|None)\b/g
      : lang === 'java'
      ? /\b(System|out|println|print|String|Integer|Double|Float|List|ArrayList|Map|HashMap|Set|HashSet|true|false|null)\b/g
      : lang === 'c'
      ? /\b(printf|scanf|malloc|calloc|realloc|free|NULL|exit|stderr|stdout|stdin|include|define|undef|ifdef|ifndef|endif)\b/g
      : lang === 'cpp'
      ? /\b(cout|cin|endl|vector|string|map|set|list|printf|scanf|malloc|calloc|realloc|free|NULL|exit|stderr|stdout|stdin|include|define|undef|ifdef|ifndef|endif)\b/g
      : lang === 'r'
      ? /\b(print|c|list|vector|matrix|data\.frame|factor|summary|plot|library|require|install\.packages|mean|median|sd|var|apply|lapply|sapply|tapply|cat|TRUE|FALSE|NULL|NA|NaN|Inf)\b/g
      : lang === 'sql'
      ? /\b(COUNT|SUM|AVG|MIN|MAX|COALESCE|RANK|DENSE_RANK|ROW_NUMBER|LAG|LEAD|NULL|TRUE|FALSE)\b/gi
      : lang === 'html'
      ? /\b(class|id|href|src|alt|type|value|name|placeholder|action|method|rel|target|style|defer|async|enctype|contenteditable|tabindex)\b/g
      : lang === 'css'
      ? /\b(block|inline|absolute|relative|fixed|static|none|hidden|visible|bold|italic|center|auto|inherit|initial|revert|unset|important)\b/g
      : lang === 'csharp'
      ? /\b(Console|WriteLine|ReadLine|Write|Read|Convert|ToString|ToInt32|List|Dictionary|Task|System|true|false|null)\b/g
      : /\b(console|log|length|map|filter|reduce|true|false|null|undefined|Promise)\b/g;
    codePart = codePart.replace(builtins, '___SPAN_INDIGO_START___$1___SPAN_END___');

    // Restore strings with safe green styling
    for (const str of strings) {
      const highlightedStr = `___SPAN_EMERALD_START___${escapeHtml(str.value)}___SPAN_END___`;
      codePart = codePart.replace(str.placeholder, highlightedStr);
    }

    // Append highlighted comment back if any
    if (commentPart) {
      codePart += `___SPAN_SLATE_START___${escapeHtml(commentPart)}___SPAN_END___`;
    }

    return codePart;
  });

  const combined = highlightedLines.join('\n');
  return combined
    .replace(/___SPAN_AMBER_START___/g, '<span class="text-amber-500 dark:text-amber-400">')
    .replace(/___SPAN_PINK_START___/g, '<span class="text-pink-500 dark:text-pink-400 font-bold">')
    .replace(/___SPAN_INDIGO_START___/g, '<span class="text-indigo-400 dark:text-indigo-350">')
    .replace(/___SPAN_EMERALD_START___/g, '<span class="text-emerald-600 dark:text-emerald-450">')
    .replace(/___SPAN_SLATE_START___/g, '<span class="text-slate-500 dark:text-slate-450 italic">')
    .replace(/___SPAN_END___/g, '</span>');
};

// Filter duplicate or fragmented code snippets
const getUniqueCodeSnippets = (codeList) => {
  if (!codeList || codeList.length === 0) return [];
  
  const cleanList = codeList
    .map(c => c.replace(/\u200b/g, '').trim()) // remove zero-width spaces
    .filter(c => c.length > 0);

  return cleanList.filter((snippet, index) => {
    // Filter out if this snippet is a substring fragment of any longer snippet in the list
    const isFragment = cleanList.some((otherSnippet, otherIndex) => {
      if (otherIndex === index) return false;
      if (otherSnippet.length <= snippet.length) return false;
      const normalizedOther = otherSnippet.replace(/\s+/g, ' ');
      const normalizedSelf = snippet.replace(/\s+/g, ' ');
      return normalizedOther.includes(normalizedSelf);
    });
    return !isFragment;
  });
};

const TechInterviewQuestions = () => {
  const { techId } = useParams();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [openQuestionIds, setOpenQuestionIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        let json;
        if (techId === 'python') {
          json = await import('../data/python_interview_questions.json');
        } else if (techId === 'java') {
          json = await import('../data/java_interview_questions.json');
        } else if (techId === 'c') {
          json = await import('../data/c_interview_questions.json');
        } else if (techId === 'cpp') {
          json = await import('../data/cpp_interview_questions.json');
        } else if (techId === 'r') {
          json = await import('../data/r_interview_questions.json');
        } else if (techId === 'csharp') {
          json = await import('../data/csharp_interview_questions.json');
        } else {
          try {
            json = await import(`../data/${techId}_interview_questions.json`);
          } catch (e) {
            throw new Error(`Technical questions for '${techId}' are not yet loaded.`);
          }
        }
        setData(json.default);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [techId]);

  const toggleQuestion = (qId) => {
    setOpenQuestionIds(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const handleCopyCode = (code, elementId) => {
    navigator.clipboard.writeText(code);
    setCopiedId(elementId);
    addToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe formatting parser for standard markdown bolds and code tokens
  const renderFormattedText = (text) => {
    if (!text) return null;
    if (typeof text === 'string' && text.startsWith('```') && text.endsWith('```')) {
      const rawCode = text.slice(3, -3).trim();
      const firstLineBreak = rawCode.indexOf('\n');
      let lang = techId;
      let cleanCode = rawCode;
      if (firstLineBreak !== -1) {
        const potentialLang = rawCode.slice(0, firstLineBreak).trim();
        if (/^[a-zA-Z0-9+#-]+$/.test(potentialLang)) {
          lang = potentialLang;
          cleanCode = rawCode.slice(firstLineBreak + 1);
        }
      }
      const highlighted = highlightCode(cleanCode, lang);
      return (
        <span 
          className="block bg-slate-900/90 dark:bg-slate-950 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed rounded-xl my-2 border border-slate-200/80 dark:border-slate-800 whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      );
    }
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/50 text-rose-500 dark:text-rose-450 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase() || 'easy';
    if (diff === 'beginner' || diff === 'easy') {
      return 'bg-emerald-55 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400';
    } else if (diff === 'intermediate') {
      return 'bg-amber-55 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40 text-amber-700 dark:text-amber-400';
    }
    return 'bg-rose-55 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40 text-rose-700 dark:text-rose-450';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading interview track...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4 animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
          <FiAlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white">Content Locked or Missing</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 max-w-sm">
            {error || 'This technology content is not yet available in the database.'}
          </p>
        </div>
        <Link to="/interview-prep/technical">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer">
            <FiChevronLeft className="w-4 h-4" /> Back to Tech Guides
          </button>
        </Link>
      </div>
    );
  }

  // Parse questions from sections using markers
  const questionsList = [];
  let currentDifficulty = 'Beginner';
  let questionCounter = 1;

  if (data.sections && Array.isArray(data.sections)) {
    for (const sec of data.sections) {
      const heading = sec.heading?.trim() || '';
      if (!heading) continue;

      const headingLower = heading.toLowerCase();

      // Detect and strip out categories/markers
      const isNumbered = /^\d+\s*\.?\s*/.test(heading);
      
      if (!isNumbered) {
        if (headingLower.includes('intermediate')) {
          currentDifficulty = 'Intermediate';
        } else if (headingLower.includes('advanced')) {
          currentDifficulty = 'Advanced';
        } else if (headingLower.includes('fresher') || headingLower.includes('beginner') || headingLower.includes('basic')) {
          currentDifficulty = 'Beginner';
        }
        // Always skip category markers (do not push to questionsList)
        continue;
      }

      // Extract Clean Title (stripping original scraped number prefix)
      const cleanTitle = heading.replace(/^\d+\s*\.?\s*/, '').trim();
      const cleanTitleLower = cleanTitle.toLowerCase();

      // Skip Relevant Resources and other resource dividers
      if (
        cleanTitleLower.includes('relevant resources') ||
        cleanTitleLower.includes('additional resources') ||
        cleanTitleLower === 'resources' ||
        cleanTitleLower === 'resource'
      ) {
        continue;
      }

      questionsList.push({
        id: `${techId}-${heading}`,
        qNum: questionCounter++,
        qTitle: cleanTitle,
        difficulty: currentDifficulty,
        paragraphs: sec.paragraphs || [],
        lists: sec.lists || [],
        images: sec.images || [],
        code: sec.code || [],
        tables: sec.tables || []
      });
    }
  }

  // Real-time Search & Filter matching
  const filteredQuestions = questionsList.filter(q => {
    const matchesSearch = searchQuery === '' ||
      q.qTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.paragraphs.some(p => typeof p === 'string' && p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.lists.some(list => Array.isArray(list) && list.some(item => typeof item === 'string' && item.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesDifficulty = activeDifficulty === 'all' || 
      q.difficulty.toLowerCase() === activeDifficulty.toLowerCase();

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      {/* Dynamic Image Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-slate-350 p-2 bg-slate-800/40 rounded-xl hover:scale-105 transition-all">
            <FiX className="w-5 h-5" />
          </button>
          <img 
            src={activeImage} 
            alt="Expanded view" 
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl animate-scale-up" 
          />
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Link to="/interview-prep/technical" className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 w-fit gap-1 hover:underline">
          <FiChevronLeft className="w-3.5 h-3.5" /> Back to Tech Guides
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FiAward className="text-brand-600 dark:text-brand-400" />
            {data.title}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            {questionsList.length} Questions Curated
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-md flex items-center">
          <FiSearch className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search question, paragraph, or bullets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 dark:focus:border-brand-400 text-slate-850 dark:text-slate-150"
          />
        </div>

        {/* Difficulty Selection filters */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filter:</span>
          <div className="flex bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-0.5 rounded-lg text-[10px] font-bold">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveDifficulty(lvl)}
                className={`px-3 py-1 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                  activeDifficulty === lvl
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-400 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion Questions List */}
      {filteredQuestions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredQuestions.map((q, index) => {
            const isOpen = openQuestionIds.includes(q.id);
            const cleanCode = getUniqueCodeSnippets(q.code);

            return (
              <div 
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs"
              >
                {/* Accordion Trigger Header */}
                <button
                  onClick={() => toggleQuestion(q.id)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer focus:outline-none hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs sm:text-sm font-black text-slate-450 dark:text-slate-500 shrink-0 mt-0.5">
                      Q{q.qNum}.
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-white leading-relaxed">
                      {q.qTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[9px] font-black border px-2 py-0.5 rounded-md uppercase tracking-wide ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    <FiChevronDown 
                      className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                    />
                  </div>
                </button>

                {/* Dynamic Content Details wrapper */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden border-t border-slate-50 dark:border-slate-800/60 ${
                    isOpen ? 'max-h-[3000px] opacity-100 p-5' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    {/* Paragraph elements */}
                    {q.paragraphs.map((pText, pIdx) => (
                      <p key={pIdx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-355 leading-relaxed">
                        {renderFormattedText(pText)}
                      </p>
                    ))}

                    {/* Bullet List elements */}
                    {q.lists.map((listItems, lIdx) => (
                      <ul key={lIdx} className="list-disc pl-5 text-xs sm:text-sm text-slate-600 dark:text-slate-355 space-y-2 my-2">
                        {listItems.map((item, i) => (
                          <li key={i}>{renderFormattedText(item)}</li>
                        ))}
                      </ul>
                    ))}

                    {/* Responsive Comparison Tables */}
                    {q.tables && q.tables.map((table, tIdx) => (
                      <div key={tIdx} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                            <tr>
                              {table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4 py-3 font-extrabold border-r border-slate-200 dark:border-slate-800 last:border-0 whitespace-nowrap">
                                  {renderFormattedText(h)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-slate-650 dark:text-slate-350">
                            {table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/5 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-3 border-r border-slate-200/60 dark:border-slate-800/60 last:border-0 leading-relaxed font-semibold">
                                    {renderFormattedText(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}

                    {/* Images with click modal support */}
                    {q.images.map((img, imgIdx) => (
                      <div key={imgIdx} className="my-3 flex flex-col items-center gap-2 group">
                        <div className="relative rounded-xl border border-slate-100 dark:border-slate-850 overflow-hidden shadow-2xs cursor-zoom-in">
                          <img 
                            src={img.src} 
                            alt={img.alt || 'Visual illustration'} 
                            onClick={() => setActiveImage(img.src)}
                            className="max-w-full max-h-[350px] object-contain hover:opacity-95 transition-opacity"
                          />
                          <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <FiMaximize2 className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        {img.alt && (
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 italic">
                            Figure: {img.alt.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Code Snippets with Highlighter & Copy control */}
                    {cleanCode.map((codeSnippet, cIdx) => {
                      const codeId = `${q.id}-code-${cIdx}`;
                      const highlighted = highlightCode(codeSnippet, techId);
                      return (
                        <div key={cIdx} className="relative group/code my-3 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <FiCode className="w-3.5 h-3.5 text-slate-450" />
                              {techId}
                            </span>
                            <button
                              onClick={() => handleCopyCode(codeSnippet, codeId)}
                              className="flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                            >
                              {copiedId === codeId ? (
                                <>
                                  <FiCheck className="w-3 h-3 text-emerald-500" /> Copied
                                </>
                              ) : (
                                <>
                                  <FiCopy className="w-3 h-3" /> Copy
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="bg-slate-900/90 dark:bg-slate-950 p-4 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
                            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700">
            <FiSearch className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">No Questions Found</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
              No questions match your current search query or difficulty filters.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechInterviewQuestions;
