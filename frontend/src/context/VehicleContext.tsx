import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { Vehicle } from '../lib/types';
import { useAuth } from './AuthContext';

interface VehicleValue {
  vehicles: Vehicle[];
  loading: boolean;
  activeId: string | 'all';
  activeVehicle: Vehicle | null;
  setActiveId: (id: string | 'all') => void;
  refresh: () => Promise<void>;
}

const VehicleContext = createContext<VehicleValue | null>(null);
const STORAGE_KEY = 'autocare.activeVehicle';

export function VehicleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActive] = useState<string | 'all'>(() => localStorage.getItem(STORAGE_KEY) ?? 'all');

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await api.vehicles.list();
      setVehicles(list);
      setActive((current) => {
        if (current !== 'all' && list.some((v: Vehicle) => v.id === current)) return current;
        const fallback = list.find((v: Vehicle) => v.isDefault)?.id ?? list[0]?.id ?? 'all';
        return fallback;
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) refresh();
    else setVehicles([]);
  }, [user, refresh]);

  const setActiveId = useCallback((id: string | 'all') => {
    setActive(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const value = useMemo(
    () => ({
      vehicles,
      loading,
      activeId,
      activeVehicle: vehicles.find((v) => v.id === activeId) ?? null,
      setActiveId,
      refresh,
    }),
    [vehicles, loading, activeId, setActiveId, refresh],
  );

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export function useVehicles() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error('useVehicles must be used inside VehicleProvider');
  return ctx;
}
