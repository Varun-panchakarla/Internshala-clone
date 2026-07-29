import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEmployerAuth } from '../../context/EmployerAuthContext';
import { useToast } from '../../components/common/Toast';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Logo from '../../components/common/Logo';

const EmployerForgotPassword = () => {
  const { forgotPassword } = useEmployerAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleBackClick = () => {
    navigate('/employer/login');
  };

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Official company email is required.';
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
    setErrors({});
    try {
      await forgotPassword(email);
      setSubmitted(true);
      addToast('Password reset instructions sent successfully.', 'success');
    } catch (err) {
      setErrors({ email: err.response?.data?.error || 'Failed to request password reset.' });
      addToast(err.response?.data?.error || 'Request failed.', 'error');
    } finally {
      setLoading(false);
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
          <FiArrowLeft /> Back to Login
        </button>

        <div className="flex flex-col items-center gap-6 mt-6">
          <Logo className="h-10 w-auto" mode="light" />

          {submitted ? (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Check Your Inbox</h1>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                If the email <strong>{email}</strong> is registered as an employer, we have sent a password reset link to it. Please check your inbox and spam folder.
              </p>
              <Button
                onClick={() => navigate('/employer/login')}
                variant="secondary"
                className="w-full font-bold text-sm h-11 rounded-xl cursor-pointer"
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Recruiter Password</h1>
                <p className="text-sm text-slate-500 font-medium mt-1.5 leading-relaxed">
                  Enter your official company email, and we will send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
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

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full font-bold text-sm h-12 rounded-xl mt-2 cursor-pointer"
                  disabled={loading}
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerForgotPassword;
