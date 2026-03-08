"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/utils/api";

interface ServicePackage {
    _id: string;
    name: string;
    slug: string;
    description: string;
    features: string[];
    price: number;
    jobPostLimit: number;
    durationDays: number;
}

interface ActivePackage {
    packageName: string;
    jobPostLimit: number;
    jobPostUsed: number;
    expiresAt: string;
    isActive: boolean;
}

const ICON_MAP: Record<string, string> = {
    free: "volunteer_activism",
    "hr-pro": "workspace_premium",
    "hr-enterprise": "diamond",
};

const GRADIENT_MAP: Record<string, string> = {
    free: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
    "hr-pro": "from-sky-50 to-blue-100 dark:from-sky-950 dark:to-blue-950",
    "hr-enterprise": "from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950",
};

const BORDER_MAP: Record<string, string> = {
    free: "border-slate-200 dark:border-slate-700",
    "hr-pro": "border-primary/40 dark:border-primary/30 ring-2 ring-primary/20",
    "hr-enterprise": "border-amber-300 dark:border-amber-700",
};

const BADGE_MAP: Record<string, { label: string; color: string } | null> = {
    free: null,
    "hr-pro": { label: "Phổ biến nhất", color: "bg-primary text-white" },
    "hr-enterprise": { label: "Doanh nghiệp", color: "bg-amber-500 text-white" },
};

