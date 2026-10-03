import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../api/admin.api";
import { IconSearch, IconRefresh } from "../../components/admin/adminIcons";

interface UserItem {
  _id: string;
  id?: string;
  name?: string;
  email: string;
  mobile?: string;
  address?: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  energyLimit?: number;
  deviceCount?: number;
  energyConsumedKwh?: number;
  lastActive?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userDetailsExtra, setUserDetailsExtra] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit / Create Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    role: "USER" as "USER" | "ADMIN",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
    energyLimit: "25",
  });

  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 10,
      });
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages);
          setTotalCount(res.pagination.total);
        }
      }
    } catch (err: any) {
      showNotice(err?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const openViewModal = async (u: UserItem) => {
    setSelectedUser(u);
    setViewDetailsOpen(true);
    try {
      const res = await adminApi.getUserDetails(u._id || u.id || "");
      if (res.success) {
        setUserDetailsExtra(res.data);
      }
    } catch {
      // ignore
    }
  };

  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setFormData({
      name: u.name || "",
      email: u.email,
      password: "",
      mobile: u.mobile || "",
      address: u.address || "",
      role: u.role || "USER",
      status: u.status || "ACTIVE",
      energyLimit: String(u.energyLimit || 25),
    });
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminApi.updateUser(selectedUser._id || selectedUser.id || "", {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        role: formData.role,
        status: formData.status,
        energyLimit: Number(formData.energyLimit),
      });
      showNotice("User profile updated successfully");
      setEditModalOpen(false);
      void loadUsers();
    } catch (err: any) {
      showNotice(err?.message || "Failed to update user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminApi.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password || "Temporary@123",
        mobile: formData.mobile,
        address: formData.address,
        role: formData.role,
        energyLimit: Number(formData.energyLimit),
      });
      showNotice("New user created successfully");
      setCreateModalOpen(false);
      setFormData({ name: "", email: "", password: "", mobile: "", address: "", role: "USER", status: "ACTIVE", energyLimit: "25" });
      void loadUsers();
    } catch (err: any) {
      showNotice(err?.message || "Failed to create user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (u: UserItem) => {
    const nextStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (!window.confirm(`Are you sure you want to mark user ${u.email} as ${nextStatus}?`)) return;

    try {
      await adminApi.updateUser(u._id || u.id || "", { status: nextStatus });
      showNotice(`User marked as ${nextStatus}`);
      void loadUsers();
    } catch (err: any) {
      showNotice(err?.message || "Failed to change user status", "error");
    }
  };

  const handleToggleRole = async (u: UserItem) => {
    const nextRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`Are you sure you want to change role for ${u.email} to ${nextRole}?`)) return;

    try {
      await adminApi.updateUser(u._id || u.id || "", { role: nextRole });
      showNotice(`User role changed to ${nextRole}`);
      void loadUsers();
    } catch (err: any) {
      showNotice(err?.message || "Failed to change role", "error");
    }
  };

  const handleResetPassword = async (u: UserItem) => {
    if (!window.confirm(`Reset access password for ${u.email}? A temporary password will be generated.`)) return;

    try {
      const res = await adminApi.resetUserPassword(u._id || u.id || "");
      if (res.success && res.data?.temporaryPassword) {
        window.alert(`Password reset complete!\nTemporary Password: ${res.data.temporaryPassword}\nPlease provide this securely to the user.`);
        showNotice("Password reset successfully");
      }
    } catch (err: any) {
      showNotice(err?.message || "Failed to reset password", "error");
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (!window.confirm(`CONFIRM DELETION: Are you sure you want to soft-delete and deactivate ${u.email}?`)) return;

    try {
      await adminApi.deleteUser(u._id || u.id || "");
      showNotice("User deleted and deactivated");
      void loadUsers();
    } catch (err: any) {
      showNotice(err?.message || "Failed to delete user", "error");
    }
  };

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">User Management</h1>
          <p className="gridos-page-desc">
            Manage user roles, device assignments, security status, and electricity threshold limits.
          </p>
        </div>

        <button
          type="button"
          className="admin-action-btn admin-action-btn--primary"
          onClick={() => {
            setFormData({ name: "", email: "", password: "", mobile: "", address: "", role: "USER", status: "ACTIVE", energyLimit: "25" });
            setCreateModalOpen(true);
          }}
        >
          + Add New User
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

      {/* Toolbar: Search, Filters */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <IconSearch />
          <input
            placeholder="Search by name, email, or mobile..."
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
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            type="button"
            className="admin-action-btn admin-action-btn--secondary"
            onClick={() => void loadUsers()}
            title="Refresh Users"
          >
            <IconRefresh />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading registered users…</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No users match the search criteria.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Devices</th>
                <th>Energy (kWh)</th>
                <th>Joined</th>
                <th>Last Active</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id || u.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{u.name || "No name"}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{u.email}</div>
                    {u.mobile ? <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{u.mobile}</div> : null}
                  </td>
                  <td>
                    <span className={`admin-badge ${u.role === "ADMIN" ? "admin-badge--admin" : "admin-badge--user"}`}>
                      {u.role || "USER"}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${u.status === "ACTIVE" ? "admin-badge--active" : "admin-badge--inactive"}`}>
                      {u.status || "ACTIVE"}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: "#0284c7" }}>{u.deviceCount ?? 0}</strong>
                  </td>
                  <td>
                    <strong>{(u.energyConsumedKwh ?? 0).toFixed(1)}</strong>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {u.lastActive ? new Date(u.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent"}
                  </td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", flexWrap: "nowrap" }}>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--secondary"
                        onClick={() => openViewModal(u)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--secondary"
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--ghost"
                        onClick={() => handleToggleRole(u)}
                        title="Toggle Role"
                      >
                        Role
                      </button>
                      <button
                        type="button"
                        className={`admin-action-btn ${u.status === "ACTIVE" ? "admin-action-btn--danger" : "admin-action-btn--success"}`}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--ghost"
                        onClick={() => handleResetPassword(u)}
                        title="Reset user password"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn admin-action-btn--danger"
                        onClick={() => handleDeleteUser(u)}
                        title="Soft delete user"
                      >
                        Delete
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
          Showing {users.length} of {totalCount} users
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

      {/* View User Details Modal */}
      {viewDetailsOpen && selectedUser ? (
        <div className="admin-modal-overlay" onClick={() => setViewDetailsOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h3 className="admin-modal-title">User Account Details</h3>
              <button type="button" className="admin-modal-close" onClick={() => setViewDetailsOpen(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>User ID</span>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", wordBreak: "break-all" }}>{selectedUser._id || selectedUser.id}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Full Name</span>
                  <div style={{ fontWeight: 700 }}>{selectedUser.name || "N/A"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Email Address</span>
                  <div style={{ fontWeight: 600 }}>{selectedUser.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Mobile</span>
                  <div>{selectedUser.mobile || "N/A"}</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>System Role</span>
                  <div>
                    <span className={`admin-badge ${selectedUser.role === "ADMIN" ? "admin-badge--admin" : "admin-badge--user"}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Account Status</span>
                  <div>
                    <span className={`admin-badge ${selectedUser.status === "ACTIVE" ? "admin-badge--active" : "admin-badge--inactive"}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Configured Energy Limit</span>
                  <div style={{ fontWeight: 700, color: "#0284c7" }}>{selectedUser.energyLimit || 25} kWh</div>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Registered On</span>
                  <div>{new Date(selectedUser.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {selectedUser.address ? (
                <div style={{ marginBottom: "18px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Physical Address</span>
                  <div style={{ fontSize: "0.85rem", marginTop: "2px" }}>{selectedUser.address}</div>
                </div>
              ) : null}

              {/* Linked Devices Section */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px" }}>
                <h4 style={{ margin: "0 0 8px", fontSize: "0.92rem", color: "#0f172a" }}>
                  Linked Devices ({userDetailsExtra?.devices?.length || selectedUser.deviceCount || 0})
                </h4>
                {userDetailsExtra?.devices?.length > 0 ? (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {userDetailsExtra.devices.map((d: any) => (
                      <div key={d._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: "8px" }}>
                        <div>
                          <strong>{d.deviceName}</strong> ({d.deviceId})
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Location: {d.location || "Default"}</div>
                        </div>
                        <span className={`admin-badge ${d.status === "ACTIVE" ? "admin-badge--connected" : "admin-badge--disconnected"}`}>
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0 }}>No smart meters directly assigned to this account.</p>
                )}
              </div>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setViewDetailsOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit User Modal */}
      {editModalOpen && selectedUser ? (
        <div className="admin-modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleUpdateUser}>
              <div className="admin-modal-head">
                <h3 className="admin-modal-title">Edit User Profile</h3>
                <button type="button" className="admin-modal-close" onClick={() => setEditModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name</label>
                  <input
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email Address</label>
                  <input
                    className="admin-form-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Mobile Number</label>
                    <input
                      className="admin-form-input"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Energy Alert Limit (kWh)</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      min="1"
                      value={formData.energyLimit}
                      onChange={(e) => setFormData({ ...formData, energyLimit: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">System Role</label>
                    <select
                      className="admin-select"
                      style={{ width: "100%" }}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Account Status</label>
                    <select
                      className="admin-select"
                      style={{ width: "100%" }}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Address</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-modal-foot">
                <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn admin-action-btn--primary" disabled={actionLoading}>
                  {actionLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Create New User Modal */}
      {createModalOpen ? (
        <div className="admin-modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateUser}>
              <div className="admin-modal-head">
                <h3 className="admin-modal-title">Create New User Account</h3>
                <button type="button" className="admin-modal-close" onClick={() => setCreateModalOpen(false)}>
                  ×
                </button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name</label>
                  <input
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email Address</label>
                  <input
                    className="admin-form-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Initial Password</label>
                  <input
                    className="admin-form-input"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank for auto-generated temporary password"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Mobile Number</label>
                    <input
                      className="admin-form-input"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Role</label>
                    <select
                      className="admin-select"
                      style={{ width: "100%" }}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Energy Threshold Limit (kWh)</label>
                  <input
                    className="admin-form-input"
                    type="number"
                    min="1"
                    value={formData.energyLimit}
                    onChange={(e) => setFormData({ ...formData, energyLimit: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-foot">
                <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn admin-action-btn--primary" disabled={actionLoading}>
                  {actionLoading ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
