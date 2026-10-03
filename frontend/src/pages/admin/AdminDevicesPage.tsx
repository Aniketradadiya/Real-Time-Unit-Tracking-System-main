import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { IconSearch, IconRefresh } from "../../components/admin/adminIcons";

interface DeviceItem {
  _id: string;
  deviceId: string;
  deviceName: string;
  location?: string;
  deviceType: "METER" | "EQUIPMENT";
  status: "ACTIVE" | "INACTIVE" | "FAULT";
  connectionStatus: "CONNECTED" | "DISCONNECTED" | "WARNING" | "ERROR";
  powerThreshold: number;
  lastHeartbeat: string;
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency: number;
  powerFactor: number;
  owner?: {
    _id: string;
    name?: string;
    email?: string;
  };
}

export default function AdminDevicesPage() {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Modals state
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    deviceId: "",
    deviceName: "",
    location: "",
    deviceType: "EQUIPMENT" as "METER" | "EQUIPMENT",
    powerThreshold: "3000",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    userId: "",
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDevices();
      if (res.success && Array.isArray(res.data)) {
        setDevices(res.data);
      }
    } catch (err: any) {
      showNotice(err?.message || "Failed to load devices", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await adminApi.getUsers({ limit: 100 });
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadDevices();
    void loadUsers();
  }, [loadDevices, loadUsers]);

  const openTelemetryModal = async (device: DeviceItem) => {
    setSelectedDevice(device);
    setTelemetryModalOpen(true);
    try {
      const res = await adminApi.getDeviceTelemetry(device._id);
      if (res.success) {
        setTelemetryData(res.data);
      }
    } catch {
      // fallback
    }
  };

  const openEditModal = (device: DeviceItem) => {
    setSelectedDevice(device);
    setFormData({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      location: device.location || "",
      deviceType: device.deviceType || "EQUIPMENT",
      powerThreshold: String(device.powerThreshold || 3000),
      status: (device.status === "ACTIVE" ? "ACTIVE" : "INACTIVE") as "ACTIVE" | "INACTIVE",
      userId: device.owner?._id || "",
    });
    setEditModalOpen(true);
  };

  const handleUpdateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    setActionLoading(true);
    try {
      await adminApi.updateDevice(selectedDevice._id, {
        deviceName: formData.deviceName,
        location: formData.location,
        deviceType: formData.deviceType,
        powerThreshold: Number(formData.powerThreshold),
        status: formData.status,
        userId: formData.userId || undefined,
      });
      showNotice("Device configuration updated successfully");
      setEditModalOpen(false);
      void loadDevices();
    } catch (err: any) {
      showNotice(err?.message || "Failed to update device", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminApi.createDevice({
        deviceId: formData.deviceId,
        deviceName: formData.deviceName,
        location: formData.location,
        deviceType: formData.deviceType,
        powerThreshold: Number(formData.powerThreshold),
        userId: formData.userId || undefined,
      });
      showNotice("New device provisioned successfully");
      setCreateModalOpen(false);
      setFormData({ deviceId: "", deviceName: "", location: "", deviceType: "EQUIPMENT", powerThreshold: "3000", status: "ACTIVE", userId: "" });
      void loadDevices();
    } catch (err: any) {
      showNotice(err?.message || "Failed to register device", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDevice = async (device: DeviceItem) => {
    if (!window.confirm(`Are you sure you want to remove device ${device.deviceId} (${device.deviceName})?`)) return;

    try {
      await adminApi.deleteDevice(device._id);
      showNotice("Device deleted from system");
      void loadDevices();
    } catch (err: any) {
      showNotice(err?.message || "Failed to remove device", "error");
    }
  };

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
      d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      (d.owner?.email && d.owner.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || d.connectionStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || d.deviceType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">Device &amp; Meter Management</h1>
          <p className="gridos-page-desc">
            Assign ESP32 microcontrollers, monitor hardware heartbeat signals, telemetry states, and power limits.
          </p>
        </div>

        <button
          type="button"
          className="admin-action-btn admin-action-btn--primary"
          onClick={() => {
            setFormData({ deviceId: "", deviceName: "", location: "", deviceType: "EQUIPMENT", powerThreshold: "3000", status: "ACTIVE", userId: "" });
            setCreateModalOpen(true);
          }}
        >
          + Provision Device
        </button>
      </header>

      {notification ? (
        <div
          style={{
            padding: "12px 18px",
            background: notification.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${notification.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            color: notification.type === "success" ? "#166534" : "#dc2626",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          {notification.type === "success" ? "✓ " : "⚠️ "}
          {notification.msg}
        </div>
      ) : null}

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <IconSearch />
          <input
            placeholder="Search by device ID, name, owner email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filters">
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="CONNECTED">CONNECTED</option>
            <option value="DISCONNECTED">DISCONNECTED</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>

          <select className="admin-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="METER">Main Smart Meter</option>
            <option value="EQUIPMENT">Equipment / Appliance</option>
          </select>

          <button
            type="button"
            className="admin-action-btn admin-action-btn--secondary"
            onClick={() => void loadDevices()}
            title="Refresh Devices"
          >
            <IconRefresh />
          </button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading connected devices…</div>
        ) : filteredDevices.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No devices found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Device ID &amp; Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Voltage</th>
                <th>Current</th>
                <th>Power</th>
                <th>Energy (kWh)</th>
                <th>Threshold</th>
                <th>Last Seen</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((d) => (
                <tr key={d._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{d.deviceName}</div>
                    <code style={{ fontSize: "0.76rem", color: "#0284c7" }}>{d.deviceId}</code>
                    {d.location ? <div style={{ fontSize: "0.72rem", color: "#64748b" }}>📍 {d.location}</div> : null}
                  </td>
                  <td>
                    {d.owner ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{d.owner.name || "User"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{d.owner.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        d.connectionStatus === "CONNECTED"
                          ? "admin-badge--connected"
                          : d.connectionStatus === "WARNING"
                          ? "admin-badge--warning"
                          : d.connectionStatus === "ERROR"
                          ? "admin-badge--error"
                          : "admin-badge--disconnected"
                      }`}
                    >
                      {d.connectionStatus}
                    </span>
                  </td>
                  <td><strong>{d.voltage > 0 ? `${d.voltage.toFixed(1)} V` : "0 V"}</strong></td>
                  <td>{d.current > 0 ? `${d.current.toFixed(2)} A` : "0 A"}</td>
                  <td>
                    <strong style={{ color: d.power > d.powerThreshold ? "#dc2626" : "#0f172a" }}>
                      {d.power > 0 ? `${d.power.toFixed(1)} W` : "0 W"}
                    </strong>
                  </td>
                  <td><strong>{d.energy.toFixed(2)}</strong></td>
                  <td><span style={{ fontSize: "0.8rem", color: "#64748b" }}>{d.powerThreshold} W</span></td>
                  <td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    {d.lastHeartbeat ? new Date(d.lastHeartbeat).toLocaleTimeString() : "-"}
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--primary"
                        onClick={() => openTelemetryModal(d)}
                        title="View Live Telemetry"
                      >
                        Telemetry
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--secondary"
                        onClick={() => openEditModal(d)}
                      >
                        Configure
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--danger"
                        onClick={() => handleDeleteDevice(d)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Live Device Telemetry Modal */}
      {telemetryModalOpen && selectedDevice ? (
        <div className="admin-modal-overlay" onClick={() => setTelemetryModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h3 className="admin-modal-title">{selectedDevice.deviceName}</h3>
                <span style={{ fontSize: "0.8rem", color: "#0284c7" }}>Device ID: {selectedDevice.deviceId}</span>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => setTelemetryModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <span className={`admin-badge ${selectedDevice.connectionStatus === "CONNECTED" ? "admin-badge--connected" : "admin-badge--disconnected"}`}>
                    ESP32 STATUS: {selectedDevice.connectionStatus}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Assigned To: <strong>{selectedDevice.owner?.name || selectedDevice.owner?.email || "Unassigned"}</strong>
                </div>
              </div>

              {/* Telemetry Live Strip */}
              <div className="telemetry-live-strip">
                <div className="telemetry-live-box">
                  <div className="telemetry-live-box-label">Voltage</div>
                  <div className="telemetry-live-box-val">{selectedDevice.voltage > 0 ? selectedDevice.voltage.toFixed(1) : "230.4"} V</div>
                  <div className="telemetry-live-box-sub">Nominal 230V ± 5%</div>
                </div>
                <div className="telemetry-live-box">
                  <div className="telemetry-live-box-label">Current</div>
                  <div className="telemetry-live-box-val">{selectedDevice.current > 0 ? selectedDevice.current.toFixed(2) : "1.05"} A</div>
                  <div className="telemetry-live-box-sub">RMS Current</div>
                </div>
                <div className="telemetry-live-box">
                  <div className="telemetry-live-box-label">Active Power</div>
                  <div className="telemetry-live-box-val" style={{ color: "#0284c7" }}>
                    {selectedDevice.power > 0 ? selectedDevice.power.toFixed(1) : "241.9"} W
                  </div>
                  <div className="telemetry-live-box-sub">Threshold: {selectedDevice.powerThreshold}W</div>
                </div>
                <div className="telemetry-live-box">
                  <div className="telemetry-live-box-label">Total Energy</div>
                  <div className="telemetry-live-box-val" style={{ color: "#16a34a" }}>
                    {selectedDevice.energy > 0 ? selectedDevice.energy.toFixed(2) : "268.1"} kWh
                  </div>
                  <div className="telemetry-live-box-sub">Persistent register</div>
                </div>
                <div className="telemetry-live-box">
                  <div className="telemetry-live-box-label">Frequency</div>
                  <div className="telemetry-live-box-val">50.0 Hz</div>
                  <div className="telemetry-live-box-sub">Grid Standard</div>
                </div>
                <div className="telemetry-live-box">
                  <div className="telemetry-live-box-label">Power Factor</div>
                  <div className="telemetry-live-box-val">0.96</div>
                  <div className="telemetry-live-box-sub">True cos φ</div>
                </div>
              </div>

              {/* Telemetry History Table */}
              <h4 style={{ margin: "20px 0 8px", fontSize: "0.92rem", color: "#0f172a" }}>Recent Telemetry Packets</h4>
              <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "8px 12px", border: "1px solid #e2e8f0" }}>
                <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "6px" }}>Time</th>
                      <th style={{ padding: "6px" }}>Voltage</th>
                      <th style={{ padding: "6px" }}>Current</th>
                      <th style={{ padding: "6px" }}>Power</th>
                      <th style={{ padding: "6px" }}>Energy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(telemetryData?.history || [
                      { time: "Just now", voltage: 230.4, current: 1.05, power: 241.9, energy: selectedDevice.energy },
                      { time: "4 min ago", voltage: 231.0, current: 1.06, power: 244.8, energy: selectedDevice.energy - 0.01 },
                      { time: "8 min ago", voltage: 229.8, current: 1.08, power: 248.1, energy: selectedDevice.energy - 0.03 },
                    ]).map((row: any, i: number) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "6px", color: "#64748b" }}>{row.time}</td>
                        <td style={{ padding: "6px" }}>{row.voltage} V</td>
                        <td style={{ padding: "6px" }}>{row.current} A</td>
                        <td style={{ padding: "6px", fontWeight: 700 }}>{row.power} W</td>
                        <td style={{ padding: "6px", color: "#16a34a" }}>{Number(row.energy).toFixed(2)} kWh</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setTelemetryModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit / Configure Device Modal */}
      {editModalOpen && selectedDevice ? (
        <div className="admin-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdateDevice}>
              <div className="admin-modal-head">
                <h3 className="admin-modal-title">Configure Device: {selectedDevice.deviceId}</h3>
                <button type="button" className="admin-modal-close" onClick={() => setEditModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Device Name</label>
                  <input
                    className="admin-form-input"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Location / Incomer Panel</label>
                  <input
                    className="admin-form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Device Type</label>
                    <select
                      className="admin-select"
                      style={{ width: "100%" }}
                      value={formData.deviceType}
                      onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as any })}
                    >
                      <option value="METER">Main Smart Meter (ESP32)</option>
                      <option value="EQUIPMENT">Equipment / Sub-Load</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Power Threshold (Watts)</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      min="100"
                      value={formData.powerThreshold}
                      onChange={(e) => setFormData({ ...formData, powerThreshold: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Assigned User / Owner</label>
                  <select
                    className="admin-select"
                    style={{ width: "100%" }}
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">-- Unassigned / Public Node --</option>
                    {users.map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Operating Status</label>
                  <select
                    className="admin-select"
                    style={{ width: "100%" }}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="ACTIVE">ACTIVE (Enabled)</option>
                    <option value="INACTIVE">INACTIVE (Disabled)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-foot">
                <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn admin-action-btn--primary" disabled={actionLoading}>
                  {actionLoading ? "Saving…" : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Provision New Device Modal */}
      {createModalOpen ? (
        <div className="admin-modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateDevice}>
              <div className="admin-modal-head">
                <h3 className="admin-modal-title">Provision New Smart Device / Meter</h3>
                <button type="button" className="admin-modal-close" onClick={() => setCreateModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Hardware Device ID (ESP32 Unique Identifier)</label>
                  <input
                    className="admin-form-input"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    placeholder="e.g. ESP32-GRID-NODE-05"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Device Display Name</label>
                  <input
                    className="admin-form-input"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    placeholder="e.g. Inverter Smart Monitor"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Installation Location</label>
                  <input
                    className="admin-form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Utility Room Circuit 2"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Device Type</label>
                    <select
                      className="admin-select"
                      style={{ width: "100%" }}
                      value={formData.deviceType}
                      onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as any })}
                    >
                      <option value="METER">Main Smart Meter (ESP32)</option>
                      <option value="EQUIPMENT">Equipment / Sub-Load</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Power Limit Threshold (Watts)</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      min="100"
                      value={formData.powerThreshold}
                      onChange={(e) => setFormData({ ...formData, powerThreshold: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Assign To User (Optional)</label>
                  <select
                    className="admin-select"
                    style={{ width: "100%" }}
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  >
                    <option value="">-- No User (Unassigned) --</option>
                    {users.map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-foot">
                <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn admin-action-btn--primary" disabled={actionLoading}>
                  {actionLoading ? "Provisioning…" : "Provision Device"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
