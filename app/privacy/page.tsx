"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
    const [lang, setLang] = useState<"vi" | "en">("vi");

    const content = {
        vi: {
            title: "Chính Sách Bảo Mật - BuildForce",
            lastUpdated: "Cập nhật lần cuối: 4 tháng 3, 2024",
            sections: [
                {
                    title: "I. Dữ liệu thu thập",
                    content: "Chúng tôi thu thập thông tin cần thiết để xác minh và kết nối nhân lực: Họ tên, tuổi, số điện thoại, khu vực làm việc, kinh nghiệm và bằng cấp liên quan. Các tệp tin bằng cấp được lưu trữ trên hệ thống lưu trữ đám mây bảo mật."
                },
                {
                    title: "II. Bảo vệ thông tin nhạy cảm (CCCD)",
                    content: "Thông tin CCCD không được lưu dưới dạng văn bản rõ. Hệ thống chỉ lưu trữ mã Hash của CCCD và trạng thái xác minh (True/False). Nhà tuyển dụng (HR) TUYỆT ĐỐI không được quyền xem hoặc tải dữ liệu CCCD của người lao động."
                },
                {
                    title: "III. Quyền truy cập dữ liệu",
                    content: "Chỉ Admin và hệ thống xác minh tự động mới có quyền truy cập trạng thái xác minh hồ sơ. Người lao động được quyền xem hồ sơ công khai của HR (uy tín, lịch sử công trình) để đảm bảo tính minh bạch."
                },
                {
                    title: "IV. Sử dụng thông tin",
                    content: "Dữ liệu được sử dụng để: (1) Xác minh danh tính, (2) AI Matching tìm việc phù hợp, (3) Giao tiếp nội bộ, (4) Xử lý thanh toán và tranh chấp. Chúng tôi không chia sẻ dữ liệu cho bên thứ ba ngoại trừ các đối tác tích hợp (Google Map, PayOS, VNPT/Viettel CA)."
                },
                {
                    title: "V. Quyền của người dùng",
                    content: "Người dùng có quyền yêu cầu chỉnh sửa, cập nhật hoặc xóa hoàn toàn dữ liệu cá nhân khỏi hệ thống. BuildForce cam kết tuân thủ Luật bảo vệ dữ liệu cá nhân của Việt Nam."
                },
                {
                    title: "VI. Bảo mật hệ thống",
                    content: "Toàn bộ hành động trên hệ thống đều được lưu Log. Chúng tôi sử dụng các biện pháp mã hóa và phân quyền nghiêm ngặt để ngăn chặn truy cập trái phép."
                }
            ]
        },
        en: {
            title: "Privacy Policy - BuildForce",
            lastUpdated: "Last Updated: March 4, 2024",
            sections: [
                {
                    title: "I. Data Collection",
                    content: "We collect necessary information for verification and recruitment: Full name, age, phone number, work area, experience, and relevant certifications. Certification files are stored on secure cloud storage."
                },
                {
                    title: "II. Protection of Sensitive Info (ID Card)",
                    content: "Citizen ID (CCCD) information is not stored in plain text. The system only stores the Hash of the ID and verification status (True/False). Employers (HR) are STRICTLY prohibited from viewing or downloading worker ID data."
                },
                {
                    title: "III. Data Access Rights",
                    content: "Only Admins and the automated verification system have access to profile verification statuses. Workers have the right to view HR's public profile (reputation, project history) to ensure transparency."
                },
                {
                    title: "IV. Use of Information",
                    content: "Data is used for: (1) Identity verification, (2) AI Matching for suitable jobs, (3) Internal communication, (4) Payment and dispute processing. We do not share data with third parties except for integrated partners (Google Map, PayOS, VNPT/Viettel CA)."
                },
                {
                    title: "V. User Rights",
                    content: "Users have the right to request modification, update, or complete deletion of personal data from the system. BuildForce is committed to complying with Vietnam's personal data protection laws."
                },
                {
                    title: "VI. System Security",
                    content: "All system actions are logged. We use strict encryption and authorization measures to prevent unauthorized access."
                }
            ]
        }
    };

    const activeContent = content[lang];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-12 pb-12">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex justify-between items-center mb-8">
                        <Link href="/signin" className="flex items-center gap-2 text-[#10B981] font-bold hover:gap-3 transition-all">
                            <span className="material-symbols-outlined">arrow_back</span>
                            {lang === "vi" ? "Quay lại Đăng ký" : "Back to Registry"}
                        </Link>

                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setLang("vi")}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${lang === "vi" ? "bg-white dark:bg-slate-700 shadow-sm text-[#10B981]" : "text-slate-500"}`}
                            >
                                Tiếng Việt
                            </button>
                            <button
                                onClick={() => setLang("en")}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${lang === "en" ? "bg-white dark:bg-slate-700 shadow-sm text-[#10B981]" : "text-slate-500"}`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4"
                    >
                        {activeContent.title}
                    </motion.h1>
                    <p className="text-slate-500 font-medium">{activeContent.lastUpdated}</p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-6 mt-12">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="space-y-12">
                        {activeContent.sections.map((section, index) => (
                            <motion.section
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                                    <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 text-[#10B981] rounded-lg flex items-center justify-center text-sm font-black">
                                        <span className="material-symbols-outlined text-sm">security</span>
                                    </span>
                                    {section.title}
                                </h2>
                                <div className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed ml-11">
                                    {section.content}
                                </div>
                            </motion.section>
                        ))}
                    </div>

                    <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <div className="flex gap-4">
                                <span className="material-symbols-outlined text-[#10B981] text-3xl">verified_user</span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                                        {lang === "vi" ? "Dữ liệu của bạn được bảo mật" : "Your data is secure"}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {lang === "vi"
                                            ? "Chúng tôi cam kết không bao giờ bán dữ liệu của bạn cho bất kỳ bên thứ ba nào."
                                            : "We commit to never selling your data to any third party."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
