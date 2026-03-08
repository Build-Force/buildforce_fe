import api from "@/utils/api";

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminApi = {
  getDashboard: (range: "7d" | "30d" | "90d" = "30d") =>
    api.get("/api/admin/dashboard", { params: { range }, headers: getAuthHeaders() }),

  getUsers: (params?: Record<string, string | number>) =>
    api.get("/api/admin/users", { params, headers: getAuthHeaders() }),

  updateUserStatus: (id: string, status: "ACTIVE" | "SUSPENDED" | "DELETED") =>
    api.patch(`/api/admin/users/${id}/status`, { status }, { headers: getAuthHeaders() }),

  getHrList: (params?: Record<string, string | number>) =>
    api.get("/api/admin/hr", { params, headers: getAuthHeaders() }),

  getHrById: (id: string) => api.get(`/api/admin/hr/${id}`, { headers: getAuthHeaders() }),

  updateHrVerification: (id: string, verificationStatus: "PENDING" | "VERIFIED" | "REJECTED", reason?: string) =>
    api.patch(`/api/admin/hr/${id}/verification`, { verificationStatus, reason }, { headers: getAuthHeaders() }),

  updateHrBlacklist: (id: string, isBlacklisted: boolean, reason?: string) =>
    api.patch(`/api/admin/hr/${id}/blacklist`, { isBlacklisted, reason }, { headers: getAuthHeaders() }),

  getJobs: (params?: Record<string, string | number>) =>
    api.get("/api/admin/jobs", { params, headers: getAuthHeaders() }),

  approveJob: (id: string) => api.patch(`/api/admin/jobs/${id}/approve`, {}, { headers: getAuthHeaders() }),

  rejectJob: (id: string, reason: string) =>
    api.patch(`/api/admin/jobs/${id}/reject`, { reason }, { headers: getAuthHeaders() }),

  getPayments: () => api.get("/api/admin/payments", { headers: getAuthHeaders() }),

  getDisputes: (params?: Record<string, string | number>) =>
    api.get("/api/admin/disputes", { params, headers: getAuthHeaders() }),

  updateDisputeStatus: (id: string, status: "OPEN" | "INVESTIGATING" | "RESOLVED", note?: string) =>
    api.patch(`/api/admin/disputes/${id}/status`, { status, note }, { headers: getAuthHeaders() }),

  getSettings: () => api.get("/api/admin/settings", { headers: getAuthHeaders() }),

  updateSettings: (payload: { maintenanceMode?: boolean; emailAlertEnabled?: boolean; adminSessionHours?: number }) =>
    api.put("/api/admin/settings", payload, { headers: getAuthHeaders() }),

  getSupportTickets: (params?: Record<string, string | number>) =>
    api.get("/api/admin/support/tickets", { params, headers: getAuthHeaders() }),

  updateSupportStatus: (id: string, status: "OPEN" | "IN_PROGRESS" | "CLOSED", reply?: string) =>
    api.patch(`/api/admin/support/tickets/${id}/status`, { status, reply }, { headers: getAuthHeaders() }),
};
