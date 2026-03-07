"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK INITIAL DATA ---
const INITIAL_CV_DATA = {
    personalInfo: {
        name: "Nguyễn Đình Thi",
        title: "Kỹ sư Kết cấu Cao cấp",
        email: "thi.nguyen@example.com",
        phone: "0901 234 567",
        address: "Sơn Trà, Đà Nẵng",
        website: "vn.linkedin.com/in/nguyendinhthi",
        avatar: ""
    },
    summary: "Kỹ sư kết cấu tận tâm với hơn 6 năm kinh nghiệm thực chiến trong các dự án nhà cao tầng, khu đô thị và công trình công nghiệp. Am hiểu toàn bộ vòng đời dự án từ bóc tách khối lượng, thiết kế biện pháp thi công, tổ chức nhân lực đến kiểm soát chất lượng và an toàn lao động. Luôn theo đuổi tiêu chuẩn thi công chính xác, tiến độ ổn định và chi phí tối ưu cho chủ đầu tư.",
    experiences: [
        {
            id: "1",
            role: "Kỹ sư kết cấu chính",
            company: "Delta Group - Đà Nẵng",
            duration: "01/2021 - Hiện tại",
            description: "Chỉ đạo thiết kế, kiểm tra và hiệu chỉnh phương án kết cấu cho 5 dự án nhà cao tầng và tổ hợp thương mại với tổng mức đầu tư trên 1000 tỷ VNĐ. Tổ chức phối hợp giữa bộ phận thiết kế – thi công – giám sát hiện trường để xử lý kịp thời các xung đột bản vẽ. Tối ưu hóa khoảng 10–15% khối lượng thép và vật liệu hoàn thiện mà vẫn đảm bảo tiêu chuẩn an toàn. Quản lý nhóm 10–15 kỹ sư/đội trưởng thi công, lập kế hoạch tiến độ tuần/tháng và báo cáo trực tiếp cho chỉ huy trưởng công trình."
        },
        {
            id: "2",
            role: "Kỹ sư giám sát",
            company: "Coteccons - Quảng Nam",
            duration: "06/2018 - 12/2020",
            description: "Giám sát thi công hạ tầng và phần kết cấu khu đô thị Smart City Zone A, trực tiếp theo dõi các hạng mục móng, cọc, sàn và hệ tường vách. Thiết lập quy trình kiểm tra cốt thép, cốp pha, cấp phối bê tông và nghiệm thu cùng tư vấn giám sát. Phối hợp với nhà thầu phụ xử lý các lỗi hiện trường, hạn chế tối đa phát sinh chi phí và thời gian."
        }
    ],
    education: [
        {
            id: "1",
            degree: "Cử nhân Kỹ thuật Xây dựng – Kết cấu công trình",
            school: "Đại học Bách Khoa Đà Nẵng",
            duration: "2014 - 2018"
        },
        {
            id: "2",
            degree: "Chứng chỉ An toàn lao động & Chỉ huy trưởng công trình",
            school: "Bộ Xây dựng / Bộ Lao động – Thương binh & Xã hội",
            duration: "2019 - 2022"
        }
    ],
    skills: [
        "Thiết kế & kiểm tra kết cấu (SAP2000, ETABS)",
        "Triển khai bản vẽ thi công chi tiết (AutoCAD, Revit/BIM cơ bản)",
        "Lập và kiểm soát tiến độ thi công (MS Project / Excel)",
        "Quản lý chất lượng & hồ sơ nghiệm thu",
        "Tổ chức, phân công và hướng dẫn đội nhóm thi công",
        "Giao tiếp & làm việc với chủ đầu tư, tư vấn giám sát",
        "Tiếng Anh chuyên ngành kỹ thuật ở mức khá"
    ]
};

