"use client";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActivityRow } from "@/components/admin/types";

type RecentActivityTableProps = {
  rows: ActivityRow[];
};

const TYPE_STYLES: Record<string, { color: string; label: string }> = {
  JOB: { color: "#3b82f6", label: "JOB" },
  USER: { color: "var(--text-muted)", label: "USER" },
  SUPPORT: { color: "#8b5cf6", label: "SUPPORT" },
  DISPUTE: { color: "#ef4444", label: "DISPUTE" },
  "Hệ thống": { color: "var(--text-muted)", label: "SYS" },
};

function hashToHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h % 360);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

function AvatarCell({ name, src }: { name: string; src: string }) {
  const hasImage = Boolean(src && src.startsWith("http") && src.length > 10);
  const initials = getInitials(name);
  const hue = hashToHue(name);

  if (hasImage) {
    return (
      <div className="h-8 w-8 overflow-hidden rounded-full bg-[var(--border)]">
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
      style={{ backgroundColor: `hsl(${hue}, 50%, 40%)` }}
    >
      {initials}
    </div>
  );
}

function EmptyCell({ value }: { value: string }) {
  if (value === "—" || value === "" || value == null) {
    return <span className="text-[var(--text-muted)]">···</span>;
  }
  return <span>{value}</span>;
}

export function RecentActivityTable({ rows }: RecentActivityTableProps) {
  return (
    <section
      className="overflow-hidden rounded-xl border shadow-[var(--shadow)] transition-[background,border-color] duration-200"
      style={{ background: "var(--surface)", borderColor: "var(--border)", fontFamily: "var(--font-dm-sans)" }}
    >
      <div className="flex items-center justify-between border-b p-6" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">Hoạt động gần đây</h3>
        <button className="text-[14px] font-semibold text-[var(--accent)] hover:underline">Xem tất cả</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr
              className="sticky top-0 z-10 text-[11px] font-semibold uppercase tracking-wider transition-[background] duration-200"
              style={{
                background: "var(--surface)",
                color: "var(--text-secondary)",
                backdropFilter: "blur(8px)",
              }}
            >
              <th className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>Lao động</th>
              <th className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>Đối tác HR</th>
              <th className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>Loại việc</th>
              <th className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>Khu vực</th>
              <th className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>Trạng thái</th>
              <th className="border-b px-6 py-4 text-right" style={{ borderColor: "var(--border)" }}>Thanh toán</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const typeStyle = TYPE_STYLES[row.hrPartner] ?? { color: "var(--text-muted)", label: row.hrPartner };
              return (
                <tr
                  key={row.id}
                  className="transition-colors duration-200 hover:bg-[var(--border)]/30"
                  style={{ borderBottom: idx < rows.length - 1 ? "1px solid var(--border)" : undefined }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AvatarCell name={row.laborer} src={row.laborerAvatar} />
                      <span className="text-[14px] font-medium text-[var(--text-primary)]">{row.laborer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="font-mono text-[11px] font-semibold uppercase"
                      style={{ color: typeStyle.color }}
                    >
                      {typeStyle.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[var(--text-primary)]">{row.jobType}</td>
                  <td className="px-6 py-4 text-[14px] text-[var(--text-secondary)]">
                    <EmptyCell value={row.location} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-[14px] font-semibold text-[var(--text-primary)]">
                    <EmptyCell value={row.payment} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
