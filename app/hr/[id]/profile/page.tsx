"use client";

import React, { useEffect, useState } from 'react';
import ProfileHeader from '@/components/hr/profile/ProfileHeader';
import StatsRow from '@/components/hr/profile/StatsRow';
import PaymentHistory from '@/components/hr/profile/PaymentHistory';
import ProjectHistory from '@/components/hr/profile/ProjectHistory';
import WorkerReviews from '@/components/hr/profile/WorkerReviews';
import ActiveJobs from '@/components/hr/profile/ActiveJobs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/utils/api';

export default function HRProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const [hrData, setHrData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resolve params robustly considering Next.js 15+ async params
    const resolvedParams = React.use(params as Promise<{ id: string }>);
    const id = resolvedParams?.id || (params as any)?.id;

    useEffect(() => {
        if (!id) return;
        const fetchHrData = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/hr/${id}/profile`);
                if (res.data.success) {
                    setHrData(res.data.data);
                } else {
                    setError("Không thể tải hồ sơ. Thử lại?");
                }
            } catch (err: any) {
                console.error("Fetch HR profile error:", err);
                setError("Không thể tải hồ sơ. Thử lại?");
            } finally {
                setLoading(false);
            }
        };
        fetchHrData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
                <div className="animate-spin w-8 h-8 flex items-center justify-center border-t-2 border-primary rounded-full"></div>
            </div>
        );
    }

    if (error || !hrData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Không thể tải hồ sơ. Thử lại?
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Nhà thầu không tồn tại hoặc đã bị ẩn.
                    </p>
                    <Link href="/jobs" className="mt-4 text-primary hover:underline inline-block">
                        Quay lại trang Việc làm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[900px] mx-auto px-4 py-6 md:py-8 space-y-8">
                <Link
                    href="/jobs"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Quay lại danh sách việc làm
                </Link>

                <div className="space-y-12">
                    <ProfileHeader hr={hrData} />
                    <StatsRow 
                        stats={hrData.stats} 
                        industry={hrData.industryType} 
                        joinedDate={hrData.joinedDate} 
                        experienceYears={hrData.experienceYears}
                        description={hrData.description}
                        platformProjects={(hrData.projects || []).filter((p: any) => p.status === 'completed')}
                        portfolios={hrData.portfolios || []}
                    />
                    <PaymentHistory paymentHistory={hrData.paymentHistory} onTimePaymentRate={hrData.stats.onTimePaymentRate} />

                    <WorkerReviews reviews={hrData.reviews || []} ratingBreakdown={hrData.ratingBreakdown} avgRating={hrData.stats.avgRating} totalReviews={hrData.stats.totalReviews} />
                    <ActiveJobs jobs={hrData.activeJobs || []} />
                </div>
            </div>
        </div>
    );
}
