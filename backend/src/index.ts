import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authRouter } from './routes/auth.js';
import { vehicleRouter } from './routes/vehicles.js';
import { expenseRouter, fuelRouter, maintenanceRouter, repairRouter } from './routes/records.js';
import { reminderRouter } from './routes/remindersRoute.js';
import { dashboardRouter } from './routes/dashboard.js';
import { analyticsRouter } from './routes/analytics.js';
import { notificationRouter } from './routes/notifications.js';
import { searchRouter } from './routes/search.js';
import { historyRouter } from './routes/history.js';
import { HttpError } from './lib/errors.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/fuel', fuelRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/repairs', repairRouter);
app.use('/api/expenses', expenseRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/search', searchRouter);
app.use('/api/history', historyRouter);

app.use((_req, res) => res.status(404).json({ message: 'Endpoint not found' }));

// Error responses never leak stack traces or database internals.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError)
    return res.status(err.status).json({ message: err.message, fields: err.details });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side. Try again.' });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`AutoCare API listening on http://localhost:${port}`));
