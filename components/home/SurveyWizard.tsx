"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Job {
    id: string;
    title: string;
    location: string;
    matchScore: number;
    salary: string;
    company: string;
}

interface SurveyWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

const TRADE_OPTIONS = [
    { label: "Thợ điện", value: "electrician", icon: "bolt" },
    { label: "Thợ ống nước", value: "plumber", icon: "water_drop" },
    { label: "Thợ mộc", value: "carpenter", icon: "architecture" },
    { label: "Thợ hàn", value: "welder", icon: "precision_manufacturing" },
    { label: "Thợ sắt / Thép", value: "ironworker", icon: "construction" },
    { label: "Thợ xây / Nề", value: "mason", icon: "foundation" },
    { label: "Thợ sơn", value: "painter", icon: "format_paint" },
    { label: "Thợ ốp lát", value: "tiler", icon: "grid_4x4" },
    { label: "Thợ lợp mái", value: "roofer", icon: "roofing" },
    { label: "Thợ lắp đặt điều hòa", value: "hvac", icon: "ac_unit" },
    { label: "Thợ lắp kính / Nhôm kính", value: "glazier", icon: "window" },
    { label: "Vận hành máy xúc / Máy ủi", value: "heavy_equipment", icon: "engineering" },
    { label: "Vận hành cần cẩu", value: "crane_operator", icon: "crisis_alert" },
    { label: "Kỹ sư xây dựng", value: "civil_engineer", icon: "engineering" },
    { label: "Giám sát công trình", value: "site_supervisor", icon: "supervisor_account" },
    { label: "Thợ lắp điện nội thất", value: "electrical_installer", icon: "electrical_services" },
    { label: "Thợ bảo trì / Sửa chữa", value: "maintenance", icon: "build" },
    { label: "Lao động phổ thông", value: "general", icon: "groups" },
    { label: "Khác (tự nhập)", value: "other", icon: "edit_note" },
];

const PREFERRED_PROVINCES = [
    "Đà Nẵng", "Hà Nội", "TP.HCM", "Quảng Nam", "Huế", "Bình Dương", "Đồng Nai", "Cần Thơ", "Hải Phòng", "Khánh Hòa"
];

const STEPS = [
    {
        id: "trade",
        title: "Ngành nghề của bạn là gì?",
        description: "Chọn ngành chuyên môn chính của bạn. Có thể gõ ngành khác nếu không có trong danh sách.",
        options: TRADE_OPTIONS,
    },
    {
        id: "experience",
        title: "Số năm kinh nghiệm?",
        description: "Điều này giúp chúng tôi xác định mức lương phù hợp.",
        options: [
            { label: "Dưới 1 năm", value: "0-1", icon: "star_outline" },
            { label: "1-3 năm", value: "1-3", icon: "star_half" },
            { label: "3-5 năm", value: "3-5", icon: "star" },
            { label: "Trên 5 năm", value: "5+", icon: "workspace_premium" },
        ],
    },
    {
        id: "availability",
        title: "Khi nào bạn có thể bắt đầu?",
        description: "Các dự án có khung thời gian khác nhau.",
        options: [
            { label: "Ngay lập tức", value: "immediately", icon: "flash_on" },
            { label: "Trong 1 tuần", value: "1-week", icon: "calendar_today" },
            { label: "Trong 1 tháng", value: "1-month", icon: "event" },
            { label: "Chỉ tìm hiểu", value: "just-browsing", icon: "search" },
        ],
    },
    {
        id: "location_pref",
        title: "Khu vực làm việc?",
        description: "Bạn sẵn sàng đi làm xa bao nhiêu?",
        options: [
            { label: "Chỉ trong thành phố", value: "local", icon: "location_home" },
            { label: "Trong tỉnh", value: "regional", icon: "distance" },
            { label: "Toàn quốc", value: "national", icon: "public" },
        ],
    },
];

