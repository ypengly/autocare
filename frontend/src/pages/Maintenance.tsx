import { RecordsPage } from '../components/RecordsPage';
import type { Column } from '../components/ui/DataTable';
import { money, shortDate } from '../lib/format';
import { SERVICE_TYPES } from '../lib/recordFields';
import type { MaintenanceRecord } from '../lib/types';

const columns: Column<MaintenanceRecord>[] = [
  { key: 'date', header: 'Date', render: (r) => shortDate(r.date) },
  { key: 'service', header: 'Service', render: (r) => <span className="font-medium">{r.serviceType}</span> },
  { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicle?.name ?? '-', secondary: true },
  { key: 'mileage', header: 'Odometer', render: (r) => r.mileage.toLocaleString(), align: 'right' },
  { key: 'provider', header: 'Provider', render: (r) => r.provider ?? '-', secondary: true },
  { key: 'parts', header: 'Parts', render: (r) => r.parts ?? '-', secondary: true },
  { key: 'cost', header: 'Cost', render: (r) => <span className="readout font-600">{money(r.cost)}</span>, align: 'right' },
];

export function MaintenancePage() {
  return (
    <RecordsPage<MaintenanceRecord>
      kind="maintenance"
      title="Maintenance"
      subtitle="Scheduled work: oil, filters, brakes, tyres, fluids."
      addLabel="Add maintenance"
      columns={columns}
      categories={SERVICE_TYPES}
      categoryLabel="Service type"
      emptyMessage="Record a service with the date, odometer reading and cost. It joins your service history straight away."
    />
  );
}
