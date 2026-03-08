"use client";

import { useEffect, useState } from "react";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminToast } from "@/components/admin/AdminToast";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { NavItem } from "@/components/admin/types";
import { adminApi } from "@/services/adminApi";

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
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
  { label: "Blog", href: "/admin/blogs", icon: "article" },
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [emailAlert, setEmailAlert] = useState(true);
  const [adminSessionHours, setAdminSessionHours] = useState(8);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.getSettings();
      const settings = res.data?.data || {};

      setMaintenance(Boolean(settings.maintenanceMode));
      setEmailAlert(Boolean(settings.emailAlertEnabled));
      setAdminSessionHours(Number(settings.adminSessionHours || 8));
    } catch (error) {
      setErrorMessage("Không thể tải cài đặt hệ thống.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings().catch(() => null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const saveSettings = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await adminApi.updateSettings({
        maintenanceMode: maintenance,
        emailAlertEnabled: emailAlert,
        adminSessionHours,
      });
      setToast({ type: "success", message: "Đã lưu cài đặt thành công." });
      await loadSettings();
    } catch (error) {
      setErrorMessage("Không thể lưu cài đặt hệ thống.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Sidebar navItems={NAV_ITEMS} />

      {toast ? <AdminToast type={toast.type} message={toast.message} /> : null}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar locale="vi" />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Cài đặt hệ thống</h1>
          <p className="mt-1 text-sm text-slate-500">Thiết lập cấu hình vận hành cho admin dashboard.</p>

          {errorMessage ? <AdminErrorBanner message={errorMessage} className="mt-4" /> : null}

          {isLoading ? (
            <div className="mt-6">
              <AdminLoadingState message="Đang tải cài đặt hệ thống..." />
            </div>
          ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold">Vận hành nền tảng</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <span className="text-sm">Bật chế độ bảo trì</span>
                    <input
                      type="checkbox"
                      checked={maintenance}
                      disabled={isSaving}
                      onChange={(e) => setMaintenance(e.target.checked)}
                    />
                </label>
                <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                  <span className="text-sm">Gửi email cảnh báo sự cố</span>
                    <input
                      type="checkbox"
                      checked={emailAlert}
                      disabled={isSaving}
                      onChange={(e) => setEmailAlert(e.target.checked)}
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                    <span className="text-sm">Thời lượng phiên admin (giờ)</span>
                    <input
                      type="number"
                      min={1}
                      value={adminSessionHours}
                      disabled={isSaving}
                      onChange={(e) => setAdminSessionHours(Math.max(1, Number(e.target.value || 1)))}
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-right text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold">Bảo mật</h2>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p>Phiên đăng nhập admin: {adminSessionHours} giờ</p>
                <p>Xác thực 2 lớp: Đã bật</p>
                <p>Đăng nhập bất thường tuần này: 2</p>
              </div>
                <button
                  disabled={isSaving}
                  onClick={() => saveSettings().catch(() => null)}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </section>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
