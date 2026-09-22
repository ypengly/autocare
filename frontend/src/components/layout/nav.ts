import {
  BarChart3, Bell, Car, Fuel, LayoutDashboard, Receipt, Settings, History, Wrench, ScrollText,
} from 'lucide-react';

export const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/vehicles', label: 'Vehicles', icon: Car },
  { to: '/app/fuel', label: 'Fuel', icon: Fuel },
  { to: '/app/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/app/repairs', label: 'Repairs', icon: ScrollText },
  { to: '/app/expenses', label: 'Expenses', icon: Receipt },
  { to: '/app/reminders', label: 'Reminders', icon: Bell },
  { to: '/app/history', label: 'Service history', icon: History },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

/** The five destinations that matter on a phone. */
export const mobileItems = navItems.filter((i) =>
  ['/app', '/app/fuel', '/app/maintenance', '/app/reminders'].includes(i.to),
);
