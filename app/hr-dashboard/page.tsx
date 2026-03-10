"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";

type UiJob = {
    id: string;
    title: string;
    status: "active" | "closed" | "draft";
    applicants: number;
    needed: number;
    accepted: number;
    location: string;
    salary: string;
    startDate: string;
    urgent: boolean;
    views: number;
    skill?: string;
};

type UiApplicant = {
    id: string;
    name: string;
    skill?: string;
    experience?: number;
    rating?: number;
    status: "pending" | "accepted" | "rejected" | "hired" | "completed";
    initials: string;
    rawStatus: string;
    hasHrReviewed?: boolean;
};

type ActivePackage = {
    packageName: string;
    jobPostLimit: number;
    jobPostUsed: number;
    expiresAt: string;
    isActive: boolean;
    priorityLevel?: number;
};

const STATS_CONFIG = [
    { key: "totalJobs" as const, label: "Tổng tin đăng", icon: "work", color: "text-primary", bg: "from-sky-500/10 to-blue-600/10", border: "border-sky-100 dark:border-sky-800/30" },
    { key: "activeJobs" as const, label: "Đang tuyển", icon: "pending_actions", color: "text-amber-500", bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-100 dark:border-amber-800/30" },
    { key: "closedJobs" as const, label: "Đã tuyển xong", icon: "check_circle", color: "text-emerald-500", bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-100 dark:border-emerald-800/30" },
    { key: "totalHired" as const, label: "Tổng lao động thuê", icon: "group", color: "text-purple-500", bg: "from-purple-500/10 to-pink-500/10", border: "border-purple-100 dark:border-purple-800/30" },
];

const STATUS_CONFIG = {
    active: { label: "Đang tuyển", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500 animate-pulse" },
    closed: { label: "Đã đóng", color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400", dot: "bg-slate-400" },
    draft: { label: "Nháp", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" },
};

export default function HRDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "jobs" | "workers">("overview");
    const [selectedJob, setSelectedJob] = useState<UiJob | null>(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [jobPosts, setJobPosts] = useState<UiJob[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [jobToClose, setJobToClose] = useState<UiJob | null>(null);
    const [closingJobId, setClosingJobId] = useState<string | null>(null);
    const [refreshJobs, setRefreshJobs] = useState(0);
    const [applicantsByJob, setApplicantsByJob] = useState<Record<string, UiApplicant[]>>({});
    const [loadingApplicants, setLoadingApplicants] = useState<Record<string, boolean>>({});
    const [activePackage, setActivePackage] = useState<ActivePackage | null>(null);
    const [hiredWorkers, setHiredWorkers] = useState<{ id: string; jobTitle: string; workerName: string; status: string; rating: number | null; startDate?: string; endDate?: string }[]>([]);
    const [loadingHiredWorkers, setLoadingHiredWorkers] = useState(false);
    const [dashboardStats, setDashboardStats] = useState<{ totalJobs: number; activeJobs: number; closedJobs: number; totalHired: number } | null>(null);
    const [activityLast7Days, setActivityLast7Days] = useState<{ date: string; dayLabel: string; jobsCreated: number; applications: number }[]>([]);
    const [loadingDashboard, setLoadingDashboard] = useState(true);

    const formatSalary = (salary: any) => {
        if (!salary?.amount) return "Thỏa thuận";
        const unit = salary.unit === "day" ? "ngày" : salary.unit === "month" ? "tháng" : salary.unit === "hour" ? "giờ" : "dự án";
        const amount = Number(salary.amount);
        const pretty = new Intl.NumberFormat("vi-VN").format(amount) + "VNĐ";
        return `${pretty}/${unit}`;
    };

    const mapStatus = (status: string): UiJob["status"] => {
        if (status === "APPROVED") return "active";
        if (status === "DRAFT" || status === "PENDING" || status === "REJECTED") return "draft";
        return "closed";
    };

    const packageAccentClass =
        activePackage?.priorityLevel === 2
            ? "from-amber-500/15 to-orange-500/10 border-amber-300/50 dark:border-amber-700/50"
            : activePackage?.priorityLevel === 1
                ? "from-sky-500/15 to-indigo-500/10 border-primary/30 dark:border-primary/30"
                : "from-slate-200/60 to-slate-100/60 border-slate-200 dark:from-slate-800/80 dark:to-slate-900/80 dark:border-slate-700";

    const packageIcon =
        activePackage?.priorityLevel === 2 ? "diamond" : activePackage?.priorityLevel === 1 ? "workspace_premium" : "inventory_2";

    const loadHiredWorkers = React.useCallback(async () => {
        setLoadingHiredWorkers(true);
        try {
            const res = await api.get("/api/hr/workers");
            if (res.data.success && Array.isArray(res.data.data)) {
                const list = res.data.data.map((w: any) => ({
                    id: w.id,
                    jobTitle: w.jobTitle || "—",
                    workerName: w.workerName || "—",
                    status: w.status === "COMPLETED" ? "Hoàn thành" : w.status === "COMPLETION_PENDING" ? "Chờ xác nhận hoàn thành" : "Đang làm",
                    rating: typeof w.rating === "number" ? w.rating : null,
                    startDate: w.startDate,
                    endDate: w.endDate,
                }));
                setHiredWorkers(list);
            } else {
                setHiredWorkers([]);
            }
        } catch (err) {
            console.error("Failed to load hired workers", err);
            setHiredWorkers([]);
        } finally {
            setLoadingHiredWorkers(false);
        }
    }, []);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoadingDashboard(true);
            try {
                const res = await api.get("/api/hr/dashboard");
                if (res.data?.success && res.data?.data) {
                    setDashboardStats(res.data.data.stats ?? null);
                    setActivityLast7Days(Array.isArray(res.data.data.activityLast7Days) ? res.data.data.activityLast7Days : []);
                }
            } catch (_err) {
                setDashboardStats(null);
                setActivityLast7Days([]);
            } finally {
                setLoadingDashboard(false);
            }
        };
        loadDashboard();
    }, []);

    const loadJobs = React.useCallback(async () => {
        setLoadingJobs(true);
        try {
            const res = await api.get("/api/hr/jobs");
            if (res.data.success) {
                const mapped: UiJob[] = (res.data.data || []).map((j: any) => ({
                    id: j._id,
                    title: j.title,
                    status: mapStatus(j.status),
                    applicants: j.applicantsCount || 0,
                    needed: j.workersNeeded || 0,
                    accepted: j.workersHired || 0,
                    location: j.location?.province || "Việt Nam",
                    salary: formatSalary(j.salary),
                    startDate: j.startDate ? new Date(j.startDate).toLocaleDateString("vi-VN") : "—",
                    urgent: false,
                    views: 0,
                    skill: Array.isArray(j.skills) && j.skills.length > 0 ? j.skills[0] : undefined,
                }));
                setJobPosts(mapped);
            }
        } catch (err) {
            console.error("Failed to load HR jobs", err);
        } finally {
            setLoadingJobs(false);
        }
    }, []);

    useEffect(() => {
        loadJobs();
    }, [loadJobs, refreshJobs]);

    const handleCloseJob = async () => {
        if (!jobToClose) return;
        setClosingJobId(jobToClose.id);
        try {
            await api.put(`/api/jobs/${jobToClose.id}/close`);
            setJobToClose(null);
            setSelectedJob((prev) => (prev?.id === jobToClose.id ? null : prev));
            setRefreshJobs((r) => r + 1);
        } catch (err: any) {
            console.error("Close job failed", err);
            alert(err?.response?.data?.message || "Không thể đóng tin. Thử lại sau.");
        } finally {
            setClosingJobId(null);
        }
    };

    useEffect(() => {
        if (activeTab === "workers") loadHiredWorkers();
    }, [activeTab, loadHiredWorkers]);

    useEffect(() => {
        const loadPackage = async () => {
            try {
                const res = await api.get("/api/payments/my-package");
                setActivePackage(res.data?.data || null);
            } catch {
                setActivePackage(null);
            }
        };

        loadPackage();
        window.addEventListener("packageUpdated", loadPackage);
        return () => window.removeEventListener("packageUpdated", loadPackage);
    }, []);

    const loadApplicants = async (jobId: string) => {
        if (loadingApplicants[jobId]) return;
        setLoadingApplicants((p) => ({ ...p, [jobId]: true }));
        try {
            const res = await api.get(`/api/jobs/${jobId}/applicants`);
            if (res.data.success) {
                const mapped: UiApplicant[] = (res.data.data || []).map((a: any) => {
                    const w = a.workerId;
                    const name = w ? `${w.firstName} ${w.lastName}` : "Ứng viên";
                    const initials = name.split(" ").slice(0, 2).map((x: string) => x.charAt(0)).join("").toUpperCase();
                    const rawStatus = a.status;
                    const status: UiApplicant["status"] =
                        rawStatus === "APPLIED" ? "pending" :
                            rawStatus === "ACCEPTED" ? "accepted" :
                                rawStatus === "REJECTED" ? "rejected" :
                                    rawStatus === "HIRED" || rawStatus === "COMPLETION_PENDING" ? "hired" :
                                        "completed";
                    return {
                        id: a._id,
                        name,
                        skill: Array.isArray(w?.skills) && w.skills.length ? w.skills[0] : undefined,
                        experience: w?.experienceYears ? Number(w.experienceYears) : undefined,
                        rating: (() => { const r = Number(a.workerRating); return !Number.isNaN(r) && r > 0 ? r : undefined; })(),
                        status,
                        initials,
                        rawStatus,
                        hasHrReviewed: !!a.hasHrReviewed,
                    };
                });
                setApplicantsByJob((p) => ({ ...p, [jobId]: mapped }));
            }
        } catch (err) {
            console.error("Failed to load applicants", err);
        } finally {
            setLoadingApplicants((p) => ({ ...p, [jobId]: false }));
        }
    };

    const updateApplicant = (jobId: string, applicationId: string, updater: (a: UiApplicant) => UiApplicant) => {
        setApplicantsByJob((prev) => ({
            ...prev,
            [jobId]: (prev[jobId] || []).map((a) => (a.id === applicationId ? updater(a) : a)),
        }));
    };

    const acceptReject = async (jobId: string, applicationId: string, action: "accept" | "reject") => {
        try {
            await api.put(`/api/jobs/${jobId}/applicants/${applicationId}`, { action });
            if (action === "reject") {
                setApplicantsByJob((prev) => ({
                    ...prev,
                    [jobId]: (prev[jobId] || []).filter((a) => a.id !== applicationId),
                }));
                setJobPosts((prev) =>
                    prev.map((j) =>
                        j.id === jobId ? { ...j, applicants: Math.max(0, j.applicants - 1) } : j
                    )
                );
            } else {
                updateApplicant(jobId, applicationId, (a) => ({
                    ...a,
                    rawStatus: "ACCEPTED",
                    status: "accepted",
                }));
            }
        } catch (err) {
            console.error("Failed to update applicant", err);
        }
    };

    const confirmHire = async (jobId: string, applicationId: string) => {
        try {
            await api.put(`/api/jobs/${jobId}/applicants/${applicationId}/confirm-hire`);
            updateApplicant(jobId, applicationId, (a) => ({ ...a, rawStatus: "HIRED", status: "hired" }));
            // Refresh jobs list counts
            const res = await api.get("/api/hr/jobs");
            if (res.data.success) {
                const mapped: UiJob[] = (res.data.data || []).map((j: any) => ({
                    id: j._id,
                    title: j.title,
                    status: mapStatus(j.status),
                    applicants: j.applicantsCount || 0,
                    needed: j.workersNeeded || 0,
                    accepted: j.workersHired || 0,
                    location: j.location?.province || "Việt Nam",
                    salary: formatSalary(j.salary),
                    startDate: j.startDate ? new Date(j.startDate).toLocaleDateString("vi-VN") : "—",
                    urgent: false,
                    views: 0,
                    skill: Array.isArray(j.skills) && j.skills.length > 0 ? j.skills[0] : undefined,
                }));
                setJobPosts(mapped);
            }
        } catch (err) {
            console.error("Failed to confirm hire", err);
        }
    };

    const [confirmCompleteKey, setConfirmCompleteKey] = useState<string | null>(null);
    const confirmComplete = async (jobId: string, applicationId: string) => {
        const key = `${jobId}-${applicationId}`;
        setConfirmCompleteKey(key);
        try {
            await api.put(`/api/jobs/${jobId}/applicants/${applicationId}/confirm-complete`);
            await loadApplicants(jobId);
        } catch (err) {
            console.error("Failed to confirm complete", err);
        } finally {
            setConfirmCompleteKey(null);
        }
    };

    // CV modal (HR xem CV ứng viên)
    const [cvModal, setCvModal] = useState<{ jobId: string; applicationId: string; applicantName: string } | null>(null);
    const [cvModalData, setCvModalData] = useState<{ cv: any; worker: any } | null>(null);
    const [cvModalLoading, setCvModalLoading] = useState(false);
    const [cvModalError, setCvModalError] = useState<string | null>(null);

    // Review worker modal (HR rates worker after completed job)
    const [reviewModalApplicant, setReviewModalApplicant] = useState<{ ap: UiApplicant; jobId: string; jobTitle: string } | null>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const submitWorkerReview = async () => {
        if (!reviewModalApplicant) return;
        setReviewSubmitting(true);
        setReviewError("");
        try {
            await api.post("/api/reviews", {
                applicationId: reviewModalApplicant.ap.id,
                rating: reviewRating,
                comment: reviewComment.trim() || undefined,
            });
            updateApplicant(reviewModalApplicant.jobId, reviewModalApplicant.ap.id, (a) => ({ ...a, hasHrReviewed: true, rating: reviewRating }));
            setReviewModalApplicant(null);
            await loadApplicants(reviewModalApplicant.jobId);
            setReviewRating(5);
            setReviewComment("");
        } catch (err: any) {
            setReviewError(err?.response?.data?.message || "Gửi đánh giá thất bại.");
        } finally {
            setReviewSubmitting(false);
        }
    };

    // Load CV when HR mở modal Xem CV
    useEffect(() => {
        if (!cvModal) {
            setCvModalData(null);
            setCvModalError(null);
            return;
        }
        setCvModalLoading(true);
        setCvModalData(null);
        setCvModalError(null);
        api.get(`/api/jobs/${cvModal.jobId}/applicants/${cvModal.applicationId}/cv`)
            .then((res) => {
                if (res.data?.success) setCvModalData(res.data.data || null);
            })
            .catch((err: any) => {
                setCvModalData(null);
                setCvModalError(err?.response?.data?.message || "Không tải được CV. Vui lòng thử lại.");
            })
            .finally(() => setCvModalLoading(false));
    }, [cvModal]);

    const filteredJobs = useMemo(() => {
        if (filterStatus === "all") return jobPosts;
        return jobPosts.filter((j) => j.status === filterStatus);
    }, [filterStatus, jobPosts]);

    const STATS = useMemo(() => {
        const s = dashboardStats ?? {
            totalJobs: jobPosts.length,
            activeJobs: jobPosts.filter((j) => j.status === "active").length,
            closedJobs: jobPosts.filter((j) => j.status === "closed").length,
            totalHired: jobPosts.reduce((sum, j) => sum + j.accepted, 0),
        };
        return STATS_CONFIG.map((c) => ({
            ...c,
            value: String(s[c.key]),
        }));
    }, [dashboardStats, jobPosts]);

    const activityChartData: { date?: string; dayLabel: string; jobsCreated: number; applications: number }[] =
        activityLast7Days.length > 0
            ? activityLast7Days
            : [
                { date: "fallback-0", dayLabel: "T2", jobsCreated: 0, applications: 0 },
                { date: "fallback-1", dayLabel: "T3", jobsCreated: 0, applications: 0 },
                { date: "fallback-2", dayLabel: "T4", jobsCreated: 0, applications: 0 },
                { date: "fallback-3", dayLabel: "T5", jobsCreated: 0, applications: 0 },
                { date: "fallback-4", dayLabel: "T6", jobsCreated: 0, applications: 0 },
                { date: "fallback-5", dayLabel: "T7", jobsCreated: 0, applications: 0 },
                { date: "fallback-6", dayLabel: "CN", jobsCreated: 0, applications: 0 },
            ];
    const maxViews = Math.max(1, ...activityChartData.map((d) => d.jobsCreated));
    const maxApps = Math.max(1, ...activityChartData.map((d) => d.applications));

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-24 pb-24 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">HR Portal</p>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Tuyển dụng</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Coteccons Construction • Đà Nẵng</p>
                        </div>
                        <div className="flex gap-3">
                            <a href="/post-job" className="h-14 px-8 bg-primary text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-xl">add</span>
                                Đăng tin mới
                            </a>
                            <Link
                                href="/hr-dashboard/packages"
                                className="h-14 px-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined text-xl text-amber-500">workspace_premium</span>
                                Gói dịch vụ
                            </Link>
                            <button className="h-14 w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-slate-500 text-2xl">notifications</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {activePackage && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-8 rounded-[2rem] border bg-gradient-to-r ${packageAccentClass} p-6 shadow-sm`}
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-slate-900 shadow-sm dark:bg-slate-900/80 dark:text-white">
                                    <span className="material-symbols-outlined text-3xl text-amber-500">
                                        {packageIcon}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                                        Gói đang sử dụng
                                    </p>
                                    <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                                        {activePackage.packageName}
                                    </h2>
                                    <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                                        Đã dùng {activePackage.jobPostUsed}/{activePackage.jobPostLimit === -1 ? "∞" : activePackage.jobPostLimit} lượt đăng
                                        {" "}• Hết hạn {new Date(activePackage.expiresAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="min-w-[180px]">
                                    <div className="mb-2 flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        <span>Quota</span>
                                        <span>
                                            {activePackage.jobPostLimit === -1
                                                ? "Unlimited"
                                                : `${Math.max(0, activePackage.jobPostLimit - activePackage.jobPostUsed)} còn lại`}
                                        </span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-white/70 dark:bg-slate-900/70">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500"
                                            style={{
                                                width:
                                                    activePackage.jobPostLimit === -1
                                                        ? "100%"
                                                        : `${Math.min(100, (activePackage.jobPostUsed / Math.max(activePackage.jobPostLimit, 1)) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <Link
                                    href="/hr-dashboard/packages"
                                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-800 shadow-sm transition-colors hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                >
                                    <span className="material-symbols-outlined text-base">tune</span>
                                    Quản lý gói
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 w-fit">
                    {[
                        { id: "overview", label: "Tổng quan", icon: "dashboard" },
                        { id: "jobs", label: "Tin tuyển dụng", icon: "work" },
                        { id: "workers", label: "Lao động", icon: "people" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${activeTab === tab.id
                                ? "bg-primary text-white shadow-md shadow-primary/30"
                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {STATS.map((stat, i) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        className={`bg-gradient-to-br ${stat.bg} border ${stat.border} rounded-[2rem] p-6 flex flex-col gap-4`}
                                    >
                                        <div className={`w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm`}>
                                            <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                                        </div>
                                        <div>
                                            <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Recent activity */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Hoạt động 7 ngày qua</h2>
                                        {!loadingDashboard && activityLast7Days.length > 0 && (
                                            <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full">
                                                Dự án &amp; ứng tuyển
                                            </span>
                                        )}
                                    </div>
                                    {loadingDashboard ? (
                                        <div className="flex items-center justify-center h-32">
                                            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-end gap-3 h-32">
                                                {activityChartData.map((d, i) => {
                                                    const dayLabel = d.dayLabel;
                                                    const jobsCreated = d.jobsCreated ?? 0;
                                                    const applications = d.applications ?? 0;
                                                    const h1 = maxViews > 0 ? (jobsCreated / maxViews) * 80 : 0;
                                                    const h2 = maxApps > 0 ? (applications / maxApps) * 80 : 0;
                                                    return (
                                                        <div key={d.date ?? `day-${i}`} className="flex-1 flex flex-col items-center gap-1">
                                                            <div className="w-full flex flex-col items-center gap-1">
                                                                <motion.div
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${Math.max(h1, 4)}px` }}
                                                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                                                    className="w-full bg-primary/30 rounded-t-lg relative min-h-[4px]"
                                                                >
                                                                    <motion.div
                                                                        initial={{ height: 0 }}
                                                                        animate={{ height: `${Math.max(h2, 4)}px` }}
                                                                        transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                                                                        className="absolute bottom-0 w-full bg-primary rounded-t-lg min-h-[4px]"
                                                                    />
                                                                </motion.div>
                                                            </div>
                                                            <p className="text-[10px] font-black text-slate-400">{dayLabel}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex items-center gap-6 mt-4">
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/30" /><span className="text-xs font-bold text-slate-400">Tin đăng mới</span></div>
                                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" /><span className="text-xs font-bold text-slate-400">Lượt ứng tuyển</span></div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Skill demand */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Ngành nghề cần nhất</h2>
                                    <div className="space-y-5">
                                        {[
                                            { skill: "Thợ điện", pct: 35, color: "#f59e0b" },
                                            { skill: "Thợ xây", pct: 28, color: "#3b82f6" },
                                            { skill: "Thợ hàn", pct: 20, color: "#ef4444" },
                                            { skill: "Kỹ sư", pct: 17, color: "#10b981" },
                                        ].map(({ skill, pct, color }) => (
                                            <div key={skill}>
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{skill}</span>
                                                    <span className="text-sm font-black" style={{ color }}>{pct}%</span>
                                                </div>
                                                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                        className="h-full rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Job posts */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Tin tuyển dụng gần đây</h2>
                                    <button onClick={() => setActiveTab("jobs")} className="text-primary font-black text-sm hover:underline">Xem tất cả →</button>
                                </div>
                                <div className="space-y-4">
                                    {jobPosts.slice(0, 3).map(job => {
                                        const cfg = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
                                        return (
                                            <div key={job.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                                onClick={() => { setSelectedJob(job); setActiveTab("jobs"); }}
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-primary text-2xl">engineering</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-slate-900 dark:text-white text-sm">{job.title}</p>
                                                    <p className="text-xs text-slate-400 font-bold">{job.location} • {job.salary}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-black ${cfg.color}`}>{cfg.label}</span>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">{job.applicants} ứng tuyển</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* JOBS TAB */}
                    {activeTab === "jobs" && (
                        <motion.div key="jobs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {/* Filter */}
                            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                                {["all", "active", "closed", "draft"].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${filterStatus === s ? "bg-primary text-white" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        {s === "all" ? "Tất cả" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Left List: Job Postings */}
                                <div className="w-full lg:w-[45%] flex flex-col gap-5 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loadingJobs ? (
                                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 border-2 border-slate-100 dark:border-slate-800 flex justify-center py-12">
                                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                                        </div>
                                    ) : filteredJobs.map((job, idx) => {
                                        const cfg = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
                                        const progress = Math.round((job.accepted / job.needed) * 100);
                                        const isSelected = selectedJob?.id === job.id;

                                        return (
                                            <motion.div
                                                key={job.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => {
                                                    const next = isSelected ? null : job;
                                                    setSelectedJob(next);
                                                    if (next) loadApplicants(next.id);
                                                }}
                                                className={`bg-white dark:bg-slate-900 rounded-[2rem] p-6 border-2 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden ${isSelected ? "border-primary shadow-xl ring-4 ring-primary/10" : "border-slate-100 dark:border-slate-800"}`}
                                            >
                                                {/* Selected Indicator line */}
                                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}

                                                <div className="flex items-start justify-between mb-4 pl-1">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {job.urgent && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full animate-pulse uppercase tracking-wider">Gấp</span>}
                                                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest font-black ${cfg.color} flex items-center gap-1.5`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                                {cfg.label}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight mb-1 pr-4">{job.title}</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold truncate">📍 {job.location} • 💰 {job.salary}</p>
                                                    </div>
                                                    <div className="text-right shrink-0 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center min-w-[70px]">
                                                        <p className="text-2xl font-black text-primary leading-none">{job.applicants}</p>
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Ứng viên</p>
                                                    </div>
                                                </div>

                                                {/* Progress */}
                                                <div className="mb-4 pl-1">
                                                    <div className="flex justify-between mb-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                        <span>Tiến độ</span>
                                                        <span className="text-primary">{job.accepted}/{job.needed}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 pl-1">
                                                    <span>👁 {job.views} lượt xem</span>
                                                    <div className="flex gap-3 ml-auto opacity-70 hover:opacity-100 transition-opacity">
                                                        {job.status === "draft" && (
                                                            <button type="button" className="text-primary hover:underline" onClick={(e) => { e.stopPropagation(); router.push(`/post-job?edit=${job.id}`); }}>
                                                                Sửa
                                                            </button>
                                                        )}
                                                        {job.status !== "closed" && (
                                                            <button type="button" className="text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); setJobToClose(job); }}>
                                                                Đóng
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Right Detail: Applicant Panel */}
                                <div className="w-full lg:w-[55%] sticky top-24">
                                    {selectedJob ? (
                                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl min-h-[600px] flex flex-col">
                                            <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">Danh sách Ứng viên</h2>
                                                <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]">work</span>
                                                    {selectedJob.title}
                                                </p>
                                            </div>

                                            <div className="flex-1">
                                                {loadingApplicants[selectedJob.id] ? (
                                                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-4">
                                                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                                                        <p className="text-sm font-bold text-slate-400">Đang tải hồ sơ...</p>
                                                    </div>
                                                ) : (applicantsByJob[selectedJob.id] || []).length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-3">
                                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                                            <span className="material-symbols-outlined text-4xl">inbox</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-500">Dự án này chưa có ứng viên nào.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                                        {(applicantsByJob[selectedJob.id] || []).map(ap => (
                                                            <div key={ap.id} className="flex flex-col p-5 rounded-[1.5rem] bg-[#fcfdff] dark:bg-[#121212] border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-md gap-4">
                                                                {/* Applicant Info */}
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner flex items-center justify-center text-white font-black text-lg">
                                                                        {ap.initials}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                                            <p className="font-black text-lg text-slate-900 dark:text-white truncate">{ap.name}</p>
                                                                            {/* Status Badge inline */}
                                                                            {ap.rawStatus === "APPLIED" ? (
                                                                                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">Chờ duyệt</span>
                                                                            ) : ap.rawStatus === "ACCEPTED" || ap.rawStatus === "HIRED" ? (
                                                                                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span> {ap.rawStatus}</span>
                                                                            ) : ap.rawStatus === "REJECTED" ? (
                                                                                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-100 text-red-700">Đã từ chối</span>
                                                                            ) : (
                                                                                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">{ap.rawStatus}</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-slate-500 font-bold flex items-center gap-2 truncate">
                                                                            <span className="material-symbols-outlined text-[14px]">psychology</span> {ap.skill || "Chưa cập nhật KN"}
                                                                            {ap.experience && <span>• {ap.experience} năm KN</span>}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Action Buttons uniformly sized */}
                                                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); setCvModal({ jobId: selectedJob.id, applicationId: ap.id, applicantName: ap.name }); }}
                                                                        className="h-10 px-5 rounded-xl text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[18px]">description</span>
                                                                        Xem CV
                                                                    </button>

                                                                    {ap.rawStatus === "APPLIED" && (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); acceptReject(selectedJob.id, ap.id, "accept"); }}
                                                                                className="h-10 px-5 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                                                Chấp nhận
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); acceptReject(selectedJob.id, ap.id, "reject"); }}
                                                                                className="h-10 px-5 rounded-xl text-xs font-black bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center gap-2"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                                                                Từ chối
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    {ap.rawStatus === "ACCEPTED" && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); confirmHire(selectedJob.id, ap.id); }}
                                                                            className="h-10 flex-1 min-w-[140px] rounded-xl text-xs font-black bg-indigo-500 text-white hover:bg-indigo-600 shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2"
                                                                        >
                                                                            Xác nhận Thuê ngay
                                                                        </button>
                                                                    )}

                                                                    {ap.rawStatus === "COMPLETION_PENDING" && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); confirmComplete(selectedJob.id, ap.id); }}
                                                                            disabled={confirmCompleteKey === `${selectedJob.id}-${ap.id}`}
                                                                            className="h-10 px-5 rounded-xl text-xs font-black bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                                        >
                                                                            {confirmCompleteKey === `${selectedJob.id}-${ap.id}` ? (
                                                                                <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Đang xử lý...</>
                                                                            ) : (
                                                                                <><span className="material-symbols-outlined text-[18px]">star</span> Xác nhận Hoàn thành</>
                                                                            )}
                                                                        </button>
                                                                    )}

                                                                    {ap.rawStatus === "COMPLETED" && !ap.hasHrReviewed && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setReviewModalApplicant({ ap, jobId: selectedJob.id, jobTitle: selectedJob.title });
                                                                                setReviewRating(5);
                                                                                setReviewComment("");
                                                                                setReviewError("");
                                                                            }}
                                                                            className="h-10 px-5 rounded-xl text-xs font-black bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                                                                        >
                                                                            <span className="material-symbols-outlined text-[18px]">rate_review</span> Đánh giá Worker
                                                                        </button>
                                                                    )}

                                                                    {ap.rawStatus === "COMPLETED" && ap.hasHrReviewed && (
                                                                        <span className="h-10 px-4 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-500 flex items-center justify-center gap-2">
                                                                            Đã đánh giá
                                                                            {Number(ap.rating) > 0 && <span className="text-amber-500 font-black tracking-widest bg-amber-50 px-2 py-0.5 rounded">⭐ {Number(ap.rating).toFixed(1)}</span>}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-[600px] p-6">
                                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-6">
                                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">work_history</span>
                                            </div>
                                            <h2 className="text-xl font-black text-slate-600 dark:text-slate-300 mb-2">Chưa chọn Tin tuyển dụng</h2>
                                            <p className="text-sm font-bold text-slate-400 max-w-sm">
                                                Nhấp vào một dự án bên trái để hiển thị Bảng điều khiển Ứng viên tại đây.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* WORKERS TAB */}
                    {activeTab === "workers" && (
                        <motion.div key="workers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Lao động đã thuê</h2>
                                {loadingHiredWorkers ? (
                                    <div className="flex items-center gap-3 text-slate-500 font-bold py-8">
                                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                                        Đang tải...
                                    </div>
                                ) : hiredWorkers.length === 0 ? (
                                    <p className="text-slate-500 font-bold py-8">Chưa có lao động nào trong danh sách đã thuê.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {hiredWorkers.map((w) => {
                                            const initials = w.workerName.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase() || "—";
                                            const period = [w.startDate, w.endDate].filter(Boolean).map((d) => new Date(d as string).toLocaleDateString("vi-VN")).join(" – ") || "—";
                                            return (
                                                <div key={w.id} className="flex items-center gap-4 p-5 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-black text-lg">
                                                        {initials}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-black text-slate-900 dark:text-white">{w.workerName}</p>
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-bold">{w.jobTitle} {period !== "—" ? `• ${period}` : ""}</p>
                                                    </div>
                                                    <div className="text-right space-y-1">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${w.status === "Đang làm" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : w.status === "Hoàn thành" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                                                            {w.status}
                                                        </span>
                                                        {typeof w.rating === "number" && w.rating > 0 ? (
                                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">⭐ {w.rating.toFixed(1)}</p>
                                                        ) : (
                                                            <p className="text-xs text-slate-400 font-bold">Chưa đánh giá</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal: Xem CV ứng viên */}
            {cvModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setCvModal(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">CV — {cvModal.applicantName}</h3>
                            <button type="button" onClick={() => setCvModal(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            {cvModalLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
                                </div>
                            ) : cvModalData?.cv || cvModalData?.worker ? (
                                (() => {
                                    const data = cvModalData.cv || {
                                        personalInfo: {
                                            name: `${cvModalData.worker.firstName || ""} ${cvModalData.worker.lastName || ""}`.trim() || "Ứng viên",
                                            title: "",
                                            email: cvModalData.worker.email,
                                            phone: cvModalData.worker.phone,
                                            address: cvModalData.worker.preferredLocationCity,
                                        },
                                        summary: cvModalData.worker.expectedSalary ? `Mức lương mong muốn: ${Number(cvModalData.worker.expectedSalary).toLocaleString("vi-VN")} VNĐ/Tháng.` : "",
                                        experiences: [],
                                        education: [],
                                        skills: cvModalData.worker.skills || []
                                    };

                                    const avatarInitials = data.personalInfo.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "CV";

                                    return (
                                        <div className="bg-white dark:bg-[#121212] rounded-[1.5rem] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-10 shadow-sm max-w-[210mm] mx-auto w-full">
                                            {/* Header */}
                                            <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start border-b-2 border-slate-900 dark:border-slate-800 pb-8 mb-8 gap-6">
                                                <div className="flex-1 pr-4">
                                                    <h2 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tighter" style={{ fontFamily: "Inter, sans-serif" }}>
                                                        {data.personalInfo.name}
                                                    </h2>
                                                    {data.personalInfo.title && (
                                                        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest font-bold">
                                                            {data.personalInfo.title}
                                                        </p>
                                                    )}
                                                    <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                        {data.personalInfo.email && (
                                                            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">mail</span> {data.personalInfo.email}</div>
                                                        )}
                                                        {data.personalInfo.phone && (
                                                            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">call</span> {data.personalInfo.phone}</div>
                                                        )}
                                                        {data.personalInfo.address && (
                                                            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span> {data.personalInfo.address}</div>
                                                        )}
                                                        {data.personalInfo.website && (
                                                            <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-slate-400">language</span> {data.personalInfo.website}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-lg border-4 border-white dark:border-[#121212]">
                                                    {data.personalInfo.avatar ? (
                                                        <img src={data.personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        avatarInitials
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                                {/* Main Column */}
                                                <div className="md:col-span-2 space-y-10 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-10 md:pb-0 md:pr-10">
                                                    {data.summary && (
                                                        <div>
                                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                                                                Mục tiêu nghề nghiệp
                                                            </h3>
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-[1.8] text-justify whitespace-pre-wrap">
                                                                {data.summary}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {data.experiences?.length > 0 && (
                                                        <div>
                                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-slate-400">work</span>
                                                                Kinh nghiệm làm việc
                                                            </h3>
                                                            <div className="space-y-6">
                                                                {data.experiences.map((exp: any, i: number) => (
                                                                    <div key={i} className="relative">
                                                                        <div className="flex flex-wrap justify-between items-baseline mb-1">
                                                                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mr-2">{exp.role}</h4>
                                                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right shrink-0">{exp.duration}</span>
                                                                        </div>
                                                                        <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-2">{exp.company}</p>
                                                                        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-wrap">
                                                                            {exp.description}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Sidebar Column */}
                                                <div className="space-y-10 pl-0 md:pl-2">
                                                    {data.education?.length > 0 && (
                                                        <div>
                                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-slate-400">school</span>
                                                                Học vấn
                                                            </h3>
                                                            <div className="space-y-5">
                                                                {data.education.map((edu: any, i: number) => (
                                                                    <div key={i}>
                                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{edu.duration}</p>
                                                                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 leading-snug">{edu.degree}</h4>
                                                                        <p className="text-[12px] text-slate-500">{edu.school}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {data.skills?.length > 0 && (
                                                        <div>
                                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-[16px] text-slate-400">psychology</span>
                                                                Kỹ năng
                                                            </h3>
                                                            <ul className="list-disc list-inside space-y-2">
                                                                {data.skills.map((s: string, i: number) => (
                                                                    <li key={i} className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                                                                        {s}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="text-center py-8 space-y-3">
                                    <p className="text-slate-500">{cvModalError || "Không tải được CV hoặc ứng viên chưa có thông tin."}</p>
                                    <button
                                        type="button"
                                        onClick={() => setCvModal((prev) => (prev ? { ...prev } : prev))}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">refresh</span>
                                        Thử lại
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Xác nhận đóng tin */}
            {jobToClose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !closingJobId && setJobToClose(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Đóng tin tuyển dụng</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Bạn có chắc muốn đóng tin &quot;{jobToClose.title}&quot;? Tin đã đóng sẽ không còn hiển thị cho ứng viên.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setJobToClose(null)}
                                disabled={!!closingJobId}
                                className="px-4 py-2.5 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseJob}
                                disabled={!!closingJobId}
                                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-all"
                            >
                                {closingJobId ? "Đang xử lý..." : "Đóng tin"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Đánh giá Worker (HR) */}
            {reviewModalApplicant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !reviewSubmitting && setReviewModalApplicant(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Đánh giá người lao động</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            {reviewModalApplicant.jobTitle} — {reviewModalApplicant.ap.name}
                        </p>
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Điểm (1–5 sao)</p>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setReviewRating(n)}
                                        className={`w-10 h-10 rounded-full font-black text-sm transition-all ${reviewRating >= n ? "bg-amber-400 text-amber-900" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nhận xét (tùy chọn)</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Viết vài dòng về chất lượng công việc..."
                                className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none"
                            />
                        </div>
                        {reviewError && <p className="text-sm text-red-500 mb-3">{reviewError}</p>}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => !reviewSubmitting && setReviewModalApplicant(null)}
                                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={submitWorkerReview}
                                disabled={reviewSubmitting}
                                className="flex-1 py-2.5 rounded-xl font-bold bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
                            >
                                {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
