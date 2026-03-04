"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NODES = {
    workers: { label: "Người lao động", icon: "engineering", count: "12,500+", desc: "Lao động được xác minh", color: "#3b82f6", glow: "rgba(59,130,246,0.4)" },
    platform: { label: "BuildForce Platform", icon: "hub", count: "AI-Powered", desc: "Nền tảng ghép nối thông minh", color: "#8b5cf6", glow: "rgba(139,92,246,0.5)" },
    contractors: { label: "Nhà thầu / HR", icon: "domain", count: "850+", desc: "Doanh nghiệp xây dựng", color: "#10b981", glow: "rgba(16,185,129,0.4)" },
};

const PLATFORM_SERVICES = [
    { id: "matching", label: "AI Job Matching", icon: "psychology", color: "#f59e0b", desc: "Thuật toán khớp lao động theo kỹ năng, vị trí, lịch làm việc" },
    { id: "verify", label: "Xác minh danh tính", icon: "verified_user", color: "#3b82f6", desc: "CCCD, chứng chỉ nghề, hồ sơ lịch sử công trình" },
    { id: "payment", label: "Thanh toán an toàn", icon: "account_balance", color: "#10b981", desc: "Escrow payment, bảo vệ quyền lợi cả 2 bên" },
    { id: "rating", label: "Đánh giá & Danh tiếng", icon: "workspace_premium", color: "#8b5cf6", desc: "Hệ thống reputation blockchain minh bạch" },
    { id: "map", label: "Ghép nối địa lý", icon: "location_on", color: "#ef4444", desc: "Matching theo khoảng cách, tối ưu chi phí di chuyển" },
    { id: "contract", label: "Hợp đồng số", icon: "description", color: "#06b6d4", desc: "E-contract, ký số điện tử an toàn pháp lý" },
];

const AI_FLOW_STEPS = [
    { step: 1, label: "Thu thập dữ liệu", icons: ["Worker Profile", "Skills", "History", "Location"], color: "#3b82f6" },
    { step: 2, label: "Xử lý AI Engine", icons: ["NLP Analysis", "Vector Score", "Geo Filter", "Ranking"], color: "#8b5cf6" },
    { step: 3, label: "Tính điểm ghép nối", icons: ["Skill Match", "Distance", "Rating", "Availability"], color: "#f59e0b" },
    { step: 4, label: "Đề xuất kết quả", icons: ["Top 10 Workers", "Match %", "HR Review", "Confirm"], color: "#10b981" },
];

const IMPACT_STATS = [
    { value: "12,500+", label: "Lao động đã xác minh", icon: "group", color: "text-primary" },
    { value: "850+", label: "Nhà thầu đối tác", icon: "domain", color: "text-emerald-500" },
    { value: "98%", label: "Tỷ lệ ghép nối thành công", icon: "psychology", color: "text-purple-500" },
    { value: "2.5km", label: "Khoảng cách ghép nối TB", icon: "near_me", color: "text-amber-500" },
    { value: "< 2 giờ", label: "Thời gian tìm được lao động", icon: "schedule", color: "text-red-500" },
    { value: "₫500B+", label: "Tổng giá trị công trình", icon: "monetization_on", color: "text-cyan-500" },
];

