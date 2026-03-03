"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [userType, setUserType] = useState<"worker" | "contractor">("worker");

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
                        setSuccessMsg("Account verified successfully! You can now log in.");
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
                setSuccessMsg("Login successful! Redirecting...");
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
            setErrorMsg(error.response?.data?.message || "An error occurred during sign in.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        // Split fullname into first and last name
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "User";

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
            setErrorMsg(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Failed to create account.");
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
                                <>Connecting skilled hands with <span className="text-sky-300">trusted projects.</span></>
                            ) : (
                                <>Your Next Project <br />Starts Here.</>
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
                                            <p className="text-xl font-bold mb-1">Verified Contractors</p>
                                            <p className="text-slate-200">We thoroughly vet every partner joining the system.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">payments</span>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold mb-1">On-time Payments</p>
                                            <p className="text-slate-200">Ensuring financial rights for all workers and engineers.</p>
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
                                            <h3 className="text-white text-2xl font-bold mb-1">Free for workers</h3>
                                            <p className="text-white/80 text-lg">No hidden fees, no subscriptions. Keep what you earn.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">verified</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white text-2xl font-bold mb-1">Verified Jobs</h3>
                                            <p className="text-white/80 text-lg">Every contractor is vetted for payment reliability.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                                            <span className="material-symbols-outlined text-white text-3xl">security</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white text-2xl font-bold mb-1">Skill Protection</h3>
                                            <p className="text-white/80 text-lg">Digital safety records and certification storage.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="mt-20">
                                <p className="text-white/60 text-sm font-medium italic">&quot;The most transparent way to find construction work locally.&quot;</p>
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
                                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Welcome Back</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Please sign in to continue your work.</p>
                                </div>

                                {errorMsg && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-center font-medium">{errorMsg}</div>}
                                {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-xl text-center font-medium">{successMsg}</div>}

                                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="account">
                                            Email or Phone Number
                                        </label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                                            <input
                                                className="w-full pl-12 pr-4 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-lg font-medium focus:outline-none transition-all placeholder:text-slate-400"
                                                id="account"
                                                placeholder="e.g., 0912345678"
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
                                                Password
                                            </label>
                                            <Link href="/forgot-password" className="text-primary font-bold text-base hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                                            <input
                                                className="w-full pl-12 pr-12 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-lg font-medium focus:outline-none transition-all placeholder:text-slate-400"
                                                id="password"
                                                placeholder="Enter your password"
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
                                            {isLoading ? "Signing In..." : "Sign In"}
                                        </button>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
                                            <span className="material-symbols-outlined text-secondary text-xl">shield_with_heart</span>
                                            <p className="text-sm font-bold uppercase tracking-widest text-[#10B981]">SECURE AND TRANSPARENT</p>
                                        </div>
                                    </div>
                                </form>

                                <div className="mt-12">
                                    <div className="relative flex items-center mb-10">
                                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                        <span className="flex-shrink mx-4 text-slate-400 font-bold text-sm uppercase tracking-widest whitespace-nowrap">OR CONTINUE WITH</span>
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
                                        Don&apos;t have an account?
                                        <button onClick={toggleAuthMode} className="text-primary font-black ml-1 hover:underline">
                                            Sign up now
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
                                    <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4 text-center lg:text-left">Create your account</h2>
                                    <p className="text-xl text-slate-500 font-medium text-center lg:text-left">Join our network of skilled professionals today.</p>
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
                                        Worker/Individual
                                    </button>
                                    <button
                                        type="button"
                                        className={`relative z-10 flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-colors duration-300 ${userType === "contractor" ? "text-primary" : "text-slate-500 dark:text-slate-400"}`}
                                        onClick={() => setUserType("contractor")}
                                    >
                                        Contractor/Company
                                    </button>
                                </div>

                                <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="fullname">Full Name</label>
                                        <input value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all" id="fullname" placeholder="Enter your full name" type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="email">Email</label>
                                        <input value={email} onChange={e => setEmail(e.target.value)} required className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all" id="email" placeholder="example@email.com" type="email" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="phone">Phone Number</label>
                                        <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all" id="phone" placeholder="(555) 000-0000" type="tel" />
                                    </div>
                                    <div>
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="r-password">Password</label>
                                        <div className="relative">
                                            <input value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all pr-16" id="r-password" placeholder="Create a strong password" type={showPassword ? "text" : "password"} />
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
                                                    <span className="text-xs font-bold text-slate-500">Password Strength:</span>
                                                    <span className={`text-xs font-bold ${calculatePasswordStrength(password) <= 2 ? 'text-red-500' : calculatePasswordStrength(password) === 3 ? 'text-amber-500' : 'text-green-500'}`}>
                                                        {calculatePasswordStrength(password) <= 2 ? 'Weak' : calculatePasswordStrength(password) === 3 ? 'Good' : 'Strong'}
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
                                        <label className="block text-lg font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="r-confirm-password">Confirm Password</label>
                                        <div className="relative">
                                            <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-medium focus:outline-none custom-focus transition-all pr-16" id="r-confirm-password" placeholder="Confirm your password" type={showPassword ? "text" : "password"} />
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 pt-4">
                                        <input required className="w-6 h-6 mt-1 rounded border-2 border-slate-300 text-primary focus:ring-primary cursor-pointer" id="terms" type="checkbox" />
                                        <label className="text-base text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer" htmlFor="terms">
                                            I agree to the <Link className="text-primary font-bold hover:underline" href="#">Terms of Service</Link> and <Link className="text-primary font-bold hover:underline" href="#">Privacy Policy</Link>.
                                        </label>
                                    </div>

                                    <div className="pt-6">
                                        <button disabled={isLoading} className="w-full py-6 bg-primary hover:bg-sky-600 text-white rounded-2xl font-black text-2xl shadow-xl shadow-sky-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg active:scale-95 disabled:opacity-50 disabled:transform-none">
                                            {isLoading ? "Creating..." : "Create Account"}
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-12 text-center">
                                    <p className="text-lg font-medium text-slate-500">
                                        Already have an account?
                                        <button onClick={toggleAuthMode} className="text-primary font-bold hover:underline ml-2">
                                            Sign In
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
                            Check Your Email
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            We&apos;ve sent a verification link to <span className="font-bold text-slate-800 dark:text-slate-200">{registeredEmail}</span>. Please click the link to activate your account.
                        </p>

                        <div className="flex items-center justify-center gap-3 text-sm text-slate-500 mb-6 border border-slate-200 dark:border-slate-700 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <span className="material-symbols-outlined animate-spin text-primary">
                                progress_activity
                            </span>
                            Waiting for verification...
                        </div>

                        {devVerifyUrl && (
                            <div className="mb-8 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-center">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wider">🚧 Local Dev Mode 🚧</p>
                                <a
                                    href={devVerifyUrl}
                                    target="_blank"
                                    className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium break-all block"
                                >
                                    Click here to simulate verifying email
                                </a>
                            </div>
                        )}

                        <button
                            onClick={() => setShowVerifyDialog(false)}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                        >
                            Close & Verify Later
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

