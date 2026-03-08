"use client";

import { StatItem } from "@/components/admin/types";

type StatsCardProps = {
  stat: StatItem;
};

function MiniSparkline({ values = [] }: { values?: number[] }) {
  if (!values.length) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-[40px] w-14 shrink-0" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--text-muted)] opacity-70"
      />
    </svg>
  );
}

export function StatsCard({ stat }: StatsCardProps) {
  const delta = stat.trendDelta;
  const hasDelta = delta != null;
  const deltaPositive = delta != null && delta >= 0;
  const sparklineData = (stat.sparkline && stat.sparkline.length >= 2 ? stat.sparkline : []).slice(-7);

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: stat.accentColor,
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${stat.accentColor}20`, color: stat.accentColor }}
        >
          <span className="material-symbols-outlined text-xl">{stat.icon}</span>
        </div>
        {stat.showAlertDot && (
          <span
            className="h-2 w-2 shrink-0 rounded-full opacity-90"
            style={{
              backgroundColor: "#ef4444",
              boxShadow: "0 0 6px #ef4444",
              animation: "pulse-dot 2s infinite",
            }}
          />
        )}
        {!stat.showAlertDot && <span className="text-[var(--text-muted)]">···</span>}
      </div>

      <p
        className="text-[12px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {stat.title}
      </p>
      <h3
        className="mt-1 text-[32px] font-bold leading-none text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {stat.value}
      </h3>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          {hasDelta ? (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: deltaPositive ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: deltaPositive ? "#10b981" : "#ef4444",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {deltaPositive ? "▲" : "▼"} {deltaPositive ? "+" : ""}{delta} vs tuần trước
            </span>
          ) : (
            <span
              className="text-[11px] text-[var(--text-muted)]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              — vs tuần trước
            </span>
          )}
        </div>
        {sparklineData.length >= 2 && <MiniSparkline values={sparklineData} />}
      </div>
    </article>
  );
}
