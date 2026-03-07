"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsOfService() {
    const [lang, setLang] = useState<"vi" | "en">("vi");

    const content = {
        vi: {
            title: "Điều Khoản Dịch Vụ - BuildForce",
            lastUpdated: "Cập nhật lần cuối: 4 tháng 3, 2024",
            sections: [
                {
                    title: "I. Mục tiêu hệ thống",
                    content: "BuildForce xây dựng nền tảng kết nối cung – cầu nhân lực địa phương trên toàn bộ các tỉnh thành Việt Nam, tập trung vào các công trình xây dựng và lao động kỹ thuật, cho phép doanh nghiệp/HR đăng tuyển, người lao động tìm việc, xác minh thông tin, quản lý giao dịch và giám sát bởi hệ thống trung tâm."
                },
                {
                    title: "II. Vai trò của nền tảng",
                    content: "BuildForce đóng vai trò là nền tảng kết nối trung gian, không phải là đơn vị sử dụng lao động trực tiếp. Chúng tôi cung cấp công cụ để các bên tìm kiếm và giao tiếp với nhau."
                },
                {
                    title: "III. Đối tượng sử dụng & Tài khoản",
                    content: "Hệ thống hỗ trợ 3 vai trò chính: Người lao động (Employee), Nhà tuyển dụng (HR/Contractor) và Quản trị viên (Admin). Mỗi cá nhân chỉ sử dụng một tài khoản duy nhất, có thể kích hoạt hồ sơ Người lao động hoặc HR."
                },
                {
                    title: "IV. Quy trình tuyển dụng",
                    content: "Nhà tuyển dụng đăng tin công trình (đã qua kiểm duyệt). Người lao động tìm kiếm và ứng tuyển (Apply). Toàn bộ quá trình giao tiếp phải thực hiện qua hệ thống chat nội bộ để đảm bảo an toàn và lưu vết lịch sử."
                },
                {
                    title: "V. Thanh toán & Gói dịch vụ",
                    content: "Chúng tôi tích hợp cổng thanh toán PayOS. HR có thể chọn các gói dịch vụ (Free, Pro, Enterprise) để mở rộng tính năng đăng tuyển và AI matching. Mọi giao dịch đều được ghi lại trong lịch sử hệ thống."
                },
                {
                    title: "VI. Đánh giá & Tranh chấp",
                    content: "BuildForce áp dụng hệ thống đánh giá 2 chiều. Trong trường hợp xảy ra tranh chấp, Admin sẽ là bên trung gian xử lý dựa trên lịch sử log và bằng chứng cung cấp."
                },
                {
                    title: "VII. Vi phạm & Xử lý (Blacklist)",
                    content: "Các hành vi lừa đảo, quỵt lương, hoặc giao dịch ngoài hệ thống nhằm trục lợi sẽ bị xử lý nghiêm. Tài khoản vi phạm sẽ bị đưa vào Danh sách đen (Blacklist) và công khai trạng thái vi phạm để bảo vệ cộng đồng."
                }
            ]
        },
        en: {
            title: "Terms of Service - BuildForce",
            lastUpdated: "Last Updated: March 4, 2024",
            sections: [
                {
                    title: "I. System Objective",
                    content: "BuildForce builds a platform connecting local labor supply and demand across all provinces of Vietnam, focusing on construction projects and technical labor, allowing businesses/HR to post jobs, workers to find jobs, verify information, manage transactions, and be monitored by a central system."
                },
                {
                    title: "II. Platform Role",
                    content: "BuildForce acts as an intermediary connection platform, not a direct employer. We provide tools for parties to find and communicate with each other."
                },
                {
                    title: "III. Users & Accounts",
                    content: "The system supports 3 main roles: Employee, Employer (HR/Contractor), and Admin. Each individual uses a single account, which can activate either an Employee or HR profile."
                },
                {
                    title: "IV. Recruitment Process",
                    content: "Employers post project jobs (approved by admin). Workers search and apply. All communication must be carried out through the internal chat system to ensure safety and maintain history logs."
                },
                {
                    title: "V. Payment & Service Packages",
                    content: "We integrate PayOS payment gateway. HR can choose service packages (Free, Pro, Enterprise) to expand recruitment features and AI matching. All transactions are recorded in the system history."
                },
                {
                    title: "VI. Evaluation & Disputes",
                    content: "BuildForce implements a 2-way rating system. In case of disputes, Admin will be the intermediary handler based on logs and provided evidence."
                },
                {
                    title: "VII. Violations & Penalties (Blacklist)",
                    content: "Fraud, wage theft, or bypassing the platform for personal gain will be strictly penalized. Violating accounts will be added to the Blacklist, and their status will be publicized to protect the community."
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
                        <Link href="/signin" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                            <span className="material-symbols-outlined">arrow_back</span>
                            {lang === "vi" ? "Quay lại Đăng ký" : "Back to Registry"}
                        </Link>

                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                                onClick={() => setLang("vi")}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${lang === "vi" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"}`}
                            >
                                Tiếng Việt
                            </button>
                            <button
                                onClick={() => setLang("en")}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${lang === "en" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-500"}`}
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
                        {activeContent.sections.map((section, index) => {
                            const isLast = index === activeContent.sections.length - 1;
                            return (
                                <motion.section
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <h2 className={`text-2xl font-bold mb-4 flex items-center gap-3 ${isLast ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${isLast ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-sky-100 dark:bg-sky-900/30 text-primary'}`}>
                                            {index + 1}
                                        </span>
                                        {section.title}
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed ml-11">
                                        {section.content}
                                    </p>
                                </motion.section>
                            );
                        })}
                    </div>

                    <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800">
                        <div className="p-6 bg-sky-50 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-900/30">
                            <div className="flex gap-4">
                                <span className="material-symbols-outlined text-primary text-3xl">info</span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                                        {lang === "vi" ? "Bạn cần hỗ trợ?" : "Need help?"}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {lang === "vi"
                                            ? "Nếu bạn có bất kỳ thắc mắc nào về điều khoản này, vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi."
                                            : "If you have any questions regarding these terms, please contact our support team."}
                                    </p>
                                    <button className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-sky-600 transition-colors">
                                        {lang === "vi" ? "Liên hệ ngay" : "Contact Support"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
