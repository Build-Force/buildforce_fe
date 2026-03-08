"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function GoogleVerificationRequiredContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl text-center">
                <div className="mx-auto w-16 h-16 bg-sky-100 dark:bg-sky-900/30 text-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl">mail</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kiểm tra email của bạn</h2>
                <p className="text-slate-600 dark:text-slate-400">
                    Chúng tôi đã gửi link xác minh đến <strong className="text-slate-800 dark:text-slate-200">{email || "email của bạn"}</strong>. Vui lòng mở hộp thư và nhấp vào link để kích hoạt tài khoản.
                </p>
                <Link
                    href="/signin"
                    className="inline-flex justify-center items-center w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 py-4 px-4 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}

export default function GoogleVerificationRequiredPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            }
        >
            <GoogleVerificationRequiredContent />
        </Suspense>
    );
}
