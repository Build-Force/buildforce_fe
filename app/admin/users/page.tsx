"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminToast } from "@/components/admin/AdminToast";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { Sidebar } from "@/components/admin/Sidebar";
import { StatsCard } from "@/components/admin/StatsCard";
import { Topbar } from "@/components/admin/Topbar";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { AdminUser, NavItem, StatItem, UserRole, UserStatus } from "@/components/admin/types";
import { adminApi } from "@/services/adminApi";

const NAV_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: "/admin", icon: "dashboard" },
  { label: "Người dùng", href: "/admin/users", icon: "group", active: true },
  { label: "Quản lý HR", href: "/admin/hr", icon: "badge" },
  { label: "Việc làm", href: "/admin/jobs", icon: "work" },
  { label: "Thanh toán", href: "/admin/payments", icon: "payments" },
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
  { label: "Blog", href: "/admin/blogs", icon: "article" },
];

type PendingAction =
  | { type: "suspend"; user: AdminUser }
  | { type: "reactivate"; user: AdminUser }
  | { type: "delete"; user: AdminUser }
  | { type: "restore"; user: AdminUser }
  | null;

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await adminApi.getUsers(params);
      const rows = res.data?.data?.data || [];
      setUsers(
        rows.map((u: any) => {
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email?.split("@")[0] || "Người dùng";
          return {
            id: u._id,
            fullName,
            email: u.email || u.phone || "--",
            avatar: u.avatar || `https://i.pravatar.cc/100?u=${u._id}`,
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
          };
        }),
      );
    } catch (error) {
      setUsers([]);
      setErrorMessage("Không thể tải danh sách người dùng.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, search, statusFilter]);

  useEffect(() => {
    loadUsers().catch(() => null);
  }, [loadUsers]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats: StatItem[] = useMemo(() => {
    const activeCount = users.filter((u) => u.status === "ACTIVE").length;
    const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;

    return [
      {
        title: "Người dùng hoạt động",
        value: String(activeCount),
        icon: "person_check",
        iconBgClass: "bg-emerald-100 dark:bg-emerald-900/30",
        iconTextClass: "text-emerald-600",
        trend: "Ổn định",
        trendTone: "positive",
        accentColor: "#10b981",
      },
      {
        title: "Tạm khóa",
        value: String(suspendedCount),
        icon: "person_off",
        iconBgClass: "bg-amber-100 dark:bg-amber-900/30",
        iconTextClass: "text-amber-600",
        trend: "Theo dõi",
        trendTone: "neutral",
        accentColor: "#f59e0b",
      },
    ];
  }, [users]);

  const onConfirmAction = async () => {
    if (!pendingAction) return;
    const nextStatus: UserStatus =
      pendingAction.type === "suspend"
        ? "SUSPENDED"
        : pendingAction.type === "delete"
          ? "DELETED"
          : "ACTIVE";

    setIsUpdating(true);
    try {
      await adminApi.updateUserStatus(pendingAction.user.id, nextStatus);
      setPendingAction(null);
      setToast({ type: "success", message: "Cập nhật trạng thái người dùng thành công." });
      await loadUsers();
    } catch (error) {
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsUpdating(false);
    }
  };

  const actionText = pendingAction
    ? {
      suspend: { title: "Khóa người dùng?", desc: `Tạm khóa ${pendingAction.user.fullName}.`, confirm: "Khóa" },
      reactivate: { title: "Kích hoạt lại?", desc: `Kích hoạt lại ${pendingAction.user.fullName}.`, confirm: "Kích hoạt" },
      delete: { title: "Đánh dấu xóa?", desc: `Đánh dấu ${pendingAction.user.fullName} là DELETED.`, confirm: "Xóa" },
      restore: { title: "Khôi phục?", desc: `Khôi phục ${pendingAction.user.fullName} về ACTIVE.`, confirm: "Khôi phục" },
    }[pendingAction.type]
    : null;

  return (
    <div className="relative flex min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Sidebar navItems={NAV_ITEMS} />
      {toast ? <AdminToast type={toast.type} message={toast.message} /> : null}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar locale="vi" />
        <div className="mx-auto w-full max-w-7xl space-y-6 p-8">
          {errorMessage ? <AdminErrorBanner message={errorMessage} /> : null}

          <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm email..." className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900" />
              <div className="flex items-center gap-3">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as "ALL" | UserRole)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <option value="ALL">Tất cả role</option><option value="USER">USER</option><option value="HR">HR</option><option value="ADMIN">ADMIN</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "ALL" | UserStatus)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <option value="ALL">Tất cả trạng thái</option><option value="ACTIVE">ACTIVE</option><option value="SUSPENDED">SUSPENDED</option><option value="DELETED">DELETED</option>
                </select>
              </div>
            </div>
          </section>

          {isLoading ? (
            <AdminLoadingState message="Đang tải danh sách người dùng..." />
          ) : (
            <UserManagementTable users={users} onSuspend={(user) => setPendingAction({ type: "suspend", user })} onReactivate={(user) => setPendingAction({ type: "reactivate", user })} onDelete={(user) => setPendingAction({ type: "delete", user })} onRestore={(user) => setPendingAction({ type: "restore", user })} />
          )}

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">{stats.map((stat) => <StatsCard key={stat.title} stat={stat} />)}</section>
        </div>
      </main>

      <ConfirmModal open={Boolean(pendingAction && actionText)} title={actionText?.title ?? "Xác nhận"} description={actionText?.desc ?? "Vui lòng xác nhận."} confirmLabel={isUpdating ? "Đang xử lý..." : (actionText?.confirm ?? "Xác nhận")} tone={pendingAction?.type === "delete" ? "danger" : "default"} onCancel={() => (isUpdating ? null : setPendingAction(null))} onConfirm={onConfirmAction} />
    </div>
  );
}
