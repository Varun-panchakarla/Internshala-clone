import React, { useState } from 'react';
import { FiAward, FiSearch, FiChevronDown, FiCheckCircle } from 'react-icons/fi';

const hrQuestionsData = [
  {
    id: 'hr-1',
    qNum: 1,
    qTitle: "Tell me about yourself.",
    category: "Common",
    description: "This is usually the opening question in almost every interview. It sets the tone for the rest of the conversation.",
    paragraphs: [
      "This question is an opportunity to pitch your skills and explain why you are the ideal candidate for the job. Use the Present-Past-Future formula to structure your answer.",
      "1. Present: Talk about your current role, key responsibilities, and a recent achievement.",
      "2. Past: Briefly mention how you got there, referring to relevant experience or academic background.",
      "3. Future: Explain why you are excited about this opportunity and how it aligns with your career path."
    ],
    sampleResponse: "I am a Full Stack Developer with over 2 years of experience building responsive web applications. In my current role, I led the migration of a legacy platform to React, improving page load speeds by 35%. Prior to this, I completed my Bachelor's in Computer Science where I developed a strong foundation in data structures and algorithms. I am looking to bring my frontend expertise and passion for building seamless user experiences to your innovative team, which aligns perfectly with my goal of working on high-impact products."
  },
  {
    id: 'hr-2',
    qNum: 2,
    qTitle: "Why do you want to work at our company?",
    category: "Common",
    description: "Recruiters ask this to verify if you have researched the company and if you genuinely want to work there, or if you're just applying to any open job.",
    paragraphs: [
      "To answer this effectively, you must show that you understand the company's core values, mission, products, and culture.",
      "Identify 1-2 specific aspects of the company that excite you (e.g., their AI products, commitment to open-source, or employee growth culture) and connect them back to your own values or career aspirations."
    ],
    sampleResponse: "I have been following your company's growth in the AI recruitment space, and I am genuinely inspired by how you use machine learning to remove bias from the hiring process. I value innovation and inclusivity, and seeing how these values are reflected in your products makes me eager to contribute. I want to work here because I know my skills in building robust APIs will help scale these products, and I am excited to learn from the talented engineering team you've assembled."
  },
  {
    id: 'hr-3',
    qNum: 3,
    qTitle: "What are your strengths and weaknesses?",
    category: "Common",
    description: "Recruiters want to gauge your self-awareness, honesty, and whether your strengths align with the job requirements.",
    paragraphs: [
      "Strengths: Choose 1 or 2 professional traits that are highly relevant to the role (e.g., problem-solving, collaboration, attention to detail) and support them with a brief example.",
      "Weaknesses: Share a real, work-related weakness but frame it as a learning opportunity. Explain the concrete steps you are taking to overcome it. Avoid cliché answers like 'I'm a perfectionist'."
    ],
    sampleResponse: "My greatest strength is my problem-solving ability under pressure. In my previous role, when our production database went down, I remained calm, identified the bottleneck, and restored service within 15 minutes. For my weakness, I sometimes struggle with public speaking and presenting in front of large groups. To address this, I recently joined Toastmasters and started presenting during our weekly team standups, which has helped me build confidence and deliver clearer presentations."
  },
  {
    id: 'hr-4',
    qNum: 4,
    qTitle: "Why should we hire you?",
    category: "Common",
    description: "This is your ultimate sales pitch. You need to summarize your skills, experiences, and cultural fit into a concise statement.",
    paragraphs: [
      "Focus on three main areas: your technical competency, your ability to deliver results, and your compatibility with the team.",
      "Structure your response to address the company's specific needs mentioned in the job description."
    ],
    sampleResponse: "You should hire me because I not only have the React and Node.js expertise required for this role, but I also have a proven track record of delivering user-friendly features on tight deadlines. In my last job, I delivered a dashboard feature 2 weeks ahead of schedule. Furthermore, I thrive in collaborative, fast-paced team environments, and I am eager to contribute my skills to help your team hit its upcoming product milestones."
  },
  {
    id: 'hr-5',
    qNum: 5,
    qTitle: "Describe a challenge you faced and how you overcame it.",
    category: "Behavioral",
    description: "This question assesses your resilience, conflict resolution skills, and how you approach complex problems.",
    paragraphs: [
      "Use the STAR method (Situation, Task, Action, Result) to tell a structured, compelling story.",
      "1. Situation: Describe the context (keep it brief).",
      "2. Task: Explain the challenge or goal.",
      "3. Action: Detail the specific steps YOU took to address the problem.",
      "4. Result: Share the positive outcome (quantified if possible)."
    ],
    sampleResponse: "During a previous project, a key developer fell ill 5 days before a major client demo, leaving a crucial integration unfinished. As the lead frontend developer, I took the initiative to review their codebase, set up daily alignment syncs with the backend team, and worked extra hours to merge the APIs. Thanks to this effort, we successfully completed the integration on time, and the client was so impressed they signed a year-long contract extension."
  },
  {
    id: 'hr-6',
    qNum: 6,
    qTitle: "How do you handle conflict in the workplace?",
    category: "Behavioral",
    description: "Conflict is inevitable. Employers ask this to see if you handle disagreements maturely, professionally, and constructively.",
    paragraphs: [
      "Show that you are a good listener who separates emotions from facts. Focus on finding common ground and mutually beneficial solutions.",
      "Give an example where you active listened, stayed respectful, and worked out a compromise."
    ],
    sampleResponse: "I handle conflict by communicating directly, listening actively, and keeping the focus on project goals rather than personal differences. Once, a designer and I disagreed on a dashboard layout. Instead of arguing, I scheduled a short meeting where we both presented our reasoning. We realized we both wanted to minimize user clicks, so we combined his aesthetic design with my simplified navigation structure. The final page resulted in a 20% increase in user engagement."
  },
  {
    id: 'hr-7',
    qNum: 7,
    qTitle: "Where do you see yourself in 5 years?",
    category: "Common",
    description: "Employers ask this to check if you have realistic career goals, ambition, and if you plan to stay with the company long-term.",
    paragraphs: [
      "You don't need to name a specific job title, but you should show a desire to master your craft, take on leadership responsibilities, and contribute to the company's long-term growth."
    ],
    sampleResponse: "Over the next 5 years, my goal is to develop deep expertise in system architecture and cloud services. I see myself taking on leadership responsibilities, mentoring junior developers, and leading complex engineering projects. I want to build a long-term career here because your company's focus on continuous learning aligns perfectly with my professional growth goals, and I would love to be a key driver of your technology stack."
  },
  {
    id: 'hr-8',
    qNum: 8,
    qTitle: "How do you handle tight deadlines or stressful situations?",
    category: "Situational",
    description: "This question evaluates your prioritization skills, stress management, and work ethic in fast-paced environments.",
    paragraphs: [
      "Focus on structure, communication, and self-care. Explain how you break down problems, escalate issues early if needed, and maintain focus."
    ],
    sampleResponse: "When facing a tight deadline, I stay focused by prioritizing my tasks using the Eisenhower Matrix to separate urgent tasks from important ones. I communicate early and transparently with my manager if any bottlenecks arise, so we can adjust expectations or resources. I also practice stress-relief techniques like taking short walks or deep breathing, which helps me stay calm, think clearly, and write high-quality code even under pressure."
  },
  {
    id: 'hr-9',
    qNum: 9,
    qTitle: "Describe a time you failed and what you learned from it.",
    category: "Behavioral",
    description: "This question evaluates your ability to handle setbacks, learn from mistakes, and demonstrate accountability.",
    paragraphs: [
      "Admit a genuine professional mistake (avoid blaming others) and focus on the corrective actions and the constructive lesson you took away."
    ],
    sampleResponse: "Early in my career, I deployed an update without running a full regression test suite, which introduced a bug that broke the checkout page for 30 minutes. I immediately took responsibility, helped rollback the deployment, and patched the bug. From that failure, I learned the critical importance of QA pipelines. I created a pre-deployment checklist that our team still uses today, and we haven't had a deployment outage since."
  },
  {
    id: 'hr-10',
    qNum: 10,
    qTitle: "Do you have any questions for us?",
    category: "Common",
    description: "This is usually the final question of the interview. Saying 'No' shows a lack of interest. You should always ask thoughtful, open-ended questions.",
    paragraphs: [
      "Ask about team culture, upcoming technical challenges, success metrics, or company growth. This shows you are highly motivated and already thinking about how you can add value."
    ],
    sampleResponse: "Yes, I have two questions. First, what does success look like for someone in this role during their first 90 days? Second, what is the biggest technical challenge the engineering team is currently working on, and how does this role contribute to solving it?"
  }
];