export default function EcosystemPage() {
    const [activeService, setActiveService] = useState<string | null>(null);
    const [activeFlowStep, setActiveFlowStep] = useState(0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFlowStep(prev => (prev + 1) % AI_FLOW_STEPS.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#040816] pt-24 pb-24 overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)]" />
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-500 rounded-full opacity-30"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                        animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.5, 1] }}
                        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Page header */}
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-purple-400 text-xs font-black uppercase tracking-widest">Sơ đồ Hệ sinh thái</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight mb-4">
                        BuildForce
                        <span className="block bg-gradient-to-r from-sky-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                            Ecosystem
                        </span>
                    </h1>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">
                        Nền tảng kết nối thông minh giữa lao động xây dựng và nhà thầu, được vận hành bởi AI
                    </p>
                </motion.div>

                {/* Main Ecosystem Diagram */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative mb-20"
                >
                    {/* Central diagram */}
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-0 relative">

                        {/* WORKERS node */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative flex flex-col items-center"
                        >
                            <div className="w-52 h-52 rounded-[4rem] bg-gradient-to-br from-sky-500/20 to-blue-600/20 border-2 border-sky-500/30 flex flex-col items-center justify-center gap-4 shadow-[0_0_60px_rgba(59,130,246,0.2)] backdrop-blur-sm cursor-pointer"
                                style={{ boxShadow: "0 0 60px rgba(59,130,246,0.15), inset 0 1px 1px rgba(255,255,255,0.1)" }}
                            >
                                <span className="material-symbols-outlined text-sky-400 text-6xl">engineering</span>
                                <div className="text-center">
                                    <p className="font-black text-white text-lg leading-tight">Người lao động</p>
                                    <p className="text-sky-400 text-xs font-black">12,500+ đã xác minh</p>
                                </div>
                            </div>

                            {/* Worker tags */}
                            <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-[220px]">
                                {["Thợ điện", "Thợ xây", "Thợ hàn", "Thợ mộc", "Kỹ sư"].map(t => (
                                    <span key={t} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-black rounded-full">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Connection arrows - LEFT */}
                        <div className="hidden lg:flex flex-col items-center mx-4">
                            <div className="flex flex-col items-end gap-2">
                                <motion.div
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                    <span className="text-xs font-black text-sky-400">Hồ sơ & Kỹ năng</span>
                                    <span className="material-symbols-outlined text-sky-400 text-base">arrow_forward</span>
                                </motion.div>
                                <motion.div
                                    animate={{ x: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5"
                                >
                                    <span className="material-symbols-outlined text-emerald-400 text-base">arrow_back</span>
                                    <span className="text-xs font-black text-emerald-400">Đề xuất việc làm</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </motion.div>
                            </div>
                            <div className="w-20 h-0.5 bg-gradient-to-r from-sky-500/50 to-purple-500/50 mt-2" />
                        </div>

                        {/* PLATFORM CENTER */}
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            className="relative"
                        >
                            {/* Glow rings */}
                            <div className="absolute inset-0 rounded-[5rem] bg-purple-500/10 blur-3xl scale-125" />
                            <div className="absolute -inset-4 rounded-[5rem] border border-purple-500/20 animate-pulse" />

                            <div className="relative w-72 h-72 rounded-[5rem] bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border-2 border-purple-500/40 flex flex-col items-center justify-center gap-4 shadow-[0_0_100px_rgba(139,92,246,0.3)] backdrop-blur-sm z-10"
                                style={{ boxShadow: "0 0 100px rgba(139,92,246,0.2), inset 0 1px 1px rgba(255,255,255,0.05)" }}
                            >
                                <div className="w-20 h-20 rounded-3xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                    <span className="material-symbols-outlined text-purple-400 text-5xl">hub</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-black text-white text-2xl">BuildForce</p>
                                    <p className="font-black text-purple-400 text-sm">AI-Powered Platform</p>
                                </div>
                                {/* Orbiting dots */}
                                <div className="absolute inset-0 rounded-[5rem] overflow-hidden pointer-events-none">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4"
                                    >
                                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-sky-500 rounded-full -translate-x-1/2 shadow-[0_0_10px_#3b82f6]" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-8"
                                    >
                                        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-emerald-500 rounded-full -translate-x-1/2 shadow-[0_0_10px_#10b981]" />
                                    </motion.div>
                                </div>
                            </div>

                            {/* Services around center */}
                            <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-2 justify-center w-80">
                                {PLATFORM_SERVICES.map(srv => (
                                    <button
                                        key={srv.id}
                                        onClick={() => setActiveService(activeService === srv.id ? null : srv.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${activeService === srv.id ? "scale-105 shadow-lg" : "opacity-70 hover:opacity-100"
                                            }`}
                                        style={{
                                            backgroundColor: `${srv.color}15`,
                                            borderColor: `${srv.color}40`,
                                            color: srv.color,
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-base">{srv.icon}</span>
                                        {srv.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Connection arrows - RIGHT */}
                        <div className="hidden lg:flex flex-col items-center mx-4">
                            <div className="w-20 h-0.5 bg-gradient-to-r from-purple-500/50 to-emerald-500/50 mb-2" />
                            <div className="flex flex-col items-start gap-2">
                                <motion.div
                                    animate={{ x: [0, 10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5"
                                >
                                    <span className="material-symbols-outlined text-purple-400 text-base">arrow_forward</span>
                                    <span className="text-xs font-black text-purple-400">Lao động phù hợp</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                </motion.div>
                                <motion.div
                                    animate={{ x: [0, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                    className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-xs font-black text-amber-400">Yêu cầu tuyển dụng</span>
                                    <span className="material-symbols-outlined text-amber-400 text-base">arrow_back</span>
                                </motion.div>
                            </div>
                        </div>

                        {/* CONTRACTORS node */}
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative flex flex-col items-center"
                        >
                            <div className="w-52 h-52 rounded-[4rem] bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border-2 border-emerald-500/30 flex flex-col items-center justify-center gap-4 backdrop-blur-sm cursor-pointer"
                                style={{ boxShadow: "0 0 60px rgba(16,185,129,0.15), inset 0 1px 1px rgba(255,255,255,0.1)" }}
                            >
                                <span className="material-symbols-outlined text-emerald-400 text-6xl">domain</span>
                                <div className="text-center">
                                    <p className="font-black text-white text-lg leading-tight">Nhà thầu / HR</p>
                                    <p className="text-emerald-400 text-xs font-black">850+ doanh nghiệp</p>
                                </div>
                            </div>

                            {/* Contractor tags */}
                            <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-[220px]">
                                {["Coteccons", "Hòa Bình", "Delta Group", "Vinhomes", "Sun Group"].map(t => (
                                    <span key={t} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black rounded-full">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Active service tooltip */}
                    {activeService && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-24 max-w-sm mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-5 text-center"
                        >
                            {PLATFORM_SERVICES.filter(s => s.id === activeService).map(srv => (
                                <div key={srv.id}>
                                    <span className="material-symbols-outlined text-4xl mb-2 block" style={{ color: srv.color }}>{srv.icon}</span>
                                    <p className="font-black text-white mb-1">{srv.label}</p>
                                    <p className="text-slate-400 text-sm">{srv.desc}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>

                {/* AI Matching Flow */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-20"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-white mb-2">AI Matching Engine</h2>
                        <p className="text-slate-400 font-medium">Quy trình ghép nối lao động tự động</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {AI_FLOW_STEPS.map((flow, idx) => (
                            <motion.div
                                key={flow.step}
                                animate={{
                                    borderColor: activeFlowStep === idx ? `${flow.color}60` : "rgba(255,255,255,0.05)",
                                    boxShadow: activeFlowStep === idx ? `0 0 30px ${flow.color}20` : "none",
                                }}
                                transition={{ duration: 0.5 }}
                                className="relative bg-slate-900/50 backdrop-blur border border-white/5 rounded-3xl p-6"
                            >
                                {/* Step number */}
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg mb-5 transition-all duration-500"
                                    style={{
                                        backgroundColor: activeFlowStep === idx ? `${flow.color}20` : "rgba(255,255,255,0.05)",
                                        color: activeFlowStep === idx ? flow.color : "#64748b",
                                    }}
                                >
                                    {flow.step}
                                </div>

                                <h3 className="font-black text-white text-sm mb-4" style={{ color: activeFlowStep === idx ? flow.color : "white" }}>
                                    {flow.label}
                                </h3>

                                <div className="space-y-2">
                                    {flow.icons.map((item, i) => (
                                        <motion.div
                                            key={item}
                                            animate={{ opacity: activeFlowStep === idx ? 1 : 0.4 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: flow.color }} />
                                            <span className="text-xs font-bold text-slate-400">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Active indicator */}
                                {activeFlowStep === idx && (
                                    <motion.div
                                        layoutId="flowIndicator"
                                        className="absolute inset-0 rounded-3xl border-2 pointer-events-none"
                                        style={{ borderColor: flow.color }}
                                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                    />
                                )}

                                {/* Arrow to next */}
                                {idx < AI_FLOW_STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                                        <motion.div
                                            animate={{ opacity: activeFlowStep === idx ? 1 : 0.3 }}
                                            className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-white/10"
                                        >
                                            <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward_ios</span>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Impact Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-white mb-2">Tác động của BuildForce</h2>
                        <p className="text-slate-400 font-medium">Chỉ số hoạt động thực tế</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {IMPACT_STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                                whileHover={{ scale: 1.03 }}
                                className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-3xl p-7 text-center hover:border-white/10 transition-all"
                            >
                                <span className={`material-symbols-outlined text-4xl ${stat.color} mb-4 block`}>{stat.icon}</span>
                                <p className={`text-4xl font-black ${stat.color} mb-2 tracking-tight`}>{stat.value}</p>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
