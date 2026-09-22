import type { ReactNode } from 'react';

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'password' | 'email';
  options?: { value: string; label: string }[];
  required?: boolean;
  step?: string;
  min?: number;
  placeholder?: string;
  help?: string;
  /** Full-width on the two-column grid. */
  wide?: boolean;
  autoFocus?: boolean;
}

interface FieldProps {
  field: FieldDef;
  value: any;
  error?: string;
  onChange: (value: any) => void;
}

const base =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-steel/70 focus:border-petrol';

export function Field({ field, value, error, onChange }: FieldProps) {
  const border = error ? 'border-alert' : 'border-line';
  const id = `field-${field.name}`;

  let control: ReactNode;
  if (field.type === 'select')
    control = (
      <select id={id} className={`${base} ${border}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  else if (field.type === 'textarea')
    control = (
      <textarea
        id={id}
        rows={3}
        placeholder={field.placeholder}
        className={`${base} ${border}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  else if (field.type === 'checkbox')
    control = (
      <label className="flex items-center gap-2.5 text-sm">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 rounded border-line text-petrol focus:ring-petrol"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {field.label}
      </label>
    );
  else
    control = (
      <input
        id={id}
        type={field.type ?? 'text'}
        inputMode={field.type === 'number' ? 'decimal' : undefined}
        step={field.step}
        min={field.min}
        autoFocus={field.autoFocus}
        placeholder={field.placeholder}
        className={`${base} ${border}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );

  return (
    <div className={field.wide ? 'sm:col-span-2' : ''}>
      {field.type !== 'checkbox' && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {field.label}
          {field.required && <span className="ml-0.5 text-alert">*</span>}
        </label>
      )}
      {control}
      {error ? (
        <p className="mt-1.5 text-xs text-alert">{error}</p>
      ) : field.help ? (
        <p className="mt-1.5 text-xs text-steel">{field.help}</p>
      ) : null}
    </div>
  );
}
