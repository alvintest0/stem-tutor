import { motion } from 'framer-motion';
import { Box } from 'lucide-react';
import type { Concept } from '@/types';

interface ConceptCardProps {
  concept: Concept;
  onSelect: (concept: Concept) => void;
  index?: number;
}

function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(diffDays) >= 1) return formatter.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return formatter.format(diffHours, 'hour');
  if (Math.abs(diffMinutes) >= 1) return formatter.format(diffMinutes, 'minute');
  return 'just now';
}

export function ConceptCard({ concept, onSelect, index = 0 }: ConceptCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(concept)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.98 }}
      className="group w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
          <Box className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{concept.query}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{concept.explanation}</p>
          <p className="mt-2 text-xs text-slate-400">{formatRelativeTime(concept.createdAt)}</p>
        </div>
      </div>
    </motion.button>
  );
}
