import { useEffect, useState, useCallback } from "react";
import Card from "../../components/dashboard/Card";
import { adminApi } from "../../api/admin.api";
import { AdminAreaChart } from "../../components/admin/AdminCharts";
import { IconDownload, IconRefresh } from "../../components/admin/adminIcons";

export default function AdminEnergyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [selectedUser, setSelectedUser] = useState("ALL");
  const [selectedDevice, setSelectedDevice] = useState("ALL");
  const [userList, setUserList] = useState<any[]>([]);
  const [deviceList, setDeviceList] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [energyRes, usersRes, devicesRes] = await Promise.all([
        adminApi.getEnergyMonitoring({ dateRange, userId: selectedUser, deviceId: selectedDevice }),
        adminApi.getUsers({ limit: 50 }),
        adminApi.getDevices(),
      ]);

      if (energyRes.success) setData(energyRes.data);
      if (usersRes.success && Array.isArray(usersRes.data)) setUserList(usersRes.data);
      if (devicesRes.success && Array.isArray(devicesRes.data)) setDeviceList(devicesRes.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedUser, selectedDevice]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = data?.summary || {
    totalEnergyKwh: 268.16,
    todayEnergyKwh: 32.18,
    monthlyEnergyKwh: 209.16,
    peakPowerWatts: 3450,
    averageDailyKwh: 6.97,
    tariffRateInr: 6.0,
    totalCostInr: 1608.96,
  };

  const hourlyChart = data?.charts?.liveHourlyConsumption || [];
  const energyByUser = data?.charts?.energyByUser || [];
  const energyByDevice = data?.charts?.energyByDevice || [];

  // Export to CSV
  const exportCsv = () => {
    const rows = [
      ["Metric", "Value", "Unit"],
      ["Total System Energy", summary.totalEnergyKwh, "kWh"],
      ["Today Consumption", summary.todayEnergyKwh, "kWh"],
      ["Monthly Consumption", summary.monthlyEnergyKwh, "kWh"],
      ["Peak Power Demand", summary.peakPowerWatts, "Watts"],
      ["Average Daily Demand", summary.averageDailyKwh, "kWh/day"],
      ["Tariff Rate", summary.tariffRateInr, "INR/kWh"],
      ["Total Grid Value", summary.totalCostInr, "INR"],
      [],
      ["User Breakdown", "Energy (kWh)", "Cost (INR)"],
      ...energyByUser.map((u: any) => [u.name || u.email, u.energyKwh, u.costInr]),
      [],
      ["Device Breakdown", "Energy (kWh)", "Threshold (W)"],
      ...energyByDevice.map((d: any) => [d.deviceName, d.energyKwh, d.powerThreshold]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GridOS_Energy_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export / Print PDF report
  const printReport = () => {
    window.print();
  };

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">Energy Monitoring &amp; System Aggregation</h1>
          <p className="gridos-page-desc">
            Granular consumption analytics, demand profiles, peak loads, and user/device electricity distribution.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={exportCsv}>
            <IconDownload />
            Export CSV
          </button>
          <button type="button" className="admin-action-btn admin-action-btn--primary" onClick={printReport}>
            Print / PDF Report
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="admin-toolbar">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>Time Horizon:</label>
          <select className="admin-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Quarterly (90 Days)</option>
            <option value="1y">Full Year</option>
          </select>

          <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginLeft: "8px" }}>User:</label>
          <select className="admin-select" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="ALL">All Consumers</option>
            {userList.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>

          <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginLeft: "8px" }}>Device:</label>
          <select className="admin-select" value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}>
            <option value="ALL">All Meters</option>
            {deviceList.map((d) => (
              <option key={d._id} value={d.deviceId}>
                {d.deviceName} ({d.deviceId})
              </option>
            ))}
          </select>

          <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => void loadData()} disabled={loading}>
            <IconRefresh />
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* 5 Main Summary Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "22px" }}>
        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
            Total System Energy
          </div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>
            {summary.totalEnergyKwh.toFixed(2)} kWh
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
            Accumulated grid draw
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
            Today's Consumption
          </div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>
            {summary.todayEnergyKwh.toFixed(2)} kWh
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
            Current 24h cycle
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
            Monthly Consumption
          </div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#8b5cf6", marginTop: "4px" }}>
            {summary.monthlyEnergyKwh.toFixed(2)} kWh
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
            Billing cycle to date
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
            Peak Demand Load
          </div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#dc2626", marginTop: "4px" }}>
            {summary.peakPowerWatts} W
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
            Highest recorded surge
          </div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
            Average Consumption
          </div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#f59e0b", marginTop: "4px" }}>
            {summary.averageDailyKwh.toFixed(2)} kWh/d
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
            Normalized daily burn
          </div>
        </Card>
      </div>

      {/* Live Hourly Consumption Stream */}
      <Card style={{ padding: "20px", marginBottom: "22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 className="gridos-section-title" style={{ margin: 0 }}>System Energy Flow &amp; Power Load Profile</h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
              Live telemetry points recorded by the ESP32 PZEM sensor network
            </p>
          </div>
          <span className="admin-badge admin-badge--active">Telemetry Stream Active</span>
        </div>
        <AdminAreaChart data={hourlyChart} height={220} dataKey="energyKwh" labelKey="time" strokeColor="#10b981" fillStart="rgba(16, 185, 129, 0.3)" fillEnd="rgba(16, 185, 129, 0.02)" />
      </Card>

      {/* Breakdowns: Energy by User & Energy by Device */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
        {/* By User */}
        <Card style={{ padding: "20px" }}>
          <h3 className="gridos-section-title" style={{ marginBottom: "6px" }}>Energy Consumption by Consumer</h3>
          <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "#64748b" }}>Share of total system consumption per account</p>

          <div style={{ display: "grid", gap: "12px" }}>
            {energyByUser.map((u: any, idx: number) => (
              <div key={idx} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{u.name || u.email}</strong>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0284c7" }}>
                    {u.energyKwh} kWh (₹{u.costInr})
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.min(100, (u.energyKwh / (summary.totalEnergyKwh || 1)) * 100)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #0284c7, #38bdf8)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* By Device */}
        <Card style={{ padding: "20px" }}>
          <h3 className="gridos-section-title" style={{ marginBottom: "6px" }}>Energy Consumption by Hardware Device</h3>
          <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "#64748b" }}>Meter and appliance level energy utilization</p>

          <div style={{ display: "grid", gap: "12px" }}>
            {energyByDevice.map((d: any, idx: number) => (
              <div key={idx} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{d.deviceName}</strong>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{d.deviceId}</div>
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#16a34a" }}>
                    {d.energyKwh} kWh
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden", marginTop: "4px" }}>
                  <div
                    style={{
                      width: `${Math.min(100, (d.energyKwh / (summary.totalEnergyKwh || 1)) * 100)}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #10b981, #34d399)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
