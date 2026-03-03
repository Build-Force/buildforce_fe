"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "../../../utils/api";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found.");
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await api.post('/api/auth/verify-link-email', { token });
                if (response.data.success) {
                    setStatus("success");
                    setMessage("Email verified successfully! You can now sign in.");
                } else {
                    setStatus("error");
                    setMessage(response.data.message || "Failed to verify email.");
                }
            } catch (error: any) {
                setStatus("error");
                setMessage(error.response?.data?.message || "An error occurred during verification.");
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl text-center">
                <div>
                    {status === "loading" && (
                        <div className="mx-auto w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    )}
                    {status === "success" && (
                        <div className="mx-auto w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="mx-auto w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-4xl">error</span>
                        </div>
                    )}
                    <h2 className="mt-6 text-3xl font-display font-black text-slate-900 dark:text-white">
                        Email Verification
                    </h2>
                    <p className={`mt-4 text-lg font-medium ${status === "error" ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
                        {message}
                    </p>
                </div>

                {status !== "loading" && (
                    <div className="pt-4">
                        <Link
                            href="/signin"
                            className="group relative flex w-full justify-center rounded-2xl bg-primary py-4 px-4 text-xl font-black text-white hover:bg-sky-600 focus:outline-none transition-all shadow-xl shadow-sky-500/30 active:scale-[0.98]"
                        >
                            Sign In Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
