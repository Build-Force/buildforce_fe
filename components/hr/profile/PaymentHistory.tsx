"use client";

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface PaymentHistoryProps {
    paymentHistory: string[];
    onTimePaymentRate: number;
}

export default function PaymentHistory({ paymentHistory, onTimePaymentRate }: PaymentHistoryProps) {

    const getPillColor = (rate: number) => {
        if (rate >= 90) return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
        if (rate >= 70) return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    };

    const getBlockColor = (status: string) => {
        switch (status) {
            case 'on_time': return 'bg-emerald-500 dark:bg-emerald-400';
            case 'late_minor': return 'bg-amber-500 dark:bg-amber-400';
            case 'late_major': return 'bg-red-500 dark:bg-red-400';
            default: return 'bg-gray-200 dark:bg-gray-700 cursor-help';
        }
    };

    // Ensure we always have an array. Note: backend should send ordered last 12 months.
    const safeHistory = Array.isArray(paymentHistory) ? paymentHistory : [];
    // If the backend doesn't pad to 12, pad it with 'no_data' at the beginning
    const paddedHistory = safeHistory.length >= 12
        ? safeHistory.slice(-12)
        : [...Array(12 - safeHistory.length).fill('no_data'), ...safeHistory];

    // Calculate the last 12 months dynamically based on the current date
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const months = Array.from({ length: 12 }, (_, i) => {
        let m = currentMonth - 11 + i;
        if (m <= 0) m += 12;
        return `T${m}`;
    });

    return (
        <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Lịch sử thanh toán 12 tháng gần nhất
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Dữ liệu từ xác nhận của lao động trên hệ thống
                    </p>
                </div>
                <div className={`px-3 py-1.5 rounded-full border text-sm font-bold shadow-sm whitespace-nowrap ${getPillColor(onTimePaymentRate)}`}>
                    {onTimePaymentRate}% đúng hạn
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-full flex justify-between gap-1 overflow-x-auto pb-4 hide-scrollbar">
                    {paddedHistory.map((status, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 min-w-[28px]">
                            <div
                                className={`w-full h-8 rounded shrink-0 transition-all hover:opacity-80 ${getBlockColor(status)} relative group`}
                            >
                                {/* Tooltip on hover */}
                                {status === 'no_data' && (
                                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                        Chưa có dữ liệu
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {months[index]}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-400" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Đúng hạn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-amber-500 dark:bg-amber-400" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Trễ 1–3 ngày</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-red-500 dark:bg-red-400" />
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Trễ &gt;3 ngày</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <HelpCircle className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Không có dữ liệu</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
