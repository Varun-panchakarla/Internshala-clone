import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiMail, FiLock, FiChevronRight, FiBriefcase, FiArrowLeft } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleBackClick = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please enter a valid email address.';
    
    if (!password) tempErrors.password = 'Password is required.';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      addToast('Welcome back! Login successful.', 'success');
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user?.id}`) === 'true';
      navigate(onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) {
      addToast(err.response?.data?.error || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      addToast('Google authentication failed.', 'error');
      return;
    }
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      addToast('Signed in with Google!', 'success');
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user?.id}`) === 'true';
      navigate(onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) {
      addToast(err.response?.data?.error || 'Google sign-in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Column: Form Card */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 bg-white shadow-xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 transition-colors focus:outline-none cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="max-w-md w-full flex flex-col gap-8">
          
          {/* Logo Heading */}
          <div className="flex items-center">
            <Logo className="h-12 w-auto" mode="light" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-sm text-slate-500 font-medium">Log in to search and apply for your dream jobs and internships.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="w-full overflow-hidden rounded-lg [&>div]:w-full">
              <GoogleLogin
                theme="outline"
                size="large"
                width="100%"
                text="continue_with"
                shape="rectangular"
                onSuccess={handleGoogleSuccess}
                onError={() => addToast('Google sign-in failed.', 'error')}
              />
            </div>

            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

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

            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              icon={FiLock}
              required
            />

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              loading={loading}
            >
              Sign In <FiChevronRight className="ml-1.5 w-4 h-4" />
            </Button>
          </form>

          <p className="text-sm font-medium text-slate-500 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
              Create an Account
            </Link>
          </p>

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
            "I built my resume on IncuXAI Careers, tracked my application matches in real-time, and landed a Full Stack Internship at Google within two weeks!"
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

export default Login;
