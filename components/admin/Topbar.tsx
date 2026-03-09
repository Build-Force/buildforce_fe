"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Locale } from "@/components/admin/types";
import { connectSocket } from "@/utils/socket";
import { useRouter } from "next/navigation";
import api from "@/utils/api";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên cấp cao",
  HR: "Đối tác HR",
  USER: "Người dùng",
};
type TopbarProps = {
  locale?: Locale;
};

export function Topbar({ locale = "vi" }: TopbarProps = {}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kf_notifications");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kf_unread_notifications");
      if (saved) return parseInt(saved);
    }
    return 0;
  });
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      const socket = connectSocket();
      socket.emit("join_admin_room");

      const handleNewNotification = (data: any) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      const handleBlogPending = (data: any) => {
        const notif = {
          message: `Duyệt bài đăng: "${data.title}" từ ${data.author}`,
          adminRoute: "/admin/blogs"
        };
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on("new_notification", handleNewNotification);
      socket.on("new_blog_pending", handleBlogPending);

      return () => {
        socket.off("new_notification", handleNewNotification);
        socket.off("new_blog_pending", handleBlogPending);
      };
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kf_notifications", JSON.stringify(notifications));
      localStorage.setItem("kf_unread_notifications", unreadCount.toString());
    }
  }, [notifications, unreadCount]);

  const handleMarkAsRead = () => {
    setUnreadCount(0);
  };
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
        <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${locale === "en" ? "bg-white shadow-sm dark:bg-slate-700" : "text-slate-500"
              }`}
          >
            EN
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${locale === "vi" ? "bg-white shadow-sm dark:bg-slate-700" : "text-slate-500"
              }`}
          >
            VI
          </button>
        </div>

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

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Thông báo hệ thống"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-bold text-white z-10">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Thông báo</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAsRead} className="text-xs text-primary hover:underline font-medium">Đánh dấu đã đọc</button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div key={index} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 relative">
                      {index < unreadCount && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                      <div className="pl-3" onClick={() => {
                        if (notif.adminRoute) router.push(notif.adminRoute);
                        else if (notif.blogSlug) router.push(`/blog/${notif.blogSlug}`);
                        setShowNotifications(false);
                      }}>
                        <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Hệ thống • vừa xong</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Không có thông báo mới
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-center">
                <button className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Xem tất cả</button>
              </div>
            </div>
          )}


        </div>

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
