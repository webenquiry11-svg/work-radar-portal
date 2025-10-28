import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '../app/authSlice';
import { LockClosedIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      toast.success('Password has been reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Reset Your Password</h1>
          <p className="text-slate-500 mt-2">Enter and confirm your new password below.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">New Password</label>
            <div className="relative mt-1">
              <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm New Password</label>
            <div className="relative mt-1">
              <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full group inline-flex items-center justify-center py-3 px-4 rounded-xl shadow-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
            {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />}
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;