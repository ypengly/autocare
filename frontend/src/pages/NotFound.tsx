import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="readout text-6xl font-700 text-petrol">404</p>
        <h1 className="mt-3 font-display text-3xl font-600">This page is not in the glovebox</h1>
        <p className="mt-2 text-sm text-steel">The link may be old, or the page may have moved.</p>
        <Link to="/app" className="mt-6 inline-block rounded-lg bg-petrol px-5 py-2.5 text-sm font-medium text-white hover:bg-petrol-dark">
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}
