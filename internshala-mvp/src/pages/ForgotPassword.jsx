import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { FiMail, FiLock, FiChevronRight, FiBriefcase, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ForgotPassword = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate API request delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      addToast('Reset instructions sent to your email address.', 'success');
    }, 800);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans animate-fade-in">
      {/* Left Column: Form Card */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 bg-white shadow-xl relative z-10">
        <div className="max-w-md w-full flex flex-col gap-8">
          
          {/* Logo Heading */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/20">
              i
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              Internshala<span className="text-brand-600">.</span>
            </span>
          </div>

          {!submitted ? (
            <>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Forgot Password?</h1>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  icon={FiMail}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 mt-2 font-bold"
                  loading={loading}
                >
                  Send Reset Link <FiChevronRight className="ml-1.5 w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex gap-3 text-emerald-800">
                <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                <div className="text-xs leading-relaxed font-semibold">
                  If an account with this email exists, a password reset link has been sent.
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Please check your inbox (and spam folder) for instructions to change your password.
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-brand-600 transition-colors focus:outline-none cursor-pointer">
              <FiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>

        </div>
      </div>

      {/* Right Column: Hero Visual Showcase */}
      <div className="hidden lg:col-span-7 bg-gradient-to-br from-brand-600 via-indigo-700 to-slate-900 lg:flex flex-col justify-between p-16 text-white relative overflow-hidden">
        {/* Abstract Ambient Circles */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>

        {/* Floating cards to mimic dashboard items - Repositioned to top-8% to prevent heading overlap */}
        <div className="absolute top-[8%] right-[10%] w-72 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rotate-3 animate-pulse-slow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-300">
              <FiBriefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Full Stack Engineer</h4>
              <p className="text-[10px] text-white/60">Google • Bangalore</p>
            </div>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-emerald-400 h-full w-[92%] rounded-full" />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-emerald-300">
            <span>Skill Match Score</span>
            <span>92%</span>
          </div>
        </div>

        {/* Dynamic empty flex spacer for layout flow after badge removal */}
        <div className="h-10" />

        <div className="max-w-xl">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-6">
            Connecting Top Talent with Premium Work Opportunities.
          </h2>
          <blockquote className="border-l-4 border-emerald-400 pl-6 italic text-lg text-slate-100/90 leading-relaxed font-light">
            "I built my resume on Internshala, tracked my application matches in real-time, and landed a Full Stack Internship at Google within two weeks!"
            <footer className="mt-2 text-sm font-bold text-white not-italic">— Rohan Kumar, IIT Madras</footer>
          </blockquote>
        </div>

        <div className="flex items-center justify-between text-xs text-white/50 font-semibold border-t border-white/10 pt-6">
          <span>Internships • Jobs • Remote Work</span>
          <span>100% Free for Students</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
