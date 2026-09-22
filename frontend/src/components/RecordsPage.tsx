import { useMemo, useState, type ReactNode } from 'react';
import { Plus, Inbox } from 'lucide-react';
import { PageHeader } from './layout/PageHeader';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DataTable, type Column } from './ui/DataTable';
import { RowActions } from './ui/RowActions';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { EmptyState, ErrorState, Loading } from './ui/States';
import { RecordToolbar, emptyFilters, type Filters } from './RecordToolbar';
import { useAsync } from '../lib/useAsync';
import { useVehicles } from '../context/VehicleContext';
import { useRecordSheet } from '../context/RecordSheetContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import type { RecordKind } from '../lib/recordFields';

const clients = {
  fuel: api.fuel,
  maintenance: api.maintenance,
  repair: api.repairs,
  expense: api.expenses,
} as const;

interface Props<T> {
  kind: keyof typeof clients;
  title: string;
  subtitle: string;
  addLabel: string;
  columns: Column<T>[];
  categories?: string[];
  categoryLabel?: string;
  emptyMessage: string;
  /** Stats or charts drawn from the same rows the table shows. */
  renderAbove?: (rows: T[]) => ReactNode;
}

export function RecordsPage<T extends { id: string }>({
  kind, title, subtitle, addLabel, columns, categories, categoryLabel, emptyMessage, renderAbove,
}: Props<T>) {
  const { activeId } = useVehicles();
  const { openRecord, version, bump } = useRecordSheet();
  const { notify } = useToast();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  const query = useMemo(
    () => ({
      vehicleId: activeId === 'all' ? undefined : activeId,
      q: filters.q || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      category: filters.category || undefined,
      minCost: filters.minCost || undefined,
      maxCost: filters.maxCost || undefined,
    }),
    [activeId, filters],
  );

  const { data, loading, error, reload } = useAsync<T[]>(
    () => clients[kind].list(query),
    [JSON.stringify(query), version],
  );

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await clients[kind].remove(deleting.id);
      notify('Record deleted');
      setDeleting(null);
      bump();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete this record', 'error');
    } finally {
      setBusy(false);
    }
  };

  const rows = data ?? [];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button onClick={() => openRecord(kind as RecordKind)}>
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        }
      />

      {renderAbove?.(rows)}

      <RecordToolbar filters={filters} onChange={setFilters} categories={categories} categoryLabel={categoryLabel} />

      <Card padded={false}>
        {loading && !data ? (
          <Loading />
        ) : error ? (
          <div className="p-5"><ErrorState message={error} onRetry={reload} /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-6 w-6" />}
            title="Nothing here yet"
            message={Object.values(filters).some(Boolean) ? 'No records match these filters. Clear them to see everything.' : emptyMessage}
            action={<Button onClick={() => openRecord(kind as RecordKind)}>{addLabel}</Button>}
          />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            actions={(row) => (
              <RowActions onEdit={() => openRecord(kind as RecordKind, row as any)} onDelete={() => setDeleting(row)} />
            )}
          />
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this record"
        message="The record is removed from your history and from every total and chart. This cannot be undone."
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
