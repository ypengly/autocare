import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler, validate } from '../lib/validate.js';
import { assertVehicleOwned, ownedVehicleIds } from '../lib/ownership.js';
import { forbidden, notFound } from '../lib/errors.js';
import { expenseSchema, fuelSchema, maintenanceSchema, reminderSchema, repairSchema } from '../lib/schemas.js';

type Delegate = {
  findMany: (args: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
};

interface Options {
  model: Delegate;
  label: string;
  schema: ZodSchema;
  searchFields: string[];
  orderBy?: any;
  /** Derives server-side values (totals, etc.) so the client can never fake them. */
  derive?: (body: any) => any;
}

/**
 * Every record type shares the same shape: list / create / update / delete,
 * always scoped to vehicles the signed-in user owns.
 */
export function recordRouter({ model, label, schema, searchFields, orderBy, derive }: Options) {
  const router = Router();
  router.use(requireAuth);

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const ids = await ownedVehicleIds(req.userId!);
      const { vehicleId, from, to, q, category, minCost, maxCost, take } = req.query as Record<string, string>;

      if (vehicleId && !ids.includes(vehicleId)) throw forbidden();

      const where: any = { vehicleId: vehicleId ? vehicleId : { in: ids } };
      if (from || to) where.date = { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) };
      if (q) where.OR = searchFields.map((f) => ({ [f]: { contains: q, mode: 'insensitive' } }));
      if (category) where[searchFields.includes('category') ? 'category' : 'serviceType'] = category;

      const rows = await model.findMany({
        where,
        orderBy: orderBy ?? { date: 'desc' },
        take: take ? Number(take) : undefined,
        include: { vehicle: { select: { id: true, name: true } } },
      });

      const costKey = ['amount', 'totalCost', 'cost'].find((k) => rows[0] && k in rows[0]);
      const filtered = rows.filter((row) => {
        if (!costKey) return true;
        const value = Number(row[costKey] ?? 0);
        if (minCost && value < Number(minCost)) return false;
        if (maxCost && value > Number(maxCost)) return false;
        return true;
      });

      res.json(filtered);
    }),
  );

  router.post(
    '/',
    validate(schema),
    asyncHandler(async (req, res) => {
      await assertVehicleOwned(req.body.vehicleId, req.userId!);
      const data = derive ? derive(req.body) : req.body;
      const created = await model.create({ data });
      await syncMileage(req.body.vehicleId, data.mileage);
      res.status(201).json(created);
    }),
  );

  router.put(
    '/:id',
    validate(schema),
    asyncHandler(async (req, res) => {
      const existing = await model.findUnique({ where: { id: req.params.id } });
      if (!existing) throw notFound(label);
      await assertVehicleOwned(existing.vehicleId, req.userId!);
      await assertVehicleOwned(req.body.vehicleId, req.userId!);

      const data = derive ? derive(req.body) : req.body;
      const updated = await model.update({ where: { id: req.params.id }, data });
      await syncMileage(req.body.vehicleId, data.mileage);
      res.json(updated);
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const existing = await model.findUnique({ where: { id: req.params.id } });
      if (!existing) throw notFound(label);
      await assertVehicleOwned(existing.vehicleId, req.userId!);
      await model.delete({ where: { id: req.params.id } });
      res.status(204).end();
    }),
  );

  return router;
}

/** Keeps the vehicle odometer in step with the newest reading. */
async function syncMileage(vehicleId: string, mileage?: number) {
  if (mileage == null) return;
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (vehicle && mileage > vehicle.mileage)
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { mileage } });
}

export const fuelRouter = recordRouter({
  model: prisma.fuelRecord as unknown as Delegate,
  label: 'Fuel record',
  schema: fuelSchema,
  searchFields: ['station', 'notes', 'fuelType'],
  derive: (b) => ({ ...b, totalCost: round2(b.liters * b.pricePerLiter) }),
});

export const maintenanceRouter = recordRouter({
  model: prisma.maintenanceRecord as unknown as Delegate,
  label: 'Maintenance record',
  schema: maintenanceSchema,
  searchFields: ['serviceType', 'description', 'provider', 'parts', 'notes'],
});

export const repairRouter = recordRouter({
  model: prisma.repair as unknown as Delegate,
  label: 'Repair',
  schema: repairSchema,
  searchFields: ['problem', 'description', 'shop', 'parts', 'notes'],
  derive: (b) => ({ ...b, totalCost: round2((b.partsCost ?? 0) + (b.laborCost ?? 0)) }),
});

export const expenseRouter = recordRouter({
  model: prisma.expense as unknown as Delegate,
  label: 'Expense',
  schema: expenseSchema,
  searchFields: ['category', 'description', 'notes'],
});

const round2 = (n: number) => Math.round(n * 100) / 100;
