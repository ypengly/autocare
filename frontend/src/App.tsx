import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { VehicleProvider } from './context/VehicleContext';
import { RecordSheetProvider } from './context/RecordSheetContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { ForgotPassword, Login, Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Vehicles } from './pages/Vehicles';
import { FuelPage } from './pages/Fuel';
import { MaintenancePage } from './pages/Maintenance';
import { RepairsPage } from './pages/Repairs';
import { ExpensesPage } from './pages/Expenses';
import { RemindersPage } from './pages/Reminders';
import { HistoryPage } from './pages/History';
import { AnalyticsPage } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <VehicleProvider>
            <RecordSheetProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="vehicles" element={<Vehicles />} />
                  <Route path="fuel" element={<FuelPage />} />
                  <Route path="maintenance" element={<MaintenancePage />} />
                  <Route path="repairs" element={<RepairsPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="reminders" element={<RemindersPage />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </RecordSheetProvider>
          </VehicleProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
