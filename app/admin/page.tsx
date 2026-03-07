"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DisputesChartCard,
  HrRegistrationsChartCard,
  JobGrowthChartCard,
  JobsByStatusChartCard,
  UserRolesChartCard,
} from "@/components/admin/OverviewCharts";
import { RecentActivityTable } from "@/components/admin/RecentActivityTable";
import { Sidebar } from "@/components/admin/Sidebar";
import { StatsCard } from "@/components/admin/StatsCard";
import { Topbar } from "@/components/admin/Topbar";
import { ActivityRow, NavItem, StatItem } from "@/components/admin/types";
import { adminApi } from "@/services/adminApi";

const NAV_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: "/admin", icon: "dashboard", active: true },
  { label: "Người dùng", href: "/admin/users", icon: "group" },
  { label: "Quản lý HR", href: "/admin/hr", icon: "badge" },
  { label: "Việc làm", href: "/admin/jobs", icon: "work" },
  { label: "Thanh toán", href: "/admin/payments", icon: "payments" },
  { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
  { label: "Blog", href: "/admin/blogs", icon: "article" },
];

function mapActivityToRow(item: any, idx: number): ActivityRow {
  const type = item?.type || "Hệ thống";
  const data = item?.data || {};
  const id = data?._id?.toString?.() || String(idx);
  let laborer = "Hệ thống";
  let laborerAvatar = data?.avatar || "https://i.pravatar.cc/100?img=0";
  let jobType = item?.action === "UPDATED" ? "Cập nhật" : type;
  let location = "—";

  if (type === "USER") {
    laborer = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.email || "Người dùng";
  } else if (type === "JOB") {
    laborer = data.title || "Tin tuyển dụng";
    jobType = "Việc làm";
    location = data.location?.province || data.location?.city || "Việt Nam";
  } else if (type === "DISPUTE") {
    laborer = data.category || "Tranh chấp";
    jobType = data.status || "Cập nhật";
  } else if (type === "SUPPORT") {
    laborer = data.subject || "Hỗ trợ";
    jobType = data.status || "Ticket";
  }

  return {
    id,
    laborer,
    laborerAvatar,
    hrPartner: type,
    jobType,
    location,
    status: "active",
    payment: "—",
  };
}

export default function AdminOverviewPage() {
  const [statsRaw, setStatsRaw] = useState({
    totalUsers: 0,
    totalHr: 0,
    openJobs: 0,
    pendingApprovals: 0,
    disputes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [dashboardData, setDashboardData] = useState<{
    jobGrowth?: any[];
    hrRegistrations?: any[];
    usersByRole?: Record<string, number>;
    jobsByStatus?: Record<string, number>;
    disputesByStatus?: Record<string, number>;
  }>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getDashboard("30d");
        const data = res.data?.data;
        setStatsRaw(data?.stats || { totalUsers: 0, totalHr: 0, openJobs: 0, pendingApprovals: 0, disputes: 0 });
        setDashboardData({
          jobGrowth: data?.jobGrowth,
          hrRegistrations: data?.hrRegistrations,
          usersByRole: data?.usersByRole,
          jobsByStatus: data?.jobsByStatus,
          disputesByStatus: data?.disputesByStatus,
        });
        const mapped: ActivityRow[] = (data?.recentActivities || []).map(mapActivityToRow);
        setRecentActivity(mapped);
      } catch (_e) {
        setRecentActivity([]);
      }
    };

    load();
  }, []);

  const STATS: StatItem[] = useMemo(
    () => [
      {
        title: "Tổng người dùng",
        value: String(statsRaw.totalUsers),
        icon: "group",
        iconBgClass: "bg-blue-100 dark:bg-blue-900/30",
        iconTextClass: "text-blue-600",
        trend: "--",
        trendTone: "neutral",
      },
      {
        title: "Đối tác HR",
        value: String(statsRaw.totalHr),
        icon: "verified_user",
        iconBgClass: "bg-green-100 dark:bg-green-900/30",
        iconTextClass: "text-green-600",
        trend: "--",
        trendTone: "neutral",
      },
      {
        title: "Việc làm đang mở",
        value: String(statsRaw.openJobs),
        icon: "work",
        iconBgClass: "bg-primary/10 dark:bg-primary/20",
        iconTextClass: "text-primary",
        trend: "--",
        trendTone: "neutral",
      },
      {
        title: "Chờ duyệt",
        value: String(statsRaw.pendingApprovals),
        icon: "hourglass_empty",
        iconBgClass: "bg-yellow-100 dark:bg-yellow-900/30",
        iconTextClass: "text-yellow-600",
        trend: "--",
        trendTone: "neutral",
      },
      {
        title: "Tranh chấp mở",
        value: String(statsRaw.disputes),
        icon: "gavel",
        iconBgClass: "bg-red-100 dark:bg-red-900/30",
        iconTextClass: "text-red-600",
        trend: "--",
        trendTone: "neutral",
      },
    ],
    [statsRaw],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Sidebar navItems={NAV_ITEMS} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar locale="vi" />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tổng quan</h1>
            <p className="mt-1 text-sm text-slate-500">Thống kê và hoạt động gần đây từ hệ thống</p>
          </header>

          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {STATS.map((stat) => (
              <StatsCard key={stat.title} stat={stat} />
            ))}
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <JobGrowthChartCard jobGrowth={dashboardData.jobGrowth} />
            <HrRegistrationsChartCard hrRegistrations={dashboardData.hrRegistrations} />
          </section>

          <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <UserRolesChartCard usersByRole={dashboardData.usersByRole} />
            <JobsByStatusChartCard jobsByStatus={dashboardData.jobsByStatus} />
            <DisputesChartCard disputesByStatus={dashboardData.disputesByStatus} />
          </section>

          <RecentActivityTable rows={recentActivity} />
        </div>
      </main>
    </div>
  );
}
