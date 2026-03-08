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

function JobDetailImages({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  if (!images?.length) return null;
  const hasMultiple = images.length > 1;
  return (
    <>
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <div className="relative aspect-video w-full">
          <button
            type="button"
            onClick={() => setLightboxUrl(images[index])}
            className="absolute inset-0 w-full h-full block cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-label="Xem ảnh phóng to"
          >
            <img
              src={images[index]}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
            />
          </button>
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i === 0 ? images.length - 1 : i - 1)); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 z-10"
                aria-label="Ảnh trước"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i === images.length - 1 ? 0 : i + 1)); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 z-10"
                aria-label="Ảnh sau"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"}`}
                    aria-label={`Ảnh ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
          aria-label="Đóng xem ảnh"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

const mapStatus = (status: string): JobModerationStatus => {
  if (status === "APPROVED") return "active";
  if (status === "PENDING" || status === "PENDING_APPROVAL") return "pending";
  return "matched";
};

export default function AdminJobsPage() {
  const [rows, setRows] = useState<AdminJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [rejectModalJobId, setRejectModalJobId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "">("PENDING");
  const [detailJobId, setDetailJobId] = useState<string | null>(null);
  const [jobDetailsById, setJobDetailsById] = useState<Record<string, any>>({});

  const loadJobs = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: Record<string, string | number> | undefined = statusFilter
        ? { status: statusFilter }
        : undefined;
      const res = await adminApi.getJobs(params);
      const items = res.data?.data?.data || [];
      setJobDetailsById(items.reduce((acc: Record<string, any>, j: any) => ({ ...acc, [j._id]: j }), {}));
      setRows(
        items.map((j: any) => {
          const hr = j.hrId;
          const company = hr?.companyName || (hr?.firstName && hr?.lastName ? `${hr.firstName} ${hr.lastName}`.trim() : "--");
          const salary = j.salary;
          const salaryStr = salary?.amount != null
            ? `${Number(salary.amount) >= 1_000_000 ? `${Math.round(Number(salary.amount) / 1_000_000)}tr` : `${Math.round(Number(salary.amount) / 1_000)}k`}/${salary.unit === "day" ? "ngày" : salary.unit === "month" ? "tháng" : salary.unit || ""}`
            : "Thỏa thuận";
          return {
            id: j._id,
            title: j.title,
            company,
            region: j.location?.province || j.region || "--",
            vacancies: j.workersNeeded ?? j.quantity ?? 0,
            salaryRange: salaryStr,
            postedAt: j.createdAt,
            status: mapStatus(j.status),
          };
        }),
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
  }, [statusFilter]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats: StatItem[] = useMemo(() => {
    const pending = rows.filter((r) => r.status === "pending").length;
    const active = rows.filter((r) => r.status === "active").length;
    return [
      { title: "Tin chờ duyệt", value: String(pending), icon: "pending_actions", iconBgClass: "bg-amber-100 dark:bg-amber-900/30", iconTextClass: "text-amber-600", trend: "Cần xử lý", trendTone: "neutral" },
      { title: "Tin đang hoạt động", value: String(active), icon: "work_history", iconBgClass: "bg-emerald-100 dark:bg-emerald-900/30", iconTextClass: "text-emerald-600", trend: "Ổn định", trendTone: "positive" },
      { title: "Tổng vị trí tuyển", value: String(rows.reduce((sum, item) => sum + item.vacancies, 0)), icon: "groups", iconBgClass: "bg-primary/10 dark:bg-primary/20", iconTextClass: "text-primary", trend: "--", trendTone: "neutral" },
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

  const openRejectModal = (id: string) => {
    setRejectModalJobId(id);
    setRejectReason("");
    setRejectSubmitting(false);
  };

  const submitReject = async () => {
    if (!rejectModalJobId || !rejectReason.trim() || rejectSubmitting) return;
    setRejectSubmitting(true);
    try {
      await adminApi.rejectJob(rejectModalJobId, rejectReason.trim());
      setToast({ type: "success", message: "Từ chối tin thành công. HR sẽ nhận email thông báo." });
      setRejectModalJobId(null);
      setRejectReason("");
      await loadJobs();
    } catch (error) {
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setRejectSubmitting(false);
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

          <div className="flex gap-2 mb-4">
            {[
              { value: "PENDING" as const, label: "Chờ duyệt" },
              { value: "APPROVED" as const, label: "Đã duyệt" },
              { value: "" as const, label: "Tất cả" },
            ].map(({ value, label }) => (
              <button
                key={value || "all"}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${statusFilter === value ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                suppressHydrationWarning
              >
                {label}
              </button>
            ))}
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                    {["Vị trí tuyển dụng", "Công ty", "Khu vực", "Mức lương", "Số lượng", "Ngày đăng", "Trạng thái", "Thao tác"].map((h) => (
                      <th key={h} className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <AdminLoadingState asTableRow colSpan={8} />
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                        Chưa có tin tuyển dụng.
                      </td>
                    </tr>
                  ) : (
                    rows.map((job) => (
                      <tr key={job.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setDetailJobId(job.id)}
                            className="text-left font-semibold text-slate-900 dark:text-white hover:text-primary dark:hover:text-primary transition-colors underline-offset-2 hover:underline"
                          >
                            {job.title}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{job.company}</td>
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{job.region}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">{job.salaryRange}</td>
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{job.vacancies}</td>
                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(job.postedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={job.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailJobId(job.id)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              Chi tiết
                            </button>
                            <button
                              type="button"
                              disabled={isUpdatingId === job.id}
                              onClick={() => approve(job.id).catch(() => null)}
                              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdatingId === job.id ? "Đang xử lý..." : "Duyệt"}
                            </button>
                            <button
                              type="button"
                              disabled={isUpdatingId === job.id}
                              onClick={() => openRejectModal(job.id)}
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              Từ chối
                            </button>
                          </div>
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

      {/* Dialog chi tiết tin tuyển dụng */}
      {detailJobId && (() => {
        const j = jobDetailsById[detailJobId];
        if (!j) return null;
        const hr = j.hrId || {};
        const company = hr?.companyName || (hr?.firstName && hr?.lastName ? `${hr.firstName} ${hr.lastName}`.trim() : "—");
        const salary = j.salary;
        const salaryStr = salary?.amount != null
          ? `${Number(salary.amount).toLocaleString("vi-VN")} VND/${salary.unit === "day" ? "ngày" : salary.unit === "month" ? "tháng" : salary.unit === "hour" ? "giờ" : "dự án"}`
          : "Thỏa thuận";
        const loc = j.location || {};
        const addr = [loc.province, loc.city, loc.address].filter(Boolean).join(", ") || "—";
        const start = j.startDate ? new Date(j.startDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
        const end = j.endDate ? new Date(j.endDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
        const posted = j.createdAt ? new Date(j.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
        const skills = Array.isArray(j.skills) ? j.skills : [];
        const rejectReason = j.adminReview?.reason;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setDetailJobId(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{j.title}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{company}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={mapStatus(j.status)} />
                    <span className="text-xs text-slate-400">Đăng lúc {posted}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailJobId(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  aria-label="Đóng"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {Array.isArray(j.images) && j.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Ảnh công trình</h3>
                    <JobDetailImages images={j.images} />
                  </div>
                )}
                {j.description && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mô tả công việc</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{j.description}</p>
                  </div>
                )}
                {j.requirements && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Yêu cầu</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{j.requirements}</p>
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Kỹ năng</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s: string, i: number) => (
                        <span key={i} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Địa điểm</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{addr}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Mức lương</h3>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{salaryStr}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Số lượng tuyển</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{j.workersNeeded ?? j.quantity ?? "—"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Thời gian</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{start} → {end}</p>
                  </div>
                </div>
                {rejectReason && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Lý do từ chối</h3>
                    <p className="text-sm text-red-700 dark:text-red-200 whitespace-pre-wrap">{rejectReason}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setDetailJobId(null)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Đóng
                </button>
                {mapStatus(j.status) === "pending" && (
                  <>
                    <button
                      type="button"
                      disabled={isUpdatingId === detailJobId}
                      onClick={() => { approve(detailJobId).catch(() => null); setDetailJobId(null); }}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      Duyệt tin
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingId === detailJobId}
                      onClick={() => { setDetailJobId(null); openRejectModal(detailJobId); }}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Dialog nhập lý do từ chối */}
      {rejectModalJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !rejectSubmitting && (setRejectModalJobId(null), setRejectReason(""))}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Từ chối tin tuyển dụng</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Lý do từ chối sẽ được gửi qua email cho nhà tuyển dụng (HR).</p>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Lý do từ chối (bắt buộc)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Nội dung không phù hợp tiêu chí, thiếu thông tin bắt buộc..."
              className="w-full h-28 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => !rejectSubmitting && (setRejectModalJobId(null), setRejectReason(""))}
                disabled={rejectSubmitting}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitReject}
                disabled={!rejectReason.trim() || rejectSubmitting}
                className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {rejectSubmitting ? "Đang gửi..." : "Gửi từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
