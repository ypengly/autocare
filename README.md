# AutoCare — vehicle maintenance & expense tracker

Full-stack app for tracking fuel, maintenance, repairs, expenses and service reminders across
several vehicles.

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts + Lucide icons
- **Backend:** Node.js + Express + Prisma + PostgreSQL, JWT auth, Zod validation
- **Layout:** sidebar on desktop, bottom nav and a floating "Add record" button on phones

```
autocare/
  backend/    Express REST API, Prisma schema, migrations, seed data
  frontend/   React SPA
```

## Prerequisites

- Node.js 18+
- A PostgreSQL 14+ database you can connect to

## 1. Backend

```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init   # creates the tables
npm run seed                  # optional: demo account + realistic records
npm run dev                   # http://localhost:4000
```

### Environment variables (`backend/.env`)

| Variable | What it is |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/autocare?schema=public` |
| `JWT_SECRET` | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `PORT` | API port, default `4000` |
| `CORS_ORIGIN` | Allowed origin(s), default `http://localhost:5173` |

## 2. Frontend

```bash
cd frontend
cp .env.example .env          # leave VITE_API_URL empty to use the dev proxy
npm install
npm run dev                   # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:4000`, so nothing else is needed in development. For a
deployed build, set `VITE_API_URL` to the API's public origin.

### Demo account

After `npm run seed`:

```
demo@autocare.app / demo1234
```

Seeded with 2 vehicles, 10 fuel entries, 8 maintenance records, 5 repairs, 15 expenses and 5
reminders — including one overdue and one due soon, so the dashboard shows all three states.

## Main user flow to try

Register → Log in → Vehicles → Add vehicle → Add fuel (four fields; total is calculated) →
Add maintenance → Add expense → Add reminder → Dashboard → Analytics.

## API

All endpoints under `/api`. Everything except register, login and forgot-password requires
`Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/forgot-password` | Account access |
| GET | `/auth/me` | Current user |
| GET POST | `/vehicles` | List, create |
| GET PUT DELETE | `/vehicles/:id` | Read, update, delete |
| POST | `/vehicles/:id/default` | Set default vehicle |
| GET POST | `/fuel` `/maintenance` `/repairs` `/expenses` `/reminders` | List (filters below), create |
| PUT DELETE | `/fuel/:id` … `/reminders/:id` | Update, delete |
| POST | `/reminders/:id/complete` | Mark done, or roll a repeating reminder forward |
| GET | `/dashboard` | Totals, reminders, recent activity, monthly spend |
| GET | `/analytics` | Charts and cost metrics for a date range |
| GET | `/history` | Service timeline |
| GET | `/search?q=` | Across every record type |
| GET POST | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` | Notification centre |

List query parameters: `vehicleId`, `from`, `to`, `q`, `category`, `minCost`, `maxCost`, `take`.
Analytics accepts `range=30d|3m|6m|year|custom` plus `from`/`to` for custom.

## How the numbers are worked out

- **Fuel total** = litres × price per litre, computed server-side so the client can't send a wrong total.
- **Repair total** = parts + labour, likewise.
- **Consumption** compares consecutive odometer readings: distance between two fill-ups ÷ litres
  added at the later one. Shown as both km/L and L/100 km.
- **Reminder status** is derived on every read from the vehicle's current mileage and today's date —
  green up to date, amber within 1,000 km or 30 days, red past due. Nothing stale is stored.
- **Odometer** updates automatically when you log a record with a higher reading.
- **Double counting** is avoided: expenses filed under Fuel/Maintenance/Repairs are excluded from
  "other" so totals stay honest.

## Security

- Passwords hashed with bcrypt (cost 12); login returns the same message for unknown email and
  wrong password so the endpoint can't be used to discover accounts.
- Every record route resolves the record, then checks the owning vehicle belongs to the caller —
  an id supplied by the client is never trusted.
- Zod validates every request body; field-level messages map back onto the form inputs.
- Error responses carry a message only; stack traces and database errors stay on the server.

## Notes

- `forgot-password` returns success without sending mail — wire up your mail provider in
  `backend/src/routes/auth.ts` before using it for real.
- Receipt and vehicle photos are stored as links rather than uploads; add object storage if you
  need real file uploads.
