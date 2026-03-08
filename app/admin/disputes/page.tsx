"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminToast } from "@/components/admin/AdminToast";
import { Sidebar } from "@/components/admin/Sidebar";
import { StatsCard } from "@/components/admin/StatsCard";
import { Topbar } from "@/components/admin/Topbar";
import { NavItem, StatItem } from "@/components/admin/types";
import { adminApi } from "@/services/adminApi";

type DisputeStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";
type DisputePriority = "HIGH" | "MEDIUM" | "LOW";

type DisputeCase = {
  id: string;
  reporter: string;
  target: string;
  category: string;
  createdAt: string;
  priority: DisputePriority;
  status: DisputeStatus;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const NAV_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: "/admin", icon: "dashboard" },
  { label: "Người dùng", href: "/admin/users", icon: "group" },
  { label: "Quản lý HR", href: "/admin/hr", icon: "badge" },
  { label: "Việc làm", href: "/admin/jobs", icon: "work" },
  { label: "Thanh toán", href: "/admin/payments", icon: "payments" },
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem", active: true },
  { label: "Blog", href: "/admin/blogs", icon: "article" },
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

export default function AdminDisputesPage() {
  const [cases, setCases] = useState<DisputeCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadDisputes = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.getDisputes();
      const items = res.data?.data?.data || [];

      setCases(
        items.map((item: any) => {
          const reporterName = item.reporterId
            ? [item.reporterId.firstName, item.reporterId.lastName].filter(Boolean).join(" ") || item.reporterId.email
            : "Không rõ";
          const targetName = item.targetId
            ? item.targetId.companyName || [item.targetId.firstName, item.targetId.lastName].filter(Boolean).join(" ") || item.targetId.email
            : "Không rõ";
          return {
            id: item._id,
            reporter: reporterName,
            target: targetName,
            category: item.category || "Khác",
            createdAt: item.createdAt,
            priority: item.priority,
            status: item.status,
          };
        }),
      );
    } catch (error) {
      setCases([]);
      setErrorMessage("Không thể tải danh sách tranh chấp.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes().catch(() => null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats: StatItem[] = useMemo(() => {
    const open = cases.filter((item) => item.status === "OPEN").length;
    const inProgress = cases.filter((item) => item.status === "INVESTIGATING").length;
    const resolved = cases.filter((item) => item.status === "RESOLVED").length;

    return [
      {
        title: "Tranh chấp mới",
        value: String(open),
        icon: "notification_important",
        iconBgClass: "bg-red-100 dark:bg-red-900/30",
        iconTextClass: "text-red-600",
        trend: "Ưu tiên xử lý",
        trendTone: "negative",
        accentColor: "#ef4444",
      },
      {
        title: "Đang điều tra",
        value: String(inProgress),
        icon: "manage_search",
        iconBgClass: "bg-amber-100 dark:bg-amber-900/30",
        iconTextClass: "text-amber-600",
        trend: "Theo dõi",
        trendTone: "neutral",
        accentColor: "#f59e0b",
      },
      {
        title: "Đã giải quyết",
        value: String(resolved),
        icon: "task_alt",
        iconBgClass: "bg-emerald-100 dark:bg-emerald-900/30",
        iconTextClass: "text-emerald-600",
        trend: "Ổn định",
        trendTone: "positive",
        accentColor: "#10b981",
      },
    ];
  }, [cases]);

  const statusClass = (status: DisputeStatus) => {
    if (status === "OPEN") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (status === "INVESTIGATING") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  };

  const statusLabel = (status: DisputeStatus) => {
    if (status === "OPEN") return "Mở";
    if (status === "INVESTIGATING") return "Đang điều tra";
    return "Đã giải quyết";
  };

  const priorityClass = (priority: DisputePriority) => {
    if (priority === "HIGH") return "text-red-600";
    if (priority === "MEDIUM") return "text-amber-600";
    return "text-slate-500";
  };

  const priorityLabel = (priority: DisputePriority) => {
    if (priority === "HIGH") return "Cao";
    if (priority === "MEDIUM") return "Trung bình";
    return "Thấp";
  };

  const setResolved = async (id: string) => {
    setIsUpdatingId(id);
    try {
      await adminApi.updateDisputeStatus(id, "RESOLVED", "Đánh dấu đã xử lý từ admin");
      setToast({ type: "success", message: "Đã cập nhật trạng thái tranh chấp." });
      await loadDisputes();
    } catch (error) {
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsUpdatingId(null);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Sidebar navItems={NAV_ITEMS} />

      {toast ? <AdminToast type={toast.type} message={toast.message} /> : null}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar locale="vi" />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <section className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Quản lý tranh chấp</h1>
            <p className="mt-1 text-sm text-slate-500">Tiếp nhận khiếu nại, theo dõi tiến độ xử lý và đảm bảo công bằng hai phía.</p>
          </section>

          {errorMessage ? <AdminErrorBanner message={errorMessage} className="mb-6" /> : null}

          <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <StatsCard key={stat.title} stat={stat} />
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    {["Mã vụ việc", "Người báo cáo", "Bên liên quan", "Danh mục", "Ngày tạo", "Mức độ", "Trạng thái", "Thao tác"].map(
                      (head) => (
                        <th key={head} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                          {head}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <AdminLoadingState asTableRow colSpan={8} />
                  ) : cases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                        Chưa có tranh chấp nào.
                      </td>
                    </tr>
                  ) : (
                    cases.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-4 text-sm font-semibold">{item.id}</td>
                        <td className="px-4 py-4">{item.reporter}</td>
                        <td className="px-4 py-4 text-sm">{item.target}</td>
                        <td className="px-4 py-4 text-sm">{item.category}</td>
                        <td className="px-4 py-4 text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className={`px-4 py-4 text-sm font-semibold ${priorityClass(item.priority)}`}>{priorityLabel(item.priority)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}>
                            {statusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            disabled={item.status === "RESOLVED" || isUpdatingId === item.id}
                            onClick={() => setResolved(item.id).catch(() => null)}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            {isUpdatingId === item.id ? "Đang xử lý..." : "Đánh dấu đã xử lý"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
