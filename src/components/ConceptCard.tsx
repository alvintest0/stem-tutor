import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Concept } from '@/types';

interface ConceptCardProps {
  concept: Concept;
  onSelect: (concept: Concept) => void;
  onDelete: (concept: Concept) => void;
  index?: number;
}

export function ConceptCard({ concept, onSelect, onDelete, index = 0 }: ConceptCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(concept)}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, delay: Math.min(index, 12) * 0.03 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
    >
      <span className="max-w-[130px] truncate">{concept.query}</span>
      <span
        role="button"
        aria-label={`Delete ${concept.query}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(concept);
        }}
        className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-100 hover:text-red-500"
      >
        <X className="h-2.5 w-2.5" />
      </span>
    </motion.button>
  );
}
