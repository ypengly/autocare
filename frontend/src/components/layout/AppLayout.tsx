import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { navItems, mobileItems } from './nav';
import { Logo } from './Logo';
import { VehicleSwitcher } from './VehicleSwitcher';
import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';
import { AddRecordButton } from './AddRecordButton';
import { useAuth } from '../../context/AuthContext';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-white px-4 py-5 md:flex">
        <NavLink to="/app" className="px-2 text-petrol">
          <Logo />
        </NavLink>

        <nav className="mt-7 flex-1 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-petrol-light font-medium text-petrol' : 'text-steel hover:bg-mist hover:text-ink'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-line pt-4">
          <p className="px-3 text-sm font-medium">{user?.name}</p>
          <p className="px-3 text-xs text-steel">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-steel hover:bg-mist hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-mist/90 px-4 py-3 backdrop-blur md:px-8">
          <NavLink to="/app" className="text-petrol md:hidden">
            <Logo className="[&_span:last-child]:text-xl" />
          </NavLink>
          <div className="ml-auto flex flex-1 items-center justify-end gap-2">
            <div className="hidden flex-1 sm:block">
              <GlobalSearch />
            </div>
            <VehicleSwitcher />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 md:px-8 md:pb-12">
          <div className="sm:hidden mb-4">
            <GlobalSearch />
          </div>
          <Outlet />
        </main>
      </div>

      <div className="md:hidden">
        <AddRecordButton />
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
          {mobileItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'text-petrol' : 'text-steel'}`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/app/expenses"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] ${isActive ? 'text-petrol' : 'text-steel'}`
            }
          >
            <span className="grid h-5 w-5 place-items-center">$</span>
            Expenses
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
