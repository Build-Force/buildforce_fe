"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { SimilarJobCard } from "@/components/jobs/SimilarJobCard";
import { JOBS as MOCK_JOBS } from "@/data/mockData";

interface JobDetailClientProps {
  jobId: string;
}

export const JobDetailClient: React.FC<JobDetailClientProps> = ({ jobId }) => {
  const router = useRouter();

  const isMongoId = useMemo(() => /^[0-9a-fA-F]{24}$/.test(String(jobId || "")), [jobId]);

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyStatus, setApplyStatus] = useState<
    "idle" | "applied" | "already" | "error" | "login_required"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [allJobs, setAllJobs] = useState<any[]>([]);

  useEffect(() => {
    if (!jobId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!isMongoId) {
          const mock = (Array.isArray(MOCK_JOBS) ? MOCK_JOBS : []).find(
            (j: any) => String(j?.id) === String(jobId)
          );

          if (mock) {
            const mapped = {
              _id: String(mock.id),
              title: mock.title,
              description: mock.description,
              requirements: Array.isArray(mock.requirements)
                ? mock.requirements.join("\n")
                : mock.requirements || "",
              createdAt: Date.now(),
              workersNeeded: 1,
              location: { province: mock.location },
              salary: undefined,
              skills: [],
              hrId: {
                companyName: mock.company,
                avatar: undefined,
                firstName: "",
                lastName: "",
              },
            };

            setJob(mapped);
            setAllJobs(
              (Array.isArray(MOCK_JOBS) ? MOCK_JOBS : []).map((j: any) => ({
                _id: String(j.id),
                title: j.title,
                createdAt: Date.now(),
                salary: undefined,
                location: { province: j.location },
                hrId: { companyName: j.company },
              }))
            );
            setError(null);
          } else {
            setJob(null);
            setError("Không thể tải công việc.");
          }
          return;
        }

        const [detailRes, listRes] = await Promise.all([
          api.get(`/api/jobs/${jobId}`),
          api.get("/api/jobs"),
        ]);
        if (detailRes.data.success) setJob(detailRes.data.data);
        if (listRes.data.success) setAllJobs(listRes.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Không thể tải công việc.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId, isMongoId]);

  const formatSalary = (salary: any) => {
    if (!salary?.amount) return "Thỏa thuận";
    const unit =
      salary.unit === "day"
        ? "ngày"
        : salary.unit === "month"
          ? "tháng"
          : salary.unit === "hour"
            ? "giờ"
            : "dự án";
    const amount = Number(salary.amount);
    const pretty =
      amount >= 1_000_000
        ? `${Math.round(amount / 1_000_000)}tr`
        : `${Math.round(amount / 1_000)}k`;
    return `${pretty}/${unit}`;
  };

  const similarJobs = useMemo(() => {
    const filtered = allJobs.filter((j) => j._id !== jobId).slice(0, 3);
    return filtered.map((j) => {
      const hr = j.hrId;
      const company =
        hr?.companyName ||
        (hr?.firstName ? `${hr.firstName} ${hr.lastName || ""}`.trim() : "Nhà tuyển dụng");
      const location = j.location?.province || j.location?.city || "Việt Nam";
      return {
        id: j._id,
        title: j.title,
        company,
        location,
        compensation: formatSalary(j.salary),
        image:
          "https://images.unsplash.com/photo-1526772662000-3f88f10c053e?q=80&w=1600&auto=format&fit=crop",
        urgent: false,
        postedAt: new Date(j.createdAt || Date.now()).toLocaleDateString("vi-VN"),
      };
    });
  }, [allJobs, jobId]);

  const handleApply = async () => {
    if (applyLoading || !jobId) return;
    if (!isMongoId) {
      setApplyStatus("error");
      setError("Tin demo (mock) không hỗ trợ ứng tuyển. Vui lòng chọn tin từ danh sách `/jobs`.");
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setApplyStatus("login_required");
      router.push("/signin");
      return;
    }

    setApplyLoading(true);
    setApplyStatus("idle");
    try {
      await api.post(`/api/jobs/${jobId}/apply`);
      setApplyStatus("applied");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setApplyStatus("already");
      else setApplyStatus("error");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-black mb-4">Không tìm thấy công việc</h1>
        {error && <p className="text-slate-500 font-bold mb-4">{error}</p>}
        <Link href="/jobs" className="text-primary font-bold hover:underline">
          Quay lại danh sách công việc
        </Link>
      </div>
    );
  }

  const hr = job.hrId;
  const company =
    hr?.companyName ||
    (hr?.firstName ? `${hr.firstName} ${hr.lastName || ""}`.trim() : "Nhà tuyển dụng");
  const locationText =
    [job.location?.address, job.location?.province].filter(Boolean).join(", ") || "Việt Nam";
  const salaryText = formatSalary(job.salary);
  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300 min-h-screen">
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <header className="mb-10">
          <nav className="flex mb-6 text-base font-bold text-slate-400">
            <Link href="/jobs" className="hover:text-primary transition-colors">
              Tìm kiếm việc làm
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600 dark:text-slate-300">{job.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/30 text-secondary text-sm font-black rounded-full border border-green-100 dark:border-green-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">verified</span> Tin đã duyệt
                </span>
                {skills.length > 0 && (
                  <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-primary text-sm font-black rounded-full border border-blue-100 dark:border-blue-800">
                    {skills[0]}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-5 text-lg text-slate-500 font-bold">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined">location_on</span> {locationText}
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined">calendar_today</span> Đã đăng{" "}
                  {new Date(job.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 text-center lg:min-w-[240px]">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                Mức lương
              </p>
              <p className="text-4xl md:text-5xl font-black text-secondary">{salaryText}</p>
              <p className="mt-1 text-slate-500 font-bold text-sm">
                Số lượng cần tuyển: {job.workersNeeded}
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <article className="flex-1 space-y-10">
            <section className="prose-custom">
              <h2 className="text-2xl font-black mb-6 pb-3 border-b-4 border-primary/20 inline-block">
                Mô tả công việc
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed whitespace-pre-wrap">
                {job.description || "(Chưa có mô tả)"}
              </p>
            </section>

            <section className="prose-custom">
              <h2 className="text-3xl font-black mb-8 pb-4 border-b-4 border-secondary/20 inline-block text-secondary">
                Yêu cầu
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {job.requirements || "(Chưa có yêu cầu)"}
              </p>
            </section>
          </article>

          <aside className="w-full lg:w-[400px] space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
                  {hr?.avatar ? (
                    <div className="relative w-full h-full">
                      <Image src={hr.avatar} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-primary text-3xl">domain</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-black">{company}</h4>
                  <p className="text-slate-500 font-bold text-sm">Nhà tuyển dụng</p>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden h-48 mb-8 border border-slate-200 dark:border-slate-700 relative">
                <Image
                  src="https://images.unsplash.com/photo-1526772662000-3f88f10c053e?q=80&w=2000&auto=format&fit=crop"
                  alt="Map Preview"
                  fill
                  className="object-cover grayscale opacity-50"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg flex items-center gap-2 border border-slate-200">
                    <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                    <span className="font-black text-slate-800 text-base">{locationText}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApply}
                disabled={applyLoading}
                className="w-full bg-[#EF4444] text-white py-6 rounded-2xl font-black text-2xl hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] mb-3"
              >
                {applyLoading ? "Đang ứng tuyển..." : "Ứng tuyển ngay"}
              </button>
              {applyStatus === "applied" && (
                <p className="text-center text-sm font-bold text-emerald-600">Ứng tuyển thành công!</p>
              )}
              {applyStatus === "already" && (
                <p className="text-center text-sm font-bold text-amber-600">
                  Bạn đã ứng tuyển công việc này rồi.
                </p>
              )}
              {applyStatus === "error" && (
                <p className="text-center text-sm font-bold text-red-600">
                  Ứng tuyển thất bại. Vui lòng thử lại.
                </p>
              )}
              <p className="text-center text-sm font-bold text-slate-400">Ứng tuyển mất khoảng 3 phút</p>
            </div>
          </aside>
        </div>

        <section className="mt-24 pt-16 border-t-2 border-slate-100 dark:border-slate-800">
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-black tracking-tight">Cơ hội việc làm tương tự</h3>
              <Link
                href="/jobs"
                className="text-primary font-bold text-lg hover:underline flex items-center gap-2"
              >
                Xem tất cả công việc{" "}
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarJobs.map((similarJob, idx) => (
                <SimilarJobCard key={String(similarJob.id)} job={similarJob} index={idx} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

