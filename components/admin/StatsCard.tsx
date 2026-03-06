import { StatItem } from "@/components/admin/types";

type StatsCardProps = {
  stat: StatItem;
};

function getTrendClassName(tone: StatItem["trendTone"]) {
  if (tone === "positive") {
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  }

  if (tone === "negative") {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }

  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300";
}

function MiniSparkline({ values = [] }: { values?: number[] }) {
  if (!values.length) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-8 w-20" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/70"
      />
    </svg>
  );
}

export function StatsCard({ stat }: StatsCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBgClass} ${stat.iconTextClass}`}
        >
          <span className="material-symbols-outlined">{stat.icon}</span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-lg px-2 py-1 text-xs font-bold ${getTrendClassName(stat.trendTone)}`}>
            {stat.trend}
          </span>
          <MiniSparkline values={stat.sparkline} />
        </div>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.title}</p>
      <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</h3>
      {stat.periodComparison && <p className="mt-1 text-xs text-slate-500">{stat.periodComparison}</p>}
    </article>
  );
}
