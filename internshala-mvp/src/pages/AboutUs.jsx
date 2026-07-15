import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCpu, FiSearch, FiGlobe, FiBookOpen, FiBookmark, FiBell, FiShield,
  FiCheckCircle, FiSliders, FiTrendingUp, FiCompass, FiInfo, FiZap,
  FiEye, FiUsers, FiArrowRight
} from 'react-icons/fi';
import Button from '../components/common/Button';

const AboutUs = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const offers = [
    {
      icon: <FiCpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "AI-Powered Recommendations",
      desc: "Our smart algorithms analyze your profile skills and interests to suggest highly compatible opportunities with percentage match metrics."
    },
    {
      icon: <FiSearch className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Job Discovery",
      desc: "Discover a wide range of jobs aggregated across public portals with specialized filters for location, job type, and experience."
    },
    {
      icon: <FiGlobe className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Internship Discovery",
      desc: "Find targeted internship postings across diverse fields to help students and early-career candidates build hands-on experience."
    },
    {
      icon: <FiBookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Resume Builder",
      desc: "Build, edit, and export structured professional resumes into clean PDF format in just a few minutes using our integrated templates."
    },
    {
      icon: <FiBookmark className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Saved Jobs",
      desc: "Bookmark interesting listings with a single click, keeping your potential applications organized and accessible from your Dashboard."
    },
    {
      icon: <FiBell className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Job Alerts",
      desc: "Set search alerts to get notified whenever new job listings matching your specified parameters are consolidated on the platform."
    },
    {
      icon: <FiShield className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Secure Google Authentication",
      desc: "Register and log in securely with single sign-on support via Google, ensuring your identity is verified with industry-standard protocols."
    }
  ];

  const benefits = [
    {
      icon: <FiCpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Intelligent Recommendations",
      desc: "Skip the noise with custom matching algorithms that highlight roles aligning with your current background and skills."
    },
    {
      icon: <FiCheckCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Trusted Job Sources",
      desc: "We consolidate listings from publicly available, verified resources to display active and authentic career listings."
    },
    {
      icon: <FiSliders className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Modern User Experience",
      desc: "Enjoy a clean, fast interface optimized for responsiveness across mobile, tablet, and desktop viewports."
    },
    {
      icon: <FiTrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Career-Focused Tools",
      desc: "Take advantage of integrated helper tools like our Resume Builder and dashboard trackers to power your search."
    },
    {
      icon: <FiShield className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Secure Platform",
      desc: "We protect your candidate details with strict security measures. We do not sell or lease your personal information."
    }
  ];

  const steps = [
    {
      icon: <FiSearch className="w-5 h-5 text-white" />,
      title: "1. Search Jobs",
      desc: "Browse our aggregated database of active listings using keywords, skills, or target locations."
    },
    {
      icon: <FiCompass className="w-5 h-5 text-white" />,
      title: "2. Explore Opportunities",
      desc: "View detailed profiles of roles, review candidate requirements, and filter by your preferences."
    },
    {
      icon: <FiCpu className="w-5 h-5 text-white" />,
      title: "3. Receive AI Recommendations",
      desc: "Check your match score metrics on the Dashboard to see how closely your experience aligns with listings."
    },
    {
      icon: <FiInfo className="w-5 h-5 text-white" />,
      title: "4. View Job Details",
      desc: "Read descriptions, responsibilities, and qualifications consolidated on the dedicated job card."
    },
    {
      icon: <FiGlobe className="w-5 h-5 text-white" />,
      title: "5. Redirect to Employer Website",
      desc: "When you click \"Apply\", we route you securely to the employer's official application portal or system."
    },
    {
      icon: <FiCheckCircle className="w-5 h-5 text-white" />,
      title: "6. Submit Application",
      desc: "Finalize your application directly with the employer. They will manage your candidacy and recruitment updates."
    }
  ];

  const values = [
    {
      icon: <FiZap className="w-5 h-5 text-amber-500" />,
      title: "Innovation",
      desc: "We continuously build smart tech features to optimize and accelerate the path to discovery."
    },
    {
      icon: <FiEye className="w-5 h-5 text-teal-500" />,
      title: "Transparency",
      desc: "We display information clearly, ensuring candidates understand redirects, matching logic, and policies."
    },
    {
      icon: <FiShield className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Trust",
      desc: "We prioritize user privacy and secure authentication, ensuring personal data is strictly protected."
    },
    {
      icon: <FiUsers className="w-5 h-5 text-indigo-500" />,
      title: "Accessibility",
      desc: "We build intuitive, responsive tools that make job searching simpler for candidates at all experience levels."
    },
    {
      icon: <FiTrendingUp className="w-5 h-5 text-emerald-500" />,
      title: "Continuous Improvement",
      desc: "We regularly refine our aggregation methods and user features to provide the best career portal experience."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full animate-slide-up py-12 px-6 sm:px-8 flex flex-col gap-20">
      
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
          About IncuXAI Careers
        </h1>
        <p className="text-brand-600 dark:text-brand-400 text-lg sm:text-xl font-bold font-heading">
          Helping people discover meaningful career opportunities through intelligent technology.
        </p>
        <div className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed font-medium space-y-4 text-left sm:text-center mt-4">
          <p>
            IncuXAI Careers is an AI-powered job and internship aggregation platform developed and maintained by IncuXAI Private Limited. We believe that discovering your next professional step should not require searching across dozens of disconnected websites.
          </p>
          <p>
            Our technology scans trusted resources across the web to consolidate the most active, relevant opportunities into one unified, clean database. Combined with candidate-focused utilities like our Resume Builder and dashboard analytics, we aim to streamline the job discovery process.
          </p>
        </div>
      </section>

      {/* 2. Who We Are */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Who We Are
          </h2>
          <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Built for modern career search
          </p>
          <div className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-medium space-y-3">
            <p>
              IncuXAI Careers exists to serve as a bridge. Finding jobs or internships can feel overwhelming with postings scattered across various company boards, candidate portals, and networks.
            </p>
            <p>
              We built this platform for college students seeking their first internships, professionals planning their next career change, and anyone looking for a simplified search experience. We do not host exclusive employer postings; instead, we build tools that make public data work better for you.
            </p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="h-2 w-16 bg-brand-500 rounded-full"></div>
          <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-350">
            "By indexing public opportunities and calculating personalized match metrics, we save candidates valuable research hours and show them where their skills will fit best."
          </p>
        </div>
      </section>

      {/* 3. Our Mission & 4. Our Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="flex flex-col gap-4 p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 font-heading">
            Our Mission
          </h3>
          <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-medium">
            To simplify and optimize career discovery. We are dedicated to harnessing intelligent calculations to strip away the complexity of job searching, helping candidates access, track, and align opportunities with their technical profile.
          </p>
        </div>
        {/* Vision */}
        <div className="flex flex-col gap-4 p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 font-heading">
            Our Vision
          </h3>
          <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed font-medium">
            To serve as a trusted navigation assistant for professional talent worldwide. We envision an ecosystem where finding work is clear, secure, and powered by transparent matches, enabling everyone to connect with their true career potential.
          </p>
        </div>
      </section>

      {/* 5. What We Offer */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            What We Offer
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Intuitive tools built directly into your candidate workspace
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/30 transition-all flex flex-col gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center">
                {offer.icon}
              </div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                {offer.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold leading-relaxed">
                {offer.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Why Choose IncuXAI Careers */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Why Choose IncuXAI Careers
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Why candidates count on our aggregation tools
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center shrink-0">
                  {benefit.icon}
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 font-heading">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold leading-relaxed">
                {benefit.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. How IncuXAI Careers Works */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            How IncuXAI Careers Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Our step-by-step career search journey
          </p>
        </div>
        
        {/* Step-by-step visual timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {steps.map((step, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0 font-bold shadow-sm shadow-brand-500/20">
                  {step.icon}
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 font-heading">
                  {step.title}
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Our Core Values */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Our Core Values
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            The principles guiding our product development
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((val, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center">
                {val.icon}
              </div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                {val.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Important Notice */}
      <section className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-550 dark:text-slate-400 flex flex-col gap-3 shadow-sm max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <FiInfo className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <h4 className="font-bold uppercase tracking-wider text-[10px]">
            Important Notice
          </h4>
        </div>
        <ul className="list-disc pl-5 space-y-2 font-medium leading-relaxed">
          <li>IncuXAI Careers is an AI-powered job and internship aggregation platform that indexes publicly available listings.</li>
          <li>We do not host proprietary job applications; clicking "Apply" redirects you to the employer's official website or recruitment portal to complete the process.</li>
          <li>All hiring decisions, recruitment feedback, and candidate communications are made solely by the respective employers.</li>
          <li>IncuXAI Careers has no relationship with hiring actions and does not influence recruitment decisions.</li>
        </ul>
      </section>

      {/* 10. Closing Call-to-Action */}
      <section className="text-center max-w-xl mx-auto flex flex-col items-center gap-6 p-8 rounded-2xl bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100/50 dark:border-brand-900/10 shadow-xs">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Begin Your Career Journey
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
            Ready to explore? Put our aggregation engine and AI recommendations to work for you.
          </p>
        </div>
        <Button
          onClick={() => navigate('/jobs')}
          variant="primary"
          className="flex items-center gap-2 px-8 py-3 text-xs font-extrabold tracking-wider uppercase"
        >
          <span>Browse Opportunities</span>
          <FiArrowRight className="w-4 h-4" />
        </Button>
      </section>

    </div>
  );
};

export default AboutUs;
