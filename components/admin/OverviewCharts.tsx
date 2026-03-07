"use client";

import { useMemo, useState } from "react";

const JOB_GROWTH_SCOPE = {
  "6m": [68, 94, 78, 116, 102, 128],
  "12m": [48, 62, 58, 71, 77, 82, 86, 92, 88, 98, 112, 126],
  thisYear: [68, 94, 78, 116, 102, 128, 132, 138, 145, 151, 160, 168],
  lastYear: [42, 51, 60, 64, 69, 73, 79, 84, 88, 94, 101, 108],
} as const;

type GrowthScope = keyof typeof JOB_GROWTH_SCOPE;

function getMonthLabel(index: number, total: number) {
  if (total <= 6) return `T${index + 1}`;
  return `T${index + 1}`;
}

export function JobGrowthChartCard() {
  const [scope, setScope] = useState<GrowthScope>("6m");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const values = JOB_GROWTH_SCOPE[scope];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  const points = useMemo(() => {
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * 100;
        const y = 90 - ((v - min) / range) * 70;
        return { x, y, v };
      })
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  }, [values, min, range]);

  const areaPoints = `0,90 ${points} 100,90`;

  const yAxisTicks = [max, Math.round((max + min) / 2), min];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Tăng trưởng tin tuyển dụng</h3>
          <p className="text-sm text-slate-500">Line chart xu hướng theo thời gian</p>
        </div>

        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as GrowthScope)}
          className="rounded-lg border-none bg-slate-50 px-3 py-2 text-xs font-bold dark:bg-slate-800"
        >
          <option value="6m">6 tháng</option>
          <option value="12m">12 tháng</option>
          <option value="thisYear">Năm nay</option>
          <option value="lastYear">Năm trước</option>
        </select>
      </div>

      <div className="relative h-64">
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

          <div className="mt-3 grid text-center text-[10px] font-bold uppercase tracking-wide text-slate-400" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
            {values.map((v, i) => (
              <button
                key={`${scope}-${i}`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="relative"
              >
                {getMonthLabel(i, values.length)}
                {hoverIndex === i && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
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

const HR_REGION_DATA = [
  { period: "T1", hcm: 32, hanoi: 18 },
  { period: "T2", hcm: 28, hanoi: 22 },
  { period: "T3", hcm: 35, hanoi: 15 },
  { period: "T4", hcm: 31, hanoi: 24 },
  { period: "T5", hcm: 39, hanoi: 12 },
];

export function HrRegistrationsChartCard() {
  const max = Math.max(...HR_REGION_DATA.flatMap((item) => [item.hcm, item.hanoi]));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Đăng ký HR theo khu vực</h3>
          <p className="text-sm text-slate-500">Grouped bar chart theo tháng</p>
        </div>

        <div className="flex gap-3 text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> TP.HCM
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" /> Hà Nội
          </div>
        </div>
      </div>

      <div className="flex h-64 items-end justify-between gap-4">
        {HR_REGION_DATA.map((item) => (
          <div key={item.period} className="flex w-1/5 flex-col items-center gap-2">
            <div className="flex h-52 w-full items-end justify-center gap-2 rounded-xl bg-slate-50 px-2 py-2 dark:bg-slate-800/40">
              <div
                title={`TP.HCM: ${item.hcm}`}
                className="w-4 rounded-t-md bg-primary"
                style={{ height: `${Math.round((item.hcm / max) * 100)}%` }}
              />
              <div
                title={`Hà Nội: ${item.hanoi}`}
                className="w-4 rounded-t-md bg-slate-300 dark:bg-slate-600"
                style={{ height: `${Math.round((item.hanoi / max) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.period}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
