import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { RecordForm } from '../components/forms/RecordForm';
import { blankRecord, cleanPayload, fieldsFor, RECORD_LABELS, type RecordKind } from '../lib/recordFields';
import { api } from '../lib/api';
import { useVehicles } from './VehicleContext';
import { money } from '../lib/format';

interface SheetState {
  kind: RecordKind;
  id?: string;
  values: Record<string, any>;
}

interface Value {
  /** Opens the add/edit sheet for any record type from anywhere in the app. */
  openRecord: (kind: RecordKind, record?: Record<string, any> & { id?: string }) => void;
  /** Increments whenever a record is saved, so pages can refetch. */
  version: number;
  bump: () => void;
}

const RecordSheetContext = createContext<Value | null>(null);

const clients = {
  fuel: api.fuel,
  maintenance: api.maintenance,
  repair: api.repairs,
  expense: api.expenses,
  reminder: api.reminders,
} as const;

export function RecordSheetProvider({ children }: { children: ReactNode }) {
  const { vehicles, activeVehicle, refresh } = useVehicles();
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const openRecord = useCallback(
    (kind: RecordKind, record?: Record<string, any> & { id?: string }) => {
      const base = blankRecord(kind, activeVehicle ?? vehicles[0] ?? null);
      if (!record) return setSheet({ kind, values: base });

      const values: Record<string, any> = { ...base };
      for (const key of Object.keys(base)) {
        const value = (record as any)[key];
        if (value === null || value === undefined) continue;
        values[key] = key === 'date' || key === 'dueDate' ? String(value).slice(0, 10) : value;
      }
      setSheet({ kind, id: record.id, values });
    },
    [activeVehicle, vehicles],
  );

  const value = useMemo(() => ({ openRecord, version, bump }), [openRecord, version, bump]);

  return (
    <RecordSheetContext.Provider value={value}>
      {children}
      {sheet && (
        <RecordForm
          open
          title={`${sheet.id ? 'Edit' : 'Add'} ${RECORD_LABELS[sheet.kind]}`}
          fields={fieldsFor(sheet.kind, vehicles)}
          initial={sheet.values}
          submitLabel={sheet.id ? 'Save changes' : 'Add record'}
          successMessage={sheet.id ? 'Changes saved' : `Added ${RECORD_LABELS[sheet.kind]}`}
          preview={sheet.kind === 'fuel' ? fuelPreview : sheet.kind === 'repair' ? repairPreview : undefined}
          onSubmit={async (values) => {
            const payload = cleanPayload(values);
            const client = clients[sheet.kind];
            return sheet.id ? client.update(sheet.id, payload) : client.create(payload);
          }}
          onDone={() => {
            bump();
            refresh();
          }}
          onClose={() => setSheet(null)}
        />
      )}
    </RecordSheetContext.Provider>
  );
}

function fuelPreview(values: Record<string, any>) {
  const liters = Number(values.liters) || 0;
  const price = Number(values.pricePerLiter) || 0;
  return (
    <div className="flex items-baseline justify-between text-sm text-petrol">
      <span>Total cost, calculated for you</span>
      <span className="readout text-2xl font-600">{money(liters * price)}</span>
    </div>
  );
}

function repairPreview(values: Record<string, any>) {
  const total = (Number(values.partsCost) || 0) + (Number(values.laborCost) || 0);
  return (
    <div className="flex items-baseline justify-between text-sm text-petrol">
      <span>Parts plus labour</span>
      <span className="readout text-2xl font-600">{money(total)}</span>
    </div>
  );
}

export function useRecordSheet() {
  const ctx = useContext(RecordSheetContext);
  if (!ctx) throw new Error('useRecordSheet must be used inside RecordSheetProvider');
  return ctx;
}
