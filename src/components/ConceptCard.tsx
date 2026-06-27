import { Box } from 'lucide-react';
import type { Concept } from '@/types';

interface ConceptCardProps {
  concept: Concept;
  onSelect: (concept: Concept) => void;
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

export function ConceptCard({ concept, onSelect }: ConceptCardProps) {
  return (
    <button
      onClick={() => onSelect(concept)}
      className="group w-full rounded-lg border-2 border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
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
    </button>
  );
}
