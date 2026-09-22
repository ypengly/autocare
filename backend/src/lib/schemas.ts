import { z } from 'zod';

const money = z.coerce.number().min(0, 'Cost cannot be negative');
const mileage = z.coerce.number().int('Mileage must be a whole number').min(0, 'Mileage cannot be negative');
const date = z.coerce.date({ invalid_type_error: 'Pick a valid date' });
const optionalText = z.string().trim().max(2000).optional().nullable();

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .regex(/[A-Za-z]/, 'Include at least one letter')
    .regex(/[0-9]/, 'Include at least one number'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const vehicleSchema = z.object({
  name: z.string().trim().min(1, 'Name this vehicle'),
  type: z.enum(['CAR', 'MOTORCYCLE', 'TRUCK', 'OTHER']).default('CAR'),
  make: z.string().trim().min(1, 'Enter the make'),
  model: z.string().trim().min(1, 'Enter the model'),
  year: z.coerce.number().int().min(1900, 'Year looks too early').max(new Date().getFullYear() + 1),
  licensePlate: optionalText,
  vin: optionalText,
  mileage,
  purchaseDate: date.optional().nullable(),
  purchasePrice: money.optional().nullable(),
  fuelType: optionalText,
  engineSize: optionalText,
  notes: optionalText,
  imageUrl: optionalText,
  isDefault: z.coerce.boolean().optional(),
});

export const fuelSchema = z.object({
  vehicleId: z.string().min(1, 'Pick a vehicle'),
  date,
  mileage,
  liters: z.coerce.number().positive('Fuel amount must be more than zero'),
  pricePerLiter: z.coerce.number().positive('Price must be more than zero'),
  station: optionalText,
  fuelType: optionalText,
  fullTank: z.coerce.boolean().optional(),
  notes: optionalText,
});

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Pick a vehicle'),
  date,
  mileage,
  serviceType: z.string().trim().min(1, 'Pick a service type'),
  description: optionalText,
  cost: money,
  provider: optionalText,
  parts: optionalText,
  notes: optionalText,
  receiptUrl: optionalText,
});

export const repairSchema = z.object({
  vehicleId: z.string().min(1, 'Pick a vehicle'),
  date,
  mileage,
  problem: z.string().trim().min(1, 'Describe the problem'),
  description: optionalText,
  parts: optionalText,
  partsCost: money,
  laborCost: money,
  shop: optionalText,
  warranty: optionalText,
  notes: optionalText,
  receiptUrl: optionalText,
});

export const expenseSchema = z.object({
  vehicleId: z.string().min(1, 'Pick a vehicle'),
  date,
  category: z.string().trim().min(1, 'Pick a category'),
  description: optionalText,
  amount: z.coerce.number().positive('Amount must be more than zero'),
  notes: optionalText,
});

export const reminderSchema = z
  .object({
    vehicleId: z.string().min(1, 'Pick a vehicle'),
    title: z.string().trim().min(1, 'Give the reminder a title'),
    type: z.enum(['MILEAGE', 'TIME', 'DATE']).default('MILEAGE'),
    dueDate: date.optional().nullable(),
    dueMileage: mileage.optional().nullable(),
    repeatInterval: z.coerce.number().int().positive().optional().nullable(),
    repeatUnit: optionalText,
    description: optionalText,
    completed: z.coerce.boolean().optional(),
  })
  .refine((v) => (v.type === 'MILEAGE' ? v.dueMileage != null : v.dueDate != null), {
    message: 'Mileage reminders need a due mileage; date reminders need a due date',
    path: ['dueMileage'],
  });
