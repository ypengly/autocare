import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';
import { asyncHandler } from '../lib/validate.js';
import { describeReminder } from '../lib/reminders.js';
import { notFound, forbidden } from '../lib/errors.js';

export const notificationRouter = Router();
notificationRouter.use(requireAuth);

/**
 * Notifications are generated from live reminder status on read, then stored
 * once so read/unread state survives a refresh.
 */
notificationRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.userId!;
    const reminders = await prisma.reminder.findMany({
      where: { completed: false, vehicle: { userId } },
      include: { vehicle: { select: { id: true, name: true, mileage: true } } },
    });

    const due = reminders
      .map((r) => ({ reminder: r, view: describeReminder(r, r.vehicle) }))
      .filter(({ view }) => view.status !== 'ok');

    for (const { reminder, view } of due) {
      const existing = await prisma.notification.findFirst({
        where: { userId, reminderId: reminder.id, body: view.summary },
      });
      if (!existing)
        await prisma.notification.create({
          data: {
            userId,
            reminderId: reminder.id,
            title: `${reminder.title} - ${reminder.vehicle.name}`,
            body: view.summary,
            level: view.status === 'overdue' ? 'overdue' : 'due-soon',
          },
        });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ notifications, unread: notifications.filter((n) => !n.read).length });
  }),
);

notificationRouter.post(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const found = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!found) throw notFound('Notification');
    if (found.userId !== req.userId) throw forbidden();
    res.json(await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } }));
  }),
);

notificationRouter.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({ where: { userId: req.userId! }, data: { read: true } });
    res.json({ ok: true });
  }),
);
