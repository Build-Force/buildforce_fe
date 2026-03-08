"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/utils/api";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên cấp cao",
  HR: "Đối tác HR",
  USER: "Người dùng",
};

export function Topbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUserProfile(null);
      return;
    }

    try {
      const res = await api.get("/api/auth/profile");
      if (res.data?.success && res.data?.data) {
        setUserProfile(res.data.data);
      }
    } catch {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      root.classList.add("dark");
      setIsDarkMode(true);
      return;
    }

    if (savedTheme === "light") {
      root.classList.remove("dark");
      setIsDarkMode(false);
      return;
    }

    setIsDarkMode(root.classList.contains("dark"));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const toggleDarkMode = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    const nextIsDark = root.classList.contains("dark");
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDarkMode(nextIsDark);
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
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="ml-8 hidden items-center gap-4 md:flex">
        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Chuyển giao diện sáng/tối"
          aria-label="Chuyển giao diện sáng tối"
          suppressHydrationWarning
        >
          <span className="material-symbols-outlined">{isDarkMode ? "light_mode" : "dark_mode"}</span>
        </button>

        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          suppressHydrationWarning
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-slate-900" />
        </button>

        <div className="mx-2 h-8 w-px bg-slate-200 dark:bg-slate-700" />

        <button type="button" className="group flex items-center gap-3" suppressHydrationWarning>
          <div className="text-right">
            <p className="text-sm font-bold leading-none">
              {userProfile?.firstName || userProfile?.lastName
                ? [userProfile.firstName, userProfile.lastName].filter(Boolean).join(" ")
                : userProfile?.email ?? "Quản trị viên"}
            </p>
            <p className="mt-1 text-[10px] font-medium text-slate-500">
              {userProfile?.role ? ROLE_LABELS[userProfile.role] ?? userProfile.role : "Quản trị viên"}
            </p>
          </div>

          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-transparent bg-primary/20 transition-all group-hover:border-primary">
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt="Ảnh đại diện" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-2xl">person</span>
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
