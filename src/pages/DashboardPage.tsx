import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backpack, CalendarDays, Gem, Pickaxe, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { explainConcept } from '@/services/claude';
import { getConcepts, saveConcept } from '@/services/concepts';
import { ConceptCard } from '@/components/ConceptCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useCountUp } from '@/hooks/useCountUp';
import type { Concept } from '@/types';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function DashboardPage() {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Concept[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getConcepts(currentUser.uid)
      .then(setHistory)
      .catch(() => setError('Could not load your history.'))
      .finally(() => setHistoryLoading(false));
  }, [currentUser]);

  const stats = useMemo(() => {
    const thisWeek = history.filter((c) => Date.now() - c.createdAt < ONE_WEEK_MS).length;
    return {
      total: history.length,
      thisWeek,
      latest: history[0]?.query ?? null,
    };
  }, [history]);

  const firstName = currentUser?.email?.split('@')[0] ?? 'there';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || !currentUser) return;

    setLoading(true);
    setError('');

    try {
      const result = await explainConcept(trimmed);
      setExplanation(result);
      setActiveQuery(trimmed);
      setQuery('');
      await saveConcept(currentUser.uid, trimmed, result);
      setHistory(await getConcepts(currentUser.uid));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectConcept(concept: Concept) {
    setActiveQuery(concept.query);
    setExplanation(concept.explanation);
    setError('');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="font-display text-2xl font-bold text-slate-900 sm:text-3xl"
      >
        Hey {firstName} 👋
      </motion.h1>
      <p className="mt-1 text-slate-500">
        Type any STEM concept and get a beginner-friendly explanation.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          index={0}
          icon={Pickaxe}
          iconColor="text-amber-700"
          label="Explored"
          value={stats.total}
        />
        <StatCard
          index={1}
          icon={CalendarDays}
          iconColor="text-emerald-600"
          label="This week"
          value={stats.thisWeek}
        />
        <StatCard
          index={2}
          icon={Gem}
          iconColor="text-sky-600"
          label="Latest topic"
          value={stats.latest ?? '—'}
          isText
        />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="relative mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 shadow-md sm:p-6"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          initial={{ x: '-200%' }}
          animate={{ x: '600%' }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut' }}
        />

        <div className="relative z-10">
          <label className="flex items-center gap-2 text-sm font-medium text-emerald-50">
            <motion.span
              animate={{ scale: [1, 1.25, 1], rotate: [0, 12, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
            >
              <Gem className="h-4 w-4" />
            </motion.span>
            What do you want to understand today?
          </label>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Newton's second law"
                className="w-full rounded-lg border-0 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading || !query.trim()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pickaxe className="h-4 w-4" />
              {loading ? 'Thinking…' : 'Explain'}
            </motion.button>
          </div>
        </div>
      </motion.form>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-8 grid gap-8 md:grid-cols-[2fr_1fr]">
        <section>
          {loading && <LoadingSpinner label="Thinking of the best way to explain this…" />}
          <AnimatePresence mode="wait">
            {!loading && explanation && (
              <motion.div
                key={activeQuery}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 text-emerald-700">
                  <Gem className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Explanation
                  </span>
                </div>
                <h2 className="mt-2 font-display text-lg font-semibold text-slate-900">
                  {activeQuery}
                </h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">
                  {explanation}
                </p>
              </motion.div>
            )}
            {!loading && !explanation && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-10 text-center"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Pickaxe className="h-8 w-8 text-slate-300" />
                </motion.div>
                <p className="mt-3 text-sm text-slate-400">Your explanation will show up here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <aside>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Backpack className="h-4 w-4" />
            Your history ({history.length})
          </h3>
          <div className="mt-3 space-y-3">
            {historyLoading && <LoadingSpinner />}
            {!historyLoading && history.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                No concepts explored yet — search for one above!
              </p>
            )}
            {history.map((concept, i) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onSelect={handleSelectConcept}
                index={i}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: typeof Pickaxe;
  iconColor: string;
  label: string;
  value: string | number;
  isText?: boolean;
  index: number;
}

function StatCard({ icon: Icon, iconColor, label, value, isText, index }: StatCardProps) {
  const countedValue = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
    >
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <p
        className={
          isText
            ? 'mt-2 truncate text-sm font-semibold text-slate-900'
            : 'mt-2 text-xl font-bold text-slate-900'
        }
      >
        {isText ? value : countedValue}
      </p>
      <p className="text-xs text-slate-500">{label}</p>
    </motion.div>
  );
}
