"use client";

import { useEffect, useState } from "react";
import { AdminErrorBanner } from "@/components/admin/AdminErrorBanner";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminToast } from "@/components/admin/AdminToast";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { NavItem } from "@/components/admin/types";
import { adminApi } from "@/services/adminApi";

type TicketPriority = "HIGH" | "MEDIUM" | "LOW";
type TicketStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

type Ticket = {
  id: string;
  subject: string;
  requester: string;
  priority: TicketPriority;
  status: TicketStatus;
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
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const loadTickets = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminApi.getSupportTickets();
      const items = res.data?.data?.data || [];

      setTickets(
        items.map((item: any) => ({
          id: item._id,
          subject: item.subject || "Không có tiêu đề",
          requester: item.userId?.fullName || item.userId?.email || "Người dùng",
          priority: item.priority,
          status: item.status,
        })),
      );
    } catch (error) {
      setTickets([]);
      setErrorMessage("Không thể tải danh sách ticket.");
      setToast({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets().catch(() => null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const badgeClass = (status: TicketStatus) => {
    if (status === "OPEN") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (status === "IN_PROGRESS") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  };

  const statusLabel = (status: TicketStatus) => {
    if (status === "OPEN") return "Mở";
    if (status === "IN_PROGRESS") return "Đang xử lý";
    return "Đã đóng";
  };

  const priorityLabel = (priority: TicketPriority) => {
    if (priority === "HIGH") return "Cao";
    if (priority === "MEDIUM") return "Trung bình";
    return "Thấp";
  };

  const markClosed = async (id: string) => {
    setIsUpdatingId(id);
    try {
      await adminApi.updateSupportStatus(id, "CLOSED", "Đóng ticket từ trang admin");
      setToast({ type: "success", message: "Đã đóng ticket thành công." });
      await loadTickets();
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
          <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý ticket hỗ trợ từ người dùng và đối tác HR.</p>

          {errorMessage ? <AdminErrorBanner message={errorMessage} className="mt-4" /> : null}

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    {["Mã ticket", "Tiêu đề", "Người gửi", "Ưu tiên", "Trạng thái", "Thao tác"].map((head) => (
                      <th key={head} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <AdminLoadingState asTableRow colSpan={6} />
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                        Chưa có ticket nào.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-4 text-sm font-semibold">{ticket.id}</td>
                      <td className="px-4 py-4">{ticket.subject}</td>
                      <td className="px-4 py-4 text-sm">{ticket.requester}</td>
                        <td className="px-4 py-4 text-sm">{priorityLabel(ticket.priority)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass(ticket.status)}`}>
                            {statusLabel(ticket.status)}
                        </span>
                      </td>
                        <td className="px-4 py-4">
                          <button
                            disabled={ticket.status === "CLOSED" || isUpdatingId === ticket.id}
                            onClick={() => markClosed(ticket.id).catch(() => null)}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            {isUpdatingId === ticket.id ? "Đang xử lý..." : "Đóng ticket"}
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
