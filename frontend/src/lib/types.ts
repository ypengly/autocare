export interface User {
  id: string;
  name: string;
  email: string;
}

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'OTHER';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
  mileage: number;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  fuelType?: string | null;
  engineSize?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  isDefault: boolean;
}

interface Base {
  id: string;
  vehicleId: string;
  vehicle?: { id: string; name: string };
  date: string;
  mileage: number;
  notes?: string | null;
}

export interface FuelRecord extends Base {
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  station?: string | null;
  fuelType?: string | null;
  fullTank: boolean;
}

export interface MaintenanceRecord extends Base {
  serviceType: string;
  description?: string | null;
  cost: number;
  provider?: string | null;
  parts?: string | null;
  receiptUrl?: string | null;
}

export interface Repair extends Base {
  problem: string;
  description?: string | null;
  parts?: string | null;
  partsCost: number;
  laborCost: number;
  totalCost: number;
  shop?: string | null;
  warranty?: string | null;
  receiptUrl?: string | null;
}

export interface Expense extends Omit<Base, 'mileage'> {
  category: string;
  description?: string | null;
  amount: number;
}

export type ReminderStatus = 'ok' | 'due-soon' | 'overdue';

export interface Reminder {
  id: string;
  vehicleId: string;
  vehicle?: { id: string; name: string; mileage: number };
  title: string;
  type: 'MILEAGE' | 'TIME' | 'DATE';
  dueDate?: string | null;
  dueMileage?: number | null;
  repeatInterval?: number | null;
  repeatUnit?: string | null;
  description?: string | null;
  completed: boolean;
  status: ReminderStatus;
  dueInKm: number | null;
  dueInDays: number | null;
  summary: string;
}

export interface FuelStats {
  totalLiters: number;
  totalCost: number;
  distance: number;
  kmPerLiter: number;
  litersPer100Km: number;
  costPerKm: number;
  averagePricePerLiter: number;
  fillUps: number;
}

export interface DashboardData {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  totals: { fuel: number; maintenance: number; repairs: number; other: number; total: number };
  fuel: FuelStats;
  lastService: MaintenanceRecord | null;
  reminders: Reminder[];
  monthlySpend: { month: string; amount: number }[];
  recentActivity: { id: string; kind: string; label: string; date: string; amount: number }[];
  counts: { fuel: number; maintenance: number; repairs: number; expenses: number };
}

export interface AnalyticsData {
  range: { from: string; to: string };
  totals: { fuel: number; maintenance: number; repairs: number; other: number; total: number };
  fuel: FuelStats;
  averageMonthlyCost: number;
  costPerKm: number;
  maintenanceFrequency: number;
  byMonth: { month: string; fuel: number; maintenance: number; repairs: number; other: number }[];
  byCategory: { category: string; amount: number }[];
  consumption: { date: string; kmPerLiter: number; litersPer100Km: number; pricePerLiter: number }[];
  mileageGrowth: { date: string; mileage: number }[];
  maintenanceCosts: { serviceType: string; cost: number; count: number }[];
}

export interface TimelineEntry {
  id: string;
  kind: 'maintenance' | 'repair';
  date: string;
  mileage: number;
  title: string;
  detail: string;
  amount: number;
  vehicle: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  level: string;
  read: boolean;
  createdAt: string;
}
