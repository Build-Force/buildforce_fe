"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CONTRACTORS } from "@/data/mockData";
import { JobCard } from "@/components/jobs/JobCard";
import api from "@/utils/api";

const SKILL_OPTIONS = ["Thợ điện", "Thợ hàn", "Thợ mộc", "Thợ ống nước"];

function JobsPageFallback() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
            <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
        </div>
    );
}

function JobsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSearch = searchParams.get("search")?.trim() ?? "";
    const urlLocation = searchParams.get("location")?.trim() ?? "";

    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(urlSearch);
    const [locationInput, setLocationInput] = useState(urlLocation);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [salaryMin, setSalaryMin] = useState(20);
    /** Bật "Chỉ xem việc phù hợp" — gọi API matched (cần đăng nhập tài khoản lao động). */
    const [matchModeOnly, setMatchModeOnly] = useState(false);

    useEffect(() => {
        setSearchInput(urlSearch);
        setLocationInput(urlLocation);
    }, [urlSearch, urlLocation]);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (searchInput.trim()) params.set("search", searchInput.trim());
        if (locationInput.trim()) params.set("location", locationInput.trim());
        router.replace(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const clearFilters = () => {
        setSearchInput("");
        setLocationInput("");
        setSelectedSkills([]);
        setSalaryMin(20);
        router.replace("/jobs");
    };

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
        const toMonthlyTr = (salary: any) => {
            if (!salary?.amount) return 0;
            const amount = Number(salary.amount);
            const unit = salary.unit || "month";
            if (unit === "month") return amount / 1_000_000;
            if (unit === "day") return (amount * 22) / 1_000_000;
            if (unit === "hour") return (amount * 22 * 8) / 1_000_000;
            return amount / 1_000_000;
        };

        return jobs.map((j) => {
            const hr = j.hrId;
            const company = hr?.companyName || (hr?.firstName ? `${hr.firstName} ${hr.lastName || ""}`.trim() : "Nhà tuyển dụng");
            const loc = j.location?.province || j.location?.city || "Việt Nam";
            return {
                id: j._id,
                title: j.title,
                company,
                location: loc,
                compensation: formatSalary(j.salary),
                salaryMonthlyTr: toMonthlyTr(j.salary),
                urgent: false,
                postedAt: new Date(j.createdAt || Date.now()).toLocaleDateString("vi-VN"),
                image: "https://images.unsplash.com/photo-1526772662000-3f88f10c053e?q=80&w=1600&auto=format&fit=crop",
                applicants: 0,
                verified: true,
                onTimePayment: true,
                matchScore: typeof j.matchScore === "number" ? j.matchScore : undefined,
            };
        });
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        let list = mappedJobs;
        if (urlSearch) {
            const q = urlSearch.toLowerCase();
            list = list.filter(
                (j) =>
                    j.title?.toLowerCase().includes(q) ||
                    j.company?.toLowerCase().includes(q)
            );
        }
        if (urlLocation) {
            const loc = urlLocation.toLowerCase();
            list = list.filter((j) => j.location?.toLowerCase().includes(loc));
        }
        if (selectedSkills.length > 0) {
            list = list.filter((j) =>
                selectedSkills.some((s) => j.title?.toLowerCase().includes(s.toLowerCase()))
            );
        }
        if (salaryMin > 20) {
            list = list.filter((j) => (j as any).salaryMonthlyTr >= salaryMin);
        }
        return list;
    }, [mappedJobs, urlSearch, urlLocation, selectedSkills, salaryMin]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300">
            <main className="max-w-[1600px] mx-auto px-8 pt-12 pb-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Filters Sidebar - scrollable */}
                    <aside className="w-full lg:w-[400px] shrink-0">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24 flex flex-col max-h-[calc(100vh-6rem)]">
                            <div className="flex items-center justify-between p-6 pb-4 shrink-0 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-black">Bộ lọc</h2>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-primary font-bold text-sm hover:underline"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                            {/* Auto Match toggle — chỉ việc phù hợp với hồ sơ (đăng nhập USER) */}
                            <div className="px-6 pb-4 border-b border-slate-100 dark:border-slate-800">
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
                            <div className="flex-1 overflow-y-auto p-6 min-h-0">
                                <div className="filter-section mb-6">
                                    <label className="block text-lg font-black mb-3">Từ khóa</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                        <input
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                            className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            placeholder="Chức danh, công ty..."
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <div className="filter-section mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-lg font-black">Địa điểm</label>
                                        <a href="/map" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                                            <span className="material-symbols-outlined text-lg">map</span> Bản đồ
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">location_on</span>
                                        <input
                                            value={locationInput}
                                            onChange={(e) => setLocationInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                            className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-base font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            placeholder="Thành phố hoặc tỉnh thành"
                                            type="text"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors mb-6"
                                >
                                    Áp dụng tìm kiếm
                                </button>

                                <div className="filter-section mb-6">
                                    <label className="block text-lg font-black mb-3">Ngành nghề / Kỹ năng</label>
                                    <div className="space-y-3">
                                        {SKILL_OPTIONS.map((skill) => (
                                            <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    className="w-6 h-6 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary"
                                                    type="checkbox"
                                                    checked={selectedSkills.includes(skill)}
                                                    onChange={() => toggleSkill(skill)}
                                                />
                                                <span className="text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                                                    {skill}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="filter-section mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-lg font-black">Mức lương tối thiểu</label>
                                        <span className="text-lg font-black text-primary">{salaryMin}tr/tháng</span>
                                    </div>
                                    <input
                                        className="w-full mb-2 accent-primary"
                                        max={100}
                                        min={20}
                                        type="range"
                                        value={salaryMin}
                                        onChange={(e) => setSalaryMin(Number(e.target.value))}
                                    />
                                    <div className="flex justify-between text-xs font-bold text-slate-400">
                                        <span>20tr</span>
                                        <span>100tr</span>
                                    </div>
                                </div>

                                <div className="filter-section border-none pb-4">
                                    <label className="block text-lg font-black mb-3">Đánh giá nhà thầu</label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input className="w-6 h-6 text-primary focus:ring-primary" name="rating" type="radio" />
                                            <span className="flex items-center gap-1 text-yellow-500 font-bold text-base">4.5+ Sao</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input className="w-6 h-6 text-primary focus:ring-primary" name="rating" type="radio" defaultChecked />
                                            <span className="text-base font-bold text-slate-700 dark:text-slate-300">Hiển thị tất cả đã xác minh</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Jobs List Section */}
                    <section className="flex-1 min-w-0">
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black mb-1">
                                        {loading ? "Đang tải công việc..." : `Đã tìm thấy ${filteredJobs.length} công việc`}
                                    </h1>
                                    <p className="text-slate-500 font-bold text-base">Kết quả được cá nhân hóa dựa trên hồ sơ của bạn</p>
                                </div>
                                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 shrink-0">
                                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest shrink-0">Sắp xếp</label>
                                    <select className="bg-transparent border-none focus:ring-0 text-base font-black pr-8 cursor-pointer outline-none">
                                        <option>Phù hợp nhất</option>
                                        <option>Mới nhất</option>
                                        <option>Lương cao nhất</option>
                                    </select>
                                </div>
                            </div>
                            {/* Quick search bar */}
                            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-slate-400">search</span>
                                    <input
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
                                        placeholder="Từ khóa (chức danh, công ty...)"
                                        type="text"
                                    />
                                </div>
                                <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-slate-400">location_on</span>
                                    <input
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
                                        placeholder="Thành phố hoặc tỉnh thành"
                                        type="text"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="shrink-0 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                                >
                                    Tìm kiếm
                                </button>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {loading ? (
                                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800">
                                    <div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" />
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
                                    <p className="text-slate-500 font-bold">
                                        {matchModeOnly && mappedJobs.length === 0
                                            ? "Đăng nhập bằng tài khoản lao động và hoàn thành khảo sát để xem việc phù hợp với bạn."
                                            : mappedJobs.length === 0
                                            ? "Chưa có công việc nào được duyệt."
                                            : "Không tìm thấy công việc phù hợp với bộ lọc."}
                                    </p>
                                    {matchModeOnly && (
                                        <a href="/auth/login" className="inline-block mt-4 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90">
                                            Đăng nhập
                                        </a>
                                    )}
                                </div>
                            ) : (
                                filteredJobs.map((job, idx) => (
                                    <JobCard key={String(job.id)} job={job} index={idx} variant="expanded" />
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="mt-24 flex justify-center items-center gap-4">
                            <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 font-black transition-all">
                                <span className="material-symbols-outlined text-3xl">chevron_left</span>
                            </button>
                            <div className="flex gap-4">
                                <button className="w-20 h-20 rounded-2xl bg-primary text-white font-black text-2xl shadow-lg shadow-sky-500/20">1</button>
                                <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-black text-2xl hover:bg-slate-50">2</button>
                                <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-black text-2xl hover:bg-slate-50">3</button>
                                <span className="w-20 h-20 flex items-center justify-center text-2xl font-black">...</span>
                                <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 font-black text-2xl hover:bg-slate-50">12</button>
                            </div>
                            <button className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 font-black transition-all">
                                <span className="material-symbols-outlined text-3xl">chevron_right</span>
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Trust Section */}
            <section className="py-32 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-8">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl font-display font-bold text-slate-900 dark:text-white mb-8">Làm việc với các nhà thầu đẳng cấp</h2>
                        <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed">
                            Lịch sử của mọi nhà thầu đều được hiển thị minh bạch. Chúng tôi đặt ra những tiêu chuẩn cao nhất cho các đối tác của mình.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {CONTRACTORS.map((contractor) => (
                            <div key={contractor.id} className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50">
                                <div className="flex items-center gap-8 mb-12">
                                    <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-6xl">{contractor.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-black text-slate-900 dark:text-white">{contractor.name}</h4>
                                        <p className="text-xl text-slate-500 font-bold">Thành viên đã xác minh từ {contractor.verifiedSince}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-10 mb-10">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl text-center">
                                        <p className="text-5xl font-black text-slate-900 dark:text-white mb-2">{contractor.projectsCount}</p>
                                        <p className="text-base font-black text-slate-400 uppercase tracking-widest">Dự án hoàn thành</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl text-center">
                                        <p className="text-5xl font-black text-secondary mb-2">{contractor.rating}</p>
                                        <p className="text-base font-black text-slate-400 uppercase tracking-widest">Đánh giá của thợ</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-between">
                                    <span className="text-xl font-bold text-slate-700 dark:text-slate-200">Độ tin cậy thanh toán</span>
                                    <span className="text-2xl font-black text-secondary">{contractor.reliability}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<JobsPageFallback />}>
            <JobsPageContent />
        </Suspense>
    );
}
