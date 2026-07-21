import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/common/Toast';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiChevronRight, FiBriefcase } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { addToast } = useToast();
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No password reset token provided. Please request a new link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        setVerifying(false);
        if (res.ok && data.valid) {
          setTokenValid(true);
          setUserEmail(data.email || '');
        } else {
          setTokenValid(false);
          setTokenError(data.error || 'This password reset link is invalid or has expired.');
        }
      } catch (err) {
        setVerifying(false);
        setTokenValid(false);
        setTokenError('Failed to verify reset link. Please check your network connection.');
      }
    };

    verifyToken();
  }, [token]);

  const validate = () => {
    const tempErrors = {};

    if (!newPassword) {
      tempErrors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      tempErrors.newPassword = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrors({ general: data.error || 'Failed to update password.' });
        addToast(data.error || 'Failed to update password.', 'error');
        return;
      }

      setIsSuccess(true);
      addToast('Password updated successfully!', 'success');
    } catch (err) {
      setLoading(false);
      setErrors({ general: 'Network error. Please try again.' });
      addToast('Network error. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 font-sans animate-fade-in">
      {/* Left Column: Form / Card */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 bg-white shadow-xl relative z-10">
        
        {/* Back to Login Link */}
        <Link
          to="/login"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer z-20"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        <div className="max-w-md w-full flex flex-col gap-8 pt-10 sm:pt-14 my-auto">
          
          {/* Logo Heading */}
          <div className="flex items-center">
            <Logo className="h-12 w-auto" mode="light" />
          </div>

          {verifying ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <LoadingSpinner text="Verifying reset token..." />
            </div>
          ) : !tokenValid ? (
            /* Invalid / Expired Token State */
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex gap-3 text-rose-800">
                <FiAlertCircle className="w-6 h-6 shrink-0 text-rose-500 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-rose-900">Invalid or Expired Link</h3>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    {tokenError}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Password reset links expire after 30 minutes and can only be used once for security purposes.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => navigate('/forgot-password')}
                  variant="primary"
                  className="w-full py-3.5 font-bold"
                >
                  Request New Reset Link <FiChevronRight className="ml-1.5 w-4 h-4" />
                </Button>

                <Link
                  to="/login"
                  className="w-full py-3 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* Success State */
            <div className="flex flex-col gap-6 animate-slide-up">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FiCheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-emerald-950 mb-1">Password updated successfully!</h2>
                  <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                    Your password has been changed successfully. Please sign in using your new password.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                className="w-full py-3.5 font-bold text-sm"
              >
                Go to Login <FiChevronRight className="ml-1.5 w-4 h-4" />
              </Button>
            </div>
          ) : (
            /* Reset Password Form */
            <>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Create New Password</h1>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Enter a new secure password for <strong className="text-slate-700">{userEmail}</strong>.
                </p>
              </div>

              {errors.general && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-bold text-rose-600 flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* New Password */}
                <div className="relative">
                  <Input
                    label="New Password"
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={errors.newPassword}
                    icon={FiLock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Input
                    label="Confirm New Password"
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    icon={FiLock}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 mt-2 font-bold"
                  loading={loading}
                >
                  Update Password <FiChevronRight className="ml-1.5 w-4 h-4" />
                </Button>
              </form>
            </>
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
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>

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

export default ResetPassword;
