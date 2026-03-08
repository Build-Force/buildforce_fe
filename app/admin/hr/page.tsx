"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminToast } from "@/components/admin/AdminToast";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { HRDetailDrawer } from "@/components/admin/HRDetailDrawer";
import { HRManagementTable } from "@/components/admin/HRManagementTable";
import { Sidebar } from "@/components/admin/Sidebar";
import { StatsCard } from "@/components/admin/StatsCard";
import { Topbar } from "@/components/admin/Topbar";
import { HRFilterStatus, HRProfile, NavItem, StatItem } from "@/components/admin/types";
import { adminApi } from "@/services/adminApi";

const NAV_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: "/admin", icon: "dashboard" },
  { label: "Người dùng", href: "/admin/users", icon: "group" },
  { label: "Quản lý HR", href: "/admin/hr", icon: "badge", active: true },
  { label: "Việc làm", href: "/admin/jobs", icon: "work" },
  { label: "Thanh toán", href: "/admin/payments", icon: "payments" },
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
  { label: "Blog", href: "/admin/blogs", icon: "article" },
];

type PendingAction =
  | { type: "approve"; hr: HRProfile }
  | { type: "reject"; hr: HRProfile }
  | { type: "blacklist"; hr: HRProfile }
  | { type: "reactivate"; hr: HRProfile }
  | null;

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

