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

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("userLoggedIn", handleLoginEvent);

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

    const normalizedRole = String(userProfile?.role || "").toUpperCase();

    return (
        <nav className={`fixed top-0 z-50 w-full border-b transition-all duration-300 glass ${isScrolled
            ? "py-2 border-slate-200 dark:border-slate-800 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
            : "py-4 border-white/10 dark:border-slate-800/50"
            }`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between h-20 items-center">
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
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => router.push("/post-job")}
                                    className="h-10 px-4 rounded-full bg-primary text-white text-sm font-bold flex items-center gap-1 shadow-md hover:bg-primary/90 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">add</span>
                                    Đăng tin
                                </button>
                                <button
                                    onClick={() => router.push("/hr-dashboard")}
                                    className="h-10 px-4 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center gap-1 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">dashboard</span>
                                    HR Dashboard
                                </button>
                            </div>
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
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                                        {getAvatarContent()}
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

                        {isLoggedIn && normalizedRole === "HR" ? (
                            <button
                                onClick={() => router.push("/post-job")}
                                className="h-9 px-3 rounded-full bg-primary text-white text-xs font-bold flex items-center gap-1 shadow-md"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                Đăng tin
                            </button>
                        ) : isLoggedIn ? (
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
