import type { ReactNode } from 'react';
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
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-amber-700 text-white shadow-md">
            <Icon className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <h1 className="mt-4 font-display text-xl text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-white p-8 shadow-md shadow-slate-200/60">
          {children}
        </div>
      </div>
    </div>
  );
}
