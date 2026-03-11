"use client";

import React from 'react';
import { BriefcaseBusiness, ArrowRight } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import Link from 'next/link';

interface ActiveJobsProps {
    jobs: any[];
}

export default function ActiveJobs({ jobs }: ActiveJobsProps) {
    if (!jobs || jobs.length === 0) {
        return (
            <section id="active-jobs" className="pt-4 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl inline-flex items-center font-bold text-gray-900 dark:text-gray-100">
                        Đang tuyển dụng
                    </h2>
                    <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                        0 vị trí
                    </div>
                </div>

                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <BriefcaseBusiness className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Hiện tại không có vị trí tuyển dụng mở</p>
                </div>
            </section>
        );
    }

    // Map database data format to EnhancedJob structure expected by JobCard
    const mappedJobs = jobs.slice(0, 3).map(job => ({
        id: job._id || job.id,
        title: job.title,
        company: job.company?.name || job.hr?.companyName || job.companyName || "Công ty ẩn danh",
        image: job.image || job.images?.[0] || job.company?.logo || job.hr?.avatar || "",
        location: job.locationName || job.location,
        compensation: job.salaryMin && job.salaryMax
            ? `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} Triệu`
            : "Thỏa thuận",
        postedAt: job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : "Gần đây",
        urgent: job.isUrgent || false,
        verified: job.company?.verified || job.hr?.verified || false,
    }));

    return (
        <section id="active-jobs" className="pt-4 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl inline-flex items-center font-bold text-gray-900 dark:text-gray-100">
                    Đang tuyển dụng
                </h2>
                <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold">
                    {jobs.length} vị trí
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mappedJobs.map((job, idx) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        index={idx}
                        variant="compact"
                    />
                ))}
            </div>

            {jobs.length > 3 && (
                <div className="mt-8 text-center">
                    <Link
                        href="/jobs?company=hr_001"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-all hover:pr-4 group"
                    >
                        Xem tất cả {jobs.length} việc làm
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            )}
        </section>
    );
}
