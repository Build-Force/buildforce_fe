"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../../utils/api";

function SocialCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [handled, setHandled] = useState(false);
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [roleSubmitting, setRoleSubmitting] = useState(false);
    const [profileMessageShown, setProfileMessageShown] = useState(false);

    const token = searchParams.get("token");
    const newUser = searchParams.get("newUser") === "1";
    const error = searchParams.get("error");

    useEffect(() => {
        if (handled || !token || error) return;
        if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
        }
        window.dispatchEvent(new Event("userLoggedIn"));
        if (newUser) {
            setShowRoleDialog(true);
        } else {
            setHandled(true);
            router.replace("/");
        }
    }, [token, newUser, error, handled, router]);

    const handleChooseRole = async (role: "user" | "hr") => {
        setRoleSubmitting(true);
        try {
            if (role === "hr") {
                await api.put("/api/auth/profile", {
                    role: "hr",
                    companyName: "Công ty của tôi",
                    taxCode: "000000000",
                });
            }
            setShowRoleDialog(false);
            setProfileMessageShown(true);
        } catch (e) {
            console.error("Update role error:", e);
        } finally {
            setRoleSubmitting(false);
        }
    };

    const handleCloseProfileMessage = () => {
        setProfileMessageShown(false);
        setHandled(true);
        router.replace("/profile");
    };

    if (token && !error && (showRoleDialog || profileMessageShown)) {
        if (profileMessageShown) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4">
                    <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center">
                        <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">info</span>
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                            Hoàn thiện hồ sơ của bạn
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            Vui lòng vào trang <strong>Profile</strong> để điền đầy đủ thông tin (số điện thoại, địa chỉ, kỹ năng…). Đăng nhập Google có thể không cung cấp đủ thông tin.
                        </p>
                        <button
                            onClick={handleCloseProfileMessage}
                            className="w-full rounded-2xl bg-primary py-4 px-4 text-white font-black hover:bg-primary/90 transition-colors"
                        >
                            Đi đến trang Profile
                        </button>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4">
                <div className="w-full max-w-md space-y-6 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl text-center">
                    <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">person_add</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                        Chọn vai trò của bạn
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Bạn đăng nhập bằng Google lần đầu. Vui lòng chọn vai trò phù hợp để tiếp tục.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            disabled={roleSubmitting}
                            onClick={() => handleChooseRole("user")}
                            className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-600 hover:border-primary hover:bg-sky-50 dark:hover:bg-sky-900/20 py-4 px-6 rounded-2xl font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">engineering</span>
                            Công nhân / Cá nhân
                        </button>
                        <button
                            type="button"
                            disabled={roleSubmitting}
                            onClick={() => handleChooseRole("hr")}
                            className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-slate-600 hover:border-primary hover:bg-sky-50 dark:hover:bg-sky-900/20 py-4 px-6 rounded-2xl font-bold text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">business</span>
                            Nhà thầu / Công ty
                        </button>
                    </div>
                    {roleSubmitting && (
                        <p className="text-sm text-slate-500">Đang xử lý...</p>
                    )}
                </div>
            </div>
        );
    }

    if (token && !error && !showRoleDialog && !profileMessageShown) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">Đang đăng nhập...</p>
                </div>
            </div>
        );
    }

    const errorMessages: Record<string, string> = {
        authentication_failed: "Xác thực không thành công. Vui lòng thử lại.",
        server_error: "Lỗi máy chủ. Vui lòng thử lại sau.",
        missing_token: "Thiếu thông tin xác thực.",
        invalid_token: "Liên kết không hợp lệ hoặc đã hết hạn.",
        user_not_found: "Không tìm thấy tài khoản.",
        verification_failed: "Xác minh email thất bại.",
    };
    const message = error ? errorMessages[error] || "Đã xảy ra lỗi." : null;

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl">error</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Đăng nhập thất bại</h2>
                <p className="text-slate-600 dark:text-slate-400">{message}</p>
                <Link
                    href="/signin"
                    className="inline-flex justify-center items-center w-full rounded-2xl bg-primary py-4 px-4 text-white font-black hover:bg-primary/90 transition-colors"
                >
                    Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}

export default function SocialCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            }
        >
            <SocialCallbackContent />
        </Suspense>
    );
}
