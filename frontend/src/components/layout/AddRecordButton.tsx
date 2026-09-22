import { useEffect, useRef, useState } from 'react';
import { Plus, Fuel, Wrench, ScrollText, Receipt, Bell } from 'lucide-react';
import { useRecordSheet } from '../../context/RecordSheetContext';
import type { RecordKind } from '../../lib/recordFields';

const choices: { kind: RecordKind; label: string; icon: typeof Fuel }[] = [
  { kind: 'fuel', label: 'Add fuel', icon: Fuel },
  { kind: 'maintenance', label: 'Add maintenance', icon: Wrench },
  { kind: 'repair', label: 'Add repair', icon: ScrollText },
  { kind: 'expense', label: 'Add expense', icon: Receipt },
  { kind: 'reminder', label: 'Add reminder', icon: Bell },
];

export function AddRecordButton() {
  const { openRecord } = useRecordSheet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed bottom-20 right-4 z-30 md:sticky md:bottom-auto md:right-auto md:z-auto"
    >
      {open && (
        <ul className="absolute bottom-16 right-0 w-52 overflow-hidden rounded-xl border border-line bg-white shadow-panel md:bottom-auto md:left-0 md:top-14 md:right-auto">
          {choices.map(({ kind, label, icon: Icon }) => (
            <li key={kind}>
              <button
                onClick={() => {
                  openRecord(kind);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-mist"
              >
                <Icon className="h-4 w-4 text-petrol" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-petrol text-white shadow-panel transition-transform hover:bg-petrol-dark active:scale-95 md:h-auto md:w-full md:gap-2 md:rounded-lg md:px-4 md:py-2.5 md:text-sm md:font-medium"
      >
        <Plus className={`h-6 w-6 transition-transform md:h-4 md:w-4 ${open ? 'rotate-45' : ''}`} />
        <span className="hidden md:inline">Add record</span>
        <span className="sr-only md:hidden">Add record</span>
      </button>
    </div>
  );
}
