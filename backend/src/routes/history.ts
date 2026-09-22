import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/validate.js';
import { ownedVehicleIds } from '../lib/ownership.js';
import { forbidden } from '../lib/errors.js';

export const historyRouter = Router();
historyRouter.use(requireAuth);

/** Service history timeline: maintenance and repairs, newest first. */
historyRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const ids = await ownedVehicleIds(req.userId!);
    const vehicleId = req.query.vehicleId as string | undefined;
    if (vehicleId && !ids.includes(vehicleId)) throw forbidden();
    const where = { vehicleId: vehicleId ? vehicleId : { in: ids } };

    const [maintenance, repairs] = await Promise.all([
      prisma.maintenanceRecord.findMany({ where, include: { vehicle: { select: { name: true } } } }),
      prisma.repair.findMany({ where, include: { vehicle: { select: { name: true } } } }),
    ]);

    const timeline = [
      ...maintenance.map((r) => ({
        id: r.id, kind: 'maintenance' as const, date: r.date, mileage: r.mileage,
        title: r.serviceType, detail: r.description ?? r.provider ?? '', amount: r.cost,
        vehicle: r.vehicle.name,
      })),
      ...repairs.map((r) => ({
        id: r.id, kind: 'repair' as const, date: r.date, mileage: r.mileage,
        title: r.problem, detail: r.description ?? r.shop ?? '', amount: r.totalCost,
        vehicle: r.vehicle.name,
      })),
    ].sort((a, b) => +new Date(b.date) - +new Date(a.date));

    res.json(timeline);
  }),
);
