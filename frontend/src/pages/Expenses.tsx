import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { RecordsPage } from '../components/RecordsPage';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import type { Column } from '../components/ui/DataTable';
import { money, shortDate } from '../lib/format';
import { EXPENSE_CATEGORIES } from '../lib/recordFields';
import type { Expense } from '../lib/types';

const columns: Column<Expense>[] = [
  { key: 'date', header: 'Date', render: (r) => shortDate(r.date) },
  { key: 'category', header: 'Category', render: (r) => <span className="font-medium">{r.category}</span> },
  { key: 'description', header: 'Description', render: (r) => r.description ?? '-', secondary: true },
  { key: 'vehicle', header: 'Vehicle', render: (r) => r.vehicle?.name ?? '-', secondary: true },
  { key: 'amount', header: 'Amount', render: (r) => <span className="readout font-600">{money(r.amount)}</span>, align: 'right' },
];

const PALETTE = ['#0E5C58', '#E08A1E', '#C4402C', '#2E8B57', '#4A6E8A', '#8A6E4A', '#6A7482', '#127C71', '#B0873A', '#3F5F75'];

export function ExpensesPage() {
  return (
    <RecordsPage<Expense>
      kind="expense"
      title="Expenses"
      subtitle="Insurance, registration, parking, tolls - the rest of what the vehicle costs."
      addLabel="Add expense"
      columns={columns}
      categories={EXPENSE_CATEGORIES}
      emptyMessage="Log anything you pay for the vehicle that is not a fill-up or a service."
      renderAbove={(rows) => {
        if (rows.length === 0) return null;
        const now = new Date();
        const total = rows.reduce((s, r) => s + r.amount, 0);
        const inMonth = rows.filter((r) => new Date(r.date).getMonth() === now.getMonth() && new Date(r.date).getFullYear() === now.getFullYear());
        const inYear = rows.filter((r) => new Date(r.date).getFullYear() === now.getFullYear());
        const todayTotal = rows
          .filter((r) => new Date(r.date).toDateString() === now.toDateString())
          .reduce((s, r) => s + r.amount, 0);

        const byCategory = new Map<string, number>();
        for (const r of rows) byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + r.amount);
        const pie = [...byCategory.entries()].map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }));

        return (
          <div className="mb-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Today" value={money(todayTotal)} />
              <StatCard label="This month" value={money(inMonth.reduce((s, r) => s + r.amount, 0))} />
              <StatCard label="This year" value={money(inYear.reduce((s, r) => s + r.amount, 0))} />
              <StatCard label="All time" value={money(total)} tone="go" hint="Across the records shown" />
            </div>

            <Card title="Where the money goes">
              <div className="flex items-center gap-4">
                <div className="h-48 w-1/2 min-w-[9rem]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pie} dataKey="amount" nameKey="category" innerRadius="52%" outerRadius="88%" paddingAngle={2}>
                        {pie.map((entry, i) => (
                          <Cell key={entry.category} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number, n) => [money(v), n as string]} contentStyle={{ borderRadius: 12, border: '1px solid #D9E0E5', fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex-1 space-y-1.5 text-sm">
                  {pie.sort((a, b) => b.amount - a.amount).slice(0, 6).map((entry, i) => (
                    <li key={entry.category} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="flex-1 truncate">{entry.category}</span>
                      <span className="readout">{money(entry.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        );
      }}
    />
  );
}
