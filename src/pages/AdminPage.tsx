import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart2, Flame, Pickaxe, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/services/firebase';

const ADMIN_EMAIL = 'lucky.alvinwijaya@gmail.com';

interface AdminStats {
  totalUsers: number;
  totalExplanations: number;
  todayCount: number;
  topConcepts: Array<{ concept: string; count: number }>;
}

export function AdminPage() {
  const { currentUser, emailVerified } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin || !emailVerified) return;

    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/admin-stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load stats.');
        setStats(await res.json());
      } catch {
        setError('Could not load admin stats. Try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, emailVerified]);

  if (!currentUser || !emailVerified || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const maxCount = stats?.topConcepts[0]?.count ?? 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <BarChart2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">StemCraft site-wide analytics</p>
        </div>
      </motion.div>

      {loading && (
        <p className="mt-12 text-center text-sm text-slate-400">Loading stats…</p>
      )}

      {error && (
        <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {stats && (
        <>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Users, color: 'text-sky-600', label: 'Total users', value: stats.totalUsers },
              {
                icon: Pickaxe,
                color: 'text-amber-700',
                label: 'Explanations',
                value: stats.totalExplanations,
              },
              {
                icon: Flame,
                color: 'text-rose-500',
                label: 'Today',
                value: stats.todayCount,
              },
            ].map(({ icon: Icon, color, label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <Icon className={`h-4 w-4 ${color}`} />
                <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-base font-semibold text-slate-900">
              Top concepts explored
            </h2>
            {stats.topConcepts.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No data yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {stats.topConcepts.map(({ concept, count }, i) => (
                  <li key={concept} className="flex items-center gap-3">
                    <span className="w-5 text-right text-xs font-medium text-slate-400">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-slate-700">{concept}</span>
                        <span className="text-xs text-slate-400">
                          {count}×
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / maxCount) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
