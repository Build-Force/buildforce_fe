"use client";

import { useMemo, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Cell,
} from "recharts";
import type { JobGrowthPoint } from "./OverviewCharts";

const FALLBACK_SERIES = [5, 10, 4, 6, 7, 5, 4, 6, 6, 7, 6, 7, 6, 6, 5, 4, 5, 6, 8, 6, 7, 6, 6, 5, 7, 6, 6, 5, 4, 4];

function seriesFromAggregate(points: JobGrowthPoint[]): number[] {
  if (!points?.length) return FALLBACK_SERIES;
  const sorted = [...points].sort(
    (a, b) =>
      new Date(a._id.year, a._id.month - 1, a._id.day).getTime() -
      new Date(b._id.year, b._id.month - 1, b._id.day).getTime()
  );
  return sorted.map((p) => p.total);
}

function movingAvg(arr: number[], w: number): (number | null)[] {
  return arr.map((_, i) => {
    if (i < w - 1) return null;
    const slice = arr.slice(i - w + 1, i + 1);
    return +(slice.reduce((a, b) => a + b, 0) / w).toFixed(2) as unknown as number;
  });
}

const CHART_LINE_GREEN = "#1AE080";
const CHART_AMBER = "#f59e0b";
const CHART_RED = "#f87171";
const CHART_BLUE = "#38bdf8";

type DataPoint = {
  name: string;
  week: number;
  value: number;
  ma5: number | null;
  ma10: number | null;
  vol: number;
  aboveAvg: boolean;
  delta: number;
};

