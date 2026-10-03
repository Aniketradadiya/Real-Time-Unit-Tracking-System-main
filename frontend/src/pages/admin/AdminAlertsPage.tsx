import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { IconSearch, IconRefresh } from "../../components/admin/adminIcons";

interface AlertItem {
  _id: string;
  userId?: {
    _id: string;
    name?: string;
    email?: string;
  };
  deviceId: string;
  deviceName: string;
  alertType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "INFO";
  status: "ACTIVE" | "RESOLVED" | "ACKNOWLEDGED";
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  detectedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAlerts({
        search,
        severity: severityFilter,
        status: statusFilter,
        alertType: typeFilter,
        page,
        limit: 15,
      });
      if (res.success && Array.isArray(res.data)) {
        setAlerts(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages);
          setTotalCount(res.pagination.total);
        }
      }
    } catch (err: any) {
      showNotice(err?.message || "Failed to load alerts", "error");
    } finally {
      setLoading(false);
    }
  }, [search, severityFilter, statusFilter, typeFilter, page]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const handleResolveAlert = async (id: string) => {
    try {
      await adminApi.updateAlert(id, "RESOLVED");
      showNotice("Alert marked as RESOLVED");
      void loadAlerts();
    } catch (err: any) {
      showNotice(err?.message || "Failed to resolve alert", "error");
    }
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await adminApi.updateAlert(id, "ACKNOWLEDGED");
      showNotice("Alert marked as ACKNOWLEDGED");
      void loadAlerts();
    } catch (err: any) {
      showNotice(err?.message || "Failed to acknowledge alert", "error");
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!window.confirm("Permanently dismiss and delete this alert?")) return;
    try {
      await adminApi.deleteAlert(id);
      showNotice("Alert deleted");
      void loadAlerts();
    } catch (err: any) {
      showNotice(err?.message || "Failed to delete alert", "error");
    }
  };

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">Alert &amp; Incident Management</h1>
          <p className="gridos-page-desc">
            Monitor real-time hardware faults, over-consumption thresholds, power anomalies, and offline devices.
          </p>
        </div>

        <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => void loadAlerts()}>
          <IconRefresh />
          Refresh
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
            placeholder="Search by title, device ID, or user..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="admin-filters">
          <select
            className="admin-select"
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM / WARNING</option>
            <option value="LOW">LOW / INFO</option>
          </select>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            className="admin-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Incident Types</option>
            <option value="HIGH_POWER">High Power</option>
            <option value="DEVICE_OFFLINE">Device Offline</option>
            <option value="ENERGY_LIMIT">Energy Limit Exceeded</option>
            <option value="DEVICE_FAULT">Hardware Fault</option>
            <option value="ABNORMAL_BILL">Abnormal Usage</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading alert incidents…</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No active alerts matching criteria. All systems nominal.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Alert Title &amp; Details</th>
                <th>Device ID</th>
                <th>User / Consumer</th>
                <th>Value / Threshold</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a._id}>
                  <td>
                    <span
                      className={`admin-badge ${
                        a.severity === "CRITICAL" || a.severity === "HIGH"
                          ? "admin-badge--critical"
                          : a.severity === "MEDIUM"
                          ? "admin-badge--warning"
                          : "admin-badge--user"
                      }`}
                    >
                      {a.severity}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{a.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b", maxWidth: "340px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {a.message}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.78rem", color: "#0284c7" }}>{a.deviceId}</code>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{a.deviceName}</div>
                  </td>
                  <td>
                    {a.userId ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{a.userId.name || "Consumer"}</div>
                        <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{a.userId.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>System wide</span>
                    )}
                  </td>
                  <td>
                    {a.value !== undefined ? (
                      <div>
                        <strong>{a.value} W</strong>
                        {a.threshold ? <span style={{ fontSize: "0.74rem", color: "#64748b" }}> / {a.threshold}W</span> : null}
                      </div>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>-</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {a.detectedAt || a.createdAt ? new Date(a.detectedAt || a.createdAt).toLocaleString() : "-"}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        a.status === "ACTIVE"
                          ? "admin-badge--disconnected"
                          : a.status === "ACKNOWLEDGED"
                          ? "admin-badge--warning"
                          : "admin-badge--connected"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--secondary"
                        onClick={() => {
                          setSelectedAlert(a);
                          setModalOpen(true);
                        }}
                      >
                        Details
                      </button>
                      {a.status !== "RESOLVED" ? (
                        <button
                          type="button"
                          className="admin-action-btn admin-action-btn--success"
                          onClick={() => handleResolveAlert(a._id)}
                        >
                          Resolve
                        </button>
                      ) : null}
                      {a.status === "ACTIVE" ? (
                        <button
                          type="button"
                          className="admin-action-btn admin-action-btn--secondary"
                          onClick={() => handleAcknowledgeAlert(a._id)}
                        >
                          Ack
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--danger"
                        onClick={() => handleDeleteAlert(a._id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <div>
          Showing {alerts.length} of {totalCount} alerts
        </div>
        <div className="admin-page-btns">
          <button
            type="button"
            className="admin-page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ padding: "0 8px", fontWeight: 700 }}>
            {page} / {totalPages || 1}
          </span>
          <button
            type="button"
            className="admin-page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Alert Details Modal */}
      {modalOpen && selectedAlert ? (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="admin-modal-title">Incident Details</h3>
              <button type="button" className="admin-modal-close" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ marginBottom: "16px" }}>
                <span className={`admin-badge ${selectedAlert.severity === "CRITICAL" ? "admin-badge--critical" : "admin-badge--warning"}`}>
                  {selectedAlert.severity} PRIORITY
                </span>
                <h3 style={{ margin: "10px 0 6px", fontSize: "1.2rem", color: "#0f172a" }}>{selectedAlert.title}</h3>
                <p style={{ margin: 0, color: "#475569", fontSize: "0.9rem", lineHeight: 1.5 }}>{selectedAlert.message}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Hardware Node</span>
                  <div style={{ fontWeight: 700 }}>{selectedAlert.deviceName}</div>
                  <code style={{ fontSize: "0.78rem", color: "#0284c7" }}>{selectedAlert.deviceId}</code>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Registered Consumer</span>
                  <div style={{ fontWeight: 700 }}>{selectedAlert.userId?.name || "System"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{selectedAlert.userId?.email || "-"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Incident Type</span>
                  <div style={{ fontWeight: 600 }}>{selectedAlert.alertType}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Incident Status</span>
                  <div>
                    <span className="admin-badge admin-badge--active">{selectedAlert.status}</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Detected At</span>
                  <div style={{ fontSize: "0.82rem" }}>
                    {selectedAlert.detectedAt ? new Date(selectedAlert.detectedAt).toLocaleString() : "-"}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Resolved At</span>
                  <div style={{ fontSize: "0.82rem" }}>
                    {selectedAlert.resolvedAt ? new Date(selectedAlert.resolvedAt).toLocaleString() : "Unresolved"}
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-foot">
              {selectedAlert.status !== "RESOLVED" ? (
                <button
                  type="button"
                  className="admin-action-btn admin-action-btn--success"
                  onClick={() => {
                    void handleResolveAlert(selectedAlert._id);
                    setModalOpen(false);
                  }}
                >
                  Mark as Resolved
                </button>
              ) : null}
              <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
