"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_JOBS = [
    { id: 1, title: "Thợ Điện Công Trình", company: "Coteccons", location: "Hải Châu, Đà Nẵng", lat: 16.072, lng: 108.224, distance: 1.2, salary: "500k/ngày", skill: "Thợ điện", workers: 3, rating: 4.8, urgent: true },
    { id: 2, title: "Thợ Xây Kết Cấu", company: "Delta Group", location: "Thanh Khê, Đà Nẵng", lat: 16.063, lng: 108.207, distance: 2.5, salary: "450k/ngày", skill: "Thợ xây", workers: 5, rating: 4.6, urgent: false },
    { id: 3, title: "Thợ Hàn Argon", company: "Vinhomes", location: "Ngũ Hành Sơn, Đà Nẵng", lat: 16.022, lng: 108.241, distance: 4.1, salary: "600k/ngày", skill: "Thợ hàn", workers: 2, rating: 4.9, urgent: true },
    { id: 4, title: "Thợ Hoàn Thiện Nội thất", company: "Sun Group", location: "Sơn Trà, Đà Nẵng", lat: 16.090, lng: 108.247, distance: 3.8, salary: "380k/ngày", skill: "Thợ hoàn thiện", workers: 8, rating: 4.5, urgent: false },
    { id: 5, title: "Kỹ Sư Hiện Trường", company: "Hòa Bình Corp", location: "Cẩm Lệ, Đà Nẵng", lat: 16.031, lng: 108.212, distance: 5.3, salary: "1.2tr/ngày", skill: "Kỹ sư", workers: 1, rating: 4.7, urgent: false },
    { id: 6, title: "Thợ Ống Nước M&E", company: "Phú Mỹ Hưng", location: "Liên Chiểu, Đà Nẵng", lat: 16.101, lng: 108.176, distance: 6.9, salary: "420k/ngày", skill: "Thợ ống nước", workers: 4, rating: 4.4, urgent: false },
];

const SKILL_FILTERS = ["Tất cả", "Thợ điện", "Thợ xây", "Thợ hàn", "Thợ hoàn thiện", "Kỹ sư", "Thợ ống nước"];

const PIN_COLORS: Record<string, string> = {
    "Thợ điện": "#f59e0b",
    "Thợ xây": "#3b82f6",
    "Thợ hàn": "#ef4444",
    "Thợ hoàn thiện": "#8b5cf6",
    "Kỹ sư": "#10b981",
    "Thợ ống nước": "#06b6d4",
};

