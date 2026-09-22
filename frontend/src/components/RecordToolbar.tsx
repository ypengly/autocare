import { Filter } from 'lucide-react';

export interface Filters {
  q: string;
  from: string;
  to: string;
  category: string;
  minCost: string;
  maxCost: string;
}

export const emptyFilters: Filters = { q: '', from: '', to: '', category: '', minCost: '', maxCost: '' };

export function RecordToolbar({
  filters,
  onChange,
  categories,
  categoryLabel = 'Category',
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  categories?: string[];
  categoryLabel?: string;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const input = 'rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-petrol';

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm text-steel">
        <Filter className="h-4 w-4" />
        Filter
      </span>
      <input
        className={input}
        placeholder="Search in these records"
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
        aria-label="Search records"
      />
      <input type="date" className={input} value={filters.from} onChange={(e) => set({ from: e.target.value })} aria-label="From date" />
      <input type="date" className={input} value={filters.to} onChange={(e) => set({ to: e.target.value })} aria-label="To date" />
      {categories && (
        <select className={input} value={filters.category} onChange={(e) => set({ category: e.target.value })} aria-label={categoryLabel}>
          <option value="">All {categoryLabel.toLowerCase()}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}
      <input
        type="number"
        className={`${input} w-28`}
        placeholder="Min cost"
        value={filters.minCost}
        onChange={(e) => set({ minCost: e.target.value })}
        aria-label="Minimum cost"
      />
      <input
        type="number"
        className={`${input} w-28`}
        placeholder="Max cost"
        value={filters.maxCost}
        onChange={(e) => set({ maxCost: e.target.value })}
        aria-label="Maximum cost"
      />
      {Object.values(filters).some(Boolean) && (
        <button onClick={() => onChange(emptyFilters)} className="text-sm text-petrol hover:underline">
          Clear
        </button>
      )}
    </div>
  );
}
