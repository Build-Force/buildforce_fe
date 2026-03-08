"use client";

import { useMemo, useState } from "react";

// --- Types from API ---
export type JobGrowthPoint = { _id: { year: number; month: number; day: number }; total: number };
export type HrRegistrationPoint = { _id: { year: number; month: number; day: number }; total: number };

const FALLBACK_JOB_GROWTH = [2, 5, 8, 12, 15, 18, 22, 20, 25, 28, 30, 35];

function seriesFromAggregate(points: JobGrowthPoint[]): number[] {
  if (!points?.length) return FALLBACK_JOB_GROWTH.slice(0, 6);
  const sorted = [...points].sort(
    (a, b) =>
      new Date(a._id.year, a._id.month - 1, a._id.day).getTime() -
      new Date(b._id.year, b._id.month - 1, b._id.day).getTime()
  );
  return sorted.map((p) => p.total);
}

/** Chuyển hrRegistrations (aggregate theo ngày) thành 12 tháng: tổng đăng ký mỗi tháng (T1–T12). */
function hrRegistrationsByMonth(points: HrRegistrationPoint[]): number[] {
  const monthCounts = Array(12).fill(0);
  if (!points?.length) return monthCounts;
  points.forEach((p) => {
    const monthIndex = (p._id?.month ?? 1) - 1;
    if (monthIndex >= 0 && monthIndex < 12) monthCounts[monthIndex] += p.total ?? 0;
  });
  return monthCounts;
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

const MONTH_LABELS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

type HrRegistrationsChartCardProps = {
  hrRegistrations?: HrRegistrationPoint[];
};

export function HrRegistrationsChartCard({ hrRegistrations = [] }: HrRegistrationsChartCardProps) {
  const series = useMemo(() => hrRegistrationsByMonth(hrRegistrations), [hrRegistrations]);
  const max = Math.max(...series, 1);

  return (
    <section
      className="w-full min-w-0 rounded-xl border p-6 shadow-[var(--shadow)] transition-[background,border-color] duration-200"
      style={{ background: "var(--surface)", borderColor: "var(--border)", fontFamily: "var(--font-dm-sans)" }}
    >
      <div className="mb-6">
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">Đăng ký HR theo tháng</h3>
        <p className="text-[14px] text-[var(--text-secondary)]">Dữ liệu từ hệ thống · 12 tháng</p>
      </div>
      <div className="flex h-56 min-h-[200px] w-full items-end justify-between gap-0.5 sm:gap-1">
        {MONTH_LABELS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full min-w-0 rounded-t transition-opacity hover:opacity-90"
              style={{
                height: `${Math.round((series[i] / max) * 100)}%`,
                minHeight: series[i] ? 6 : 0,
                background: "var(--accent)",
              }}
              title={`Tháng ${i + 1}: ${series[i]} đăng ký`}
            />
            <span className="text-[10px] font-semibold uppercase text-[var(--text-secondary)]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// --- Donut/Pie charts (theme-aware, thin ring + progress rows) ---
/** Gộp các key cùng tên khác kiểu chữ (admin/Admin/ADMIN) thành một key chuẩn uppercase để tránh trùng dòng. */
function normalizeKeysToUpper(data: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  Object.entries(data || {}).forEach(([key, count]) => {
    const canonical = String(key).trim().toUpperCase();
    if (!canonical) return;
    out[canonical] = (out[canonical] ?? 0) + (count ?? 0);
  });
  return out;
}

const ROLE_LABELS: Record<string, string> = { USER: "Người dùng", HR: "Đối tác HR", ADMIN: "Admin" };
const ROLE_COLORS: Record<string, string> = {
  USER: "#3b82f6",
  HR: "#60a5fa",
  ADMIN: "#93c5fd",
};
const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Nháp", PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Từ chối",
  FILLED: "Đã đủ", CLOSED: "Đóng", COMPLETED: "Hoàn thành",
};
const JOB_STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8", PENDING: "#f59e0b", APPROVED: "#10b981", REJECTED: "#ef4444",
  FILLED: "#3b82f6", CLOSED: "#64748b", COMPLETED: "#059669",
};
const DISPUTE_LABELS: Record<string, string> = { OPEN: "Đang mở", INVESTIGATING: "Đang xử lý", RESOLVED: "Đã giải quyết" };
const DISPUTE_COLORS: Record<string, string> = { OPEN: "#ef4444", INVESTIGATING: "#f87171", RESOLVED: "#22c55e" };

function ringPath(start: number, end: number, cx: number, cy: number, ro: number, ri: number): string {
  const s = 2 * Math.PI * (start - 0.25);
  const e = 2 * Math.PI * (end - 0.25);
  const large = end - start > 0.5 ? 1 : 0;
  return `M ${cx + ro * Math.cos(s)} ${cy + ro * Math.sin(s)} A ${ro} ${ro} 0 ${large} 1 ${cx + ro * Math.cos(e)} ${cy + ro * Math.sin(e)} L ${cx + ri * Math.cos(e)} ${cy + ri * Math.sin(e)} A ${ri} ${ri} 0 ${large} 0 ${cx + ri * Math.cos(s)} ${cy + ri * Math.sin(s)} Z`;
}

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

  const total = useMemo(() => entries.reduce((s, { value }) => s + value, 0), [entries]);

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

  const cx = 50;
  const cy = 50;
  const ro = 45;
  const ri = 33;
  const strokeW = ro - ri;

  if (entries.length === 0) {
    return (
      <section
        className="rounded-xl border p-6 shadow-[var(--shadow)] transition-[background,border-color] duration-200"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-dm-sans)" }}>{title}</h3>
        {subtitle && <p className="mt-0.5 text-[14px] text-[var(--text-secondary)]">{subtitle}</p>}
        <p className="mt-4 text-[14px] text-[var(--text-muted)]">{emptyMessage}</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border p-6 shadow-[var(--shadow)] transition-[background,border-color] duration-200"
      style={{ background: "var(--surface)", borderColor: "var(--border)", fontFamily: "var(--font-dm-sans)" }}
    >
      <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">{subtitle}</p>}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-[160px] w-[160px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {segments.map(({ key, start, end, color }) => (
              <path key={key} d={ringPath(start, end, cx, cy, ro, ri)} fill={color} stroke="var(--surface)" strokeWidth={1.5} />
            ))}
            <circle cx={cx} cy={cy} r={ri - 2} fill="var(--surface)" />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fontWeight: 700, fill: "var(--text-primary)", fontFamily: "var(--font-dm-sans)" }}>{total}</text>
          </svg>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">
          {entries.map(({ key, value, share }, idx) => {
            const color = getColor(key, idx);
            return (
              <li key={key} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2 text-[14px]">
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[var(--text-primary)]">{labels[key] ?? key}</span>
                  </span>
                  <span className="shrink-0 text-[var(--text-secondary)]">{value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 shrink-0 text-[12px] text-[var(--text-muted)]">{Math.round(share * 100)}%</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${share * 100}%`, background: color }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

type UserRolesChartCardProps = { usersByRole?: Record<string, number> };
export function UserRolesChartCard({ usersByRole = {} }: UserRolesChartCardProps) {
  const data = useMemo(() => normalizeKeysToUpper(usersByRole), [usersByRole]);
  return (
    <DonutChart
      data={data}
      labels={ROLE_LABELS}
      colors={ROLE_COLORS}
      title="Phân bố người dùng theo vai trò"
      subtitle="USER / HR / ADMIN"
    />
  );
}

type JobsByStatusChartCardProps = { jobsByStatus?: Record<string, number> };
export function JobsByStatusChartCard({ jobsByStatus = {} }: JobsByStatusChartCardProps) {
  const data = useMemo(() => normalizeKeysToUpper(jobsByStatus), [jobsByStatus]);
  return (
    <DonutChart
      data={data}
      labels={JOB_STATUS_LABELS}
      colors={JOB_STATUS_COLORS}
      title="Việc làm theo trạng thái"
      subtitle="DRAFT, PENDING, APPROVED..."
    />
  );
}

type DisputesChartCardProps = { disputesByStatus?: Record<string, number> };
export function DisputesChartCard({ disputesByStatus = {} }: DisputesChartCardProps) {
  const data = useMemo(() => normalizeKeysToUpper(disputesByStatus), [disputesByStatus]);
  return (
    <DonutChart
      data={data}
      labels={DISPUTE_LABELS}
      colors={DISPUTE_COLORS}
      title="Tranh chấp theo trạng thái"
      subtitle="OPEN / INVESTIGATING / RESOLVED"
    />
  );
}
