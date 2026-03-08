"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/api";
import Map, {
    NavigationControl,
    FullscreenControl,
    Marker,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const SKILL_OPTIONS = [
    "Thợ xây", "Thợ điện", "Thợ hàn", "Thợ mộc", "Thợ ống nước",
    "Thợ sơn", "Thợ cốp pha", "Thợ hoàn thiện", "Kỹ sư hiện trường", "Giám sát công trình"
];

type ProvinceOption = { name: string; code: number; lat?: number; lng?: number };
type DistrictOption = { name: string; code: number };
type WardOption = { name: string; code: number };

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;

export default function PostJobPage() {
    const searchParams = useSearchParams();
    const editJobId = searchParams.get("edit") || null;

    const [step, setStep] = useState(1);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loadingEdit, setLoadingEdit] = useState(!!editJobId);
    const [quotaInfo, setQuotaInfo] = useState<{
        packageName: string;
        jobPostLimit: number;
        jobPostUsed: number;
    } | null>(null);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createdJobId, setCreatedJobId] = useState<string | null>(null);
    const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
    const [districts, setDistricts] = useState<DistrictOption[]>([]);
    const [wards, setWards] = useState<WardOption[]>([]);
    const [form, setForm] = useState({
        title: "",
        jobType: "full-time",
        workers: "5",
        province: "",
        provinceCode: 0,
        district: "",
        districtCode: 0,
        ward: "",
        address: "",
        salary: "450",
        salaryType: "day",
        startDate: "2026-06-12",
        endDate: "",
        description: "",
        requirements: "",
        minExperienceYears: "" as string | number,
        verificationRequired: false,
        images: [] as string[],
    });
    const [imageUploading, setImageUploading] = useState(false);

    // Load danh sách tỉnh/thành từ API (có code để load quận/phường)
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/address/provinces");
                const json = await res.json();
                if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
                    const list = json.data as ProvinceOption[];
                    setProvinces(list);
                    const daNang = list.find((p) => p.name.includes("Đà Nẵng")) ?? list[0];
                    setForm((f) => ({
                        ...f,
                        province: f.province || daNang.name,
                        provinceCode: f.provinceCode || daNang.code,
                    }));
                    if (daNang.lat != null && daNang.lng != null) {
                        setMapCenter({ lat: daNang.lat, lng: daNang.lng });
                    } else {
                        setMapCenter({ lat: 16.0544, lng: 108.2022 });
                    }
                }
            } catch {
                const fallback: ProvinceOption[] = [
                    { name: "Thành phố Đà Nẵng", code: 48, lat: 16.0544, lng: 108.2022 },
                    { name: "Thành phố Hà Nội", code: 1, lat: 21.0285, lng: 105.8542 },
                    { name: "Thành phố Hồ Chí Minh", code: 79, lat: 10.8231, lng: 106.6297 },
                ];
                setProvinces(fallback);
                setForm((f) => ({ ...f, province: f.province || fallback[0].name, provinceCode: fallback[0].code }));
                setMapCenter({ lat: 16.0544, lng: 108.2022 });
            }
        };
        load();
    }, []);

    // Load quận/huyện khi chọn tỉnh
    useEffect(() => {
        if (!form.provinceCode) {
            setDistricts([]);
            return;
        }
        const load = async () => {
            try {
                const res = await fetch(`/api/address/districts/${form.provinceCode}`);
                const json = await res.json();
                if (json?.success && Array.isArray(json.data)) {
                    setDistricts(json.data);
                    setForm((prev) => ({ ...prev, district: "", districtCode: 0, ward: "" }));
                    setWards([]);
                } else {
                    setDistricts([]);
                }
            } catch {
                setDistricts([]);
            }
        };
        load();
    }, [form.provinceCode]);

    // Load phường/xã khi chọn quận/huyện
    useEffect(() => {
        if (!form.districtCode) {
            setWards([]);
            return;
        }
        const load = async () => {
            try {
                const res = await fetch(`/api/address/wards/${form.districtCode}`);
                const json = await res.json();
                if (json?.success && Array.isArray(json.data)) {
                    setWards(json.data);
                    setForm((prev) => ({ ...prev, ward: "" }));
                } else {
                    setWards([]);
                }
            } catch {
                setWards([]);
            }
        };
        load();
    }, [form.districtCode]);

    const handleProvinceChange = (provinceName: string) => {
        const p = provinces.find((x) => x.name === provinceName);
        if (p) {
            setForm((prev) => ({ ...prev, province: provinceName, provinceCode: p.code }));
            if (p.lat != null && p.lng != null) setMapCenter({ lat: p.lat, lng: p.lng });
        }
    };

    const handleDistrictChange = (districtName: string) => {
        const d = districts.find((x) => x.name === districtName);
        if (d) setForm((prev) => ({ ...prev, district: districtName, districtCode: d.code }));
    };

    const handleWardChange = (wardName: string) => {
        setForm((prev) => ({ ...prev, ward: wardName }));
    };

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    useEffect(() => {
        const fetchQuota = async () => {
            try {
                const res = await api.get("/api/payments/my-package");
                const data = res.data?.data;
                if (data) {
                    setQuotaInfo({
                        packageName: data.packageName,
                        jobPostLimit: data.jobPostLimit,
                        jobPostUsed: data.jobPostUsed,
                    });
                }
            } catch {
                // ignore, will rely on backend error if quota exceeded
            }
        };
        fetchQuota();
    }, []);

    // Load job for edit mode
    useEffect(() => {
        if (!editJobId || provinces.length === 0) {
            if (editJobId && provinces.length === 0) return;
            setLoadingEdit(false);
            return;
        }
        let cancelled = false;
        const load = async () => {
            try {
                const res = await api.get(`/api/jobs/${editJobId}`);
                if (cancelled || !res.data?.success || !res.data?.data) {
                    setLoadingEdit(false);
                    return;
                }
                const j = res.data.data as any;
                const loc = j.location || {};
                const sal = j.salary || {};
                // salary: backend amount in VND. day -> k, month -> millions
                const salaryNum = sal.unit === "month" ? Math.round(Number(sal.amount) / 1_000_000) : Math.round(Number(sal.amount) / 1_000);
                const salaryStr = String(salaryNum || "");
                const provinceName = loc.province || "";
                const prov = provinces.find((p) => p.name === provinceName) || provinces[0];
                setForm({
                    title: j.title || "",
                    jobType: (j as any).jobType || "full-time",
                    workers: String(j.workersNeeded ?? 5),
                    province: provinceName || prov?.name || "",
                    provinceCode: prov?.code ?? 0,
                    district: loc.city || "",
                    districtCode: 0,
                    ward: "",
                    address: loc.address || "",
                    salary: salaryStr,
                    salaryType: sal.unit === "month" ? "month" : "day",
                    startDate: j.startDate ? new Date(j.startDate).toISOString().slice(0, 10) : "2026-06-12",
                    endDate: j.endDate ? new Date(j.endDate).toISOString().slice(0, 10) : "",
                    description: j.description || "",
                    requirements: j.requirements || "",
                    minExperienceYears: j.minExperienceYears ?? "",
                    verificationRequired: Boolean(j.verificationRequired),
                    images: Array.isArray(j.images) ? j.images : [],
                });
                setSelectedSkills(Array.isArray(j.skills) ? j.skills : []);
                if (loc.lat != null && loc.lng != null) {
                    setMapCenter({ lat: Number(loc.lat), lng: Number(loc.lng) });
                }
            } catch (err) {
                if (!cancelled) setErrorMsg("Không tải được tin tuyển dụng. Bạn chỉ có thể chỉnh sửa tin nháp.");
            } finally {
                if (!cancelled) setLoadingEdit(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [editJobId, provinces]);

    const handleSubmit = async () => {
        if (submitting) return;
        setErrorMsg(null);
        setSubmitting(true);
        setSubmitError(null);

        const payload = {
            title: form.title,
            description: form.description,
            requirements: form.requirements,
            skills: selectedSkills,
            location: {
                province: form.province,
                city: form.district || form.province,
                address: [form.address, form.ward].filter(Boolean).join(", ") || form.address,
                ...(mapCenter && { lat: mapCenter.lat, lng: mapCenter.lng }),
            },
            salary: {
                amount: form.salaryType === "month" ? Number(form.salary || 0) * 1_000_000 : Number(form.salary || 0) * 1_000,
                unit: form.salaryType,
                currency: "VND",
            },
            workersNeeded: Number(form.workers),
            startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
            endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
            minExperienceYears: form.minExperienceYears !== "" ? Number(form.minExperienceYears) : undefined,
            verificationRequired: Boolean(form.verificationRequired),
            images: Array.isArray(form.images) ? form.images : [],
        };

        try {
            if (editJobId) {
                await api.put(`/api/jobs/${editJobId}`, payload);
                setCreatedJobId(editJobId);
                setSubmitted(true);
                return;
            }

            const createRes = await api.post("/api/jobs", payload);
            const jobId = createRes.data?.data?._id;
            setCreatedJobId(jobId);
            await api.post(`/api/jobs/${jobId}/submit`);
            setSubmitted(true);
        } catch (err: any) {
            const status = err?.response?.status;
            const msg =
                err?.response?.data?.message ||
                (status === 403
                    ? "Gói đăng tin chưa được kích hoạt. Vui lòng mua/kích hoạt gói để gửi duyệt."
                    : "Đăng tin thất bại. Vui lòng thử lại.");
            setErrorMsg(msg);
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Geocode địa chỉ cụ thể (số nhà, đường + phường/quận/tỉnh) để cập nhật marker bản đồ. Debounce 500ms để tránh gọi API liên tục khi gõ.
    useEffect(() => {
        if (!MAPBOX_TOKEN) return;

        const rawAddress = form.address.trim();
        if (rawAddress.length < 3) return;

        const query = [rawAddress, form.ward, form.district, form.province.trim()].filter(Boolean).join(", ");
        if (!query) return;

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            const fetchCoords = async () => {
                try {
                    setIsMapLoading(true);
                    const params = new URLSearchParams({
                        access_token: MAPBOX_TOKEN,
                        limit: "1",
                        country: "VN",
                        types: "address,place,locality,neighborhood",
                    });
                    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;

                    const res = await fetch(url, { signal: controller.signal });
                    if (!res.ok) throw new Error("Geocoding failed");

                    const data = await res.json();
                    const feature = data.features?.[0];
                    if (!feature) return;

                    const [lng, lat] = feature.center as [number, number];
                    setMapCenter({ lat, lng });
                } catch (err) {
                    // Giữ nguyên mapCenter khi geocode lỗi hoặc bị abort
                    if ((err as Error)?.name !== "AbortError") {
                        console.warn("Geocode address failed:", err);
                    }
                } finally {
                    setIsMapLoading(false);
                }
            };

            fetchCoords();
        }, 500);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [form.address, form.ward, form.district, form.province]);

    if (loadingEdit) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (submitted) {
        const isEdit = !!editJobId;
        return (
            <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] flex items-center justify-center px-6">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-white dark:bg-slate-900 rounded-[4rem] p-20 text-center max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800"
                >
                    <div className="w-32 h-32 bg-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30">
                        <span className="material-symbols-outlined text-white text-7xl">check_circle</span>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{isEdit ? "Đã cập nhật tin!" : "Đăng tin thành công!"}</h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mb-4">
                        Tin tuyển dụng <strong className="text-slate-900 dark:text-white">&quot;{form.title || "Tin của bạn"}&quot;</strong> {isEdit ? "đã được cập nhật." : "đã được đăng."}
                    </p>
                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-3xl p-6 mb-10 border border-sky-100 dark:border-sky-800/40">
                        <p className="text-sky-600 dark:text-sky-400 font-bold text-sm">
                            🤖 Hệ thống AI đang ghép nối lao động phù hợp trong bán kính 10km từ công trình của bạn...
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-center">
                            <p className="text-4xl font-black text-primary mb-1">24</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Lao động phù hợp</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 text-center">
                            <p className="text-4xl font-black text-emerald-500 mb-1">3.2km</p>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Khoảng cách TB</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setSubmitted(false); setStep(1); }}
                            className="flex-1 h-16 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
                        >
                            {editJobId ? "Chỉnh sửa tiếp" : "Đăng tin khác"}
                        </button>
                        <a href="/hr-dashboard" className="flex-1 h-16 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            Về Dashboard
                        </a>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#040816] pt-24 pb-24 transition-all duration-500">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-14"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-3xl">work</span>
                        </div>
                        <div>
                            <p className="text-xs font-black text-primary uppercase tracking-widest">BuildForce HR Portal</p>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{editJobId ? "Chỉnh sửa tin tuyển dụng" : "Đăng Nhu Cầu Nhân Lực"}</h1>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg ml-[72px]">
                        Kết nối với hàng nghìn lao động lành nghề được xác minh trong khu vực của bạn
                    </p>
                </motion.div>

                {quotaInfo && (
                    <div className="mb-8 ml-[72px]">
                        <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Gói hiện tại</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                    {quotaInfo.packageName} • Đã dùng {quotaInfo.jobPostUsed}/{quotaInfo.jobPostLimit === -1 ? "∞" : quotaInfo.jobPostLimit} tin
                                </p>
                            </div>
                            {quotaInfo.jobPostLimit !== -1 && quotaInfo.jobPostUsed >= quotaInfo.jobPostLimit && (
                                <a
                                    href="/hr-dashboard/packages"
                                    className="ml-4 text-xs font-black text-primary hover:underline"
                                >
                                    Hết lượt • Nâng cấp gói →
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-6 ml-[72px] max-w-xl">
                        <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 text-sm font-medium">
                            {errorMsg}
                        </div>
                    </div>
                )}

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-12">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-3 cursor-pointer`} onClick={() => s < step && setStep(s)}>
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-300 ${step === s ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-110' :
                                        step > s ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                    }`}>
                                    {step > s ? <span className="material-symbols-outlined text-2xl">check</span> : s}
                                </div>
                                <span className={`font-black text-sm hidden sm:block ${step === s ? 'text-primary' : step > s ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {s === 1 ? "Thông tin cơ bản" : s === 2 ? "Yêu cầu & Lịch" : "Mô tả & Xác nhận"}
                                </span>
                            </div>
                            {s < 3 && <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step > s ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1 */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">construction</span>
                                    Thông tin công trình
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Tiêu đề tin tuyển dụng *</label>
                                        <input
                                            id="job-title-input"
                                            type="text"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="VD: Thợ xây nhà phố - Khu đô thị Vinhomes Đà Nẵng"
                                            className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Loại hình công việc</label>
                                        <div className="flex gap-3">
                                            {["Theo ngày", "Theo tháng", "Dài hạn"].map((t, i) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setForm({ ...form, jobType: ["day", "month", "long-term"][i] })}
                                                    className={`flex-1 h-14 rounded-2xl font-black text-sm transition-all ${form.jobType === ["day", "month", "long-term"][i]
                                                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Số lượng cần tuyển</label>
                                        <div className="flex items-center gap-4 h-14 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6">
                                            <button onClick={() => setForm({ ...form, workers: String(Math.max(1, Number(form.workers) - 1)) })} className="text-primary font-black text-2xl hover:scale-110 transition-transform">-</button>
                                            <span className="flex-1 text-center text-2xl font-black text-slate-900 dark:text-white">{form.workers}</span>
                                            <button onClick={() => setForm({ ...form, workers: String(Number(form.workers) + 1) })} className="text-primary font-black text-2xl hover:scale-110 transition-transform">+</button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Tỉnh / Thành phố</label>
                                        <select
                                            id="province-select"
                                            value={form.province}
                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                            className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-primary transition-all appearance-none"
                                        >
                                            {provinces.length === 0 && <option value="">Đang tải...</option>}
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.name}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Quận / Huyện</label>
                                        <select
                                            id="district-select"
                                            value={form.district}
                                            onChange={(e) => handleDistrictChange(e.target.value)}
                                            disabled={districts.length === 0}
                                            className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-primary transition-all appearance-none disabled:opacity-60"
                                        >
                                            <option value="">{districts.length === 0 ? "Chọn tỉnh trước" : "Chọn quận/huyện"}</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.name}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Phường / Xã</label>
                                        <select
                                            id="ward-select"
                                            value={form.ward}
                                            onChange={(e) => handleWardChange(e.target.value)}
                                            disabled={wards.length === 0}
                                            className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-primary transition-all appearance-none disabled:opacity-60"
                                        >
                                            <option value="">{wards.length === 0 ? "Chọn quận/huyện trước" : "Chọn phường/xã"}</option>
                                            {wards.map((w) => (
                                                <option key={w.code} value={w.name}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Địa chỉ cụ thể (số nhà, đường)</label>
                                        <input
                                            type="text"
                                            value={form.address}
                                            onChange={e => setForm({ ...form, address: e.target.value })}
                                            placeholder="VD: 21 Huỳnh Văn Nghệ, Khu công nghiệp..."
                                            className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ảnh công trình (tùy chọn)</label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Thêm ảnh minh họa. Nhiều ảnh sẽ hiển thị dạng carousel trên tin tuyển dụng.</p>
                                        <div className="flex flex-wrap gap-4 items-start">
                                            {form.images.map((url, i) => (
                                                <div key={url} className="relative group">
                                                    <img src={url} alt="" className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600"
                                                        aria-label="Xóa ảnh"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                                <span className="material-symbols-outlined text-3xl text-slate-400">add_photo_alternate</span>
                                                <span className="text-xs font-bold text-slate-500 mt-1">Thêm</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    disabled={imageUploading}
                                                    onChange={async (e) => {
                                                        const files = e.target.files;
                                                        if (!files?.length) return;
                                                        setImageUploading(true);
                                                        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                                                        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                                                        try {
                                                            for (let i = 0; i < files.length; i++) {
                                                                const file = files[i];
                                                                const fd = new FormData();
                                                                fd.append("image", file);
                                                                const res = await fetch(`${baseUrl}/api/jobs/upload/image`, {
                                                                    method: "POST",
                                                                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                                                                    body: fd,
                                                                });
                                                                const data = await res.json();
                                                                if (!res.ok) {
                                                                    throw new Error(data?.message || `Upload failed ${res.status}`);
                                                                }
                                                                const url = data?.data?.url;
                                                                if (url) setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
                                                            }
                                                        } catch (err) {
                                                            console.error("Upload image failed", err);
                                                        } finally {
                                                            setImageUploading(false);
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {imageUploading && <p className="text-xs text-primary font-bold mt-2">Đang tải ảnh lên...</p>}
                                    </div>
                                </div>

                                {/* Map preview (Mapbox) */}
                                <div className="mt-6 relative h-80 md:h-96 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 group hover:border-primary transition-all">
                                    {MAPBOX_TOKEN && mapCenter ? (
                                        <Map
                                            key={`${mapCenter.lat}-${mapCenter.lng}`}
                                            initialViewState={{
                                                longitude: mapCenter.lng,
                                                latitude: mapCenter.lat,
                                                zoom: 12,
                                            }}
                                            mapStyle="mapbox://styles/mapbox/light-v11"
                                            mapboxAccessToken={MAPBOX_TOKEN}
                                            style={{ width: "100%", height: "100%" }}
                                            reuseMaps
                                        >
                                            <NavigationControl
                                                position="bottom-right"
                                                showCompass={false}
                                            />
                                            <FullscreenControl position="top-right" />
                                            <Marker
                                                longitude={mapCenter.lng}
                                                latitude={mapCenter.lat}
                                                anchor="bottom"
                                            >
                                                <span className="material-symbols-outlined text-3xl text-red-500 drop-shadow-md">
                                                    location_on
                                                </span>
                                            </Marker>
                                        </Map>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                                            <span className="material-symbols-outlined text-primary text-5xl mb-2 block">
                                                add_location_alt
                                            </span>
                                            <p className="font-black text-slate-700 dark:text-slate-300 text-sm">
                                                {MAPBOX_TOKEN
                                                    ? "Nhập địa chỉ để xem vị trí công trình trên bản đồ"
                                                    : "Chưa cấu hình MAPBOX_TOKEN • Vui lòng thêm NEXT_PUBLIC_MAPBOX_TOKEN vào env"}
                                            </p>
                                            <p className="text-xs text-slate-400 font-bold mt-1">
                                                {[form.address, form.ward, form.district, form.province].filter(Boolean).join(", ") || "Chọn địa điểm"} • Việt Nam
                                            </p>
                                            {isMapLoading && (
                                                <p className="mt-2 text-[10px] font-bold text-primary">
                                                    Đang tải bản đồ từ Mapbox...
                                                </p>
                                            )}
                                            {!isMapLoading && MAPBOX_TOKEN && form.address.trim().length >= 3 && !mapCenter && (
                                                <p className="mt-2 text-[10px] font-bold text-slate-400">
                                                    Chưa tìm thấy vị trí chính xác. Hãy kiểm tra lại địa chỉ.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                                        <div className="flex justify-end p-4">
                                            {MAPBOX_TOKEN && mapCenter && (
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMapModalOpen(true)}
                                                    className="pointer-events-auto flex items-center gap-1 bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg hover:bg-slate-900"
                                                >
                                                    <span className="material-symbols-outlined text-xs">
                                                        fullscreen
                                                    </span>
                                                    Xem bản đồ lớn
                                                </button>
                                            )}
                                        </div>
                                        <div className="self-end mb-4 mr-4 bg-white/90 dark:bg-slate-900/90 rounded-2xl px-4 py-2 shadow-lg">
                                            <p className="text-xs font-black text-slate-500">
                                                📍 {[form.ward, form.district, form.province].filter(Boolean).join(", ") || form.province || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                id="step1-next-btn"
                                onClick={() => setStep(2)}
                                className="w-full h-16 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
                            >
                                Tiếp theo <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">engineering</span>
                                    Kỹ năng & Thời gian làm việc
                                </h2>

                                <div className="mb-8">
                                    <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Kỹ năng yêu cầu</label>
                                    <div className="flex flex-wrap gap-3">
                                        {SKILL_OPTIONS.map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => toggleSkill(skill)}
                                                className={`px-6 py-3 rounded-2xl font-black text-sm transition-all ${selectedSkills.includes(skill)
                                                        ? "bg-primary text-white shadow-md shadow-primary/30 scale-105"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                                    }`}
                                            >
                                                {selectedSkills.includes(skill) && <span className="mr-1">✓</span>}
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedSkills.length > 0 && (
                                        <p className="mt-3 text-xs font-bold text-primary">✓ Đã chọn {selectedSkills.length} kỹ năng</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Mức lương *</label>
                                        <div className="relative flex">
                                            <input
                                                type="number"
                                                value={form.salary}
                                                onChange={e => setForm({ ...form, salary: e.target.value })}
                                                className="flex-1 h-16 pl-6 pr-4 rounded-l-2xl border-2 border-r-0 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black text-xl focus:outline-none focus:border-primary transition-all"
                                            />
                                            <div className="flex flex-col border-2 border-slate-100 dark:border-slate-700 rounded-r-2xl overflow-hidden">
                                                {["k/ngày", "tr/tháng"].map((unit, i) => (
                                                    <button
                                                        key={unit}
                                                        onClick={() => setForm({ ...form, salaryType: ["day", "month"][i] })}
                                                        className={`flex-1 px-4 text-xs font-black transition-all ${form.salaryType === ["day", "month"][i]
                                                                ? "bg-primary text-white"
                                                                : "bg-slate-50 dark:bg-slate-800 text-slate-500"
                                                            }`}
                                                    >
                                                        {unit}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            💰 {form.salary}k/{form.salaryType === 'day' ? 'ngày' : 'tháng'} (~{form.salaryType === 'day' ? Number(form.salary) * 25 : form.salary}k/tháng)
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={e => setForm({ ...form, startDate: e.target.value })}
                                            className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ngày kết thúc (dự kiến)</label>
                                        <input
                                            type="date"
                                            value={form.endDate}
                                            onChange={e => setForm({ ...form, endDate: e.target.value })}
                                            className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Kinh nghiệm tối thiểu (năm)</label>
                                        <select
                                            value={form.minExperienceYears}
                                            onChange={e => setForm({ ...form, minExperienceYears: e.target.value })}
                                            className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:border-primary transition-all appearance-none"
                                        >
                                            <option value="">Không yêu cầu</option>
                                            <option value="1">1 năm</option>
                                            <option value="2">2 năm</option>
                                            <option value="3">3 năm</option>
                                            <option value="5">5 năm trở lên</option>
                                        </select>
                                        <p className="mt-1.5 text-xs font-bold text-slate-500">Dùng cho Auto Match — chỉ hiện với lao động đủ kinh nghiệm</p>
                                    </div>

                                    <div className="md:col-span-2 mt-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.verificationRequired}
                                                onChange={e => setForm({ ...form, verificationRequired: e.target.checked })}
                                                className="w-5 h-5 rounded border-2 border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">Yêu cầu xác minh CCCD</span>
                                        </label>
                                        <p className="text-xs text-slate-500 mt-1.5 ml-8">Chỉ lao động đã xác minh mới thấy tin này (Auto Match)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Preview card */}
                            <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 dark:from-sky-500/5 dark:to-indigo-500/5 rounded-3xl p-6 border border-primary/20">
                                <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">👁 Xem trước tin đăng</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-xl">{form.title || "Tiêu đề công việc"}</h3>
                                        <p className="text-slate-500 font-bold text-sm mt-1">📍 {[form.ward, form.district, form.province].filter(Boolean).join(", ") || form.province || "—"} • 👥 {form.workers} người • 💰 {form.salary}k/{form.salaryType === 'day' ? 'ngày' : 'tháng'}</p>
                                    </div>
                                    <div className="bg-emerald-500 text-white rounded-2xl px-4 py-2 text-sm font-black">Đang tuyển</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="h-16 px-10 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    ← Quay lại
                                </button>
                                <button onClick={() => setStep(3)} className="flex-1 h-16 bg-primary text-white rounded-2xl font-black text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3">
                                    Tiếp theo <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">description</span>
                                    Mô tả & Yêu cầu
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Mô tả công việc</label>
                                        <textarea
                                            rows={4}
                                            value={form.description}
                                            onChange={e => setForm({ ...form, description: e.target.value })}
                                            placeholder="Mô tả chi tiết công việc, môi trường làm việc, phúc lợi..."
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-base focus:outline-none focus:border-primary transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Yêu cầu ứng viên</label>
                                        <textarea
                                            rows={3}
                                            value={form.requirements}
                                            onChange={e => setForm({ ...form, requirements: e.target.value })}
                                            placeholder="Kinh nghiệm tối thiểu, bằng cấp, chứng chỉ nghề..."
                                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-base focus:outline-none focus:border-primary transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Full summary */}
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 text-3xl">fact_check</span>
                                    Xác nhận thông tin
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { label: "Tiêu đề", value: form.title || "Chưa nhập" },
                                        { label: "Vị trí", value: [form.address, form.ward, form.district, form.province].filter(Boolean).join(", ") || form.province || "—" },
                                        { label: "Số lượng", value: `${form.workers} người` },
                                        { label: "Lương", value: `${form.salary}k/${form.salaryType === 'day' ? 'ngày' : 'tháng'}` },
                                        { label: "Kỹ năng", value: selectedSkills.length > 0 ? selectedSkills.join(", ") : "Chưa chọn" },
                                        { label: "Bắt đầu", value: form.startDate },
                                        { label: "KN tối thiểu", value: form.minExperienceYears !== "" ? `${form.minExperienceYears} năm` : "Không yêu cầu" },
                                        { label: "Xác minh CCCD", value: form.verificationRequired ? "Có" : "Không" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                            <span className="material-symbols-outlined text-primary text-xl mt-0.5">check_circle</span>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                                <p className="font-black text-slate-900 dark:text-white text-sm mt-1">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(2)} className="h-16 px-10 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    ← Quay lại
                                </button>
                                <button
                                    id="submit-job-btn"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 h-16 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-black text-xl hover:opacity-90 transition-all shadow-xl shadow-primary/40 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Đang đăng tin...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                                            Đăng tin ngay
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Fullscreen map modal */}
                {MAPBOX_TOKEN && mapCenter && isMapModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="relative w-full max-w-5xl mx-4">
                            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl h-[70vh]">
                                <Map
                                    key={`modal-${mapCenter.lat}-${mapCenter.lng}`}
                                    initialViewState={{
                                        longitude: mapCenter.lng,
                                        latitude: mapCenter.lat,
                                        zoom: 12,
                                    }}
                                    mapStyle="mapbox://styles/mapbox/light-v11"
                                    mapboxAccessToken={MAPBOX_TOKEN}
                                    style={{ width: "100%", height: "100%" }}
                                    reuseMaps
                                >
                                    <NavigationControl
                                        position="bottom-right"
                                        showCompass={false}
                                    />
                                    <FullscreenControl position="top-right" />
                                    <Marker
                                        longitude={mapCenter.lng}
                                        latitude={mapCenter.lat}
                                        anchor="bottom"
                                    >
                                        <span className="material-symbols-outlined text-3xl text-red-500 drop-shadow-md">
                                            location_on
                                        </span>
                                    </Marker>
                                </Map>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMapModalOpen(false)}
                                className="absolute -top-4 right-6 w-10 h-10 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-lg border border-slate-200"
                            >
                                <span className="material-symbols-outlined text-xl">
                                    close
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
