import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { FiLock, FiMail, FiTrash2, FiSettings, FiX, FiCheckCircle } from 'react-icons/fi';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

const ManageAccount = () => {
  const { logout, currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Modals Open State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form states
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [emailData, setEmailData] = useState({ newEmail: '', currentPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [emailErrors, setEmailErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Password submission simulation
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.current) errors.current = 'Current password is required.';
    if (!passwordData.new) errors.new = 'New password is required.';
    else if (passwordData.new.length < 6) errors.new = 'Password must be at least 6 characters.';
    if (passwordData.new !== passwordData.confirm) errors.confirm = 'Passwords do not match.';

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setPasswordModalOpen(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      addToast('Password updated successfully!', 'success');
    }, 800);
  };

  // Email submission simulation
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!emailData.newEmail) errors.newEmail = 'New email address is required.';
    else if (!/\S+@\S+\.\S+/.test(emailData.newEmail)) errors.newEmail = 'Invalid email address format.';
    if (!emailData.currentPassword) errors.currentPassword = 'Password is required to confirm.';

    setEmailErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmailModalOpen(false);
      setEmailData({ newEmail: '', currentPassword: '' });
      addToast('Email address updated successfully!', 'success');
    }, 800);
  };

  // Account deletion simulation
  const handleDeleteAccount = () => {
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      setDeleteModalOpen(false);
      
      // Wipe session and log out
      await logout();
      addToast('Your account and all associated data have been permanently deleted.', 'success');
      navigate('/');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto w-full animate-slide-up pb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
          <FiSettings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manage Account</h1>
          <p className="text-xs text-slate-400 font-semibold">Configure security parameters, login credentials, and account statuses.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* 1. Change Password Section */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
              <FiLock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">🔒 Change Password</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                Update your account password to ensure security.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="px-6 shrink-0 bg-white" onClick={() => setPasswordModalOpen(true)}>
            Change Password
          </Button>
        </div>

        {/* 2. Change Email Address Section */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0 mt-1">
              <FiMail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">📧 Change Email Address</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                Update your registered email address. Currently: <b>{currentUser?.email}</b>
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="px-6 shrink-0 bg-white" onClick={() => setEmailModalOpen(true)}>
            Change Email Address
          </Button>
        </div>

        {/* 3. Delete Account Section */}
        <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 mt-1">
              <FiTrash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-800">🗑 Delete My Account</h3>
              <p className="text-xs text-rose-600 font-medium leading-relaxed mt-1">
                Permanently delete your account and all associated profile information.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" className="px-6 shrink-0" onClick={() => setDeleteModalOpen(true)}>
            Delete My Account
          </Button>
        </div>
      </div>

      {/* Modal: Change Password */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => { setPasswordModalOpen(false); setPasswordErrors({}); }}
        title="Change Password"
        footer={
          <>
            <Button variant="outline" onClick={() => { setPasswordModalOpen(false); setPasswordErrors({}); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePasswordSubmit} loading={loading}>
              Save Password
            </Button>
          </>
        }
      >
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <Input
            label="Current Password"
            id="currPass"
            type="password"
            placeholder="••••••••"
            value={passwordData.current}
            onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
            error={passwordErrors.current}
            required
          />
          <Input
            label="New Password"
            id="newPass"
            type="password"
            placeholder="Min. 6 characters"
            value={passwordData.new}
            onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
            error={passwordErrors.new}
            required
          />
          <Input
            label="Confirm New Password"
            id="confirmPass"
            type="password"
            placeholder="••••••••"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
            error={passwordErrors.confirm}
            required
          />
        </form>
      </Modal>

      {/* Modal: Change Email Address */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => { setEmailModalOpen(false); setEmailErrors({}); }}
        title="Change Email Address"
        footer={
          <>
            <Button variant="outline" onClick={() => { setEmailModalOpen(false); setEmailErrors({}); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEmailSubmit} loading={loading}>
              Save Email Address
            </Button>
          </>
        }
      >
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
          <Input
            label="New Email Address"
            id="newEmail"
            type="email"
            placeholder="newemail@example.com"
            value={emailData.newEmail}
            onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
            error={emailErrors.newEmail}
            required
          />
          <Input
            label="Confirm Password"
            id="confirmEmailPass"
            type="password"
            placeholder="••••••••"
            value={emailData.currentPassword}
            onChange={(e) => setEmailData(prev => ({ ...prev, currentPassword: e.target.value }))}
            error={emailErrors.currentPassword}
            required
          />
        </form>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete My Account?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount} loading={loading}>
              Delete My Account
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 text-slate-600">
          <p className="text-xs leading-relaxed font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
            ⚠️ This action is permanent and cannot be undone.
          </p>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">Deleting your account will remove:</p>
            <ul className="space-y-1.5 text-xs text-slate-600 font-light list-disc pl-5">
              <li>Profile information</li>
              <li>Resume</li>
              <li>Saved jobs</li>
              <li>Job preferences</li>
              <li>Application history</li>
            </ul>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default ManageAccount;
