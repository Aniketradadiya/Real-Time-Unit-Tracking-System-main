import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { IconSearch, IconRefresh } from "../../components/admin/adminIcons";

interface LogItem {
  _id: string;
  logId: string;
  actor: {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
  };
  action: string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  result: "SUCCESS" | "FAILURE" | "WARNING";
  timestamp: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSystemLogs({
        search,
        action: actionFilter,
        result: resultFilter,
        page,
        limit: 20,
      });
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages);
          setTotalCount(res.pagination.total);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, resultFilter, page]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const copyLogText = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.result}] [${l.action}] by ${l.actor?.email || "SYSTEM"} on ${l.resource} (IP: ${l.ipAddress})`
      )
      .join("\n");
    void navigator.clipboard.writeText(text);
    window.alert("Audit logs copied to clipboard.");
  };

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">System Audit Trail &amp; Access Logs</h1>
          <p className="gridos-page-desc">
            Immutable tracking for administrative operations, security role elevations, meter disconnections, and system mutations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={copyLogText}>
            Copy Log Text
          </button>
          <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => void loadLogs()}>
            <IconRefresh />
            Refresh Logs
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <IconSearch />
          <input
            placeholder="Search by action, resource, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="admin-filters">
          <select className="admin-select" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
            <option value="ALL">All Actions</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="ROLE_CHANGED">ROLE_CHANGED</option>
            <option value="DEVICE_UPDATED">DEVICE_UPDATED</option>
            <option value="DEVICE_REGISTERED">DEVICE_REGISTERED</option>
            <option value="ALERT_UPDATED">ALERT_UPDATED</option>
            <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
            <option value="SYSTEM_BOOT">SYSTEM_BOOT</option>
          </select>

          <select className="admin-select" value={resultFilter} onChange={(e) => { setResultFilter(e.target.value); setPage(1); }}>
            <option value="ALL">All Results</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="WARNING">WARNING</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading audit records…</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No audit log entries found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>Actor / Admin</th>
                <th>Action</th>
                <th>Target Resource</th>
                <th>Client IP</th>
                <th>Result</th>
                <th style={{ textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <code style={{ fontSize: "0.78rem", color: "#0f172a" }}>{log.logId}</code>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap" }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{log.actor?.name || log.actor?.email || "SYSTEM"}</div>
                    <span className="admin-badge admin-badge--user" style={{ fontSize: "0.68rem" }}>
                      {log.actor?.role || "SYSTEM"}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontWeight: 700, color: "#0284c7" }}>{log.action}</code>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "#334155" }}>{log.resource}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{log.ipAddress || "127.0.0.1"}</span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        log.result === "SUCCESS"
                          ? "admin-badge--connected"
                          : log.result === "WARNING"
                          ? "admin-badge--warning"
                          : "admin-badge--error"
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="admin-action-btn admin-action-btn--secondary"
                      onClick={() => {
                        setSelectedLog(log);
                        setDetailsModalOpen(true);
                      }}
                    >
                      Payload
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <div>Showing {logs.length} of {totalCount} audit events</div>
        <div className="admin-page-btns">
          <button type="button" className="admin-page-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <span style={{ padding: "0 8px", fontWeight: 700 }}>{page} / {totalPages || 1}</span>
          <button type="button" className="admin-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {/* Log Details Modal */}
      {detailsModalOpen && selectedLog ? (
        <div className="admin-modal-overlay" onClick={() => setDetailsModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: "640px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="admin-modal-title">Audit Log Event Payload</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDetailsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Reference ID</span>
                  <div><code>{selectedLog.logId}</code></div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Timestamp</span>
                  <div>{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Actor</span>
                  <div>{selectedLog.actor?.email || "SYSTEM"} ({selectedLog.actor?.role})</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Action Executed</span>
                  <div style={{ fontWeight: 700, color: "#0284c7" }}>{selectedLog.action}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Target Resource</span>
                  <div>{selectedLog.resource}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Origin IP &amp; Client</span>
                  <div>{selectedLog.ipAddress}</div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                  Raw Event Details
                </span>
                <pre
                  style={{
                    background: "#0f172a",
                    color: "#38bdf8",
                    padding: "14px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    overflowX: "auto",
                    margin: "6px 0 0",
                  }}
                >
                  {typeof selectedLog.details === "object"
                    ? JSON.stringify(selectedLog.details, null, 2)
                    : selectedLog.details || "{ \"status\": \"Event captured successfully\" }"}
                </pre>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setDetailsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
