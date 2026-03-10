"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    MapPin, HardHat, BadgeCheck, CheckCircle2, TrendingUp,
    AlertTriangle, ChevronDown, ChevronUp, ExternalLink, ArrowLeft,
    Building2, Calendar, Clock, Shield, FileText, UploadCloud,
    Briefcase, MessageSquare, ChevronRight, Lock, Trash2,
    FileImage, FileSpreadsheet, File, Settings, AlertCircle, Bookmark,
    ClipboardList, Timer, Star as StarIcon, Circle, CheckCircle, CreditCard,
    Users, Zap, Award, ArrowRight, Eye, EyeOff, X,
} from "lucide-react";
import api from "@/utils/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentStatus = "on_time" | "late_minor" | "late_major" | "no_data";
type ProjectStatus = "completed" | "ongoing" | "cancelled";
type BadgeType = "verified_mst" | "verified_address" | "payment_good" | "hr_outstanding" | "no_violations";

interface WorkerType { type: string; count: number; }

interface Project {
    id: string;
    name: string;
    district: string;
    city: string;
    startDate: string;
    endDate?: string;
    status: ProjectStatus;
    workerTypes: WorkerType[];
    paymentStatus: "on_time" | "late" | "partial";
    rating: number;
    reviewSnippet?: string;
}

interface Review {
    id: string;
    workerType: string;
    projectName: string;
    date: string;
    rating: number;
    content: string;
    verified?: boolean;
}

interface Warning { type: "red" | "amber"; message: string; }

interface CertFile {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
}

