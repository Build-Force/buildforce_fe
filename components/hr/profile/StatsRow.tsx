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
    description?: string;
    portfolios?: any[];
}

export default function StatsRow({ stats, industry, joinedDate, description, portfolios = [] }: StatsProps) {
    const joinedYear = joinedDate ? new Date(joinedDate).getFullYear() : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const expYears = (currentYear - joinedYear) > 0 ? (currentYear - joinedYear) : 1;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-500">
            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">corporate_fare</span>
                Thông tin doanh nghiệp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Kinh nghiệm */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Kinh nghiệm</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        Công ty đã có <span className="font-bold text-primary">{expYears} năm kinh nghiệm</span> trong ngành. <br />
                        {description && description !== "Chưa cập nhật mô tả." && (
                            <span className="mt-2 block">{description}</span>
                        )}
                    </p>
                </div>

                {/* Lĩnh vực hoạt động */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Lĩnh vực hoạt động</h4>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-bold text-sm">
                        <span className="material-symbols-outlined text-lg">category</span>
                        {industry || "Xây dựng"}
                    </div>
                </div>
            </div>

            {/* Các công trình đã thi công (Portfolios) */}
            <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Các công trình đã thi công</span>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 font-bold">{portfolios.length} công trình</span>
                </h4>
                
                {portfolios.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {portfolios.map((item: any, idx: number) => (
                            <div key={idx} className="group overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-video overflow-hidden relative">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">{item.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">construction</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Chưa có công trình tiêu biểu nào được cập nhật.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
