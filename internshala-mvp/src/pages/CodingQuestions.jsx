import React, { useState } from 'react';
import { 
  FiAward, 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCopy, 
  FiCheck, 
  FiArrowLeft,
  FiBookOpen,
  FiTerminal,
  FiChevronRight as FiArrowRight,
  FiCode
} from 'react-icons/fi';
import tcsQuestions from '../data/tcs_nqt_questions.json';
import importantQuestions from '../data/important_questions.json';

const CodingQuestions = () => {
  const [currentCategory, setCurrentCategory] = useState(null); // null, 'tcs', 'important'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedLang, setSelectedLang] = useState('cpp'); // 'cpp', 'java', 'python'
  const [copied, setCopied] = useState(false);

  // Determine active dataset based on selected category
  const activeQuestions = currentCategory === 'tcs' ? tcsQuestions : importantQuestions;

  // Filter active questions based on search query
  const filteredQuestions = activeQuestions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCategory = (cat) => {
    setCurrentCategory(cat);
    setSearchQuery('');
    setSelectedQuestion(null);
  };

  const handleOpenQuestion = (question) => {
    setSelectedQuestion(question);
    setSelectedLang('cpp'); // reset to default
    setCopied(false);
  };

  const handleCloseQuestion = () => {
    setSelectedQuestion(null);
    setCopied(false);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find index of current selected question in the active dataset
  const currentIndex = selectedQuestion 
    ? activeQuestions.findIndex(q => q.id === selectedQuestion.id) 
    : -1;

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setSelectedQuestion(activeQuestions[currentIndex - 1]);
      setCopied(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setSelectedQuestion(activeQuestions[currentIndex + 1]);
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FiAward className="text-brand-600 dark:text-brand-400" />
          Coding Questions
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Improve problem-solving skills with coding challenges, algorithms, data structures, and programming exercises.
        </p>
      </div>

      {currentCategory === null ? (
        /* ──────────────────────────────────────────────────────────────
           VIEW: CATEGORIES SELECTOR
        ────────────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Card 1: TCS NQT Previous Year Questions */}
          <div
            onClick={() => handleSelectCategory('tcs')}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/30 hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all duration-200 p-6 flex flex-col justify-between gap-5 focus:outline-none focus:ring-2 focus:ring-brand-500/40 active:scale-[0.98] min-h-[220px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40">
                  <FiBookOpen className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-slate-850 dark:text-white leading-snug">
                TCS NQT Previous Year Coding Questions
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-505 font-medium leading-relaxed mt-2">
                Practice previous year TCS NQT coding questions.
              </p>
            </div>

            <div className="flex items-center justify-end text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 gap-1.5 border-t border-slate-50 dark:border-slate-850 pt-4">
              Explore Questions <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Important Coding Questions */}
          <div
            onClick={() => handleSelectCategory('important')}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/30 hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all duration-200 p-6 flex flex-col justify-between gap-5 focus:outline-none focus:ring-2 focus:ring-brand-500/40 active:scale-[0.98] min-h-[220px]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl border flex items-center justify-center text-brand-655 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 border-brand-100 dark:border-brand-900/40">
                  <FiCode className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-base font-extrabold text-slate-850 dark:text-white leading-snug">
                Important Coding Questions
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-505 font-medium leading-relaxed mt-2">
                Practice the most important coding interview questions.
              </p>
            </div>

            <div className="flex items-center justify-end text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 gap-1.5 border-t border-slate-50 dark:border-slate-850 pt-4">
              Explore Questions <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      ) : selectedQuestion ? (
        /* ──────────────────────────────────────────────────────────────
           VIEW: QUESTION DETAIL VIEW
        ────────────────────────────────────────────────────────────── */
        <div className="flex flex-col gap-6">
          {/* Back Action Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleCloseQuestion}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-650 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/30 rounded-xl transition-all duration-200"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to List
            </button>
            <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
              Question {currentIndex + 1} of {activeQuestions.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Problem Statement & Test Cases */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-600 dark:text-brand-400">
                    {currentCategory === 'tcs' ? 'TCS NQT Question' : 'Important Question'} #{selectedQuestion.id}
                  </span>
                  <h2 className="text-lg font-black text-slate-850 dark:text-white mt-1">
                    {selectedQuestion.title}
                  </h2>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                    Problem Statement
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedQuestion.statement}
                  </p>
                </div>

                {selectedQuestion.sampleInput && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    {/* Sample Input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        <FiTerminal className="w-3.5 h-3.5" />
                        Sample Input
                      </div>
                      <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-850">
                        {selectedQuestion.sampleInput}
                      </pre>
                    </div>

                    {/* Sample Output */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        <FiTerminal className="w-3.5 h-3.5" />
                        Sample Output
                      </div>
                      <pre className="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-850">
                        {selectedQuestion.sampleOutput}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Code Solution tabs & display */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex gap-2">
                    {[
                      { id: 'cpp', label: 'C++' },
                      { id: 'java', label: 'Java' },
                      { id: 'python', label: 'Python' }
                    ].map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLang(lang.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                          selectedLang === lang.id
                            ? 'bg-brand-600 dark:bg-brand-500/20 text-white dark:text-brand-400 border border-brand-500'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-transparent'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCopyCode(selectedQuestion.solutions[selectedLang])}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/50 dark:border-slate-700/60"
                  >
                    {copied ? (
                      <>
                        <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-slate-950 text-slate-200 p-5 rounded-xl font-mono text-xs overflow-x-auto max-h-[480px] border border-slate-850 leading-relaxed select-text">
                    <code>
                      {selectedQuestion.solutions[selectedLang]}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-sm">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200"
            >
              <FiChevronLeft className="w-4 h-4" />
              Previous Question
            </button>
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Select key to browse the set
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={currentIndex === activeQuestions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200"
            >
              Next Question
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────────
           VIEW: QUESTIONS LIST & SEARCH (WITHIN ACTIVE CATEGORY)
        ────────────────────────────────────────────────────────────── */
        <div className="flex flex-col gap-6">
          {/* Back Action Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleSelectCategory(null)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-650 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500/30 rounded-xl transition-all duration-200"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Coding Categories
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-2">
                {currentCategory === 'tcs' ? (
                  <>
                    <FiBookOpen className="text-blue-600 dark:text-blue-400" />
                    TCS NQT Previous Year Coding Questions
                  </>
                ) : (
                  <>
                    <FiCode className="text-brand-655 dark:text-brand-400" />
                    Important Coding Questions
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                {currentCategory === 'tcs' 
                  ? 'Practice actual coding questions asked in recent TCS National Qualifier Tests.' 
                  : 'Practice the most important coding interview questions.'
                }
              </p>
            </div>

            {/* Search Box */}
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FiSearch className="text-slate-400 w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search questions by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Questions Grid */}
          {filteredQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between gap-5 hover:border-brand-300 dark:hover:border-brand-500/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-505 bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md border border-slate-200/30 dark:border-slate-800">
                        Question #{q.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-505 font-medium leading-relaxed mt-2 line-clamp-2">
                      {q.shortStatement}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenQuestion(q)}
                    className="w-full py-2 bg-slate-50 dark:bg-slate-850 hover:bg-brand-600 dark:hover:bg-brand-500 hover:text-white dark:hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all duration-250 border border-slate-200/50 dark:border-slate-800 hover:border-transparent dark:hover:border-transparent active:scale-[0.98]"
                  >
                    Solve Challenge
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
                No questions match your search.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-505">
                Try adjusting keywords or clearing the filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodingQuestions;
