import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Car, Fuel, Gauge, Receipt, Wrench, CalendarClock, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { StatusPill } from '../components/ui/StatusPill';
import { EmptyState, ErrorState, Loading } from '../components/ui/States';
import { Button } from '../components/ui/Button';
import { useAsync } from '../lib/useAsync';
import { api } from '../lib/api';
import { useVehicles } from '../context/VehicleContext';
import { useRecordSheet } from '../context/RecordSheetContext';
import { useAuth } from '../context/AuthContext';
import { dayMonth, km, money, moneyShort, monthLabel, shortDate } from '../lib/format';
import type { DashboardData } from '../lib/types';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export function Dashboard() {
  const { user } = useAuth();
  const { activeId } = useVehicles();
  const { version, openRecord } = useRecordSheet();
  const { data, loading, error, reload } = useAsync<DashboardData>(
    () => api.dashboard({ vehicleId: activeId === 'all' ? undefined : activeId }),
    [activeId, version],
  );

  if (loading && !data) return <Loading label="Loading your dashboard" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  if (data.vehicles.length === 0)
    return (
      <Card>
        <EmptyState
          icon={<Car className="h-6 w-6" />}
          title="Add your first vehicle"
          message="AutoCare needs a vehicle before it can track fuel, service and expenses. It takes about a minute."
          action={<Link to="/app/vehicles"><Button>Add a vehicle</Button></Link>}
        />
      </Card>
    );

  const v = data.activeVehicle;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-600 tracking-tight">
          {greeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <div className="hidden md:block">
          <Button onClick={() => openRecord('fuel')}><Plus className="h-4 w-4" />Add fuel</Button>
        </div>
      </div>

      {v && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-5 p-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-petrol-light text-petrol">
              {v.imageUrl ? (
                <img src={v.imageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <Car className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-600">{v.make} {v.model}</p>
              <p className="text-sm text-steel">
                {v.year} · {v.name}{v.licensePlate ? ` · ${v.licensePlate}` : ''}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-steel">Current mileage</p>
              <p className="readout text-3xl font-600">{v.mileage.toLocaleString()}<span className="ml-1 text-base text-steel">km</span></p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total expenses" value={moneyShort(data.totals.total)} icon={Receipt} />
        <StatCard label="Fuel" value={moneyShort(data.totals.fuel)} icon={Fuel} hint={`${data.fuel.fillUps} fill-ups`} />
        <StatCard label="Maintenance" value={moneyShort(data.totals.maintenance)} icon={Wrench} hint={`${data.counts.maintenance} records`} />
        <StatCard label="Repairs" value={moneyShort(data.totals.repairs)} icon={Wrench} tone="alert" hint={`${data.counts.repairs} repairs`} />
        <StatCard label="Mileage" value={v ? v.mileage.toLocaleString() : '-'} icon={Gauge} hint="km on the clock" />
        <StatCard
          label="Last service"
          value={data.lastService ? dayMonth(data.lastService.date) : '-'}
          icon={CalendarClock}
          tone="go"
          hint={data.lastService?.serviceType ?? 'Nothing logged yet'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Spending by month" action={<Link to="/app/analytics" className="text-sm text-petrol hover:underline">Analytics</Link>}>
          {data.monthlySpend.length === 0 ? (
            <EmptyState title="No spending yet" message="Add a fuel entry or an expense and this chart fills in." />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlySpend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0E5C58" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0E5C58" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#D9E0E5" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 12, fill: '#66727F' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#66727F' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => [money(value), 'Spent']}
                    labelFormatter={monthLabel}
                    contentStyle={{ borderRadius: 12, border: '1px solid #D9E0E5', fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#0E5C58" strokeWidth={2} fill="url(#spend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card title="Upcoming maintenance" action={<Link to="/app/reminders" className="text-sm text-petrol hover:underline">All reminders</Link>} padded={false}>
          {data.reminders.length === 0 ? (
            <EmptyState title="Nothing scheduled" message="Set a reminder so the next oil change does not sneak up on you." />
          ) : (
            <ul className="divide-y divide-line">
              {data.reminders.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-steel">{r.summary}</p>
                  </div>
                  <StatusPill status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card title="Recent activity" padded={false}>
          {data.recentActivity.length === 0 ? (
            <EmptyState title="No records yet" message="Everything you log shows up here, newest first." />
          ) : (
            <ul className="divide-y divide-line">
              {data.recentActivity.map((a) => (
                <li key={`${a.kind}-${a.id}`} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mist text-steel">
                    {a.kind === 'fuel' ? <Fuel className="h-4 w-4" /> : a.kind === 'expense' ? <Receipt className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium capitalize">{a.label || a.kind}</p>
                    <p className="text-xs capitalize text-steel">{a.kind}</p>
                  </div>
                  <div className="text-right">
                    <p className="readout text-sm font-600">{money(a.amount)}</p>
                    <p className="text-xs text-steel">{dayMonth(a.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Fuel at a glance">
          {data.fuel.fillUps < 2 ? (
            <EmptyState title="Log two fill-ups" message="Efficiency needs two odometer readings to compare. Add another fill-up and the numbers appear." />
          ) : (
            <dl className="grid grid-cols-2 gap-4">
              {[
                ['Average consumption', `${data.fuel.kmPerLiter} km/L`],
                ['Or, per 100 km', `${data.fuel.litersPer100Km} L`],
                ['Cost per kilometre', money(data.fuel.costPerKm)],
                ['Average pump price', money(data.fuel.averagePricePerLiter)],
                ['Fuel used', `${data.fuel.totalLiters} L`],
                ['Distance covered', km(data.fuel.distance)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-steel">{label}</dt>
                  <dd className="readout text-2xl font-600">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
      </div>

      {data.lastService && (
        <p className="text-sm text-steel">
          Last service: {data.lastService.serviceType} on {shortDate(data.lastService.date)} at {km(data.lastService.mileage)}.
        </p>
      )}
    </div>
  );
}
