import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken, getUser, clearUser } from "../../utils/token";
import "../../styles/dashboard.css";
import "../../styles/admin.css";
import {
  IconAdminShield,
  IconUsers,
  IconDevices,
  IconEnergy,
  IconAlertTriangle,
  IconTransactions,
  IconContract,
  IconMarket,
  IconLogs,
  IconSettingsAdmin,
} from "./adminIcons";
import { IconBolt, IconDatabase, IconLayoutDashboard } from "../dashboard/gridosIcons";

export default function AdminShellLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const onLogout = () => {
    clearToken();
    clearUser();
    navigate("/login");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `gridos-nav-item${isActive ? " gridos-nav-item--active" : ""}`;

  return (
    <div className="gridos-app">
      <aside className="gridos-sidebar admin-sidebar" aria-label="Admin Navigation">
        <NavLink to="/admin" className="gridos-logo-link">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p className="gridos-logo">GridOS</p>
            <span className="admin-badge-indicator">
              <IconAdminShield />
              ADMIN PANEL
            </span>
          </div>
        </NavLink>

        <NavLink to="/dashboard" className="admin-switch-btn" title="Switch back to client-facing dashboard">
          <span>← User Dashboard</span>
        </NavLink>

        <div className="gridos-node-card" style={{ borderColor: "rgba(239, 68, 68, 0.25)" }}>
          <p className="gridos-node-label" style={{ color: "#f87171" }}>
            Administrator Session
          </p>
          <p className="gridos-node-name">{user?.name || "System Administrator"}</p>
          <span className="admin-portal-tag" style={{ marginTop: "6px" }}>
            {user?.email || "admin@rtut.com"} (ADMIN)
          </span>
        </div>

        <nav className="gridos-nav" aria-label="Admin Sections">
          <NavLink to="/admin" className={navClass} end>
            <IconLayoutDashboard />
            Admin Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={navClass}>
            <IconUsers />
            Users
          </NavLink>
          <NavLink to="/admin/devices" className={navClass}>
            <IconDevices />
            Devices
          </NavLink>
          <NavLink to="/admin/energy" className={navClass}>
            <IconEnergy />
            Energy Monitoring
          </NavLink>
          <NavLink to="/admin/alerts" className={navClass}>
            <IconAlertTriangle />
            Alerts
          </NavLink>
          <NavLink to="/admin/transactions" className={navClass}>
            <IconTransactions />
            Transactions
          </NavLink>
          <NavLink to="/admin/contracts" className={navClass}>
            <IconContract />
            Smart Contracts
          </NavLink>
          <NavLink to="/admin/marketplace" className={navClass}>
            <IconMarket />
            P2P Marketplace
          </NavLink>
          <NavLink to="/admin/logs" className={navClass}>
            <IconLogs />
            System Logs
          </NavLink>
          <NavLink to="/admin/settings" className={navClass}>
            <IconSettingsAdmin />
            Settings
          </NavLink>
        </nav>

        <div className="gridos-sidebar-foot">
          <div style={{ padding: "0 10px 8px", fontSize: "0.72rem", color: "#64748b" }}>
            GridOS Core Node v2.4 · RBAC Active
          </div>
          <button type="button" className="gridos-logout" onClick={onLogout}>
            Logout Admin
          </button>
        </div>
      </aside>

      <div className="gridos-main">
        <header className="gridos-topbar">
          <div className="gridos-stat-chip" style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#b91c1c" }}>
            <IconAdminShield />
            <span>
              Area: <strong>SYSTEM ADMINISTRATION</strong>
            </span>
          </div>
          <div className="gridos-stat-chip gridos-stat-chip--green">
            <IconBolt />
            <span>
              Grid Status: <strong>OPTIMAL</strong>
            </span>
          </div>
          <div className="gridos-stat-chip">
            <IconDatabase />
            <span>
              ESP32 Telemetry: <strong>ONLINE</strong>
            </span>
          </div>
          <div className="gridos-topbar-spacer" />
          <div className="gridos-topbar-actions">
            <button
              type="button"
              className="admin-action-btn admin-action-btn--secondary"
              onClick={() => navigate("/dashboard")}
              style={{ marginRight: "8px" }}
            >
              Exit to User View
            </button>
            <button type="button" className="gridos-avatar" style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }} aria-label="Admin Profile">
              {(user?.name || "AD").substring(0, 2).toUpperCase()}
            </button>
          </div>
        </header>

        <div className="gridos-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
