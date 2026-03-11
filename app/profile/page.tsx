"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

function ConfirmCompleteButton({
    jobId,
    applicationId,
    onSuccess,
}: {
    jobId: string;
    applicationId: string;
    onSuccess: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleConfirm = async () => {
        if (!jobId || !applicationId) return;
        setLoading(true);
        setSuccess(false);
        try {
            await api.put(`/api/jobs/${jobId}/applicants/${applicationId}/confirm-complete`);
            setLoading(false);
            setSuccess(true);
            setTimeout(() => onSuccess(), 1400);
        } catch (err) {
            console.error("Confirm complete failed", err);
            setLoading(false);
        }
    };
    if (success) {
        return (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <span className="material-symbols-outlined text-base animate-in zoom-in duration-300">check_circle</span>
                Đã xác nhận hoàn thành
            </span>
        );
    }
    return (
        <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-full text-xs font-black bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 transition-all disabled:opacity-60 inline-flex items-center gap-2"
        >
            {loading ? (
                <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Đang xác nhận...
                </>
            ) : (
                "Xác nhận hoàn thành"
            )}
        </button>
    );
}

function OpenChatButton({ hrId, companyName }: { hrId: string; companyName: string }) {
    const [loading, setLoading] = useState(false);
    const id = typeof hrId === "string" ? hrId : (hrId as any)?.toString?.();
    const handleOpen = async () => {
        if (!id || loading) return;
        setLoading(true);
        try {
            const res = await api.post("/api/chat", { participantId: id });
            const conv = res.data?.data;
            if (conv?._id && Array.isArray(conv.participants)) {
                const hrParticipant = conv.participants.find((p: any) => String(p._id) === String(id));
                const participant = hrParticipant || { _id: id, firstName: "", lastName: "", role: "hr", companyName };
                window.dispatchEvent(new CustomEvent("buildforce:openChat", { detail: { conversationId: conv._id, participant } }));
            }
        } catch (err) {
            console.error("Open chat failed", err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <button
            type="button"
            onClick={handleOpen}
            disabled={loading}
            className="px-4 py-2 rounded-full text-xs font-black bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-60 flex items-center gap-1"
        >
            <span className="material-symbols-outlined text-sm">chat</span>
            {loading ? "Đang mở..." : "Nhắn tin"}
        </button>
    );
}

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

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "overview");
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

    // Profile document image upload state (HR only)
    const [profileDocUploading, setProfileDocUploading] = useState(false);
    const profileDocInputRef = React.useRef<HTMLInputElement>(null);
    const [profileDocLightbox, setProfileDocLightbox] = useState(false);

    // Inline edit thông tin tài khoản (overview)
    const [editingBasicInfo, setEditingBasicInfo] = useState(false);
    const [basicInfoSaving, setBasicInfoSaving] = useState(false);
    const [basicInfoError, setBasicInfoError] = useState("");

    // Review HR modal (worker rates HR after completed job)
    const [reviewModalApp, setReviewModalApp] = useState<any>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");

    // Cropping state
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [savedContractors, setSavedContractors] = useState<any[]>([]);
    const [savedLoading, setSavedLoading] = useState(false);
    const [activities, setActivities] = useState<any[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);

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

    const loadApplied = React.useCallback(async () => {
        setAppliedLoading(true);
        try {
            const res = await api.get("/api/users/jobs/applied");
            if (res.data.success) setAppliedApplications(res.data.data || []);
        } catch (err) {
            console.error("Failed to load applied jobs", err);
        } finally {
            setAppliedLoading(false);
        }
    }, []);

    const loadReviews = React.useCallback(async (userId: string) => {
        setReviewsLoading(true);
        try {
            const res = await api.get(`/api/reviews/target/${userId}`);
            if (res.data.success) {
                setReviews(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load reviews", err);
        } finally {
            setReviewsLoading(false);
        }
    }, []);

    const loadSavedContractors = React.useCallback(async () => {
        setSavedLoading(true);
        try {
            const res = await api.get('/api/users/contractors/saved');
            if (res.data.success) {
                setSavedContractors(res.data.data || []);
            }
        } catch (err) {
            console.error("Load saved contractors error:", err);
        } finally {
            setSavedLoading(false);
        }
    }, []);

    useEffect(() => {
        if (profileData?._id) {
            loadReviews(profileData._id);
            if (profileData.role === 'worker' || profileData.role === 'user') {
                loadSavedContractors();
            }
        }
    }, [profileData?._id, profileData?.role, loadReviews, loadSavedContractors]);

    useEffect(() => {
        if (activeTab !== "applied") return;
        loadApplied();
    }, [activeTab, loadApplied]);

    const loadActivities = React.useCallback(async () => {
        setActivitiesLoading(true);
        try {
            if (profileData?.role === 'hr') {
                const res = await api.get('/api/hr/jobs');
                if (res.data.success) {
                    setActivities(res.data.data || []);
                }
            } else {
                const res = await api.get('/api/users/jobs/applied');
                if (res.data.success) {
                    const apps = res.data.data || [];
                    setActivities(apps.filter((a: any) => ['HIRED', 'COMPLETED', 'COMPLETION_PENDING'].includes(a.status)));
                }
            }
        } catch (err) {
            console.error("Failed to load activities", err);
        } finally {
            setActivitiesLoading(false);
        }
    }, [profileData?.role]);

    useEffect(() => {
        if (activeTab === 'activity' && profileData) {
            loadActivities();
        }
    }, [activeTab, profileData, loadActivities]);

    const saveBasicInfo = async () => {
        setBasicInfoError("");
        setBasicInfoSaving(true);
        try {
            const res = await api.put("/api/auth/profile", {
                firstName: editForm.firstName?.trim() || profileData.firstName,
                lastName: editForm.lastName?.trim() ?? profileData.lastName,
                phone: editForm.phone?.trim() || null,
                ...(isHR && {
                    companyName: profileData.companyName,
                    taxCode: profileData.taxCode,
                }),
            });
            if (res.data?.success && res.data?.data) {
                setProfileData((prev: any) => ({ ...prev, ...res.data.data }));
                setEditingBasicInfo(false);
            }
        } catch (err: any) {
            setBasicInfoError(err?.response?.data?.message || "Cập nhật thất bại. Thử lại.");
        } finally {
            setBasicInfoSaving(false);
        }
    };

    const handleProfileDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert("Tài liệu quá lớn (Tối đa 10MB)");
            return;
        }
        const formData = new FormData();
        formData.append("image", file);
        setProfileDocUploading(true);
        try {
            const res = await api.post("/api/auth/upload-company-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data?.success && res.data?.data?.profileDocumentImage) {
                setProfileData((prev: any) => ({ ...prev, profileDocumentImage: res.data.data.profileDocumentImage }));
            }
        } catch (err: any) {
            console.error("Upload profile doc error", err);
            const msg = err?.response?.data?.message || "Tải tài liệu lên thất bại";
            alert(msg);
        } finally {
            setProfileDocUploading(false);
            if (profileDocInputRef.current) profileDocInputRef.current.value = "";
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
            alert("Ảnh quá lớn (Tối đa 15MB)");
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setCropImage(reader.result as string);
            setShowCropModal(true);
        });
        reader.readAsDataURL(file);
    };

    const handleCropConfirm = async () => {
        if (!cropImage || !croppedAreaPixels) return;
        setAvatarUploading(true);
        setShowCropModal(false);
        try {
            const croppedImageBlob = await getCroppedImg(cropImage, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error("Cropping failed");

            const formData = new FormData();
            formData.append("avatar", croppedImageBlob, "avatar.jpg");

            const res = await api.post("/api/auth/upload-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data?.success && res.data?.data?.avatar) {
                setProfileData((prev: any) => ({ ...prev, avatar: res.data.data.avatar }));
            }
        } catch (err: any) {
            console.error("Upload avatar error", err);
            setAvatarError(err?.response?.data?.message || "Tải ảnh lên thất bại");
        } finally {
            setAvatarUploading(false);
            setCropImage(null);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    };

    const submitReview = async () => {
        if (!reviewModalApp) return;
        setReviewSubmitting(true);
        setReviewError("");
        try {
            await api.post("/api/reviews", {
                applicationId: reviewModalApp._id,
                rating: reviewRating,
                comment: reviewComment.trim() || undefined,
            });
            setReviewModalApp(null);
            setReviewRating(5);
            setReviewComment("");
            await loadApplied();
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Gửi đánh giá thất bại.";
            setReviewError(msg);
        } finally {
            setReviewSubmitting(false);
        }
    };

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
                            className="relative group cursor-pointer"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="w-28 h-28 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-[0_15px_40px_rgba(59,130,246,0.3)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white dark:border-slate-800 relative z-10 transition-transform group-hover:scale-105 duration-500">
                                {profileData.avatar ? (
                                    <img src={profileData.avatar} alt="User Avatar" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black rounded-xl">
                                        {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                                    <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
                                </div>

                                {avatarUploading && (
                                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-20">
                                        <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
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
                                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                                            {(() => {
                                                const avg = Number(profileData.averageRating);
                                                return !Number.isNaN(avg) && avg > 0 ? avg.toFixed(1) : "—";
                                            })()}
                                        </p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Đánh giá chung {(() => {
                                                const cnt = Number(profileData.reviewCount);
                                                return !Number.isNaN(cnt) && cnt > 0 ? `(${cnt})` : "";
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-xl">local_activity</span>
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                                            {isHR
                                                ? (profileData.totalJobsPosted ?? "—")
                                                : (typeof profileData.jobsCompleted === "number" ? profileData.jobsCompleted : "—")}
                                        </p>
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
                                    ...(!isHR ? [{ id: 'saved', label: 'Nhà thầu đã lưu', icon: 'bookmark', desc: 'Danh sách quan tâm' }] : []),
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
                                    {/* Thông tin tài khoản */}
                                    <div className={cardStyle}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Thông tin tài khoản</h2>
                                            {!editingBasicInfo ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditForm({
                                                            firstName: profileData.firstName || "",
                                                            lastName: profileData.lastName || "",
                                                            phone: profileData.phone || "",
                                                            companyName: profileData.companyName || "",
                                                            taxCode: profileData.taxCode || "",
                                                        });
                                                        setBasicInfoError("");
                                                        setEditingBasicInfo(true);
                                                    }}
                                                    className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setEditingBasicInfo(false); setBasicInfoError(""); }}
                                                        disabled={basicInfoSaving}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                                                        title="Hủy"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">close</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={saveBasicInfo}
                                                        disabled={basicInfoSaving}
                                                        className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                                                        title="Lưu"
                                                    >
                                                        {basicInfoSaving ? (
                                                            <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-xl">check</span>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {basicInfoError && (
                                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-500 text-xs font-bold rounded-xl border border-red-500/20 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">error</span>
                                                {basicInfoError}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Họ và tên</p>
                                                {editingBasicInfo ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editForm.lastName}
                                                            onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                                                            placeholder="Họ"
                                                            className="w-1/3 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editForm.firstName}
                                                            onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                                                            placeholder="Tên"
                                                            className="w-2/3 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-900 dark:text-white font-bold">{profileData.lastName} {profileData.firstName}</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                                <p className="text-slate-900 dark:text-white font-bold">{profileData.email}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Không thể thay đổi</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                                                {editingBasicInfo ? (
                                                    <input
                                                        type="tel"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                                                        placeholder="Số điện thoại"
                                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                    />
                                                ) : (
                                                    <p className="text-slate-900 dark:text-white font-bold">{profileData.phone || "—"}</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vai trò</p>
                                                <p className="text-slate-900 dark:text-white font-bold">
                                                    {profileData.role === "hr" ? "Nhà tuyển dụng" : profileData.role === "admin" ? "Quản trị viên" : "Lao động"}
                                                </p>
                                            </div>
                                            {isHR && (
                                                <>
                                                    <div className="sm:col-span-2">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Công ty</p>
                                                        <p className="text-slate-900 dark:text-white font-bold">{profileData.companyName || "—"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mã số thuế</p>
                                                        <p className="text-slate-900 dark:text-white font-bold">{profileData.taxCode || "—"}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hồ sơ năng lực - Premium Display */}
                                    {isHR && (
                                        <div className={cardStyle + " overflow-hidden relative"}>
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                                            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                                                <div className="flex-1 space-y-8">
                                                    <div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg mb-4 border border-primary/20">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                            Verified Document Support
                                                        </div>
                                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight">Hồ sơ năng lực cá nhân</h2>
                                                        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-xl font-medium">
                                                            Tài liệu này thể hiện uy tín và kinh nghiệm của bạn. Chúng tôi hỗ trợ cả định dạng PDF và hình ảnh chất lượng cao để đảm bảo hồ sơ của bạn luôn chuyên nghiệp nhất.
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-6">
                                                        <input
                                                            type="file"
                                                            ref={profileDocInputRef}
                                                            accept="image/*,application/pdf"
                                                            className="hidden"
                                                            onChange={handleProfileDocUpload}
                                                            disabled={profileDocUploading}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => profileDocInputRef.current?.click()}
                                                            disabled={profileDocUploading}
                                                            className="px-8 py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2rem] text-sm font-black transition-all flex items-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                                        >
                                                            {profileDocUploading ? (
                                                                <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                                            )}
                                                            {profileData.profileDocumentImage ? 'Cập nhật tài liệu' : 'Tải lên ngay'}
                                                        </button>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-xs">info</span>
                                                                Hỗ trợ JPG, PNG, PDF
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-xs">file_present</span>
                                                                Dung lượng tối đa 10MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full lg:w-[400px] flex-shrink-0">
                                                    {profileData.profileDocumentImage ? (
                                                        <div className="relative group perspective-1000">
                                                            {profileData.profileDocumentImage.toLowerCase().endsWith('.pdf') ? (
                                                                <div className="w-full h-[450px] bg-white dark:bg-slate-800/50 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-10 transition-all group-hover:border-primary/50 shadow-2xl overflow-hidden group-hover:rotate-y-6 duration-500">
                                                                    <div className="w-28 h-28 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                                                                        <span className="material-symbols-outlined text-6xl">picture_as_pdf</span>
                                                                    </div>
                                                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 truncate max-w-full italic">Hồ sơ năng lực.pdf</h4>
                                                                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mb-12">Tài liệu đã được mã hóa</p>
                                                                    <a
                                                                        href={profileData.profileDocumentImage}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="w-full py-5 bg-red-500 text-white rounded-[1.5rem] font-black text-xs flex items-center justify-center gap-3 shadow-xl shadow-red-500/30 hover:bg-red-600 transition-all hover:-translate-y-1"
                                                                    >
                                                                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                                                                        XEM TÀI LIỆU PDF
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setProfileDocLightbox(true)}
                                                                    className="w-full h-[450px] rounded-[3rem] overflow-hidden border-2 border-slate-100 dark:border-slate-700 shadow-2xl transition-all group-hover:border-primary/50 relative cursor-zoom-in group-hover:rotate-y-6 duration-500"
                                                                >
                                                                    <img
                                                                        src={profileData.profileDocumentImage}
                                                                        alt="Profile Document"
                                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                                                        <div className="bg-white/20 backdrop-blur-md p-6 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                                                            <span className="material-symbols-outlined text-4xl text-white">fullscreen</span>
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            )}
                                                            <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500 text-white rounded-[1.8rem] border-[6px] border-white dark:border-slate-800 flex items-center justify-center shadow-2xl shadow-emerald-500/40 rotate-12 group-hover:rotate-0 transition-transform z-20">
                                                                <span className="material-symbols-outlined text-3xl font-black">verified</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-[450px] bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center group transition-all hover:bg-white dark:hover:bg-slate-800/40">
                                                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl transition-transform group-hover:rotate-12">
                                                                <span className="material-symbols-outlined text-5xl text-slate-300">add_photo_alternate</span>
                                                            </div>
                                                            <h4 className="text-xl font-black text-slate-400 mb-2">Chưa có tài liệu</h4>
                                                            <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black leading-relaxed">Nâng cấp hồ sơ của bạn với hồ sơ năng lực sắc nét</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Lightbox Modal */}
                                    <AnimatePresence>
                                        {profileDocLightbox && profileData.profileDocumentImage && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-[9999] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6"
                                                onClick={() => setProfileDocLightbox(false)}
                                            >
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                                                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                                                    exit={{ scale: 0.9, opacity: 0, rotateX: 20 }}
                                                    className="relative max-w-6xl w-full"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <img
                                                        src={profileData.profileDocumentImage}
                                                        alt="Preview"
                                                        className="w-full h-auto max-h-[85vh] object-contain rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/5"
                                                    />
                                                    <div className="absolute -top-16 left-0 right-0 flex justify-between items-center px-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-primary/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-primary/30">
                                                                <span className="material-symbols-outlined text-primary text-xl">verified</span>
                                                            </div>
                                                            <h3 className="text-white font-black text-xl tracking-tighter">Bản xác thực hồ sơ năng lực</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setProfileDocLightbox(false)}
                                                            className="w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-black rounded-2xl flex items-center justify-center transition-all group"
                                                        >
                                                            <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">close</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

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

                                            {/* Worker Reviews Section */}
                                            <div className={cardStyle}>
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Đánh giá từ đối tác</h2>
                                                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Phản hồi thực tế từ các công trình</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-500/10">
                                                        <span className="material-symbols-outlined text-amber-500 fill-1 text-xl">star</span>
                                                        <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                                                            {(() => {
                                                                const avg = Number(profileData?.averageRating);
                                                                return !Number.isNaN(avg) && avg > 0 ? avg.toFixed(1) : "—";
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {reviewsLoading ? (
                                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                                        <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
                                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Đang tải đánh giá...</p>
                                                    </div>
                                                ) : reviews.length === 0 ? (
                                                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                            <span className="material-symbols-outlined text-3xl text-slate-300">chat_bubble</span>
                                                        </div>
                                                        <h4 className="text-slate-900 dark:text-white font-black text-sm mb-1">Chưa có đánh giá nào</h4>
                                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Hoàn thành nhiều dự án hơn để nhận phản hồi</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {reviews.map((review: any) => (
                                                            <div key={review._id} className="p-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/40 hover:bg-white dark:hover:bg-slate-800/30 transition-all group">
                                                                <div className="flex items-start gap-4 mb-4">
                                                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0">
                                                                        {review.reviewerId?.avatar ? (
                                                                            <img src={review.reviewerId.avatar} alt="Reviewer" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                                <span className="material-symbols-outlined text-slate-300 text-xl">person</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-grow">
                                                                        <div className="flex items-center justify-between mb-0.5">
                                                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                                                {review.reviewerId?.firstName} {review.reviewerId?.lastName}
                                                                            </h4>
                                                                            <div className="flex gap-0.5">
                                                                                {[...Array(5)].map((_, i) => (
                                                                                    <span key={i} className={`material-symbols-outlined text-[14px] ${i < review.rating ? 'text-amber-500 fill-1' : 'text-slate-200 dark:text-slate-700'}`}>star</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.jobId?.title || "Dự án đã tham gia"}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">&quot;{review.comment || "Đánh giá tuyệt vời về đối tác này!"}&quot;</p>
                                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/5 rounded-md border border-emerald-500/10">
                                                                        <span className="material-symbols-outlined text-emerald-500 text-[12px]">verified</span>
                                                                        <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Đã xác thực</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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
                                        {activitiesLoading ? (
                                            <div className="col-span-full flex justify-center py-12">
                                                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                                            </div>
                                        ) : activities.length === 0 ? (
                                            <div className="col-span-full text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                                <p className="text-slate-500 font-bold">Chưa có hoạt động dự án nào.</p>
                                            </div>
                                        ) : activities.map((item: any) => {
                                            const isHRItem = profileData?.role === 'hr';
                                            const job = isHRItem ? item : item.jobId;
                                            const id = isHRItem ? item._id : item._id;
                                            const name = job?.title || "Dự án";
                                            const img = job?.image || (job?.images && job.images[0]) || "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?q=80&w=2070";
                                            const tag = job?.metadata?.location?.province || "Việt Nam";
                                            const statusText = isHRItem 
                                                ? (job?.status === 'COMPLETED' ? "Đã hoàn thành" : job?.status === 'APPROVED' ? "Đang tuyển" : job?.status)
                                                : (item.status === 'COMPLETED' ? "Đã tham gia" : "Đang tham gia");

                                            return (
                                                <div key={id} className="group relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                                                    <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end transform transition-transform group-hover:translate-y-[-5px]">
                                                        <p className="text-primary font-black uppercase text-[9px] tracking-widest mb-1">#{tag}</p>
                                                        <h4 className="text-white text-xl font-black mb-2 tracking-tighter">{name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[9px] font-black border border-white/20">{statusText}</span>
                                                            <Link href={`/jobs/${job?._id || ''}`} className="material-symbols-outlined text-white text-xl hover:text-primary transition-colors">arrow_right_alt</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                                            {activitiesLoading ? (
                                                <div className="flex justify-center py-6">
                                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                                                </div>
                                            ) : activities.length === 0 ? (
                                                <div className="text-center py-8 text-slate-500 font-bold">Chưa có nhật ký nào</div>
                                            ) : activities.map((item: any) => {
                                                const isHRItem = profileData?.role === 'hr';
                                                const job = isHRItem ? item : item.jobId;
                                                const id = isHRItem ? item._id : item._id;
                                                const roleOrType = isHRItem ? 'Dự án' : (job?.skills?.[0] || 'Lao động');
                                                const statusStr = isHRItem ? job?.status : item.status;
                                                const locText = job?.metadata?.location?.province || "Việt Nam";

                                                return (
                                                <div key={id} className="relative pl-10 pb-6 border-l-4 border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                                                    <div className="absolute left-[-10px] top-0 w-5 h-5 rounded-lg bg-white dark:bg-slate-900 border-4 border-primary shadow-[0_0_12px_rgba(59,130,246,0.4)] z-10 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    </div>

                                                    <div className="bg-slate-50/30 dark:bg-slate-800/5 p-5 rounded-xl border border-slate-100 dark:border-slate-800/40 hover:bg-white dark:hover:bg-slate-800/20 transition-all group">
                                                        <div className="flex flex-col md:flex-row justify-between gap-12">
                                                            <div className="space-y-2">
                                                                <p className="text-primary font-black uppercase text-[9px] tracking-widest">{job?.createdAt ? new Date(job.createdAt).toLocaleDateString("vi-VN") : "Gần đây"}</p>
                                                                <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tighter">{job?.title || "Công việc"}</h4>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-3 text-slate-400 font-black text-xs uppercase tracking-widest">
                                                                        <span className="material-symbols-outlined text-primary">business</span>
                                                                        {isHRItem ? locText : (job?.hrId?.companyName || "Công ty")}
                                                                    </div>
                                                                    <span className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                                        {roleOrType}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex flex-col justify-between">
                                                                <div className="flex items-center gap-2 justify-end text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                                                                    <span className="material-symbols-outlined text-lg">verified</span>
                                                                    Hợp đồng {statusStr === "COMPLETED" ? "đã hoàn thành" : 
                                                                              statusStr === "APPROVED" ? "đang tuyển" : 
                                                                              statusStr === "COMPLETION_PENDING" ? "chờ xác nhận" : 
                                                                              statusStr === "HIRED" ? "đang tham gia" : statusStr}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                            })}
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
                                                    const statusLabel: Record<string, string> = {
                                                        APPLIED: "Đã gửi",
                                                        ACCEPTED: "Đã chấp nhận",
                                                        REJECTED: "Bị từ chối",
                                                        HIRED: "Đã nhận việc",
                                                        COMPLETION_PENDING: "Chờ xác nhận hoàn thành",
                                                        COMPLETED: "Hoàn thành",
                                                    };
                                                    const statusText = statusLabel[app.status] ?? app.status;
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
                                                                    {(() => {
                                                                        const stars = Number(app.hrRating);
                                                                        if (!Number.isNaN(stars) && stars > 0) return (
                                                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1 inline-flex items-center gap-1">
                                                                                <span className="material-symbols-outlined text-amber-500 text-sm fill-amber-500">star</span>
                                                                                {stars.toFixed(1)} (nhà tuyển dụng đã đánh giá)
                                                                            </p>
                                                                        );
                                                                        return null;
                                                                    })()}
                                                                    {app.status === "REJECTED" && app.decisionReason && (
                                                                        <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-2">Lý do: {app.decisionReason}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <span className="px-4 py-2 rounded-full text-xs font-black bg-primary/10 text-primary">
                                                                        {statusText}
                                                                    </span>
                                                                    {(app.status === "HIRED" || app.status === "COMPLETION_PENDING") && (
                                                                        <ConfirmCompleteButton
                                                                            jobId={j?._id}
                                                                            applicationId={app._id}
                                                                            onSuccess={() => loadApplied()}
                                                                        />
                                                                    )}
                                                                    {app.status === "COMPLETED" && !app.hasWorkerReviewed && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setReviewModalApp(app);
                                                                                setReviewRating(5);
                                                                                setReviewComment("");
                                                                                setReviewError("");
                                                                            }}
                                                                            className="px-4 py-2 rounded-full text-xs font-black bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/30 transition-all"
                                                                        >
                                                                            Đánh giá HR
                                                                        </button>
                                                                    )}
                                                                    {app.status === "COMPLETED" && app.hasWorkerReviewed && (
                                                                        <span className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                                                                            Đã đánh giá
                                                                        </span>
                                                                    )}
                                                                    {j?._id && (
                                                                        <Link
                                                                            href={`/jobs/${j._id}`}
                                                                            className="px-4 py-2 rounded-full text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all"
                                                                        >
                                                                            Xem job
                                                                        </Link>
                                                                    )}
                                                                    {(app.hrId || (hr as any)?._id) && (
                                                                        <OpenChatButton
                                                                            hrId={(hr as any)?._id ?? app.hrId}
                                                                            companyName={company}
                                                                        />
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
                            {/* SAVED CONTRACTORS TAB */}
                            {activeTab === 'saved' && (
                                <motion.div
                                    key="saved"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className={cardStyle}>
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Nhà thầu đã lưu</h2>
                                                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-1">Danh sách đối tác bạn đang quan tâm</p>
                                            </div>
                                            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-black text-slate-500">
                                                {savedContractors.length} nhà thầu
                                            </span>
                                        </div>

                                        {savedLoading ? (
                                            <div className="flex items-center gap-3 text-slate-500 font-bold py-12 justify-center">
                                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                                                Đang tải...
                                            </div>
                                        ) : savedContractors.length === 0 ? (
                                            <div className="p-12 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                                                    <span className="material-symbols-outlined text-3xl">bookmark</span>
                                                </div>
                                                <p className="text-slate-500 font-bold mb-1">Chưa lưu nhà thầu nào.</p>
                                                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-6">Lưu các đối tác uy tín để dễ dàng theo dõi</p>
                                                <Link href="/jobs" className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                                                    Khám phá ngay
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {savedContractors.map((c: any) => (
                                                    <div key={c._id} className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 border-2 border-white dark:border-slate-700 shadow-sm">
                                                                {c.avatar ? (
                                                                    <img src={c.avatar} alt={c.companyName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                                                                        {c.companyName?.[0] || c.firstName?.[0] || "?"}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
                                                                        {c.companyName || `${c.firstName} ${c.lastName}`}
                                                                    </h4>
                                                                    {c.hrInfo?.verificationStatus === 'VERIFIED' && (
                                                                        <span className="material-symbols-outlined text-emerald-500 text-lg fill-1">verified</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-[9px] uppercase tracking-widest mb-3">
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-xs">location_on</span>
                                                                        {c.hrInfo?.address || "Việt Nam"}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-4">
                                                                    {c.hrInfo?.averageRating > 0 && (
                                                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-500/5 rounded-md border border-amber-500/10">
                                                                            <span className="material-symbols-outlined text-amber-500 text-[12px] fill-1">star</span>
                                                                            <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{c.hrInfo.averageRating.toFixed(1)}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1 font-black text-[9px] text-slate-400 uppercase tracking-widest">
                                                                        {c.hrInfo?.totalJobsPosted || 0} Dự án
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/40 flex gap-2">
                                                            <Link
                                                                href={`/hr/${c._id}/profile`}
                                                                className="flex-1 h-9 flex items-center justify-center rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
                                                            >
                                                                Xem hồ sơ
                                                            </Link>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await api.post('/api/users/contractors/save', { contractorId: c._id });
                                                                        loadSavedContractors();
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }}
                                                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-900/30 transition-all hover:bg-red-500 hover:text-white overflow-hidden group/btn"
                                                                title="Bỏ lưu"
                                                            >
                                                                <span className="material-symbols-outlined text-lg group-hover/btn:scale-110">bookmark_remove</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
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
                    </main >
                </div >
            </div >

            {/* Modal: Đánh giá HR (worker) */}
            {
                reviewModalApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !reviewSubmitting && setReviewModalApp(null)}>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Đánh giá nhà tuyển dụng</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {reviewModalApp.jobId?.title || "Công việc"} — {reviewModalApp.jobId?.hrId?.companyName || "Nhà tuyển dụng"}
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
                                    placeholder="Viết vài dòng về trải nghiệm làm việc..."
                                    className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm resize-none"
                                />
                            </div>
                            {reviewError && <p className="text-sm text-red-500 mb-3">{reviewError}</p>}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => !reviewSubmitting && setReviewModalApp(null)}
                                    className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={submitReview}
                                    disabled={reviewSubmitting}
                                    className="flex-1 py-2.5 rounded-xl font-bold bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all"
                                >
                                    {reviewSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Modal: Avatar Crop */}
            <AnimatePresence>
                {showCropModal && cropImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[75vh] border border-white/10"
                        >
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-20">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Căn chỉnh ảnh đại diện</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        Sử dụng chuột hoặc cảm ứng để kéo ảnh
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCropModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:rotate-90"
                                >
                                    <span className="material-symbols-outlined text-2xl">close</span>
                                </button>
                            </div>

                            <div className="relative flex-1 bg-black overflow-hidden">
                                <Cropper
                                    image={cropImage}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    onCropChange={setCrop}
                                    onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                                    onZoomChange={setZoom}
                                    cropShape="round"
                                    showGrid={false}
                                />
                            </div>

                            <div className="p-10 space-y-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-20">
                                <div className="flex items-center gap-8">
                                    <span className="material-symbols-outlined text-slate-400 text-2xl">zoom_out</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className="material-symbols-outlined text-slate-400 text-2xl">zoom_in</span>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCropModal(false)}
                                        className="flex-1 py-5 px-8 rounded-[1.5rem] font-black text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs tracking-[0.2em]"
                                    >
                                        HỦY BỎ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCropConfirm}
                                        className="flex-1 py-5 px-8 rounded-[1.5rem] font-black text-white bg-primary shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-[0.2em]"
                                    >
                                        CẮT & LƯU ẢNH
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <React.Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent animate-spin rounded-full" />
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Đang tải...</p>
            </div>
        }>
            <ProfileContent />
        </React.Suspense>
    );
}
