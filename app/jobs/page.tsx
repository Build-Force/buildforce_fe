"use client";

import React from "react";
import { JOBS, CONTRACTORS } from "@/data/mockData";
import { JobCard } from "@/components/jobs/JobCard";

export default function JobsPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
            <main className="max-w-[1600px] mx-auto px-8 pt-12 pb-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-[400px] shrink-0">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-32">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-black">Bộ lọc</h2>
                                <button className="text-primary font-bold text-lg hover:underline">Xóa tất cả</button>
                            </div>

                            <div className="filter-section">
                                <div className="flex justify-between items-center mb-6">
                                    <label className="text-xl font-black">Địa điểm</label>
                                    <button className="flex items-center gap-2 text-sm font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                                        <span className="material-symbols-outlined text-lg">map</span> Bản đồ
                                    </button>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl">location_on</span>
                                    <input
                                        className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-medium focus:ring-primary focus:border-primary"
                                        placeholder="Thành phố hoặc tỉnh thành"
                                        type="text"
                                    />
                                </div>
                            </div>

                            <div className="filter-section">
                                <label className="block text-xl font-black mb-6">Ngành nghề / Kỹ năng</label>
                                <div className="space-y-4">
                                    {["Thợ điện", "Thợ hàn", "Thợ mộc", "Thợ ống nước"].map((skill) => (
                                        <label key={skill} className="flex items-center gap-4 cursor-pointer group">
                                            <input
                                                className="w-7 h-7 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary"
                                                type="checkbox"
                                                defaultChecked={skill === "Thợ mộc"}
                                            />
                                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                                                {skill}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-section">
                                <div className="flex justify-between items-center mb-6">
                                    <label className="text-xl font-black">Mức lương</label>
                                    <span className="text-xl font-black text-primary">35 - 65tr/tháng</span>
                                </div>
                                <input className="mb-4" max="100" min="20" type="range" defaultValue="45" />
                                <div className="flex justify-between text-sm font-bold text-slate-400">
                                    <span>20tr</span>
                                    <span>100tr</span>
                                </div>
                            </div>

                            <div className="filter-section border-none pb-0">
                                <label className="block text-xl font-black mb-6">Đánh giá nhà thầu</label>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <input className="w-7 h-7 text-primary focus:ring-primary" name="rating" type="radio" />
                                        <span className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
                                            4.5+ Sao
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <input className="w-7 h-7 text-primary focus:ring-primary" name="rating" type="radio" />
                                        <span className="text-lg font-bold text-slate-700 dark:text-slate-300">Hiển thị tất cả đã xác minh</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Jobs List Section */}
                    <section className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-6">
                            <div>
                                <h1 className="text-4xl font-black mb-3">Đã tìm thấy 1,240 công việc</h1>
                                <p className="text-slate-500 font-bold text-lg">Kết quả được cá nhân hóa dựa trên hồ sơ của bạn</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                <label className="text-base font-black text-slate-400 uppercase tracking-widest shrink-0">Sắp xếp theo</label>
                                <select className="bg-transparent border-none focus:ring-0 text-lg font-black pr-10 cursor-pointer">
                                    <option>Phù hợp nhất</option>
                                    <option>Mới nhất</option>
                                    <option>Lương cao nhất</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {JOBS.map((job, idx) => (
                                <JobCard key={job.id} job={job} index={idx} variant="expanded" />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-24 flex justify-center items-center gap-4">
                            <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 font-black transition-all">
                                <span className="material-symbols-outlined text-3xl">chevron_left</span>
                            </button>
                            <div className="flex gap-4">
                                <button className="w-20 h-20 rounded-2xl bg-primary text-white font-black text-2xl shadow-lg shadow-sky-500/20">1</button>
                                <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-black text-2xl hover:bg-slate-50">2</button>
                                <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-black text-2xl hover:bg-slate-50">3</button>
                                <span className="w-20 h-20 flex items-center justify-center text-2xl font-black">...</span>
                                <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-black text-2xl hover:bg-slate-50">12</button>
                            </div>
                            <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 font-black transition-all">
                                <span className="material-symbols-outlined text-3xl">chevron_right</span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Trust Section */}
            <section className="py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-display font-bold text-slate-900 dark:text-white mb-8">Làm việc với các nhà thầu đẳng cấp</h2>
                        <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed">
                            Lịch sử của mọi nhà thầu đều được hiển thị minh bạch. Chúng tôi đặt ra những tiêu chuẩn cao nhất cho các đối tác của mình.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {CONTRACTORS.map((contractor) => (
                            <div key={contractor.id} className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50">
                                <div className="flex items-center gap-8 mb-12">
                                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-6xl">{contractor.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-black text-slate-900 dark:text-white">{contractor.name}</h4>
                                        <p className="text-xl text-slate-500 font-bold">Thành viên đã xác minh từ {contractor.verifiedSince}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 mb-10">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl text-center">
                                        <p className="text-5xl font-black text-slate-900 dark:text-white mb-2">{contractor.projectsCount}</p>
                                        <p className="text-base font-black text-slate-400 uppercase tracking-widest">Dự án hoàn thành</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl text-center">
                                        <p className="text-5xl font-black text-secondary mb-2">{contractor.rating}</p>
                                        <p className="text-base font-black text-slate-400 uppercase tracking-widest">Đánh giá của thợ</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-between">
                                    <span className="text-xl font-bold text-slate-700 dark:text-slate-200">Độ tin cậy thanh toán</span>
                                    <span className="text-2xl font-black text-secondary">{contractor.reliability}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
