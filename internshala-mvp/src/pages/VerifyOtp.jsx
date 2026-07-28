import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import Logo from '../components/common/Logo';
import Button from '../components/common/Button';
import { authService } from '../services/mockApi';
import { FiArrowLeft, FiCheckCircle, FiClock } from 'react-icons/fi';

const VerifyOtp = () => {
  const { verifyOtp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from registration/login navigation state, fallback to query param or local storage
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    // Attempt to extract email
    const stateEmail = location.state?.email;
    const queryEmail = new URLSearchParams(location.search).get('email');
    const storedEmail = localStorage.getItem('pending_verification_email');
    const resolvedEmail = stateEmail || queryEmail || storedEmail;

    if (resolvedEmail) {
      setEmail(resolvedEmail);
      localStorage.setItem('pending_verification_email', resolvedEmail);
    } else {
      addToast('No email found for verification. Please register or log in.', 'error');
      navigate('/login');
    }
  }, [location, navigate, addToast]);

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      addToast('Please enter a valid 6-digit OTP code.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const user = await verifyOtp(email, otp);
      addToast('Email verified successfully! Welcome to IncuXAI Careers.', 'success');
      localStorage.removeItem('pending_verification_email');
      
      // Determine redirection path based on onboarding state
      const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user?.id}`) === 'true';
      navigate(onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Verification failed. Please check the code.';
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      const res = await authService.resendOtp(email);
      addToast(res.data?.message || 'A new OTP has been sent to your email.', 'success');
      setTimer(60);
      setOtp('');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to resend OTP. Please try again.';
      addToast(errMsg, 'error');
    } finally {
      setResending(false);
    }
  };

  const handleBackClick = () => {
    navigate('/login');
  };

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
            Verify Your Email Address.
          </h2>
          <p className="mt-4 text-base text-slate-100 font-light leading-relaxed">
            We prioritize your account's security. Please confirm your email address by typing the verification code we just sent.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <FiCheckCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-base font-bold">Secure Account Activation</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Verification protects your credentials and ensures secure application states.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <FiClock className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-base font-bold">10-Minute Token Lifespan</h4>
                <p className="text-sm text-slate-300 font-light mt-1">Verification OTPs expire after 10 minutes to prevent credential hijacking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Verify OTP Card */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 bg-white shadow-xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-650 transition-colors focus:outline-none cursor-pointer z-20"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="max-w-md w-full flex flex-col gap-6 pt-10 sm:pt-14 my-auto">
          
          {/* Logo Title */}
          <div className="flex items-center">
            <Logo className="h-12 w-auto" mode="light" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Verify Email</h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              We have sent a 6-digit verification code to <span className="text-slate-900 font-semibold">{email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="otp-input" className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Verification Code
              </label>
              
              {/* Monospaced aligned OTP input */}
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                pattern="\d*"
                inputMode="numeric"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                }}
                placeholder="000000"
                className="w-full text-center font-mono tracking-[0.8em] text-3xl font-black py-4 border-2 border-slate-200 rounded-xl focus:border-brand-600 focus:outline-none bg-slate-50 text-slate-800 placeholder:text-slate-200 transition-all pl-[0.4em]"
                disabled={loading}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3.5 font-bold"
              isLoading={loading}
            >
              Verify Code
            </Button>
          </form>

          <div className="flex flex-col items-center gap-3 pt-2">
            {timer > 0 ? (
              <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 bg-slate-50 px-3.5 py-2 rounded-full border border-slate-100">
                <FiClock className="w-3.5 h-3.5" />
                Resend code in {timer}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors focus:outline-none cursor-pointer underline hover:no-underline"
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

export default VerifyOtp;
