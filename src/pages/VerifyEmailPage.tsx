import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthCard } from '@/components/AuthCard';
import { playClick } from '@/lib/sound';

export function VerifyEmailPage() {
  const { currentUser, emailVerified, resendVerificationEmail, refreshEmailVerified, logout } =
    useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'checking'>('idle');
  const [error, setError] = useState('');

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleResend() {
    playClick();
    setStatus('sending');
    setError('');
    try {
      await resendVerificationEmail();
      setStatus('sent');
    } catch {
      setError('Could not resend the email. Please try again in a moment.');
      setStatus('idle');
    }
  }

  async function handleCheck() {
    playClick();
    setStatus('checking');
    setError('');
    const verified = await refreshEmailVerified();
    if (verified) {
      navigate('/dashboard');
    } else {
      setError("Still not verified. Click the link in your email, then try again.");
      setStatus('idle');
    }
  }

  async function handleLogout() {
    playClick();
    await logout();
    navigate('/login');
  }

  return (
    <AuthCard icon={Mail} title="Verify your email" subtitle="One more step before you start.">
      <div className="text-center">
        <p className="text-sm text-slate-500">
          We sent a verification link to{' '}
          <span className="font-medium text-slate-700">{currentUser.email}</span>. Click it, then
          come back here.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Don&apos;t see it? Check your spam or junk folder.
        </p>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
        {status === 'sent' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-emerald-600"
          >
            Verification email sent.
          </motion.p>
        )}

        <motion.button
          onClick={handleCheck}
          disabled={status === 'checking'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'checking' ? 'Checking…' : "I've verified — refresh"}
        </motion.button>

        <motion.button
          onClick={handleResend}
          disabled={status === 'sending'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Resend email'}
        </motion.button>

        <button
          onClick={handleLogout}
          className="mt-3 text-sm text-slate-400 hover:underline"
        >
          Log out
        </button>
      </div>
    </AuthCard>
  );
}
