import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler, validate } from '../lib/validate.js';
import { reminderSchema } from '../lib/schemas.js';
import { assertVehicleOwned, ownedVehicleIds } from '../lib/ownership.js';
import { forbidden, notFound } from '../lib/errors.js';
import { describeReminder } from '../lib/reminders.js';

export const reminderRouter = Router();
reminderRouter.use(requireAuth);

reminderRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const ids = await ownedVehicleIds(req.userId!);
    const { vehicleId, q } = req.query as Record<string, string>;
    if (vehicleId && !ids.includes(vehicleId)) throw forbidden();

    const reminders = await prisma.reminder.findMany({
      where: {
        vehicleId: vehicleId ? vehicleId : { in: ids },
        ...(q && { title: { contains: q, mode: 'insensitive' } }),
      },
      include: { vehicle: { select: { id: true, name: true, mileage: true } } },
      orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }],
    });

    res.json(reminders.map((r) => describeReminder(r, r.vehicle)));
  }),
);

reminderRouter.post(
  '/',
  validate(reminderSchema),
  asyncHandler(async (req, res) => {
    await assertVehicleOwned(req.body.vehicleId, req.userId!);
    const reminder = await prisma.reminder.create({ data: req.body });
    res.status(201).json(reminder);
  }),
);

reminderRouter.put(
  '/:id',
  validate(reminderSchema),
  asyncHandler(async (req, res) => {
    const existing = await prisma.reminder.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Reminder');
    await assertVehicleOwned(existing.vehicleId, req.userId!);
    await assertVehicleOwned(req.body.vehicleId, req.userId!);
    const reminder = await prisma.reminder.update({ where: { id: req.params.id }, data: req.body });
    res.json(reminder);
  }),
);

reminderRouter.post(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    const existing = await prisma.reminder.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Reminder');
    await assertVehicleOwned(existing.vehicleId, req.userId!);

    // Repeating reminders roll forward instead of closing.
    const data: any = { completed: true };
    if (existing.repeatInterval) {
      if (existing.type === 'MILEAGE' && existing.dueMileage != null) {
        data.completed = false;
        data.dueMileage = existing.dueMileage + existing.repeatInterval;
      } else if (existing.dueDate) {
        const next = new Date(existing.dueDate);
        const unit = existing.repeatUnit ?? 'months';
        if (unit === 'days') next.setDate(next.getDate() + existing.repeatInterval);
        else if (unit === 'years') next.setFullYear(next.getFullYear() + existing.repeatInterval);
        else next.setMonth(next.getMonth() + existing.repeatInterval);
        data.completed = false;
        data.dueDate = next;
      }
    }
    const reminder = await prisma.reminder.update({ where: { id: req.params.id }, data });
    res.json(reminder);
  }),
);

reminderRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const existing = await prisma.reminder.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound('Reminder');
    await assertVehicleOwned(existing.vehicleId, req.userId!);
    await prisma.reminder.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);
