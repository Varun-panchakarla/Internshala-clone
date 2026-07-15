import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

const HelpCentre = () => {
  const [expandedId, setExpandedId] = useState(null);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqCategories = [
    {
      title: "1. Getting Started",
      items: [
        {
          id: "gs-1",
          question: "What is IncuXAI Careers?",
          answer: "IncuXAI Careers is an AI-powered job and internship aggregation platform owned and operated by IncuXAI Private Limited. We consolidate publicly available job listings from across the web, calculate match scores based on candidate skills, and redirect applicants to the official employer application pages."
        },
        {
          id: "gs-2",
          question: "How do I create an account?",
          answer: "You can register an account by clicking the \"Register\" button in the top right corner. Fill in your name, email, and choose a secure password. You will then have access to the Resume Builder, Dashboard, and search filters."
        },
        {
          id: "gs-3",
          question: "How do I sign in with Google?",
          answer: "On the Login or Register page, click the \"Sign in with Google\" button. Authenticate using your Google credentials, and your profile will be created or logged in automatically using your Google details."
        },
        {
          id: "gs-4",
          question: "I forgot my password.",
          answer: "Click the \"Forgot Password\" link on the Login page. Enter your registered email address, and we will send you instructions to reset your password securely."
        }
      ]
    },
    {
      title: "2. Finding Jobs & Internships",
      items: [
        {
          id: "fj-1",
          question: "How do I search for jobs?",
          answer: "Use the search bar on the landing page or Browse Jobs page. Enter key terms such as job titles, specific skills, or company names to display matching roles."
        },
        {
          id: "fj-2",
          question: "How do I search for internships?",
          answer: "Click \"Browse Internships\" in the footer or select the \"Internship\" checkbox under the Job Type filter on the search sidebar."
        },
        {
          id: "fj-3",
          question: "How do I filter job listings?",
          answer: "On the search page, you can use the sidebar filters to refine results by employment type (Full-time, Part-time, Internship, Contract), experience level, salary range, and location (including remote)."
        },
        {
          id: "fj-4",
          question: "How do I save jobs?",
          answer: "When browsing listings, click the bookmark/star icon on any job card. Saved jobs are bookmarked in your account for quick access later."
        },
        {
          id: "fj-5",
          question: "Where can I find my saved jobs?",
          answer: "Access your candidate Dashboard or click \"Saved Jobs\" from the user menu in the top right corner to view your bookmarked listings."
        }
      ]
    },
    {
      title: "3. Applying for Jobs",
      items: [
        {
          id: "ap-1",
          question: "Why am I redirected to another website?",
          answer: "IncuXAI Careers functions as a job aggregator. We collect public career listings and direct you to the employer's official website, recruitment portal, or applicant tracking system (ATS) to complete the application process safely."
        },
        {
          id: "ap-2",
          question: "Why can't I apply directly on IncuXAI Careers?",
          answer: "To ensure your application is received directly and securely by the employer's human resources team, all submissions must be finalized on the employer's official website."
        },
        {
          id: "ap-3",
          question: "Does IncuXAI Careers hire candidates?",
          answer: "No. IncuXAI Careers consolidates job postings and provides search tools. We are not an employer, recruitment agency, or staffing partner, and we have no influence over hiring decisions."
        },
        {
          id: "ap-4",
          question: "What should I do if an application link doesn't work?",
          answer: "Broken links can occur if an employer removes a job posting or updates their system. Please report the job listing using the \"Report an Issue\" link in the footer so our team can update the database."
        }
      ]
    },
    {
      title: "4. Resume Builder",
      items: [
        {
          id: "rb-1",
          question: "How do I create a resume?",
          answer: "Log in and navigate to the Resume Builder page from the footer or sidebar. Fill in your personal details, academic history, skills, experience, and certifications to format a professional layout automatically."
        },
        {
          id: "rb-2",
          question: "Can I edit my resume?",
          answer: "Yes. You can access the Resume Builder at any time to add new experiences, edit text, or update your contact details. Changes are saved automatically."
        },
        {
          id: "rb-3",
          question: "Can I download my resume?",
          answer: "Yes. Once you have populated your details, click the \"Download PDF\" button in the Resume Builder workspace to save a clean PDF copy."
        },
        {
          id: "rb-4",
          question: "Is my resume automatically shared with employers?",
          answer: "No. IncuXAI Careers values your privacy. Your resume data is stored securely in your profile and is not shared with any external employers or third parties without your active consent."
        }
      ]
    },
    {
      title: "5. Dashboard & Job Alerts",
      items: [
        {
          id: "da-1",
          question: "What is the Dashboard?",
          answer: "The Dashboard is your personalized career homepage. It displays recent profile metrics, percentage match scores, and AI-recommended jobs based on your listed skills."
        },
        {
          id: "da-2",
          question: "How do Job Alerts work?",
          answer: "You can enable alerts for specific searches. You will receive email notifications or dashboard alerts when new opportunities matching your criteria are consolidated."
        },
        {
          id: "da-3",
          question: "How do I update my profile?",
          answer: "Go to the Profile page from the top-right user menu. Here you can update your credentials, resume details, preferences, and career targets."
        },
        {
          id: "da-4",
          question: "How do I manage my account?",
          answer: "Navigate to the \"Manage Account\" page from the user menu to edit account security settings, update login details, or delete your account."
        }
      ]
    },
    {
      title: "6. AI Features",
      items: [
        {
          id: "ai-1",
          question: "How do AI-powered recommendations work?",
          answer: "Our local algorithms analyze the skills, education, and preferences listed in your profile and compare them against active job descriptions to calculate compatibility matches."
        },
        {
          id: "ai-2",
          question: "Why am I seeing certain job recommendations?",
          answer: "Recommendations are generated by matching the keyword density of your profile skills with requirements in consolidated listings. You can update your skills list to see more relevant roles."
        },
        {
          id: "ai-3",
          question: "Does AI guarantee employment?",
          answer: "No. AI-powered matching percentages and recommendations are tools designed to assist and optimize your search. They do not guarantee interviews, employment, or hiring outcomes."
        }
      ]
    },
    {
      title: "7. Safety & Security",
      items: [
        {
          id: "ss-1",
          question: "Never pay money to apply for a job.",
          answer: "Legitimate companies and IncuXAI Careers will never ask for fees, security deposits, application processing charges, or mandatory paid training during the hiring process."
        },
        {
          id: "ss-2",
          question: "How can I identify fraudulent job postings?",
          answer: "Watch out for unrealistic salaries, recruiters using free email domains (like Gmail or Yahoo), requests for bank credentials, or messages asking you to pay money."
        },
        {
          id: "ss-3",
          question: "What should I do if I receive suspicious messages?",
          answer: "Do not share sensitive details, passwords, bank numbers, or OTPs. Cease communications immediately and report the sender."
        },
        {
          id: "ss-4",
          question: "How do I report a suspicious job listing?",
          answer: "If a listing on our platform appears fraudulent, click the \"Report an Issue\" link in the footer or contact our support team at security@incuxai.com."
        }
      ]
    },
    {
      title: "8. Privacy & Policies",
      items: [
        {
          id: "pp-1",
          question: "Where can I read the Privacy Policy?",
          answer: "You can view our full Privacy Policy at the /privacy-policy link located in the footer."
        },
        {
          id: "pp-2",
          question: "Where can I read the Terms & Conditions?",
          answer: "You can access our complete Terms & Conditions page at the /terms link located in the footer."
        },
        {
          id: "pp-3",
          question: "How is my personal information used?",
          answer: "We use your data solely to run portal features (like Resume Builder calculations and Dashboard recommendations) according to our Privacy Policy. We do not sell your personal data."
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full animate-slide-up py-12 px-6 sm:px-8">
      {/* Header section styled as a Support Center */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-heading">
          Support & Help Centre
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
          Have questions about IncuXAI Careers? Browse our frequently asked questions below or contact our team if you need further assistance.
        </p>
      </div>

      {/* Categories Wrapper */}
      <div className="flex flex-col gap-10">
        {faqCategories.map((category) => (
          <div key={category.title} className="flex flex-col gap-4">
            {/* Category Header */}
            <h2 className="text-base font-black text-slate-850 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 font-heading">
              {category.title}
            </h2>

            {/* Accordion Stack */}
            <div className="flex flex-col gap-3">
              {category.items.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 transition-colors duration-200"
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`w-full flex items-center justify-between text-left p-4 transition-colors font-bold text-xs cursor-pointer select-none focus:outline-none ${
                        isExpanded
                          ? 'bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-850'
                      }`}
                    >
                      <span>{item.question}</span>
                      <FiChevronDown
                        className={`w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
                        }`}
                      />
                    </button>

                    {/* Collapsible Panel */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden bg-white dark:bg-slate-900 ${
                        isExpanded ? 'max-h-96 border-t border-slate-100 dark:border-slate-800' : 'max-h-0'
                      }`}
                    >
                      <div className="p-4 text-xs font-medium leading-relaxed text-slate-550 dark:text-slate-400">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpCentre;
