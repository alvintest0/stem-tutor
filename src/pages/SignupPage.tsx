import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthCard } from '@/components/AuthCard';
import { TextField } from '@/components/TextField';
import { GoogleIcon } from '@/components/GoogleIcon';
import { playClick, playHover } from '@/lib/sound';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    playClick();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(email, password);
      navigate('/verify-email');
    } catch {
      setError('Could not create your account. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    playClick();
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch {
      setError('Could not sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Start exploring STEM concepts in minutes.">
      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        onMouseEnter={playHover}
        disabled={googleLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon className="h-4 w-4" />
        {googleLoading ? 'Connecting…' : 'Continue with Google'}
      </motion.button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-slate-400">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={submitting}
          onMouseEnter={playHover}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          to="/login"
          onMouseEnter={playHover}
          onClick={playClick}
          className="font-medium text-emerald-600 hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
