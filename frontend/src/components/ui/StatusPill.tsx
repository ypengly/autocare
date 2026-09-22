import type { ReminderStatus } from '../../lib/types';

const map: Record<ReminderStatus, { label: string; className: string; dot: string }> = {
  ok: { label: 'Up to date', className: 'bg-go-light text-go', dot: 'bg-go' },
  'due-soon': { label: 'Due soon', className: 'bg-signal-light text-signal', dot: 'bg-signal' },
  overdue: { label: 'Overdue', className: 'bg-alert-light text-alert', dot: 'bg-alert' },
};

export function StatusPill({ status }: { status: ReminderStatus }) {
  const style = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
