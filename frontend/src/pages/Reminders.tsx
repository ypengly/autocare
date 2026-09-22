import { useState } from 'react';
import { Bell, Check, Plus } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusPill } from '../components/ui/StatusPill';
import { RowActions } from '../components/ui/RowActions';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { useAsync } from '../lib/useAsync';
import { api } from '../lib/api';
import { useVehicles } from '../context/VehicleContext';
import { useRecordSheet } from '../context/RecordSheetContext';
import { useToast } from '../context/ToastContext';
import { km, shortDate } from '../lib/format';
import type { Reminder } from '../lib/types';

const groups = [
  { status: 'overdue', title: 'Overdue' },
  { status: 'due-soon', title: 'Due soon' },
  { status: 'ok', title: 'Up to date' },
] as const;

export function RemindersPage() {
  const { activeId } = useVehicles();
  const { openRecord, version, bump } = useRecordSheet();
  const { notify } = useToast();
  const [deleting, setDeleting] = useState<Reminder | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, reload } = useAsync<Reminder[]>(
    () => api.reminders.list({ vehicleId: activeId === 'all' ? undefined : activeId }),
    [activeId, version],
  );

  const complete = async (reminder: Reminder) => {
    await api.reminders.complete(reminder.id);
    notify(reminder.repeatInterval ? `${reminder.title} rolled forward to the next interval` : `${reminder.title} marked done`);
    bump();
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.reminders.remove(deleting.id);
      notify('Reminder deleted');
      setDeleting(null);
      bump();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete this reminder', 'error');
    } finally {
      setBusy(false);
    }
  };

  const reminders = data ?? [];

  return (
    <>
      <PageHeader
        title="Reminders"
        subtitle="By distance, by interval, or on a fixed date."
        action={<Button onClick={() => openRecord('reminder')}><Plus className="h-4 w-4" />Add reminder</Button>}
      />

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : reminders.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            title="No reminders set"
            message="Set one for your next oil change or registration renewal, and the dashboard will warn you before it is due."
            action={<Button onClick={() => openRecord('reminder')}>Add a reminder</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {groups.map(({ status, title }) => {
            const list = reminders.filter((r) => r.status === status);
            if (list.length === 0) return null;
            return (
              <Card key={status} title={`${title} (${list.length})`} padded={false}>
                <ul className="divide-y divide-line">
                  {list.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{r.title}</p>
                          <StatusPill status={r.status} />
                        </div>
                        <p className="mt-0.5 text-sm text-steel">
                          {r.summary}
                          {r.vehicle ? ` · ${r.vehicle.name}` : ''}
                          {r.dueMileage != null ? ` · at ${km(r.dueMileage)}` : ''}
                          {r.dueDate ? ` · ${shortDate(r.dueDate)}` : ''}
                          {r.repeatInterval ? ` · repeats every ${r.repeatInterval} ${r.type === 'MILEAGE' ? 'km' : r.repeatUnit ?? 'months'}` : ''}
                        </p>
                        {r.description && <p className="mt-1 text-sm text-steel">{r.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => complete(r)}
                          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:border-go hover:text-go"
                        >
                          <Check className="h-4 w-4" />
                          Done
                        </button>
                        <RowActions onEdit={() => openRecord('reminder', r as any)} onDelete={() => setDeleting(r)} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this reminder"
        message="You will stop getting notifications for it. Your service records stay untouched."
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
