import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Box, type LucideIcon } from 'lucide-react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  icon?: LucideIcon;
}

export function AuthCard({ title, subtitle, children, icon: Icon = Box }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md"
          >
            <Icon className="h-6 w-6" strokeWidth={2.25} />
          </motion.span>
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-md shadow-slate-200/60">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
