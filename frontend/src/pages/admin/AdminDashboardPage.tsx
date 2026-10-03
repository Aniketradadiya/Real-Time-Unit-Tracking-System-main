import { useEffect, useState, useCallback } from "react";
import Card from "../../components/dashboard/Card";
import { adminApi } from "../../api/admin.api";
import { AdminAreaChart, AdminDonutChart } from "../../components/admin/AdminCharts";
import {
  IconRefresh,
  IconUsers,
  IconDevices,
  IconEnergy,
  IconAlertTriangle,
  IconTransactions,
  IconAdminShield,
} from "../../components/admin/adminIcons";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await adminApi.getDashboardOverview();
      if (res.success && res.data) {
        setData(res.data);
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load admin dashboard data");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void fetchDashboard();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchDashboard]);

  const metrics = data?.metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    totalEnergyConsumed: 0,
    todayEnergyConsumption: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
    totalTransactions: 0,
    systemStatus: "OPTIMAL",
  };

  const chartData = data?.charts?.energyUsageTimeline || [];

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 className="gridos-page-title" style={{ margin: 0 }}>Administrator Overview</h1>
            <span className="admin-badge-indicator">
              <IconAdminShield />
              Live Telemetry
            </span>
          </div>
          <p className="gridos-page-desc">
            Complete high-level telemetry, connected ESP32 smart meters, user accounts, and grid security monitoring.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#64748b", cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            Auto 5s Sync
          </label>
          <button
            type="button"
            className="admin-action-btn admin-action-btn--secondary"
            onClick={() => void fetchDashboard(true)}
            disabled={refreshing}
          >
            <IconRefresh className={refreshing ? "spin-icon" : ""} />
            {refreshing ? "Syncing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error ? (
        <div style={{ padding: "12px 18px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#dc2626", marginBottom: "16px", fontSize: "0.88rem" }}>
          ⚠️ {error}
        </div>
      ) : null}

      {/* 10 Key Metrics Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "22px" }}>
        {/* Total Users */}
        <Card className="ac-metric-card" style={{ minHeight: "auto", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#0284c7" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", color: "#64748b" }}>
              Total Users
            </span>
            <IconUsers />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginTop: "6px" }}>
            {loading ? "…" : metrics.totalUsers}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600, marginTop: "2px" }}>
            Active: {metrics.activeUsers} accounts
          </div>
        </Card>

        {/* Connected Devices */}
        <Card className="ac-metric-card" style={{ minHeight: "auto", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#16a34a" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", color: "#64748b" }}>
              Connected Devices
            </span>
            <IconDevices />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginTop: "6px" }}>
            {loading ? "…" : metrics.onlineDevices}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#b91c1c", fontWeight: 600, marginTop: "2px" }}>
            Offline: {metrics.offlineDevices} of {metrics.totalDevices} total
          </div>
        </Card>

        {/* Total Energy Consumed */}
        <Card className="ac-metric-card" style={{ minHeight: "auto", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#f59e0b" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", color: "#64748b" }}>
              Total Energy
            </span>
            <IconEnergy />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginTop: "6px" }}>
            {loading ? "…" : `${metrics.totalEnergyConsumed.toFixed(1)} kWh`}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
            Today: {metrics.todayEnergyConsumption.toFixed(2)} kWh
          </div>
        </Card>

        {/* Active & Critical Alerts */}
        <Card className="ac-metric-card" style={{ minHeight: "auto", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#dc2626" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", color: "#64748b" }}>
              Active Alerts
            </span>
            <IconAlertTriangle />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#dc2626", marginTop: "6px" }}>
            {loading ? "…" : metrics.activeAlerts}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#b91c1c", fontWeight: 700, marginTop: "2px" }}>
            Critical: {metrics.criticalAlerts} immediate
          </div>
        </Card>

        {/* Transactions & Status */}
        <Card className="ac-metric-card" style={{ minHeight: "auto", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#8b5cf6" }}>
            <span style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em", color: "#64748b" }}>
              Transactions
            </span>
            <IconTransactions />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", marginTop: "6px" }}>
            {loading ? "…" : metrics.totalTransactions}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
            Grid Health: {metrics.systemStatus}
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "18px", marginBottom: "22px" }}>
        {/* Energy Consumption Trend */}
        <Card style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 className="gridos-section-title" style={{ margin: 0 }}>System Energy Usage Over Time</h3>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>Aggregated demand across all connected smart meter devices</p>
            </div>
            <div className="gridos-wallet-segment" style={{ margin: 0, padding: "2px" }}>
              {(["daily", "weekly", "monthly"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`gridos-wallet-segment__btn${timeRange === r ? " is-active" : ""}`}
                  style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                  onClick={() => setTimeRange(r)}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <AdminAreaChart data={chartData} height={210} dataKey="usageKwh" labelKey="day" strokeColor="#0284c7" />
        </Card>

        {/* Connected vs Disconnected Devices Donut */}
        <Card style={{ padding: "20px" }}>
          <h3 className="gridos-section-title" style={{ marginBottom: "6px" }}>Device Connectivity</h3>
          <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "#64748b" }}>Real-time heartbeat &amp; communication telemetry</p>
          <AdminDonutChart
            items={[
              { label: "Connected", value: metrics.onlineDevices, color: "#10b981" },
              { label: "Disconnected", value: metrics.offlineDevices, color: "#ef4444" },
            ]}
            centerTitle="Total Nodes"
            centerValue={metrics.totalDevices}
          />
        </Card>
      </div>

      {/* Secondary Row: Alerts Breakdown & Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "18px" }}>
        {/* Alert Frequency */}
        <Card style={{ padding: "20px" }}>
          <h3 className="gridos-section-title" style={{ marginBottom: "6px" }}>Alert Frequency &amp; Severity</h3>
          <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "#64748b" }}>Active and acknowledged incident breakdown</p>
          <AdminDonutChart
            items={[
              { label: "Critical", value: data?.charts?.alertsSeverityCount?.CRITICAL || 0, color: "#dc2626" },
              { label: "Warning", value: data?.charts?.alertsSeverityCount?.WARNING || 0, color: "#f59e0b" },
              { label: "Info", value: data?.charts?.alertsSeverityCount?.INFO || 0, color: "#38bdf8" },
            ]}
            centerTitle="Alerts"
            centerValue={metrics.activeAlerts}
          />
        </Card>

        {/* Recent Activity */}
        <Card style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 className="gridos-section-title" style={{ margin: 0 }}>Recent Activity Stream</h3>
            <span style={{ fontSize: "0.78rem", color: "#0284c7", fontWeight: 600 }}>Live Feed</span>
          </div>

          <div style={{ display: "grid", gap: "10px", maxHeight: "310px", overflowY: "auto", paddingRight: "4px" }}>
            {data?.recentActivity?.length > 0 ? (
              data.recentActivity.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      marginTop: "6px",
                      flexShrink: 0,
                      background:
                        item.severity === "CRITICAL"
                          ? "#dc2626"
                          : item.type === "TRANSACTION"
                          ? "#8b5cf6"
                          : item.type === "USER_REGISTRATION"
                          ? "#0284c7"
                          : "#10b981",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>{item.title}</strong>
                      <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ""}
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "24px", fontSize: "0.85rem" }}>
                No recent events recorded.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
