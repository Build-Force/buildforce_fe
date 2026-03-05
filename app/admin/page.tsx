"use client";

import { useEffect, useMemo, useState } from "react";
import { HrRegistrationsChartCard, JobGrowthChartCard } from "@/components/admin/OverviewCharts";
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
];

export default function AdminOverviewPage() {
  const [statsRaw, setStatsRaw] = useState({ totalUsers: 0, totalHr: 0, openJobs: 0, pendingApprovals: 0, disputes: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getDashboard("30d");
        const data = res.data?.data;
        setStatsRaw(data?.stats || { totalUsers: 0, totalHr: 0, openJobs: 0, pendingApprovals: 0, disputes: 0 });
        const mapped: ActivityRow[] = (data?.recentActivities || []).map((item: any, idx: number) => ({
          id: item?.data?._id || String(idx),
          laborer: item?.data?.fullName || "Người dùng hệ thống",
          laborerAvatar: "https://i.pravatar.cc/100?img=12",
          hrPartner: item?.type || "Hệ thống",
          jobType: item?.action || "Cập nhật",
          location: "Việt Nam",
          status: "active",
          payment: "--",
        }));
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
    <div className="flex h-screen overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
      <Sidebar navItems={NAV_ITEMS} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar locale="vi" />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {STATS.map((stat) => (
              <StatsCard key={stat.title} stat={stat} />
            ))}
          </section>
          <section className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
            <JobGrowthChartCard />
            <HrRegistrationsChartCard />
          </section>
          <RecentActivityTable rows={recentActivity} />
        </div>
      </main>
    </div>
  );
}
