"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAV_LINKS } from "@/data/mockData";
import api from "@/utils/api";

export const Header = () => {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentPackageName, setCurrentPackageName] = useState<string | null>(null);
  const [currentPackageLevel, setCurrentPackageLevel] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        if (document.documentElement.classList.contains("dark")) {
            setIsDarkMode(true);
        }

        checkAuthStatus();

        // Re-check when localStorage changes (login/logout in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token') {
                checkAuthStatus();
            }
        };

        // Custom event fired by signin page after successful login
        const handleLoginEvent = () => {
            checkAuthStatus();
        };

        const handlePackageUpdated = () => {
            checkAuthStatus();
        };

        const handleLogoutEvent = () => {
            setIsLoggedIn(false);
            setUserProfile(null);
            setCurrentPackageName(null);
            setCurrentPackageLevel(null);
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("userLoggedIn", handleLoginEvent);
        window.addEventListener("packageUpdated", handlePackageUpdated);
        window.addEventListener("userLoggedOut", handleLogoutEvent);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("userLoggedIn", handleLoginEvent);
            window.removeEventListener("packageUpdated", handlePackageUpdated);
            window.removeEventListener("userLoggedOut", handleLogoutEvent);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            try {
                // Token auto-attached via axios interceptor in utils/api.ts
                const response = await api.get('/api/auth/profile');
                if (response.data.success) {
                    setUserProfile(response.data.data);
          if (response.data.data.role === "hr") {
            try {
              const pkgRes = await api.get('/api/payments/my-package');
              const pkg = pkgRes.data?.data;
              if (pkg) {
                setCurrentPackageName(pkg.packageName || null);
                setCurrentPackageLevel(typeof pkg.priorityLevel === "number" ? pkg.priorityLevel : null);
              } else {
                setCurrentPackageName(null);
                setCurrentPackageLevel(null);
              }
            } catch {
              setCurrentPackageName(null);
              setCurrentPackageLevel(null);
            }
          } else {
            setCurrentPackageName(null);
            setCurrentPackageLevel(null);
          }
                }
            } catch (error) {
                console.error("Failed to fetch user profile for header:", error);
                if (error && (error as any).response?.status === 401) {
                    handleSignOut();
                }
            }
        } else {
            setIsLoggedIn(false);
            setUserProfile(null);
      setCurrentPackageName(null);
      setCurrentPackageLevel(null);
        }
    };

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
        setIsDarkMode(!isDarkMode);
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserProfile(null);
        setCurrentPackageName(null);
        setCurrentPackageLevel(null);
        setShowDropdown(false);
        router.push('/signin');
    };

    // Construct Avatar text or image
    const getAvatarContent = () => {
        if (userProfile?.avatar) {
            return <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />;
        }
        if (userProfile?.firstName && userProfile?.lastName) {
            return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
        }
        if (userProfile?.email) {
            return userProfile.email.charAt(0).toUpperCase();
        }
        return <span className="material-symbols-outlined text-white">person</span>;
    };

  const packageNameLower = currentPackageName?.toLowerCase() || "";
  const normalizedRole = String(userProfile?.role || "").toUpperCase();
  const effectivePackageLevel =
    currentPackageLevel ??
    (packageNameLower.includes("enterprise") ? 2 : packageNameLower.includes("pro") ? 1 : packageNameLower ? 0 : null);
  const packageRingClass =
    effectivePackageLevel === 2
      ? "ring-[3px] ring-amber-400/95 shadow-[0_0_0_3px_rgba(251,191,36,0.22),0_0_24px_rgba(245,158,11,0.32)]"
      : effectivePackageLevel === 1
        ? "ring-[3px] ring-sky-400/95 shadow-[0_0_0_3px_rgba(96,165,250,0.2),0_0_22px_rgba(59,130,246,0.28)]"
        : "";
  const packageAuraClass =
    effectivePackageLevel === 2
      ? "from-amber-300 via-yellow-300 to-orange-400"
      : effectivePackageLevel === 1
        ? "from-sky-400 via-blue-500 to-indigo-500"
        : "from-slate-300 via-slate-400 to-slate-500";
  const packageIcon =
    effectivePackageLevel === 2 ? "diamond" : effectivePackageLevel === 1 ? "workspace_premium" : "inventory_2";

    return (
        <nav suppressHydrationWarning className={`fixed top-0 z-50 w-full border-b transition-all duration-300 glass ${isScrolled
            ? "py-2 border-slate-200 dark:border-slate-800 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
            : "py-4 border-white/10 dark:border-slate-800/50"
            }`}>
            <div suppressHydrationWarning className="max-w-7xl mx-auto px-6">
                <div suppressHydrationWarning className="flex justify-between h-20 items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-primary p-2 rounded-lg transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-white text-3xl">construction</span>
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
                            Build<span className="text-primary">Force</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-10">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-base font-semibold hover:text-primary transition-colors text-slate-600 dark:text-slate-300 dark:hover:text-primary"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

                        {/* HR quick actions */}
                        {isLoggedIn && normalizedRole === "HR" && (
                            <button
                                onClick={() => router.push("/hr-dashboard")}
                                className="h-10 px-4 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center gap-1 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 transition-all"
                            >
                                <span className="material-symbols-outlined text-base">dashboard</span>
                                HR Dashboard
                            </button>
                        )}

                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Chuyển chế độ sáng/tối"
                        >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                                {isDarkMode ? "light_mode" : "dark_mode"}
                            </span>
                        </button>

                        {isLoggedIn ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                              <div className="relative">
                                <div className={`absolute inset-[-5px] rounded-full bg-gradient-to-br ${packageAuraClass} opacity-80 blur-[6px] ${effectivePackageLevel !== null ? "" : "hidden"}`} />
                                <div className={`relative w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden border-[2.5px] border-white dark:border-slate-800 shadow-md ${packageRingClass}`}>
                                  {getAvatarContent()}
                                </div>
                                {effectivePackageLevel !== null && (
                                  <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 shadow-lg flex items-center justify-center ${effectivePackageLevel === 2 ? "bg-amber-500" : effectivePackageLevel === 1 ? "bg-sky-500" : "bg-slate-500"}`}>
                                    <span className="material-symbols-outlined text-[13px] text-white">
                                      {packageIcon}
                                    </span>
                                  </div>
                                )}
                              </div>
                                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-sm">
                                        expand_more
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : "Người dùng"}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {userProfile?.email}
                                            </p>
                                            {normalizedRole === "HR" && currentPackageName && (
                                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                                                    <span className="material-symbols-outlined text-[14px]">
                                                        workspace_premium
                                                    </span>
                                                    {currentPackageName}
                                                </div>
                                            )}
                                        </div>
                                        {normalizedRole === "ADMIN" ? (
                                            <Link
                                                href="/admin"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                                Admin Dashboard
                                            </Link>
                                        ) : normalizedRole === "HR" ? (
                                            <Link
                                                href="/hr-dashboard"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                                HR Dashboard
                                            </Link>
                                        ) : null}
                                        <Link
                                            href="/profile"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                            Hồ sơ của tôi
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">settings</span>
                                            Cài đặt
                                        </Link>
                                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">logout</span>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/signin" className="text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link href="/signup" className="bg-primary hover:bg-sky-600 text-white px-8 py-3 rounded-full text-base font-bold transition-all transform hover:scale-105 shadow-lg active:scale-95 inline-block">
                                    Tham gia ngay
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="p-2">
                            <span className="material-symbols-outlined text-2xl text-slate-600 dark:text-slate-400">
                                {isDarkMode ? "light_mode" : "dark_mode"}
                            </span>
                        </button>

                        {isLoggedIn ? (
                            <Link href="/profile" className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                                    {getAvatarContent()}
                                </div>
                            </Link>
                        ) : null}

                        <button className="p-2">
                            <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-400">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
