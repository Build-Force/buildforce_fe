"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StatsProps {
    stats: {
        totalProjects: number;
        completedProjects: number;
        cancelledProjects: number;
        ongoingProjects: number;
        totalWorkers: number;
        completionRate: number;
        avgRating: number;
        totalReviews: number;
        onTimePaymentRate: number;
    };
    industry?: string;
    joinedDate?: string;
    experienceYears?: string;
    description?: string;
    portfolios?: any[];
    platformProjects?: any[];
}

export default function StatsRow({ stats, industry, joinedDate, experienceYears, description, portfolios = [], platformProjects = [] }: StatsProps) {
    const joinedYear = joinedDate ? new Date(joinedDate).getFullYear() : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedExpYears = (currentYear - joinedYear) > 0 ? (currentYear - joinedYear) : 1;
    const displayExp = experienceYears ? (typeof experienceYears === 'number' || !isNaN(Number(experienceYears)) ? `${experienceYears} năm` : experienceYears) : `${calculatedExpYears} năm`;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700/50 animate-in fade-in duration-500 space-y-12">
            <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">corporate_fare</span>
                    </div>
                    Thông tin doanh nghiệp
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-2">
                    {/* Kinh nghiệm */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Kinh nghiệm</h4>
                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
                            Công ty đã có <span className="text-primary">{displayExp} kinh nghiệm</span> trong ngành.
                        </p>
                        {description && description !== "Chưa cập nhật mô tả." && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                "{description}"
                            </p>
                        )}
                    </div>

                    {/* Lĩnh vực hoạt động */}
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Lĩnh vực hoạt động</h4>
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-100 dark:border-blue-800/30">
                            <span className="material-symbols-outlined text-xl">category</span>
                            {industry || "Xây dựng"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Các công trình đã thi công (Platform Projects) */}
            <div className="pt-8 border-t border-gray-50 dark:border-gray-700/30">
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Các công trình đã thi công trên website
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-400 font-black uppercase tracking-widest">{platformProjects.length} Công trình</span>
                </h4>
                
                {platformProjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {platformProjects.map((item: any, idx: number) => {
                            const title = item.name || item.title || "Công trình";
                            const img = item.images?.[0] || item.image || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=1000&auto=format&fit=crop";
                            const desc = item.description || `${item.district || ''} ${item.city || ''}`.trim() || "Dự án đã hoàn thành thành công.";
                            
                            return (
                                <div key={idx} className="group overflow-hidden rounded-[2.5rem] bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="aspect-video overflow-hidden relative">
                                        <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">
                                                    <span className="material-symbols-outlined text-xs">verified</span>
                                                    Đã xác thực
                                                </div>
                                                <p className="text-[11px] text-white/80 font-medium leading-relaxed line-clamp-2">
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-black text-gray-900 dark:text-white text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">{title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span className="material-symbols-outlined text-xs">calendar_month</span>
                                            {item.endDate || "Gần đây"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700/50">
                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-700 mb-3">history_edu</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Chưa có công trình trên hệ thống</p>
                    </div>
                )}
            </div>

            {/* Công trình tiêu biểu khác (Manual Portfolios) */}
            {portfolios.length > 0 && (
                <div className="pt-8 border-t border-gray-50 dark:border-gray-700/30">
                    <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Các hình ảnh công trình tiêu biểu khác
                        </span>
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-500 font-black">{portfolios.length}</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {portfolios.map((item: any, idx: number) => (
                            <div key={idx} className="group overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-500">
                                <div className="aspect-square overflow-hidden relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-2xl scale-75 group-hover:scale-100 transition-transform">zoom_in</span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h5 className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-wider line-clamp-1 mb-1">{item.title}</h5>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 font-medium italic">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
