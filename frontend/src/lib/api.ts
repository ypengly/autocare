const BASE = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'autocare.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    tokenStore.clear();
    if (!location.pathname.startsWith('/login')) location.assign('/login');
    throw new ApiError(401, 'Your session has expired. Sign in again.');
  }
  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.message ?? 'Request failed', body.fields);
  return body as T;
}

const qs = (params: Record<string, unknown> = {}) => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
  const str = search.toString();
  return str ? `?${str}` : '';
};

/** One typed CRUD surface per resource, so pages never build URLs themselves. */
function resource<T>(path: string) {
  return {
    list: (params?: Record<string, unknown>) => request<T[]>(`${path}${qs(params)}`),
    create: (data: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      request<T>(`${path}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`${path}/${id}`, { method: 'DELETE' }),
  };
}

export const api = {
  request,
  auth: {
    register: (data: unknown) => request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: unknown) => request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<{ user: any }>('/auth/me'),
    forgotPassword: (email: string) =>
      request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  },
  vehicles: {
    ...resource<any>('/vehicles'),
    setDefault: (id: string) => request<any>(`/vehicles/${id}/default`, { method: 'POST' }),
  },
  fuel: resource<any>('/fuel'),
  maintenance: resource<any>('/maintenance'),
  repairs: resource<any>('/repairs'),
  expenses: resource<any>('/expenses'),
  reminders: {
    ...resource<any>('/reminders'),
    complete: (id: string) => request<any>(`/reminders/${id}/complete`, { method: 'POST' }),
  },
  dashboard: (params?: Record<string, unknown>) => request<any>(`/dashboard${qs(params)}`),
  analytics: (params?: Record<string, unknown>) => request<any>(`/analytics${qs(params)}`),
  history: (params?: Record<string, unknown>) => request<any>(`/history${qs(params)}`),
  notifications: {
    list: () => request<any>('/notifications'),
    read: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
    readAll: () => request<any>('/notifications/read-all', { method: 'POST' }),
  },
  search: (q: string) => request<{ results: any[] }>(`/search${qs({ q })}`),
};
