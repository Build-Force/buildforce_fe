"use client";

import { useMemo, useState } from "react";

// --- Types from API ---
export type JobGrowthPoint = { _id: { year: number; month: number; day: number }; total: number };
export type HrRegistrationPoint = { _id: { year: number; month: number; day: number }; total: number };

const FALLBACK_JOB_GROWTH = [2, 5, 8, 12, 15, 18, 22, 20, 25, 28, 30, 35];
const FALLBACK_HR_REGION = [
  { period: "T1", hcm: 32, hanoi: 18 },
  { period: "T2", hcm: 28, hanoi: 22 },
  { period: "T3", hcm: 35, hanoi: 15 },
  { period: "T4", hcm: 31, hanoi: 24 },
  { period: "T5", hcm: 39, hanoi: 12 },
];

function seriesFromAggregate(points: JobGrowthPoint[]): number[] {
  if (!points?.length) return FALLBACK_JOB_GROWTH.slice(0, 6);
  const sorted = [...points].sort(
    (a, b) =>
      new Date(a._id.year, a._id.month - 1, a._id.day).getTime() -
      new Date(b._id.year, b._id.month - 1, b._id.day).getTime()
  );
  return sorted.map((p) => p.total);
}

type JobGrowthChartCardProps = {
  jobGrowth?: JobGrowthPoint[];
};

