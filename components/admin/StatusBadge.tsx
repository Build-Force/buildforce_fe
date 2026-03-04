import { ActivityStatus, HRProfile, UserStatus } from "@/components/admin/types";

type StatusBadgeValue = ActivityStatus | HRProfile["verificationStatus"] | UserStatus | "BLACKLISTED";

type StatusBadgeProps = {
  status: StatusBadgeValue;
};

const STATUS_META: Record<StatusBadgeValue, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  matched: {
    label: "Matched",
    className: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300",
  },
  VERIFIED: {
    label: "Verified",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  PENDING: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  BLACKLISTED: {
    label: "Blacklisted",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
  DELETED: {
    label: "Deleted",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
