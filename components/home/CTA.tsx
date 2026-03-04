"use client";

import React from "react";
import { motion } from "framer-motion";

export const CTA = () => {
    return (
        <section className="py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 dark:bg-blue-950 rounded-[4rem] overflow-hidden relative shadow-2xl"
                >
                    <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <img
                            alt="Cranes background"
                            className="w-full h-full object-cover grayscale"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZBtrV-3GI1mAi_hr4wHlxfX7J9FNdipTca-Gg2JgWPl1thY2feGQmNIJz-NqlYpIBJLomFqXaNKnwVv6EoSy2acf7HX0rNRhfRx17H1Nqnr_1pzmy3iYAQiPSXIE5qS_hvoDCRwAGyA68SLj27c1MoNXPKMDtQgKFUhfR8tQYZkcMd5zX82tBeqamI7sh9sW2QFi98_qKrYeuosch_Wu0L935sYK7hFB0ziMgqpW0hBBXP07PjI_qqEtqds5mtxS6C5mQdvYdIvM"
                        />
                    </div>
                    <div className="relative z-10 px-10 py-24 md:p-24 flex flex-col items-center text-center">
                        <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 leading-tight max-w-4xl">
                            Xây dựng đội ngũ hoặc tìm dự án tiếp theo một cách tự tin
                        </h2>
                        <p className="text-slate-300 text-xl md:text-2xl mb-12 max-w-2xl font-medium">
                            Đánh giá minh bạch. Thanh toán đảm bảo. Dự án thực tế.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                            <button className="flex-1 bg-primary text-white px-12 py-6 rounded-2xl font-black text-2xl hover:bg-sky-600 transition-all shadow-2xl shadow-sky-500/20 active:scale-95">
                                Tìm việc
                            </button>
                            <button className="flex-1 bg-white/10 text-white border-2 border-white/20 backdrop-blur-md px-12 py-6 rounded-2xl font-black text-2xl hover:bg-white/20 transition-all active:scale-95">
                                Tuyển dụng
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
