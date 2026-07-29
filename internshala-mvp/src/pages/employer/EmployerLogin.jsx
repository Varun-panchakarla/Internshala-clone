import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { FiMail, FiLock, FiArrowLeft, FiBriefcase } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';

const EmployerLogin = () => {
  const { login } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleBackClick = () => {
    navigate('/');
  };

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Official company email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please enter a valid official company email.';
    
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
      const emp = await login(email, password);
      addToast('Welcome back! Recruiter login successful.', 'success');
      navigate(emp.onboardingCompleted ? '/employer/dashboard' : '/employer/onboarding');
    } catch (err) {
      const status = err.response?.status;
      const errMsg = err.response?.data?.error;
      if (status === 403 || errMsg?.includes('verify your email')) {
        addToast(errMsg || 'Please verify your email before logging in.', 'info');
        navigate('/employer/verify-email', { state: { email } });
      } else {
        addToast(errMsg || 'Login failed. Please check recruiter credentials.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Column: Form Card */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 bg-white shadow-xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 transition-colors focus:outline-none cursor-pointer z-20"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20" />

        <div className="max-w-md w-full flex flex-col gap-5 pt-10 sm:pt-14 my-auto">
          {/* Logo Heading */}
          <div className="flex items-center">
            <Logo className="h-12 w-auto" mode="light" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Employer Portal</h1>
            <p className="text-sm text-slate-500 font-medium">Log in to post jobs, manage applications, and hire top talent.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Official Company Email"
              id="email"
              type="email"
              placeholder="recruiter@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={FiMail}
              required
            />

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Link
                  to="/employer/forgot-password"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={FiLock}
                required
                hideLabel
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold text-sm h-12 rounded-xl mt-2 cursor-pointer"
              disabled={loading}
              loading={loading}
            >
              Continue
            </Button>
          </form>

          <div className="text-center text-xs font-semibold text-slate-400">
            Already have an account?{' '}
            <Link to="/employer/register" className="text-sky-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Graphic/Banner */}
      <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-sky-600 to-sky-850 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Abstract background decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        <div className="flex items-center gap-2">
          <FiBriefcase className="w-6 h-6 text-sky-200" />
          <span className="font-extrabold tracking-wider text-sm uppercase text-sky-100">IncuXAI Recruiter</span>
        </div>

        <div className="max-w-xl space-y-6 z-10">
          <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
            Hire the best candidates, faster.
          </h2>
          <p className="text-sky-100/80 text-base leading-relaxed font-medium">
            Access thousands of verified profiles, review resume scores instantly, and filter applicants seamlessly using our AI recruitment engine.
          </p>
        </div>

        <div className="text-xs text-sky-200/50 font-medium">
          &copy; {new Date().getFullYear()} IncuXAI Careers. Recruiter Portal.
        </div>
      </div>
    </div>
  );
};

export default EmployerLogin;
