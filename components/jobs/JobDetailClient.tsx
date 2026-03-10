"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/utils/api";
import { SimilarJobCard } from "@/components/jobs/SimilarJobCard";
import { JOBS as MOCK_JOBS } from "@/data/mockData";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;

const JobMapPreview = dynamic(
  () => import("@/components/jobs/JobMapPreview").then((m) => m.JobMapPreview),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-2xl flex items-center justify-center">
        <span className="text-slate-500 font-bold text-sm">Đang tải bản đồ...</span>
      </div>
    ),
  }
);

function JobImagesBlock({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const hasMultiple = images.length > 1;

  if (images.length === 0) return null;

  return (
    <>
      <section className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <div className="relative aspect-video w-full">
          <button
            type="button"
            onClick={() => setLightboxUrl(images[index])}
            className="absolute inset-0 w-full h-full block cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-label="Xem ảnh phóng to"
          >
            <Image
              src={images[index]}
              alt=""
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 1200px) 100vw, 800px"
              unoptimized={images[index]?.startsWith("http")}
            />
          </button>
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i === 0 ? images.length - 1 : i - 1)); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                aria-label="Ảnh trước"
              >
                <span className="material-symbols-outlined text-3xl">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIndex((i) => (i === images.length - 1 ? 0 : i + 1)); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                aria-label="Ảnh sau"
              >
                <span className="material-symbols-outlined text-3xl">chevron_right</span>
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"}`}
                    aria-label={`Ảnh ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
          aria-label="Đóng xem ảnh"
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

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
  const [chatLoading, setChatLoading] = useState(false);

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
    const pretty = new Intl.NumberFormat("vi-VN").format(amount) + "VNĐ";
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
      const res = await api.get(`/api/jobs/${jobId}`);
      if (res.data.success) setJob(res.data.data);
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
  const myApplication = job.myApplication as { status: string; decisionReason?: string } | undefined;
  const applicationStatusLabel: Record<string, string> = {
    APPLIED: "Đã gửi",
    ACCEPTED: "Đã chấp nhận",
    REJECTED: "Bị từ chối",
    HIRED: "Đã nhận việc",
    COMPLETION_PENDING: "Chờ xác nhận hoàn thành",
    COMPLETED: "Hoàn thành",
  };
  const isJobFull = (job.workersHired ?? 0) >= (job.workersNeeded ?? 1) || job.status === "FILLED";
  const canShowApply = !myApplication && !isJobFull;

  const hrId = (hr as any)?._id ?? (job.hrId as any);
  const openChatWithHr = async () => {
    if (!hrId || chatLoading) return;

    // 1. Check if mock job (demo data doesn't support chat)
    if (!isMongoId) {
      alert("Tin tuyển dụng demo không hỗ trợ tính năng chat. Vui lòng thử trên tin tuyển dụng thực tế.");
      return;
    }

    // 2. Check if logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/signin");
      return;
    }

    setChatLoading(true);
    try {
      // Ensure participantId is a clean string ID
      const targetParticipantId = typeof hrId === "string" ? hrId : (hrId as any)?._id || String(hrId);

      const res = await api.post("/api/chat", { participantId: targetParticipantId });
      const conv = res.data?.data;

      if (conv?._id && Array.isArray(conv.participants)) {
        const hrParticipant = conv.participants.find((p: any) => String(p._id) === String(targetParticipantId));
        const participant = hrParticipant || {
          _id: targetParticipantId,
          firstName: "",
          lastName: "",
          role: "hr",
          companyName: company
        };

        window.dispatchEvent(new CustomEvent("buildforce:openChat", {
          detail: {
            conversationId: conv._id,
            participant
          }
        }));
      }
    } catch (err: any) {
      console.error("Open chat failed", err);
      const errorMsg = err?.response?.data?.message || "Không thể nhắn tin cho nhà tuyển dụng lúc này.";
      alert(errorMsg);
    } finally {
      setChatLoading(false);
    }
  };

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

        {Array.isArray(job.images) && job.images.length > 0 && (
          <div className="mb-10">
            <JobImagesBlock images={job.images} />
          </div>
        )}

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
                  {typeof (hr as any)?.averageRating === "number" && (hr as any).averageRating > 0 && (
                    <p className="text-amber-600 dark:text-amber-400 font-bold text-sm mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">star</span>
                      {(hr as any).averageRating.toFixed(1)} (đánh giá từ người lao động)
                    </p>
                  )}
                </div>
              </div>
              {hrId && (
                <button
                  type="button"
                  onClick={openChatWithHr}
                  disabled={chatLoading}
                  className="w-full mb-6 py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary/10 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  {chatLoading ? "Đang mở..." : "Nhắn tin với nhà tuyển dụng"}
                </button>
              )}

              <div className="mb-8">
                {typeof job.location?.lat === "number" &&
                  typeof job.location?.lng === "number" &&
                  MAPBOX_TOKEN ? (
                  <JobMapPreview
                    lat={job.location.lat}
                    lng={job.location.lng}
                    locationText={locationText}
                  />
                ) : (
                  <div className="w-full h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-primary text-4xl">location_on</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center px-4">
                      {locationText}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Vị trí công việc
                    </p>
                  </div>
                )}
              </div>

              {isJobFull && (
                <div className="mb-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Tin này đã đủ số lượng tuyển</p>
                </div>
              )}
              {myApplication && (
                <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 mb-1">
                    Trạng thái đơn ứng tuyển: {applicationStatusLabel[myApplication.status] ?? myApplication.status}
                  </p>
                  {myApplication.status === "REJECTED" && myApplication.decisionReason && (
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">Lý do: {myApplication.decisionReason}</p>
                  )}
                </div>
              )}
              {canShowApply && (
                <>
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
                </>
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

