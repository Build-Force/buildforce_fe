 "use client";

import React from "react";
import { JOBS } from "@/data/mockData";
import { JobCard } from "@/components/jobs/JobCard";

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

    const filteredJobs = JOBS.filter((job) => {
        if (activeFilter === "all") return true;
        if (activeFilter === "urgent") return job.urgent;
        const category = getCategory(job.title);
        return category === activeFilter;
    });

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

                <div className="grid grid-cols-1 gap-8">
                    {filteredJobs.map((job, idx) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            index={idx}
                            variant="compact"
                        />
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--primary)] hover:underline underline-offset-4"
                    >
                        Xem tất cả 1,240+ việc làm →
                    </button>
                </div>
            </div>
        </section>
    );
};
