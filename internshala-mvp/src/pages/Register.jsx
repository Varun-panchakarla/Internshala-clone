import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiMail, FiLock, FiUser, FiChevronRight, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

const Register = () => {
  const { register, googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(true);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Full name is required.';
    else if (name.trim().length < 2) tempErrors.name = 'Name must be at least 2 characters.';

    if (!email) tempErrors.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please enter a valid email address.';

    if (!password) tempErrors.password = 'Password is required.';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters.';

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await register(name.trim(), email, password);
      addToast(data.message || 'Registration successful! Verification code sent to your email.', 'success');
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed. Email might already exist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const user = await googleLogin({ access_token: tokenResponse.access_token });
        addToast('Registered successfully!', 'success');
        
        if (['admin', 'super_admin'].includes(user?.role)) {
          navigate('/admin');
        } else {
          const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user?.id}`) === 'true';
          navigate(onboardingCompleted ? '/dashboard' : '/onboarding');
        }
      } catch (err) {
        addToast(err.response?.data?.error || 'Google sign-up failed.', 'error');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      addToast('Google sign-up failed.', 'error');
    }
  });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Column: Visual Brand / Info */}
      <div className="lg:col-span-7 hidden lg:flex flex-col justify-between p-12 bg-brand-600 text-white relative overflow-hidden mesh-bg">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-700/50 to-purple-800/30 mix-blend-multiply" />
        
        {/* Animated ambient circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] aspect-square rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10">
          <Logo className="h-10 w-auto text-white" mode="dark" />
        </div>

        <div className="max-w-xl my-auto relative z-10 pt-16">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Start Your Professional Journey Today.
          </h2>
          <p className="mt-4 text-base text-slate-100 font-light leading-relaxed">
            Create an account to build your professional resume, practice standard interview questions, and apply to top startups and companies.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <FiCheckCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-base font-bold">Personalized Onboarding</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Configure your search preferences and receive matching job recommendations daily.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <FiCheckCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-base font-bold">Curated Interview Kits</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Access detailed Q&As for standard technical, coding, and HR rounds.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <FiCheckCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-base font-bold">1-Click Fast Job Applications</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Apply directly using your online resume and track application states on your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Register Form Card */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 bg-white shadow-xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 transition-colors focus:outline-none cursor-pointer z-20"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="max-w-md w-full flex flex-col gap-5 pt-10 sm:pt-14 my-auto">
          
          {/* Logo Title */}
          <div className="flex items-center">
            <Logo className="h-12 w-auto" mode="light" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Account</h1>
            <p className="text-sm text-slate-500 font-medium">Join us today to set up your profile and explore opportunities.</p>
          </div>

           {!showEmailForm ? (
             <div className="flex flex-col gap-4">
               <Button
                 type="button"
                 variant="outline"
                 onClick={handleGoogleLoginClick}
                 disabled={loading}
                 className="w-full h-[56px] relative text-slate-700 dark:text-slate-250 border-slate-200 dark:border-slate-800 !rounded-2xl font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm hover:shadow-md cursor-pointer"
               >
                 <div className="absolute left-6 flex items-center">
                   <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                     <path
                       fill="#4285F4"
                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                     />
                     <path
                       fill="#34A853"
                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                     />
                     <path
                       fill="#FBBC05"
                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                     />
                     <path
                       fill="#EA4335"
                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                     />
                   </svg>
                 </div>
                 <span>Continue with Google</span>
               </Button>

               {!googleScriptLoaded && (
                 <p className="text-[11px] text-slate-500 font-semibold text-center leading-normal bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                   Having trouble seeing the Google button? Try disabling any active ad-blockers and refresh the page.
                 </p>
               )}

               <div className="flex items-center my-2">
                 <div className="flex-grow border-t border-slate-100"></div>
                 <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">or</span>
                 <div className="flex-grow border-t border-slate-100"></div>
               </div>

               <Button
                 variant="primary"
                 className="w-full h-[56px] font-bold !rounded-2xl"
                 onClick={() => setShowEmailForm(true)}
               >
                 <FiMail className="mr-2 w-4.5 h-4.5" />
                 Continue with Email
               </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-2 transition-colors self-start focus:outline-none flex items-center gap-1 cursor-pointer"
              >
                ← Back to sign up options
              </button>

              <Input
                label="Full Name"
                id="name"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                icon={FiUser}
                required
              />

              <Input
                label="Email Address"
                id="email"
                type="email"
                placeholder="name@example.com"
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
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={FiLock}
                required
              />

              <Input
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                icon={FiLock}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-[56px] mt-2 !rounded-2xl"
                loading={loading}
              >
                Sign Up <FiChevronRight className="ml-1.5 w-4 h-4" />
              </Button>
            </form>
          )}

          <p className="text-sm font-medium text-slate-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
};

export default Register;
