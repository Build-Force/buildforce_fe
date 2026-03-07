"use client";

import React from "react";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-32 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary p-2 rounded-lg">
                                <span className="material-symbols-outlined text-white text-2xl">construction</span>
                            </div>
                            <span className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">
                                Build<span className="text-primary">Force</span>
                            </span>
                        </div>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                            Nền tảng kết nối nhân tài trong ngành xây dựng đáng tin cậy nhất. Kết nối thợ lành nghề với các dự án xây dựng hàng đầu trên toàn quốc.
                        </p>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest mb-2">Lời cam kết của chúng tôi</p>
                            <p className="text-slate-600 dark:text-slate-400 text-base font-bold">Xác minh nhà thầu. Bảo vệ công nhân.</p>
                        </div>
                    </div>

                    <div>
                        <h5 className="font-black mb-8 uppercase text-sm tracking-[0.2em] text-slate-400">Nền tảng</h5>
                        <ul className="space-y-6 text-lg text-slate-700 dark:text-slate-300 font-semibold">
                            <li><Link href="/jobs" className="hover:text-primary transition-colors flex items-center gap-2">Duyệt việc làm</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Tìm thợ lành nghề</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Dịch vụ xác minh</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Học nghề</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black mb-8 uppercase text-sm tracking-[0.2em] text-slate-400">Công ty</h5>
                        <ul className="space-y-6 text-lg text-slate-700 dark:text-slate-300 font-semibold">
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Về chúng tôi</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Tiêu chuẩn an toàn</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Câu chuyện thành công</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2">Liên hệ hỗ trợ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black mb-8 uppercase text-sm tracking-[0.2em] text-slate-400">Pháp lý & Bảo mật</h5>
                        <ul className="space-y-6 text-lg text-slate-700 dark:text-slate-300 font-black">
                            <li><Link href="/terms" className="hover:text-primary transition-colors flex items-center gap-2 underline">Điều khoản dịch vụ</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors flex items-center gap-2 underline">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 underline">Bảo vệ người lao động</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 underline">Đảm bảo thanh toán</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-slate-500 text-sm font-bold">© 2024 BuildForce Inc. Mọi quyền được bảo lưu.</p>
                    <div className="flex gap-10 text-sm text-slate-500 font-bold">
                        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">public</span> Tiếng Việt (VN)</span>
                        <button className="flex items-center gap-2 cursor-pointer hover:text-primary" onClick={() => document.documentElement.classList.toggle('dark')}>
                            <span className="material-symbols-outlined text-lg">settings_brightness</span> Thay đổi giao diện
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};
