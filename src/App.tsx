import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { DashboardPage } from '@/pages/DashboardPage';

function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <motion.div
        className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-200/30 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-sky-200/30 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-amber-200/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  );
}

function App() {
  return (
    <div className="relative isolate min-h-screen bg-slate-50">
      <AnimatedBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
