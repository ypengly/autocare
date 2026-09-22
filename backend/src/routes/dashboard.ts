import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/validate.js';
import { ownedVehicleIds } from '../lib/ownership.js';
import { describeReminder } from '../lib/reminders.js';
import { costBuckets, fuelStats, monthKey, round2 } from '../lib/stats.js';
import { forbidden } from '../lib/errors.js';

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const ids = await ownedVehicleIds(userId);
    const requested = (req.query.vehicleId as string) || undefined;
    if (requested && !ids.includes(requested)) throw forbidden();
    const scope = requested ? [requested] : ids;
    const where = { vehicleId: { in: scope } };

    const [vehicles, fuel, maintenance, repairs, expenses, reminders] = await Promise.all([
      prisma.vehicle.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }] }),
      prisma.fuelRecord.findMany({ where, orderBy: { date: 'desc' } }),
      prisma.maintenanceRecord.findMany({ where, orderBy: { date: 'desc' } }),
      prisma.repair.findMany({ where, orderBy: { date: 'desc' } }),
      prisma.expense.findMany({ where, orderBy: { date: 'desc' } }),
      prisma.reminder.findMany({
        where: { ...where, completed: false },
        include: { vehicle: { select: { id: true, name: true, mileage: true } } },
      }),
    ]);

    const buckets = costBuckets(fuel, maintenance, repairs, expenses);
    const activeVehicle = vehicles.find((v) => (requested ? v.id === requested : v.isDefault)) ?? vehicles[0] ?? null;

    const monthly = new Map<string, number>();
    const addMonth = (date: Date, amount: number) => {
      const key = monthKey(new Date(date));
      monthly.set(key, round2((monthly.get(key) ?? 0) + amount));
    };
    fuel.forEach((r) => addMonth(r.date, r.totalCost));
    maintenance.forEach((r) => addMonth(r.date, r.cost));
    repairs.forEach((r) => addMonth(r.date, r.totalCost));
    expenses
      .filter((e) => !['Fuel', 'Maintenance', 'Repairs'].includes(e.category))
      .forEach((e) => addMonth(e.date, e.amount));

    const recent = [
      ...fuel.map((r) => ({ id: r.id, kind: 'fuel', label: r.station ?? 'Fuel', date: r.date, amount: r.totalCost, vehicleId: r.vehicleId })),
      ...maintenance.map((r) => ({ id: r.id, kind: 'maintenance', label: r.serviceType, date: r.date, amount: r.cost, vehicleId: r.vehicleId })),
      ...repairs.map((r) => ({ id: r.id, kind: 'repair', label: r.problem, date: r.date, amount: r.totalCost, vehicleId: r.vehicleId })),
      ...expenses.map((r) => ({ id: r.id, kind: 'expense', label: r.description ?? r.category, date: r.date, amount: r.amount, vehicleId: r.vehicleId })),
    ]
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .slice(0, 8);

    res.json({
      vehicles,
      activeVehicle,
      totals: buckets,
      fuel: fuelStats(fuel),
      lastService: maintenance[0] ?? null,
      reminders: reminders
        .map((r) => describeReminder(r, r.vehicle))
        .sort((a, b) => rank(a.status) - rank(b.status))
        .slice(0, 6),
      monthlySpend: [...monthly.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([month, amount]) => ({ month, amount })),
      recentActivity: recent,
      counts: {
        fuel: fuel.length,
        maintenance: maintenance.length,
        repairs: repairs.length,
        expenses: expenses.length,
      },
    });
  }),
);

const rank = (s: string) => (s === 'overdue' ? 0 : s === 'due-soon' ? 1 : 2);
