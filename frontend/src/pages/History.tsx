import { Wrench, ScrollText } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { useAsync } from '../lib/useAsync';
import { api } from '../lib/api';
import { useVehicles } from '../context/VehicleContext';
import { useRecordSheet } from '../context/RecordSheetContext';
import { km, money, shortDate } from '../lib/format';
import type { TimelineEntry } from '../lib/types';

export function HistoryPage() {
  const { activeId } = useVehicles();
  const { version } = useRecordSheet();
  const { data, loading, error, reload } = useAsync<TimelineEntry[]>(
    () => api.history({ vehicleId: activeId === 'all' ? undefined : activeId }),
    [activeId, version],
  );

  const entries = data ?? [];
  const total = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <PageHeader
        title="Service history"
        subtitle={entries.length ? `${entries.length} entries · ${money(total)} spent on service and repairs` : 'Everything that has been done to the vehicle.'}
      />

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : entries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Wrench className="h-6 w-6" />}
            title="The history is empty"
            message="Maintenance records and repairs appear here as a timeline, newest first."
          />
        </Card>
      ) : (
        <Card>
          <ol className="relative space-y-6 border-l-2 border-line pl-6">
            {entries.map((e) => (
              <li key={`${e.kind}-${e.id}`} className="relative">
                <span
                  className={`absolute -left-[2.1rem] grid h-7 w-7 place-items-center rounded-full ring-4 ring-white ${
                    e.kind === 'repair' ? 'bg-alert-light text-alert' : 'bg-petrol-light text-petrol'
                  }`}
                >
                  {e.kind === 'repair' ? <ScrollText className="h-3.5 w-3.5" /> : <Wrench className="h-3.5 w-3.5" />}
                </span>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="readout text-sm text-steel">{shortDate(e.date)}</p>
                  <p className="readout text-lg font-600">{money(e.amount)}</p>
                </div>
                <h3 className="font-display text-xl font-600">{e.title}</h3>
                <p className="text-sm text-steel">
                  {km(e.mileage)} · {e.vehicle}
                  {e.detail ? ` · ${e.detail}` : ''}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </>
  );
}
