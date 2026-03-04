"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface SimilarJobCardProps {
    job: {
        id: number;
        title: string;
        company: string;
        location: string;
        compensation: string;
        image: string;
        urgent?: boolean;
        postedAt?: string;
    };
    index?: number;
}

export const SimilarJobCard: React.FC<SimilarJobCardProps> = ({ job, index = 0 }) => {
    // Determine if it's "New" based on some logic or just use a placeholder for now
    // In the provided HTML, one had "New" and another had "Urgent"
    const isNew = job.postedAt?.includes("new") || job.postedAt?.includes("1 day") || job.postedAt?.includes("2 days");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative"
        >
            <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-0" aria-label={`View details for ${job.title}`} />

            <div className="relative h-48 overflow-hidden z-10">
                <img
                    alt={job.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={job.image}
                />
                <div className="absolute top-4 left-4">
                    {job.urgent ? (
                        <span className="bg-red-500/90 backdrop-blur-md text-white text-sm font-black px-4 py-2 rounded-full">Khẩn cấp</span>
                    ) : isNew ? (
                        <span className="bg-primary/90 backdrop-blur-md text-white text-sm font-black px-4 py-2 rounded-full">Mới</span>
                    ) : null}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1 z-10">
                <h4 className="text-xl font-black mb-1 text-slate-900 dark:text-white">{job.title}</h4>
                <p className="text-primary font-bold mb-3 text-sm">{job.company}</p>

                <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary font-black">
                        <span className="material-symbols-outlined text-lg">payments</span>
                        <span>{job.compensation}</span>
                    </div>
                </div>

                <Link
                    href={`/jobs/${job.id}`}
                    className="mt-auto w-full py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-black text-base transition-all text-center"
                >
                    Xem chi tiết
                </Link>
            </div>
        </motion.div>
    );
};