export const SurveyWizard: React.FC<SurveyWizardProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({
        trade: "",
        tradeOther: "", // Ngành tự nhập khi chọn "Khác"
        experience: "",
        availability: "",
        location_pref: "",
        preferredCity: "", // Tỉnh/thành cho Auto Match (khi chọn local/regional)
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);
    const [isComplete, setIsComplete] = useState(false); // Changed from showResults to isComplete

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleOptionSelect = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Khi chọn "Khác" ở bước ngành nghề thì không tự chuyển bước — user cần nhập text
        if (field === "trade" && value === "other") return;
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const canProceedFromCurrentStep = (): boolean => {
        const field = STEPS[currentStep].id;
        const value = formData[field];
        if (!value) return false;
        if (field === "trade" && value === "other") {
            return (formData.tradeOther || "").trim().length > 0;
        }
        if (field === "location_pref" && (value === "local" || value === "regional")) {
            return (formData.preferredCity || "").trim().length > 0;
        }
        return true;
    };

    const getPayload = () => {
        const payload = { ...formData };
        if (payload.trade === "other" && payload.tradeOther) {
            payload.tradeCustom = payload.tradeOther;
        }
        const locPref = payload.location_pref;
        const radius = locPref === "national" ? 999 : locPref === "regional" ? 50 : 10;
        const city = (locPref === "local" || locPref === "regional") && payload.preferredCity
            ? payload.preferredCity
            : locPref === "national"
            ? "Toàn quốc"
            : "Không xác định";
        (payload as any).preferredLocation = { city, radius };
        return payload;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/survey`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(getPayload())
            });

            const result = await response.json();
            if (result.success) {
                setMatchedJobs(result.data.matchedJobs);
                setIsComplete(true);
            } else {
                // If unauthorized or error, still show mock results for demo if needed
                console.warn("Survey API failed, showing mock results for demo");
                setMatchedJobs([
                    { id: '1', title: 'Thợ điện cao cấp', location: 'Đà Nẵng', matchScore: 92, salary: '15M - 20M', company: 'BuildForce Construction' },
                    { id: '2', title: 'Kỹ sư xây dựng', location: 'Hội An', matchScore: 88, salary: '25M - 35M', company: 'Urban Builders' },
                    { id: '3', title: 'Chuyên gia hàn', location: 'Đà Nẵng', matchScore: 85, salary: '12M - 18M', company: 'Steel Master Co.' },
                    { id: '4', title: 'Quản đốc công trình', location: 'Tam Kỳ', matchScore: 82, salary: '20M - 30M', company: 'D&N Development' },
                    { id: '5', title: 'Thợ sơn', location: 'Đà Nẵng', matchScore: 78, salary: '8M - 12M', company: 'Color Plus' }
                ]);
                setIsComplete(true);
            }
        } catch (error) {
            console.error("Error submitting survey:", error);
            setIsComplete(true); // Show mock results even on error for design demo
        } finally {
            setIsSubmitting(false);
        }
    };

    // Removed toggleSkill and renderStepContent as the new structure handles options differently

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">Khảo sát chuyên nghiệp</h2>
                        <p className="text-sm text-slate-500">Tìm dự án phù hợp hoàn hảo với bạn</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title="Đóng"
                    >
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {isSubmitting ? (
                            <motion.div
                                key="submitting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <div>
                                    <h3 className="text-2xl font-bold dark:text-white mb-2">Đang tìm các dự án phù hợp...</h3>
                                    <p className="text-slate-500">AI đang phân tích câu trả lời của bạn.</p>
                                </div>
                            </motion.div>
                        ) : isComplete ? (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full mb-6">
                                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                                    </div>
                                    <h3 className="text-3xl font-bold dark:text-white mb-2">Đã tìm thấy dự án phù hợp!</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Dựa trên kinh nghiệm của bạn, đây là các gợi ý hàng đầu:</p>
                                </div>

                                <div className="space-y-4">
                                    {matchedJobs.map((job) => (
                                        <div key={job.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:border-primary transition-colors">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-lg dark:text-white">{job.title}</h4>
                                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 text-xs font-bold rounded-full">
                                                        {job.matchScore}% Phù hợp
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                                    {job.location} • <span className="text-primary font-bold">{job.salary}</span>
                                                </p>
                                            </div>
                                            <button className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-sky-600 transition-colors">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        Để sau
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full">
                                    <motion.div
                                        className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                                    />
                                </div>

                                <div>
                                    <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                                        {STEPS[currentStep].title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                                        {STEPS[currentStep].description}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
                                        {STEPS[currentStep].options.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleOptionSelect(STEPS[currentStep].id, option.value)}
                                                className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 shrink-0 ${formData[STEPS[currentStep].id] === option.value
                                                    ? "border-primary bg-sky-50 dark:bg-sky-900/20"
                                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                                    }`}
                                            >
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${formData[STEPS[currentStep].id] === option.value
                                                    ? "bg-primary text-white"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                    }`}>
                                                    <span className="material-symbols-outlined text-xl">{option.icon}</span>
                                                </div>
                                                <span className={`text-base font-bold truncate ${formData[STEPS[currentStep].id] === option.value
                                                    ? "text-primary"
                                                    : "text-slate-700 dark:text-slate-300"
                                                    }`}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    {STEPS[currentStep].id === "trade" && formData.trade === "other" && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="pt-2"
                                        >
                                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                                Nhập ngành nghề của bạn
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.tradeOther}
                                                onChange={(e) => setFormData(prev => ({ ...prev, tradeOther: e.target.value }))}
                                                placeholder="Ví dụ: Thợ lắp đặt camera, Kỹ thuật viên PCCC..."
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                autoFocus
                                            />
                                        </motion.div>
                                    )}
                                    {STEPS[currentStep].id === "location_pref" && (formData.location_pref === "local" || formData.location_pref === "regional") && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="pt-4"
                                        >
                                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                Tỉnh / Thành phố bạn muốn làm việc
                                            </label>
                                            <select
                                                value={formData.preferredCity}
                                                onChange={(e) => setFormData(prev => ({ ...prev, preferredCity: e.target.value }))}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            >
                                                <option value="">— Chọn tỉnh/thành —</option>
                                                {PREFERRED_PROVINCES.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-slate-500 mt-1.5">Giúp gợi ý công việc đúng khu vực</p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                {!isComplete && !isSubmitting && (
                    <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30"
                        >
                            <span className="material-symbols-outlined">west</span>
                            Quay lại
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!canProceedFromCurrentStep()}
                            className="bg-primary hover:bg-sky-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {currentStep === STEPS.length - 1 ? "Xem kết quả" : "Tiếp theo"}
                            <span className="material-symbols-outlined">east</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
