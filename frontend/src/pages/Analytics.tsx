import { useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { useAsync } from '../lib/useAsync';
import { api } from '../lib/api';
import { useVehicles } from '../context/VehicleContext';
import { useRecordSheet } from '../context/RecordSheetContext';
import { dayMonth, money, monthLabel, shortDate } from '../lib/format';
import type { AnalyticsData } from '../lib/types';

const RANGES = [
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom range' },
];

const PALETTE = ['#0E5C58', '#E08A1E', '#C4402C', '#2E8B57', '#4A6E8A', '#8A6E4A', '#6A7482', '#127C71'];
const axis = { fontSize: 12, fill: '#66727F' };
const tooltipStyle = { borderRadius: 12, border: '1px solid #D9E0E5', fontSize: 13 };

export function AnalyticsPage() {
  const { activeId } = useVehicles();
  const { version } = useRecordSheet();
  const [range, setRange] = useState('6m');
  const [custom, setCustom] = useState({ from: '', to: '' });

  const { data, loading, error, reload } = useAsync<AnalyticsData>(
    () =>
      api.analytics({
        vehicleId: activeId === 'all' ? undefined : activeId,
        range,
        from: range === 'custom' ? custom.from : undefined,
        to: range === 'custom' ? custom.to : undefined,
      }),
    [activeId, range, custom.from, custom.to, version],
  );

  const input = 'rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-petrol';

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle={data ? `${shortDate(data.range.from)} to ${shortDate(data.range.to)}` : 'What the vehicle actually costs to run.'}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select className={input} value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range">
              {RANGES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {range === 'custom' && (
              <>
                <input type="date" className={input} value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} aria-label="From" />
                <input type="date" className={input} value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} aria-label="To" />
              </>
            )}
          </div>
        }
      />

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? null : data.totals.total === 0 ? (
        <Card>
          <EmptyState title="Nothing in this window" message="Pick a wider date range, or add some records first." />
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
            <StatCard label="Total spend" value={money(data.totals.total)} />
            <StatCard label="Fuel" value={money(data.totals.fuel)} />
            <StatCard label="Maintenance" value={money(data.totals.maintenance)} />
            <StatCard label="Repairs" value={money(data.totals.repairs)} tone="alert" />
            <StatCard label="Other" value={money(data.totals.other)} />
            <StatCard label="Per month" value={money(data.averageMonthlyCost)} tone="go" />
            <StatCard label="Per kilometre" value={money(data.costPerKm)} />
            <StatCard label="Efficiency" value={`${data.fuel.kmPerLiter} km/L`} hint={`${data.fuel.litersPer100Km} L/100 km`} />
          </div>

          <Card title="Spending by month">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byMonth} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#D9E0E5" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tick={axis} tickLine={false} axisLine={false} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number, n) => [money(v), String(n)]} labelFormatter={monthLabel} contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="fuel" stackId="a" name="Fuel" fill="#0E5C58" />
                  <Bar dataKey="maintenance" stackId="a" name="Maintenance" fill="#E08A1E" />
                  <Bar dataKey="repairs" stackId="a" name="Repairs" fill="#C4402C" />
                  <Bar dataKey="other" stackId="a" name="Other" fill="#4A6E8A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Spending by category">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="amount" nameKey="category" innerRadius="50%" outerRadius="85%" paddingAngle={2}>
                      {data.byCategory.map((entry, i) => (
                        <Cell key={entry.category} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Tooltip formatter={(v: number, n) => [money(v), String(n)]} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Fuel consumption">
              {data.consumption.length === 0 ? (
                <p className="py-20 text-center text-sm text-steel">Two fill-ups in this window are needed to measure consumption.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.consumption} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#D9E0E5" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={dayMonth} tick={axis} tickLine={false} axisLine={false} />
                      <YAxis tick={axis} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: number, n) => [n === 'kmPerLiter' ? `${v} km/L` : `${v} L/100km`, n === 'kmPerLiter' ? 'Consumption' : 'Per 100 km']} labelFormatter={shortDate} contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="kmPerLiter" stroke="#0E5C58" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="litersPer100Km" stroke="#E08A1E" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Mileage growth">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.mileageGrowth} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#D9E0E5" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={dayMonth} tick={axis} tickLine={false} axisLine={false} />
                    <YAxis tick={axis} tickLine={false} axisLine={false} domain={['dataMin - 500', 'dataMax + 500']} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()} km`, 'Odometer']} labelFormatter={shortDate} contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="mileage" stroke="#2E8B57" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Maintenance cost by service">
              {data.maintenanceCosts.length === 0 ? (
                <p className="py-20 text-center text-sm text-steel">No maintenance recorded in this window.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.maintenanceCosts} layout="vertical" margin={{ top: 8, right: 16, left: 40, bottom: 0 }}>
                      <CartesianGrid stroke="#D9E0E5" horizontal={false} />
                      <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="serviceType" tick={axis} tickLine={false} axisLine={false} width={110} />
                      <Tooltip formatter={(v: number) => [money(v), 'Spent']} contentStyle={tooltipStyle} />
                      <Bar dataKey="cost" fill="#0E5C58" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          <p className="text-sm text-steel">
            Service visits in this window: {data.maintenanceFrequency} per month on average.
          </p>
        </div>
      )}
    </>
  );
}
