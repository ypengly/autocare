import { useState } from 'react';
import { Car, Plus, Star } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState, Loading } from '../components/ui/States';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { RecordForm } from '../components/forms/RecordForm';
import type { FieldDef } from '../components/forms/fields';
import { useVehicles } from '../context/VehicleContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { cleanPayload } from '../lib/recordFields';
import { km, money, shortDate } from '../lib/format';
import type { Vehicle } from '../lib/types';

const fields: FieldDef[] = [
  { name: 'name', label: 'Vehicle name', required: true, autoFocus: true, placeholder: 'Daily Camry' },
  {
    name: 'type', label: 'Type', type: 'select', required: true,
    options: [
      { value: 'CAR', label: 'Car' },
      { value: 'MOTORCYCLE', label: 'Motorcycle' },
      { value: 'TRUCK', label: 'Truck' },
      { value: 'OTHER', label: 'Other' },
    ],
  },
  { name: 'make', label: 'Make', required: true, placeholder: 'Toyota' },
  { name: 'model', label: 'Model', required: true, placeholder: 'Camry' },
  { name: 'year', label: 'Year', type: 'number', required: true, min: 1900, step: '1' },
  { name: 'mileage', label: 'Current mileage (km)', type: 'number', required: true, min: 0, step: '1' },
  { name: 'licensePlate', label: 'License plate' },
  { name: 'vin', label: 'VIN' },
  { name: 'purchaseDate', label: 'Purchase date', type: 'date' },
  { name: 'purchasePrice', label: 'Purchase price', type: 'number', min: 0, step: '0.01' },
  { name: 'fuelType', label: 'Fuel type', placeholder: 'Gasoline 95, diesel…' },
  { name: 'engineSize', label: 'Engine size', placeholder: '2.5 L' },
  { name: 'imageUrl', label: 'Photo link', wide: true, placeholder: 'https://…' },
  { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
  { name: 'isDefault', label: 'Make this my default vehicle', type: 'checkbox', wide: true },
];

const blank = {
  name: '', type: 'CAR', make: '', model: '', year: new Date().getFullYear(), mileage: '',
  licensePlate: '', vin: '', purchaseDate: '', purchasePrice: '', fuelType: '', engineSize: '',
  imageUrl: '', notes: '', isDefault: false,
};

export function Vehicles() {
  const { vehicles, loading, refresh, setActiveId } = useVehicles();
  const { notify } = useToast();
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [busy, setBusy] = useState(false);

  const initial = editing
    ? { ...blank, ...Object.fromEntries(Object.entries(editing).filter(([, v]) => v !== null)), purchaseDate: editing.purchaseDate?.slice(0, 10) ?? '' }
    : blank;

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.vehicles.remove(deleting.id);
      notify(`${deleting.name} and its records were deleted`);
      setDeleting(null);
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete this vehicle', 'error');
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = async (vehicle: Vehicle) => {
    await api.vehicles.setDefault(vehicle.id);
    notify(`${vehicle.name} is now your default vehicle`);
    refresh();
  };

  if (loading && vehicles.length === 0) return <Loading label="Loading your vehicles" />;

  return (
    <>
      <PageHeader
        title="Vehicles"
        subtitle="Everything else in AutoCare hangs off these."
        action={<Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Add vehicle</Button>}
      />

      {vehicles.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Car className="h-6 w-6" />}
            title="No vehicles yet"
            message="Add the car or motorcycle you want to track. You can add more later and switch between them."
            action={<Button onClick={() => setAdding(true)}>Add a vehicle</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => (
            <Card key={v.id} padded={false} className="overflow-hidden">
              <div className="flex items-start gap-4 p-5">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-petrol-light text-petrol">
                  {v.imageUrl ? <img src={v.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <Car className="h-6 w-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-xl font-600">{v.name}</h3>
                    {v.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-signal-light px-2 py-0.5 text-[11px] font-medium text-signal">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-steel">{v.make} {v.model} · {v.year}</p>
                  <p className="readout mt-2 text-2xl font-600">{v.mileage.toLocaleString()}<span className="ml-1 text-sm text-steel">km</span></p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-4 text-sm">
                {[
                  ['Plate', v.licensePlate || '-'],
                  ['Fuel', v.fuelType || '-'],
                  ['Engine', v.engineSize || '-'],
                  ['Bought', v.purchaseDate ? shortDate(v.purchaseDate) : '-'],
                  ['Paid', v.purchasePrice ? money(v.purchasePrice) : '-'],
                  ['VIN', v.vin || '-'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-steel">{label}</dt>
                    <dd className="truncate">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
                <Button variant="secondary" onClick={() => setEditing(v)}>Edit</Button>
                <Button variant="ghost" onClick={() => setActiveId(v.id)}>View records</Button>
                {!v.isDefault && <Button variant="ghost" onClick={() => makeDefault(v)}>Make default</Button>}
                <button onClick={() => setDeleting(v)} className="ml-auto text-sm text-alert hover:underline">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(adding || editing) && (
        <RecordForm
          open
          title={editing ? `Edit ${editing.name}` : 'Add a vehicle'}
          fields={fields}
          initial={initial}
          submitLabel={editing ? 'Save changes' : 'Add vehicle'}
          successMessage={editing ? 'Vehicle updated' : 'Vehicle added'}
          onSubmit={(values) => {
            const payload = cleanPayload({ ...values, isDefault: Boolean(values.isDefault) });
            return editing ? api.vehicles.update(editing.id, payload) : api.vehicles.create(payload);
          }}
          onDone={refresh}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.name ?? 'vehicle'}`}
        message="Fuel entries, service records, repairs, expenses and reminders for this vehicle are deleted too. This cannot be undone."
        confirmLabel="Delete vehicle"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
