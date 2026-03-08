"use client";

import React, { useEffect, useMemo, useState } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import api from "@/utils/api";

const SKILL_OPTIONS = [
    "Thợ xây", "Thợ điện", "Thợ hàn", "Thợ mộc", "Thợ ống nước",
    "Thợ sơn", "Thợ cốp pha", "Thợ hoàn thiện", "Kỹ sư hiện trường", "Giám sát công trình",
];

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "salary_desc", label: "Lương cao nhất" },
    { value: "relevant", label: "Phù hợp nhất" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** Ước lượng lương tháng (VND) để so sánh */
function getMonthlySalaryVnd(salary: { amount?: number; unit?: string } | null): number | null {
    if (!salary?.amount) return null;
    const amount = Number(salary.amount);
    switch (salary.unit) {
        case "month":
            return amount;
        case "day":
            return amount * 26;
        case "hour":
            return amount * 8 * 26;
        default:
            return amount;
    }
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationQuery, setLocationQuery] = useState("");
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [salaryTrMin, setSalaryTrMin] = useState(0);
    const [salaryTrMax, setSalaryTrMax] = useState(200);
    const [sortBy, setSortBy] = useState<SortValue>("newest");
    /** Bật "Chỉ xem việc phù hợp" — gọi API matched (cần đăng nhập tài khoản lao động). */
    const [matchModeOnly, setMatchModeOnly] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (matchModeOnly) {
                    const res = await api.get("/api/jobs/matched");
                    if (res.data.success) setJobs(res.data.data || []);
                    else setJobs([]);
                } else {
                    const res = await api.get("/api/jobs");
                    if (res.data.success) setJobs(res.data.data || []);
                }
            } catch (err: any) {
                if (matchModeOnly && (err?.response?.status === 401 || err?.response?.status === 403)) {
                    setJobs([]);
                } else {
                    console.error("Failed to load jobs", err);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [matchModeOnly]);

    const mappedJobs = useMemo(() => {
        const formatSalary = (salary: any) => {
            if (!salary?.amount) return "Thỏa thuận";
            const unit = salary.unit === "day" ? "ngày" : salary.unit === "month" ? "tháng" : salary.unit === "hour" ? "giờ" : "dự án";
            const amount = Number(salary.amount);
            const pretty = amount >= 1_000_000 ? `${Math.round(amount / 1_000_000)}tr` : `${Math.round(amount / 1_000)}k`;
            return `${pretty}/${unit}`;
        };

        return jobs.map((j) => {
            const hr = j.hrId;
            const company = hr?.companyName || (hr?.firstName ? `${hr.firstName} ${hr.lastName || ""}`.trim() : "Nhà tuyển dụng");
            const location = [j.location?.address, j.location?.city, j.location?.province].filter(Boolean).join(", ") || "Việt Nam";
            const monthlyVnd = getMonthlySalaryVnd(j.salary);
            return {
                id: j._id,
                title: j.title,
                company,
                location,
                locationRaw: j.location,
                compensation: formatSalary(j.salary),
                postedAt: new Date(j.createdAt || Date.now()).toLocaleDateString("vi-VN"),
                skills: Array.isArray(j.skills) ? j.skills : [],
                workersNeeded: j.workersNeeded ?? 0,
                images: Array.isArray(j.images) ? j.images : [],
                createdAt: j.createdAt ? new Date(j.createdAt).getTime() : 0,
                monthlySalaryVnd: monthlyVnd ?? 0,
                matchScore: typeof j.matchScore === "number" ? j.matchScore : undefined,
            };
        });
    }, [jobs]);

    const filteredAndSortedJobs = useMemo(() => {
        let list = [...mappedJobs];

        const locLower = locationQuery.trim().toLowerCase();
        if (locLower) {
            list = list.filter((job) => {
                const province = (job.locationRaw?.province ?? "").toLowerCase();
                const city = (job.locationRaw?.city ?? "").toLowerCase();
                const address = (job.locationRaw?.address ?? "").toLowerCase();
                const full = (job.location ?? "").toLowerCase();
                return province.includes(locLower) || city.includes(locLower) || address.includes(locLower) || full.includes(locLower);
            });
        }

        if (selectedSkills.length > 0) {
            list = list.filter((job) =>
                (job.skills as string[]).some((s: string) => selectedSkills.some((k) => (s || "").toLowerCase().includes((k || "").toLowerCase())))
            );
        }

        const minVnd = salaryTrMin * 1_000_000;
        const maxVnd = salaryTrMax * 1_000_000;
        if (salaryTrMin > 0 || salaryTrMax < 200) {
            list = list.filter((job) => {
                const m = job.monthlySalaryVnd ?? 0;
                if (m <= 0) return true;
                return m >= minVnd && m <= maxVnd;
            });
        }

        if (sortBy === "newest" || sortBy === "relevant") {
            list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        } else if (sortBy === "salary_desc") {
            list.sort((a, b) => (b.monthlySalaryVnd ?? 0) - (a.monthlySalaryVnd ?? 0));
        }
        return list;
    }, [mappedJobs, locationQuery, selectedSkills, salaryTrMin, salaryTrMax, sortBy]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const clearAllFilters = () => {
        setLocationQuery("");
        setSelectedSkills([]);
        setSalaryTrMin(0);
        setSalaryTrMax(200);
        setSortBy("newest");
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
            <main className="max-w-[1600px] mx-auto px-8 pt-12 pb-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Filters Sidebar - scrollable */}
                    <aside className="w-full lg:w-[400px] shrink-0">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-32">
                            <div className="flex items-center justify-between mb-12">
                                <h2 className="text-3xl font-black">Bộ lọc</h2>
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="text-primary font-bold text-lg hover:underline"
                                >
                                    Xóa tất cả
                                </button>
                            </div>

                            {/* Auto Match toggle — chỉ việc phù hợp với hồ sơ (đăng nhập USER) */}
                            <div className="mb-8">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={matchModeOnly}
                                        onChange={(e) => setMatchModeOnly(e.target.checked)}
                                        className="w-5 h-5 rounded border-2 border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                                        Chỉ xem việc phù hợp với tôi
                                    </span>
                                </label>
                                <p className="text-xs text-slate-500 mt-1.5 ml-8">
                                    Cần đăng nhập tài khoản lao động. Khớp theo khu vực, nghề, thời gian, kinh nghiệm.
                                </p>
                            </div>

                            <div className="filter-section">
                                <div className="flex justify-between items-center mb-6">
                                    <label className="text-xl font-black">Địa điểm</label>
                                </div>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-2xl">location_on</span>
                                    <input
                                        className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-medium focus:ring-primary focus:border-primary"
                                        placeholder="Thành phố hoặc tỉnh thành"
                                        type="text"
                                        value={locationQuery}
                                        onChange={(e) => setLocationQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="filter-section">
                                <label className="block text-xl font-black mb-6">Ngành nghề / Kỹ năng</label>
                                <div className="space-y-4">
                                    {SKILL_OPTIONS.map((skill) => (
                                        <label key={skill} className="flex items-center gap-4 cursor-pointer group">
                                            <input
                                                className="w-7 h-7 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary"
                                                type="checkbox"
                                                checked={selectedSkills.includes(skill)}
                                                onChange={() => toggleSkill(skill)}
                                            />
                                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                                                {skill}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-section">
                                <div className="flex justify-between items-center mb-6">
                                    <label className="text-xl font-black">Mức lương (tr/tháng)</label>
                                    <span className="text-xl font-black text-primary">
                                        {salaryTrMin} - {salaryTrMax}tr
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">Từ (tr)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={200}
                                            value={salaryTrMin}
                                            onChange={(e) => setSalaryTrMin(Math.min(200, Math.max(0, Number(e.target.value) || 0)))}
                                            className="w-full h-12 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">Đến (tr)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={500}
                                            value={salaryTrMax}
                                            onChange={(e) => setSalaryTrMax(Math.min(500, Math.max(0, Number(e.target.value) || 200)))}
                                            className="w-full h-12 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                                        />
                                    </div>
                                </div>
                                <input
                                    className="w-full"
                                    type="range"
                                    min={0}
                                    max={200}
                                    value={salaryTrMin}
                                    onChange={(e) => setSalaryTrMin(Number(e.target.value))}
                                />
                                <div className="flex justify-between text-sm font-bold text-slate-400 mt-1">
                                    <span>0tr</span>
                                    <span>200tr+</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Jobs List Section */}
                    <section className="flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-16 gap-6">
                            <div>
                                <h1 className="text-4xl font-black mb-3">
                                    {loading ? "Đang tải công việc..." : `Đã tìm thấy ${filteredAndSortedJobs.length} công việc`}
                                </h1>
                                <p className="text-slate-500 font-bold text-lg">Kết quả theo bộ lọc của bạn</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                                <label className="text-base font-black text-slate-400 uppercase tracking-widest shrink-0">Sắp xếp theo</label>
                                <select
                                    className="bg-transparent border-none focus:ring-0 text-lg font-black pr-10 cursor-pointer"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortValue)}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {loading ? (
                                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800">
                                    <div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" />
                                </div>
                            ) : filteredAndSortedJobs.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                                    <p className="text-slate-500 font-bold">
                                        {matchModeOnly && mappedJobs.length === 0
                                            ? "Đăng nhập bằng tài khoản lao động và hoàn thành khảo sát để xem việc phù hợp với bạn."
                                            : mappedJobs.length === 0
                                            ? "Chưa có công việc nào được duyệt."
                                            : "Không có công việc nào khớp với bộ lọc. Thử bỏ bớt điều kiện."}
                                    </p>
                                    {matchModeOnly && mappedJobs.length === 0 && (
                                        <a href="/auth/login" className="inline-block mt-4 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90">
                                            Đăng nhập
                                        </a>
                                    )}
                                </div>
                            ) : (
                                filteredAndSortedJobs.map((job, idx) => (
                                    <JobCard key={String(job.id)} job={job} index={idx} variant="expanded" />
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
