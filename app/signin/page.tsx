"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [userType, setUserType] = useState<"worker" | "contractor">("worker");

    // Auto-switch to register if redirected from /signup
    useEffect(() => {
        const mode = sessionStorage.getItem("authMode");
        if (mode === "register") {
            setIsLogin(false);
            sessionStorage.removeItem("authMode");
        }
    }, []);

    const [showVerifyDialog, setShowVerifyDialog] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [devVerifyUrl, setDevVerifyUrl] = useState("");

    // Form inputs state
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const calculatePasswordStrength = (pass: string) => {
        let score = 0;
        if (!pass) return score;
        if (pass.length > 6) score += 1;
        if (/[A-Z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;
        return score; // Max 4
    };

    // Status state
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState<React.ReactNode>("");

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setShowPassword(false);
        setErrorMsg("");
        setSuccessMsg("");
        setPassword("");
        setConfirmPassword("");
        setShowVerifyDialog(false);
    };

    React.useEffect(() => {
        let interval: NodeJS.Timeout;

        if (showVerifyDialog && registeredEmail) {
            interval = setInterval(async () => {
                try {
                    const res = await api.post('/api/auth/check-verification', { email: registeredEmail });
                    if (res.data.success && res.data.verified) {
                        setShowVerifyDialog(false);
                        setSuccessMsg("Xác minh tài khoản thành công! Bạn có thể đăng nhập ngay.");
                        setTimeout(() => {
                            toggleAuthMode();
                        }, 2000);
                        clearInterval(interval);
                    }
                } catch (error) {
                    // Ignore 404 or other errors, keep polling until they verify
                }
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showVerifyDialog, registeredEmail]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const response = await api.post('/api/auth/login', {
                identifier,
                password
            });

            if (response.data.success) {
                setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
                // Store token
                localStorage.setItem('token', response.data.data.token);
                // Fire custom event so Header updates immediately
                window.dispatchEvent(new Event('userLoggedIn'));
                // Redirect user
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            }
        } catch (error: any) {
            // Log for debugging (remove in production)
            console.error("Login attempt failed:", error.response?.data);

            const backendMsg = error.response?.data?.message;
            if (backendMsg === "Invalid credentials") {
                setErrorMsg("Email/Số điện thoại hoặc mật khẩu không chính xác.");
            } else if (backendMsg === "Account has been suspended or is inactive") {
                setErrorMsg("Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt.");
            } else if (backendMsg === "Validation failed") {
                // If there are specific error details from express-validator
                const specificError = error.response?.data?.errors?.[0]?.msg;
                setErrorMsg(specificError || "Vui lòng nhập đầy đủ thông tin đăng nhập.");
            } else {
                setErrorMsg(backendMsg || "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (password !== confirmPassword) {
            setErrorMsg("Mật khẩu không khớp.");
            return;
        }

        setIsLoading(true);

        // Split fullname into first and last name
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Người dùng";

        try {
            const response = await api.post('/api/auth/register', {
                email: email || `${phone}@temp.com`, // Adjust this based on your reality
                password,
                firstName,
                lastName,
                phone,
                role: userType === "worker" ? "user" : "hr",
                // Provide placeholder if HR required fields are needed
                ...(userType === "contractor" && {
                    companyName: "Default Company",
                    taxCode: "000000000"
                })
            });

            if (response.data.success) {
                const targetEmail = email || `${phone}@temp.com`;
                setRegisteredEmail(targetEmail);
                setDevVerifyUrl(response.data.devVerifyUrl || "");
                setShowVerifyDialog(true);
            }
        } catch (error: any) {
            console.error("Registration error:", error.response?.data);
            const backendMsg = error.response?.data?.message;
            if (backendMsg === "Email already exists") {
                setErrorMsg("Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.");
            } else if (backendMsg === "Phone already exists") {
                setErrorMsg("Số điện thoại này đã được đăng ký.");
            } else if (backendMsg === "Validation failed") {
                const specificError = error.response?.data?.errors?.[0]?.msg;
                setErrorMsg(specificError || "Vui lòng kiểm tra lại thông tin đăng ký.");
            } else {
                setErrorMsg(backendMsg || error.response?.data?.errors?.[0]?.msg || "Không thể tạo tài khoản. Vui lòng thử lại sau.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex min-h-screen flex-col transition-all duration-700 overflow-hidden ${isLogin ? "lg:flex-row" : "lg:flex-row-reverse"} bg-white`}>

            {/* --- PANEL HÌNH ẢNH (HERO PANEL) --- */}
            <motion.section
                layout
                className="relative hidden lg:flex lg:w-5/12 items-center justify-center overflow-hidden pt-20"
            >
                <motion.img
                    layout
                    alt="Construction site"
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFOBonC_3DOEweS8OWcwxfoQS3N94yDzSgQC8Ewh9aExV8Uydq3dCIttqyU743VtIISxuDcyqaBycqeFjK-JWTKekK330NAxvy_8axGBtk6aK3nKMuxkdf2GUyZSp_QHLgVy00L-RQee5uD3qF2suVvH53IcuJFbDOeOc3lUFnbZKS4wlklKh4aYmEukC1WQNFY0JwpCMZ5eub2fo6BuZLQOIWH0NLNtPtKO3CKG-8oypqSI1WHV45YACD8zfQx8yYi33WRfe5H2Q"
                />
                <div className="absolute inset-0 hero-overlay"></div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? "login-hero" : "register-hero"}
                        initial={{ opacity: 0, x: isLogin ? -30 : 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 30 : -30 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 px-12 max-w-xl text-white"
                    >
                        <h1 className="font-display text-5xl font-bold leading-tight mb-12">
                            {isLogin ? (
                                <>Kết nối những bàn tay lành nghề với <span className="text-sky-300">các dự án tin cậy.</span></>
                            ) : (
                                <>Dự án tiếp theo của bạn <br />Bắt đầu từ đây.</>
                            )}
                        </h1>

                        <div className="space-y-10">
                            {isLogin ? (
                                <>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">verified_user</span>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold mb-1">Nhà thầu uy tín</p>
                                            <p className="text-slate-200">Chúng tôi kiểm tra kỹ lưỡng mọi đối tác tham gia hệ thống.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">payments</span>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold mb-1">Thanh toán đúng hạn</p>
                                            <p className="text-slate-200">Đảm bảo quyền lợi tài chính cho tất cả công nhân và kỹ sư.</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white text-2xl font-bold mb-1">Miễn phí cho công nhân</h3>
                                            <p className="text-white/80 text-lg">Không phí ẩn, không phí duy trì. Giữ trọn số tiền bạn kiếm được.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">verified</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white text-2xl font-bold mb-1">Việc làm đã xác minh</h3>
                                            <p className="text-white/80 text-lg">Mọi nhà thầu đều được kiểm tra về khả năng thanh toán.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">security</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white text-2xl font-bold mb-1">Bảo vệ kỹ năng</h3>
                                            <p className="text-white/80 text-lg">Lưu trữ hồ sơ an toàn kỹ thuật số và chứng chỉ nghề nghiệp.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="mt-20">
                                <p className="text-white/60 text-sm font-medium italic">&quot;Cách minh bạch nhất để tìm kiếm công việc xây dựng tại địa phương.&quot;</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.section>

            {/* --- PANEL NHẬP LIỆU --- */}
            <motion.section
                layout
                className="flex-1 flex flex-col justify-center items-center pt-12 pb-24 px-6 sm:px-12 bg-white dark:bg-slate-900 transition-colors duration-300"
            >
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            /* --- GIAO DIỆN ĐĂNG NHẬP --- */
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="mb-10 text-center lg:text-left">
                                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Chào mừng trở lại</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Vui lòng đăng nhập để tiếp tục công việc của bạn.</p>
                                </div>

                                {errorMsg && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium">{errorMsg}</div>}
                                {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-xl text-center font-medium">{successMsg}</div>}

                                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="account">
                                            Email hoặc Số điện thoại
                                        </label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                                            <input
                                                className="w-full pl-12 pr-4 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-lg font-medium focus:outline-none transition-all placeholder:text-slate-400"
                                                id="account"
                                                placeholder="VD: 0912345678"
                                                type="text"
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-lg font-bold text-slate-700 dark:text-slate-300" htmlFor="password">
                                                Mật khẩu
                                            </label>
                                            <Link href="/forgot-password" className="text-primary font-bold text-base hover:underline">
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                            <input
                                                className="w-full pl-12 pr-12 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-lg font-medium focus:outline-none transition-all placeholder:text-slate-400"
                                                id="password"
                                                placeholder="Nhập mật khẩu của bạn"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button disabled={isLoading} className="w-full bg-primary hover:bg-sky-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-sky-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50">
                                            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                                        </button>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
                                            <span className="material-symbols-outlined text-secondary text-xl">shield_with_heart</span>
                                            <p className="text-sm font-bold uppercase tracking-widest text-[#10B981]">AN TOÀN VÀ MINH BẠCH</p>
                                        </div>
                                    </div>
                                </form>

                                <div className="mt-12">
                                    <div className="relative flex items-center mb-10">
                                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                        <span className="flex-shrink mx-4 text-slate-400 font-bold text-sm uppercase tracking-widest whitespace-nowrap">HOẶC TIẾP TỤC VỚI</span>
                                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="flex items-center justify-center gap-3 border-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 rounded-2xl transition-all">
                                            <img alt="Google" className="w-6 h-6" src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" />
                                            <span className="font-bold text-slate-700 dark:text-slate-300">Google</span>
                                        </button>
                                        <button className="flex items-center justify-center gap-3 border-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-4 rounded-2xl transition-all">
                                            <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">Facebook</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-12 text-center">
                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                                        Chưa có tài khoản?
                                        <button onClick={toggleAuthMode} className="text-primary font-black ml-1 hover:underline">
                                            Đăng ký ngay
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            /* --- GIAO DIỆN ĐĂNG KÝ --- */
                            <motion.div
                                key="register-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="mb-12">
                                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4 text-center lg:text-left">Tạo tài khoản của bạn</h2>
                                    <p className="text-xl text-slate-500 font-medium text-center lg:text-left">Gia nhập mạng lưới các chuyên gia lành nghề ngay hôm nay.</p>
                                </div>

                                {errorMsg && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium">{errorMsg}</div>}
                                {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-xl text-center font-medium">{successMsg}</div>}

                                <div className="relative mb-12 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center">
                                    <div
                                        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-transform duration-300 ease-out z-0"
                                        style={{ transform: userType === "worker" ? "translateX(0)" : "translateX(100%)" }}
                                    />
                                    <button
                                        type="button"
                                        className={`relative z-10 flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-colors duration-300 ${userType === "worker" ? "text-primary" : "text-slate-500 dark:text-slate-400"}`}
                                        onClick={() => setUserType("worker")}
                                    >
                                        Công nhân/Cá nhân
                                    </button>
                                    <button
                                        type="button"
                                        className={`relative z-10 flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-colors duration-300 ${userType === "contractor" ? "text-primary" : "text-slate-500 dark:text-slate-400"}`}
                                        onClick={() => setUserType("contractor")}
                                    >
                                        Nhà thầu/Công ty
                                    </button>
                                </div>

                                <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="fullname">Họ và tên</label>
                                        <input value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all" id="fullname" placeholder="Nhập họ và tên của bạn" type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="email">Email</label>
                                        <input value={email} onChange={e => setEmail(e.target.value)} required className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all" id="email" placeholder="example@email.com" type="email" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="phone">Số điện thoại</label>
                                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all" id="phone" placeholder="0912 345 678" type="tel" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="r-password">Mật khẩu</label>
                                        <div className="relative">
                                            <input value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all pr-16" id="r-password" placeholder="Tạo mật khẩu mạnh" type={showPassword ? "text" : "password"} />
                                            <button
                                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                                            </button>
                                        </div>
                                        {/* Password Strength Meter */}
                                        {password && (
                                            <div className="mt-2 px-2">
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-xs font-bold text-slate-500">Độ mạnh mật khẩu:</span>
                                                    <span className={`text-xs font-bold ${calculatePasswordStrength(password) <= 2 ? 'text-red-500' : calculatePasswordStrength(password) === 3 ? 'text-amber-500' : 'text-green-500'}`}>
                                                        {calculatePasswordStrength(password) <= 2 ? 'Yếu' : calculatePasswordStrength(password) === 3 ? 'Khá' : 'Mạnh'}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex gap-1">
                                                    <div className={`h-full flex-1 rounded-full transition-colors ${calculatePasswordStrength(password) >= 1 ? (calculatePasswordStrength(password) <= 2 ? 'bg-red-500' : calculatePasswordStrength(password) === 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-transparent'}`}></div>
                                                    <div className={`h-full flex-1 rounded-full transition-colors ${calculatePasswordStrength(password) >= 2 ? (calculatePasswordStrength(password) <= 2 ? 'bg-red-500' : calculatePasswordStrength(password) === 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-transparent'}`}></div>
                                                    <div className={`h-full flex-1 rounded-full transition-colors ${calculatePasswordStrength(password) >= 3 ? (calculatePasswordStrength(password) === 3 ? 'bg-amber-500' : 'bg-green-500') : 'bg-transparent'}`}></div>
                                                    <div className={`h-full flex-1 rounded-full transition-colors ${calculatePasswordStrength(password) >= 4 ? 'bg-green-500' : 'bg-transparent'}`}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="r-confirm-password">Xác nhận mật khẩu</label>
                                        <div className="relative">
                                            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all pr-16" id="r-confirm-password" placeholder="Xác nhận mật khẩu của bạn" type={showPassword ? "text" : "password"} />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 pt-4">
                                        <input required className="w-6 h-6 mt-1 rounded border-2 border-slate-300 text-primary focus:ring-primary cursor-pointer" id="terms" type="checkbox" />
                                        <label className="text-base text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer" htmlFor="terms">
                                            Tôi đồng ý với <Link className="text-primary font-bold hover:underline" href="/terms">Điều khoản dịch vụ</Link> và <Link className="text-primary font-bold hover:underline" href="/privacy">Chính sách bảo mật</Link>.
                                        </label>
                                    </div>

                                    <div className="pt-6">
                                        <button disabled={isLoading} className="w-full py-6 bg-primary hover:bg-sky-600 text-white rounded-2xl font-black text-2xl shadow-xl shadow-sky-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg active:scale-95 disabled:opacity-50 disabled:transform-none">
                                            {isLoading ? "Đang tạo hồ sơ..." : "Tạo tài khoản"}
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-12 text-center">
                                    <p className="text-lg font-medium text-slate-500">
                                        Đã có tài khoản?
                                        <button onClick={toggleAuthMode} className="text-primary font-bold hover:underline ml-2">
                                            Đăng nhập ngay
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.section>

            {/* VERIFICATION DIALOG */}
            {showVerifyDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative"
                    >
                        <div className="w-20 h-20 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-primary animate-pulse">
                                mark_email_unread
                            </span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4">
                            Kiểm tra Email của bạn
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            Chúng tôi đã gửi một liên kết xác minh đến <span className="font-bold text-slate-800 dark:text-slate-200">{registeredEmail}</span>. Vui lòng nhấp vào liên kết để kích hoạt tài khoản của bạn.
                        </p>

                        <div className="flex items-center justify-center gap-3 text-sm text-slate-500 mb-6 border border-slate-200 dark:border-slate-700 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="material-symbols-outlined animate-spin text-primary">
                                progress_activity
                            </span>
                            Đang chờ xác minh...
                        </div>

                        {devVerifyUrl && (
                            <div className="mb-8 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-center">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">🚧 Chế độ thử nghiệm 🚧</p>
                                <a
                                    href={devVerifyUrl}
                                    target="_blank"
                                    className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium break-all block"
                                >
                                    Nhấp vào đây để mô phỏng xác minh email
                                </a>
                            </div>
                        )}

                        <button
                            onClick={() => setShowVerifyDialog(false)}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                        >
                            Đóng & Xác minh sau
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

