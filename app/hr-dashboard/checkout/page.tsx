"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

interface PaymentSession {
    sessionId: string;
    qrCodeUrl: string;
    amount: number;
    description: string;
    packageId: string;
    packageName: string;
    expiresAt?: string;
}

const TOTAL_TTL_MS = 5 * 60 * 1000;

function formatVND(amount: number): string {
    if (!amount) return "0đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const packageId = searchParams.get("packageId") || "";

    const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
    const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);
    const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [remainingMs, setRemainingMs] = useState<number | null>(null);

    const STORAGE_KEY = "bf_hr_payment_session";

    const initCheckout = useCallback(async () => {
        if (!packageId) {
            setErrorMsg("Không tìm thấy gói dịch vụ.");
            setLoading(false);
            return;
        }

        try {
            setErrorMsg(null);
            setStatus("idle");

            const pkgRes = await api.get("/api/payments/packages");
            const allPkgs: ServicePackage[] = pkgRes.data?.data || [];
            const pkg = allPkgs.find(p => p._id === packageId);
            if (!pkg) {
                setErrorMsg("Gói dịch vụ không tồn tại hoặc đã ngừng.");
                setLoading(false);
                return;
            }
            setSelectedPackage(pkg);

            // Try reuse existing session from localStorage
            if (typeof window !== "undefined") {
                const raw = window.localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    try {
                        const parsed = JSON.parse(raw) as { packageId: string; paymentSession: PaymentSession; expiresAt: string };
                        if (parsed.packageId === packageId) {
                            const expiresAt = new Date(parsed.expiresAt);
                            const now = new Date();
                            if (expiresAt.getTime() > now.getTime()) {
                                setPaymentSession(parsed.paymentSession);
                                setStatus("pending");
                                setRemainingMs(expiresAt.getTime() - now.getTime());
                                return;
                            } else {
                                window.localStorage.removeItem(STORAGE_KEY);
                            }
                        }
                    } catch {
                        window.localStorage.removeItem(STORAGE_KEY);
                    }
                }
            }

            const payRes = await api.post("/api/payments/create", { packageId });
            const session: PaymentSession = payRes.data.data;
            setPaymentSession(session);
            setStatus("pending");

            if (typeof window !== "undefined") {
                const expiresAt = session.expiresAt ? new Date(session.expiresAt) : new Date(Date.now() + 5 * 60 * 1000);
                window.localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({
                        packageId,
                        paymentSession: session,
                        expiresAt: expiresAt.toISOString(),
                    })
                );
                setRemainingMs(expiresAt.getTime() - Date.now());
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [packageId]);

    useEffect(() => {
        initCheckout();
    }, [initCheckout]);

    // Countdown remaining time
    useEffect(() => {
        if (!paymentSession || status !== "pending" || remainingMs === null) return;
        if (remainingMs <= 0) {
            setStatus("failed");
            if (typeof window !== "undefined") {
                window.localStorage.removeItem(STORAGE_KEY);
            }
            return;
        }

        const tick = () => {
            setRemainingMs((prev) => {
                if (prev === null) return null;
                const next = prev - 1000;
                return next < 0 ? 0 : next;
            });
        };

        const interval = window.setInterval(tick, 1000);
        return () => window.clearInterval(interval);
    }, [paymentSession, status, remainingMs]);

    // Poll session status while waiting webhook
    useEffect(() => {
        if (!paymentSession || status !== "pending") return;

        let cancelled = false;
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/api/payments/session/${paymentSession.sessionId}`);
                const s = res.data?.data?.status;
                if (cancelled) return;
                if (s === "completed") {
                    setStatus("success");
                    if (typeof window !== "undefined") {
                        window.localStorage.removeItem(STORAGE_KEY);
                    }
                    clearInterval(interval);
                } else if (s === "failed") {
                    setStatus("failed");
                    if (typeof window !== "undefined") {
                        window.localStorage.removeItem(STORAGE_KEY);
                    }
                    clearInterval(interval);
                }
            } catch {
                // ignore transient
            }
        }, 2500);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [paymentSession, status]);

    useEffect(() => {
        if (status !== "success" || typeof window === "undefined") return;
        window.dispatchEvent(new Event("packageUpdated"));
    }, [status]);

    const renderCountdown = () => {
        if (remainingMs === null || remainingMs <= 0 || status !== "pending") return null;
        const totalSeconds = Math.floor(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const label = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        const progress =
            remainingMs >= TOTAL_TTL_MS
                ? 100
                : Math.max(0, Math.min(100, (remainingMs / TOTAL_TTL_MS) * 100));
        return (
            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-base text-amber-500">timer</span>
                    <span>Thời gian còn lại để thanh toán: {label}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                        className="h-full bg-amber-500 dark:bg-amber-400 transition-[width] duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-24 pb-24 transition-all duration-500">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
                    <button
                        onClick={() => router.push("/hr-dashboard/packages")}
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary mb-3 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Quay lại gói dịch vụ
                    </button>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Thanh toán gói HR</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-lg">
                        Quét QR SePay để kích hoạt gói dịch vụ và mở khoá lượt đăng tin.
                    </p>
                </motion.div>

                {errorMsg && (
                    <div className="mb-6">
                        <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
                            {errorMsg}
                        </div>
                    </div>
                )}

                {loading && !errorMsg && (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {!loading && !errorMsg && selectedPackage && paymentSession && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Package details */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm"
                        >
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Gói bạn đã chọn</p>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                {selectedPackage.name}
                            </h2>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
                                {selectedPackage.description}
                            </p>
                            <div className="mb-4">
                                <span className="text-3xl font-black text-primary">
                                    {formatVND(selectedPackage.price)}
                                </span>
                                {selectedPackage.price > 0 && (
                                    <span className="text-sm text-slate-400 font-bold ml-1">/tháng</span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {selectedPackage.features.map((feat) => (
                                    <div key={feat} className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-lg mt-0.5 text-emerald-500">
                                            check_circle
                                        </span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feat}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                                <p className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest mb-1">
                                    Quyền đăng tin
                                </p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                    {selectedPackage.jobPostLimit === -1
                                        ? "Không giới hạn số tin tuyển dụng đang mở"
                                        : `Tối đa ${selectedPackage.jobPostLimit} tin tuyển dụng trong ${selectedPackage.durationDays} ngày`}
                                </p>
                            </div>
                        </motion.div>

                        {/* Payment & status */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm"
                        >
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">
                                Bước 1 · Quét mã QR
                            </p>
                            <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col items-center">
                                <img
                                    src={paymentSession.qrCodeUrl}
                                    alt="QR Code thanh toán"
                                    className="w-56 h-56 object-contain rounded-xl"
                                />
                                <div className="mt-4 text-center space-y-1">
                                    <p className="text-xs font-bold text-slate-400">Số tiền</p>
                                    <p className="text-2xl font-black text-primary">
                                        {formatVND(paymentSession.amount)}
                                    </p>
                                    <p className="text-[11px] text-slate-400 font-mono mt-2 break-all">
                                        Nội dung: {paymentSession.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-black">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-slate-900 dark:text-white text-sm">
                                            Chờ SePay xác nhận tự động
                                        </p>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                                            Sau khi bạn chuyển khoản, SePay sẽ gửi tín hiệu về hệ thống và gói sẽ được kích hoạt trong vài giây.
                                        </p>
                                    </div>
                                    {status === "pending" && (
                                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin mt-1" />
                                    )}
                                </div>

                                {renderCountdown()}

                                {status === "success" && (
                                    <div className="mt-2 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-xl">
                                            check_circle
                                        </span>
                                        <div>
                                            <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                                                Kích hoạt gói thành công!
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                                                Bạn có thể bắt đầu đăng tin tuyển dụng ngay bây giờ.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {status === "failed" && (
                                    <div className="mt-2 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-red-500 text-xl">
                                            error
                                        </span>
                                        <div>
                                            <p className="text-sm font-black text-red-700 dark:text-red-300">
                                                Thanh toán thất bại hoặc không hợp lệ.
                                            </p>
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                                                Vui lòng kiểm tra lại giao dịch hoặc liên hệ hỗ trợ.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => router.push("/post-job")}
                                    disabled={status !== "success"}
                                    className="flex-1 h-12 rounded-2xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined text-base">work</span>
                                    Đăng tin ngay
                                </button>
                                <button
                                    onClick={() => router.push("/hr-dashboard")}
                                    className="flex-1 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">dashboard</span>
                                    Về Dashboard HR
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-24 pb-24 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}

