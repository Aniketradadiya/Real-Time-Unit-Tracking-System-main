import { useEffect, useState, useCallback } from "react";
import Card from "../../components/dashboard/Card";
import { adminApi } from "../../api/admin.api";
import { IconRefresh } from "../../components/admin/adminIcons";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [settings, setSettings] = useState({
    systemName: "GridOS Electricity & IoT Management Platform",
    energyMonitoringInterval: 5,
    defaultEnergyLimit: 25,
    tariffRatePerKwh: 6.0,
    alertThresholds: {
      highPowerThresholdWatts: 3000,
      offlineTimeoutMinutes: 5,
      criticalPowerThresholdWatts: 5000,
    },
    userSettings: {
      allowRegistration: true,
      defaultRole: "USER" as "USER" | "ADMIN",
      requireEmailVerification: false,
    },
    deviceSettings: {
      deviceTimeoutSeconds: 300,
      offlineThresholdMinutes: 5,
      dataRefreshIntervalSeconds: 2,
    },
    alertSettings: {
      enableAlerts: true,
      criticalAlertThreshold: 4500,
      notifyEmail: true,
      notifyPush: true,
    },
    securitySettings: {
      sessionTimeoutMinutes: 1440,
      requireStrongPassword: true,
      maxFailedLogins: 5,
    },
  });

  const showNotice = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          alertThresholds: { ...prev.alertThresholds, ...(res.data.alertThresholds || {}) },
          userSettings: { ...prev.userSettings, ...(res.data.userSettings || {}) },
          deviceSettings: { ...prev.deviceSettings, ...(res.data.deviceSettings || {}) },
          alertSettings: { ...prev.alertSettings, ...(res.data.alertSettings || {}) },
          securitySettings: { ...prev.securitySettings, ...(res.data.securitySettings || {}) },
        }));
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      showNotice("System configurations saved successfully!");
    } catch (err: any) {
      showNotice(err?.message || "Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="gridos-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 className="gridos-page-title">Global Platform Configuration</h1>
          <p className="gridos-page-desc">
            Manage system alert thresholds, device heartbeat timeouts, default consumer quotas, and security boundaries.
          </p>
        </div>

        <button type="button" className="admin-action-btn admin-action-btn--secondary" onClick={() => void loadSettings()} disabled={loading}>
          <IconRefresh />
          {loading ? "Loading…" : "Reload Settings"}
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

      <form onSubmit={handleSave}>
        <div style={{ display: "grid", gap: "20px" }}>
          {/* SYSTEM SETTINGS */}
          <Card style={{ padding: "22px" }}>
            <h3 className="gridos-section-title" style={{ marginBottom: "4px" }}>System Settings</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#64748b" }}>
              Core naming, monitoring cadence, and billing baseline
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">System Platform Name</label>
                <input
                  className="admin-form-input"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Monitoring Interval (Seconds)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="1"
                  value={settings.energyMonitoringInterval}
                  onChange={(e) => setSettings({ ...settings, energyMonitoringInterval: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Default Consumer Energy Quota (kWh)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="1"
                  value={settings.defaultEnergyLimit}
                  onChange={(e) => setSettings({ ...settings, defaultEnergyLimit: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Tariff Rate (₹ / kWh)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={settings.tariffRatePerKwh}
                  onChange={(e) => setSettings({ ...settings, tariffRatePerKwh: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
          </Card>

          {/* USER & REGISTRATION SETTINGS */}
          <Card style={{ padding: "22px" }}>
            <h3 className="gridos-section-title" style={{ marginBottom: "4px" }}>User &amp; Registration Policy</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#64748b" }}>
              Onboarding controls and initial access privileges
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Allow Public Registration</label>
                <select
                  className="admin-select"
                  style={{ width: "100%" }}
                  value={settings.userSettings.allowRegistration ? "true" : "false"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      userSettings: { ...settings.userSettings, allowRegistration: e.target.value === "true" },
                    })
                  }
                >
                  <option value="true">Enabled (Open to Public)</option>
                  <option value="false">Disabled (Admin Provision Only)</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Default Registered Role</label>
                <select
                  className="admin-select"
                  style={{ width: "100%" }}
                  value={settings.userSettings.defaultRole}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      userSettings: { ...settings.userSettings, defaultRole: e.target.value as any },
                    })
                  }
                >
                  <option value="USER">Standard User (USER)</option>
                  <option value="ADMIN">Administrator (ADMIN)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* DEVICE TELEMETRY SETTINGS */}
          <Card style={{ padding: "22px" }}>
            <h3 className="gridos-section-title" style={{ marginBottom: "4px" }}>Device &amp; ESP32 Hardware Policy</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#64748b" }}>
              Communication timeouts and telemetry polling frequencies
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Heartbeat Timeout (Seconds)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="10"
                  value={settings.deviceSettings.deviceTimeoutSeconds}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      deviceSettings: { ...settings.deviceSettings, deviceTimeoutSeconds: Number(e.target.value) },
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Offline Mark Threshold (Minutes)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="1"
                  value={settings.deviceSettings.offlineThresholdMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      deviceSettings: { ...settings.deviceSettings, offlineThresholdMinutes: Number(e.target.value) },
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Client Refresh Polling (Seconds)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="1"
                  value={settings.deviceSettings.dataRefreshIntervalSeconds}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      deviceSettings: { ...settings.deviceSettings, dataRefreshIntervalSeconds: Number(e.target.value) },
                    })
                  }
                  required
                />
              </div>
            </div>
          </Card>

          {/* ALERT & THRESHOLD SETTINGS */}
          <Card style={{ padding: "22px" }}>
            <h3 className="gridos-section-title" style={{ marginBottom: "4px" }}>Alert &amp; Incident Rules</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#64748b" }}>
              Automated anomaly detection thresholds and incident escalations
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">High Power Warning (Watts)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="500"
                  value={settings.alertThresholds.highPowerThresholdWatts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alertThresholds: { ...settings.alertThresholds, highPowerThresholdWatts: Number(e.target.value) },
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Critical Surge Threshold (Watts)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="1000"
                  value={settings.alertThresholds.criticalPowerThresholdWatts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alertThresholds: { ...settings.alertThresholds, criticalPowerThresholdWatts: Number(e.target.value) },
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email Notification Channel</label>
                <select
                  className="admin-select"
                  style={{ width: "100%" }}
                  value={settings.alertSettings.notifyEmail ? "true" : "false"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alertSettings: { ...settings.alertSettings, notifyEmail: e.target.value === "true" },
                    })
                  }
                >
                  <option value="true">Enabled (SMTP Alert Dispatch)</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </Card>

          {/* SECURITY & SESSION SETTINGS */}
          <Card style={{ padding: "22px" }}>
            <h3 className="gridos-section-title" style={{ marginBottom: "4px" }}>Security &amp; Administrative Sessions</h3>
            <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "#64748b" }}>
              RBAC access control, JWT session duration, and credential constraints
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Admin Session Duration (Minutes)</label>
                <input
                  className="admin-form-input"
                  type="number"
                  min="15"
                  value={settings.securitySettings.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      securitySettings: { ...settings.securitySettings, sessionTimeoutMinutes: Number(e.target.value) },
                    })
                  }
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Enforce Strong Passwords</label>
                <select
                  className="admin-select"
                  style={{ width: "100%" }}
                  value={settings.securitySettings.requireStrongPassword ? "true" : "false"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      securitySettings: { ...settings.securitySettings, requireStrongPassword: e.target.value === "true" },
                    })
                  }
                >
                  <option value="true">Enforced (8+ characters, digits, symbols)</option>
                  <option value="false">Standard</option>
                </select>
              </div>
            </div>
          </Card>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
            <button
              type="submit"
              className="admin-action-btn admin-action-btn--primary"
              style={{ padding: "10px 24px", fontSize: "0.92rem" }}
              disabled={saving}
            >
              {saving ? "Saving Configurations…" : "Save All Platform Settings"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
