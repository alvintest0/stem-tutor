import { motion } from 'framer-motion';
import { Box, Trash2 } from 'lucide-react';
import type { Concept } from '@/types';

interface ConceptCardProps {
  concept: Concept;
  onSelect: (concept: Concept) => void;
  onDelete: (concept: Concept) => void;
  index?: number;
}

function shortRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.round(diff / 60000);
  const hrs = Math.round(diff / 3600000);
  const days = Math.round(diff / 86400000);
  if (diff < 60000) return 'now';
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  return `${days}d`;
}

export function ConceptCard({ concept, onSelect, onDelete, index = 0 }: ConceptCardProps) {
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(concept)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(concept);
      }}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ x: 2, transition: { duration: 0.1 } }}
      whileTap={{ scale: 0.99 }}
      className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
    >
      <Box className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
        {concept.query}
      </span>
      <span className="flex-shrink-0 text-xs text-slate-400">
        {shortRelativeTime(concept.createdAt)}
      </span>
      <button
        type="button"
        aria-label={`Delete ${concept.query}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(concept);
        }}
        className="flex-shrink-0 rounded p-0.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </motion.div>
  );
}
