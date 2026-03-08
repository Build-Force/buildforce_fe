import { ActivityStatus, HRProfile, UserStatus } from "@/components/admin/types";

type StatusBadgeValue = ActivityStatus | HRProfile["verificationStatus"] | UserStatus | "BLACKLISTED";

type StatusBadgeProps = {
  status: StatusBadgeValue;
};

const STATUS_META: Record<StatusBadgeValue, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  pending: {
    label: "Pending",
    className: "rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  matched: {
    label: "Matched",
    className: "rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary dark:bg-primary/20 dark:text-blue-300",
  },
  closed: {
    label: "Closed",
    className: "rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-600 dark:text-slate-200",
  },
  resolved: {
    label: "Resolved",
    className: "rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  VERIFIED: {
    label: "Verified",
    className: "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  PENDING: {
    label: "Pending",
    className: "rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  REJECTED: {
    label: "Rejected",
    className: "rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  BLACKLISTED: {
    label: "Blacklisted",
    className: "rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  ACTIVE: {
    label: "Active",
    className: "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-600 dark:text-slate-200",
  },
  DELETED: {
    label: "Deleted",
    className: "rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = STATUS_META[status];
  if (!meta) return <span className="text-[11px] text-[var(--text-muted)]">···</span>;
  return <span className={`inline-flex ${meta.className}`}>{meta.label}</span>;
}
