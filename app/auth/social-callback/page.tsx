"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SocialCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [handled, setHandled] = useState(false);

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");
        if (handled) return;
        if (token) {
            if (typeof window !== "undefined") {
                localStorage.setItem("token", token);
            }
            setHandled(true);
            router.replace("/");
            return;
        }
        if (error) {
            setHandled(true);
        }
    }, [searchParams, router, handled]);

    const error = searchParams.get("error");
    const token = searchParams.get("token");

    if (token && !error) {
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
