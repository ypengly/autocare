import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/validate.js';
import { ownedVehicleIds } from '../lib/ownership.js';

export const searchRouter = Router();
searchRouter.use(requireAuth);

/** One query across every record type the user owns. */
searchRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    if (q.length < 2) return res.json({ results: [] });

    const ids = await ownedVehicleIds(req.userId!);
    const scope = { vehicleId: { in: ids } };
    const like = { contains: q, mode: 'insensitive' as const };

    const [fuel, maintenance, repairs, expenses, reminders] = await Promise.all([
      prisma.fuelRecord.findMany({ where: { ...scope, OR: [{ station: like }, { notes: like }] }, take: 5 }),
      prisma.maintenanceRecord.findMany({
        where: { ...scope, OR: [{ serviceType: like }, { description: like }, { provider: like }] },
        take: 5,
      }),
      prisma.repair.findMany({ where: { ...scope, OR: [{ problem: like }, { shop: like }, { description: like }] }, take: 5 }),
      prisma.expense.findMany({ where: { ...scope, OR: [{ category: like }, { description: like }] }, take: 5 }),
      prisma.reminder.findMany({ where: { ...scope, OR: [{ title: like }, { description: like }] }, take: 5 }),
    ]);

    res.json({
      results: [
        ...fuel.map((r) => ({ id: r.id, kind: 'fuel', title: r.station ?? 'Fuel stop', subtitle: `${r.liters} L`, date: r.date, amount: r.totalCost })),
        ...maintenance.map((r) => ({ id: r.id, kind: 'maintenance', title: r.serviceType, subtitle: r.provider ?? '', date: r.date, amount: r.cost })),
        ...repairs.map((r) => ({ id: r.id, kind: 'repair', title: r.problem, subtitle: r.shop ?? '', date: r.date, amount: r.totalCost })),
        ...expenses.map((r) => ({ id: r.id, kind: 'expense', title: r.description ?? r.category, subtitle: r.category, date: r.date, amount: r.amount })),
        ...reminders.map((r) => ({ id: r.id, kind: 'reminder', title: r.title, subtitle: r.description ?? '', date: r.dueDate, amount: null })),
      ].sort((a, b) => +new Date(b.date ?? 0) - +new Date(a.date ?? 0)),
    });
  }),
);
