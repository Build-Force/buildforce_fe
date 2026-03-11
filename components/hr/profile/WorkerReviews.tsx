"use client";

import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
    id: string;
    workerType: string;
    projectName: string;
    date: string;
    rating: number;
    content: string;
}

interface WorkerReviewsProps {
    reviews: Review[];
    ratingBreakdown: {
        payment: number;
        communication: number;
        environment: number;
        transparency: number;
    };
    avgRating: number;
    totalReviews: number;
}

export default function WorkerReviews({ reviews, ratingBreakdown, avgRating, totalReviews }: WorkerReviewsProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // Compute star distribution dynamically from reviews data
    const computeStarDist = () => {
        const dist = [
            { stars: 5, count: 0 },
            { stars: 4, count: 0 },
            { stars: 3, count: 0 },
            { stars: 2, count: 0 },
            { stars: 1, count: 0 }
        ];

        reviews.forEach(review => {
            const index = 5 - Math.round(review.rating);
            if (index >= 0 && index < 5) {
                dist[index].count++;
            }
        });

        const total = reviews.length || 1; // Prevent division by zero
        return dist.map(item => ({
            stars: item.stars,
            pct: reviews.length > 0 ? Math.round((item.count / total) * 100) : 0
        }));
    };

    const starDist = computeStarDist();

    const breakdownStats = [
        { label: 'Thanh toán', score: ratingBreakdown.payment },
        { label: 'Giao tiếp', score: ratingBreakdown.communication },
        { label: 'Môi trường', score: ratingBreakdown.environment },
        { label: 'Minh bạch', score: ratingBreakdown.transparency }
    ];

    const getFilteredReviews = () => {
        switch (activeFilter) {
            case '5star': return reviews.filter(r => r.rating === 5);
            case '4star': return reviews.filter(r => r.rating === 4);
            case '3star_down': return reviews.filter(r => r.rating <= 3);
            case 'has_comment': return reviews.filter(r => r.content.length > 0);
            default: return reviews;
        }
    };

    const filteredReviews = getFilteredReviews();

    return (
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl inline-flex items-center font-bold text-gray-900 dark:text-gray-100">
                        Đánh giá từ lao động
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xl font-black text-amber-500">{avgRating}</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">
                            từ {totalReviews} lao động
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Column: Breakdown */}
                <div className="w-full lg:w-[35%] space-y-8">
                    {/* Breakdown bars */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">Tiêu chí đánh giá</h3>
                        <div className="space-y-4">
                            {breakdownStats.map((stat, idx) => (
                                <div key={idx} className="flex items-center text-sm gap-3">
                                    <span className="w-24 text-gray-600 dark:text-gray-400 font-medium">
                                        {stat.label}
                                    </span>
                                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(stat.score / 5) * 100}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                                        />
                                    </div>
                                    <span className="w-8 text-right font-bold text-gray-900 dark:text-white">
                                        {stat.score.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Star Distribution */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">Phân bổ đánh giá</h3>
                        <div className="space-y-3">
                            {starDist.map((item, idx) => (
                                <div key={idx} className="flex items-center text-sm gap-3">
                                    <span className="w-8 flex items-center justify-end font-medium text-gray-600 dark:text-gray-400">
                                        {item.stars} <Star className="w-3.5 h-3.5 ml-1 text-gray-400 fill-gray-400" />
                                    </span>
                                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${item.pct}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                                            className="h-full bg-amber-500 rounded-full"
                                        />
                                    </div>
                                    <span className="w-10 text-right text-gray-500 dark:text-gray-400 text-xs font-medium">
                                        {item.pct}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Reviews List */}
                <div className="w-full lg:w-[65%] space-y-6">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'all', label: 'Tất cả' },
                                { id: '5star', label: '5 Sao' },
                                { id: '4star', label: '4 Sao' },
                                { id: '3star_down', label: '3 Sao trở xuống' },
                                { id: 'has_comment', label: 'Có nhận xét' },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === filter.id
                                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 shadow-sm'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                        <select className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500/50">
                            <option>Mới nhất</option>
                            <option>Cũ nhất</option>
                        </select>
                    </div>

                    {/* Cards */}
                    <div className="space-y-4">
                        {filteredReviews.map(review => (
                            <div
                                key={review.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            👷 {review.workerType}
                                        </span>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium truncate max-w-[200px]">
                                            {review.projectName}
                                        </span>
                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {review.date}
                                        </span>
                                    </div>

                                    {/* Verified Badge */}
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-xs font-semibold">
                                        <CheckCircle2 className="w-3 h-3" /> Đã kiểm chứng
                                    </div>
                                </div>

                                <div className="flex gap-0.5 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 dark:text-gray-700'}`}
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm lg:text-base">
                                    "{review.content}"
                                </p>
                            </div>
                        ))}

                        {filteredReviews.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
                                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Chưa có đánh giá nào phù hợp.</p>
                            </div>
                        )}
                    </div>

                    {filteredReviews.length > 0 && (
                        <div className="mt-6 text-center">
                            <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                                Xem thêm đánh giá
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
