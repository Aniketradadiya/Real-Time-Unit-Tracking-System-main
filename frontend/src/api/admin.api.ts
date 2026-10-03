import { apiRequest } from "./axios";
import { getToken } from "../utils/token";

export interface AdminApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  count?: number;
}

function authHeader() {
  return { token: getToken() };
}

export const adminApi = {
  // Dashboard Overview
  getDashboardOverview: () =>
    apiRequest<AdminApiResponse<any>>("/admin/dashboard", authHeader()),

  // Users
  getUsers: (params?: Record<string, string | number>) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return apiRequest<AdminApiResponse<any[]>>(`/admin/users${qs}`, authHeader());
  },

  createUser: (payload: any) =>
    apiRequest<AdminApiResponse<any>>("/admin/users", {
      ...authHeader(),
      method: "POST",
      body: payload,
    }),

  getUserDetails: (id: string) =>
    apiRequest<AdminApiResponse<any>>(`/admin/users/${id}`, authHeader()),

  updateUser: (id: string, payload: any) =>
    apiRequest<AdminApiResponse<any>>(`/admin/users/${id}`, {
      ...authHeader(),
      method: "PATCH",
      body: payload,
    }),

  resetUserPassword: (id: string, newPassword?: string) =>
    apiRequest<AdminApiResponse<{ temporaryPassword?: string }>>(`/admin/users/${id}/reset-password`, {
      ...authHeader(),
      method: "POST",
      body: { newPassword },
    }),

  deleteUser: (id: string) =>
    apiRequest<AdminApiResponse<any>>(`/admin/users/${id}`, {
      ...authHeader(),
      method: "DELETE",
    }),

  // Devices
  getDevices: () =>
    apiRequest<AdminApiResponse<any[]>>("/admin/devices", authHeader()),

  createDevice: (payload: any) =>
    apiRequest<AdminApiResponse<any>>("/admin/devices", {
      ...authHeader(),
      method: "POST",
      body: payload,
    }),

  updateDevice: (id: string, payload: any) =>
    apiRequest<AdminApiResponse<any>>(`/admin/devices/${id}`, {
      ...authHeader(),
      method: "PATCH",
      body: payload,
    }),

  deleteDevice: (id: string) =>
    apiRequest<AdminApiResponse<any>>(`/admin/devices/${id}`, {
      ...authHeader(),
      method: "DELETE",
    }),

  getDeviceTelemetry: (id: string) =>
    apiRequest<AdminApiResponse<any>>(`/admin/devices/${id}/telemetry`, authHeader()),

  // Energy Monitoring
  getEnergyMonitoring: (params?: Record<string, string>) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return apiRequest<AdminApiResponse<any>>(`/admin/energy${qs}`, authHeader());
  },

  // Alerts
  getAlerts: (params?: Record<string, string | number>) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return apiRequest<AdminApiResponse<any[]>>(`/admin/alerts${qs}`, authHeader());
  },

  updateAlert: (id: string, status: "RESOLVED" | "ACKNOWLEDGED") =>
    apiRequest<AdminApiResponse<any>>(`/admin/alerts/${id}`, {
      ...authHeader(),
      method: "PATCH",
      body: { status },
    }),

  deleteAlert: (id: string) =>
    apiRequest<AdminApiResponse<any>>(`/admin/alerts/${id}`, {
      ...authHeader(),
      method: "DELETE",
    }),

  // Transactions
  getTransactions: (params?: Record<string, string | number>) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return apiRequest<AdminApiResponse<any[]>>(`/admin/transactions${qs}`, authHeader());
  },

  // Smart Contracts
  getSmartContracts: () =>
    apiRequest<AdminApiResponse<any[]>>("/admin/contracts", authHeader()),

  createSmartContract: (payload: any) =>
    apiRequest<AdminApiResponse<any>>("/admin/contracts", {
      ...authHeader(),
      method: "POST",
      body: payload,
    }),

  updateSmartContract: (id: string, payload: any) =>
    apiRequest<AdminApiResponse<any>>(`/admin/contracts/${id}`, {
      ...authHeader(),
      method: "PATCH",
      body: payload,
    }),

  // Marketplace
  getMarketplace: () =>
    apiRequest<AdminApiResponse<any>>("/admin/marketplace", authHeader()),

  updateMarketplaceListing: (id: string, payload: any) =>
    apiRequest<AdminApiResponse<any>>(`/admin/marketplace/${id}`, {
      ...authHeader(),
      method: "PATCH",
      body: payload,
    }),

  // System Logs
  getSystemLogs: (params?: Record<string, string | number>) => {
    const qs = params
      ? "?" +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== "")
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&")
      : "";
    return apiRequest<AdminApiResponse<any[]>>(`/admin/logs${qs}`, authHeader());
  },

  // Settings
  getSettings: () =>
    apiRequest<AdminApiResponse<any>>("/admin/settings", authHeader()),

  updateSettings: (payload: any) =>
    apiRequest<AdminApiResponse<any>>("/admin/settings", {
      ...authHeader(),
      method: "PATCH",
      body: payload,
    }),
};