export function JobGrowthChartCard({ jobGrowth = [] }: JobGrowthChartCardProps) {
  const values = useMemo(() => {
    const fromApi = seriesFromAggregate(jobGrowth);
    return fromApi.length >= 2 ? fromApi : FALLBACK_JOB_GROWTH.slice(0, 6);
  }, [jobGrowth]);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);

  const points = useMemo(() => {
    return values
      .map((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * 100;
        const y = 90 - ((v - min) / range) * 70;
        return { x, y, v };
      })
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  }, [values, min, range]);

  const areaPoints = `0,90 ${points} 100,90`;
  const yAxisTicks = [max, Math.round((max + min) / 2), min];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Tăng trưởng tin tuyển dụng</h3>
          <p className="text-sm text-slate-500">Xu hướng theo thời gian (từ dữ liệu hệ thống)</p>
        </div>
      </div>

      <div className="relative h-56">
        <div className="absolute inset-y-0 left-0 flex w-10 flex-col justify-between text-[10px] font-semibold text-slate-400">
          {yAxisTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="ml-10 h-full">
          <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
            {[20, 50, 80].map((line) => (
              <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="rgba(148,163,184,0.2)" strokeDasharray="2 2" />
            ))}
            <polygon points={areaPoints} fill="url(#areaGradient)" opacity="0.25" />
            <polyline
              points={points}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0d7ff2" />
                <stop offset="100%" stopColor="#078838" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d7ff2" />
                <stop offset="100%" stopColor="#0d7ff2" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div
            className="mt-3 grid text-center text-[10px] font-bold uppercase tracking-wide text-slate-400"
            style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
          >
            {values.map((v, i) => (
              <button
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="relative"
              >
                T{i + 1}
                {hoverIndex === i && (
                  <span className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                    {v} tin
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type HrRegistrationsChartCardProps = {
  hrRegistrations?: HrRegistrationPoint[];
};

export function HrRegistrationsChartCard({ hrRegistrations = [] }: HrRegistrationsChartCardProps) {
  const series = useMemo(() => seriesFromAggregate(hrRegistrations as JobGrowthPoint[]), [hrRegistrations]);
  const useApi = series.length >= 2;
  const max = useApi ? Math.max(...series, 1) : Math.max(...FALLBACK_HR_REGION.flatMap((i) => [i.hcm, i.hanoi]));

  if (useApi) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Đăng ký HR (theo thời gian)</h3>
          <p className="text-sm text-slate-500">Số lượng đăng ký mới từ dữ liệu hệ thống</p>
        </div>
        <div className="flex h-56 items-end justify-between gap-2">
          {series.map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-primary transition hover:opacity-90"
                style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: v ? 8 : 0 }}
                title={`${v} đăng ký`}
              />
              <span className="text-[10px] font-bold text-slate-500">T{i + 1}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Đăng ký HR theo khu vực</h3>
          <p className="text-sm text-slate-500">Grouped bar (mẫu)</p>
        </div>
        <div className="flex gap-3 text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> TP.HCM</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400" /> Hà Nội</span>
        </div>
      </div>
      <div className="flex h-56 items-end justify-between gap-4">
        {FALLBACK_HR_REGION.map((item) => (
          <div key={item.period} className="flex w-1/5 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center gap-2 rounded-xl bg-slate-50 px-2 py-2 dark:bg-slate-800/40">
              <div
                className="w-4 rounded-t-md bg-primary"
                style={{ height: `${Math.round((item.hcm / max) * 100)}%` }}
              />
              <div
                className="w-4 rounded-t-md bg-slate-400"
                style={{ height: `${Math.round((item.hanoi / max) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold uppercase text-slate-400">{item.period}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Donut/Pie charts ---
const ROLE_LABELS: Record<string, string> = { USER: "Lao động", HR: "Đối tác HR", ADMIN: "Admin" };
const ROLE_COLORS = ["#0d7ff2", "#078838", "#f59e0b"];
const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp", PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối",
  FILLED: "Đã đủ", CLOSED: "Đóng", COMPLETED: "Hoàn thành",
};
const JOB_STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8", PENDING: "#f59e0b", APPROVED: "#078838", REJECTED: "#dc2626",
  FILLED: "#0d7ff2", CLOSED: "#64748b", COMPLETED: "#059669",
};
const DISPUTE_LABELS: Record<string, string> = { OPEN: "Đang mở", INVESTIGATING: "Đang xử lý", RESOLVED: "Đã giải quyết" };
const DISPUTE_COLORS: Record<string, string> = { OPEN: "#dc2626", INVESTIGATING: "#f59e0b", RESOLVED: "#078838" };

function DonutChart({
  data,
  labels,
  colors,
  title,
  subtitle,
  emptyMessage = "Chưa có dữ liệu",
}: {
  data: Record<string, number>;
  labels: Record<string, string>;
  colors: Record<string, string> | string[];
  title: string;
  subtitle?: string;
  emptyMessage?: string;
}) {
  const entries = useMemo(() => {
    const arr = Object.entries(data).filter(([, v]) => v > 0);
    const total = arr.reduce((s, [, v]) => s + v, 0);
    return total > 0 ? arr.map(([k, v]) => ({ key: k, value: v, share: v / total })) : [];
  }, [data]);

  const getColor = (key: string, i: number) => {
    if (typeof colors === "object" && !Array.isArray(colors)) return (colors as Record<string, string>)[key] ?? "#94a3b8";
    return (colors as string[])[i % (colors as string[]).length] ?? "#94a3b8";
  };

  const segments = useMemo(() => {
    let acc = 0;
    return entries.map(({ key, share }, i) => {
      const start = acc;
      acc += share;
      return { key, share, start, end: acc, color: getColor(key, i) };
    });
  }, [entries, colors]);

  const r = 45;
  const cx = 50;
  const cy = 50;
  const path = (start: number, end: number) => {
    const s = 2 * Math.PI * (start - 0.25);
    const e = 2 * Math.PI * (end - 0.25);
    return `M ${cx + r * Math.cos(s)} ${cy + r * Math.sin(s)} A ${r} ${r} 0 ${end - start > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(e)} ${cy + r * Math.sin(e)} L ${cx} ${cy} Z`;
  };

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        <p className="mt-4 text-sm text-slate-400">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-6">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {segments.map(({ key, start, end, color }) => (
              <path key={key} d={path(start, end)} fill={color} stroke="white" strokeWidth="2" />
            ))}
            <circle cx={cx} cy={cy} r={28} fill="white" className="dark:fill-slate-900" />
          </svg>
        </div>
        <ul className="flex flex-col gap-2">
          {entries.map(({ key, value, share }, idx) => (
            <li key={key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: getColor(key, idx) }}
                />
                {labels[key] ?? key}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {value} ({Math.round(share * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type UserRolesChartCardProps = { usersByRole?: Record<string, number> };
export function UserRolesChartCard({ usersByRole = {} }: UserRolesChartCardProps) {
  return (
    <DonutChart
      data={usersByRole}
      labels={ROLE_LABELS}
      colors={ROLE_COLORS}
      title="Phân bố người dùng theo vai trò"
      subtitle="USER / HR / ADMIN"
    />
  );
}

type JobsByStatusChartCardProps = { jobsByStatus?: Record<string, number> };
export function JobsByStatusChartCard({ jobsByStatus = {} }: JobsByStatusChartCardProps) {
  return (
    <DonutChart
      data={jobsByStatus}
      labels={JOB_STATUS_LABELS}
      colors={JOB_STATUS_COLORS}
      title="Việc làm theo trạng thái"
      subtitle="DRAFT, PENDING, APPROVED..."
    />
  );
}

type DisputesChartCardProps = { disputesByStatus?: Record<string, number> };
export function DisputesChartCard({ disputesByStatus = {} }: DisputesChartCardProps) {
  return (
    <DonutChart
      data={disputesByStatus}
      labels={DISPUTE_LABELS}
      colors={DISPUTE_COLORS}
      title="Tranh chấp theo trạng thái"
      subtitle="OPEN / INVESTIGATING / RESOLVED"
    />
  );
}
