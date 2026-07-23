import React from 'react';
import { FiAward, FiClock } from 'react-icons/fi';

const HRInterviewQuestions = () => {
  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FiAward className="text-brand-600 dark:text-brand-400" />
          HR Interview Questions
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
          Practice common HR interview questions, behavioral questions, communication, and situational responses.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-450 border border-slate-100 dark:border-slate-700 animate-pulse">
          <FiClock className="w-7 h-7 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-extrabold text-slate-850 dark:text-white">
            Coming Soon
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium max-w-sm leading-relaxed">
            We are curating the best behavioral and situational interview questions with ideal responses to help you ace your HR rounds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HRInterviewQuestions;
