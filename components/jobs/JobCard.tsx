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
  /** Số ngày còn lại đến hạn — dùng cho badge gấp. */
  daysLeft?: number;
  /** HR profile ID để link đến trang hồ sơ năng lực */
  hrId?: string;
}

interface JobCardProps {
  job: EnhancedJob;
  index?: number;
  variant?: "compact" | "expanded";
}

export const JobCard: React.FC<JobCardProps> = ({ job, index = 0, variant = "expanded" }) => {
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

      <div className={`relative flex ${variant === "expanded" ? "flex-row gap-4 p-4 md:p-5" : "flex-col gap-3 p-4"}`}>
        {/* Left/Top accent */}
        <span
          aria-hidden="true"
          className={`absolute rounded-full shrink-0 ${variant === "expanded" ? "inset-y-3 left-0 w-1" : "top-0 inset-x-3 h-1"}`}
          style={{ backgroundColor: accentColor }}
        />

        {/* Logo / thumbnail */}
        <div className={`relative z-10 flex-shrink-0 ${variant === "expanded" ? "" : "w-full aspect-[2/1] sm:aspect-video rounded-xl overflow-hidden"}`}>
          <div className={`flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner w-full h-full ${variant === "expanded" ? "h-16 w-16 rounded-2xl" : "rounded-xl"}`}>
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
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
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
              <BriefcaseBusiness className={`text-slate-400 ${variant === "expanded" ? "h-8 w-8" : "h-12 w-12"}`} />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-3">
          {/* Top row: title + salary */}
          <div className={`flex ${variant === "expanded" ? "flex-col gap-3 md:flex-row md:items-start md:justify-between" : "flex-col gap-2"}`}>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold">
                {typeof job.matchScore === "number" && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${job.matchScore >= 85
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <BadgeCheck className="h-3 w-3" />
                    Đã xác minh
                  </span>
                )}
                {job.onTimePayment && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    <Users2 className="h-3 w-3" />
                    Thanh toán tốt
                  </span>
                )}
              </div>

              <h3 className={`font-semibold text-[var(--text-primary)] leading-snug ${variant === "expanded" ? "text-[18px] md:text-[20px] truncate" : "text-[16px] line-clamp-2"}`}>
                {job.title}
              </h3>
              <div className="flex flex-col items-start mt-1">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)]">
                  <span className="truncate max-w-[200px]">{job.company}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-amber-500 font-semibold flex items-center gap-0.5 whitespace-nowrap">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    4.8
                  </span>
                </p>
                <Link
                  href={`/hr/${job.hrId || 'hr_001'}/profile`}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 mt-0.5 inline-flex items-center text-[11px] sm:text-[12px] text-[var(--text-secondary)] underline-offset-2 hover:underline hover:text-[var(--primary)] transition-colors font-medium"
                >
                  Xem hồ sơ nhà thầu <span className="ml-1 text-[10px] leading-none">→</span>
                </Link>
              </div>
            </div>

            <div className={`shrink-0 ${variant === "expanded" ? "text-right" : "text-left mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"}`}>
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] mb-0.5">
                Mức lương
              </p>
              <p className={`font-extrabold text-[var(--success)] ${variant === "expanded" ? "text-[18px] md:text-[20px]" : "text-[16px] sm:text-[18px]"}`}>
                {job.compensation}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className={`flex flex-wrap items-center gap-y-1.5 text-[var(--text-secondary)] ${variant === "expanded" ? "gap-x-4 text-[13px]" : "gap-x-3 text-[11px] sm:text-[12px]"}`}>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-sky-500" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <BriefcaseBusiness className="h-3 w-3 text-slate-500" />
              {jobTypeLabel}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3 text-slate-500" />
              {job.postedAt}
            </span>
            {typeof job.workersNeeded === "number" && job.workersNeeded > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users2 className="h-3 w-3 text-slate-500" />
                Cần {job.workersNeeded} người
              </span>
            )}
          </div>

          {/* Skills */}
          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((s, i) => (
                <span
                  key={i}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  {s}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="text-[10px] text-[var(--text-secondary)] flex items-center">+{job.skills.length - 4} kỹ năng</span>
              )}
            </div>
          )}

          {/* Bottom row: badges + actions */}
          <div className={`mt-2 flex flex-col ${variant === "expanded" ? "gap-3 md:flex-row md:items-center md:justify-between" : "gap-3"}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                {jobTypeLabel}
              </span>

              {urgencyBadge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold border ${urgencyBadge.variant === "urgent"
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    }`}
                >
                  <Bolt className="h-3 w-3" />
                  {urgencyBadge.label}
                </span>
              )}
            </div>

            <div className={`flex flex-wrap items-center gap-2 ${variant === "expanded" ? "justify-end" : "justify-start w-full"}`}>
              <Link
                href={`/jobs/${job.id}`}
                onClick={(e) => e.stopPropagation()}
                className={`relative z-10 inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 font-semibold text-[var(--text-primary)] hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors ${variant === "expanded" ? "px-4 py-1.5 text-[13px]" : "flex-1 px-3 py-1.5 text-[12px]"}`}
              >
                Xem chi tiết
              </Link>
              <Link
                href={`/jobs/${job.id}`}
                onClick={(e) => e.stopPropagation()}
                className={`relative z-10 inline-flex items-center justify-center gap-1 rounded-full bg-[var(--primary)] font-semibold text-white shadow-sm hover:bg-sky-500 transition-colors ${variant === "expanded" ? "px-4 py-1.5 text-[13px]" : "flex-1 px-3 py-1.5 text-[12px]"}`}
              >
                Ứng tuyển
                <ArrowRight className="h-3 w-3" />
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

