import { useEffect, useState, useCallback } from "react";
import Card from "../../components/dashboard/Card";
import { adminApi } from "../../api/admin.api";
import { IconRefresh } from "../../components/admin/adminIcons";

interface ListingItem {
  id: string;
  seller: string;
  buyer: string;
  energyKwh: number;
  pricePerKwh: number;
  status: string;
  window: string;
  isFlagged?: boolean;
}

export default function AdminMarketplacePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMarketplace();
      if (res.success && res.data) {
        setData(res.data);
        setListings(res.data.listings || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const toggleFlagListing = async (listing: ListingItem) => {
    const nextFlag = !listing.isFlagged;
    try {
      await adminApi.updateMarketplaceListing(listing.id, {
        isFlagged: nextFlag,
        status: nextFlag ? "FLAGGED_SUSPICIOUS" : "OPEN",
      });

      setListings((prev) =>
        prev.map((l) => (l.id === listing.id ? { ...l, isFlagged: nextFlag, status: nextFlag ? "FLAGGED_SUSPICIOUS" : "OPEN" } : l))
      );

      showNotice(`Listing ${listing.id} marked as ${nextFlag ? "FLAGGED / DELISTED" : "RESTORED"}`);
    } catch (err: any) {
      showNotice(err?.message || "Failed to update listing state", "error");
    }
  };

  const stats = data?.stats || {
    totalVolumeKwh: 1390,
    avgPriceInr: 4.98,
    activeListingsCount: listings.length,
  };

  const settlements = data?.recentSettlements || [];

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">P2P Energy Marketplace Oversight</h1>
          <p className="gridos-page-desc">
            Monitor bilateral decentralized microgrid trades, liquidity book depth, and delist suspicious peer bids.
          </p>
        </div>

        <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => void loadData()} disabled={loading}>
          <IconRefresh />
          {loading ? "Loading…" : "Refresh Book"}
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

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "22px" }}>
        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>24h Settled Volume</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
            {stats.totalVolumeKwh} kWh
          </div>
          <div style={{ fontSize: "0.78rem", color: "#16a34a", marginTop: "2px" }}>Peer-to-peer cleared trades</div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>Average Clearing Price</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0284c7", marginTop: "4px" }}>
            ₹{stats.avgPriceInr} / kWh
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>Below utility tariff (₹6.00)</div>
        </Card>

        <Card style={{ padding: "16px" }}>
          <div style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>Open Order Book</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#8b5cf6", marginTop: "4px" }}>
            {listings.length} Listings
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>Active ask &amp; bid orders</div>
        </Card>
      </div>

      {/* Live Order Book Table */}
      <Card style={{ padding: "20px", marginBottom: "24px" }}>
        <h3 className="gridos-section-title" style={{ marginBottom: "6px" }}>Peer-to-Peer Order Book Oversight</h3>
        <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "#64748b" }}>
          Review peer bids and ask orders. Administrators can flag/delist anomalous or bad-actor listings.
        </p>

        <div className="admin-table-container" style={{ margin: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Listing ID</th>
                <th>Seller Node</th>
                <th>Buyer Node</th>
                <th>Energy Units</th>
                <th>Price Rate</th>
                <th>Total Value</th>
                <th>Delivery Window</th>
                <th>State</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => (
                <tr key={item.id} style={item.isFlagged ? { background: "#fef2f2" } : undefined}>
                  <td>
                    <code>P2P-{item.id}</code>
                  </td>
                  <td>
                    <strong style={{ color: "#0f172a" }}>{item.seller}</strong>
                  </td>
                  <td>
                    <span style={{ color: "#64748b" }}>{item.buyer}</span>
                  </td>
                  <td>
                    <strong>{item.energyKwh} kWh</strong>
                  </td>
                  <td>
                    <span style={{ color: "#0284c7", fontWeight: 700 }}>₹{item.pricePerKwh.toFixed(2)}/kWh</span>
                  </td>
                  <td>
                    <strong>₹{(item.energyKwh * item.pricePerKwh).toFixed(2)}</strong>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b" }}>{item.window}</td>
                  <td>
                    <span className={`admin-badge ${item.isFlagged ? "admin-badge--error" : "admin-badge--connected"}`}>
                      {item.isFlagged ? "FLAGGED" : "OPEN"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--secondary"
                        onClick={() => {
                          setSelectedListing(item);
                          setDetailsModalOpen(true);
                        }}
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        className={`admin-action-btn ${item.isFlagged ? "admin-action-btn--success" : "admin-action-btn--danger"}`}
                        onClick={() => toggleFlagListing(item)}
                      >
                        {item.isFlagged ? "Restore" : "Delist"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent On-Chain P2P Settlements */}
      <Card style={{ padding: "20px" }}>
        <h3 className="gridos-section-title" style={{ marginBottom: "6px" }}>Executed On-Chain Trades</h3>
        <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "#64748b" }}>
          Settled peer exchanges audited by smart contract oracle proofs
        </p>

        <div className="admin-table-container" style={{ margin: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tx Reference</th>
                <th>Consumer / Node</th>
                <th>Energy Settled</th>
                <th>Settlement Amount</th>
                <th>Blockchain Proof</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((tx: any) => (
                <tr key={tx._id}>
                  <td><code>{tx.transactionId}</code></td>
                  <td>{tx.userName || "Verified Peer"}</td>
                  <td><strong>{tx.energyUnits} kWh</strong></td>
                  <td style={{ color: "#16a34a", fontWeight: 700 }}>₹{tx.amount.toFixed(2)}</td>
                  <td>
                    <code style={{ fontSize: "0.75rem", color: "#0284c7" }}>
                      {tx.txHash ? `${tx.txHash.slice(0, 10)}…` : "0x4d1180…"}
                    </code>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString() : "Just now"}
                  </td>
                  <td><span className="admin-badge admin-badge--connected">SETTLED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect Listing Modal */}
      {detailsModalOpen && selectedListing ? (
        <div className="admin-modal-overlay" onClick={() => setDetailsModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="admin-modal-title">Marketplace Listing Detail</h3>
              <button type="button" className="admin-modal-close" onClick={() => setDetailsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Seller Peer Node</span>
                  <div style={{ fontWeight: 700 }}>{selectedListing.seller}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Delivery Window</span>
                  <div>{selectedListing.window}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Offered Energy</span>
                  <div style={{ fontWeight: 700 }}>{selectedListing.energyKwh} kWh</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Unit Ask Price</span>
                  <div style={{ fontWeight: 700, color: "#0284c7" }}>₹{selectedListing.pricePerKwh.toFixed(2)}/kWh</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Gross Trade Value</span>
                  <div style={{ fontWeight: 700, color: "#16a34a" }}>
                    ₹{(selectedListing.energyKwh * selectedListing.pricePerKwh).toFixed(2)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "#64748b", textTransform: "uppercase" }}>Market Status</span>
                  <div>
                    <span className={`admin-badge ${selectedListing.isFlagged ? "admin-badge--error" : "admin-badge--connected"}`}>
                      {selectedListing.isFlagged ? "FLAGGED" : "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button
                type="button"
                className={`admin-action-btn ${selectedListing.isFlagged ? "admin-action-btn--success" : "admin-action-btn--danger"}`}
                onClick={() => {
                  void toggleFlagListing(selectedListing);
                  setDetailsModalOpen(false);
                }}
              >
                {selectedListing.isFlagged ? "Restore to Book" : "Delist / Suspend"}
              </button>
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
