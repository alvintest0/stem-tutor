import type { ChangeEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

interface TextFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  required?: boolean;
}

export function TextField({ label, type, value, onChange, icon: Icon, required }: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative mt-1.5">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>
    </div>
  );
}