const HRInterviewQuestions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestionIds, setOpenQuestionIds] = useState([]);

  const toggleQuestion = (id) => {
    setOpenQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]
    );
  };

  // Filter questions based on search query and active category
  const filteredQuestions = hrQuestionsData.filter((q) => {
    const matchesSearch =
      q.qTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.sampleResponse.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      activeCategory === 'all' || q.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <FiAward className="text-brand-600 dark:text-brand-400" />
          HR Interview Questions
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-550 font-medium mt-1">
          Practice the most frequently asked HR, behavioral, and situational interview questions with expert sample answers.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <div className="relative flex-1 max-w-md flex items-center">
          <FiSearch className="absolute left-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search questions, categories, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-500 dark:focus:border-brand-400 text-slate-850 dark:text-slate-150"
          />
        </div>

        {/* Category selection filters */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Category:</span>
          <div className="flex bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 p-0.5 rounded-lg text-[10px] font-bold">
            {['all', 'Common', 'Behavioral', 'Situational'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md uppercase tracking-wider transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-400 dark:text-slate-550 hover:text-slate-650 dark:hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion Questions List */}
      {filteredQuestions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredQuestions.map((q) => {
            const isOpen = openQuestionIds.includes(q.id);

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
                    <span className="text-xs sm:text-sm font-black text-slate-450 dark:text-slate-550 shrink-0 mt-0.5">
                      Q{q.qNum}.
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-850 dark:text-white leading-relaxed">
                      {q.qTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-black border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wide bg-slate-50 dark:bg-slate-800 text-slate-550 dark:text-slate-400">
                      {q.category}
                    </span>
                    <FiChevronDown 
                      className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                    />
                  </div>
                </button>

                {/* Dynamic Content Details wrapper */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden border-t border-slate-50 dark:border-slate-800/60 ${
                    isOpen ? 'max-h-[1200px] opacity-100 p-5' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Question Context/Purpose */}
                    {q.description && (
                      <p className="text-xs text-slate-450 dark:text-slate-500 italic font-semibold leading-relaxed border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                        Context: {q.description}
                      </p>
                    )}

                    {/* How to approach paragraphs */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">
                        How to approach this:
                      </h4>
                      {q.paragraphs.map((pText, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                          {pText}
                        </p>
                      ))}
                    </div>

                    {/* Sample answer Response box */}
                    {q.sampleResponse && (
                      <div className="bg-sky-50/50 dark:bg-sky-950/10 border border-sky-100/50 dark:border-sky-900/30 rounded-xl p-4 flex flex-col gap-2 mt-2">
                        <h4 className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider flex items-center gap-1.5">
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          Ideal Response:
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-750 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                          {q.sampleResponse}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
          No matching HR questions found. Try searching another keyword!
        </div>
      )}
    </div>
  );
};

export default HRInterviewQuestions;
