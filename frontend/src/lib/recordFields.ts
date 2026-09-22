import type { FieldDef } from '../components/forms/fields';
import type { Vehicle } from './types';
import { today } from './format';

export type RecordKind = 'fuel' | 'maintenance' | 'repair' | 'expense' | 'reminder';

export const SERVICE_TYPES = [
  'Oil change', 'Tire replacement', 'Brake service', 'Battery replacement',
  'Air filter', 'Engine service', 'Transmission service', 'Coolant', 'Other',
];

export const EXPENSE_CATEGORIES = [
  'Fuel', 'Maintenance', 'Repairs', 'Insurance', 'Registration',
  'Parking', 'Tolls', 'Washing', 'Accessories', 'Other',
];

export const RECORD_LABELS: Record<RecordKind, string> = {
  fuel: 'fuel entry',
  maintenance: 'maintenance record',
  repair: 'repair',
  expense: 'expense',
  reminder: 'reminder',
};

const vehicleField = (vehicles: Vehicle[]): FieldDef => ({
  name: 'vehicleId',
  label: 'Vehicle',
  type: 'select',
  required: true,
  options: vehicles.map((v) => ({ value: v.id, label: `${v.name} - ${v.make} ${v.model}` })),
});

export function fieldsFor(kind: RecordKind, vehicles: Vehicle[]): FieldDef[] {
  const vehicle = vehicleField(vehicles);

  switch (kind) {
    case 'fuel':
      // The four fields at the top are all a quick fill-up needs.
      return [
        { name: 'date', label: 'Date', type: 'date', required: true, autoFocus: true },
        { name: 'mileage', label: 'Odometer (km)', type: 'number', required: true, min: 0, step: '1' },
        { name: 'liters', label: 'Litres', type: 'number', required: true, min: 0, step: '0.01' },
        { name: 'pricePerLiter', label: 'Price per litre', type: 'number', required: true, min: 0, step: '0.001' },
        vehicle,
        { name: 'station', label: 'Station', placeholder: 'Where you filled up' },
        { name: 'fuelType', label: 'Fuel type', placeholder: 'Gasoline 95, diesel…' },
        { name: 'fullTank', label: 'Filled the tank', type: 'checkbox' },
        { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
      ];
    case 'maintenance':
      return [
        { name: 'date', label: 'Date', type: 'date', required: true, autoFocus: true },
        { name: 'mileage', label: 'Odometer (km)', type: 'number', required: true, min: 0, step: '1' },
        { name: 'serviceType', label: 'Service', type: 'select', required: true, options: SERVICE_TYPES.map((s) => ({ value: s, label: s })) },
        { name: 'cost', label: 'Cost', type: 'number', required: true, min: 0, step: '0.01' },
        vehicle,
        { name: 'provider', label: 'Service provider', placeholder: 'Garage or workshop' },
        { name: 'parts', label: 'Parts replaced', wide: true, placeholder: 'Oil filter, 5W-30…' },
        { name: 'description', label: 'What was done', type: 'textarea', wide: true },
        { name: 'receiptUrl', label: 'Receipt link', wide: true, placeholder: 'https://…' },
      ];
    case 'repair':
      return [
        { name: 'date', label: 'Date', type: 'date', required: true, autoFocus: true },
        { name: 'mileage', label: 'Odometer (km)', type: 'number', required: true, min: 0, step: '1' },
        { name: 'problem', label: 'Problem', required: true, wide: true, placeholder: 'What went wrong' },
        { name: 'partsCost', label: 'Parts cost', type: 'number', required: true, min: 0, step: '0.01' },
        { name: 'laborCost', label: 'Labour cost', type: 'number', required: true, min: 0, step: '0.01' },
        vehicle,
        { name: 'shop', label: 'Repair shop' },
        { name: 'parts', label: 'Parts used', wide: true },
        { name: 'description', label: 'Repair description', type: 'textarea', wide: true },
        { name: 'warranty', label: 'Warranty', placeholder: '6 months / 10,000 km' },
        { name: 'receiptUrl', label: 'Receipt link', placeholder: 'https://…' },
      ];
    case 'expense':
      return [
        { name: 'date', label: 'Date', type: 'date', required: true, autoFocus: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true, min: 0, step: '0.01' },
        { name: 'category', label: 'Category', type: 'select', required: true, options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })) },
        vehicle,
        { name: 'description', label: 'Description', wide: true, placeholder: 'Monthly parking, annual premium…' },
        { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
      ];
    case 'reminder':
      return [
        { name: 'title', label: 'Title', required: true, autoFocus: true, wide: true, placeholder: 'Oil change' },
        {
          name: 'type', label: 'Remind me by', type: 'select', required: true,
          options: [
            { value: 'MILEAGE', label: 'Distance driven' },
            { value: 'TIME', label: 'Time interval' },
            { value: 'DATE', label: 'A fixed date' },
          ],
        },
        vehicle,
        { name: 'dueMileage', label: 'Due at odometer (km)', type: 'number', min: 0, step: '1', help: 'For distance reminders' },
        { name: 'dueDate', label: 'Due date', type: 'date', help: 'For time and date reminders' },
        { name: 'repeatInterval', label: 'Repeat every', type: 'number', min: 1, step: '1', help: 'Km for distance, or number of units below' },
        {
          name: 'repeatUnit', label: 'Repeat unit', type: 'select',
          options: [
            { value: 'days', label: 'Days' },
            { value: 'months', label: 'Months' },
            { value: 'years', label: 'Years' },
          ],
        },
        { name: 'description', label: 'Notes', type: 'textarea', wide: true },
      ];
  }
}

/** Blank record pre-filled with sensible defaults for fast entry. */
export function blankRecord(kind: RecordKind, vehicle: Vehicle | null): Record<string, any> {
  const shared = { vehicleId: vehicle?.id ?? '', date: today(), mileage: vehicle?.mileage ?? '' };
  switch (kind) {
    case 'fuel':
      return { ...shared, liters: '', pricePerLiter: '', station: '', fuelType: vehicle?.fuelType ?? '', fullTank: true, notes: '' };
    case 'maintenance':
      return { ...shared, serviceType: '', cost: '', provider: '', parts: '', description: '', receiptUrl: '' };
    case 'repair':
      return { ...shared, problem: '', partsCost: '', laborCost: '', shop: '', parts: '', description: '', warranty: '', receiptUrl: '' };
    case 'expense':
      return { vehicleId: vehicle?.id ?? '', date: today(), amount: '', category: '', description: '', notes: '' };
    case 'reminder':
      return { vehicleId: vehicle?.id ?? '', title: '', type: 'MILEAGE', dueMileage: '', dueDate: '', repeatInterval: '', repeatUnit: 'months', description: '' };
  }
}

/** Strips empty strings so optional fields arrive as null, not "". */
export function cleanPayload(values: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === '' || value === undefined) continue;
    out[key] = value;
  }
  return out;
}
