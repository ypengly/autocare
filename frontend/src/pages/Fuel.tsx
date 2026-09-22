import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RecordsPage } from '../components/RecordsPage';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import type { Column } from '../components/ui/DataTable';
import { dayMonth, money, monthLabel, shortDate } from '../lib/format';
import type { FuelRecord } from '../lib/types';

const columns: Column<FuelRecord>[] = [
  { key: 'date', header: 'Date', render: (r) => shortDate(r.date) },
  { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicle?.name ?? '-', secondary: true },
  { key: 'mileage', header: 'Odometer', render: (r) => r.mileage.toLocaleString(), align: 'right' },
  { key: 'liters', header: 'Litres', render: (r) => r.liters.toFixed(2), align: 'right' },
  { key: 'price', header: 'Per litre', render: (r) => money(r.pricePerLiter), align: 'right', secondary: true },
  { key: 'total', header: 'Total', render: (r) => <span className="readout font-600">{money(r.totalCost)}</span>, align: 'right' },
  { key: 'station', header: 'Station', render: (r) => r.station ?? '-', secondary: true },
];

/** Efficiency comes from the gap between consecutive odometer readings. */
function summarise(rows: FuelRecord[]) {
  const ordered = [...rows].sort((a, b) => a.mileage - b.mileage);
  const totalLiters = ordered.reduce((s, r) => s + r.liters, 0);
  const totalCost = ordered.reduce((s, r) => s + r.totalCost, 0);

  let distance = 0;
  let litres = 0;
  const series: { date: string; kmPerLiter: number; litersPer100Km: number }[] = [];
  for (let i = 1; i < ordered.length; i++) {
    const leg = ordered[i].mileage - ordered[i - 1].mileage;
    if (leg <= 0 || !ordered[i].liters) continue;
    distance += leg;
    litres += ordered[i].liters;
    series.push({
      date: ordered[i].date,
      kmPerLiter: Math.round((leg / ordered[i].liters) * 100) / 100,
      litersPer100Km: Math.round((ordered[i].liters / leg) * 10000) / 100,
    });
  }

  const kmPerLiter = litres ? distance / litres : 0;
  const monthly = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly.set(key, Math.round(((monthly.get(key) ?? 0) + r.totalCost) * 100) / 100);
  }

  return {
    totalLiters, totalCost, distance,
    kmPerLiter: Math.round(kmPerLiter * 100) / 100,
    litersPer100Km: kmPerLiter ? Math.round((100 / kmPerLiter) * 100) / 100 : 0,
    costPerKm: distance ? totalCost / distance : 0,
    averagePrice: totalLiters ? totalCost / totalLiters : 0,
    series,
    costOverTime: [...rows].sort((a, b) => +new Date(a.date) - +new Date(b.date)).map((r) => ({ date: r.date, cost: r.totalCost })),
    monthly: [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, amount]) => ({ month, amount })),
  };
}

const axis = { fontSize: 12, fill: '#66727F' };
const tooltipStyle = { borderRadius: 12, border: '1px solid #D9E0E5', fontSize: 13 };

export function FuelPage() {
  return (
    <RecordsPage<FuelRecord>
      kind="fuel"
      title="Fuel"
      subtitle="Four fields at the pump. AutoCare does the arithmetic."
      addLabel="Add fuel"
      columns={columns}
      emptyMessage="Log a fill-up with the date, odometer, litres and pump price. Consumption and cost per kilometre follow from there."
      renderAbove={(rows) => {
        if (rows.length === 0) return null;
        const s = summarise(rows);
        return (
          <div className="mb-5 space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Fuel spend" value={money(s.totalCost)} />
              <StatCard label="Fuel used" value={`${s.totalLiters.toFixed(1)} L`} />
              <StatCard label="Consumption" value={`${s.kmPerLiter} km/L`} hint={`${s.litersPer100Km} L per 100 km`} tone="go" />
              <StatCard label="Cost per km" value={money(s.costPerKm)} />
              <StatCard label="Average pump price" value={money(s.averagePrice)} />
              <StatCard label="Distance covered" value={`${s.distance.toLocaleString()} km`} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Fuel cost per fill-up">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={s.costOverTime} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#D9E0E5" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={dayMonth} tick={axis} tickLine={false} axisLine={false} />
                      <YAxis tick={axis} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: number) => [money(v), 'Cost']} labelFormatter={shortDate} contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="cost" stroke="#0E5C58" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Consumption between fill-ups">
                {s.series.length === 0 ? (
                  <p className="py-16 text-center text-sm text-steel">Add a second fill-up to compare odometer readings.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={s.series} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#D9E0E5" vertical={false} />
                        <XAxis dataKey="date" tickFormatter={dayMonth} tick={axis} tickLine={false} axisLine={false} />
                        <YAxis tick={axis} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(v: number) => [`${v} km/L`, 'Consumption']} labelFormatter={shortDate} contentStyle={tooltipStyle} />
                        <Line type="monotone" dataKey="kmPerLiter" stroke="#E08A1E" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>

              <Card title="Fuel spend by month" className="lg:col-span-2">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={s.monthly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#D9E0E5" vertical={false} />
                      <XAxis dataKey="month" tickFormatter={monthLabel} tick={axis} tickLine={false} axisLine={false} />
                      <YAxis tick={axis} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: number) => [money(v), 'Fuel']} labelFormatter={monthLabel} contentStyle={tooltipStyle} />
                      <Bar dataKey="amount" fill="#0E5C58" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        );
      }}
    />
  );
}
