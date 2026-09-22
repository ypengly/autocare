import { useEffect, useState, type ReactNode } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, type FieldDef } from './fields';
import { ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface Props {
  open: boolean;
  title: string;
  fields: FieldDef[];
  initial: Record<string, any>;
  submitLabel?: string;
  successMessage: string;
  /** Live preview of calculated values (totals, efficiency) above the buttons. */
  preview?: (values: Record<string, any>) => ReactNode;
  onSubmit: (values: Record<string, any>) => Promise<unknown>;
  onDone: () => void;
  onClose: () => void;
}

/**
 * One form component drives every record type. Pages describe their fields;
 * validation errors returned by the API are mapped back onto those fields.
 */
export function RecordForm({
  open, title, fields, initial, submitLabel = 'Save', successMessage, preview, onSubmit, onDone, onClose,
}: Props) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    if (open) {
      setValues(initial);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (name: string, value: any) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: '' }));
  };

  const submit = async () => {
    // Client-side pass first, so obvious mistakes never reach the network.
    const found: Record<string, string> = {};
    for (const f of fields) {
      const value = values[f.name];
      if (f.required && (value === '' || value == null)) found[f.name] = `${f.label} is required`;
      if (f.type === 'number' && value !== '' && value != null) {
        const n = Number(value);
        if (Number.isNaN(n)) found[f.name] = 'Enter a number';
        else if (f.min != null && n < f.min) found[f.name] = `${f.label} cannot be below ${f.min}`;
      }
    }
    if (Object.keys(found).length) return setErrors(found);

    setBusy(true);
    try {
      await onSubmit(values);
      notify(successMessage);
      onDone();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      notify(err instanceof Error ? err.message : 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy}>{submitLabel}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Field key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => set(f.name, v)} />
        ))}
      </div>
      {preview && <div className="mt-5 rounded-xl bg-petrol-light px-4 py-3">{preview(values)}</div>}
    </Modal>
  );
}
