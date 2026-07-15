import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBriefcase, FiAward, FiZap, FiBookOpen, FiUsers, 
  FiArrowRight, FiInfo, FiCompass, FiCpu, FiTrendingUp 
} from 'react-icons/fi';
import Button from '../components/common/Button';

const Careers = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const reasons = [
    {
      icon: <FiZap className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Innovation",
      desc: "Work on meaningful technology solutions that consolidate job listings and deliver smart compatibility scores."
    },
    {
      icon: <FiTrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Growth",
      desc: "Learn continuously, take on challenges, and grow professionally alongside modern tech stacks."
    },
    {
      icon: <FiUsers className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Collaboration",
      desc: "Work with passionate individuals in a supportive environment built on sharing feedback and knowledge."
    },
    {
      icon: <FiAward className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Ownership",
      desc: "Take responsibility, drive your own projects, and directly contribute to real product development."
    },
    {
      icon: <FiCpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />,
      title: "Impact",
      desc: "Build features and algorithms that assist thousands of job seekers with their daily career searches."
    }
  ];

  const lifeCards = [
    {
      icon: <FiBookOpen className="w-5 h-5 text-emerald-500" />,
      title: "Learning First",
      desc: "We promote a growth mindset. Everyone is encouraged to ask questions, explore new tools, and constantly build their skills."
    },
    {
      icon: <FiAward className="w-5 h-5 text-indigo-500" />,
      title: "Ownership",
      desc: "We trust our team members. You will have high autonomy to propose projects, lead tasks, and see your ideas go live."
    },
    {
      icon: <FiZap className="w-5 h-5 text-amber-500" />,
      title: "Innovation",
      desc: "We build features with purpose. We are dedicated to finding clean, smart ways to solve navigation and search issues."
    },
    {
      icon: <FiUsers className="w-5 h-5 text-rose-500" />,
      title: "Collaboration",
      desc: "We win as a team. We host regular discussions and reviews to ensure everyone gets feedback and supportive help."
    }
  ];

  const processSteps = [
    {
      icon: <FiBriefcase className="w-5 h-5 text-white" />,
      title: "1. Application",
      desc: "Apply to our talent pool or listed openings by providing your details and formatting your resume."
    },
    {
      icon: <FiCompass className="w-5 h-5 text-white" />,
      title: "2. Resume Review",
      desc: "Our engineering and product teams review your background, project history, and experience."
    },
    {
      icon: <FiUsers className="w-5 h-5 text-white" />,
      title: "3. Interview",
      desc: "Speak with us about your previous work, coding style, and how you approach building product features."
    },
    {
      icon: <FiCpu className="w-5 h-5 text-white" />,
      title: "4. Assessment",
      desc: "Complete a comfortable, short coding challenge or design review task related to real platform modules."
    },
    {
      icon: <FiInfo className="w-5 h-5 text-white" />,
      title: "5. Final Discussion",
      desc: "Align on culture fit, team structure, and discuss expectations for the role."
    },
    {
      icon: <FiAward className="w-5 h-5 text-white" />,
      title: "6. Offer",
      desc: "We extend a formal offer detailing compensation, responsibilities, and start timelines."
    }
  ];

  const futureAreas = [
    { title: "Software Engineering", desc: "Building scalable platforms, databases, and API integrations." },
    { title: "Frontend Development", desc: "Crafting modern, responsive React interfaces and candidate components." },
    { title: "Backend Development", desc: "Maintaining secure databases, user credentials, and cloud modules." },
    { title: "AI & Machine Learning", desc: "Optimizing skill matching algorithms and recommendation lists." },
    { title: "Product Design", desc: "Creating intuitive UI/UX user flows, wireframes, and design components." },
    { title: "Marketing", desc: "Expanding candidate outreach, social visibility, and company partnerships." },
    { title: "Business Development", desc: "Establishing trusted integrations with recruitment partners." }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full animate-slide-up py-12 px-6 sm:px-8 flex flex-col gap-20">
      
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto flex flex-col gap-6">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
          Careers at IncuXAI
        </h1>
        <p className="text-brand-600 dark:text-brand-400 text-lg sm:text-xl font-bold font-heading">
          Help us build technology that empowers people to discover meaningful career opportunities.
        </p>
        <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed font-medium mt-4">
          At IncuXAI, we believe that career discovery should be clear and accessible to everyone. Our team values innovation, transparent collaboration, ownership, and continuous learning. We build technology with a purpose to save candidate hours and connect talent with opportunities.
        </p>
      </section>

      {/* 2. Why Join IncuXAI */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Why Join IncuXAI
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            What makes working with us rewarding
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/30 transition-all flex flex-col gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center">
                {reason.icon}
              </div>
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                {reason.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold leading-relaxed">
                {reason.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Life at IncuXAI */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Life at IncuXAI
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            How we think, build, and support each other
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {lifeCards.map((card, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 font-heading">
                  {card.title}
                </h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Our Hiring Process */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Our Hiring Process
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Our step-by-step assessment timeline
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processSteps.map((step, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-650 flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/20">
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

      {/* 5. Current Opportunities */}
      <section className="flex flex-col gap-10 max-w-3xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Current Opportunities
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Active internal openings at IncuXAI
          </p>
        </div>

        {/* Empty State Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
            <FiBriefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">No Open Positions Available</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed font-semibold">
              Thank you for your interest in joining IncuXAI. We are not actively hiring at the moment. However, we are always excited to connect with talented individuals who share our vision. Please check back later for future opportunities.
            </p>
          </div>
        </div>

        {/* Join Our Talent Community */}
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-6 shadow-xs">
          <div className="flex flex-col gap-2 max-w-xl">
            <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 font-heading">
              Join Our Talent Community
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              We're always interested in connecting with passionate individuals who share our vision. Even if there isn't a suitable opportunity today, we'd love to hear from you. Stay connected and check back for future career opportunities.
            </p>
          </div>
          <Button
            onClick={() => navigate('/contact')}
            variant="primary"
            className="flex items-center gap-2 px-8 py-3 text-xs font-extrabold tracking-wider uppercase"
          >
            <span>Contact Us</span>
            <FiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* 6. Future Opportunities */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Future Opportunities
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Areas of potential future hiring interest
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {futureAreas.map((area, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 shadow-xs">
              <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                {area.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold leading-relaxed">
                {area.desc}
              </p>
              <span className="text-[10px] font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider mt-1 block">
                Future Interest Area
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Stay Connected */}
      <section className="text-center max-w-xl mx-auto flex flex-col items-center gap-6 p-8 rounded-2xl bg-brand-50/50 dark:bg-brand-950/10 border border-brand-100/50 dark:border-brand-900/10 shadow-xs">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-black text-slate-850 dark:text-slate-100 font-heading">
            Interested in working with us in the future?
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
            We'd love to hear from talented individuals who are passionate about technology and innovation.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/contact')}
            variant="primary"
            className="flex items-center justify-center gap-2 px-8 py-3 text-xs font-extrabold tracking-wider uppercase w-full sm:w-auto"
          >
            <span>Contact Us</span>
          </Button>
          <Button
            onClick={() => navigate('/about')}
            variant="secondary"
            className="flex items-center justify-center gap-2 px-8 py-3 text-xs font-extrabold tracking-wider uppercase w-full sm:w-auto"
          >
            <span>Learn About Us</span>
          </Button>
        </div>
      </section>

    </div>
  );
};

export default Careers;
