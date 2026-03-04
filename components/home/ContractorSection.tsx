"use client";

import React from "react";
import { CONTRACTORS } from "@/data/mockData";
import { motion } from "framer-motion";

export const ContractorSection = () => {
    return (
        <section className="py-32 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6"
                    >
                        Làm việc với các nhà thầu đẳng cấp
                    </motion.h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                        Lịch sử của mọi nhà thầu đều được hiển thị minh bạch. Chúng tôi đặt ra những tiêu chuẩn cao nhất cho các đối tác của mình.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {CONTRACTORS.map((contractor, idx) => (
                        <motion.div
                            key={contractor.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-50 dark:bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-5xl">{contractor.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white">{contractor.name}</h4>
                                    <p className="text-slate-500 font-bold">Thành viên đã xác minh từ {contractor.verifiedSince}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl text-center shadow-sm">
                                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">{contractor.projectsCount}</p>
                                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Dự án hoàn thành</p>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl text-center shadow-sm">
                                    <p className="text-4xl font-black text-secondary mb-1">{contractor.rating}</p>
                                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Đánh giá của thợ</p>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-between border border-green-100 dark:border-green-800/50">
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">Độ tin cậy thanh toán</span>
                                <span className="text-xl font-black text-secondary">{contractor.reliability}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
