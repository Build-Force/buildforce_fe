"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";

export default function ForgotPasswordPage() {
    const router = useRouter();

    // Steps: 1 (Email), 2 (OTP), 3 (New Password)
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Tokens
    const [tempToken, setTempToken] = useState("");
    const [resetToken, setResetToken] = useState("");

    // Status
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            if (response.data.success) {
                setTempToken(response.data.tempToken);
                setSuccessMsg("Mã OTP đã được gửi đến email của bạn!");
                setStep(2);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Không thể gửi mã OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/verify-reset-otp', { otp, tempToken });
            if (response.data.success) {
                setResetToken(response.data.resetToken);
                setSuccessMsg("Đã xác minh OTP!");
                setStep(3);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Mã OTP không hợp lệ.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/reset-password', { newPassword, resetToken });
            if (response.data.success) {
                setSuccessMsg("Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...");
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Không thể đặt lại mật khẩu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-2xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-display font-black text-slate-900 dark:text-white">
                        {step === 1 && "Quên mật khẩu"}
                        {step === 2 && "Nhập mã OTP"}
                        {step === 3 && "Mật khẩu mới"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {step === 1 && "Nhập email của bạn để nhận mã khôi phục."}
                        {step === 2 && `Chúng tôi đã gửi mã 6 chữ số đến ${email}.`}
                        {step === 3 && "Vui lòng tạo một mật khẩu mới mạnh hơn."}
                    </p>
                </div>

                {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium shadow-sm border border-red-100">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl text-center font-medium shadow-sm border border-green-100">
                        {successMsg}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mt-8 space-y-6"
                            onSubmit={handleSendOTP}
                        >
                            <div>
                                <label htmlFor="email" className="sr-only">Địa chỉ Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="relative block w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-4 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none custom-focus transition-all sm:text-lg font-medium"
                                    placeholder="Nhập email của bạn"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-2xl bg-primary py-4 px-4 text-xl font-black text-white hover:bg-sky-600 focus:outline-none transition-all shadow-xl shadow-sky-500/30 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
                            </button>
                            <div className="text-center">
                                <Link href="/signin" className="font-bold text-primary hover:text-sky-600 transition-colors">
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mt-8 space-y-6"
                            onSubmit={handleVerifyOTP}
                        >
                            <div>
                                <label htmlFor="otp" className="sr-only">Mã OTP</label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="relative block w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-4 text-center text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none custom-focus transition-all text-2xl tracking-widest font-black"
                                    placeholder="------"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || otp.length < 6}
                                className="group relative flex w-full justify-center rounded-2xl bg-primary py-4 px-4 text-lg font-black text-white hover:bg-sky-600 focus:outline-none transition-all shadow-xl shadow-sky-500/30 active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? "Đang xác minh..." : "Xác minh mã"}
                            </button>
                            <div className="text-center">
                                <button type="button" onClick={() => setStep(1)} className="font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                                    Sai email? Quay lại
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="mt-8 space-y-6"
                            onSubmit={handleResetPassword}
                        >
                            <div className="relative">
                                <div className="relative">
                                    <label htmlFor="new-password" className="sr-only">Mật khẩu mới</label>
                                    <input
                                        id="new-password"
                                        name="new-password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="relative block w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-4 pr-16 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none custom-focus transition-all sm:text-lg font-medium"
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                    <button
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading || newPassword.length < 6}
                                    className="group relative flex w-full justify-center rounded-2xl bg-primary py-4 px-4 text-xl font-black text-white hover:bg-sky-600 focus:outline-none transition-all shadow-xl shadow-sky-500/30 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                                </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
