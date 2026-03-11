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
}

export default function StatsRow({ stats }: StatsProps) {
    const getCompletionRateColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600 dark:text-green-400';
        if (rate >= 70) return 'text-amber-500 dark:text-amber-400';
        return 'text-red-500 dark:text-red-400';
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Projects */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center"
            >
                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-500">
                    {stats.completedProjects}
                </span>
                <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mt-2 tracking-wider">
                    Công trình
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    đã hoàn thành
                </span>
            </motion.div>

            {/* Total Workers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center"
            >
                <span className="text-4xl font-extrabold text-green-600 dark:text-green-500">
                    {stats.totalWorkers}
                </span>
                <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mt-2 tracking-wider">
                    Lao động
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    đã tuyển
                </span>
            </motion.div>

            {/* Completion Rate */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center"
            >
                <span className={`text-4xl font-extrabold ${getCompletionRateColor(stats.completionRate)}`}>
                    {stats.completionRate}%
                </span>
                <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mt-2 tracking-wider">
                    Hoàn thành
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    tỷ lệ thành công
                </span>
            </motion.div>

            {/* Avg Rating */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center"
            >
                <div className="flex items-center gap-1">
                    <span className="text-4xl font-extrabold text-amber-500 dark:text-amber-500">
                        {stats.avgRating}
                    </span>
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <span className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mt-2 tracking-wider">
                    Đánh giá
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    từ {stats.totalReviews} lao động
                </span>
            </motion.div>
        </div>
    );
}
