import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { IconSearch, IconRefresh } from "../../components/admin/adminIcons";

interface TransactionItem {
  _id: string;
  transactionId: string;
  userName?: string;
  userEmail?: string;
  type: "ENERGY_PAYMENT" | "WALLET_RECHARGE" | "P2P_TRANSACTION" | "REFUND";
  amount: number;
  energyUnits: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  paymentMethod: string;
  txHash?: string;
  description?: string;
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTransactions({
        search,
        type: typeFilter,
        status: statusFilter,
        page,
        limit: 15,
      });
      if (res.success && Array.isArray(res.data)) {
        setTransactions(res.data);
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
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">Transaction &amp; Settlement Management</h1>
          <p className="gridos-page-desc">
            Audit energy billing deductions, prepaid UPI wallet top-ups, P2P smart contract transfers, and blockchain proofs.
          </p>
        </div>

        <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => void loadTransactions()}>
          <IconRefresh />
          Refresh
        </button>
      </header>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <IconSearch />
          <input
            placeholder="Search by TxID, hash, user email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="admin-filters">
          <select className="admin-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="ALL">All Types</option>
            <option value="ENERGY_PAYMENT">Energy Payment</option>
            <option value="WALLET_RECHARGE">Wallet Top-up</option>
            <option value="P2P_TRANSACTION">P2P Settlement</option>
            <option value="REFUND">Refund</option>
          </select>

          <select className="admin-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading transaction settlements…</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No transactions found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>User / Consumer</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Energy Units</th>
                <th>Payment Method</th>
                <th>Blockchain Hash</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>
                    <code style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>{tx.transactionId}</code>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{tx.userName || "Consumer"}</div>
                    <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{tx.userEmail || "—"}</div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge--user" style={{ fontSize: "0.72rem" }}>
                      {tx.type.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: tx.type === "WALLET_RECHARGE" ? "#16a34a" : "#0f172a" }}>
                      ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{tx.energyUnits > 0 ? `${tx.energyUnits.toFixed(2)} kWh` : "—"}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "#475569" }}>{tx.paymentMethod}</span>
                  </td>
                  <td>
                    {tx.txHash ? (
                      <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748b" }}>
                        {tx.txHash.slice(0, 8)}…{tx.txHash.slice(-6)}
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        tx.status === "SUCCESS"
                          ? "admin-badge--connected"
                          : tx.status === "PENDING"
                          ? "admin-badge--warning"
                          : "admin-badge--error"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="admin-action-btn admin-action-btn--secondary"
                      onClick={() => {
                        setSelectedTx(tx);
                        setModalOpen(true);
                      }}
                    >
                      Details
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
        <div>Showing {transactions.length} of {totalCount} records</div>
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

      {/* Transaction Details Modal */}
      {modalOpen && selectedTx ? (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="admin-modal-title">Transaction Receipt</h3>
              <button type="button" className="admin-modal-close" onClick={() => setModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ textAlign: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: "16px" }}>
                <span className="admin-badge admin-badge--connected" style={{ marginBottom: "8px" }}>
                  {selectedTx.status}
                </span>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#0f172a" }}>
                  ₹{selectedTx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "2px" }}>
                  {selectedTx.description || selectedTx.type.replace("_", " ")}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Transaction Reference</span>
                  <div style={{ fontWeight: 700 }}>{selectedTx.transactionId}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Settlement Type</span>
                  <div style={{ fontWeight: 600 }}>{selectedTx.type}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Customer / Consumer</span>
                  <div>{selectedTx.userName || selectedTx.userEmail || "—"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Payment Rail</span>
                  <div>{selectedTx.paymentMethod}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Energy Equivalent</span>
                  <div>{selectedTx.energyUnits > 0 ? `${selectedTx.energyUnits} kWh` : "N/A"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Processed Timestamp</span>
                  <div>{new Date(selectedTx.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {selectedTx.txHash ? (
                <div style={{ marginTop: "16px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                    Blockchain Transaction Hash (Proof)
                  </span>
                  <div style={{ fontFamily: "monospace", fontSize: "0.82rem", wordBreak: "break-all", color: "#0284c7", marginTop: "4px" }}>
                    {selectedTx.txHash}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="admin-modal-foot">
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
