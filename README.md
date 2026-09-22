# 🚗 AutoCare

<div align="center">

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-22B5BF?style=for-the-badge)
![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![Zod](https://img.shields.io/badge/Validation-Zod-3E67B1?style=for-the-badge)

**A vehicle maintenance & expense tracker.**

*Fuel · Maintenance · Repairs · Expenses · Service reminders — across multiple vehicles*

[✨ Overview](#-overview) • [🚀 Setup](#-1-backend) • [📡 API](#-api) • [🧮 How the Numbers Work](#-how-the-numbers-are-worked-out) • [🔐 Security](#-security)

</div>

---

## 📖 Overview

**AutoCare** is a full-stack app for tracking **fuel, maintenance, repairs, expenses, and service reminders** across several vehicles.

Everything that matters is calculated **server-side** — from fuel totals to consumption to reminder status — so the numbers are always honest.

### Core Idea

> **The server owns the math. The client owns the interface.**
>
> No client-supplied total is ever trusted. No stale status is ever stored. Every reminder is derived on read.

---

## ✨ Features

<div align="center">

| 🚗 Multi-Vehicle | ⛽ Fuel Tracking |
|:---:|:---:|
| Manage several vehicles with a configurable default | Log litres and price — **total is computed server-side** |
| **🔧 Maintenance & Repairs** | **💰 Expenses** |
| Separate records with parts/labour breakdowns | Categorized, with double-counting prevention |
| **🔔 Service Reminders** | **📊 Dashboard & Analytics** |
| Derived on every read — green / amber / red | Totals, monthly spend, charts, cost metrics |
| **🔍 Universal Search** | **🔎 Flexible Filters** |
| Across every record type | By vehicle, date range, category, cost, and text |
| **📱 Responsive Layout** | **🛡️ Server-Validated** |
| Sidebar on desktop · bottom nav + FAB on phones | Zod-validated request bodies with field-level error mapping |

</div>

### Detailed Feature List

- **Multi-vehicle management** — set a default vehicle
- **Fuel tracking** — litres × price per litre, total computed server-side
- **Maintenance records** — with parts and labour breakdowns
- **Repairs** — separate from maintenance for clarity
- **Expenses** — categorized, with double-counting prevention
- **Service reminders** — status derived on every read from current mileage and today's date
- **Dashboard** — totals, upcoming reminders, recent activity, monthly spend
- **Analytics** — charts and cost metrics for a configurable date range
- **Service timeline** — chronological history across all record types
- **Universal search** — across every record type
- **Notification centre** — list, mark read, mark all read
- **Sidebar on desktop, bottom nav + floating "Add record" button on phones**

---

## 🚀 Setup

### Prerequisites

- **Node.js 18+**
- A **PostgreSQL 14+** database you can connect to

### Project Layout

```
autocare/
├── backend/    Express REST API, Prisma schema, migrations, seed data
└── frontend/   React SPA
```

---

### 1. Backend

```bash
cd backend
cp .env.example .env          # then edit DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init   # creates the tables
npm run seed                  # optional: demo account + realistic records
npm run dev                   # http://localhost:4000
```

#### Environment Variables (`backend/.env`)

| Variable | What It Is |
|----------|-----------|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/autocare?schema=public` |
| `JWT_SECRET` | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `PORT` | API port, default `4000` |
| `CORS_ORIGIN` | Allowed origin(s), default `http://localhost:5173` |

---

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # leave VITE_API_URL empty to use the dev proxy
npm install
npm run dev                   # http://localhost:5173
```

> 💡 **Vite proxies `/api` to `http://localhost:4000`** — so nothing else is needed in development.
>
> For a **deployed build**, set `VITE_API_URL` to the API's public origin.

---

### 🔑 Demo Account

After `npm run seed`:

```
demo@autocare.app / demo1234
```

### What the Seed Creates

| Record Type | Count |
|-------------|------:|
| **Vehicles** | 2 |
| **Fuel entries** | 10 |
| **Maintenance records** | 8 |
| **Repairs** | 5 |
| **Expenses** | 15 |
| **Reminders** | 5 |

> 💡 **Including one overdue and one due soon** — so the dashboard shows all three states.

---

## 🎯 Main User Flow to Try

```mermaid
flowchart LR
    Register["📝 Register"] --> Login["🔐 Log in"]
    Login --> Vehicles["🚗 Vehicles"]
    Vehicles --> AddVehicle["➕ Add vehicle"]
    AddVehicle --> AddFuel["⛽ Add fuel<br/><em>4 fields · total calculated</em>"]
    AddFuel --> AddMaint["🔧 Add maintenance"]
    AddMaint --> AddExpense["💰 Add expense"]
    AddExpense --> AddReminder["🔔 Add reminder"]
    AddReminder --> Dashboard["📊 Dashboard"]
    Dashboard --> Analytics["📈 Analytics"]

    style Register fill:#61DAFB,color:#000
    style Login fill:#000,color:#fff
    style Vehicles fill:#22C55E,color:#fff
    style AddFuel fill:#FFB454,color:#000
    style Dashboard fill:#8B5CF6,color:#fff
    style Analytics fill:#0f3460,color:#fff
```

---

## 📡 API

All endpoints under **`/api`**.

> 🔐 **Everything except register, login, and forgot-password requires:**
>
> ```
> Authorization: Bearer <token>
> ```

### 🔐 Authentication

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/auth/register`, `/auth/login`, `/auth/forgot-password` | Account access |
| `GET` | `/auth/me` | Current user |

### 🚗 Vehicles

| Method | Path | Purpose |
|--------|------|---------|
| `GET` `POST` | `/vehicles` | List, create |
| `GET` `PUT` `DELETE` | `/vehicles/:id` | Read, update, delete |
| `POST` | `/vehicles/:id/default` | Set default vehicle |

### 📝 Records

| Method | Path | Purpose |
|--------|------|---------|
| `GET` `POST` | `/fuel` `/maintenance` `/repairs` `/expenses` `/reminders` | List *(filters below)*, create |
| `PUT` `DELETE` | `/fuel/:id` … `/reminders/:id` | Update, delete |
| `POST` | `/reminders/:id/complete` | Mark done, or roll a repeating reminder forward |

### 📊 Insights

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/dashboard` | Totals, reminders, recent activity, monthly spend |
| `GET` | `/analytics` | Charts and cost metrics for a date range |
| `GET` | `/history` | Service timeline |
| `GET` | `/search?q=` | Across every record type |

### 🔔 Notifications

| Method | Path | Purpose |
|--------|------|---------|
| `GET` `POST` | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` | Notification centre |

### 🔎 List Query Parameters

```
vehicleId · from · to · q · category · minCost · maxCost · take
```

**Analytics** accepts:

```
range=30d|3m|6m|year|custom  (+ from/to for custom)
```

---

## 🧮 How the Numbers Are Worked Out

Every calculation happens **server-side** — the client never sends a computed total.

<div align="center">

| Calculation | How It Works |
|-------------|-------------|
| **⛽ Fuel total** | `litres × price per litre` — computed server-side so the client can't send a wrong total |
| **🔧 Repair total** | `parts + labour` — likewise |
| **📉 Consumption** | Compares **consecutive odometer readings**: distance between two fill-ups ÷ litres added at the later one. Shown as both **km/L** and **L/100 km** |
| **🔔 Reminder status** | Derived **on every read** from the vehicle's current mileage and today's date — **green up to date · amber within 1,000 km or 30 days · red past due.** Nothing stale is stored |
| **📏 Odometer** | Updates **automatically** when you log a record with a higher reading |
| **🚫 Double counting** | **Avoided by design** — expenses filed under Fuel/Maintenance/Repairs are **excluded from "other"** so totals stay honest |

</div>

---

## 🔐 Security

<div align="center">

| Protection | Implementation |
|-----------|---------------|
| **Password hashing** | bcrypt, cost factor **12** |
| **Login hygiene** | Returns the **same message for unknown email and wrong password** — the endpoint can't be used to discover accounts |
| **Record ownership** | Every record route **resolves the record, then checks the owning vehicle belongs to the caller** — an id supplied by the client is **never trusted** |
| **Validation** | Zod validates every request body; field-level messages map back onto the form inputs |
| **Error hygiene** | Error responses carry a **message only** — stack traces and database errors stay on the server |

</div>

---

## 📝 Notes

<div align="center">

| Area | Current State | What's Needed |
|------|--------------|---------------|
| **`forgot-password`** | Returns success **without sending mail** | Wire up your mail provider in `backend/src/routes/auth.ts` before using it for real |
| **Receipts & vehicle photos** | Stored as **links** rather than uploads | Add object storage if you need real file uploads |

</div>

---

## 🗺️ Roadmap

### ✅ Current

- [x] Registration, login, and forgot-password flow
- [x] JWT authentication with bcrypt password hashing
- [x] Multi-vehicle management with default vehicle
- [x] Fuel tracking with server-computed totals
- [x] Maintenance records with parts and labour breakdowns
- [x] Repairs as a separate record type
- [x] Categorized expenses with double-counting prevention
- [x] Service reminders with derived status
- [x] Automatic odometer updates
- [x] Dashboard with totals, reminders, activity, monthly spend
- [x] Analytics with range filtering and charts
- [x] Service timeline
- [x] Universal search across all record types
- [x] Notification centre with mark-read
- [x] Flexible list filters (vehicle, date, category, cost, text)
- [x] Responsive layout — sidebar on desktop, bottom nav + FAB on mobile
- [x] Zod validation on every request body
- [x] Ownership check on every record route
- [x] Realistic demo seed with all three reminder states

### 🔜 Future Ideas

- [ ] Real email sending for password reset
- [ ] Object storage for receipt and vehicle photo uploads
- [ ] Fuel price tracking with historical averages
- [ ] Mileage projections and cost forecasting
- [ ] Document expiry reminders (insurance, registration, inspection)
- [ ] Multi-user vehicle sharing
- [ ] Export to CSV / PDF
- [ ] Integration with fuel price APIs
- [ ] Push notifications
- [ ] Offline-first support

---

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the repository
2. **Keep all math server-side** — never trust a client-computed total
3. **Derive, don't store** — reminder status and consumption are computed on read
4. **Check ownership on every record route** — resolve the record, then verify the vehicle belongs to the caller
5. **Validate with Zod** — map field errors back onto the form
6. Submit a Pull Request

### Guidelines

- **Never trust a client-supplied total** — fuel, repairs, and expenses are always computed server-side
- **Never store derived status** — reminder state and consumption are read-time calculations
- **Never expose a record without an ownership check**
- **Never leak stack traces** — error responses carry a message only
- **Never ship the seed credentials to production**

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Prisma** — for making the schema the source of truth
- **Recharts** — for charts that read like documentation
- **Zod** — for validation that reads like documentation
- **Every car owner who's ever forgotten an oil change** — this is for you

---

<div align="center">

### 🚗 TRACK. MAINTAIN. REMEMBER.

**The server owns the math. The client owns the interface.**

**No client-supplied total is ever trusted. No stale status is ever stored.**

<br>

⭐ If this project helped you, consider giving it a star.

<br>

[⬆ Back to Top](#-autocare)

</div>
