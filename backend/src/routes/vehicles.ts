import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler, validate } from '../lib/validate.js';
import { vehicleSchema } from '../lib/schemas.js';
import { assertVehicleOwned } from '../lib/ownership.js';

export const vehicleRouter = Router();
vehicleRouter.use(requireAuth);

vehicleRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: req.userId! },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    res.json(vehicles);
  }),
);

vehicleRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const vehicle = await assertVehicleOwned(req.params.id, req.userId!);
    res.json(vehicle);
  }),
);

vehicleRouter.post(
  '/',
  validate(vehicleSchema),
  asyncHandler(async (req, res) => {
    const count = await prisma.vehicle.count({ where: { userId: req.userId! } });
    const isDefault = req.body.isDefault ?? count === 0;
    if (isDefault)
      await prisma.vehicle.updateMany({ where: { userId: req.userId! }, data: { isDefault: false } });

    const vehicle = await prisma.vehicle.create({
      data: { ...req.body, isDefault, userId: req.userId! },
    });
    res.status(201).json(vehicle);
  }),
);

vehicleRouter.put(
  '/:id',
  validate(vehicleSchema),
  asyncHandler(async (req, res) => {
    await assertVehicleOwned(req.params.id, req.userId!);
    if (req.body.isDefault)
      await prisma.vehicle.updateMany({ where: { userId: req.userId! }, data: { isDefault: false } });

    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id }, data: req.body });
    res.json(vehicle);
  }),
);

vehicleRouter.post(
  '/:id/default',
  asyncHandler(async (req, res) => {
    await assertVehicleOwned(req.params.id, req.userId!);
    await prisma.vehicle.updateMany({ where: { userId: req.userId! }, data: { isDefault: false } });
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: { isDefault: true },
    });
    res.json(vehicle);
  }),
);

vehicleRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await assertVehicleOwned(req.params.id, req.userId!);
    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);
