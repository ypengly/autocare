import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000);
const round2 = (n: number) => Math.round(n * 100) / 100;

async function main() {
  const email = 'demo@autocare.app';
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: { name: 'John Mendez', email, password: await bcrypt.hash('demo1234', 12) },
  });

  const camry = await prisma.vehicle.create({
    data: {
      userId: user.id,
      name: 'Daily Camry',
      type: 'CAR',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      licensePlate: '2AB-4471',
      vin: '4T1BF1FK5LU123456',
      mileage: 85_420,
      purchaseDate: new Date('2021-03-14'),
      purchasePrice: 21_500,
      fuelType: 'Gasoline 95',
      engineSize: '2.5 L',
      isDefault: true,
      notes: 'Family car. Serviced at Sok Lim Auto.',
    },
  });

  const pcx = await prisma.vehicle.create({
    data: {
      userId: user.id,
      name: 'City PCX',
      type: 'MOTORCYCLE',
      make: 'Honda',
      model: 'PCX 160',
      year: 2022,
      licensePlate: '1CD-8820',
      mileage: 18_340,
      purchaseDate: new Date('2022-08-02'),
      purchasePrice: 3_900,
      fuelType: 'Gasoline 95',
      engineSize: '156 cc',
      notes: 'Commuter bike.',
    },
  });

  // --- Fuel: 10 records across both vehicles, mileage climbing realistically.
  const fuel = [
    { v: camry, d: 128, km: 80_150, l: 44.2, p: 1.18, s: 'Total Chamkarmon' },
    { v: camry, d: 112, km: 80_790, l: 42.8, p: 1.2, s: 'Caltex Monivong' },
    { v: camry, d: 96, km: 81_460, l: 45.1, p: 1.22, s: 'Total Chamkarmon' },
    { v: camry, d: 78, km: 82_180, l: 46.3, p: 1.21, s: 'PTT Russian Blvd' },
    { v: camry, d: 60, km: 82_930, l: 44.9, p: 1.25, s: 'Caltex Monivong' },
    { v: camry, d: 41, km: 83_720, l: 47.0, p: 1.26, s: 'Total Chamkarmon' },
    { v: camry, d: 22, km: 84_560, l: 48.2, p: 1.24, s: 'PTT Russian Blvd' },
    { v: camry, d: 4, km: 85_310, l: 45.6, p: 1.27, s: 'Total Chamkarmon' },
    { v: pcx, d: 26, km: 17_810, l: 6.1, p: 1.24, s: 'Caltex Toul Kork' },
    { v: pcx, d: 9, km: 18_240, l: 6.4, p: 1.26, s: 'Caltex Toul Kork' },
  ];
  for (const f of fuel) {
    await prisma.fuelRecord.create({
      data: {
        vehicleId: f.v.id,
        date: daysAgo(f.d),
        mileage: f.km,
        liters: f.l,
        pricePerLiter: f.p,
        totalCost: round2(f.l * f.p),
        station: f.s,
        fuelType: 'Gasoline 95',
        fullTank: true,
      },
    });
  }

  // --- Maintenance: 8 records.
  const maintenance = [
    { v: camry, d: 6, km: 85_000, t: 'Oil change', c: 45, p: 'Sok Lim Auto', parts: '5W-30 synthetic, oil filter' },
    { v: camry, d: 58, km: 82_500, t: 'Tire replacement', c: 320, p: 'Kim Tire Center', parts: '4x 215/55 R17' },
    { v: camry, d: 127, km: 79_200, t: 'Battery replacement', c: 110, p: 'Sok Lim Auto', parts: '12V 60Ah' },
    { v: camry, d: 196, km: 76_400, t: 'Brake service', c: 185, p: 'Sok Lim Auto', parts: 'Front pads, rotor resurface' },
    { v: camry, d: 243, km: 74_100, t: 'Air filter', c: 22, p: 'Sok Lim Auto', parts: 'Engine air filter' },
    { v: camry, d: 310, km: 70_800, t: 'Transmission service', c: 240, p: 'Toyota Cambodia', parts: 'ATF WS 6L' },
    { v: pcx, d: 34, km: 17_600, t: 'Oil change', c: 14, p: 'Honda Toul Kork', parts: '10W-30, drain washer' },
    { v: pcx, d: 150, km: 14_900, t: 'Coolant', c: 18, p: 'Honda Toul Kork', parts: 'Long-life coolant 1L' },
  ];
  for (const m of maintenance) {
    await prisma.maintenanceRecord.create({
      data: {
        vehicleId: m.v.id, date: daysAgo(m.d), mileage: m.km, serviceType: m.t,
        cost: m.c, provider: m.p, parts: m.parts,
        description: `${m.t} carried out at ${m.p}.`,
      },
    });
  }

  // --- Repairs: 5 records.
  const repairs = [
    { v: camry, d: 47, km: 83_400, prob: 'AC blowing warm', parts: 'Compressor relay, refrigerant', pc: 95, lc: 60, shop: 'Sok Lim Auto', w: '6 months' },
    { v: camry, d: 88, km: 81_700, prob: 'Rear wiper motor dead', parts: 'Wiper motor', pc: 48, lc: 25, shop: 'Sok Lim Auto', w: '3 months' },
    { v: camry, d: 172, km: 77_900, prob: 'Alternator whine', parts: 'Alternator (reman)', pc: 210, lc: 90, shop: 'Toyota Cambodia', w: '12 months' },
    { v: pcx, d: 66, km: 16_800, prob: 'Front brake lever sticking', parts: 'Lever, cable', pc: 16, lc: 10, shop: 'Honda Toul Kork', w: '1 month' },
    { v: pcx, d: 210, km: 13_400, prob: 'Flat rear tyre after nail', parts: 'Tube patch, valve', pc: 8, lc: 6, shop: 'Roadside, St. 271', w: 'None' },
  ];
  for (const r of repairs) {
    await prisma.repair.create({
      data: {
        vehicleId: r.v.id, date: daysAgo(r.d), mileage: r.km, problem: r.prob,
        description: `Diagnosed and repaired at ${r.shop}.`, parts: r.parts,
        partsCost: r.pc, laborCost: r.lc, totalCost: round2(r.pc + r.lc),
        shop: r.shop, warranty: r.w,
      },
    });
  }

  // --- Expenses: 15 records outside fuel/maintenance/repairs.
  const expenses = [
    { v: camry, d: 2, c: 'Washing', a: 10, t: 'Full wash and vacuum' },
    { v: camry, d: 12, c: 'Parking', a: 18, t: 'Monthly parking - Aeon 1' },
    { v: camry, d: 19, c: 'Tolls', a: 6.5, t: 'Sihanoukville expressway' },
    { v: camry, d: 30, c: 'Insurance', a: 420, t: 'Annual comprehensive premium' },
    { v: camry, d: 44, c: 'Accessories', a: 65, t: 'Dash cam mount and cable' },
    { v: camry, d: 57, c: 'Washing', a: 10, t: 'Full wash' },
    { v: camry, d: 73, c: 'Registration', a: 95, t: 'Annual road tax' },
    { v: camry, d: 91, c: 'Parking', a: 18, t: 'Monthly parking - Aeon 1' },
    { v: camry, d: 104, c: 'Tolls', a: 6.5, t: 'Expressway return trip' },
    { v: camry, d: 133, c: 'Other', a: 35, t: 'Interior detailing spray kit' },
    { v: pcx, d: 8, c: 'Washing', a: 3, t: 'Bike wash' },
    { v: pcx, d: 21, c: 'Parking', a: 6, t: 'Monthly bike parking' },
    { v: pcx, d: 52, c: 'Insurance', a: 85, t: 'Third-party cover' },
    { v: pcx, d: 98, c: 'Accessories', a: 42, t: 'Phone holder and USB charger' },
    { v: pcx, d: 140, c: 'Registration', a: 25, t: 'Plate renewal' },
  ];
  for (const e of expenses) {
    await prisma.expense.create({
      data: { vehicleId: e.v.id, date: daysAgo(e.d), category: e.c, amount: e.a, description: e.t },
    });
  }

  // --- Reminders: one of each state so the dashboard shows green, amber, red.
  await prisma.reminder.createMany({
    data: [
      { vehicleId: camry.id, title: 'Oil change', type: 'MILEAGE', dueMileage: 90_000, repeatInterval: 5_000, description: 'Every 5,000 km with filter.' },
      { vehicleId: camry.id, title: 'Tire rotation', type: 'MILEAGE', dueMileage: 85_120, repeatInterval: 10_000, description: 'Overdue - book at Kim Tire Center.' },
      { vehicleId: camry.id, title: 'Registration renewal', type: 'DATE', dueDate: daysAhead(21), description: 'Road tax expires.' },
      { vehicleId: camry.id, title: 'Insurance renewal', type: 'TIME', dueDate: daysAhead(120), repeatInterval: 12, repeatUnit: 'months' },
      { vehicleId: pcx.id, title: 'Oil change', type: 'MILEAGE', dueMileage: 18_600, repeatInterval: 3_000, description: 'Every 3,000 km.' },
    ],
  });

  console.log('Seeded demo account: demo@autocare.app / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
