import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCode, FiDatabase, FiServer, FiCpu, FiLayers, 
  FiLayout, FiGitBranch, FiPackage, FiTerminal, FiGlobe, 
  FiAward, FiLock, FiArrowRight 
} from 'react-icons/fi';

const TechnicalInterviewPrep = () => {
  const navigate = useNavigate();

  const technologies = [
    {
      id: 'python',
      name: 'Python',
      icon: FiCode,
      desc: 'Object-oriented execution, list comprehensions, decorators, and memory management concepts.',
      active: true,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40'
    },
    {
      id: 'java',
      name: 'Java',
      icon: FiCode,
      desc: 'Object-oriented programming language, platform independence, JVM bytecode, and multi-threading.',
      active: true,
      color: 'text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/40'
    },
    {
      id: 'c',
      name: 'C',
      icon: FiCode,
      desc: 'Procedural programming, pointer arithmetic, manual memory allocation, and compilation lifecycle.',
      active: true,
      color: 'text-slate-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800'
    },
    {
      id: 'cpp',
      name: 'C++',
      icon: FiCode,
      desc: 'Object-oriented features, classes, templates, STL containers, resource management (RAII), and pointers.',
      active: true,
      color: 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40'
    },
    {
      id: 'csharp',
      name: 'C#',
      icon: FiCode,
      desc: 'Object-oriented programming, .NET Core framework, LINQ queries, asynchronous tasks (async/await), and delegates.',
      active: true,
      color: 'text-purple-650 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40'
    },
    {
      id: 'r',
      name: 'R',
      icon: FiCode,
      desc: 'Statistical computing, data visualization (ggplot2), vector operations, data frame manipulation, and package management.',
      active: true,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40'
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: FiCode,
      desc: 'Closures, event loops, prototype chaining, asynchronous programming, and ES6+ standards.',
      active: true,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40'
    },
    {
      id: 'react',
      name: 'React',
      icon: FiCpu,
      desc: 'Virtual DOM reconciliation, state hooks, lifecycle methods, context APIs, and render optimizations.',
      active: true,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-100 dark:border-cyan-900/40'
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      icon: FiServer,
      desc: 'V8 engine integration, non-blocking I/O event-driven structures, and stream pipelines.',
      active: true,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
    },
    {
      id: 'express',
      name: 'Express.js',
      icon: FiLayers,
      desc: 'REST API design patterns, custom middleware lifecycle, routing parameters, and error handlers.',
      active: true,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40'
    },
    {
      id: 'sql',
      name: 'SQL',
      icon: FiDatabase,
      desc: 'Structured query designs, joins, indexing strategies, transactions (ACID), and query optimizations.',
      active: true,
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/40'
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      icon: FiDatabase,
      desc: 'Advanced relational schemas, table partitioning, JSONB types, and transaction isolations.',
      active: true,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800'
    },

    {
      id: 'html',
      name: 'HTML',
      icon: FiLayout,
      desc: 'Semantic elements, document structures, forms, audio/video tags, and HTML5 Web Storage/APIs.',
      active: true,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/40'
    },
    {
      id: 'css',
      name: 'CSS',
      icon: FiGlobe,
      desc: 'Box model principles, Flexbox/Grid systems, selectors specificity, CSS variables, and layout physics.',
      active: true,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40'
    },
    {
      id: 'dsa',
      name: 'Data Structures',
      icon: FiGitBranch,
      desc: 'Arrays, Trees, Graphs, sorting, binary searches, dynamic programming, and complexity analyses.',
      active: true,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40'
    },
    {
      id: 'oop',
      name: 'OOP',
      icon: FiPackage,
      desc: 'Inheritance paradigms, polymorphism patterns, encapsulations, abstractions, and SOLID standards.',
      active: true,
      color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-900/40'
    },
    {
      id: 'dbms',
      name: 'DBMS',
      icon: FiDatabase,
      desc: 'Normalizations (1NF to BCNF), database recovery models, locking protocols, and query trees.',
      active: true,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/40'
    },
    {
      id: 'os',
      name: 'Operating Systems',
      icon: FiTerminal,
      desc: 'Process scheduling threads, deadlocks detection, virtual memory paging, and file management setups.',
      active: true,
      color: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/30 border-lime-100 dark:border-lime-900/40'
    },
    {
      id: 'networks',
      name: 'Computer Networks',
      icon: FiGlobe,
      desc: 'TCP/IP layers, routing protocol algorithms, DNS processes, HTTP/S structures, and secure socket layers.',
      active: true,
      color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 border-pink-100 dark:border-pink-900/40'
    }
  ];

  const handleCardClick = (tech) => {
    if (tech.active) {
      navigate(`/interview-prep/${tech.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FiAward className="text-brand-600 dark:text-brand-400" />
          Technical Interview Prep
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Review curated questions and code snippets to ace your technical interview rounds.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {technologies.map((tech) => {
          const Icon = tech.icon;
          return (
            <div
              key={tech.id}
              onClick={() => handleCardClick(tech)}
              onKeyDown={(e) => {
                if (tech.active && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleCardClick(tech);
                }
              }}
              tabIndex={tech.active ? 0 : -1}
              role={tech.active ? 'button' : 'presentation'}
              aria-label={tech.active ? `Practice ${tech.name} interview questions` : undefined}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-200 ${
                tech.active
                  ? 'border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500 hover:-translate-y-1 hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500/40 active:scale-[0.98]'
                  : 'border-slate-100/70 dark:border-slate-850/50 opacity-70 cursor-not-allowed select-none'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${tech.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {!tech.active && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <FiLock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-snug">
                  {tech.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed mt-1.5">
                  {tech.desc}
                </p>
              </div>

              {tech.active && (
                <div className="flex items-center justify-end text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 gap-1.5 border-t border-slate-50 dark:border-slate-800 pt-3">
                  Practice Questions <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TechnicalInterviewPrep;
