"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleVerificationSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [done, setDone] = useState(false);

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token || done) return;
        if (typeof window !== "undefined") {
            localStorage.setItem("token", token);
        }
        setDone(true);
        router.replace("/");
    }, [searchParams, router, done]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4">
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Xác minh thành công</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">Đang chuyển bạn đến trang chủ...</p>
                <div className="mt-6 mx-auto w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        </div>
    );
}

export default function GoogleVerificationSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            }
        >
            <GoogleVerificationSuccessContent />
        </Suspense>
    );
}
