"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";

// --- PREMIUM DESIGN TOKENS ---
const glassStyle = "bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 shadow-2xl";
const cardStyle = "bg-white dark:bg-slate-900/60 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800/40 transition-all duration-500 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5";
const accentColor = "#3b82f6";

// --- MOCK DATA FOR WORKER ---
const MOCK_WORKER_STATS = {
    username: "@nguyendinhthi",
    badges: ["Chuyên gia xác minh", "Thợ ưu tú", "Người tiên phong"],
    rating: 4.8,
    reviewCount: 42,
    jobsCompleted: 15,
    experienceYears: 6,
    location: "Đà Nẵng",
    skills: ["Đọc bản vẽ chính xác", "Hàn Argon", "Điện công trình", "Đổ bê tông khối lớn"],
    jobTypes: ["Thợ xây chính", "Thợ điện công nghiệp", "Thợ cốp pha thép"],
    availability: "Sẵn sàng nhận việc",
    preferredAreas: ["TP Đà Nẵng", "Hội An", "Khu công nghệ cao Quảng Nam"],
    trust: {
        completionRate: 98,
        onTimeRate: 100,
        canceledJobs: 0,
        reports: 0,
        cccdVerified: true
    },
    workHistory: [
        { id: 1, project: "Resort Vincere Ocean - Đà Nẵng", hr: "Delta Group", duration: "6 tháng", role: "Thợ xây kết cấu", rating: 5, status: "Đã xác minh" },
        { id: 2, project: "Khu đô thị Smart City Zone A - Quảng Nam", hr: "Coteccons", duration: "3 tháng", role: "Giám sát công trình", rating: 4.8, status: "Đã xác minh" }
    ],
    social: {
        followers: 245,
        projectsSaved: 12,
        postsCount: 15,
        groups: ["Liên minh thợ xây Đà Nẵng", "Mạng lưới kỹ thuật Việt Nam"]
    }
};

