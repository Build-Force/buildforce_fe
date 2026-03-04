"use client";

import React from "react";
import { motion } from "framer-motion";

import Link from "next/link";

interface JobCardProps {
    job: {
        id: number;
        title: string;
        company: string;
        location: string;
        compensation: string;
        urgent: boolean;
        postedAt: string;
        image: string;
        applicants: number;
        verified: boolean;
        onTimePayment: boolean;
    };
    index?: number;
    variant?: "compact" | "expanded";
}

export const JobCard: React.FC<JobCardProps> = ({ job, index = 0, variant = "expanded" }) => {
    const isExpanded = variant === "expanded";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`bg-white dark:bg-slate-900 ${isExpanded ? "p-8 rounded-[2rem]" : "p-6 rounded-[1.5rem]"} flex flex-col lg:flex-row gap-8 border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all shadow-xl shadow-slate-200/50 dark:shadow-none group relative`}
        >
            <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${job.title}`} />

            {/* Image Section */}
            <div className={`w-full lg:w-48 h-48 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative shadow-inner z-10`}>
                <img
                    alt={job.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    src={job.image}
                />
            </div>

            {/* Content Section */}
            <div className="flex-1 z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            {job.verified && (
                                <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/30 text-secondary text-sm font-black rounded-full border border-green-100 dark:border-green-800 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">verified</span> Nhà thầu đã xác minh
                                </span>
                            )}
                            {job.urgent && (
                                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-primary text-sm font-black rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">bolt</span> Khẩn cấp
                                </span>
                            )}
                        </div>
                        <h3 className={`${isExpanded ? "text-3xl" : "text-2xl"} font-black text-slate-900 dark:text-white mb-2`}>{job.title}</h3>
                        <p className={`${isExpanded ? "text-xl" : "text-lg"} text-slate-500 font-bold`}>{job.company}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center min-w-[150px]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mức lương</p>
                        <p className={`${isExpanded ? "text-3xl" : "text-2xl"} font-black text-secondary`}>{job.compensation}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-2xl">location_on</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa điểm</p>
                            <p className="text-lg font-bold">{job.location}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-2xl">history</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lịch sử thanh toán</p>
                            <p className="text-lg font-bold text-primary">{job.onTimePayment ? "100% Đúng hạn" : "98% Đúng hạn"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-yellow-500">
                            <span className="material-symbols-outlined text-2xl">star</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đánh giá của thợ</p>
                            <p className="text-lg font-bold">4.9/5.0</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${job.id + i}`} alt="applicant" className="w-full h-full object-cover" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                                +{job.applicants}
                            </div>
                        </div>
                        <span className="text-slate-500 font-bold text-sm">Người đã ứng tuyển</span>
                    </div>

                    <Link href={`/jobs/${job.id}`} className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20 active:scale-95 text-center relative z-20">
                        Chi tiết & Ứng tuyển
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