export default function CVBuilderPage() {
    const router = useRouter();
    const [cvData, setCvData] = useState(INITIAL_CV_DATA);
    const [activeSection, setActiveSection] = useState("personalInfo");
    const [mounted, setMounted] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const getInitials = (name: string) => {
        if (!name) return "ND";
        const parts = name.trim().split(" ").filter(Boolean);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        const first = parts[0][0] || "";
        const last = parts[parts.length - 1][0] || "";
        return (first + last).toUpperCase();
    };

    useEffect(() => {
        setMounted(true);
        // We could load from localStorage here or API
        const saved = localStorage.getItem("buildforce_cv_data");
        if (saved) {
            try {
                setCvData(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved CV data", e);
            }
        }
    }, []);

    // Auto-save
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("buildforce_cv_data", JSON.stringify(cvData));
        }
    }, [cvData, mounted]);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === "string") {
                setCvData(prev => ({
                    ...prev,
                    personalInfo: {
                        ...prev.personalInfo,
                        avatar: result
                    }
                }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handlePrint = () => {
        window.print();
    };

    if (!mounted) return null;

    // --- RENDER HELPERS ---
    const updatePersonalInfo = (field: string, value: string) => {
        setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
    };

    const handleSkillAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
            const newSkill = e.currentTarget.value.trim();
            if (!cvData.skills.includes(newSkill)) {
                setCvData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
            }
            e.currentTarget.value = "";
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setCvData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
    };

    // Experience Handlers
    const addExperience = () => {
        setCvData(prev => ({
            ...prev,
            experiences: [...prev.experiences, { id: Date.now().toString(), role: "", company: "", duration: "", description: "" }]
        }));
    };
    const updateExperience = (id: string, field: string, value: string) => {
        setCvData(prev => ({
            ...prev,
            experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };
    const removeExperience = (id: string) => {
        setCvData(prev => ({ ...prev, experiences: prev.experiences.filter(exp => exp.id !== id) }));
    };

    // Education Handlers
    const addEducation = () => {
        setCvData(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now().toString(), degree: "", school: "", duration: "" }]
        }));
    };
    const updateEducation = (id: string, field: string, value: string) => {
        setCvData(prev => ({
            ...prev,
            education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
        }));
    };
    const removeEducation = (id: string) => {
        setCvData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
    };

    return (
        <div className="bg-[#fcfdff] dark:bg-[#040816] min-h-screen pt-20 pb-12 transition-all duration-1000 print:p-0 print:bg-white flex flex-col items-center">

            {/* BUILDER HEADER - HIDDEN ON PRINT */}
            <div className="w-full max-w-7xl px-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/profile')}
                        className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hồ sơ chuyên nghiệp (CV)</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tùy chỉnh và tải xuống dưới dạng PDF</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="h-11 px-6 bg-primary text-white rounded-xl font-bold text-sm shadow-[0_8px_25px_rgba(59,130,246,0.3)] flex items-center gap-2 hover:bg-blue-600 transition-all">
                        <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                        Tải xuống PDF
                    </button>
                </div>
            </div>

            <div className="w-full max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:p-0 print:m-0 print:max-w-none">

                {/* LEFT PANE: FORM BUILDER - HIDDEN ON PRINT */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden print:hidden lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
                    <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar">
                        {[
                            { id: "personalInfo", label: "Cá nhân", icon: "person" },
                            { id: "summary", label: "Tóm tắt", icon: "edit_note" },
                            { id: "experiences", label: "Kinh nghiệm", icon: "work" },
                            { id: "education", label: "Học vấn", icon: "school" },
                            { id: "skills", label: "Kỹ năng", icon: "psychology" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id)}
                                className={`flex-1 min-w-[100px] flex flex-col items-center justify-center gap-1.5 py-4 px-2 text-xs font-bold transition-colors select-none ${activeSection === tab.id
                                    ? "text-primary border-b-2 border-primary bg-primary/5"
                                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-6 custom-scrollbar">
                        {/* PERSONAL INFO FORM */}
                        {activeSection === "personalInfo" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xl shrink-0 overflow-hidden">
                                        {cvData.personalInfo.avatar ? (
                                            <img src={cvData.personalInfo.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{getInitials(cvData.personalInfo.name)}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => avatarInputRef.current?.click()}
                                            className="inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px] mr-1">photo_camera</span>
                                            Tải ảnh đại diện
                                        </button>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                            Nên dùng ảnh vuông, nền sáng, rõ khuôn mặt.
                                        </span>
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Họ và Tên</label>
                                    <input value={cvData.personalInfo.name} onChange={e => updatePersonalInfo("name", e.target.value)} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="Nguyễn Văn A" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Chức danh</label>
                                    <input value={cvData.personalInfo.title} onChange={e => updatePersonalInfo("title", e.target.value)} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="Kỹ sư xây dựng" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Email</label>
                                    <input value={cvData.personalInfo.email} onChange={e => updatePersonalInfo("email", e.target.value)} type="email" className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="email@example.com" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Số điện thoại</label>
                                    <input value={cvData.personalInfo.phone} onChange={e => updatePersonalInfo("phone", e.target.value)} type="tel" className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="0901 xxx xxx" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Địa chỉ (Thành phố)</label>
                                    <input value={cvData.personalInfo.address} onChange={e => updatePersonalInfo("address", e.target.value)} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="Hà Nội, Việt Nam" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Website / Linked in</label>
                                    <input value={cvData.personalInfo.website} onChange={e => updatePersonalInfo("website", e.target.value)} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="linkedin.com/in/username" />
                                </div>
                            </motion.div>
                        )}

                        {/* SUMMARY */}
                        {activeSection === "summary" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Đoạn giới thiệu ngắn về bản thân và mục tiêu nghề nghiệp</label>
                                <textarea value={cvData.summary} onChange={e => setCvData(prev => ({ ...prev, summary: e.target.value }))} rows={8} className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none" placeholder="Hãy viết về mục tiêu của bạn..."></textarea>
                            </motion.div>
                        )}

                        {/* EXPERIENCES */}
                        {activeSection === "experiences" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <AnimatePresence>
                                    {cvData.experiences.map((exp, index) => (
                                        <motion.div key={exp.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 relative group">
                                            <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-slate-900 text-red-500 rounded-md shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                            <div className="space-y-3 mt-1">
                                                <input value={exp.role} onChange={e => updateExperience(exp.id, "role", e.target.value)} placeholder="Vị trí (VD: Thợ mộc chính)" className="w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none text-slate-900 dark:text-white placeholder:text-slate-400" />
                                                <input value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} placeholder="Tên dự án / Công ty (VD: Dự án Vinhome)" className="w-full text-sm bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
                                                <input value={exp.duration} onChange={e => updateExperience(exp.id, "duration", e.target.value)} placeholder="Thời gian (VD: 01/2022 - 12/2023)" className="w-full text-xs font-semibold uppercase tracking-widest text-slate-500 bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none placeholder:text-slate-400/50" />
                                                <textarea value={exp.description} onChange={e => updateExperience(exp.id, "description", e.target.value)} placeholder="Mô tả công việc đã làm..." rows={3} className="w-full text-sm mt-2 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none text-slate-700 dark:text-slate-300 resize-none placeholder:text-slate-400"></textarea>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <button onClick={addExperience} className="w-full h-11 border-2 border-dashed border-primary/40 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Thêm kinh nghiệm
                                </button>
                            </motion.div>
                        )}

                        {/* EDUCATION */}
                        {activeSection === "education" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <AnimatePresence>
                                    {cvData.education.map((edu, index) => (
                                        <motion.div key={edu.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 relative group">
                                            <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 w-7 h-7 bg-white dark:bg-slate-900 text-red-500 rounded-md shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                            <div className="space-y-3 mt-1">
                                                <input value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} placeholder="Bằng cấp / Chuyên ngành (VD: Cử nhân Kiến trúc)" className="w-full text-sm font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none text-slate-900 dark:text-white placeholder:text-slate-400" />
                                                <input value={edu.school} onChange={e => updateEducation(edu.id, "school", e.target.value)} placeholder="Tên trường học / Trung tâm đào tạo" className="w-full text-sm bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
                                                <input value={edu.duration} onChange={e => updateEducation(edu.id, "duration", e.target.value)} placeholder="Thời gian (VD: 2018 - 2022)" className="w-full text-xs font-semibold uppercase tracking-widest text-slate-500 bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1 outline-none placeholder:text-slate-400/50" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <button onClick={addEducation} className="w-full h-11 border-2 border-dashed border-primary/40 text-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Thêm học vấn
                                </button>
                            </motion.div>
                        )}

                        {/* SKILLS */}
                        {activeSection === "skills" && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Thêm kỹ năng (Nhấn Enter để thêm)</label>
                                    <input onKeyDown={handleSkillAdd} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="VD: Lên bản vẽ 3D..." />
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <AnimatePresence>
                                        {cvData.skills.map(skill => (
                                            <motion.span key={skill} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2">
                                                {skill}
                                                <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANE: LIVE PREVIEW & PDF TEMPLATE */}
                <div className="lg:col-span-8 overflow-x-auto print:overflow-visible flex justify-center pb-12 print:pb-0 hide-scrollbar">
                    {/* A4 Paper Container */}
                    <div className="bg-white text-black shrink-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-[210mm] min-h-[297mm] h-max relative print:shadow-none print:w-full">
                        {/* --- THE CV DESIGN --- */}
                        <div className="p-[12mm]">

                            {/* Header Section */}
                            <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between gap-6">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-4xl font-black uppercase text-slate-900 tracking-tighter" style={{ fontFamily: "Inter, sans-serif" }}>
                                        {cvData.personalInfo.name || "Họ và Tên"}
                                    </h1>
                                    <h2 className="text-xl font-medium text-slate-600 tracking-wide mt-1 uppercase">
                                        {cvData.personalInfo.title || "Chức danh nghiệp vụ"}
                                    </h2>

                                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
                                        {cvData.personalInfo.email && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">mail</span>
                                                {cvData.personalInfo.email}
                                            </div>
                                        )}
                                        {cvData.personalInfo.phone && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">call</span>
                                                {cvData.personalInfo.phone}
                                            </div>
                                        )}
                                        {cvData.personalInfo.address && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                {cvData.personalInfo.address}
                                            </div>
                                        )}
                                        {cvData.personalInfo.website && (
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">language</span>
                                                {cvData.personalInfo.website}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Avatar block */}
                                <div className="w-[90px] h-[90px] rounded-full border border-slate-300 flex items-center justify-center overflow-hidden">
                                    {cvData.personalInfo.avatar ? (
                                        <img
                                            src={cvData.personalInfo.avatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl tracking-tight">
                                            {getInitials(cvData.personalInfo.name || "")}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="w-full flex">
                                {/* Left Column: Summary & Experience (70%) */}
                                <div className="w-[65%] pr-6 border-r border-slate-200">

                                    {cvData.summary && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-3 flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-sm bg-slate-900 flex items-center justify-center text-white text-[10px]">
                                                    <span className="material-symbols-outlined text-[12px]">person</span>
                                                </span>
                                                Mục tiêu nghề nghiệp
                                            </h3>
                                            <p className="text-sm text-slate-700 leading-relaxed text-justify">
                                                {cvData.summary}
                                            </p>
                                        </div>
                                    )}

                                    {cvData.experiences.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-5 flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-sm bg-slate-900 flex items-center justify-center text-white text-[10px]">
                                                    <span className="material-symbols-outlined text-[12px]">work</span>
                                                </span>
                                                Kinh nghiệm làm việc
                                            </h3>

                                            <div className="space-y-6">
                                                {cvData.experiences.map((exp, i) => (
                                                    <div key={exp.id || i} className="relative">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <h4 className="text-base font-bold text-slate-900">{exp.role}</h4>
                                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{exp.duration}</span>
                                                        </div>
                                                        <p className="text-[13px] font-semibold text-slate-600 mb-2">{exp.company}</p>
                                                        <p className="text-[13px] text-slate-700 leading-relaxed text-justify">
                                                            {exp.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Education & Skills (30%) */}
                                <div className="w-[35%] pl-6">

                                    {cvData.education.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-4 flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-sm bg-slate-900 flex items-center justify-center text-white">
                                                    <span className="material-symbols-outlined text-[12px]">school</span>
                                                </span>
                                                Học vấn
                                            </h3>

                                            <div className="space-y-4">
                                                {cvData.education.map((edu, i) => (
                                                    <div key={edu.id || i}>
                                                        <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-widest">{edu.duration}</p>
                                                        <h4 className="text-[13px] font-bold text-slate-900">{edu.degree}</h4>
                                                        <p className="text-[12px] text-slate-600">{edu.school}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {cvData.skills.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 mb-4 flex items-center gap-2">
                                                <span className="w-4 h-4 rounded-sm bg-slate-900 flex items-center justify-center text-white text-[10px]">
                                                    <span className="material-symbols-outlined text-[12px]">psychology</span>
                                                </span>
                                                Kỹ năng
                                            </h3>

                                            <ul className="list-disc list-inside space-y-1">
                                                {cvData.skills.map((skill, i) => (
                                                    <li key={i} className="text-[13px] text-slate-700 font-medium">
                                                        {skill}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Tailwind style for hiding scrollbar directly if possible */}
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #334155;
                }
                @media print {
                    @page { margin: 0; size: auto; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
