"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminToast } from "@/components/admin/AdminToast";
import { Sidebar } from "@/components/admin/Sidebar";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Topbar } from "@/components/admin/Topbar";
import { NavItem, StatItem } from "@/components/admin/types";
import { adminApi } from "@/services/adminApi";

type JobModerationStatus = "pending" | "active" | "matched";

type AdminJob = {
  id: string;
  title: string;
  company: string;
  region: string;
  vacancies: number;
  salaryRange: string;
  postedAt: string;
  status: JobModerationStatus;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const NAV_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: "/admin", icon: "dashboard" },
  { label: "Người dùng", href: "/admin/users", icon: "group" },
  { label: "Quản lý HR", href: "/admin/hr", icon: "badge" },
  { label: "Việc làm", href: "/admin/jobs", icon: "work", active: true },
  { label: "Thanh toán", href: "/admin/payments", icon: "payments" },
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
  { label: "Blog", href: "/admin/blogs", icon: "article" },
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

const mapStatus = (status: string): JobModerationStatus => {
  if (status === "APPROVED") return "active";
  if (status === "PENDING") return "pending";
  return "matched";
};

function formatSalary(salary: { amount?: number; unit?: string } | undefined): string {
  if (!salary?.amount) return "—";
  const n = new Intl.NumberFormat("vi-VN").format(salary.amount);
  const u = salary.unit === "day" ? "ngày" : salary.unit === "month" ? "tháng" : salary.unit === "hour" ? "giờ" : salary.unit || "";
  return `${n} VND/${u}`;
}

export default function AdminJobsPage() {
  const [rows, setRows] = useState<AdminJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadJobs = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.getJobs();
      const items = res.data?.data?.data || [];
      setRows(
        items.map((j: any) => ({
          id: j._id,
          title: j.title,
          company: j.hrId?.companyName || [j.hrId?.firstName, j.hrId?.lastName].filter(Boolean).join(" ") || "—",
          region: j.location?.province || j.location?.city || "—",
          vacancies: j.workersNeeded ?? 0,
          salaryRange: formatSalary(j.salary),
          postedAt: j.createdAt,
          status: mapStatus(j.status),
        })),
      );
    } catch (error) {
      setRows([]);
      setErrorMessage("Không thể tải danh sách việc làm.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs().catch(() => null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats: StatItem[] = useMemo(() => {
    const pending = rows.filter((r) => r.status === "pending").length;
    const active = rows.filter((r) => r.status === "active").length;
    return [
      { title: "Tin chờ duyệt", value: String(pending), icon: "pending_actions", iconBgClass: "bg-amber-100 dark:bg-amber-900/30", iconTextClass: "text-amber-600", trend: "Cần xử lý", trendTone: "neutral", accentColor: "#f59e0b" },
      { title: "Tin đang hoạt động", value: String(active), icon: "work_history", iconBgClass: "bg-emerald-100 dark:bg-emerald-900/30", iconTextClass: "text-emerald-600", trend: "Ổn định", trendTone: "positive", accentColor: "#10b981" },
      { title: "Tổng vị trí tuyển", value: String(rows.reduce((sum, item) => sum + item.vacancies, 0)), icon: "groups", iconBgClass: "bg-primary/10 dark:bg-primary/20", iconTextClass: "text-primary", trend: "--", trendTone: "neutral", accentColor: "#3b82f6" },
    ];
  }, [rows]);

  const approve = async (id: string) => {
    setIsUpdatingId(id);
    try {
      await adminApi.approveJob(id);
      setToast({ type: "success", message: "Duyệt tin thành công." });
      await loadJobs();
    } catch (error) {
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsUpdatingId(null);
    }
  };

  const reject = async (id: string) => {
    setIsUpdatingId(id);
    try {
      await adminApi.rejectJob(id, "Không đạt tiêu chí đăng tuyển");
      setToast({ type: "success", message: "Từ chối tin thành công." });
      await loadJobs();
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
          {errorMessage ? <AdminErrorBanner message={errorMessage} className="mb-6" /> : null}

          <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">{stats.map((stat) => <StatsCard key={stat.title} stat={stat} />)}</section>
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead><tr className="bg-slate-50 dark:bg-slate-800/50">{["Mã tin", "Vị trí", "Công ty", "Khu vực", "Mức lương", "Số lượng", "Ngày đăng", "Trạng thái", "Thao tác"].map((h) => <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <AdminLoadingState asTableRow colSpan={9} />
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500">Chưa có tin tuyển dụng.</td>
                    </tr>
                  ) : (
                    rows.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-4 text-sm font-medium">{job.id}</td><td className="px-4 py-4 font-semibold">{job.title}</td><td className="px-4 py-4 text-sm">{job.company}</td><td className="px-4 py-4 text-sm">{job.region}</td><td className="px-4 py-4 text-sm">{job.salaryRange}</td><td className="px-4 py-4 text-sm">{job.vacancies}</td><td className="px-4 py-4 text-sm text-slate-500">{new Date(job.postedAt).toLocaleDateString("vi-VN")}</td>
                        <td className="px-4 py-4"><StatusBadge status={job.status} /></td>
                        <td className="px-4 py-4"><div className="flex gap-2"><button disabled={isUpdatingId === job.id} onClick={() => approve(job.id).catch(() => null)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{isUpdatingId === job.id ? "Đang xử lý..." : "Duyệt"}</button><button disabled={isUpdatingId === job.id} onClick={() => reject(job.id).catch(() => null)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800">{isUpdatingId === job.id ? "Đang xử lý..." : "Từ chối"}</button></div></td>
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
