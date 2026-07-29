import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';

const EmployerResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { resetPassword } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      addToast('No verification token found. Please request a new link.', 'error');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      addToast('Password reset successful! Please log in.', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Password reset failed. Link may be invalid or expired.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 font-sans p-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 relative">
        <div className="flex flex-col items-center gap-6">
          <Logo className="h-10 w-auto" mode="light" />

          {success ? (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Password Reset Complete</h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Your new password has been successfully configured. You can now use it to access the Recruiter portal.
              </p>
              <Button
                onClick={() => navigate('/employer/login')}
                variant="primary"
                className="w-full font-bold text-sm h-11 rounded-xl cursor-pointer"
              >
                Log In
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Set New Password</h1>
                <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                  Enter your new password below to update your recruiter account security.
                </p>
              </div>

              {!token ? (
                <div className="text-center text-xs font-bold text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-150 w-full">
                  No password reset token was provided. Please request a new link from the login page.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                  <Input
                    label="New Password"
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
                    label="Confirm New Password"
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    icon={FiLock}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full font-bold text-sm h-12 rounded-xl mt-2 cursor-pointer"
                    disabled={loading}
                    loading={loading}
                  >
                    Reset Password
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerResetPassword;
