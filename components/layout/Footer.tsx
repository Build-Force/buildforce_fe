"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-32 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary p-2 rounded-lg">
                                <span className="material-symbols-outlined text-white text-2xl">construction</span>
                            </div>
                            <span className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
                                Workforce<span className="text-primary">Connection</span>
                            </span>
                        </div>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                            The industry's most reliable talent marketplace. Connecting skilled tradespeople with top-tier construction projects nationwide.
                        </p>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest mb-2">Our Promise</p>
                            <p className="text-slate-600 dark:text-slate-400 text-base font-bold">We verify contractors. We protect workers.</p>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-black mb-8 uppercase text-sm tracking-[0.2em] text-slate-400">Platform</h5>
                        <ul className="space-y-6 text-lg text-slate-700 dark:text-slate-300 font-semibold">
                            <li><Link href="/jobs" className="hover:text-primary transition-colors flex items-center gap-2">Browse Jobs</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Find Skilled Workers</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Verification Services</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Apprenticeships</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black mb-8 uppercase text-sm tracking-[0.2em] text-slate-400">Company</h5>
                        <ul className="space-y-6 text-lg text-slate-700 dark:text-slate-300 font-semibold">
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">About Us</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Safety Standards</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Success Stories</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black mb-8 uppercase text-sm tracking-[0.2em] text-slate-400">Legal & Privacy</h5>
                        <ul className="space-y-6 text-lg text-slate-700 dark:text-slate-300 font-black">
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 underline">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 underline">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 underline">Worker Protection</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 underline">Payment Guarantees</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-slate-500 text-sm font-bold">© 2024 Workforce Connection Inc. All rights reserved.</p>
                    <div className="flex gap-10 text-sm text-slate-500 font-bold">
                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">public</span> English (US)</span>
                        <button className="flex items-center gap-2 cursor-pointer hover:text-primary" onClick={() => document.documentElement.classList.toggle('dark')}>
                            <span className="material-symbols-outlined text-lg">settings_brightness</span> Change Appearance
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
