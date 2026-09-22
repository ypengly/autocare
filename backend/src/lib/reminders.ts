import type { Reminder, Vehicle } from '@prisma/client';

export type ReminderStatus = 'ok' | 'due-soon' | 'overdue';

export interface ReminderView extends Reminder {
  status: ReminderStatus;
  dueInKm: number | null;
  dueInDays: number | null;
  summary: string;
}

const DAY = 86_400_000;
const SOON_KM = 1_000;
const SOON_DAYS = 30;

/** Derives live status from current mileage and today's date - never stored. */
export function describeReminder(
  reminder: Reminder,
  vehicle: Pick<Vehicle, 'mileage'>,
): ReminderView {
  const dueInKm = reminder.dueMileage != null ? reminder.dueMileage - vehicle.mileage : null;
  const dueInDays =
    reminder.dueDate != null
      ? Math.ceil((new Date(reminder.dueDate).getTime() - Date.now()) / DAY)
      : null;

  let status: ReminderStatus = 'ok';
  if ((dueInKm != null && dueInKm < 0) || (dueInDays != null && dueInDays < 0)) status = 'overdue';
  else if ((dueInKm != null && dueInKm <= SOON_KM) || (dueInDays != null && dueInDays <= SOON_DAYS))
    status = 'due-soon';
  if (reminder.completed) status = 'ok';

  let summary = 'No due point set';
  if (dueInKm != null)
    summary =
      dueInKm < 0
        ? `Overdue by ${Math.abs(dueInKm).toLocaleString()} km`
        : `Due in ${dueInKm.toLocaleString()} km`;
  else if (dueInDays != null)
    summary = dueInDays < 0 ? `Overdue by ${Math.abs(dueInDays)} days` : `Due in ${dueInDays} days`;

  return { ...reminder, status, dueInKm, dueInDays, summary };
}