function buildChartData(raw: number[]): DataPoint[] {
  const ma5 = movingAvg(raw, 5);
  const ma10 = movingAvg(raw, 10);
  const avg = +(raw.reduce((a, b) => a + b, 0) / raw.length).toFixed(1);
  return raw.map((v, i) => ({
    name: `T${i + 1}`,
    week: i + 1,
    value: v,
    ma5: ma5[i],
    ma10: ma10[i],
    vol: Math.abs(v - avg),
    aboveAvg: v >= avg,
    delta: i > 0 ? v - raw[i - 1] : 0,
  }));
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const deltaColor = d.delta > 0 ? CHART_LINE_GREEN : d.delta < 0 ? CHART_RED : "var(--text-secondary)";
  return (
    <div
      className="rounded-md border p-3 shadow-lg transition-[background,border-color] duration-200"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        minWidth: 180,
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: CHART_AMBER }}>
        TUẦN {d.week}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {[
          { label: "GIÁ TRỊ", val: d.value, color: "var(--text-primary)" },
          { label: "DELTA", val: (d.delta > 0 ? "+" : "") + d.delta, color: deltaColor },
          { label: "MA·5", val: d.ma5 ?? "—", color: CHART_LINE_GREEN },
          { label: "MA·10", val: d.ma10 ?? "—", color: CHART_BLUE },
          { label: "ĐỘ LỆCH", val: `±${d.vol.toFixed(1)}`, color: "var(--text-muted)" },
          {
            label: "SO TB",
            val: d.aboveAvg ? "↑ CAO" : "↓ THẤP",
            color: d.aboveAvg ? CHART_LINE_GREEN : CHART_RED,
          },
        ].map((r) => (
          <div key={r.label}>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{r.label}</div>
            <div className="text-[13px] font-bold" style={{ color: r.color }}>{String(r.val)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  color,
  tag,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  tag?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-lg border p-4 transition-[background,border-color] duration-200"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        borderTopWidth: 2,
        borderTopColor: color,
      }}
    >
      {tag && (
        <div
          className="absolute right-3 top-2.5 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
          style={{ color, background: `${color}15`, fontFamily: "var(--font-dm-sans)" }}
        >
          {tag}
        </div>
      )}
      <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)", fontFamily: "var(--font-dm-sans)" }}>
        {label}
      </div>
      <div className="text-[28px] font-bold leading-none" style={{ color: "var(--text-primary)", fontFamily: "var(--font-dm-sans)" }}>
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[11px]" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-dm-sans)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

type JobGrowthTerminalChartProps = {
  jobGrowth?: JobGrowthPoint[];
};

export function JobGrowthTerminalChart({ jobGrowth = [] }: JobGrowthTerminalChartProps) {
  const raw = useMemo(() => {
    const fromApi = seriesFromAggregate(jobGrowth);
    return fromApi.length >= 2 ? fromApi : FALLBACK_SERIES;
  }, [jobGrowth]);

  const data = useMemo(() => buildChartData(raw), [raw]);

  const [activeRange, setActiveRange] = useState<"1W" | "2W" | "ALL">("ALL");
  const ranges: ("1W" | "2W" | "ALL")[] = ["1W", "2W", "ALL"];

  const rangeData = useMemo(() => {
    if (activeRange === "1W") return data.slice(-7);
    if (activeRange === "2W") return data.slice(-14);
    return data;
  }, [data, activeRange]);

  const avg = +(raw.reduce((a, b) => a + b, 0) / raw.length).toFixed(1);
  const peak = Math.max(...raw);
  const peakIdx = raw.indexOf(peak);
  const total = raw.reduce((a, b) => a + b, 0);
  const lastWeek = raw[raw.length - 1];
  const prevWeek = raw[raw.length - 2];
  const weekDelta = lastWeek - prevWeek;
  const rangeAvg = +(rangeData.reduce((a, b) => a + b.value, 0) / rangeData.length).toFixed(1);

  return (
    <div
      className="rounded-xl border p-6 transition-[background,border-color,color] duration-200"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {/* Header bar */}
      <div className="mb-5 flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            BUILDFORCE · ANALYTICS
          </div>
          <div className="text-[18px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Tăng trưởng tin tuyển dụng
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: CHART_LINE_GREEN }}>
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse opacity-90"
              style={{ backgroundColor: CHART_LINE_GREEN, boxShadow: `0 0 6px ${CHART_LINE_GREEN}` }}
            />
            LIVE
          </div>
          <div
            className="flex rounded-md border overflow-hidden transition-[background,border-color] duration-200"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            {ranges.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRange(r)}
                className="border-none px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
                style={{
                  background: activeRange === r ? CHART_LINE_GREEN : "transparent",
                  color: activeRange === r ? "#0f172a" : "var(--text-muted)",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        <Stat label="TỔNG CỘNG" value={total} sub={`${raw.length} kỳ`} color={CHART_LINE_GREEN} />
        <Stat
          label="KỲ GẦN NHẤT"
          value={lastWeek}
          sub={(weekDelta > 0 ? `▲ +${weekDelta}` : `▼ ${weekDelta}`) + " vs kỳ trước"}
          color={weekDelta >= 0 ? CHART_LINE_GREEN : CHART_RED}
          tag={weekDelta >= 0 ? "↑ TĂNG" : "↓ GIẢM"}
        />
        <Stat label="ĐỈNH CAO" value={peak} sub={`Kỳ ${peakIdx + 1}`} color={CHART_AMBER} tag="PEAK" />
        <Stat label="TRUNG BÌNH" value={avg} sub="tin/kỳ" color={CHART_BLUE} />
        <Stat
          label="HIỆN TẠI"
          value={`${((lastWeek / avg - 1) * 100).toFixed(0)}%`}
          sub="so với trung bình"
          color={lastWeek >= avg ? CHART_LINE_GREEN : CHART_RED}
        />
      </div>

      {/* Main chart */}
      <div
        className="rounded-lg border p-5 transition-[background,border-color] duration-200"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-5 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {[
            { color: CHART_LINE_GREEN, label: "Giá trị", dash: false },
            { color: CHART_LINE_GREEN, label: "MA·5", dash: true },
            { color: CHART_BLUE, label: "MA·10", dash: true },
            { color: "var(--text-muted)", label: "Độ lệch (volume)", dash: false },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <svg width={20} height={10}>
                {l.dash ? (
                  <line x1={0} y1={5} x2={20} y2={5} stroke={l.color} strokeWidth={1.5} strokeDasharray="4 2" />
                ) : (
                  <line x1={0} y1={5} x2={20} y2={5} stroke={l.color} strokeWidth={2} />
                )}
              </svg>
              <span>{l.label}</span>
            </div>
          ))}
          <div className="ml-auto text-[10px]" style={{ color: "var(--text-muted)" }}>
            TB ({activeRange}): <span style={{ color: CHART_AMBER }}>{rangeAvg}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={rangeData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="terminal-areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_LINE_GREEN} stopOpacity={0.12} />
                <stop offset="100%" stopColor={CHART_LINE_GREEN} stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="var(--border)" />

            <XAxis
              dataKey="name"
              tick={{ fill: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--font-dm-sans)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              interval={activeRange === "ALL" ? 4 : 0}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 9, fontFamily: "var(--font-dm-sans)" }}
              axisLine={false}
              tickLine={false}
              domain={[0, Math.max(14, peak + 2)]}
              tickCount={5}
            />

            <ReferenceLine
              y={rangeAvg}
              stroke={CHART_AMBER}
              strokeDasharray="6 3"
              strokeWidth={1}
              strokeOpacity={0.6}
              label={{
                value: `AVG ${rangeAvg}`,
                fill: CHART_AMBER,
                fontSize: 9,
                position: "insideTopRight",
                fontFamily: "var(--font-dm-sans)",
              }}
            />
            <ReferenceLine y={peak} stroke={CHART_AMBER} strokeDasharray="2 6" strokeWidth={1} strokeOpacity={0.3} />

            <Bar dataKey="vol" yAxisId={0} fillOpacity={0.5} maxBarSize={14} radius={[2, 2, 0, 0]}>
              {rangeData.map((d, i) => (
                <Cell key={i} fill={d.aboveAvg ? CHART_LINE_GREEN : CHART_RED} />
              ))}
            </Bar>

            <Area type="monotone" dataKey="value" fill="url(#terminal-areaGrad)" stroke="none" dot={false} activeDot={false} />

            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_LINE_GREEN}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: CHART_LINE_GREEN, stroke: "var(--surface)", strokeWidth: 2 }}
            />

            <Line
              type="monotone"
              dataKey="ma5"
              stroke={CHART_LINE_GREEN}
              strokeWidth={1}
              strokeDasharray="5 3"
              dot={false}
              strokeOpacity={0.6}
              activeDot={false}
            />

            <Line
              type="monotone"
              dataKey="ma10"
              stroke={CHART_BLUE}
              strokeWidth={1}
              strokeDasharray="5 3"
              dot={false}
              strokeOpacity={0.5}
              activeDot={false}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "var(--text-muted)", strokeWidth: 1, strokeDasharray: "4 2" }}
            />

            {activeRange === "ALL" && data.length > 10 && (
              <Brush
                dataKey="name"
                height={22}
                stroke="var(--border)"
                fill="var(--bg)"
                travellerWidth={6}
                startIndex={0}
                endIndex={Math.min(14, data.length - 1)}
                style={{ fontFamily: "var(--font-dm-sans)", fontSize: 9 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Delta bar */}
      <div
        className="mt-3 rounded-lg border p-4 transition-[background,border-color] duration-200"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <div className="mb-2.5 text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          DELTA KỲ-QUA-KỲ (thay đổi so với kỳ trước)
        </div>
        <ResponsiveContainer width="100%" height={60}>
          <BarChart data={rangeData} margin={{ top: 0, right: 8, bottom: 0, left: -10 }}>
            <XAxis dataKey="name" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 11,
                fontFamily: "var(--font-dm-sans)",
              }}
              formatter={(v: number) => [(v > 0 ? "+" : "") + v, "Δ"]}
              labelStyle={{ color: CHART_AMBER, fontSize: 10 }}
            />
            <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
            <Bar dataKey="delta" maxBarSize={16} radius={[2, 2, 0, 0]} fillOpacity={0.8}>
              {rangeData.map((d, i) => (
                <Cell key={i} fill={d.delta >= 0 ? CHART_LINE_GREEN : CHART_RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
