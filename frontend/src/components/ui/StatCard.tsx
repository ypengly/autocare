import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'go' | 'signal' | 'alert';
}) {
  const tones = {
    default: 'bg-petrol-light text-petrol',
    go: 'bg-go-light text-go',
    signal: 'bg-signal-light text-signal',
    alert: 'bg-alert-light text-alert',
  } as const;

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-steel">{label}</p>
        {Icon && (
          <span className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="readout mt-2 text-3xl font-600 leading-none">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-steel">{hint}</p>}
    </div>
  );
}
