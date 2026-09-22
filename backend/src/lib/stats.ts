import type { Expense, FuelRecord, MaintenanceRecord, Repair } from '@prisma/client';

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/**
 * Fuel efficiency from consecutive fill-ups: distance between two
 * odometer readings divided by the litres added at the later one.
 */
export function fuelStats(records: FuelRecord[]) {
  const ordered = [...records].sort((a, b) => a.mileage - b.mileage);
  const totalLiters = sum(ordered.map((r) => r.liters));
  const totalCost = sum(ordered.map((r) => r.totalCost));

  let distance = 0;
  let litersForEfficiency = 0;
  for (let i = 1; i < ordered.length; i++) {
    const leg = ordered[i].mileage - ordered[i - 1].mileage;
    if (leg <= 0) continue;
    distance += leg;
    litersForEfficiency += ordered[i].liters;
  }

  const kmPerLiter = litersForEfficiency > 0 ? distance / litersForEfficiency : 0;
  return {
    totalLiters: round2(totalLiters),
    totalCost: round2(totalCost),
    distance,
    kmPerLiter: round2(kmPerLiter),
    litersPer100Km: kmPerLiter > 0 ? round2(100 / kmPerLiter) : 0,
    costPerKm: distance > 0 ? round2(totalCost / distance) : 0,
    averagePricePerLiter: totalLiters > 0 ? round2(totalCost / totalLiters) : 0,
    fillUps: ordered.length,
  };
}

export interface CostBuckets {
  fuel: number;
  maintenance: number;
  repairs: number;
  other: number;
  total: number;
}

export function costBuckets(
  fuel: FuelRecord[],
  maintenance: MaintenanceRecord[],
  repairs: Repair[],
  expenses: Expense[],
): CostBuckets {
  // Expenses logged under fuel/maintenance/repair categories are left out of
  // "other" so the same money is never counted twice.
  const mirrored = new Set(['Fuel', 'Maintenance', 'Repairs']);
  const f = sum(fuel.map((r) => r.totalCost));
  const m = sum(maintenance.map((r) => r.cost));
  const r = sum(repairs.map((x) => x.totalCost));
  const o = sum(expenses.filter((e) => !mirrored.has(e.category)).map((e) => e.amount));
  return {
    fuel: round2(f),
    maintenance: round2(m),
    repairs: round2(r),
    other: round2(o),
    total: round2(f + m + r + o),
  };
}
