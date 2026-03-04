"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NEARBY_WORKERS = [
    {
        id: 1, name: "Nguyễn Văn Bình", skill: "Thợ điện", experience: 6,
        distance: 1.2, rating: 4.8, reviews: 42, completedJobs: 38,
        availability: "Sẵn sàng", matchScore: 97, avatar: null, initials: "NB",
        color: "from-sky-500 to-blue-600",
        badges: ["Xác minh CCCD", "Top 5% thợ điện"],
        location: "Hải Châu, Đà Nẵng",
        salary: "500k/ngày",
    },
    {
        id: 2, name: "Trần Văn Cường", skill: "Thợ xây", experience: 8,
        distance: 2.3, rating: 4.6, reviews: 67, completedJobs: 55,
        availability: "Sẵn sàng", matchScore: 93, avatar: null, initials: "TC",
        color: "from-amber-500 to-orange-600",
        badges: ["Thợ ưu tú", "Xác minh CCCD"],
        location: "Cẩm Lệ, Đà Nẵng",
        salary: "450k/ngày",
    },
    {
        id: 3, name: "Phạm Thị Hoa", skill: "Thợ hoàn thiện", experience: 4,
        distance: 3.1, rating: 4.9, reviews: 31, completedJobs: 29,
        availability: "Sẵn sàng", matchScore: 88, avatar: null, initials: "PH",
        color: "from-purple-500 to-pink-600",
        badges: ["Đánh giá xuất sắc"],
        location: "Ngũ Hành Sơn, Đà Nẵng",
        salary: "380k/ngày",
    },
    {
        id: 4, name: "Lê Minh Tuấn", skill: "Thợ hàn", experience: 10,
        distance: 3.8, rating: 4.7, reviews: 89, completedJobs: 73,
        availability: "Bận đến 15/06", matchScore: 85, avatar: null, initials: "LT",
        color: "from-red-500 to-rose-600",
        badges: ["Kỳ cựu", "Top thợ hàn"],
        location: "Liên Chiểu, Đà Nẵng",
        salary: "600k/ngày",
    },
    {
        id: 5, name: "Hoàng Đức Nam", skill: "Thợ điện", experience: 3,
        distance: 4.5, rating: 4.5, reviews: 18, completedJobs: 15,
        availability: "Sẵn sàng", matchScore: 79, avatar: null, initials: "HN",
        color: "from-sky-400 to-cyan-600",
        badges: ["Tân binh triển vọng"],
        location: "Thanh Khê, Đà Nẵng",
        salary: "400k/ngày",
    },
    {
        id: 6, name: "Đinh Quang Khải", skill: "Thợ ống nước", experience: 5,
        distance: 5.2, rating: 4.3, reviews: 24, completedJobs: 20,
        availability: "Sẵn sàng", matchScore: 72, avatar: null, initials: "DK",
        color: "from-teal-500 to-emerald-600",
        badges: ["Xác minh CCCD"],
        location: "Sơn Trà, Đà Nẵng",
        salary: "420k/ngày",
    },
];

const PROJECT_INFO = {
    title: "Xây dựng Khu căn hộ The Ocean View",
    company: "Coteccons Construction",
    location: "Bán đảo Sơn Trà, Đà Nẵng",
    neededSkill: "Thợ điện",
    workers: 3,
    startDate: "15/06/2026",
    salary: "500k/ngày",
};

