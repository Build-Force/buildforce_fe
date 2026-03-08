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

type PaymentStatus = "paid" | "processing" | "failed";

type PaymentRecord = {
  id: string;
  hrCompany: string;
  amount: number;
  method: "BANK_TRANSFER" | "CASH";
  createdAt: string;
  status: PaymentStatus;
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
  { label: "Thanh toán", href: "/admin/payments", icon: "payments", active: true },
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
  { label: "Blog", href: "/admin/blogs", icon: "article" },
];

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

export default function AdminPaymentsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadPayments = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.getPayments();
      const items = res.data?.data?.data || [];
      setRecords(
        items.map((item: any) => ({
          id: item._id ?? item.id,
          hrCompany: item.hrCompany ?? "—",
          amount: item.amount ?? 0,
          method: item.method ?? "BANK_TRANSFER",
          createdAt: item.createdAt ?? "",
          status: item.status ?? "processing",
        })),
      );
    } catch (error) {
      setRecords([]);
      setErrorMessage("Không thể tải danh sách thanh toán.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments().catch(() => null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats: StatItem[] = useMemo(() => {
    const totalPaid = records.filter((r) => r.status === "paid").reduce((sum, item) => sum + item.amount, 0);
    const processing = records.filter((r) => r.status === "processing").length;
    const failed = records.filter((r) => r.status === "failed").length;

    return [
      {
        title: "Tổng đã thanh toán",
        value: currency.format(totalPaid),
        icon: "paid",
        iconBgClass: "bg-emerald-100 dark:bg-emerald-900/30",
        iconTextClass: "text-emerald-600",
        trend: "Theo dữ liệu API",
        trendTone: "positive",
        accentColor: "#10b981",
      },
      {
        title: "Đang xử lý",
        value: String(processing),
        icon: "hourglass_top",
        iconBgClass: "bg-amber-100 dark:bg-amber-900/30",
        iconTextClass: "text-amber-600",
        trend: "Theo dõi",
        trendTone: "neutral",
        accentColor: "#f59e0b",
      },
      {
        title: "Giao dịch lỗi",
        value: String(failed),
        icon: "error",
        iconBgClass: "bg-red-100 dark:bg-red-900/30",
        iconTextClass: "text-red-600",
        trend: "Cần xử lý",
        trendTone: "negative",
        accentColor: "#ef4444",
      },
    ];
  }, [records]);

  const paymentStatusBadge = (status: PaymentStatus) => {
    if (status === "paid") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (status === "processing") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  };

  const paymentStatusText = (status: PaymentStatus) => {
    if (status === "paid") return "Thành công";
    if (status === "processing") return "Đang xử lý";
    return "Thất bại";
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Sidebar navItems={NAV_ITEMS} />

      {toast ? <AdminToast type={toast.type} message={toast.message} /> : null}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar locale="vi" />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <section className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Quản lý thanh toán</h1>
            <p className="mt-1 text-sm text-slate-500">Giám sát giao dịch giữa nền tảng và đối tác HR theo thời gian thực.</p>
          </section>

          {errorMessage ? <AdminErrorBanner message={errorMessage} className="mb-6" /> : null}

          <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <StatsCard key={stat.title} stat={stat} />
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    {["Mã giao dịch", "Đối tác HR", "Số tiền", "Phương thức", "Ngày tạo", "Trạng thái"].map((head) => (
                      <th key={head} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <AdminLoadingState asTableRow colSpan={6} />
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                        Không có dữ liệu thanh toán.
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-4 text-sm font-semibold">{record.id}</td>
                      <td className="px-4 py-4">{record.hrCompany}</td>
                      <td className="px-4 py-4 text-sm">{currency.format(record.amount)}</td>
                      <td className="px-4 py-4 text-sm">{record.method === "BANK_TRANSFER" ? "Chuyển khoản" : "Tiền mặt"}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{new Date(record.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStatusBadge(record.status)}`}
                        >
                          {paymentStatusText(record.status)}
                        </span>
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
