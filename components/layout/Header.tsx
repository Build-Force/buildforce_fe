"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/data/mockData";

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        // Check initial dark mode
        if (document.documentElement.classList.contains("dark")) {
            setIsDarkMode(true);
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle("dark");
        setIsDarkMode(!isDarkMode);
    };

    return (
        <nav className={`fixed top-0 z-50 w-full border-b transition-all duration-300 glass ${isScrolled
            ? "py-2 border-slate-200 dark:border-slate-800 shadow-lg"
            : "py-4 border-white/10 dark:border-slate-800/50"
            }`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between h-20 items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="bg-primary p-2 rounded-lg transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-white text-3xl">construction</span>
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
                            Workforce<span className="text-primary">Connection</span>
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

                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Toggle Dark Mode"
                        >
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                                {isDarkMode ? "light_mode" : "dark_mode"}
                            </span>
                        </button>

                        <Link href="/signin" className="text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                            Log In
                        </Link>
                        <button className="bg-primary hover:bg-sky-600 text-white px-8 py-3 rounded-full text-base font-bold transition-all transform hover:scale-105 shadow-lg active:scale-95">
                            Join Platform
                        </button>
                    </div>

                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="p-2">
                            <span className="material-symbols-outlined text-2xl text-slate-600 dark:text-slate-400">
                                {isDarkMode ? "light_mode" : "dark_mode"}
                            </span>
                        </button>
                        <button className="p-2">
                            <span className="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-400">menu</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
