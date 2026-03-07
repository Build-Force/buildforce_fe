"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/components/admin/types";

type TopbarProps = {
  locale: Locale;
};

export function Topbar({ locale }: TopbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    setIsDarkMode(root.classList.contains("dark"));
  };

  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="w-full max-w-xl">
        <div className="group relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm lao động, việc làm hoặc đối tác HR..."
            className="w-full rounded-xl bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none ring-primary/20 transition-all focus:ring-2 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="ml-8 hidden items-center gap-4 md:flex">
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              locale === "en" ? "bg-white shadow-sm dark:bg-slate-700" : "text-slate-500"
            }`}
          >
            EN
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              locale === "vi" ? "bg-white shadow-sm dark:bg-slate-700" : "text-slate-500"
            }`}
          >
            VI
          </button>
        </div>

        <button
          onClick={toggleDarkMode}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Chuyển giao diện sáng/tối"
          aria-label="Chuyển giao diện sáng tối"
        >
          <span className="material-symbols-outlined">{isDarkMode ? "light_mode" : "dark_mode"}</span>
        </button>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
        </button>

        <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-700" />

        <button className="group flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold leading-none">Nguyen Minh</p>
            <p className="mt-1 text-[10px] font-medium text-slate-500">Quản trị viên cấp cao</p>
          </div>

          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-transparent bg-primary/20 transition-all group-hover:border-primary">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvoAtGDRXnyywC4biMn8DDNedGqUUdAdbx_huJf_uvlNEitAsehUaKU3xViSuoTXzn0jYaE4efGhE8Y5MKIEoaoqlP_FQQb0NTzVXB3FXm_IdgbEbV7oA2I-BNE4v2dA2a06Cx30bNUt9qSRmbbTl1NHurydTgzAIT9LKKC7_Yji_WQJ8ZYesYK-DpTVFMvJIjLz8zq1o79S29FKRzqQL_iGg7FBMMV3oootVfwCsStyewP3ZcpG45vLGePSHQH4Pr2nQZEwoUYMA"
              alt="Ảnh đại diện quản trị viên"
              className="h-full w-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
}
