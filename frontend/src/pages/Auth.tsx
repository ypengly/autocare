import { useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/layout/Logo';
import { api, ApiError } from '../lib/api';
import { useToast } from '../context/ToastContext';

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-petrol p-10 text-white md:flex">
        <Logo />
        <div>
          <p className="font-display text-4xl font-600 leading-tight">
            Every fill-up, service and repair in one history.
          </p>
          <p className="mt-4 max-w-sm text-white/80">
            AutoCare turns the receipts in your glovebox into numbers you can act on.
          </p>
        </div>
        <p className="text-sm text-white/60">Demo account: demo@autocare.app / demo1234</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="text-petrol md:hidden"><Logo /></Link>
          <h1 className="mt-6 font-display text-3xl font-600 md:mt-0">{title}</h1>
          <p className="mt-1.5 text-sm text-steel">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

const input = 'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-petrol';

export function Login() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Log in" subtitle="Pick up where you left off.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
          <input id="email" type="email" autoComplete="email" className={input} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
          <input id="password" type="password" autoComplete="current-password" className={input} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        {error && <p className="rounded-lg bg-alert-light px-3 py-2 text-sm text-alert">{error}</p>}
        <Button type="submit" loading={busy} className="w-full">Log in</Button>
      </form>

      <div className="mt-5 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-petrol hover:underline">Forgot password</Link>
        <Link to="/register" className="text-petrol hover:underline">Create an account</Link>
      </div>
    </Shell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await register(form.name, form.email, form.password);
      navigate('/app');
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields ?? { form: err.message });
      else setErrors({ form: 'Could not create your account' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Create your account" subtitle="Free, and your records stay yours.">
      <form onSubmit={submit} className="space-y-4">
        {(['name', 'email', 'password'] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className="mb-1.5 block text-sm font-medium capitalize">{field}</label>
            <input
              id={field}
              type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              autoComplete={field === 'password' ? 'new-password' : field}
              className={`${input} ${errors[field] ? 'border-alert' : ''}`}
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              required
            />
            {errors[field] && <p className="mt-1.5 text-xs text-alert">{errors[field]}</p>}
          </div>
        ))}
        <p className="text-xs text-steel">At least 8 characters, with a letter and a number.</p>
        {errors.form && <p className="rounded-lg bg-alert-light px-3 py-2 text-sm text-alert">{errors.form}</p>}
        <Button type="submit" loading={busy} className="w-full">Create account</Button>
      </form>

      <p className="mt-5 text-sm text-steel">
        Already have an account? <Link to="/login" className="text-petrol hover:underline">Log in</Link>
      </p>
    </Shell>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch {
      notify('Could not send the reset link', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Reset your password" subtitle="We will email you a link to set a new one.">
      {sent ? (
        <div className="rounded-xl bg-petrol-light px-4 py-4 text-sm text-petrol">
          If that email is registered, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input id="reset-email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <Button type="submit" loading={busy} className="w-full">Send reset link</Button>
        </form>
      )}
      <p className="mt-5 text-sm">
        <Link to="/login" className="text-petrol hover:underline">Back to log in</Link>
      </p>
    </Shell>
  );
}
