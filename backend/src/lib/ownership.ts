import { prisma } from './prisma.js';
import { forbidden, notFound } from './errors.js';

/** Confirms the vehicle exists AND belongs to the signed-in user. */
export async function assertVehicleOwned(vehicleId: string, userId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) throw notFound('Vehicle');
  if (vehicle.userId !== userId) throw forbidden();
  return vehicle;
}

/** Ids of every vehicle owned by the user - used to scope every query. */
export async function ownedVehicleIds(userId: string) {
  const rows = await prisma.vehicle.findMany({ where: { userId }, select: { id: true } });
  return rows.map((r) => r.id);
}
