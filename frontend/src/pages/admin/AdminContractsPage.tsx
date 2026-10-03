import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { IconAdminShield } from "../../components/admin/adminIcons";

interface ContractItem {
  _id: string;
  contractAddress: string;
  name: string;
  network: string;
  deploymentStatus: "DEPLOYED" | "PENDING" | "FAILED" | "DISABLED";
  owner: string;
  deploymentDate: string;
  txHash: string;
  compilerVersion?: string;
  eventsCount: number;
  isActive: boolean;
}

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contractAddress: "",
    network: "Ethereum Mainnet",
    txHash: "",
    compilerVersion: "Solidity 0.8.23",
  });

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSmartContracts();
      if (res.success && Array.isArray(res.data)) {
        setContracts(res.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  const toggleContractStatus = async (contract: ContractItem) => {
    try {
      const nextActive = !contract.isActive;
      await adminApi.updateSmartContract(contract._id, {
        isActive: nextActive,
        deploymentStatus: nextActive ? "DEPLOYED" : "DISABLED",
      });
      showNotice(`Contract integration ${nextActive ? "ENABLED" : "DISABLED"}`);
      void loadContracts();
    } catch (err: any) {
      showNotice(err?.message || "Failed to update contract status", "error");
    }
  };

  const handleRegisterContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createSmartContract(formData);
      showNotice("Smart contract registered in system");
      setRegisterModalOpen(false);
      setFormData({ name: "", contractAddress: "", network: "Ethereum Mainnet", txHash: "", compilerVersion: "Solidity 0.8.23" });
      void loadContracts();
    } catch (err: any) {
      showNotice(err?.message || "Failed to register contract", "error");
    }
  };

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">Smart Contract Management</h1>
          <p className="gridos-page-desc">
            Monitor deployed on-chain protocols, microgrid settlement verifiers, and metering oracle smart contracts.
          </p>
        </div>

        <button
          type="button"
          className="admin-action-btn admin-action-btn--primary"
          onClick={() => setRegisterModalOpen(true)}
        >
          + Register Contract
        </button>
      </header>

      {/* Security Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 18px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "12px",
          color: "#166534",
          fontSize: "0.85rem",
          marginBottom: "16px",
        }}
      >
        <IconAdminShield />
        <span>
          <strong>Cryptographic Security Verified:</strong> GridOS client operates purely on verifiable public addresses
          and RPC query endpoints. No private keys or custodial credentials are stored on the client.
        </span>
      </div>

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

      {/* Contracts Grid / Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading verified smart contracts…</div>
        ) : contracts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No smart contracts configured.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Contract Name</th>
                <th>Address</th>
                <th>Network</th>
                <th>Status</th>
                <th>Deployer</th>
                <th>Deployed On</th>
                <th>Events Verified</th>
                <th>Integration</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{c.compilerVersion || "Solidity"}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: "0.8rem", color: "#0284c7" }}>
                      {c.contractAddress.slice(0, 8)}…{c.contractAddress.slice(-6)}
                    </code>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge--user">{c.network}</span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        c.deploymentStatus === "DEPLOYED"
                          ? "admin-badge--connected"
                          : c.deploymentStatus === "DISABLED"
                          ? "admin-badge--inactive"
                          : "admin-badge--warning"
                      }`}
                    >
                      {c.deploymentStatus}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", color: "#475569" }}>
                      {c.owner.slice(0, 8)}…
                    </span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    {c.deploymentDate ? new Date(c.deploymentDate).toLocaleDateString() : "-"}
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a" }}>{c.eventsCount.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${c.isActive ? "admin-badge--connected" : "admin-badge--disconnected"}`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--secondary"
                        onClick={() => {
                          setSelectedContract(c);
                          setDetailsModalOpen(true);
                        }}
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        className={`admin-action-btn ${c.isActive ? "admin-action-btn--danger" : "admin-action-btn--success"}`}
                        onClick={() => toggleContractStatus(c)}
                      >
                        {c.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contract Details Modal */}
      {detailsModalOpen && selectedContract ? (
        <div className="admin-modal-overlay" onClick={() => setDetailsModalOpen(false)}>
          <div className="admin-modal-card" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="admin-modal-title">{selectedContract.name}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDetailsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gap: "12px", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Contract Public Address</span>
                  <div style={{ fontFamily: "monospace", color: "#0284c7", fontWeight: 700, wordBreak: "break-all" }}>
                    {selectedContract.contractAddress}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Target Blockchain Network</span>
                  <div style={{ fontWeight: 600 }}>{selectedContract.network}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Deployment Transaction Hash</span>
                  <div style={{ fontFamily: "monospace", color: "#475569", wordBreak: "break-all" }}>
                    {selectedContract.txHash}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Deployer Account</span>
                    <div style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{selectedContract.owner}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Compiler Release</span>
                    <div>{selectedContract.compilerVersion || "Solidity 0.8.23"}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Deployment Timestamp</span>
                    <div>{new Date(selectedContract.deploymentDate).toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Settlement Events Emitted</span>
                    <div style={{ fontWeight: 700, color: "#16a34a" }}>{selectedContract.eventsCount} events</div>
                  </div>
                </div>
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

      {/* Register Contract Modal */}
      {registerModalOpen ? (
        <div className="admin-modal-overlay" onClick={() => setRegisterModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRegisterContract}>
              <div className="admin-modal-head">
                <h3 className="admin-modal-title">Register Smart Contract Integration</h3>
                <button type="button" className="admin-modal-close" onClick={() => setRegisterModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Contract Label</label>
                  <input
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Energy Billing Vault v3"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Contract Address (0x...)</label>
                  <input
                    className="admin-form-input"
                    value={formData.contractAddress}
                    onChange={(e) => setFormData({ ...formData, contractAddress: e.target.value })}
                    placeholder="0x..."
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Network</label>
                    <select
                      className="admin-select"
                      style={{ width: "100%" }}
                      value={formData.network}
                      onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    >
                      <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                      <option value="Sepolia Testnet">Sepolia Testnet</option>
                      <option value="Polygon PoS">Polygon PoS</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Compiler Version</label>
                    <input
                      className="admin-form-input"
                      value={formData.compilerVersion}
                      onChange={(e) => setFormData({ ...formData, compilerVersion: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Deployment Tx Hash</label>
                  <input
                    className="admin-form-input"
                    value={formData.txHash}
                    onChange={(e) => setFormData({ ...formData, txHash: e.target.value })}
                    placeholder="0x..."
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-foot">
                <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setRegisterModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn admin-action-btn--primary">
                  Register Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
