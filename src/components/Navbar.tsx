import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Box, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <motion.span
            whileHover={{ scale: 1.08, rotate: -6 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm"
          >
            <Box className="h-4 w-4" strokeWidth={2.25} />
          </motion.span>
          StemCraft
        </Link>
        {currentUser && (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">{currentUser.email}</span>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
}
