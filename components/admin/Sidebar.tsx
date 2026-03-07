"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "@/components/admin/types";

type SidebarProps = {
  navItems: NavItem[];
};

const SYSTEM_ITEMS = [
  { label: "Settings", href: "/admin/settings", icon: "settings" },
  { label: "Support", href: "/admin/support", icon: "help" },
];

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <span className="material-symbols-outlined">construction</span>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight">Buildforce</h1>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${
              item.active
                ? "bg-primary/10 font-semibold text-primary"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">System</div>

        {SYSTEM_ITEMS.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
          <p className="mb-2 text-xs font-medium text-slate-500">Storage Usage</p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full w-3/4 bg-primary" />
          </div>
          <p className="mt-2 text-right text-[10px] font-bold text-slate-400">7.5 / 10 GB</p>
        </div>
      </div>
    </aside>
  );
}
