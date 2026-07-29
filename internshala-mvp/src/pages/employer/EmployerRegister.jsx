import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { FiUser, FiBriefcase, FiMail, FiPhone, FiGlobe, FiLock, FiArrowLeft } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';

const EmployerRegister = () => {
  const { register } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [recruiterName, setRecruiterName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleBackClick = () => {
    navigate('/employer/login');
  };

  const validate = () => {
    const tempErrors = {};
    if (!recruiterName.trim()) tempErrors.recruiterName = 'Recruiter full name is required.';
    if (!companyName.trim()) tempErrors.companyName = 'Company name is required.';
    
    if (!email) tempErrors.email = 'Official company email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Please enter a valid official company email.';

    if (!phone) tempErrors.phone = 'Phone number is required.';
    else if (!/^\+?\d{8,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      tempErrors.phone = 'Please enter a valid phone number (minimum 8 digits).';
    }

    if (website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(website.trim())) {
      tempErrors.website = 'Please enter a valid website URL.';
    }

    if (!password) tempErrors.password = 'Password is required.';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters.';

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreed) {
      tempErrors.agreed = 'You must agree to the Terms & Conditions.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        recruiterName,
        companyName,
        email,
        phone,
        website,
        password,
      });
      addToast('Recruiter account created successfully! Check your email for OTP.', 'success');
      navigate('/employer/verify-email', { state: { email } });
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Column: Form Card */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 bg-white shadow-xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 transition-colors focus:outline-none cursor-pointer z-20"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20" />

        <div className="max-w-md w-full flex flex-col gap-4 pt-12 sm:pt-16 my-auto">
          {/* Logo Heading */}
          <div className="flex items-center">
            <Logo className="h-10 w-auto" mode="light" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Recruiter Account</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Join IncuXAI Careers to post jobs and find great talent.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <Input
              label="Recruiter Full Name"
              id="recruiterName"
              placeholder="e.g. John Doe"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              error={errors.recruiterName}
              icon={FiUser}
              required
            />

            <Input
              label="Company Name"
              id="companyName"
              placeholder="e.g. IncuXAI Tech"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              error={errors.companyName}
              icon={FiBriefcase}
              required
            />

            <Input
              label="Official Company Email"
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
              label="Phone Number"
              id="phone"
              type="tel"
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              icon={FiPhone}
              required
            />

            <Input
              label="Company Website (Optional)"
              id="website"
              placeholder="e.g. https://company.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              error={errors.website}
              icon={FiGlobe}
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
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={FiLock}
              required
            />

            <div className="flex flex-col gap-1.5 mt-1">
              <label className="flex items-start gap-2.5 text-xs text-slate-500 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-200 text-sky-600 focus:ring-sky-500/25 mt-0.5 cursor-pointer"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-sky-600 hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and Privacy Policy.
                </span>
              </label>
              {errors.agreed && <span className="text-xs text-rose-500 font-medium">{errors.agreed}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold text-sm h-11 rounded-xl mt-2 cursor-pointer"
              disabled={loading}
              loading={loading}
            >
              Create Employer Account
            </Button>
          </form>

          <div className="text-center text-xs font-semibold text-slate-400 pb-4">
            Already have an account?{' '}
            <Link to="/employer/login" className="text-sky-600 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Graphic/Banner */}
      <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 bg-gradient-to-br from-sky-600 to-sky-850 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-400/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />

        <div className="flex items-center gap-2">
          <FiBriefcase className="w-6 h-6 text-sky-200" />
          <span className="font-extrabold tracking-wider text-sm uppercase text-sky-100">IncuXAI Recruiter</span>
        </div>

        <div className="max-w-xl space-y-6 z-10">
          <h2 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
            Build your dream team today.
          </h2>
          <p className="text-sky-100/80 text-base leading-relaxed font-medium">
            Post job openings, track candidate applications, verify credentials, and schedule interviews all within a single unified workspace.
          </p>
        </div>

        <div className="text-xs text-sky-200/50 font-medium">
          &copy; {new Date().getFullYear()} IncuXAI Careers. Recruiter Portal.
        </div>
      </div>
    </div>
  );
};

export default EmployerRegister;
