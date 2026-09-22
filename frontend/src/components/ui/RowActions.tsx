import { Pencil, Trash2 } from 'lucide-react';

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button onClick={onEdit} className="rounded-lg p-2 text-steel hover:bg-mist hover:text-ink" aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <button onClick={onDelete} className="rounded-lg p-2 text-steel hover:bg-alert-light hover:text-alert" aria-label="Delete">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