const MOCK_HR_STATS = {
    established: 2012,
    badges: ["Nhà tuyển dụng uy tín", "Thanh toán tức thì"],
    rating: 4.9,
    jobsPosted: 82,
    workersHired: 560,
    paymentOnTimeRate: 100,
    fullAddress: "79 Bán đảo Sơn Trà, Đà Nẵng",
    website: "https://buildforce.vn",
    bio: "Chúng tôi đi đầu trong cuộc cách mạng công nghiệp của Việt Nam, cung cấp nguồn nhân lực chất lượng cao cho các dự án hạ tầng đầy tham vọng của đất nước.",
    portfolio: [
        { id: 1, name: "Luxury Sky Villas", size: "12,000m2", type: "Nghỉ dưỡng", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1200", desc: "Chuỗi biệt thự nghỉ dưỡng cao cấp ven biển với kết cấu hình học phức tạp." },
        { id: 2, name: "Trung tâm Bán dẫn Công nghệ cao", size: "50,000m2", type: "Công nghiệp", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200", desc: "Xây dựng môi trường phòng sạch tích hợp hệ thống HVAC chính xác." }
    ],
    activeJobs: [
        { id: 101, title: "Kỹ sư hiện trường cao cấp (Nhà cao tầng)", location: "Đà Nẵng", salary: "25M - 35M", type: "Kỹ sư" },
        { id: 102, title: "Quản đốc đội đào móng", location: "Tam Kỳ", salary: "18M+", type: "Giám sát" }
    ]
};

export default function ProfilePage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [appliedLoading, setAppliedLoading] = useState(false);
    const [appliedApplications, setAppliedApplications] = useState<any[]>([]);

    // Change Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');

    // Edit Profile state
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', companyName: '', taxCode: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');

    // Avatar upload state
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState('');
    const avatarInputRef = React.useRef<HTMLInputElement>(null);
    const calculateStrength = () => {
        if (!profileData) return 90; // Fallback for demo
        let score = 0;
        if (profileData.avatar) score += 20;
        if (profileData.skills?.length > 0 || MOCK_WORKER_STATS.skills.length > 0) score += 20;
        if (profileData.experience || MOCK_WORKER_STATS.experienceYears > 0) score += 20;
        if (profileData.isVerified || MOCK_WORKER_STATS.trust.cccdVerified) score += 20;
        if (MOCK_WORKER_STATS.jobsCompleted >= 1) score += 20;
        return score;
    };

    useEffect(() => {
        setMounted(true);
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/signin');
                return;
            }
            try {
                const response = await api.get('/api/auth/profile');
                if (response.data.success) {
                    setProfileData(response.data.data);
                    const d = response.data.data;
                    setEditForm({
                        firstName: d.firstName || '',
                        lastName: d.lastName || '',
                        phone: d.phone || '',
                        companyName: d.companyName || '',
                        taxCode: d.taxCode || '',
                    });
                } else {
                    router.push('/signin');
                }
            } catch (error: any) {
                console.error("Profile fetch error:", error);
                if (error?.response?.status === 401) {
                    localStorage.removeItem('token');
                    router.push('/signin');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    useEffect(() => {
        if (activeTab !== "applied") return;
        const loadApplied = async () => {
            setAppliedLoading(true);
            try {
                const res = await api.get("/api/users/jobs/applied");
                if (res.data.success) setAppliedApplications(res.data.data || []);
            } catch (err) {
                console.error("Failed to load applied jobs", err);
            } finally {
                setAppliedLoading(false);
            }
        };
        loadApplied();
    }, [activeTab]);

    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Đang tải dữ liệu...</p>
            </div>
        );
    }

    const isHR = profileData?.role === 'hr';
    const strength = calculateStrength();

    return (
        <div className="bg-[#fcfdff] dark:bg-[#040816] min-h-screen pt-6 md:pt-10 lg:pt-14 pb-6 md:pb-8 transition-all duration-1000 selection:bg-primary/20">
            {/* --- HERO: IMMERSIVE BRANDING --- */}
            <section className="relative w-full min-h-[12rem] md:min-h-[16rem] lg:min-h-[18rem] flex flex-col items-center justify-end md:justify-center lg:justify-end overflow-hidden pb-4 md:pb-6">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070"
                        alt="Background"
                        className="w-full h-full object-cover opacity-20 dark:opacity-10 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#fcfdff] dark:to-[#040816] z-10" />
                </div>

                <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
                        {/* Avatar Showcase */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, type: "spring" }}
                            className="relative"
                        >
                            <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-[0_15px_40px_rgba(59,130,246,0.3)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white dark:border-slate-800 relative z-10">
                                {profileData.avatar ? (
                                    <img src={profileData.avatar} alt="User Avatar" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black rounded-xl">
                                        {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                            {/* Verified Icon Badge */}
                            <div className="absolute -bottom-3 -right-3 bg-[#10B981] text-white w-7 h-7 rounded-lg flex items-center justify-center border-2 border-[#fcfdff] dark:border-[#040816] shadow-xl z-20">
                                <span className="material-symbols-outlined text-sm font-black">verified</span>
                            </div>
                        </motion.div>

                        {/* Name & Title Content */}
                        <div className="flex-grow text-center lg:text-left space-y-3">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-1">
                                    <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                        {profileData.firstName} {profileData.lastName}
                                    </h1>
                                    <div className="flex flex-wrap gap-1.5 h-fit">
                                        {(isHR ? MOCK_HR_STATS.badges : MOCK_WORKER_STATS.badges).map((badge, i) => (
                                            <span key={badge} className="px-2.5 py-0.5 bg-primary/10 text-primary dark:text-sky-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm font-black text-slate-400 dark:text-slate-500 tracking-tighter uppercase">{isHR ? "Trưởng phòng Tuyển dụng" : "Kỹ sư Kết cấu Cao cấp"}</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap justify-center lg:justify-start items-center gap-5 lg:gap-6"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-amber-500 text-xl fill-1">star</span>
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">{isHR ? MOCK_HR_STATS.rating : MOCK_WORKER_STATS.rating}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Đánh giá chung</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-xl">local_activity</span>
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">{isHR ? MOCK_HR_STATS.jobsPosted : MOCK_WORKER_STATS.jobsCompleted}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Lịch sử làm việc</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-xl">map</span>
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">{MOCK_WORKER_STATS.location}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Khu vực hiện tại</p>
                                    </div>
                                </div>

                                {/* Verified Workforce badge moved from sidebar */}
                                <div className="flex items-center gap-3 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-2xl px-4 py-3 border border-emerald-500/20">
                                    <span className="material-symbols-outlined text-emerald-500 text-2xl">verified_user</span>
                                    <div>
                                        <p className="text-emerald-500 font-black text-xs uppercase tracking-tight">Verified Workforce</p>
                                        <p className="text-emerald-600/60 dark:text-emerald-400/50 text-[9px] font-bold leading-snug">Danh tính & lịch sử nghề nghiệp đã được xác minh.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Interactive Actions */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-4 lg:mt-0">
                            <motion.button
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="h-10 px-5 bg-primary text-white rounded-xl font-bold text-sm shadow-[0_8px_25px_rgba(59,130,246,0.3)] flex items-center gap-2 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg">rocket_launch</span>
                                {isHR ? "Xây dựng đội ngũ" : "Ứng tuyển ngay"}
                            </motion.button>
                            {!isHR && (
                                <motion.button
                                    onClick={() => router.push('/profile/cv')}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="h-10 px-5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-[0_8px_25px_rgba(79,70,229,0.3)] flex items-center gap-2 transition-all hover:bg-indigo-700"
                                >
                                    <span className="material-symbols-outlined text-lg">contact_page</span>
                                    Hồ sơ chuyên nghiệp
                                </motion.button>
                            )}
                            <button className="h-10 w-10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 transition-all shadow-md shrink-0">
                                <span className="material-symbols-outlined text-lg">share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CORE CONTENT GRID --- */}
            <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                    {/* LEFT COLUMN: NAVIGATION TOOLS */}
                    <aside className="w-full lg:w-64 xl:w-72 space-y-5 flex-shrink-0">

                        {/* Smooth Tab Nav */}
                        <div className={glassStyle + " rounded-2xl p-3 shadow-inner"}>
                            <nav className="space-y-1">
                                {[
                                    { id: 'overview', label: 'Hồ sơ năng lực', icon: 'dna', desc: 'Chuyên môn & Khả năng' },
                                    { id: 'activity', label: 'Hoạt động', icon: 'auto_graph', desc: 'Dự án & Danh tiếng' },
                                    { id: 'history', label: 'Lịch sử xây dựng', icon: 'history_edu', desc: 'Nhật ký dự án & Chứng chỉ' },
                                    { id: 'applied', label: 'Việc đã ứng tuyển', icon: 'send', desc: 'Theo dõi trạng thái' },
                                    { id: 'account', label: 'Bảo mật tài khoản', icon: 'fingerprint', desc: 'Truy cập & Tài sản' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${activeTab === tab.id
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-[1.01]'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                                    >
                                        <span className={`material-symbols-outlined text-xl transition-transform ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>{tab.icon}</span>
                                        <div>
                                            <p className="font-bold text-sm leading-tight">{tab.label}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${activeTab === tab.id ? 'text-white/40 dark:text-black/40' : 'text-slate-400'}`}>
                                                {tab.desc}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Profile Strength Widget */}
                        <div className={cardStyle}>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-base">Điểm uy tín</h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Độ tin cậy tài khoản</p>
                                </div>
                                <span className="text-2xl font-black text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">{strength}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-4 overflow-hidden p-0.5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${strength}%` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-sky-400 via-primary to-indigo-600 rounded-full shadow-lg"
                                />
                            </div>
                            <div className="space-y-2.5">
                                {[
                                    { label: "Đã xác minh danh tính", done: true },
                                    { label: "Hồ sơ kỹ thuật số tối ưu", done: true },
                                    { label: "Đã xác thực bảo lãnh kinh tế", done: false }
                                ].map((step, i) => (
                                    <div key={i} className={`flex items-center gap-4 text-xs font-black ${step.done ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300'}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${step.done ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-200'}`}>
                                            <span className="material-symbols-outlined text-lg">{step.done ? 'verified' : 'pending'}</span>
                                        </div>
                                        {step.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </aside>

                    {/* RIGHT COLUMN: DYNAMIC DATA DISPLAY */}
                    <main className="flex-grow min-w-0">
                        <AnimatePresence mode="wait">
                            {/* PROFESSIONAL INFO TAB */}
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5, ease: "circOut" }}
                                    className="space-y-8"
                                >
                                    <div className={cardStyle}>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Tóm tắt năng lực</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed italic font-medium">
                                            &quot;Tận tâm với sự xuất sắc trong kỹ thuật xây dựng. Làm chủ sự giao thoa giữa tính toàn vẹn cấu trúc truyền thống và độ chính xác kiến trúc hiện đại. Với hơn {MOCK_WORKER_STATS.experienceYears} năm thực chiến thành công trong các dự án công nghiệp quy mô lớn.&quot;
                                        </p>

                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <span className="w-1 h-5 bg-primary rounded-full" /> Thẻ kỹ năng chuyên sâu
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {MOCK_WORKER_STATS.skills.map(skill => (
                                                        <span key={skill} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-semibold text-xs border border-slate-100 dark:border-slate-800 shadow-sm">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <span className="w-1 h-5 bg-emerald-500 rounded-full" /> Trạng thái hiện tại
                                                </h4>
                                                <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                        <span className="material-symbols-outlined text-xl">check_circle</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">Sẵn sàng làm việc</p>
                                                        <p className="text-[10px] font-bold text-emerald-600/50 uppercase tracking-widest">{MOCK_WORKER_STATS.availability}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Matrix */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: "Dự án hoàn thành", value: "248", icon: "task_alt" },
                                            { label: "Chỉ số chính xác", value: "9.9", icon: "precision_manufacturing" },
                                            { label: "Độ phủ mạng lưới", value: "A+", icon: "hub" }
                                        ].map((stat, i) => (
                                            <div key={i} className={cardStyle + " text-center group"}>
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined text-2xl text-primary">{stat.icon}</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{stat.value}</h3>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* SOCIAL FEED / ACTIVITY TAB */}
                            {activeTab === 'activity' && (
                                <motion.div
                                    key="activity"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        {(isHR ? MOCK_HR_STATS.portfolio : [
                                            { id: 1, name: "Metropolis Tower A1", tag: "Structural Engineering", img: "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070", stats: "Verified Build" },
                                            { id: 2, name: "Industrial Zone Bridge", tag: "Civil Infrastructure", img: "https://images.unsplash.com/photo-1510673398445-94f476ef2eb4?q=80&w=2072", stats: "High Precision" }
                                        ]).map((project: any) => (
                                            <div key={project.id} className="group relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                                                <img src={project.img} alt={project.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end transform transition-transform group-hover:translate-y-[-5px]">
                                                    <p className="text-primary font-black uppercase text-[9px] tracking-widest mb-1">#{project.tag}</p>
                                                    <h4 className="text-white text-xl font-black mb-2 tracking-tighter">{project.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[9px] font-black border border-white/20">{project.stats}</span>
                                                        <span className="material-symbols-outlined text-white text-xl">arrow_right_alt</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Follower Stats Section */}
                                    <div className={cardStyle + " flex flex-wrap justify-between items-center gap-5"}>
                                        <div className="text-center md:text-left">
                                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{MOCK_WORKER_STATS.social.followers}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Industry Peers Following</p>
                                        </div>
                                        <div className="flex -space-x-4">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden shadow-lg">
                                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="Peer" />
                                                </div>
                                            ))}
                                            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg">
                                                +2K
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PROJECT LOGS / HISTORY TAB */}
                            {activeTab === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-8"
                                >
                                    <div className={cardStyle}>
                                        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Nhật ký nhiệm vụ</h2>
                                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Lịch sử hợp đồng đã xác minh</p>
                                            </div>
                                            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                                <button className="px-5 py-2 bg-white dark:bg-slate-700 shadow-md rounded-lg text-xs font-black text-primary">Đã nhận</button>
                                                <button className="px-5 py-2 text-xs font-bold text-slate-500">Đề xuất</button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {(isHR ? MOCK_HR_STATS.activeJobs : MOCK_WORKER_STATS.workHistory).map((item: any) => (
                                                <div key={item.id} className="relative pl-10 pb-6 border-l-4 border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                                                    <div className="absolute left-[-10px] top-0 w-5 h-5 rounded-lg bg-white dark:bg-slate-900 border-4 border-primary shadow-[0_0_12px_rgba(59,130,246,0.4)] z-10 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    </div>

                                                    <div className="bg-slate-50/30 dark:bg-slate-800/5 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:bg-white dark:hover:bg-slate-800/20 transition-all group">
                                                        <div className="flex flex-col md:flex-row justify-between gap-12">
                                                            <div className="space-y-2">
                                                                <p className="text-primary font-black uppercase text-[9px] tracking-widest">{item.duration}</p>
                                                                <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter">{isHR ? item.title : item.project}</h4>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-3 text-slate-400 font-black text-xs uppercase tracking-widest">
                                                                        <span className="material-symbols-outlined text-primary">business</span>
                                                                        {isHR ? item.location : item.hr}
                                                                    </div>
                                                                    <span className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                                        {item.role || item.type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col justify-between">
                                                                <div className="flex items-center gap-3 justify-end text-slate-900 dark:text-white">
                                                                    <span className="text-xl font-black">{item.rating || 5.0}</span>
                                                                    <span className="material-symbols-outlined text-amber-500 text-xl fill-1">star</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 justify-end text-emerald-500 font-black text-[10px] uppercase tracking-widest mt-4">
                                                                    <span className="material-symbols-outlined text-lg">verified</span>
                                                                    Hợp đồng {item.status}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* APPLIED JOBS TAB */}
                            {activeTab === 'applied' && (
                                <motion.div
                                    key="applied"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className={cardStyle}>
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Việc đã ứng tuyển</h2>
                                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Theo dõi trạng thái ứng tuyển</p>
                                            </div>
                                            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black text-slate-500">
                                                {appliedApplications.length} hồ sơ
                                            </span>
                                        </div>

                                        {appliedLoading ? (
                                            <div className="flex items-center gap-3 text-slate-500 font-bold">
                                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                                                Đang tải...
                                            </div>
                                        ) : appliedApplications.length === 0 ? (
                                            <div className="p-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-center">
                                                <p className="text-slate-500 font-bold">Bạn chưa ứng tuyển công việc nào.</p>
                                                <Link href="/jobs" className="inline-block mt-3 text-primary font-black text-sm hover:underline">
                                                    Tìm việc ngay →
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {appliedApplications.map((app: any) => {
                                                    const j = app.jobId;
                                                    const hr = j?.hrId;
                                                    const company = hr?.companyName || (hr?.firstName ? `${hr.firstName} ${hr.lastName || ""}`.trim() : "Nhà tuyển dụng");
                                                    const location = j?.location?.province || "Việt Nam";
                                                    return (
                                                        <div
                                                            key={app._id}
                                                            className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 hover:bg-white dark:hover:bg-slate-800/30 transition-all"
                                                        >
                                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                                <div className="min-w-0">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                                        {company} • {location}
                                                                    </p>
                                                                    <p className="text-base font-black text-slate-900 dark:text-white truncate">
                                                                        {j?.title || "Công việc"}
                                                                    </p>
                                                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                                                        Ứng tuyển: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("vi-VN") : "—"}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="px-4 py-2 rounded-full text-xs font-black bg-primary/10 text-primary">
                                                                        {app.status}
                                                                    </span>
                                                                    {j?._id && (
                                                                        <Link
                                                                            href={`/jobs/${j._id}`}
                                                                            className="px-4 py-2 rounded-full text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all"
                                                                        >
                                                                            Xem job
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* ACCOUNT & SECURITY TAB */}
                            {activeTab === 'account' && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-10"
                                >
                                    {/* Security Matrix */}
                                    <div className={cardStyle}>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">Kiểm soát bảo mật</h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                            <div className="p-5 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:scale-125 transition-transform duration-700">
                                                    <span className="material-symbols-outlined text-5xl">mail</span>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Thông tin liên lạc đã xác minh</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white truncate pr-16">{profileData?.email}</p>
                                                <button className="mt-3 text-primary font-black text-xs uppercase tracking-widest hover:underline">Cập nhật Email</button>
                                            </div>

                                            <div className="p-5 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 text-primary/10 group-hover:scale-125 transition-transform duration-700">
                                                    <span className="material-symbols-outlined text-5xl">encryption</span>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Xác thực mã băm</p>
                                                <p className="text-sm font-black text-slate-900 dark:text-white">********</p>
                                                <button className="mt-3 text-primary font-black text-xs uppercase tracking-widest hover:underline">Tạo lại khóa</button>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button className="flex-1 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm transition-transform hover:scale-[1.01]">Đổi mật khẩu</button>
                                            <button
                                                onClick={() => { localStorage.removeItem('token'); router.push('/signin'); }}
                                                className="flex-1 h-11 border-2 border-red-500/20 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/5 transition-all"
                                            >
                                                Kết thúc phiên
                                            </button>
                                        </div>
                                    </div>

                                    {/* Destruction Zone */}
                                    <div className="bg-red-500/5 rounded-2xl p-6 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-5">
                                        <div className="text-center md:text-left">
                                            <h3 className="text-red-500 font-black text-base mb-1">Hủy tài khoản</h3>
                                            <p className="text-red-900/60 dark:text-red-400/40 text-xs font-bold">Hành động này sẽ xóa vĩnh viễn dữ liệu và danh tiếng đã xác minh của bạn khỏi mạng lưới BuildForce.</p>
                                        </div>
                                        <button className="h-10 px-6 bg-red-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Thực hiện xóa</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
}
