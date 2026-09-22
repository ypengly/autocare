import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
  /** Hidden on narrow screens where the card view takes over. */
  secondary?: boolean;
}

/**
 * Table on desktop, stacked cards on phones - the same data either way.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  actions,
}: {
  columns: Column<T>[];
  rows: T[];
  actions?: (row: T) => ReactNode;
}) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-steel">
              {columns.map((c) => (
                <th key={c.key} className={`px-5 py-3 font-medium ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.header}
                </th>
              ))}
              {actions && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-mist/60">
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-3.5 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                    {c.render(row)}
                  </td>
                ))}
                {actions && <td className="px-5 py-3.5 text-right">{actions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                {columns
                  .filter((c) => !c.secondary)
                  .map((c) => (
                    <div key={c.key} className="flex items-baseline justify-between gap-3">
                      <span className="text-xs text-steel">{c.header}</span>
                      <span className="truncate text-sm">{c.render(row)}</span>
                    </div>
                  ))}
              </div>
              {actions && <div className="shrink-0">{actions(row)}</div>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
