import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../../lib/api';
import type { AppNotification } from '../../lib/types';
import { shortDate } from '../../lib/format';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = () =>
    api.notifications
      .list()
      .then((data) => {
        setItems(data.notifications);
        setUnread(data.unread);
      })
      .catch(() => undefined);

  useEffect(() => {
    load();
    const id = setInterval(load, 120_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const markAll = async () => {
    await api.notifications.readAll();
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg border border-line bg-white p-2.5 text-steel hover:text-ink"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-alert px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-line bg-white shadow-panel">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="font-display text-base font-600">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-petrol hover:underline">Mark all read</button>
            )}
          </header>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-steel">Nothing needs your attention.</li>}
            {items.map((n) => (
              <li key={n.id} className={`border-b border-line px-4 py-3 last:border-0 ${n.read ? '' : 'bg-mist/60'}`}>
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.level === 'overdue' ? 'bg-alert' : 'bg-signal'}`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-steel">{n.body}</p>
                    <p className="mt-0.5 text-[11px] text-steel/80">{shortDate(n.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
