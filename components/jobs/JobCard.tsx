"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, CalendarDays, Users2, BadgeCheck, Bolt, ArrowRight, BriefcaseBusiness } from "lucide-react";

type JobCategory = "engineer" | "worker";

interface EnhancedJob {
  id: string | number;
  title: string;
  company: string;
  /** HR user ID — dùng để link sang trang hồ sơ năng lực nhà thầu */
  hrId?: string;
  location: string;
  compensation: string;
  postedAt: string;
  image?: string;
  /** Nhiều ảnh: hiển thị carousel; 1 ảnh: hiển thị 1 ảnh */
  images?: string[];
  applicants?: number;
  verified?: boolean;
  onTimePayment?: boolean;
  /** Auto Match score 0–100 (Buildforce rule-based match) */
  matchScore?: number;
  urgent?: boolean;
  skills?: string[];
  workersNeeded?: number;
  /** Phân loại vai trò: Kỹ sư / Công nhân (tuỳ chọn, có thể suy ra từ title). */
  jobType?: JobCategory;
  /** Số ngày còn lại đến hạn — dùng cho badge gấp. */
  daysLeft?: number;
}

interface JobCardProps {
  job: EnhancedJob;
  index?: number;
  variant?: "compact" | "expanded";
}

const resolveId = (val: any): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val?._id === "string") return val._id;
  const s = val?._id?.toString?.() ?? val?.toString?.() ?? String(val);
  return s === "[object Object]" ? "" : s;
};

export const JobCard: React.FC<JobCardProps> = ({ job, index = 0 }) => {
  const safeHrId = resolveId(job.hrId);
  const imageList = Array.isArray(job.images) && job.images.length > 0 ? job.images : job.image ? [job.image] : [];
  const [imgIndex, setImgIndex] = React.useState(0);
  const [lightboxUrl, setLightboxUrl] = React.useState<string | null>(null);
  const hasMultiple = imageList.length > 1;

  const derivedType: JobCategory = React.useMemo(() => {
    if (job.jobType) return job.jobType;
    const lower = job.title.toLowerCase();
    if (lower.includes("kỹ sư") || lower.includes("kỹ thuật")) return "engineer";
    return "worker";
  }, [job.jobType, job.title]);

  const accentColor =
    job.urgent && typeof job.daysLeft === "number"
      ? "var(--urgent)"
      : derivedType === "engineer"
        ? "var(--primary)"
        : "var(--amber)";

  const jobTypeLabel = derivedType === "engineer" ? "Kỹ sư" : "Công nhân / Thợ";
  const urgencyBadge = getUrgencyBadge(job.urgent, job.daysLeft);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -2 }}
      className="relative group overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all duration-200"
    >
      <Link
        href={`/jobs/${job.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Xem chi tiết ${job.title}`}
      />

      <div className="relative flex gap-4 p-4 md:p-5">
        {/* Left accent */}
        <span
          aria-hidden="true"
          className="absolute inset-y-3 left-0 w-1 rounded-full"
          style={{ backgroundColor: accentColor }}
        />

        {/* Logo / thumbnail */}
        <div className="relative z-10 flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-inner">
            {imageList.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLightboxUrl(imageList[imgIndex]);
                  }}
                  className="absolute inset-0 block h-full w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-900/50"
                  aria-label="Xem ảnh phóng to"
                >
                  <img
                    alt={job.title}
                    src={imageList[imgIndex]}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 pointer-events-none"
                  />
                </button>
                {hasMultiple && (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {imageList.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImgIndex(i);
                        }}
                        className={`pointer-events-auto h-1.5 w-3 rounded-full transition-all ${i === imgIndex ? "bg-white" : "bg-white/50"
                          }`}
                        aria-label={`Ảnh ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <BriefcaseBusiness className="h-8 w-8 text-slate-400" />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3">
          {/* Top row: title + salary */}
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                {typeof job.matchScore === "number" && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 border text-[11px] ${job.matchScore >= 85
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : job.matchScore >= 65
                        ? "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                        : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      }`}
                  >
                    {job.matchScore}% phù hợp
                  </span>
                )}
                {job.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Nhà thầu đã xác minh
                  </span>
                )}
                {job.onTimePayment && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    <Users2 className="h-3.5 w-3.5" />
                    Thanh toán đúng hạn
                  </span>
                )}
              </div>

              <h3 className="truncate font-semibold text-[18px] md:text-[20px] text-[var(--text-primary)]">
                {job.title}
              </h3>
              <div className="mt-0.5 flex flex-col gap-0.5">
                <p className="text-[14px] font-medium text-[var(--text-secondary)]">
                  {safeHrId ? (
                    <Link
                      href={`/hr/${safeHrId}/profile?from=jobs`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-[var(--primary)] hover:underline transition-colors relative z-10"
                    >
                      {job.company}
                    </Link>
                  ) : (
                    job.company
                  )}
                  {" "}· <span className="text-amber-500 font-semibold">⭐ 4.8</span>
                </p>
                {safeHrId && (
                  <Link
                    href={`/hr/${safeHrId}/profile?from=jobs`}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 text-[12px] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:underline transition-colors w-fit"
                  >
                    Xem hồ sơ nhà thầu →
                  </Link>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-0.5">
                Mức lương
              </p>
              <p className="text-[18px] md:text-[20px] font-extrabold text-[var(--success)]">
                {job.compensation}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-sky-500" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-slate-500" />
              {jobTypeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
              {job.postedAt}
            </span>
            {typeof job.workersNeeded === "number" && job.workersNeeded > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Users2 className="h-3.5 w-3.5 text-slate-500" />
                Cần {job.workersNeeded} người
              </span>
            )}
          </div>

          {/* Skills */}
          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-200"
                >
                  {s}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-[11px] text-[var(--text-secondary)]">+{job.skills.length - 4} kỹ năng</span>
              )}
            </div>
          )}

          {/* Bottom row: badges + actions */}
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-3 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                {jobTypeLabel}
              </span>

              {urgencyBadge && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${urgencyBadge.variant === "urgent"
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                >
                  <Bolt className="h-3.5 w-3.5" />
                  {urgencyBadge.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href={`/jobs/${job.id}`}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-4 py-1.5 text-[13px] font-semibold text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-800/70"
              >
                Xem chi tiết
              </Link>
              <Link
                href={`/jobs/${job.id}`}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-1.5 text-[13px] font-semibold text-white shadow-sm hover:bg-sky-500"
              >
                Ứng tuyển
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLightboxUrl(null);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setLightboxUrl(null)}
          aria-label="Đóng xem ảnh"
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLightboxUrl(null);
            }}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Đóng"
          >
            ✕
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="max-h-[90vh] w-auto max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </motion.article>
  );
};

function getUrgencyBadge(urgent?: boolean, daysLeft?: number) {
  if (!urgent || typeof daysLeft !== "number") return null;
  if (daysLeft <= 3) {
    return {
      variant: "urgent" as const,
      label: `🔴 Gấp - Còn ${daysLeft} ngày`,
    };
  }
  if (daysLeft <= 7) {
    return {
      variant: "soon" as const,
      label: "🟡 Còn 1 tuần",
    };
  }
  return null;
}

