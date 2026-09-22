import { RecordsPage } from '../components/RecordsPage';
import type { Column } from '../components/ui/DataTable';
import { money, shortDate } from '../lib/format';
import type { Repair } from '../lib/types';

const columns: Column<Repair>[] = [
  { key: 'date', header: 'Date', render: (r) => shortDate(r.date) },
  { key: 'problem', header: 'Problem', render: (r) => <span className="font-medium">{r.problem}</span> },
  { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicle?.name ?? '-', secondary: true },
  { key: 'mileage', header: 'Odometer', render: (r) => r.mileage.toLocaleString(), align: 'right', secondary: true },
  { key: 'shop', header: 'Shop', render: (r) => r.shop ?? '-', secondary: true },
  { key: 'parts', header: 'Parts', render: (r) => money(r.partsCost), align: 'right', secondary: true },
  { key: 'labor', header: 'Labour', render: (r) => money(r.laborCost), align: 'right', secondary: true },
  { key: 'total', header: 'Total', render: (r) => <span className="readout font-600">{money(r.totalCost)}</span>, align: 'right' },
  { key: 'warranty', header: 'Warranty', render: (r) => r.warranty ?? '-', secondary: true },
];

export function RepairsPage() {
  return (
    <RecordsPage<Repair>
      kind="repair"
      title="Repairs"
      subtitle="Unplanned work. Parts plus labour is totalled for you."
      addLabel="Add repair"
      columns={columns}
      emptyMessage="Log what broke, what it cost in parts and labour, and who fixed it. Warranty details stay with the record."
    />
  );
}
