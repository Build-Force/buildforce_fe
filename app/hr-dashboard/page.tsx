"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const JOB_POSTS = [
    {
        id: 1, title: "Thợ Điện Công Trình – The Ocean View",
        status: "active", applicants: 12, needed: 3, accepted: 1,
        location: "Sơn Trà, Đà Nẵng", salary: "500k/ngày",
        startDate: "15/06/2026", urgent: true, views: 248,
        skill: "Thợ điện",
        applicantList: [
            { id: 1, name: "Nguyễn Văn Bình", skill: "Thợ điện", experience: 6, distance: 1.2, rating: 4.8, matchScore: 97, status: "accepted", initials: "NB" },
            { id: 2, name: "Hoàng Đức Nam", skill: "Thợ điện", experience: 3, distance: 4.5, rating: 4.5, matchScore: 79, status: "pending", initials: "HN" },
            { id: 3, name: "Lê Văn Phúc", skill: "Thợ điện", experience: 5, distance: 2.8, rating: 4.6, matchScore: 88, status: "pending", initials: "LP" },
        ]
    },
    {
        id: 2, title: "Thợ Xây Kết Cấu – Smart City Zone A",
        status: "active", applicants: 8, needed: 5, accepted: 3,
        location: "Quảng Nam", salary: "450k/ngày",
        startDate: "20/06/2026", urgent: false, views: 176,
        skill: "Thợ xây",
        applicantList: [
            { id: 4, name: "Trần Văn Cường", skill: "Thợ xây", experience: 8, distance: 2.3, rating: 4.6, matchScore: 93, status: "accepted", initials: "TC" },
            { id: 5, name: "Vũ Quang Minh", skill: "Thợ xây", experience: 6, distance: 3.5, rating: 4.4, matchScore: 85, status: "accepted", initials: "VM" },
        ]
    },
    {
        id: 3, title: "Kỹ Sư Hiện Trường – Khu Đô Thị Mới",
        status: "closed", applicants: 5, needed: 1, accepted: 1,
        location: "Hòa Vang, Đà Nẵng", salary: "1.2tr/ngày",
        startDate: "01/05/2026", urgent: false, views: 421,
        skill: "Kỹ sư",
        applicantList: []
    },
    {
        id: 4, title: "Thợ Hàn Argon – Nhà Máy CN Liên Chiểu",
        status: "draft", applicants: 0, needed: 2, accepted: 0,
        location: "Liên Chiểu, Đà Nẵng", salary: "600k/ngày",
        startDate: "01/07/2026", urgent: false, views: 0,
        skill: "Thợ hàn",
        applicantList: []
    },
];

