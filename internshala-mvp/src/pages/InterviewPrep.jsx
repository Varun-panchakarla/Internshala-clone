import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiCpu, FiUsers, FiCode, FiArrowRight } from 'react-icons/fi';

const InterviewPrep = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'technical',
      name: 'Technical Questions',
      icon: FiCpu,
      desc: 'Prepare technology-specific interview questions for frontend, backend, databases, and programming languages.',
      color: 'text-brand-655 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 border-brand-100 dark:border-brand-900/40',
      actionText: 'Browse Technologies'
    },
    {
      id: 'hr',
      name: 'HR Questions',
      icon: FiUsers,
      desc: 'Practice common HR interview questions, behavioral questions, communication, and situational responses.',
      color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/40',
      actionText: 'Practice HR Questions'
    },
    {
      id: 'coding',
      name: 'Coding Questions',
      icon: FiCode,
      desc: 'Improve problem-solving skills with coding challenges, algorithms, data structures, and programming exercises.',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/40',
      actionText: 'Solve Challenges'
    }
  ];

  const handleCardClick = (id) => {
    navigate(`/interview-prep/${id}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FiAward className="text-brand-600 dark:text-brand-400" />
          Interview Preparation
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Select a category below to start preparing for your upcoming interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => handleCardClick(cat.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(cat.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Prepare for ${cat.name}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-500 hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all duration-200 p-6 flex flex-col justify-between gap-5 focus:outline-none focus:ring-2 focus:ring-brand-500/40 active:scale-[0.98] min-h-[220px]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-snug">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed mt-2">
                  {cat.desc}
                </p>
              </div>

              <div className="flex items-center justify-end text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 gap-1.5 border-t border-slate-50 dark:border-slate-800 pt-4">
                {cat.actionText} <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewPrep;
