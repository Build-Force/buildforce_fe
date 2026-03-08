"use client";

import React from "react";
import { motion } from "framer-motion";

import Link from "next/link";

interface JobCardProps {
    job: {
        id: string | number;
        title: string;
        company: string;
        location: string;
        compensation: string;
        postedAt: string;
        image?: string;
        /** Nhiều ảnh: hiển thị carousel; 1 ảnh: hiển thị 1 ảnh */
        images?: string[];
        applicants?: number;
        verified?: boolean;
        onTimePayment?: boolean;
        /** Auto Match score 0–100 (Buildforce rule-based match) */
        matchScore?: number;
        urgent?: boolean;
        skills?: string[];
        workersNeeded?: number;
    };
    index?: number;
    variant?: "compact" | "expanded";
}

export const JobCard: React.FC<JobCardProps> = ({ job, index = 0, variant = "expanded" }) => {
    const isExpanded = variant === "expanded";
    const imageList = Array.isArray(job.images) && job.images.length > 0 ? job.images : job.image ? [job.image] : [];
    const [imgIndex, setImgIndex] = React.useState(0);
    const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);
    const hasMultiple = imageList.length > 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`bg-white dark:bg-slate-900 ${isExpanded ? "p-8 rounded-[2rem]" : "p-6 rounded-[1.5rem]"} flex flex-col lg:flex-row gap-8 border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all shadow-xl shadow-slate-200/50 dark:shadow-none group relative`}
        >
            <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`Xem chi tiết ${job.title}`} />

            {/* Ảnh: click mở lightbox */}
            <div className={`w-full lg:w-48 h-48 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative shadow-inner z-10 flex items-center justify-center`}>
                {imageList.length > 0 ? (
                    <>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxUrl(imageList[imgIndex]); }}
                            className="absolute inset-0 w-full h-full block cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset z-10"
                            aria-label="Xem ảnh phóng to"
                        >
                            <img
                                alt={job.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500 pointer-events-none"
                                src={imageList[imgIndex]}
                            />
                        </button>
                        {hasMultiple && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((i) => (i === 0 ? imageList.length - 1 : i - 1)); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 z-20"
                                    aria-label="Ảnh trước"
                                >
                                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex((i) => (i === imageList.length - 1 ? 0 : i + 1)); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 z-20"
                                    aria-label="Ảnh sau"
                                >
                                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20" onClick={(e) => e.stopPropagation()}>
                                    {imageList.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIndex(i); }}
                                            className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? "bg-white scale-125" : "bg-white/50"}`}
                                            aria-label={`Ảnh ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">work</span>
                )}
            </div>
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxUrl(null); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
                    aria-label="Đóng xem ảnh"
                >
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxUrl(null); }}
                        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                        aria-label="Đóng"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                    <img
                        src={lightboxUrl}
                        alt=""
                        className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div className="flex-1 z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            {typeof job.matchScore === "number" && (
                                <span className={`px-4 py-1.5 rounded-full border text-sm font-black flex items-center gap-1 ${
                                    job.matchScore >= 85 ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" :
                                    job.matchScore >= 65 ? "bg-primary/10 text-primary border-primary/20" :
                                    "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                }`}>
                                    <span className="material-symbols-outlined text-base">psychology</span>
                                    {job.matchScore}% phù hợp
                                </span>
                            )}
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

                {/* Chỉ hiển thị thông tin thật: địa điểm, ngày đăng, số lượng tuyển, kỹ năng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-2xl">calendar_today</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đăng</p>
                            <p className="text-lg font-bold">{job.postedAt}</p>
                        </div>
                    </div>
                    {typeof job.workersNeeded === "number" && job.workersNeeded > 0 && (
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-2xl">groups</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số lượng</p>
                                <p className="text-lg font-bold">Cần {job.workersNeeded} người</p>
                            </div>
                        </div>
                    )}
                </div>

                {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills.slice(0, 5).map((s, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold">
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-end gap-4">
                    <Link href={`/jobs/${job.id}`} className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-sky-600 transition-all shadow-xl shadow-sky-500/20 active:scale-95 text-center relative z-20">
                        Chi tiết & Ứng tuyển
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
