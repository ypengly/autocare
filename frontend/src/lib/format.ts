export const money = (n?: number | null) =>
  `$${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const moneyShort = (n?: number | null) =>
  `$${Math.round(n ?? 0).toLocaleString()}`;

export const km = (n?: number | null) => `${(n ?? 0).toLocaleString()} km`;

export const shortDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

export const dayMonth = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '-';

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
};

/** yyyy-mm-dd for <input type="date"> */
export const dateInput = (value?: string | Date | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : '';

export const today = () => new Date().toISOString().slice(0, 10);
