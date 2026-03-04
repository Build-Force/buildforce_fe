"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SurveyWizard } from "./SurveyWizard";

export const Hero = () => {
    const [isSurveyOpen, setIsSurveyOpen] = React.useState(false);

    return (
        <section className="relative min-h-[850px] flex items-center justify-center overflow-hidden pt-12 pb-24">
            <img
                alt="Construction site"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFOBonC_3DOEweS8OWcwxfoQS3N94yDzSgQC8Ewh9aExV8Uydq3dCIttqyU743VtIISxuDcyqaBycqeFjK-JWTKekK330NAxvy_8axGBtk6aK3nKMuxkdf2GUyZSp_QHLgVy00L-RQee5uD3qF2suVvH53IcuJFbDOeOc3lUFnbZKS4wlklKh4aYmEukC1WQNFY0JwpCMZ5eub2fo6BuZLQOIWH0NLNtPtKO3CKG-8oypqSI1WHV45YACD8zfQx8yYi33WRfe5H2Q"
            />
            <div className="absolute inset-0 hero-gradient"></div>

            <div className="relative z-10 max-w-5xl px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-display text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
                >
                    Kết nối những đôi tay lành nghề với <br />
                    <span className="text-primary">Các dự án đáng tin cậy.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-200 mb-6 max-w-3xl mx-auto font-medium"
                >
                    Trả lời khảo sát ngắn 2 phút để xem các dự án phù hợp nhất với bạn.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col gap-5 max-w-md mx-auto mb-8"
                >
                    <button
                        onClick={() => setIsSurveyOpen(true)}
                        className="bg-primary hover:bg-sky-600 text-white px-10 py-6 rounded-2xl font-bold text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                    >
                        Bắt đầu khảo sát 2 phút
                    </button>
                    <button className="bg-white text-slate-900 px-10 py-6 rounded-2xl font-bold text-xl shadow-xl hover:bg-slate-100 transition-all active:scale-95">
                        Tìm việc
                    </button>
                    <button className="border-2 border-white/40 backdrop-blur-md text-white px-10 py-6 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all active:scale-95">
                        Đăng việc
                    </button>
                </motion.div>

                <AnimatePresence>
                    {isSurveyOpen && (
                        <SurveyWizard
                            isOpen={isSurveyOpen}
                            onClose={() => setIsSurveyOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <p className="text-slate-300 text-lg font-medium mb-12">
                    Không thu phí người lao động. Chỉ nhà thầu đã xác minh.
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="max-w-4xl mx-auto glass p-3 rounded-3xl shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 flex items-center px-6 py-4 gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">search</span>
                            <div className="w-full text-left">
                                <input
                                    className="w-full bg-transparent border-none focus:ring-0 text-xl text-slate-800 dark:text-white placeholder-slate-500 font-medium py-2"
                                    placeholder="Chức danh công việc hoặc ngành nghề (ví dụ: Thợ điện)"
                                    type="text"
                                />
                            </div>
                        </div>
                        <div className="flex-1 flex items-center px-6 py-4 gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <span className="material-symbols-outlined text-slate-400 text-3xl">location_on</span>
                            <div className="w-full text-left">
                                <input
                                    className="w-full bg-transparent border-none focus:ring-0 text-xl text-slate-800 dark:text-white placeholder-slate-500 font-medium py-2"
                                    placeholder="Thành phố hoặc tỉnh thành"
                                    type="text"
                                />
                            </div>
                        </div>
                        <button className="bg-slate-900 dark:bg-primary hover:opacity-90 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all whitespace-nowrap">
                            Tìm việc làm
                        </button>
                    </div>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 text-base font-medium">
                        Kết quả được cá nhân hóa dựa trên khảo sát và sở thích của bạn.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
