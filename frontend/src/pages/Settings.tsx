import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { vehicles, activeId, setActiveId } = useVehicles();

  return (
    <>
      <PageHeader title="Settings" subtitle="Your account and app preferences." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Account">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-steel">Name</dt>
              <dd>{user?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-steel">Email</dt>
              <dd>{user?.email}</dd>
            </div>
          </dl>
          <Button variant="secondary" className="mt-5" onClick={logout}>Sign out</Button>
        </Card>

        <Card title="Default vehicle in this browser">
          <p className="text-sm text-steel">
            Pages open with this vehicle selected. Switch any time from the header.
          </p>
          <select
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className="mt-4 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-petrol"
            aria-label="Vehicle shown by default"
          >
            <option value="all">All vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </Card>

        <Card title="Units">
          <p className="text-sm text-steel">
            Distances are in kilometres and fuel in litres. Consumption is shown both ways: km/L and
            L/100 km.
          </p>
        </Card>

        <Card title="Your data">
          <p className="text-sm text-steel">
            Records are tied to your account and are never visible to other users. Deleting a vehicle
            deletes its records with it.
          </p>
        </Card>
      </div>
    </>
  );
}