export default function MatchingPage() {
    const [selectedWorker, setSelectedWorker] = useState<typeof NEARBY_WORKERS[0] | null>(null);
    const [accepted, setAccepted] = useState<number[]>([]);
    const [rejected, setRejected] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState<"distance" | "rating" | "matchScore">("matchScore");
    const [view, setView] = useState<"list" | "detail">("list");

    const sortedWorkers = [...NEARBY_WORKERS].sort((a, b) => b[sortBy] - a[sortBy]);

    const handleAccept = (id: number) => {
        setAccepted(prev => [...prev, id]);
        setRejected(prev => prev.filter(x => x !== id));
    };

    const handleReject = (id: number) => {
        setRejected(prev => [...prev, id]);
        setAccepted(prev => prev.filter(x => x !== id));
    };

    const getStatus = (id: number) => {
        if (accepted.includes(id)) return "accepted";
        if (rejected.includes(id)) return "rejected";
        return "pending";
    };

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-24 pb-24 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
                    {/* Project Banner */}
                    <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-[3rem] p-8 text-white mb-8 relative overflow-hidden shadow-2xl shadow-primary/30">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                        <div className="relative z-10">
                            <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-2">🤖 AI Matching — Đã tìm thấy lao động phù hợp</p>
                            <h1 className="text-3xl font-black mb-2 tracking-tight">{PROJECT_INFO.title}</h1>
                            <div className="flex flex-wrap gap-4 mt-4">
                                {[
                                    { icon: "engineering", label: PROJECT_INFO.neededSkill },
                                    { icon: "group", label: `${PROJECT_INFO.workers} người` },
                                    { icon: "location_on", label: PROJECT_INFO.location },
                                    { icon: "payments", label: PROJECT_INFO.salary },
                                    { icon: "calendar_today", label: `Từ ${PROJECT_INFO.startDate}` },
                                ].map(({ icon, label }) => (
                                    <div key={icon} className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-2">
                                        <span className="material-symbols-outlined text-lg">{icon}</span>
                                        <span className="text-sm font-bold">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { value: `${NEARBY_WORKERS.length}`, label: "Lao động phù hợp", color: "text-primary", bg: "bg-primary/5 border-primary/10" },
                            { value: `${accepted.length}`, label: "Đã chấp nhận", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/20" },
                            { value: "2.8km", label: "Khoảng cách TB", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/20" },
                        ].map(({ value, label, color, bg }) => (
                            <div key={label} className={`${bg} border rounded-3xl p-5 text-center`}>
                                <p className={`text-3xl font-black ${color}`}>{value}</p>
                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sắp xếp:</span>
                            {[
                                { key: "matchScore", label: "Điểm phù hợp" },
                                { key: "distance", label: "Gần nhất" },
                                { key: "rating", label: "Đánh giá cao" },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setSortBy(key as any)}
                                    className={`px-4 py-2 rounded-2xl font-black text-sm transition-all ${sortBy === key ? "bg-primary text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            {[
                                { v: "list", icon: "format_list_bulleted" },
                                { v: "detail", icon: "grid_view" },
                            ].map(({ v, icon }) => (
                                <button
                                    key={v}
                                    onClick={() => setView(v as any)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${view === v ? "bg-primary text-white" : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"}`}
                                >
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Workers List */}
                <div className="space-y-4">
                    {sortedWorkers.map((worker, idx) => {
                        const status = getStatus(worker.id);
                        return (
                            <motion.div
                                key={worker.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border-2 transition-all duration-300 ${status === "accepted" ? "border-emerald-400 shadow-lg shadow-emerald-500/10" :
                                        status === "rejected" ? "border-slate-200 dark:border-slate-800 opacity-50" :
                                            "border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:shadow-xl"
                                    }`}
                            >
                                <div className="flex items-start gap-5">
                                    {/* Rank */}
                                    <div className="w-8 text-center">
                                        <p className="text-2xl font-black text-slate-200 dark:text-slate-700">#{idx + 1}</p>
                                    </div>

                                    {/* Avatar */}
                                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${worker.color} flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0`}>
                                        {worker.initials}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{worker.name}</h3>
                                                    {status === "accepted" && (
                                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-black rounded-full">✓ Đã chấp nhận</span>
                                                    )}
                                                    {status === "rejected" && (
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-400 dark:bg-slate-800 text-xs font-black rounded-full">✕ Đã từ chối</span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 text-sm font-bold">{worker.skill} • {worker.experience} năm kinh nghiệm</p>
                                                <p className="text-xs text-slate-400 font-bold mt-1">📍 {worker.location}</p>
                                            </div>

                                            {/* Match score badge */}
                                            <div className="shrink-0 relative w-16 h-16">
                                                <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                                                    <circle cx="32" cy="32" r="24" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                                                    <circle cx="32" cy="32" r="24" fill="none"
                                                        stroke={worker.matchScore >= 90 ? "#10b981" : worker.matchScore >= 80 ? "#3b82f6" : "#f59e0b"}
                                                        strokeWidth="6" strokeLinecap="round"
                                                        strokeDasharray={`${(worker.matchScore / 100) * 150.8} 150.8`}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <p className={`text-xs font-black ${worker.matchScore >= 90 ? "text-emerald-500" : worker.matchScore >= 80 ? "text-primary" : "text-amber-500"}`}>
                                                        {worker.matchScore}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {worker.badges.map(b => (
                                                <span key={b} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black rounded-xl border border-slate-100 dark:border-slate-700">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stats row */}
                                        <div className="flex items-center flex-wrap gap-5">
                                            <div className="flex items-center gap-1.5 text-sm font-black text-primary">
                                                <span className="material-symbols-outlined text-lg">near_me</span>
                                                {worker.distance}km
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm font-black text-amber-500">
                                                <span className="material-symbols-outlined text-lg">star</span>
                                                {worker.rating} ({worker.reviews} đánh giá)
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm font-black text-slate-500">
                                                <span className="material-symbols-outlined text-lg">task_alt</span>
                                                {worker.completedJobs} công trình hoàn thành
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm font-black text-emerald-500">
                                                <span className="material-symbols-outlined text-lg">payments</span>
                                                {worker.salary}
                                            </div>
                                            <div className={`ml-auto flex items-center gap-1.5 text-xs font-black rounded-full px-3 py-1 ${worker.availability === "Sẵn sàng"
                                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                                }`}>
                                                <span className={`w-2 h-2 rounded-full ${worker.availability === "Sẵn sàng" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                                                {worker.availability}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col gap-3 shrink-0">
                                        <button
                                            onClick={() => handleAccept(worker.id)}
                                            className={`h-12 px-6 rounded-2xl font-black text-sm transition-all ${status === "accepted"
                                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                                                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white"
                                                }`}
                                        >
                                            {status === "accepted" ? "✓ Chấp nhận" : "Chấp nhận"}
                                        </button>
                                        <button
                                            onClick={() => handleReject(worker.id)}
                                            className={`h-12 px-6 rounded-2xl font-black text-sm transition-all ${status === "rejected"
                                                    ? "bg-slate-200 text-slate-500"
                                                    : "bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:bg-slate-800 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                                }`}
                                        >
                                            {status === "rejected" ? "✕ Từ chối" : "Từ chối"}
                                        </button>
                                        <button className="h-10 rounded-2xl font-black text-xs text-primary border border-primary/20 hover:bg-primary/5 transition-all">
                                            Xem hồ sơ
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Accepted summary */}
                {accepted.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-white rounded-[2rem] px-8 py-5 shadow-2xl shadow-emerald-500/40 flex items-center gap-4"
                    >
                        <span className="material-symbols-outlined text-3xl">how_to_reg</span>
                        <div>
                            <p className="font-black text-lg">Đã chọn {accepted.length}/{PROJECT_INFO.workers} lao động</p>
                            <p className="text-emerald-100 text-sm font-bold">
                                {accepted.length < PROJECT_INFO.workers
                                    ? `Cần thêm ${PROJECT_INFO.workers - accepted.length} người nữa`
                                    : "Đủ nhân lực! Bạn có thể xác nhận"}
                            </p>
                        </div>
                        {accepted.length >= PROJECT_INFO.workers && (
                            <button className="ml-4 h-12 px-8 bg-white text-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-50 transition-all">
                                Xác nhận →
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
