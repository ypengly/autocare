import { Link } from 'react-router-dom';
import { Fuel, Wrench, Bell, BarChart3, Receipt, Gauge } from 'lucide-react';
import { Logo } from '../components/layout/Logo';

const features = [
  { icon: Fuel, title: 'Fuel log', body: 'Enter litres and price. AutoCare works out cost, consumption and cost per kilometre.' },
  { icon: Wrench, title: 'Service records', body: 'Every oil change, brake job and part replaced, with the odometer reading attached.' },
  { icon: Bell, title: 'Reminders', body: 'Due by distance, by interval or on a fixed date. The dashboard shows what is overdue.' },
  { icon: Receipt, title: 'Expenses', body: 'Insurance, parking, tolls, washing - the running cost of owning the vehicle in one place.' },
  { icon: BarChart3, title: 'Analytics', body: 'Spending by month and category, fuel efficiency over time, mileage growth.' },
  { icon: Gauge, title: 'Several vehicles', body: 'Car, motorcycle, truck. Switch between them anywhere in the app.' },
];

const steps = [
  { title: 'Add your vehicle', body: 'Make, model, year and current odometer reading. That is enough to start.' },
  { title: 'Log as you go', body: 'A fill-up takes four fields and under thirty seconds, on your phone at the pump.' },
  { title: 'Watch the numbers', body: 'Costs, efficiency and upcoming service appear on the dashboard as records build up.' },
];

export function Landing() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="text-petrol"><Logo /></span>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink hover:bg-mist">Log in</Link>
          <Link to="/register" className="rounded-lg bg-petrol px-4 py-2.5 text-sm font-medium text-white hover:bg-petrol-dark">
            Create account
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_1fr] md:py-20">
        <div>
          <h1 className="font-display text-5xl font-700 leading-[1.05] tracking-tight sm:text-6xl">
            Take better care of your vehicle
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-steel">
            Track fuel, maintenance, repairs, expenses, and reminders — all in one simple dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="rounded-lg bg-petrol px-6 py-3 font-medium text-white hover:bg-petrol-dark">
              Start tracking
            </Link>
            <Link to="/login" className="rounded-lg border border-line px-6 py-3 font-medium hover:border-steel">
              Log in
            </Link>
          </div>
          <p className="mt-4 text-sm text-steel">
            Demo account: demo@autocare.app / demo1234
          </p>
        </div>

        {/* An instrument panel, because that is what the product is. */}
        <div className="rounded-2xl border border-line bg-mist p-5 shadow-panel">
          <div className="rounded-xl bg-white p-5">
            <p className="text-sm text-steel">Toyota Camry · 2020</p>
            <p className="readout mt-1 text-5xl font-700 leading-none">85,420<span className="ml-2 text-xl text-steel">km</span></p>
            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
              {[
                ['Total spend', '$2,450'],
                ['Fuel', '$920'],
                ['Service', '$780'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-steel">{label}</dt>
                  <dd className="readout text-xl font-600">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <ul className="mt-4 space-y-2">
            {[
              ['bg-signal', 'Oil change', 'Due in 500 km'],
              ['bg-alert', 'Tire inspection', 'Overdue by 300 km'],
              ['bg-go', 'Registration', 'Due in 45 days'],
            ].map(([dot, title, detail]) => (
              <li key={title} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="flex-1 text-sm font-medium">{title}</span>
                <span className="text-sm text-steel">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-line bg-mist py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="font-display text-3xl font-600">What you can keep track of</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-5">
                <Icon className="h-5 w-5 text-petrol" />
                <h3 className="mt-3 font-display text-xl font-600">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl font-600">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-petrol pt-4">
              <p className="readout text-sm text-petrol">Step {i + 1}</p>
              <h3 className="mt-1 font-display text-xl font-600">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-steel">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-line bg-petrol py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-display text-3xl font-600">Why owners keep a log</h2>
            <ul className="mt-4 space-y-2 text-white/85">
              <li>Service on time instead of after something breaks.</li>
              <li>Know the true cost of the vehicle per kilometre, not per fill-up.</li>
              <li>Spot a drop in fuel efficiency before it turns into a repair bill.</li>
              <li>Hand a complete history to the next owner and ask a better price.</li>
            </ul>
          </div>
          <Link to="/register" className="justify-self-start rounded-lg bg-white px-6 py-3 font-medium text-petrol hover:bg-mist">
            Create your account
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-steel">
        AutoCare — vehicle maintenance and expense tracker.
      </footer>
    </div>
  );
}
