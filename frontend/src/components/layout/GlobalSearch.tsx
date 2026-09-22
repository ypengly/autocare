import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../lib/api';
import { money, shortDate } from '../../lib/format';

interface Result {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  date: string | null;
  amount: number | null;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) return setResults([]);
    const id = setTimeout(() => {
      api.search(query.trim()).then((d) => setResults(d.results)).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative flex-1 md:max-w-sm" ref={ref}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden />
      <input
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder="Search records"
        aria-label="Search all records"
        className="w-full rounded-lg border border-line bg-white py-2.5 pl-9 pr-3 text-sm focus:border-petrol"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-line bg-white shadow-panel">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-steel">No records match “{query}”.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((r) => (
                <li key={`${r.kind}-${r.id}`} className="border-b border-line px-4 py-3 last:border-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    {r.amount != null && <span className="readout text-sm">{money(r.amount)}</span>}
                  </div>
                  <p className="text-xs capitalize text-steel">
                    {r.kind}
                    {r.subtitle ? ` · ${r.subtitle}` : ''}
                    {r.date ? ` · ${shortDate(r.date)}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