export default function HRManagementPage() {
  const [rows, setRows] = useState<HRProfile[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<HRFilterStatus>("ALL");
  const [selectedProfile, setSelectedProfile] = useState<HRProfile | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadHr = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter !== "ALL" && statusFilter !== "BLACKLISTED") params.status = statusFilter;
    if (statusFilter === "BLACKLISTED") params.blacklisted = "true";

    const res = await adminApi.getHrList(params);
    const items = res.data?.data?.data || [];

      setRows(
        items.map((item: any) => {
          const totalPosted = item.totalJobsPosted || 0;
          const totalCompleted = item.totalJobsCompleted || 0;
          const completionRate = totalPosted > 0 ? Math.round((totalCompleted / totalPosted) * 100) : 0;
          return {
            id: item._id,
            companyName: item.companyName,
            taxCode: item.taxCode,
            region: item.address || "Việt Nam",
            address: item.address || "--",
            contactEmail: item.contactInfo || "--",
            phone: item.contactInfo || "--",
            verificationStatus: item.verificationStatus,
            isBlacklisted: item.isBlacklisted,
            completedProjects: totalCompleted,
            workersHired: totalCompleted,
            completionRate,
            avgRating: item.averageRating ?? 0,
            reportCount: item.totalReports ?? 0,
            popularPaymentMethod: "BANK_TRANSFER" as const,
            onTimePaymentRate: item.onTimePaymentRate ?? 0,
            createdAt: item.createdAt,
          };
        }),
      );
    } catch (error) {
      setRows([]);
      setErrorMessage("Không thể tải danh sách HR.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHr().catch(() => null);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats: StatItem[] = useMemo(() => {
    const verified = rows.filter((r) => r.verificationStatus === "VERIFIED" && !r.isBlacklisted).length;
    const pending = rows.filter((r) => r.verificationStatus === "PENDING" && !r.isBlacklisted).length;
    const blacklisted = rows.filter((r) => r.isBlacklisted).length;

    return [
      {
        title: "HR đã xác minh",
        value: String(verified),
        icon: "verified_user",
        iconBgClass: "bg-emerald-100 dark:bg-emerald-900/30",
        iconTextClass: "text-emerald-600",
        trend: "Ổn định",
        trendTone: "positive",
        accentColor: "#10b981",
      },
      {
        title: "Đang chờ duyệt",
        value: String(pending),
        icon: "hourglass_top",
        iconBgClass: "bg-amber-100 dark:bg-amber-900/30",
        iconTextClass: "text-amber-600",
        trend: "Cần xử lý",
        trendTone: "neutral",
        accentColor: "#f59e0b",
      },
      {
        title: "Bị blacklist",
        value: String(blacklisted),
        icon: "gpp_bad",
        iconBgClass: "bg-red-100 dark:bg-red-900/30",
        iconTextClass: "text-red-600",
        trend: "Theo dõi",
        trendTone: "negative",
        accentColor: "#ef4444",
      },
    ];
  }, [rows]);

  const onConfirmAction = async () => {
    if (!pendingAction) return;

    setIsUpdating(true);
    try {
      if (pendingAction.type === "approve") await adminApi.updateHrVerification(pendingAction.hr.id, "VERIFIED");
      if (pendingAction.type === "reject") await adminApi.updateHrVerification(pendingAction.hr.id, "REJECTED", "Không đạt tiêu chí xác minh");
      if (pendingAction.type === "blacklist") await adminApi.updateHrBlacklist(pendingAction.hr.id, true, "Vi phạm chính sách nền tảng");
      if (pendingAction.type === "reactivate") await adminApi.updateHrBlacklist(pendingAction.hr.id, false, "Khôi phục hoạt động");

    setPendingAction(null);
      setToast({ type: "success", message: "Cập nhật trạng thái HR thành công." });
    await loadHr();
    } catch (error) {
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsUpdating(false);
    }
  };

  const actionText = pendingAction
    ? {
      approve: { title: "Duyệt hồ sơ HR?", desc: `Xác nhận duyệt ${pendingAction.hr.companyName}.`, confirm: "Duyệt" },
      reject: { title: "Từ chối hồ sơ HR?", desc: `Xác nhận từ chối ${pendingAction.hr.companyName}.`, confirm: "Từ chối" },
      blacklist: { title: "Đưa vào blacklist?", desc: `HR ${pendingAction.hr.companyName} sẽ bị tạm khóa hoạt động trên hệ thống.`, confirm: "Blacklist" },
      reactivate: { title: "Khôi phục HR?", desc: `Khôi phục hoạt động cho ${pendingAction.hr.companyName}.`, confirm: "Khôi phục" },
    }[pendingAction.type]
    : null;

  return (
    <div className="relative flex h-screen overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Sidebar navItems={NAV_ITEMS} />
      {toast ? <AdminToast type={toast.type} message={toast.message} /> : null}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {errorMessage ? <AdminErrorBanner message={errorMessage} className="mb-6" /> : null}

          <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">{stats.map((stat) => <StatsCard key={stat.title} stat={stat} />)}</section>
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên công ty, mã số thuế..." className="w-full rounded-lg bg-slate-50 px-3 py-2 text-sm md:max-w-md dark:bg-slate-800" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as HRFilterStatus)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Đang chờ duyệt</option>
                <option value="VERIFIED">Đã xác minh</option>
                <option value="REJECTED">Bị từ chối</option>
                <option value="BLACKLISTED">Blacklisted</option>
              </select>
            </div>
          </section>

          {isLoading ? (
            <AdminLoadingState message="Đang tải danh sách HR..." />
          ) : (
          <HRManagementTable data={rows} onViewDetails={setSelectedProfile} onApprove={(hr) => setPendingAction({ type: "approve", hr })} onReject={(hr) => setPendingAction({ type: "reject", hr })} onBlacklist={(hr) => setPendingAction({ type: "blacklist", hr })} onReactivate={(hr) => setPendingAction({ type: "reactivate", hr })} />
          )}
        </div>
      </main>

      <HRDetailDrawer open={Boolean(selectedProfile)} profile={selectedProfile} onClose={() => setSelectedProfile(null)} />

      <ConfirmModal open={Boolean(pendingAction && actionText)} title={actionText?.title ?? "Xác nhận"} description={actionText?.desc ?? "Vui lòng xác nhận thao tác."} confirmLabel={isUpdating ? "Đang xử lý..." : (actionText?.confirm ?? "Xác nhận")} tone={pendingAction?.type === "blacklist" || pendingAction?.type === "reject" ? "danger" : "default"} onCancel={() => (isUpdating ? null : setPendingAction(null))} onConfirm={onConfirmAction} />
    </div>
  );
}