const STATS = [
    { label: "Tổng tin đăng", value: "12", icon: "work", color: "text-primary", bg: "from-sky-500/10 to-blue-600/10", border: "border-sky-100 dark:border-sky-800/30" },
    { label: "Đang tuyển", value: "4", icon: "pending_actions", color: "text-amber-500", bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-100 dark:border-amber-800/30" },
    { label: "Đã tuyển xong", value: "8", icon: "check_circle", color: "text-emerald-500", bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-100 dark:border-emerald-800/30" },
    { label: "Tổng lao động thuê", value: "47", icon: "group", color: "text-purple-500", bg: "from-purple-500/10 to-pink-500/10", border: "border-purple-100 dark:border-purple-800/30" },
];

const STATUS_CONFIG = {
    active: { label: "Đang tuyển", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500 animate-pulse" },
    closed: { label: "Đã đóng", color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400", dot: "bg-slate-400" },
    draft: { label: "Nháp", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" },
};

export default function HRDashboardPage() {
    const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "workers">("overview");
    const [selectedJob, setSelectedJob] = useState<typeof JOB_POSTS[0] | null>(null);
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredJobs = filterStatus === "all"
        ? JOB_POSTS
        : JOB_POSTS.filter(j => j.status === filterStatus);

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-24 pb-24 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">HR Portal</p>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Tuyển dụng</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Coteccons Construction • Đà Nẵng</p>
                        </div>
                        <div className="flex gap-3">
                            <a href="/post-job" className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-xl">add</span>
                                Đăng tin mới
                            </a>
                            <button className="h-14 w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-slate-500 text-2xl">notifications</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 w-fit">
                    {[
                        { id: "overview", label: "Tổng quan", icon: "dashboard" },
                        { id: "jobs", label: "Tin tuyển dụng", icon: "work" },
                        { id: "workers", label: "Lao động", icon: "people" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === tab.id
                                    ? "bg-primary text-white shadow-md shadow-primary/30"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {STATS.map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`bg-gradient-to-br ${stat.bg} border ${stat.border} rounded-[2rem] p-6 flex flex-col gap-4`}
                                    >
                                        <div className={`w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm`}>
                                            <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                                        </div>
                                        <div>
                                            <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Recent activity */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Hoạt động 7 ngày qua</h2>
                                        <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full">
                                            +23% so với tuần trước
                                        </span>
                                    </div>
                                    {/* Simple bar chart */}
                                    <div className="flex items-end gap-3 h-32">
                                        {[
                                            { day: "T2", views: 35, apps: 8 },
                                            { day: "T3", views: 52, apps: 12 },
                                            { day: "T4", views: 48, apps: 10 },
                                            { day: "T5", views: 71, apps: 18 },
                                            { day: "T6", views: 89, apps: 24 },
                                            { day: "T7", views: 43, apps: 11 },
                                            { day: "CN", views: 28, apps: 7 },
                                        ].map(({ day, views, apps }) => (
                                            <div key={day} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full flex flex-col items-center gap-1">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${(views / 89) * 80}px` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                        className="w-full bg-primary/30 rounded-t-lg relative"
                                                    >
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${(apps / 24) * 80}px` }}
                                                            transition={{ duration: 0.8, delay: 0.3 }}
                                                            className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                                                        />
                                                    </motion.div>
                                                </div>
                                                <p className="text-[10px] font-black text-slate-400">{day}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-6 mt-4">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/30" /><span className="text-xs font-bold text-slate-400">Lượt xem</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /><span className="text-xs font-bold text-slate-400">Lượt ứng tuyển</span></div>
                                    </div>
                                </div>

                                {/* Skill demand */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Ngành nghề cần nhất</h2>
                                    <div className="space-y-5">
                                        {[
                                            { skill: "Thợ điện", pct: 35, color: "#f59e0b" },
                                            { skill: "Thợ xây", pct: 28, color: "#3b82f6" },
                                            { skill: "Thợ hàn", pct: 20, color: "#ef4444" },
                                            { skill: "Kỹ sư", pct: 17, color: "#10b981" },
                                        ].map(({ skill, pct, color }) => (
                                            <div key={skill}>
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{skill}</span>
                                                    <span className="text-sm font-black" style={{ color }}>{pct}%</span>
                                                </div>
                                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Job posts */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Tin tuyển dụng gần đây</h2>
                                    <button onClick={() => setActiveTab("jobs")} className="text-primary font-black text-sm hover:underline">Xem tất cả →</button>
                                </div>
                                <div className="space-y-4">
                                    {JOB_POSTS.slice(0, 3).map(job => {
                                        const cfg = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
                                        return (
                                            <div key={job.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                                onClick={() => { setSelectedJob(job); setActiveTab("jobs"); }}
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary text-2xl">engineering</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">{job.title}</p>
                                                    <p className="text-xs text-slate-400 font-bold">{job.location} • {job.salary}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${cfg.color}`}>{cfg.label}</span>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">{job.applicants} ứng tuyển</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* JOBS TAB */}
                    {activeTab === "jobs" && (
                        <motion.div key="jobs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Filter */}
                            <div className="flex gap-3 mb-6">
                                {["all", "active", "closed", "draft"].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all ${filterStatus === s ? "bg-primary text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                                            }`}
                                    >
                                        {s === "all" ? "Tất cả" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {filteredJobs.map((job, idx) => {
                                    const cfg = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
                                    const progress = Math.round((job.accepted / job.needed) * 100);
                                    return (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.06 }}
                                            onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                            className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 border-2 cursor-pointer transition-all hover:shadow-xl ${selectedJob?.id === job.id ? "border-primary shadow-lg" : "border-slate-100 dark:border-slate-800"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {job.urgent && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-black rounded-full animate-pulse">🔥 Gấp</span>}
                                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${cfg.color} flex items-center gap-1.5`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1">{job.title}</h3>
                                                    <p className="text-sm text-slate-400 font-bold">📍 {job.location} • 💰 {job.salary}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-primary">{job.applicants}</p>
                                                    <p className="text-xs text-slate-400 font-bold">ứng tuyển</p>
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="mb-5">
                                                <div className="flex justify-between mb-1.5 text-xs font-black">
                                                    <span className="text-slate-500">Tiến độ tuyển dụng</span>
                                                    <span className="text-primary">{job.accepted}/{job.needed} người</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs font-black text-slate-400">
                                                <span>👁 {job.views} lượt xem</span>
                                                <span>📅 {job.startDate}</span>
                                                <div className="flex gap-3 ml-auto">
                                                    <button className="text-primary hover:underline" onClick={e => e.stopPropagation()}>Chỉnh sửa</button>
                                                    <button className="text-slate-400 hover:text-red-500" onClick={e => e.stopPropagation()}>Đóng</button>
                                                </div>
                                            </div>

                                            {/* Expandable applicant list */}
                                            <AnimatePresence>
                                                {selectedJob?.id === job.id && job.applicantList.length > 0 && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Danh sách ứng viên</p>
                                                            {job.applicantList.map(ap => (
                                                                <div key={ap.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-black text-xs">
                                                                        {ap.initials}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-black text-sm text-slate-900 dark:text-white">{ap.name}</p>
                                                                        <p className="text-xs text-slate-400 font-bold">{ap.distance}km • ⭐{ap.rating} • {ap.experience}năm KN</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${ap.status === "accepted"
                                                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                                                : "bg-slate-100 text-slate-500 dark:bg-slate-700"
                                                                            }`}>
                                                                            {ap.status === "accepted" ? "✓ Chấp nhận" : "Chờ xét"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* WORKERS TAB */}
                    {activeTab === "workers" && (
                        <motion.div key="workers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Lao động đã thuê</h2>
                                <div className="space-y-4">
                                    {[
                                        { name: "Nguyễn Văn Bình", skill: "Thợ điện", project: "The Ocean View", period: "15/06 – 15/09/2026", status: "Đang làm", rating: 4.8, initials: "NB", pay: "Đúng hạn" },
                                        { name: "Trần Văn Cường", skill: "Thợ xây", project: "Smart City Zone A", period: "20/06 – 20/10/2026", status: "Đang làm", rating: 4.6, initials: "TC", pay: "Đúng hạn" },
                                        { name: "Lê Minh Tuấn", skill: "Thợ hàn", project: "Nhà máy Liên Chiểu", period: "01/03 – 30/04/2026", status: "Hoàn thành", rating: 4.9, initials: "LT", pay: "Đã thanh toán" },
                                    ].map((w, i) => (
                                        <div key={i} className="flex items-center gap-4 p-5 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-black text-lg">
                                                {w.initials}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <p className="font-black text-slate-900 dark:text-white">{w.name}</p>
                                                    <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">{w.skill}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 font-bold">{w.project} • {w.period}</p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-black ${w.status === "Đang làm" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500"}`}>
                                                    {w.status}
                                                </span>
                                                <p className="text-xs text-slate-400 font-bold">⭐{w.rating} • {w.pay}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
