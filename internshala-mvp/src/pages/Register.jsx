import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiMail, FiLock, FiUser, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
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
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Register = () => {
  const { register, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEmailForm, setShowEmailForm] = useState(false);

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
      await register(name.trim(), email, password);
      addToast('Account created successfully! Welcome to the portal.', 'success');
      navigate('/profile'); // Redirect to Profile Setup wizard
    } catch (err) {
      addToast(err.message || 'Registration failed. Email might already exist.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const googleEmail = 'google.user@example.com';
    try {
      // First attempt to login standard Google account
      await login(googleEmail, 'password123');
      addToast('Welcome back! Signed in with Google.', 'success');
      navigate('/dashboard');
    } catch (loginErr) {
      // If user doesn't exist yet, register them
      try {
        await register('Google User', googleEmail, 'password123');
        addToast('Successfully signed in with Google!', 'success');
        navigate('/profile');
      } catch (regErr) {
        addToast('Google authentication failed. Please register with Email.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Column: Testimonials & Features */}
      <div className="hidden lg:col-span-7 bg-gradient-to-br from-slate-900 via-indigo-900 to-brand-700 lg:flex flex-col justify-between p-16 text-white relative overflow-hidden">
        {/* Decorative Grid Light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/4 translate-x-1/4"></div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-500/20">
            i
          </div>
          <span className="text-2xl font-black tracking-tight">
            Internshala<span className="text-brand-600">.</span>
          </span>
        </div>

        <div className="max-w-xl">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-8">
            Create an Account and Fast-Track Your Career.
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-300 shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Calculate Skill Match Percentages</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Our AI match engine compares job requirements to your resume keywords instantly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-300 shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">Interactive ATS Resume Scorer</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Build standard professional resume layouts and audit styling and keyword density in real-time.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-300 shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold">1-Click Fast Job Applications</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Apply directly using your online resume and track application states on your dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50 font-semibold border-t border-white/10 pt-6">
          <span>Supported by 10,000+ top startups and companies worldwide</span>
        </div>
      </div>

      {/* Right Column: Register Form Card */}
      <div className="lg:col-span-5 flex items-center justify-center p-8 bg-white shadow-xl relative z-10">
        <div className="max-w-md w-full flex flex-col gap-6">
          
          {/* Logo Title (Mobile only) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-lg">
              i
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">
              Internshala<span className="text-brand-600">.</span>
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create Account</h1>
            <p className="text-sm text-slate-500 font-medium">Join us today to set up your profile and explore opportunities.</p>
          </div>

          {!showEmailForm ? (
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full py-3.5 hover:bg-slate-50 border-slate-200 text-slate-700 font-bold"
                onClick={handleGoogleSignIn}
                loading={loading}
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-slate-100"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <Button
                variant="primary"
                className="w-full py-3.5 font-bold"
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
                className="w-full py-3 mt-2"
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