function formatVND(amount: number): string {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [activePackage, setActivePackage] = useState<ActivePackage | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [pkgRes, myPkgRes] = await Promise.all([
                api.get("/api/payments/packages"),
                api.get("/api/payments/my-package").catch(() => ({ data: { data: null } })),
            ]);
            setPackages(pkgRes.data.data || []);
            setActivePackage(myPkgRes.data.data || null);
        } catch {
            setPackages([
                {
                    _id: "1", name: "Miễn phí", slug: "free",
                    description: "Dành cho HR mới bắt đầu, đăng tối đa 1 tin tuyển dụng",
                    features: ["Đăng 1 tin tuyển dụng", "Xem hồ sơ ứng viên cơ bản", "Chat nội bộ"],
                    price: 0, jobPostLimit: 1, durationDays: 365,
                },
                {
                    _id: "2", name: "HR Pro", slug: "hr-pro",
                    description: "Mở rộng đăng tin, AI matching, ưu tiên hiển thị",
                    features: ["Đăng tối đa 10 tin tuyển dụng", "AI Matching gợi ý ứng viên", "Ưu tiên hiển thị trên bản đồ", "Xem hồ sơ chi tiết ứng viên", "Hỗ trợ qua chat ưu tiên"],
                    price: 299000, jobPostLimit: 10, durationDays: 30,
                },
                {
                    _id: "3", name: "HR Enterprise", slug: "hr-enterprise",
                    description: "Không giới hạn tin đăng, nhiều tài khoản HR, ưu tiên cao nhất",
                    features: ["Đăng không giới hạn tin tuyển dụng", "AI Matching nâng cao", "Ưu tiên hiển thị cao nhất", "Nhiều tài khoản HR (tối đa 5)", "Báo cáo phân tích tuyển dụng", "Hỗ trợ 24/7 qua hotline"],
                    price: 799000, jobPostLimit: -1, durationDays: 30,
                },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-4 pb-24 transition-all duration-500">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-4">
                    <a href="/hr-dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary mb-4 transition-colors">
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Quay lại Dashboard
                    </a>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gói dịch vụ</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-lg">Chọn gói phù hợp để mở rộng khả năng tuyển dụng</p>
                </motion.div>

                {/* Active Package Banner */}
                {activePackage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-10 bg-gradient-to-r from-primary/10 to-sky-600/10 border border-primary/20 rounded-3xl p-6 flex items-center gap-5"
                    >
                        <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-slate-900 dark:text-white text-lg">
                                Gói hiện tại: <span className="text-primary">{activePackage.packageName}</span>
                            </p>
                            <p className="text-sm text-slate-500 font-bold">
                                Đã dùng {activePackage.jobPostUsed}/{activePackage.jobPostLimit === -1 ? "∞" : activePackage.jobPostLimit} tin đăng
                                {" "}&#8226;{" "}Hết hạn: {formatDate(activePackage.expiresAt)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="h-2.5 w-32 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{
                                        width: activePackage.jobPostLimit === -1
                                            ? "10%"
                                            : `${Math.min(100, (activePackage.jobPostUsed / activePackage.jobPostLimit) * 100)}%`
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Packages Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {packages.map((pkg, idx) => {
                            const badge = BADGE_MAP[pkg.slug];
                            const isCurrentPkg = activePackage?.packageName === pkg.name;
                            return (
                                <motion.div
                                    key={pkg._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative bg-gradient-to-b ${GRADIENT_MAP[pkg.slug] || GRADIENT_MAP.free} border-2 ${BORDER_MAP[pkg.slug] || BORDER_MAP.free} rounded-[2.5rem] p-8 flex flex-col transition-all hover:shadow-xl ${pkg.slug === "hr-pro" ? "md:-translate-y-4 md:scale-[1.03]" : ""}`}
                                >
                                    {badge && (
                                        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black ${badge.color} shadow-lg`}>
                                            {badge.label}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-6 mt-2">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pkg.slug === "hr-pro" ? "bg-primary/20" : pkg.slug === "hr-enterprise" ? "bg-amber-500/20" : "bg-slate-200 dark:bg-slate-700"}`}>
                                            <span className={`material-symbols-outlined text-3xl ${pkg.slug === "hr-pro" ? "text-primary" : pkg.slug === "hr-enterprise" ? "text-amber-500" : "text-slate-500"}`}>
                                                {ICON_MAP[pkg.slug] || "package_2"}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{pkg.name}</h3>
                                            <p className="text-xs text-slate-400 font-bold">{pkg.durationDays} ngày</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6">{pkg.description}</p>

                                    <div className="mb-8">
                                        <span className={`text-4xl font-black ${pkg.slug === "hr-pro" ? "text-primary" : pkg.slug === "hr-enterprise" ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
                                            {formatVND(pkg.price)}
                                        </span>
                                        {pkg.price > 0 && <span className="text-sm text-slate-400 font-bold ml-1">/tháng</span>}
                                    </div>

                                    <div className="space-y-3 mb-8 flex-1">
                                        {pkg.features.map((feat) => (
                                            <div key={feat} className="flex items-start gap-3">
                                                <span className={`material-symbols-outlined text-lg mt-0.5 ${pkg.slug === "hr-pro" ? "text-primary" : pkg.slug === "hr-enterprise" ? "text-amber-500" : "text-emerald-500"}`}>
                                                    check_circle
                                                </span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {isCurrentPkg ? (
                                        <div className="w-full py-4 rounded-2xl border-2 border-primary/30 text-primary font-black text-center text-sm">
                                            <span className="material-symbols-outlined text-lg align-middle mr-1">check</span>
                                            Gói hiện tại
                                        </div>
                                    ) : pkg.price === 0 ? (
                                        <div className="w-full py-4 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-400 font-black text-center text-sm cursor-default">
                                            Mặc định
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/hr-dashboard/checkout?packageId=${pkg._id}`}
                                            className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-center inline-flex items-center justify-center ${pkg.slug === "hr-pro"
                                                    ? "bg-primary text-white shadow-primary/30 hover:bg-sky-600"
                                                    : "bg-amber-500 text-white shadow-amber-500/30 hover:bg-amber-600"
                                                }`}
                                        >
                                            Mua gói ngay
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 text-center">Câu hỏi thường gặp</h2>
                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                        {[
                            { q: "Thanh toán bằng hình thức nào?", a: "Chuyển khoản ngân hàng qua mã QR (SePay). Quét mã → chuyển tiền → nhập mã giao dịch → kích hoạt ngay." },
                            { q: "Gói có tự động gia hạn không?", a: "Không, bạn chủ động mua lại khi gói hết hạn. Không lo bị trừ tiền tự động." },
                            { q: "Nếu mua gói mới khi gói cũ còn hạn?", a: "Gói mới sẽ thay thế gói cũ ngay lập tức. Số tin đăng được reset theo gói mới." },
                            { q: "Tôi có thể hoàn tiền không?", a: "Liên hệ admin trong vòng 24h sau mua nếu chưa sử dụng tính năng nào của gói mới." },
                        ].map(({ q, a }) => (
                            <div key={q}>
                                <h4 className="font-black text-slate-900 dark:text-white text-sm mb-2">{q}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

        </div>
    );
}
