import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/validate.js';
import { ownedVehicleIds } from '../lib/ownership.js';
import { costBuckets, fuelStats, monthKey, round2, sum } from '../lib/stats.js';
import { forbidden } from '../lib/errors.js';

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

/** Turns ?range=30d|3m|6m|year|custom (+from/to) into a date window. */
function resolveRange(query: Record<string, string>) {
  const to = query.to ? new Date(query.to) : new Date();
  const from = new Date(to);
  switch (query.range) {
    case '30d': from.setDate(from.getDate() - 30); break;
    case '3m': from.setMonth(from.getMonth() - 3); break;
    case '6m': from.setMonth(from.getMonth() - 6); break;
    case 'year': from.setMonth(0, 1); break;
    case 'custom': return { from: query.from ? new Date(query.from) : new Date(0), to };
    default: from.setFullYear(from.getFullYear() - 1);
  }
  return { from, to };
}

analyticsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const ids = await ownedVehicleIds(req.userId!);
    const q = req.query as Record<string, string>;
    if (q.vehicleId && !ids.includes(q.vehicleId)) throw forbidden();

    const { from, to } = resolveRange(q);
    const where = {
      vehicleId: q.vehicleId ? q.vehicleId : { in: ids },
      date: { gte: from, lte: to },
    };

    const [fuel, maintenance, repairs, expenses] = await Promise.all([
      prisma.fuelRecord.findMany({ where, orderBy: { date: 'asc' } }),
      prisma.maintenanceRecord.findMany({ where, orderBy: { date: 'asc' } }),
      prisma.repair.findMany({ where, orderBy: { date: 'asc' } }),
      prisma.expense.findMany({ where, orderBy: { date: 'asc' } }),
    ]);

    const totals = costBuckets(fuel, maintenance, repairs, expenses);
    const fuelSummary = fuelStats(fuel);

    // Expenses by month, split by source.
    const months = new Map<string, { month: string; fuel: number; maintenance: number; repairs: number; other: number }>();
    const bucket = (date: Date) => {
      const key = monthKey(new Date(date));
      if (!months.has(key)) months.set(key, { month: key, fuel: 0, maintenance: 0, repairs: 0, other: 0 });
      return months.get(key)!;
    };
    fuel.forEach((r) => (bucket(r.date).fuel = round2(bucket(r.date).fuel + r.totalCost)));
    maintenance.forEach((r) => (bucket(r.date).maintenance = round2(bucket(r.date).maintenance + r.cost)));
    repairs.forEach((r) => (bucket(r.date).repairs = round2(bucket(r.date).repairs + r.totalCost)));
    expenses
      .filter((e) => !['Fuel', 'Maintenance', 'Repairs'].includes(e.category))
      .forEach((e) => (bucket(e.date).other = round2(bucket(e.date).other + e.amount)));

    const byMonth = [...months.values()].sort((a, b) => a.month.localeCompare(b.month));

    // Expenses by category, folding the dedicated tables in as categories.
    const categories = new Map<string, number>();
    const addCategory = (name: string, amount: number) =>
      categories.set(name, round2((categories.get(name) ?? 0) + amount));
    addCategory('Fuel', totals.fuel);
    addCategory('Maintenance', totals.maintenance);
    addCategory('Repairs', totals.repairs);
    expenses
      .filter((e) => !['Fuel', 'Maintenance', 'Repairs'].includes(e.category))
      .forEach((e) => addCategory(e.category, e.amount));

    const consumption = [];
    const ordered = [...fuel].sort((a, b) => a.mileage - b.mileage);
    for (let i = 1; i < ordered.length; i++) {
      const leg = ordered[i].mileage - ordered[i - 1].mileage;
      if (leg <= 0 || !ordered[i].liters) continue;
      consumption.push({
        date: ordered[i].date,
        kmPerLiter: round2(leg / ordered[i].liters),
        litersPer100Km: round2((ordered[i].liters / leg) * 100),
        pricePerLiter: ordered[i].pricePerLiter,
      });
    }

    const mileageGrowth = [...fuel, ...maintenance, ...repairs]
      .map((r) => ({ date: r.date, mileage: r.mileage }))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date));

    const monthsCovered = Math.max(1, byMonth.length);
    const maintenanceCosts = [...maintenance]
      .reduce((acc, r) => {
        const found = acc.find((x) => x.serviceType === r.serviceType);
        if (found) { found.cost = round2(found.cost + r.cost); found.count += 1; }
        else acc.push({ serviceType: r.serviceType, cost: round2(r.cost), count: 1 });
        return acc;
      }, [] as { serviceType: string; cost: number; count: number }[])
      .sort((a, b) => b.cost - a.cost);

    res.json({
      range: { from, to },
      totals,
      fuel: fuelSummary,
      averageMonthlyCost: round2(totals.total / monthsCovered),
      costPerKm: fuelSummary.distance > 0 ? round2(totals.total / fuelSummary.distance) : 0,
      maintenanceFrequency: round2((maintenance.length + repairs.length) / monthsCovered),
      byMonth,
      byCategory: [...categories.entries()]
        .filter(([, amount]) => amount > 0)
        .map(([category, amount]) => ({ category, amount })),
      consumption,
      mileageGrowth,
      maintenanceCosts,
      repairSpend: round2(sum(repairs.map((r) => r.totalCost))),
    });
  }),
);
