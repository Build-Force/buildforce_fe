 "use client";

import React, { useState, useEffect } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import api from "@/utils/api";
import Link from "next/link";

export const JobSection = () => {
    const [activeFilter, setActiveFilter] = React.useState<"all" | "engineer" | "worker" | "urgent">("all");

    const filterLabel = {
        all: "Tất cả",
        engineer: "Kỹ sư",
        worker: "Công nhân",
        urgent: "Gấp",
    } as const;

    const getCategory = (title: string): "engineer" | "worker" => {
        const lower = title.toLowerCase();
        if (lower.includes("kỹ sư") || lower.includes("kỹ thuật")) return "engineer";
        return "worker";
    };

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await api.get('/api/jobs');
                if (res.data?.success) {
                    const formatSalary = (salary: any) => {
                        if (!salary?.amount) return "Thỏa thuận";
                        const unit = salary.unit === "day" ? "ngày" : salary.unit === "month" ? "tháng" : salary.unit === "hour" ? "giờ" : "dự án";
                        const amount = Number(salary.amount);
                        const pretty = new Intl.NumberFormat("vi-VN").format(amount) + "VNĐ";
                        return `${pretty}/${unit}`;
                    };

                    const fetchedJobs = res.data.data.map((job: any) => {
                        const hr = job.hrId;
                        const company = (hr?.companyName && hr.companyName !== "Default Company")
                            ? hr.companyName
                            : (hr?.firstName ? `${hr.firstName} ${hr.lastName || ""}`.trim() : "Nhà tuyển dụng");
                        const location = [job.location?.address, job.location?.city, job.location?.province].filter(Boolean).join(", ") || "Việt Nam";

                        return {
                            id: job._id,
                            title: job.title,
                            company,
                            location,
                            compensation: formatSalary(job.salary),
                            skills: Array.isArray(job.skills) ? job.skills : [],
                            postedAt: new Date(job.createdAt || Date.now()).toLocaleDateString("vi-VN"),
                            images: Array.isArray(job.images) ? job.images : [],
                            workersNeeded: job.workersNeeded ?? 0,
                            urgent: job.isUrgent || false,
                            verified: hr?.isVerified || false,
                            hrId: hr?._id || hr
                        };
                    });
                    setJobs(fetchedJobs);
                }
            } catch (err) {
                console.error("Failed to load jobs", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter((job) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "urgent") return job.urgent;
        const category = getCategory(job.title);
        return category === activeFilter;
    }).slice(0, 6);

    return (
        <section className="py-32 bg-[var(--bg)] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-20">
                    <div className="w-full md:w-auto text-left mb-6 md:mb-0">
                        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[var(--primary)] mb-2">
                            DÀNH CHO NGƯỜI LAO ĐỘNG & HR
                        </p>
                        <h2 className="text-[32px] md:text-[34px] font-display font-bold text-[var(--text-primary)] mb-1">
                            Cơ hội việc làm nổi bật
                        </h2>
                        <p className="text-[14px] text-[var(--text-secondary)]">
                            Lọc nhanh theo vai trò và mức độ gấp của công việc.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100/70 dark:bg-slate-900/60 rounded-full px-2 py-1">
                        {(["all", "engineer", "worker", "urgent"] as const).map((key) => {
                            const isActive = activeFilter === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveFilter(key)}
                                    className={`px-3.5 md:px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                                        isActive
                                            ? "bg-[var(--primary)] text-white shadow-sm"
                                            : "bg-transparent text-[var(--text-secondary)] hover:bg-white/70 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {filterLabel[key]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent"></div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-12 text-[var(--text-secondary)]">Không tìm thấy công việc phù hợp.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredJobs.map((job, idx) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                index={idx}
                                variant="compact"
                            />
                        ))}
                    </div>
                )}

                <div className="mt-10 flex justify-center">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--primary)] hover:underline underline-offset-4"
                    >
                        Tìm hiểu thêm →
                    </Link>
                </div>
            </div>
        </section>
    );
};
