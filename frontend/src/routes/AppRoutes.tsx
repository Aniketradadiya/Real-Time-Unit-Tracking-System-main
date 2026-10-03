import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import WalletPage from "../pages/WalletPage";
import P2PPage from "../pages/P2PPage";
import SettingsPage from "../pages/SettingsPage";
import DeployContractPage from "../pages/DeployContractPage";
import SupportPage from "../pages/SupportPage";
import LogsPage from "../pages/LogsPage";
import AlertsPage from "../pages/AlertsPage";
import DevicesPage from "../pages/DevicesPage";
import GridShellLayout from "../components/dashboard/GridShellLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminShellLayout from "../components/admin/AdminShellLayout";

// Admin Pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminDevicesPage from "../pages/admin/AdminDevicesPage";
import AdminEnergyPage from "../pages/admin/AdminEnergyPage";
import AdminAlertsPage from "../pages/admin/AdminAlertsPage";
import AdminTransactionsPage from "../pages/admin/AdminTransactionsPage";
import AdminContractsPage from "../pages/admin/AdminContractsPage";
import AdminMarketplacePage from "../pages/admin/AdminMarketplacePage";
import AdminLogsPage from "../pages/admin/AdminLogsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

import { getToken, getUser } from "../utils/token";

export default function AppRoutes() {
  const token = getToken();
  const user = getUser();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={token ? (user?.role === "ADMIN" ? "/admin" : "/dashboard") : "/login"}
            replace
          />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User Dashboard Routes (Accessible to authenticated users) */}
      <Route
        element={
          <ProtectedRoute>
            <GridShellLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/p2p" element={<P2PPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/deploy" element={<DeployContractPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/devices" element={<DevicesPage />} />
      </Route>

      {/* Admin Panel Routes (Strictly protected: ADMIN role only) */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminShellLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="devices" element={<AdminDevicesPage />} />
        <Route path="energy" element={<AdminEnergyPage />} />
        <Route path="alerts" element={<AdminAlertsPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="contracts" element={<AdminContractsPage />} />
        <Route path="marketplace" element={<AdminMarketplacePage />} />
        <Route path="logs" element={<AdminLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route
        path="*"
        element={
          <Navigate
            to={token ? (user?.role === "ADMIN" ? "/admin" : "/dashboard") : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
