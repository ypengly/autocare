import { Car } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';

export function VehicleSwitcher() {
  const { vehicles, activeId, setActiveId } = useVehicles();
  if (!vehicles.length) return null;

  return (
    <label className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
      <Car className="h-4 w-4 shrink-0 text-steel" aria-hidden />
      <span className="sr-only">Active vehicle</span>
      <select
        value={activeId}
        onChange={(e) => setActiveId(e.target.value)}
        className="max-w-[10rem] bg-transparent text-sm focus:outline-none sm:max-w-none"
      >
        <option value="all">All vehicles</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>
    </label>
  );
}
