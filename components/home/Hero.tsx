"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { SurveyWizard } from "./SurveyWizard";
import { ArrowRight, MapPin, Hammer, Search, Building2, CheckCircle2 } from "lucide-react";

export const Hero = () => {
    const router = useRouter();
    const [isSurveyOpen, setIsSurveyOpen] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isHR, setIsHR] = React.useState(false);
    const [keyword, setKeyword] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [jobType, setJobType] = React.useState("");
    const [isJobTypeOpen, setIsJobTypeOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsJobTypeOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (keyword.trim()) params.set("search", keyword.trim());
        if (location.trim()) params.set("location", location.trim());
        if (jobType.trim()) params.set("jobType", jobType.trim());
        router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
    };

    React.useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        setIsLoggedIn(true);

        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/auth/profile");
                if (res.data?.success && res.data?.data?.role) {
                    setIsHR(res.data.data.role === "hr");
                }
            } catch (err) {
                console.error("Failed to fetch profile for hero:", err);
            }
        };

        fetchProfile();
    }, []);

    return (
        <section className="relative bg-[var(--background-dark)] text-white pt-20 pb-32">
            <img
                alt="Construction site"
                className="absolute inset-0 w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFOBonC_3DOEweS8OWcwxfoQS3N94yDzSgQC8Ewh9aExV8Uydq3dCIttqyU743VtIISxuDcyqaBycqeFjK-JWTKekK330NAxvy_8axGBtk6aK3nKMuxkdf2GUyZSp_QHLgVy00L-RQee5uD3qF2suVvH53IcuJFbDOeOc3lUFnbZKS4wlklKh4aYmEukC1WQNFY0JwpCMZ5eub2fo6BuZLQOIWH0NLNtPtKO3CKG-8oypqSI1WHV45YACD8zfQx8yYi33WRfe5H2Q"
            />
            <div className="absolute inset-0 hero-gradient"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    {/* LEFT CONTENT */}
                    <div className="lg:col-span-7">
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--primary)] mb-4"
                        >
                            NỀN TẢNG NHÂN LỰC XÂY DỰNG #1 VIỆT NAM
                        </motion.p>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.05 }}
                            className="font-display font-extrabold text-[38px] sm:text-[46px] lg:text-[52px] leading-tight mb-5"
                        >
                            Kết nối những đôi tay lành nghề
                            <br className="hidden sm:block" />
                            với các dự án{" "}
                            <span className="underline-hero">tin cậy</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="text-[15px] leading-relaxed text-white/80 max-w-xl mb-6"
                        >
                            Trả lời khảo sát 2 phút để được ghép nối với công trình phù hợp, hoặc xem ngay các cơ hội tuyển dụng mới nhất.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            className="flex flex-wrap items-center gap-4 mb-4"
                        >
                            <button
                                onClick={() => setIsSurveyOpen(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 sm:px-8 h-12 text-[15px] font-semibold text-white shadow-xl shadow-sky-500/25 hover:shadow-2xl hover:bg-sky-500 transition-all duration-200"
                            >
                                Bắt đầu khảo sát 2 phút
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => router.push("/jobs")}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/5 px-6 sm:px-8 h-12 text-[15px] font-semibold text-white hover:bg-white/15 hover:border-white transition-all duration-200"
                            >
                                Tìm việc ngay
                            </button>

                            {isHR && (
                                <button
                                    onClick={() => router.push("/post-job")}
                                    className="inline-flex items-center justify-center gap-2 text-[13px] font-medium text-white/80 underline underline-offset-4 decoration-white/40 hover:text-white"
                                >
                                    Tôi là nhà thầu / HR
                                </button>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.35 }}
                            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-white/70"
                        >
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                                Miễn phí
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                                Không cần CV
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                                Kết quả trong 2 phút
                            </span>
                        </motion.div>

                        <p className="mt-4 text-[13px] text-white/65">
                            Không thu phí người lao động. Chỉ hợp tác với nhà thầu đã xác minh.
                        </p>
                    </div>

                    {/* RIGHT FLOATING CARD */}
                    <motion.div
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        className="lg:col-span-5 flex justify-center lg:justify-end mt-10 lg:mt-0"
                    >
                        <div
                            className="hero-floating-card w-full max-w-xs rounded-2xl border shadow-2xl px-6 py-5 bg-[var(--surface)]/95 text-[var(--text-primary)]"
                            style={{
                                backgroundColor: "var(--surface)",
                                color: "var(--text-primary)",
                                borderColor: "var(--border)",
                                boxShadow: "0 22px 55px rgba(15,23,42,0.45)",
                            }}
                        >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-2">
                                Đang tuyển hôm nay
                            </p>
                            <p
                                className="text-[46px] leading-none font-extrabold mb-1"
                                style={{ color: "var(--primary)" }}
                            >
                                1,240+
                            </p>
                            <p className="text-[13px] text-[var(--text-secondary)] mb-4">
                                công trình trên toàn quốc
                            </p>

                            <div className="h-px w-full bg-slate-200/80 dark:bg-slate-700/80 mb-4" />

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--text-secondary)] mb-4">
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                                    63 tỉnh
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <StarIcon />
                                    4.8★ đánh giá
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                                    98% hoàn thành
                                </span>
                            </div>

                            <div className="h-px w-full bg-slate-200/80 dark:bg-slate-700/80 mb-4" />

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] pulse-dot" />
                                    </span>
                                    <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
                                        247 HR đang online
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 dark:bg-slate-900/40 px-2.5 py-1">
                                    <UsersBadge />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* SURVEY MODAL */}
            <AnimatePresence>
                {isSurveyOpen && (
                    <SurveyWizard
                        isOpen={isSurveyOpen}
                        onClose={() => setIsSurveyOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* SEARCH BAR – OVERLAPS INTO LIGHT SECTION */}
            <div className="pointer-events-none absolute inset-x-0 -bottom-16 md:-bottom-20 z-10">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="pointer-events-auto rounded-2xl md:rounded-3xl border shadow-2xl bg-[var(--surface)]"
                        style={{
                            backgroundColor: "var(--surface)",
                            borderColor: "var(--border)",
                            boxShadow: "0 30px 80px rgba(15,23,42,0.55)",
                        }}
                    >
                        <div className="flex flex-col md:flex-row items-stretch gap-2 md:gap-3 px-4 py-3 md:px-5 md:py-4">
                            {/* Location */}
                            <div className="flex-1 flex items-center gap-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 px-3 py-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <input
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-slate-900 dark:text-white placeholder-slate-500"
                                    placeholder="Chọn tỉnh/thành"
                                    type="text"
                                />
                            </div>

                            <div className="flex-1 relative" ref={dropdownRef}>
                                <div className="h-full flex items-center gap-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 px-3 py-2">
                                    <Hammer className="w-4 h-4 text-slate-500" />
                                    <button
                                        type="button"
                                        onClick={() => setIsJobTypeOpen(!isJobTypeOpen)}
                                        className="flex-1 flex items-center justify-between text-left text-[15px] text-slate-900 dark:text-white"
                                    >
                                        <span className="truncate">
                                            {jobType === "" ? "Tất cả nghề nghiệp" : jobType === "other" ? "Nghề khác" : (
                                                [
                                                    { label: "Thợ điện", value: "electrician" },
                                                    { label: "Thợ ống nước", value: "plumber" },
                                                    { label: "Thợ mộc", value: "carpenter" },
                                                    { label: "Thợ hàn", value: "welder" },
                                                    { label: "Thợ sắt / Thép", value: "ironworker" },
                                                    { label: "Thợ xây / Nề", value: "mason" },
                                                    { label: "Thợ sơn", value: "painter" },
                                                    { label: "Thợ ốp lát", value: "tiler" },
                                                    { label: "Thợ lợp mái", value: "roofer" },
                                                    { label: "Thợ lắp đặt điều hòa", value: "hvac" },
                                                    { label: "Thợ lắp kính / Nhôm kính", value: "glazier" },
                                                    { label: "Vận hành máy xúc / Máy ủi", value: "heavy_equipment" },
                                                    { label: "Vận hành cần cẩu", value: "crane_operator" },
                                                    { label: "Kỹ sư xây dựng", value: "civil_engineer" },
                                                    { label: "Giám sát công trình", value: "site_supervisor" },
                                                    { label: "Thợ lắp điện nội thất", value: "electrical_installer" },
                                                    { label: "Thợ bảo trì / Sửa chữa", value: "maintenance" },
                                                    { label: "Lao động phổ thông", value: "general" },
                                                    { label: "Máy trưởng / Máy phó", value: "marine_engineer" },
                                                    { label: "Thợ vận hành trạm trộn", value: "batching_operator" }
                                                ].find(o => o.value === jobType)?.label || "Loại công việc"
                                            )}
                                        </span>
                                        <motion.span
                                            animate={{ rotate: isJobTypeOpen ? 180 : 0 }}
                                            className="text-xs text-slate-500"
                                        >
                                            ▼
                                        </motion.span>
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {isJobTypeOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute left-0 right-0 mt-2 py-2 bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] z-50 overflow-hidden flex flex-col"
                                            style={{
                                                backgroundColor: "var(--surface)",
                                                borderColor: "var(--border)",
                                                boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                                                minWidth: "260px"
                                            }}
                                        >
                                            {[
                                                { id: "", label: "Tất cả công việc" },
                                                { id: "worker", label: "Công nhân / Thợ lành nghề" },
                                                { id: "engineer", label: "Kỹ sư / Quản lý kỹ thuật" },
                                            ].map((option) => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setJobType(option.id);
                                                        setIsJobTypeOpen(false);
                                                    }}
                                                    className={`w-full px-4 py-2.5 text-left text-[14px] hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${jobType === option.id
                                                        ? "text-[var(--primary)] font-semibold"
                                                        : "text-slate-700 dark:text-slate-200"
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Keyword */}
                            <div className="flex-1 flex items-center gap-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 px-3 py-2">
                                <Search className="w-4 h-4 text-slate-500" />
                                <input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-slate-900 dark:text-white placeholder-slate-500"
                                    placeholder="Tìm kiếm theo từ khóa"
                                    type="text"
                                />
                            </div>

                            {/* Button */}
                            <button
                                type="button"
                                onClick={handleSearch}
                                className="mt-2 md:mt-0 md:self-stretch px-5 md:px-6 rounded-xl bg-[var(--primary)] text-white text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-sky-500 transition-colors"
                            >
                                Tìm việc làm
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-4 md:px-5 pb-3">
                            <p className="text-[13px] text-[var(--text-secondary)]">
                                Phổ biến:{" "}
                                <button
                                    type="button"
                                    onClick={() => setKeyword("Thợ hàn")}
                                    className="underline-offset-2 hover:underline"
                                >
                                    Thợ hàn
                                </button>{" "}
                                ·{" "}
                                <button
                                    type="button"
                                    onClick={() => setKeyword("Kỹ sư xây dựng")}
                                    className="underline-offset-2 hover:underline"
                                >
                                    Kỹ sư xây dựng
                                </button>{" "}
                                ·{" "}
                                <button
                                    type="button"
                                    onClick={() => setKeyword("Công nhân")}
                                    className="underline-offset-2 hover:underline"
                                >
                                    Công nhân
                                </button>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const StarIcon = () => (
    <svg
        className="w-3.5 h-3.5 text-amber-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.148 3.534a1 1 0 00.95.69h3.713c.969 0 1.371 1.24.588 1.81l-3.006 2.185a1 1 0 00-.364 1.118l1.148 3.534c.3.921-.755 1.688-1.54 1.118l-3.006-2.185a1 1 0 00-1.176 0l-3.006 2.185c-.784.57-1.838-.197-1.539-1.118l1.148-3.534a1 1 0 00-.364-1.118L2.59 8.96c-.783-.57-.38-1.81.588-1.81h3.713a1 1 0 00.95-.69l1.208-3.533z" />
    </svg>
);

const UsersBadge = () => (
    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
        <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span>Nhà thầu uy tín</span>
    </div>
);