interface HRProfile {
    id: string;
    name: string;
    logo?: string;
    initials: string;
    verified: boolean;
    verifiedMST: boolean;
    verifiedAddress: boolean;
    joinedDate: string;
    location: string;
    industryType: string;
    description: string;
    stats: {
        totalProjects: number;
        completedProjects: number;
        cancelledProjects: number;
        ongoingProjects: number;
        totalWorkers: number;
        completionRate: number;
        avgRating: number;
        totalReviews: number;
        onTimePaymentRate: number;
    };
    paymentHistory: PaymentStatus[];
    badges: BadgeType[];
    ratingBreakdown: { payment: number; communication: number; environment: number; transparency: number; };
    projects: Project[];
    reviews: Review[];
    activeJobs: any[];
    warnings: Warning[];
    certFiles?: CertFile[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_HR: HRProfile = {
    id: "hr_001",
    name: "Tập đoàn Hạ tầng Mainland",
    logo: undefined,
    initials: "ML",
    verified: true,
    verifiedMST: true,
    verifiedAddress: true,
    joinedDate: "2022-03-15",
    location: "Quận 1, TP.HCM",
    industryType: "Xây dựng dân dụng & công nghiệp",
    description: "Chuyên thi công các công trình dân dụng, công nghiệp tại khu vực TP.HCM và các tỉnh lân cận. Đội ngũ kỹ sư và công nhân lành nghề với hơn 3 năm kinh nghiệm.",
    stats: {
        totalProjects: 47, completedProjects: 44, cancelledProjects: 2,
        ongoingProjects: 3, totalWorkers: 312, completionRate: 94,
        avgRating: 4.8, totalReviews: 47, onTimePaymentRate: 98,
    },
    paymentHistory: [
        "on_time", "on_time", "on_time", "late_minor", "on_time",
        "on_time", "on_time", "on_time", "late_major", "on_time", "on_time", "on_time"
    ],
    badges: ["verified_mst", "verified_address", "payment_good", "no_violations"],
    ratingBreakdown: { payment: 4.9, communication: 4.6, environment: 4.8, transparency: 4.3 },
    projects: [
        {
            id: "p1", name: "Tòa nhà văn phòng Him Lam", district: "Quận 7", city: "TP.HCM",
            startDate: "2024-01", endDate: "2024-08", status: "completed",
            workerTypes: [{ type: "Thợ hàn", count: 5 }, { type: "Kỹ sư", count: 2 }, { type: "Công nhân", count: 12 }],
            paymentStatus: "on_time", rating: 4.9,
            reviewSnippet: "Chủ thầu uy tín, trả lương đúng ngày, môi trường an toàn.",
        },
        {
            id: "p2", name: "Khu dân cư Vinhomes Grand Park", district: "Quận 9", city: "TP.HCM",
            startDate: "2024-03", endDate: "2024-11", status: "completed",
            workerTypes: [{ type: "Thợ xây", count: 20 }, { type: "Kỹ sư", count: 3 }, { type: "Thợ điện", count: 6 }],
            paymentStatus: "on_time", rating: 4.7,
            reviewSnippet: "Làm việc chuyên nghiệp, trả lương đúng hạn, có bảo hiểm đầy đủ.",
        },
        {
            id: "p3", name: "Nhà máy KCN Đồng Nai Phase 2", district: "Huyện Nhơn Trạch", city: "Đồng Nai",
            startDate: "2025-01", status: "ongoing",
            workerTypes: [{ type: "Công nhân", count: 30 }, { type: "Kỹ sư", count: 4 }, { type: "Thợ hàn", count: 8 }],
            paymentStatus: "on_time", rating: 0,
        },
        {
            id: "p4", name: "Trung tâm thương mại Thủ Đức", district: "TP. Thủ Đức", city: "TP.HCM",
            startDate: "2023-06", endDate: "2024-01", status: "completed",
            workerTypes: [{ type: "Thợ mộc", count: 10 }, { type: "Thợ hoàn thiện", count: 15 }],
            paymentStatus: "late", rating: 4.5,
            reviewSnippet: "Thanh toán hơi trễ nhưng chất lượng quản lý tốt.",
        },
        {
            id: "p5", name: "Cầu vượt đường sắt Bình Dương", district: "Thành phố Thủ Dầu Một", city: "Bình Dương",
            startDate: "2022-09", endDate: "2023-03", status: "completed",
            workerTypes: [{ type: "Kỹ sư", count: 5 }, { type: "Công nhân", count: 25 }],
            paymentStatus: "on_time", rating: 4.8,
            reviewSnippet: "Công trình lớn nhưng quản lý rất có hệ thống. Đáng tin cậy.",
        },
    ],
    reviews: [
        { id: "r1", workerType: "Thợ hàn", projectName: "Tòa nhà Him Lam", date: "2024-08", rating: 5, verified: true, content: "Chủ thầu dễ làm việc, trả lương đúng ngày, môi trường an toàn. Sẽ làm lại lần sau." },
        { id: "r2", workerType: "Kỹ sư", projectName: "Vinhomes Grand Park", date: "2024-11", rating: 5, verified: true, content: "Môi trường làm việc chuyên nghiệp. Phúc lợi và bảo hiểm đầy đủ. Quản lý nhiệt tình." },
        { id: "r3", workerType: "Công nhân", projectName: "Trung tâm TM Thủ Đức", date: "2024-01", rating: 4, verified: true, content: "Có thanh toán hơi trễ 1 lần nhưng nhìn chung là ổn. An toàn lao động được chú trọng." },
        { id: "r4", workerType: "Thợ xây", projectName: "Vinhomes Grand Park", date: "2024-10", rating: 5, verified: false, content: "Công trình quy mô lớn, lương thỏa đáng. Công thầu chi trả đủ và đúng hạn." },
        { id: "r5", workerType: "Thợ điện", projectName: "Cầu vượt Bình Dương", date: "2023-03", rating: 5, verified: true, content: "Rất hài lòng. Nhà thầu uy tín, không nợ lương bao giờ. Kiến nghị bạn bè hợp tác." },
    ],
    activeJobs: [
        { id: "j1", title: "Thợ hàn công trình công nghiệp", location: "Đồng Nai", compensation: "450.000VNĐ/ngày", daysLeft: 5 },
        { id: "j2", title: "Kỹ sư hiện trường", location: "TP.HCM", compensation: "25.000.000VNĐ/tháng", daysLeft: 12 },
        { id: "j3", title: "Công nhân xây dựng phổ thông", location: "Đồng Nai", compensation: "350.000VNĐ/ngày", daysLeft: 8 },
    ],
    warnings: [],
    certFiles: [
        { id: "c1", name: "Giấy phép kinh doanh.pdf", url: "#", uploadedAt: "2024-01-15" },
        { id: "c2", name: "Chứng chỉ an toàn lao động.pdf", url: "#", uploadedAt: "2024-03-20" },
    ],
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function hashStringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 55%, 38%)`;
}

function getYearsActive(joinedDate: string): number {
    const now = new Date();
    const joined = new Date(joinedDate);
    return Math.floor((now.getTime() - joined.getTime()) / (365.25 * 24 * 3600 * 1000));
}

function parseMonthYear(dateStr: string): string {
    const [year, month] = dateStr.split("-");
    return `${month}/${year}`;
}

function getDuration(start: string, end?: string): string {
    if (!end) return "Đang thi công";
    const [sy, sm] = start.split("-").map(Number);
    const [ey, em] = end.split("-").map(Number);
    const months = (ey - sy) * 12 + (em - sm);
    return `${months} tháng`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={`hrp-skeleton ${className || ""}`} />;
}

function CountUpNumber({ target, suffix = "", duration = 1200 }: { target: number; suffix?: string; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const start = performance.now();
                const tick = (now: number) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(eased * target));
                    if (progress < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        }, { threshold: 0.4 });
        observer.observe(node);
        return () => observer.disconnect();
    }, [target, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
}

function StarRow({ rating }: { rating: number }) {
    const filled = Math.round(rating);
    return (
        <span style={{ display: "inline-flex", gap: 2 }}>
            {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} size={13} fill={i < filled ? "#F59E0B" : "none"} stroke={i < filled ? "#F59E0B" : "#cbd5e1"} />
            ))}
        </span>
    );
}

function AnimatedBar({ value, color = "var(--hr-emerald)" }: { value: number; color?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [animate, setAnimate] = useState(false);
    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnimate(true); obs.disconnect(); } }, { threshold: 0.3 });
        obs.observe(node);
        return () => obs.disconnect();
    }, []);
    return (
        <div ref={ref} className="hrp-bar-track">
            <div className="hrp-bar-fill" style={{ width: animate ? `${(value / 5) * 100}%` : "0%", background: color }} />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HRProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hrId = params?.id as string;
    const fromJobs = searchParams?.get("from") === "jobs";

    const [profile, setProfile] = useState<HRProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<"guest" | "worker" | "admin">("guest");
    const [isHROwner, setIsHROwner] = useState(false);

    const [projectFilter, setProjectFilter] = useState<"all" | ProjectStatus>("all");
    const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4" | "low" | "commented">("all");
    const [visibleProjects, setVisibleProjects] = useState(3);
    const [visibleReviews, setVisibleReviews] = useState(3);
    const [warningExpanded, setWarningExpanded] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("overview");

    const [certFiles, setCertFiles] = useState<CertFile[]>([]);
    const [uploadingCert, setUploadingCert] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeJobsRef = useRef<HTMLDivElement>(null);
    const overviewRef = useRef<HTMLDivElement>(null);
    const projectsRef = useRef<HTMLDivElement>(null);
    const reviewsRef = useRef<HTMLDivElement>(null);
    const jobsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");
            const userId = localStorage.getItem("userId");
            setIsLoggedIn(!!token);
            if (role === "ADMIN" || role === "SUPER_ADMIN") setUserRole("admin");
            else if (role === "HR" || role === "EMPLOYER" || role === "hr") {
                setUserRole("worker");
                if (userId && hrId && (userId === hrId || localStorage.getItem("hrId") === hrId)) setIsHROwner(true);
            } else if (token) setUserRole("worker");
            else setUserRole("guest");
        }
    }, [hrId]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/hr/${hrId}/profile`);
                if (res.data.success) {
                    setProfile(res.data.data);
                    setCertFiles(res.data.data.certFiles || []);
                } else throw new Error("not_found");
            } catch {
                setProfile(MOCK_HR);
                setCertFiles(MOCK_HR.certFiles || []);
            } finally {
                setLoading(false);
            }
        };
        if (hrId) load();
    }, [hrId]);

    const scrollToJobs = () => activeJobsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const filteredProjects = React.useMemo(() => {
        if (!profile) return [];
        if (projectFilter === "all") return profile.projects;
        return profile.projects.filter((p) => p.status === projectFilter);
    }, [profile, projectFilter]);

    const filteredReviews = React.useMemo(() => {
        if (!profile) return [];
        let r = [...profile.reviews];
        if (reviewFilter === "5") r = r.filter((x) => x.rating === 5);
        else if (reviewFilter === "4") r = r.filter((x) => x.rating === 4);
        else if (reviewFilter === "low") r = r.filter((x) => x.rating <= 3);
        else if (reviewFilter === "commented") r = r.filter((x) => x.content.length > 10);
        return r;
    }, [profile, reviewFilter]);

    const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCert(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post(`/api/hr/${hrId}/certifications`, formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.data.success) setCertFiles((prev) => [...prev, res.data.data]);
        } catch {
            setCertFiles((prev) => [...prev, { id: `c${Date.now()}`, name: file.name, url: "#", uploadedAt: new Date().toISOString().slice(0, 10) }]);
        } finally {
            setUploadingCert(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteCert = async (certId: string) => {
        if (!confirm("Xóa chứng nhận này khỏi hồ sơ?")) return;
        try { await api.delete(`/api/hr/${hrId}/certifications/${certId}`); } catch { }
        setCertFiles((prev) => prev.filter((c) => c.id !== certId));
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="hrp-page">
                <div className="hrp-hero-skeleton hrp-skeleton" style={{ height: 320 }} />
                <div className="hrp-container" style={{ marginTop: -60 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                        {[1, 2, 3, 4].map((i) => <SkeletonBlock key={i} className="h-28 rounded-2xl" />)}
                    </div>
                    {[1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-40 rounded-2xl mb-4" />)}
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="hrp-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ textAlign: "center" }}>
                    <Building2 size={56} style={{ margin: "0 auto 16px", opacity: 0.25 }} />
                    <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Nhà thầu không tồn tại</h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Hồ sơ này không tồn tại hoặc đã bị ẩn khỏi hệ thống.</p>
                    <Link href="/jobs" className="hrp-btn-primary">← Quay lại danh sách việc làm</Link>
                </div>
            </div>
        );
    }

    const yearsActive = getYearsActive(profile.joinedDate);
    const onTimePct = profile.stats.onTimePaymentRate;
    const ratingDist = [{ stars: 5, pct: 72 }, { stars: 4, pct: 21 }, { stars: 3, pct: 5 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 }];

    const BADGE_CONFIG: Record<BadgeType, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
        verified_mst:     { icon: <CheckCircle size={13} />, label: "Xác minh MST",      color: "#065f46", bg: "#d1fae5" },
        verified_address: { icon: <Building2 size={13} />,   label: "Xác minh địa chỉ",  color: "#1e40af", bg: "#dbeafe" },
        payment_good:     { icon: <CreditCard size={13} />,  label: "Thanh toán tốt",    color: "#92400e", bg: "#fef3c7" },
        hr_outstanding:   { icon: <Award size={13} />,       label: "HR Nổi bật",        color: "#5b21b6", bg: "#ede9fe" },
        no_violations:    { icon: <Shield size={13} />,      label: "Không vi phạm",     color: "#047857", bg: "#ecfdf5" },
    };

    return (
        <div className="hrp-page">

            {/* ════════════ STICKY NAV ════════════ */}
            <div className={`hrp-sticky-nav ${scrolled ? "hrp-sticky-nav--visible" : ""}`}>
                <div className="hrp-sticky-nav-inner">
                    <div className="hrp-sticky-brand">
                        <div className="hrp-sticky-avatar" style={{ background: hashStringToColor(profile.name) }}>
                            {profile.logo ? <img src={profile.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{profile.initials}</span>}
                        </div>
                        <span className="hrp-sticky-name">{profile.name}</span>
                    </div>
                    <nav className="hrp-sticky-links">
                        {[
                            { id: "overview", label: "Tổng quan", ref: overviewRef },
                            { id: "projects", label: "Công trình", ref: projectsRef },
                            { id: "reviews", label: "Đánh giá", ref: reviewsRef },
                            { id: "jobs", label: "Tuyển dụng", ref: jobsRef },
                        ].map((item) => (
                            <button key={item.id} onClick={() => scrollTo(item.ref)} className={`hrp-sticky-link ${activeSection === item.id ? "active" : ""}`}>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    <button onClick={scrollToJobs} className="hrp-btn-primary hrp-btn-sm">
                        Xem việc tuyển ({profile.activeJobs.length})
                    </button>
                </div>
            </div>

            {/* ════════════ HERO / COVER ════════════ */}
            <div className="hrp-hero">
                {/* Concrete texture overlay */}
                <div className="hrp-hero-texture" />
                <div className="hrp-hero-gradient" />

                <div style={{ position: "absolute", top: 24, left: 24, right: 24, display: "flex", justifyContent: "space-between", zIndex: 10 }}>
                    {/* Back button */}
                    {fromJobs ? (
                        <button onClick={() => router.back()} className="hrp-back-btn">
                            <ArrowLeft size={15} /> Quay lại
                        </button>
                    ) : <div />}
                    
                    {/* Share Button */}
                    <button 
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: profile.name,
                                    text: `Hồ sơ nhà thầu: ${profile.name}. Xem thông tin doanh nghiệp.`,
                                    url: window.location.href,
                                }).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Đã sao chép đường dẫn hồ sơ!");
                            }
                        }} 
                        className="hrp-back-btn" 
                        style={{ padding: "8px 16px", borderRadius: 20 }}
                    >
                        Chia sẻ <span className="material-symbols-outlined" style={{ fontSize: 16, marginLeft: 6 }}>share</span>
                    </button>
                </div>

                {/* Admin bar */}
                {userRole === "admin" && (
                    <div className="hrp-admin-strip">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.7 }}>
                            <Settings size={13} /> Chế độ Admin
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="hrp-admin-btn">Ẩn hồ sơ</button>
                            <button className="hrp-admin-btn">Chỉnh sửa</button>
                            <button className="hrp-admin-btn">Xem log</button>
                        </div>
                    </div>
                )}

                <div className="hrp-hero-content">
                    {/* Avatar */}
                    <div className="hrp-avatar-wrap">
                        <div className="hrp-avatar" style={profile.logo ? {} : { background: hashStringToColor(profile.name) }}>
                            {profile.logo
                                ? <img src={profile.logo} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                : <span className="hrp-avatar-initials">{profile.initials}</span>
                            }
                        </div>
                        {profile.verified && (
                            <div className="hrp-avatar-badge" title="Nhà thầu đã xác minh">
                                <CheckCircle size={14} fill="white" stroke="#10B981" />
                            </div>
                        )}
                    </div>

                    {/* Identity */}
                    <div className="hrp-hero-info">
                        {!profile.verified && (
                            <div className="hrp-unverified-pill">
                                <AlertTriangle size={12} /> Chưa xác minh
                            </div>
                        )}
                        <h1 className="hrp-company-name">{profile.name}</h1>
                        <div className="hrp-meta-pills">
                            <span className="hrp-meta-pill"><MapPin size={12} /> {profile.location}</span>
                            <span className="hrp-meta-pill"><HardHat size={12} /> {profile.industryType}</span>
                            <span className="hrp-meta-pill"><Clock size={12} /> Hoạt động {yearsActive} năm</span>
                        </div>
                        <p className="hrp-description">{profile.description}</p>
                    </div>

                    {/* CTAs */}
                    <div className="hrp-hero-actions">
                        <button onClick={scrollToJobs} className="hrp-btn-primary hrp-btn-hero">
                            <Briefcase size={16} />
                            Xem việc đang tuyển
                            <span className="hrp-btn-badge">{profile.activeJobs.length}</span>
                        </button>
                        {isLoggedIn && userRole === "worker" && (
                            <button className="hrp-btn-ghost hrp-btn-hero">
                                <Bookmark size={15} /> Lưu nhà thầu
                            </button>
                        )}
                        {!isLoggedIn && (
                            <Link href="/signin" className="hrp-btn-ghost hrp-btn-hero">
                                Đăng nhập để ứng tuyển
                            </Link>
                        )}
                    </div>
                </div>

                {/* Trust badge bar */}
                <div className="hrp-trust-bar">
                    {(["verified_mst", "verified_address", "payment_good", "no_violations", "hr_outstanding"] as BadgeType[]).map((b) => {
                        const cfg = BADGE_CONFIG[b];
                        const earned = profile.badges.includes(b);
                        return (
                            <div
                                key={b}
                                className={`hrp-trust-badge ${earned ? "hrp-trust-badge--earned" : "hrp-trust-badge--locked"}`}
                                title={earned ? `Đã đạt: ${cfg.label}` : `Chưa đạt: ${cfg.label}`}
                                style={earned ? { background: cfg.bg, color: cfg.color, borderColor: cfg.color + "40" } : {}}
                            >
                                {earned ? cfg.icon : <Lock size={12} />}
                                <span>{cfg.label}</span>
                                {b === "payment_good" && earned && (
                                    <span className="hrp-trust-pct">{onTimePct}%</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ════════════ WARNINGS ════════════ */}
            {profile.warnings.length > 0 && (
                <div className="hrp-container" style={{ paddingTop: 16, paddingBottom: 0 }}>
                    <div className="hrp-warning-card">
                        <button className="hrp-warning-header" onClick={() => setWarningExpanded(!warningExpanded)}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                <AlertCircle size={16} /> Cảnh báo từ hệ thống
                            </span>
                            {warningExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <AnimatePresence>
                            {warningExpanded && (
                                <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ listStyle: "none", padding: "8px 0 0", margin: 0, display: "flex", flexDirection: "column", gap: 6, overflow: "hidden" }}>
                                    {profile.warnings.map((w, i) => (
                                        <li key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                                            {w.type === "red" ? <AlertCircle size={13} /> : <AlertTriangle size={13} />} {w.message}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* ════════════ MAIN CONTENT ════════════ */}
            <div ref={overviewRef} className="hrp-container" style={{ paddingTop: 32 }}>

                {/* ── KPI STATS ── */}
                <div className="hrp-stats-row">
                    {[
                        { value: profile.stats.completedProjects, suffix: "", label: "Công trình", sub: "hoàn thành", color: "#3B82F6", icon: <Building2 size={20} /> },
                        { value: profile.stats.totalWorkers, suffix: "",  label: "Lao động", sub: "đã tuyển dụng", color: "#10B981", icon: <Users size={20} /> },
                        { value: profile.stats.completionRate, suffix: "%", label: "Tỷ lệ", sub: "hoàn thành", color: profile.stats.completionRate >= 90 ? "#10B981" : profile.stats.completionRate >= 70 ? "#F59E0B" : "#EF4444", icon: <TrendingUp size={20} /> },
                        { value: null as number | null, suffix: "★", label: "Đánh giá", sub: `từ ${profile.stats.totalReviews} lao động`, color: "#F59E0B", icon: <StarIcon size={20} />, display: profile.stats.avgRating.toFixed(1) },
                    ].map((kpi, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="hrp-stat-card"
                        >
                            <div className="hrp-stat-icon-wrap" style={{ background: kpi.color + "18", color: kpi.color }}>
                                {kpi.icon}
                            </div>
                            <div className="hrp-stat-num" style={{ color: kpi.color }}>
                                {"display" in kpi && kpi.display ? kpi.display : (kpi.value !== null ? <CountUpNumber target={kpi.value as number} suffix={kpi.suffix} /> : null)}
                                {"display" in kpi && kpi.display ? "" : ""}
                            </div>
                            <div className="hrp-stat-label">{kpi.label}</div>
                            <div className="hrp-stat-sub">{kpi.sub}</div>
                        </motion.div>
                    ))}
                </div>

                {/* ── PAYMENT HISTORY ── */}
                <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="hrp-card">
                    <div className="hrp-card-header">
                        <div>
                            <h2 className="hrp-section-title">Lịch sử thanh toán</h2>
                            <p className="hrp-section-sub">12 tháng gần nhất · Dữ liệu từ xác nhận của lao động</p>
                        </div>
                        <div className={`hrp-ontime-pill ${onTimePct >= 90 ? "hrp-pill-green" : onTimePct >= 70 ? "hrp-pill-amber" : "hrp-pill-red"}`}>
                            {onTimePct}% đúng hạn
                        </div>
                    </div>
                    <div className="hrp-payment-bars">
                        {["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"].map((m, i) => {
                            const status = profile.paymentHistory[i] || "no_data";
                            const colorMap: Record<PaymentStatus, string> = { on_time: "#10b981", late_minor: "#f59e0b", late_major: "#ef4444", no_data: "var(--border)" };
                            const tooltip: Record<PaymentStatus, string> = { on_time: "Đúng hạn", late_minor: "Trễ 1–3 ngày", late_major: "Trễ >3 ngày", no_data: "Không có dữ liệu" };
                            return (
                                <div key={m} className="hrp-payment-col" title={tooltip[status]}>
                                    <div className="hrp-payment-bar" style={{ background: colorMap[status] }} />
                                    <span className="hrp-payment-month">{m}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="hrp-payment-legend">
                        {[{ color: "#10b981", text: "Đúng hạn" }, { color: "#f59e0b", text: "Trễ 1–3 ngày" }, { color: "#ef4444", text: "Trễ >3 ngày" }, { color: "var(--border)", text: "Không có dữ liệu" }].map((l) => (
                            <span key={l.text} className="hrp-legend-item">
                                <span className="hrp-legend-dot" style={{ background: l.color }} /> {l.text}
                            </span>
                        ))}
                    </div>
                </motion.section>

                {/* ── CERTIFICATIONS ── */}
                <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="hrp-card">
                    <div className="hrp-card-header">
                        <div>
                            <h2 className="hrp-section-title">Hồ sơ & Chứng nhận</h2>
                            <p className="hrp-section-sub">Giấy tờ pháp lý, chứng chỉ hành nghề do nhà thầu cung cấp</p>
                        </div>
                        {isHROwner && (
                            <div>
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" className="hidden" onChange={handleCertUpload} />
                                <button className="hrp-btn-primary hrp-btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingCert}>
                                    <UploadCloud size={14} /> {uploadingCert ? "Đang tải..." : "Tải lên"}
                                </button>
                            </div>
                        )}
                    </div>
                    {!isHROwner && certFiles.length > 0 && (
                        <div className="hrp-cert-note">
                            <ClipboardList size={13} /> {certFiles.length} chứng nhận đã được nhà thầu đăng tải và xác minh bởi hệ thống.
                        </div>
                    )}
                    {certFiles.length === 0 ? (
                        <div className="hrp-empty">
                            <FileText size={32} style={{ opacity: 0.25 }} />
                            <p>{isHROwner ? "Hãy tải lên chứng nhận để tăng uy tín!" : "Nhà thầu chưa đăng tải hồ sơ chứng nhận nào."}</p>
                        </div>
                    ) : (
                        <div className="hrp-cert-list">
                            {certFiles.map((cert) => {
                                const ext = cert.name.split(".").pop()?.toLowerCase() || "";
                                const icon = ["jpg","jpeg","png","webp"].includes(ext) ? <FileImage size={18} /> : ["xls","xlsx","csv"].includes(ext) ? <FileSpreadsheet size={18} /> : <FileText size={18} style={{ color: "#ef4444" }} />;
                                return (
                                    <div key={cert.id} className="hrp-cert-row">
                                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="hrp-cert-item">
                                            <span className="hrp-cert-icon">{icon}</span>
                                            <div>
                                                <span className="hrp-cert-name">{cert.name}</span>
                                                <span className="hrp-cert-date">Tải lên: {cert.uploadedAt}</span>
                                            </div>
                                            <ExternalLink size={13} style={{ color: "var(--text-muted)", marginLeft: "auto", flexShrink: 0 }} />
                                        </a>
                                        {isHROwner && (
                                            <button onClick={() => handleDeleteCert(cert.id)} className="hrp-cert-del" title="Xóa">
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.section>

                {/* ── PROJECT HISTORY ── */}
                <section ref={projectsRef} className="hrp-card">
                    <div className="hrp-card-header" style={{ marginBottom: 16 }}>
                        <h2 className="hrp-section-title">Lịch sử công trình</h2>
                        <span className="hrp-count-badge">{profile.stats.totalProjects} công trình</span>
                    </div>
                    {/* Tab bar */}
                    <div className="hrp-tabs">
                        {[
                            { key: "all", label: "Tất cả", count: profile.stats.totalProjects },
                            { key: "ongoing", label: "Đang thi công", count: profile.stats.ongoingProjects },
                            { key: "completed", label: "Hoàn thành", count: profile.stats.completedProjects },
                            { key: "cancelled", label: "Đã hủy", count: profile.stats.cancelledProjects },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => { setProjectFilter(tab.key as any); setVisibleProjects(3); }}
                                className={`hrp-tab ${projectFilter === tab.key ? "hrp-tab--active" : ""}`}
                            >
                                {tab.label} <span className="hrp-tab-count">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                    {/* Project cards */}
                    <div className="hrp-project-list">
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.slice(0, visibleProjects).map((p) => {
                                const statusConfig: Record<ProjectStatus, { color: string; label: string; icon: React.ReactNode }> = {
                                    completed: { color: "#10B981", label: "Hoàn thành", icon: <CheckCircle size={11} /> },
                                    ongoing:   { color: "#3B82F6", label: "Đang thi công", icon: <Circle size={11} /> },
                                    cancelled: { color: "#EF4444", label: "Đã hủy", icon: <X size={11} /> },
                                };
                                const sc = statusConfig[p.status];
                                const payConfig = {
                                    on_time: { icon: <CheckCircle2 size={12} />, text: "Đúng hạn", cls: "hrp-pay-ok" },
                                    late:    { icon: <AlertTriangle size={12} />, text: "Trễ", cls: "hrp-pay-late" },
                                    partial: { icon: <AlertTriangle size={12} />, text: "Một phần", cls: "hrp-pay-late" },
                                };
                                const pc = payConfig[p.paymentStatus];
                                return (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 12 }}
                                        className="hrp-project-card"
                                    >
                                        {/* Colored status sidebar */}
                                        <div className="hrp-project-sidebar" style={{ background: sc.color }} />
                                        <div className="hrp-project-body">
                                            <div className="hrp-project-top">
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="hrp-project-name">{p.name}</div>
                                                    <div className="hrp-project-meta">
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {p.district}, {p.city}</span>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Calendar size={11} /> {parseMonthYear(p.startDate)} {p.endDate ? `→ ${parseMonthYear(p.endDate)}` : "→ Nay"} · {getDuration(p.startDate, p.endDate)}</span>
                                                    </div>
                                                </div>
                                                <span className="hrp-status-pill" style={{ background: sc.color + "18", color: sc.color, borderColor: sc.color + "30" }}>
                                                    {sc.icon} {sc.label}
                                                </span>
                                            </div>
                                            <div className="hrp-worker-tags">
                                                {p.workerTypes.map((w) => (
                                                    <span key={w.type} className="hrp-worker-tag">
                                                        <HardHat size={10} /> {w.type} ×{w.count}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="hrp-project-foot">
                                                <span className={`hrp-pay-label ${pc.cls}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                    <CreditCard size={11} /> Thanh toán: {pc.icon} {pc.text}
                                                </span>
                                                {p.rating > 0 && (
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#F59E0B", fontSize: 13 }}>
                                                        <StarIcon size={12} fill="#F59E0B" /> {p.rating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                            {p.reviewSnippet && (
                                                <p className="hrp-review-snippet">"{p.reviewSnippet}"</p>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                    {filteredProjects.length === 0 && (
                        <div className="hrp-empty"><HardHat size={28} style={{ opacity: 0.25 }} /><p>Chưa có công trình nào trong danh mục này.</p></div>
                    )}
                    {filteredProjects.length > visibleProjects && (
                        <button onClick={() => setVisibleProjects((v) => v + 3)} className="hrp-load-more">
                            Xem thêm ({filteredProjects.length - visibleProjects} công trình) <ChevronDown size={15} />
                        </button>
                    )}
                </section>

                {/* ── REVIEWS ── */}
                <section ref={reviewsRef} className="hrp-card">
                    <div className="hrp-card-header" style={{ marginBottom: 20 }}>
                        <h2 className="hrp-section-title">Đánh giá từ lao động</h2>
                        <span className="hrp-aggregate">
                            <StarIcon size={20} fill="#F59E0B" stroke="#F59E0B" />
                            <span className="hrp-aggregate-num">{profile.stats.avgRating.toFixed(1)}</span>
                            <span className="hrp-aggregate-sub">/ 5 · {profile.stats.totalReviews} đánh giá</span>
                        </span>
                    </div>
                    <div className="hrp-reviews-layout">
                        {/* Left: breakdown */}
                        <div className="hrp-breakdown">
                            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: "Thanh toán", value: profile.ratingBreakdown.payment, color: "#10B981" },
                                    { label: "Giao tiếp", value: profile.ratingBreakdown.communication, color: "#3B82F6" },
                                    { label: "Môi trường", value: profile.ratingBreakdown.environment, color: "#F59E0B" },
                                    { label: "Độ minh bạch", value: profile.ratingBreakdown.transparency, color: "#8B5CF6" },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="hrp-breakdown-label">{item.label}</span>
                                        <AnimatedBar value={item.value} color={item.color} />
                                        <span className="hrp-breakdown-val">{item.value.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {ratingDist.map(({ stars, pct }) => (
                                    <div key={stars} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 11, color: "var(--text-secondary)", minWidth: 24, textAlign: "right" }}>{stars}★</span>
                                        <div className="hrp-star-track">
                                            <div className="hrp-star-fill" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 30 }}>{pct}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: reviews */}
                        <div className="hrp-review-list">
                            <div className="hrp-tabs" style={{ marginBottom: 12 }}>
                                {[{ key: "all", label: "Tất cả" }, { key: "5", label: "5★" }, { key: "4", label: "4★" }, { key: "low", label: "3★ trở xuống" }, { key: "commented", label: "Có nhận xét" }].map((t) => (
                                    <button key={t.key} onClick={() => setReviewFilter(t.key as any)} className={`hrp-tab hrp-tab-sm ${reviewFilter === t.key ? "hrp-tab--active" : ""}`}>{t.label}</button>
                                ))}
                            </div>
                            {filteredReviews.length === 0 ? (
                                <div className="hrp-empty"><MessageSquare size={24} style={{ opacity: 0.25 }} /><p>Không có đánh giá nào phù hợp.</p></div>
                            ) : (
                                filteredReviews.slice(0, visibleReviews).map((r, idx) => {
                                    const blurred = userRole === "guest" && idx >= 2;
                                    return (
                                        <div key={r.id} className={`hrp-review-card ${blurred ? "hrp-review-blurred" : ""}`}>
                                            {blurred && (
                                                <div className="hrp-review-overlay">
                                                    <Lock size={18} />
                                                    <span>Đăng nhập để xem đánh giá</span>
                                                    <Link href="/signin" className="hrp-btn-primary hrp-btn-sm">Đăng nhập ngay</Link>
                                                </div>
                                            )}
                                            <div className="hrp-review-head">
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <HardHat size={13} style={{ color: "var(--primary)" }} />
                                                    <span className="hrp-reviewer-type">{r.workerType}</span>
                                                    <span style={{ color: "var(--text-muted)" }}>·</span>
                                                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.projectName}</span>
                                                    <span style={{ color: "var(--text-muted)" }}>·</span>
                                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{parseMonthYear(r.date)}</span>
                                                </div>
                                                {r.verified && (
                                                    <span className="hrp-review-verified">
                                                        <CheckCircle2 size={11} /> Đã xác minh
                                                    </span>
                                                )}
                                            </div>
                                            <div className="hrp-review-stars">
                                                <StarRow rating={r.rating} />
                                            </div>
                                            <p className="hrp-review-content">"{r.content}"</p>
                                        </div>
                                    );
                                })
                            )}
                            {userRole === "guest" && filteredReviews.length > 2 && (
                                <div className="hrp-login-prompt">
                                    <Lock size={16} />
                                    <span>Đăng nhập để xem tất cả {filteredReviews.length} đánh giá</span>
                                    <Link href="/signin" className="hrp-btn-primary hrp-btn-sm">Đăng nhập</Link>
                                </div>
                            )}
                            {userRole !== "guest" && filteredReviews.length > visibleReviews && (
                                <button onClick={() => setVisibleReviews((v) => v + 3)} className="hrp-load-more">
                                    Xem thêm đánh giá <ChevronDown size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── ACTIVE JOBS ── */}
                <section ref={jobsRef} style={{ scrollMarginTop: 80 }}>
                    <div ref={activeJobsRef} className="hrp-card">
                        <div className="hrp-card-header" style={{ marginBottom: 16 }}>
                            <h2 className="hrp-section-title">Đang tuyển dụng</h2>
                            {profile.activeJobs.length > 0 && (
                                <span className="hrp-count-badge hrp-count-badge--green">{profile.activeJobs.length} vị trí</span>
                            )}
                        </div>
                        {profile.activeJobs.length === 0 ? (
                            <div className="hrp-empty"><Briefcase size={28} style={{ opacity: 0.25 }} /><p>Hiện tại không có vị trí tuyển dụng mở.</p></div>
                        ) : (
                            <>
                                <div className="hrp-job-list">
                                    {profile.activeJobs.slice(0, 3).map((job) => (
                                        <Link key={job.id} href={`/jobs/${job.id}`} className="hrp-job-card">
                                            <div className="hrp-job-left">
                                                <div className="hrp-job-title">{job.title}</div>
                                                <div className="hrp-job-meta">
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {job.location}</span>
                                                    {job.daysLeft && (
                                                        <span className="hrp-days-left" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                                                            <Timer size={11} /> Còn {job.daysLeft} ngày
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="hrp-job-right">
                                                <span className="hrp-job-salary">{job.compensation}</span>
                                                <span className="hrp-job-apply">
                                                    Ứng tuyển <ArrowRight size={13} />
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                {profile.activeJobs.length > 3 && (
                                    <div style={{ textAlign: "center", marginTop: 16 }}>
                                        <Link href={`/jobs?hr=${hrId}`} className="hrp-see-all">
                                            Xem tất cả {profile.activeJobs.length} việc làm →
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

            </div>{/* end hrp-container */}

            {/* ════════════ MOBILE STICKY CTA ════════════ */}
            <div className="hrp-mobile-cta">
                <div className="hrp-mobile-cta-inner">
                    <div style={{ minWidth: 0 }}>
                        <div className="hrp-mobile-cta-name">{profile.name}</div>
                        <div className="hrp-mobile-cta-sub">
                            <StarIcon size={11} fill="#F59E0B" stroke="#F59E0B" /> {profile.stats.avgRating.toFixed(1)} · {profile.activeJobs.length} vị trí mở
                        </div>
                    </div>
                    <button onClick={scrollToJobs} className="hrp-btn-primary">
                        Ứng tuyển ngay <ArrowRight size={14} />
                    </button>
                </div>
            </div>

        </div>
    );
}