export default function MapPage() {
    const [selectedJob, setSelectedJob] = useState<typeof MOCK_JOBS[0] | null>(null);
    const [activeFilter, setActiveFilter] = useState("Tất cả");
    const [showList, setShowList] = useState(true);
    const [userLat] = useState(16.054);
    const [userLng] = useState(108.202);

    const filteredJobs = activeFilter === "Tất cả"
        ? MOCK_JOBS
        : MOCK_JOBS.filter(j => j.skill === activeFilter);

    // Convert lat/lng to SVG coordinates for the mock map
    const toSvg = (lat: number, lng: number) => {
        const x = ((lng - 108.16) / (108.26 - 108.16)) * 680 + 10;
        const y = ((16.11 - lat) / (16.11 - 16.00)) * 460 + 10;
        return { x, y };
    };

    const userPos = toSvg(userLat, userLng);

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-20 transition-all duration-500">
            {/* Header */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">map</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Bản Đồ Công Trình</h1>
                        <p className="text-sm text-slate-400 font-bold">Đà Nẵng • {filteredJobs.length} công việc đang tuyển</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowList(!showList)}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-sm text-slate-700 dark:text-slate-300"
                >
                    <span className="material-symbols-outlined text-xl">{showList ? "map" : "format_list_bulleted"}</span>
                    {showList ? "Xem bản đồ" : "Xem danh sách"}
                </button>
            </div>

            {/* Skill filters */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {SKILL_FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`shrink-0 px-5 py-2.5 rounded-2xl font-black text-sm transition-all ${activeFilter === f
                                    ? "bg-primary text-white shadow-md shadow-primary/30"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex h-[calc(100vh-160px)]">
                {/* MOCK MAP */}
                <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    {/* Map background with streets */}
                    <svg className="w-full h-full" viewBox="0 0 700 480" preserveAspectRatio="xMidYMid slice">
                        {/* Background */}
                        <rect width="700" height="480" fill="#e8edf4" />
                        <rect width="700" height="480" fill="url(#mapGrid)" />
                        <defs>
                            <pattern id="mapGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1d8e3" strokeWidth="0.5" />
                            </pattern>
                        </defs>

                        {/* Dark mode overlay */}
                        <rect width="700" height="480" fill="#0f172a" className="dark:opacity-70 opacity-0" />

                        {/* Roads */}
                        <g stroke="#c5cdd8" strokeWidth="6" fill="none" className="dark:stroke-slate-700">
                            <line x1="0" y1="230" x2="700" y2="200" />
                            <line x1="0" y1="180" x2="700" y2="280" />
                            <line x1="350" y1="0" x2="350" y2="480" />
                            <line x1="180" y1="0" x2="120" y2="480" />
                            <line x1="530" y1="0" x2="570" y2="480" />
                            <path d="M 200 100 Q 350 150 500 90" />
                            <path d="M 100 350 Q 300 300 600 380" />
                        </g>
                        <g stroke="#fff" strokeWidth="2" fill="none">
                            <line x1="0" y1="230" x2="700" y2="200" />
                            <line x1="0" y1="180" x2="700" y2="280" />
                            <line x1="350" y1="0" x2="350" y2="480" />
                        </g>

                        {/* Blocks/Buildings */}
                        {[
                            [80, 80, 60, 40], [160, 90, 50, 50], [250, 60, 70, 45], [400, 70, 80, 55],
                            [530, 80, 55, 50], [620, 95, 50, 40], [60, 300, 70, 50], [380, 310, 85, 55],
                            [500, 290, 65, 45], [620, 310, 50, 50], [100, 170, 55, 40], [430, 170, 60, 50],
                        ].map(([x, y, w, h], i) => (
                            <rect key={i} x={x} y={y} width={w} height={h}
                                fill="#d6dce8" stroke="#c0c9d8" strokeWidth="1" rx="4"
                                className="dark:fill-slate-700 dark:stroke-slate-600"
                            />
                        ))}

                        {/* Water/Ocean hint */}
                        <path d="M 620 0 Q 680 100 700 200 L 700 0 Z" fill="#bde3f7" opacity="0.5" className="dark:fill-sky-900 dark:opacity-30" />

                        {/* User location */}
                        <g transform={`translate(${userPos.x},${userPos.y})`}>
                            <circle r="20" fill="#3b82f6" opacity="0.15" />
                            <circle r="10" fill="#3b82f6" opacity="0.3" />
                            <circle r="6" fill="#3b82f6" stroke="white" strokeWidth="3" />
                            <text x="10" y="-12" fontSize="10" fill="#3b82f6" fontWeight="900" className="dark:fill-sky-400">Bạn</text>
                        </g>

                        {/* Distance rings */}
                        <circle cx={userPos.x} cy={userPos.y} r="60" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
                        <circle cx={userPos.x} cy={userPos.y} r="120" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" opacity="0.2" />

                        {/* Job pins */}
                        {filteredJobs.map(job => {
                            const pos = toSvg(job.lat, job.lng);
                            const color = PIN_COLORS[job.skill] || "#6366f1";
                            const isSelected = selectedJob?.id === job.id;
                            return (
                                <g key={job.id} transform={`translate(${pos.x},${pos.y})`}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedJob(job === selectedJob ? null : job)}
                                >
                                    {isSelected && <circle r="22" fill={color} opacity="0.3" />}
                                    <circle r={isSelected ? 14 : 10} fill={color} stroke="white" strokeWidth="3"
                                        style={{ filter: isSelected ? `drop-shadow(0 0 8px ${color})` : "none" }}
                                    />
                                    {job.urgent && <circle r="4" cx="8" cy="-8" fill="#ef4444" stroke="white" strokeWidth="2" />}
                                    <text x="0" y="4" textAnchor="middle" fontSize="9" fill="white" fontWeight="900">
                                        {job.skill.charAt(0)}
                                    </text>
                                    {isSelected && (
                                        <g transform="translate(16, -35)">
                                            <rect x="0" y="0" width="120" height="40" rx="8" fill="white"
                                                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}
                                                className="dark:fill-slate-800"
                                            />
                                            <text x="8" y="14" fontSize="8" fill="#1e293b" fontWeight="900" className="dark:fill-white">{job.title}</text>
                                            <text x="8" y="26" fontSize="7" fill="#3b82f6" fontWeight="700">{job.distance}km • {job.salary}</text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}

                        {/* Legend */}
                        <g transform="translate(10, 400)">
                            <rect x="0" y="0" width="200" height="70" rx="10" fill="white" opacity="0.9"
                                style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}
                                className="dark:fill-slate-800 dark:opacity-90"
                            />
                            <text x="10" y="16" fontSize="8" fill="#94a3b8" fontWeight="900">NGÀNH NGHỀ</text>
                            {Object.entries(PIN_COLORS).slice(0, 3).map(([skill, color], i) => (
                                <g key={skill} transform={`translate(10, ${25 + i * 14})`}>
                                    <circle r="4" fill={color} />
                                    <text x="12" y="4" fontSize="8" fill="#475569" fontWeight="700" className="dark:fill-slate-300">{skill}</text>
                                </g>
                            ))}
                            {Object.entries(PIN_COLORS).slice(3).map(([skill, color], i) => (
                                <g key={skill} transform={`translate(105, ${25 + i * 14})`}>
                                    <circle r="4" fill={color} />
                                    <text x="12" y="4" fontSize="8" fill="#475569" fontWeight="700" className="dark:fill-slate-300">{skill}</text>
                                </g>
                            ))}
                        </g>

                        {/* Scale bar */}
                        <g transform="translate(10, 395)">
                            <line x1="0" y1="-10" x2="50" y2="-10" stroke="#64748b" strokeWidth="2" />
                            <line x1="0" y1="-15" x2="0" y2="-5" stroke="#64748b" strokeWidth="2" />
                            <line x1="50" y1="-15" x2="50" y2="-5" stroke="#64748b" strokeWidth="2" />
                            <text x="25" y="-20" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="700">5km</text>
                        </g>
                    </svg>

                    {/* Selected job popup */}
                    <AnimatePresence>
                        {selectedJob && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800"
                            >
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-lg text-slate-500">close</span>
                                </button>
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                                        style={{ backgroundColor: PIN_COLORS[selectedJob.skill] }}
                                    >
                                        {selectedJob.skill.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{selectedJob.title}</h3>
                                            {selectedJob.urgent && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-black rounded-full">Gấp</span>}
                                        </div>
                                        <p className="text-slate-500 text-sm font-bold">{selectedJob.company}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-5">
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                        <p className="text-primary font-black text-lg">{selectedJob.distance}km</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khoảng cách</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                        <p className="text-emerald-500 font-black text-sm">{selectedJob.salary}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mức lương</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
                                        <p className="text-amber-500 font-black text-lg">⭐{selectedJob.rating}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đánh giá</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 font-bold mb-4">📍 {selectedJob.location} • 👥 Cần {selectedJob.workers} người</p>
                                <div className="flex gap-3">
                                    <button className="flex-1 h-12 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                                        Ứng tuyển ngay
                                    </button>
                                    <button className="h-12 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm">
                                        <span className="material-symbols-outlined text-xl">directions</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Jobs list sidebar */}
                {showList && (
                    <motion.div
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 30 }}
                        className="w-96 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Danh sách việc làm</h2>
                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-black">{filteredJobs.length}</span>
                            </div>

                            <div className="space-y-4">
                                {filteredJobs
                                    .sort((a, b) => a.distance - b.distance)
                                    .map((job, idx) => (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedJob(job === selectedJob ? null : job)}
                                            className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${selectedJob?.id === job.id
                                                    ? "border-primary bg-primary/5 shadow-lg"
                                                    : "border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow"
                                                    style={{ backgroundColor: PIN_COLORS[job.skill] || "#6366f1" }}
                                                >
                                                    {job.skill.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight">{job.title}</h3>
                                                        {job.urgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                                    </div>
                                                    <p className="text-slate-500 text-xs font-bold mt-0.5">{job.company}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-black">
                                                <span className="flex items-center gap-1 text-primary">
                                                    <span className="material-symbols-outlined text-sm">near_me</span>
                                                    {job.distance}km
                                                </span>
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                    <span className="material-symbols-outlined text-sm">payments</span>
                                                    {job.salary}
                                                </span>
                                                <span className="ml-auto text-amber-500">⭐{job.rating}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
