"use client";

import React, { useState } from "react";
import Image from "next/image";
import { USER_PROFILE } from "@/data/mockData";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            {/* 1. Dashboard Header / Cover */}
            <div className="relative h-64 md:h-72 w-full overflow-hidden">
                <img
                    src={USER_PROFILE.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 backdrop-blur-[1px]"></div>
            </div>

            {/* 2. Main Dashboard Container */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 -mt-20 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT SIDEBAR - Identity & Global Stats */}
                    <div className="lg:w-80 flex-shrink-0 space-y-6">
                        {/* Profile Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 card-shadow text-center">
                            <div className="relative inline-block mb-6">
                                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-2xl mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <img
                                        alt={USER_PROFILE.name}
                                        className="w-full h-full object-cover"
                                        src={USER_PROFILE.avatar}
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-2 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl">
                                    <span className="material-symbols-outlined text-xl font-bold">verified</span>
                                </div>
                            </div>

                            <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-1">{USER_PROFILE.name}</h1>
                            <p className="text-slate-500 font-bold mb-6 italic">{USER_PROFILE.role} & {USER_PROFILE.specialty}</p>

                            <div className="flex flex-col gap-2">
                                <button className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-700 dark:text-slate-300 font-black text-left hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group">
                                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">dashboard</span>
                                    <span>My Dashboard</span>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-left hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
                                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">work</span>
                                    <span>My Projects</span>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-left hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group">
                                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">payments</span>
                                    <span>Earnings & Tax</span>
                                </button>
                            </div>
                        </div>

                        {/* User Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button className="bg-primary hover:bg-sky-500 text-white w-full py-4 rounded-2xl text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-xl">edit</span>
                                Edit Public Profile
                            </button>
                            <button className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 w-full py-4 rounded-2xl text-sm font-black border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-xl">settings</span>
                                Account Settings
                            </button>
                        </div>

                        {/* Status Card */}
                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10">
                                <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-4">Availability</h3>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-[0_0_10px_#10B981]"></div>
                                    <span className="font-black text-lg text-secondary">Open to Offers</span>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed font-bold">
                                    Currently seeking Senior Welder roles for Q1 2024.
                                </p>
                            </div>
                            <div className="absolute -bottom-10 -right-10 opacity-10">
                                <span className="material-symbols-outlined text-9xl">schedule</span>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-grow space-y-6 pb-12">
                        {/* 3. Quick Stats Ribbon */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 card-shadow flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-transform">
                                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{USER_PROFILE.stats.completedProjects}</p>
                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Completed</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 card-shadow flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-transform border-b-primary/50">
                                <p className="text-3xl font-black text-primary mb-1">{USER_PROFILE.stats.trustScore}</p>
                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Trust Score</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 card-shadow flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-transform border-b-secondary/50">
                                <p className="text-3xl font-black text-secondary mb-1">{USER_PROFILE.stats.successRate}%</p>
                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Success Rate</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 card-shadow flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-transform border-b-amber-500/50">
                                <p className="text-3xl font-black text-amber-500 mb-1">{USER_PROFILE.stats.experienceYears}y</p>
                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Experience</p>
                            </div>
                        </div>

                        {/* 4. Tab Navigation */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveTab("overview")}
                                className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "overview" ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Overview
                                {activeTab === "overview" && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-primary rounded-full"></div>}
                            </button>
                            <button
                                onClick={() => setActiveTab("profile-preview")}
                                className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "profile-preview" ? "text-primary" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Public Preview
                            </button>
                            <button className="pb-4 px-2 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Verification center</button>
                        </div>

                        {/* 5. Overview Dashboard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Profile Completion Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 card-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Profile Strength</h3>
                                    <span className="text-primary font-black">{USER_PROFILE.profileStrength}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" style={{ width: `${USER_PROFILE.profileStrength}%` }}></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-secondary font-bold">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        <span>Skills & Expertise updated</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-secondary font-bold">
                                        <span className="material-symbols-outlined">check_circle</span>
                                        <span>Identity Verified</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400 font-bold">
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center"></div>
                                        <span>Add current project for 100%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Wallet / Earnings Summary */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white card-shadow relative overflow-hidden group">
                                <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-6">Wallet Balance</h3>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-4xl font-black text-white">
                                        ${mounted ? USER_PROFILE.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : USER_PROFILE.walletBalance.toFixed(2)}
                                    </span>
                                    <span className="text-secondary font-black text-sm uppercase">+{USER_PROFILE.walletGrowth}% this month</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl font-black text-sm transition-all text-center">Withdraw</button>
                                    <button className="bg-primary hover:bg-sky-500 p-3 rounded-2xl font-black text-sm transition-all text-center">View History</button>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
                                </div>
                            </div>

                            {/* Skills/Trade Managed */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 card-shadow">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Trade Identity</h3>
                                    <button className="text-primary font-black text-sm hover:underline">Edit</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {USER_PROFILE.skills.slice(0, 4).map(s => (
                                        <span key={s} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{s}</span>
                                    ))}
                                    <button className="px-4 py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-400 hover:border-primary hover:text-primary transition-all">+ Add Skill</button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 card-shadow">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Recent Notifications</h3>
                                <div className="space-y-6">
                                    {USER_PROFILE.notifications.map(notif => (
                                        <div key={notif.id} className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl ${notif.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-primary' : 'bg-green-50 dark:bg-green-900/20 text-secondary'} flex items-center justify-center`}>
                                                <span className="material-symbols-outlined">{notif.icon}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-slate-800 dark:text-slate-200">{notif.title}</p>
                                                <p className="text-xs text-slate-500 font-bold">{notif.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
