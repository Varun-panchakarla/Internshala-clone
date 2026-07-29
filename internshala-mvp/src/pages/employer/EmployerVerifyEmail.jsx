import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { FiMail, FiClock, FiArrowLeft } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';
import ThemeToggle from '../../components/common/ThemeToggle';
import { employerService } from '../../services/mockApi';

const EmployerVerifyEmail = () => {
  const { verifyEmailOtp } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleBackClick = () => {
    navigate('/employer/register');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your official company email address.', 'error');
      return;
    }
    if (otp.length !== 6) {
      addToast('Please enter a valid 6-digit verification OTP.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const emp = await verifyEmailOtp(email, otp);
      addToast('Email verified successfully! Welcome to IncuXAI Recruiter.', 'success');
      navigate(emp.onboardingCompleted ? '/employer/dashboard' : '/employer/onboarding');
    } catch (err) {
      addToast(err.response?.data?.error || 'Verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    if (!email) {
      addToast('Please enter your email to resend OTP.', 'error');
      return;
    }

    setResending(true);
    try {
      await employerService.resendOtp(email);
      addToast('A new verification code has been sent to your email.', 'success');
      setTimer(60);
      setOtp('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to resend code.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans p-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 relative">
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Theme Toggle */}
        <ThemeToggle className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20" />

        <div className="flex flex-col items-center gap-6 mt-6">
          <Logo className="h-10 w-auto" mode="light" />

          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Recruiter Email</h1>
            <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
              We sent a 6-digit verification code to your official company email.
            </p>
          </div>

          <form onSubmit={handleVerify} className="w-full flex flex-col gap-4">
            <Input
              label="Official Company Email"
              id="email"
              type="email"
              placeholder="recruiter@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={FiMail}
              required
              disabled={!!location.state?.email}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="otp" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Enter Verification OTP <span className="text-rose-500">*</span>
              </label>
              <input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center font-mono tracking-widest text-xl font-bold px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-sky-600 focus:outline-none bg-white text-slate-800"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full font-bold text-sm h-12 rounded-xl mt-2 cursor-pointer"
              disabled={loading || otp.length !== 6}
              loading={loading}
            >
              Verify & Log In
            </Button>
          </form>

          <div className="flex items-center justify-between w-full text-xs font-bold mt-2">
            {timer > 0 ? (
              <span className="text-slate-400 flex items-center gap-1.5">
                <FiClock className="w-4 h-4" /> Resend code in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sky-600 hover:text-sky-700 underline cursor-pointer"
              >
                {resending ? 'Sending...' : 'Resend Verification Code'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerVerifyEmail;
