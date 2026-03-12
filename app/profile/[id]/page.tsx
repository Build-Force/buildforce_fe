"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, ExternalLink, Download, Star, ShieldCheck } from 'lucide-react';
import api from '@/utils/api';

// HR Components
import ProfileHeader from '@/components/hr/profile/ProfileHeader';
import StatsRow from '@/components/hr/profile/StatsRow';
import PaymentHistory from '@/components/hr/profile/PaymentHistory';
import ProjectHistory from '@/components/hr/profile/ProjectHistory';
import WorkerReviews from '@/components/hr/profile/WorkerReviews';
import ActiveJobs from '@/components/hr/profile/ActiveJobs';

export default function PublicWorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [hrData, setHrData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completedProjects, setCompletedProjects] = useState<any[]>([]);

    const resolvedParams = React.use(params as Promise<{ id: string }>);
    const id = resolvedParams?.id;

    useEffect(() => {
        if (!id) return;
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // Initial fetch to know the role
                const res = await api.get(`/api/users/${id}/public-profile`);
                if (res.data.success) {
                    const profile = res.data.data;
                    setData(profile);
                    if (profile.completedProjects) {
                        setCompletedProjects(profile.completedProjects);
                    }
                    
                    // If HR, fetch the full contractor profile data
                    if (profile.user.role === 'hr') {
                        const hrRes = await api.get(`/api/hr/${id}/profile`);
                        if (hrRes.data.success) {
                            setHrData(hrRes.data.data);
                        }
                    }
                } else {
                    setError("Không thể tải hồ sơ. Thử lại?");
                }
            } catch (err: any) {
                console.error("Fetch profile error:", err);
                setError("Không thể tải hồ sơ. Thử lại?");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#040816]">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#040816]">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Oops! Không tìm thấy hồ sơ</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Người dùng này không tồn tại hoặc hồ sơ đã bị ẩn.</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all">
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    const { user, cv } = data;
    const isHR = user.role === 'hr';
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    if (isHR && hrData) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#040816] pt-12 pb-12">
                <div className="max-w-[1000px] mx-auto px-6 space-y-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-sm font-black text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-all uppercase tracking-widest gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </button>

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

    return (
        <div className="min-h-screen bg-[#fcfdff] dark:bg-[#040816] pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-6">

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>

                {/* Profile Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8"
                >
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">
                                        {user.firstName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            {user.role === 'user' && (
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-4 border-white dark:border-slate-900" title="Đã xác thực">
                                    <span className="material-symbols-outlined text-[16px] block">verified</span>
                                </div>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{fullName}</h1>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full w-fit mx-auto md:mx-0">
                                    {cv?.personalInfo?.title || "Lao động tự do"}
                                </span>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 max-w-lg">
                                {user.bio || cv?.summary || "Chào mừng bạn đến với hồ sơ cá nhân của tôi. Tôi là một lao động lành nghề với nhiều năm kinh nghiệm."}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-bold">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {user.preferredLocationCity || cv?.personalInfo?.address || "Việt Nam"}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-bold">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    {user.experienceYears || cv?.experienceYears || 0} năm kinh nghiệm
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                                Nhắn tin
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Tab Content / CV Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* CV Preview Section */}
                        {cv ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        Hồ sơ chuyên nghiệp (CV)
                                    </h2>
                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-primary">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-10">
                                    {/* Summary */}
                                    {cv.summary && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Mục tiêu nghề nghiệp</h3>
                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                                {cv.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Experiences */}
                                    {cv.experiences?.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Kinh nghiệm làm việc</h3>
                                            <div className="space-y-8">
                                                {cv.experiences.map((exp: any, i: number) => (
                                                    <div key={i} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 pb-1">
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-primary" />
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-black text-slate-900 dark:text-white">{exp.role}</h4>
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{exp.duration}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-primary mb-2">{exp.company}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                            {exp.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education */}
                                    {cv.education?.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Học vấn</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {cv.education.map((edu: any, i: number) => (
                                                    <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                                                        <div className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">{edu.duration}</div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{edu.degree}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{edu.school}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-slate-100 dark:border-slate-800">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Briefcase className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Chưa cung cấp CV</h3>
                                <p className="text-slate-500 dark:text-slate-400">Người lao động này chưa hoàn thiện hồ sơ chuyên nghiệp.</p>
                            </div>
                        )}
                        {/* Portfolios / Projects */}
                        {user.portfolios?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-8 uppercase tracking-tighter">
                                    <Award className="w-6 h-6 text-primary" />
                                    Hồ sơ năng lực & Dự án
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {user.portfolios.map((item: any, idx: number) => (
                                        <div key={idx} className="group overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-2xl transition-all duration-500">
                                            <div className="aspect-video overflow-hidden relative">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-black text-slate-900 dark:text-white text-base mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-medium">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Completed Projects Section */}
                        {completedProjects.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-emerald-500 text-xl">task_alt</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Công trình đã hoàn thành</h2>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{completedProjects.length} dự án</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                        {completedProjects.length} hoàn thành
                                    </span>
                                </div>

                                <div className="divide-y divide-slate-50 dark:divide-slate-800/40">
                                    {completedProjects.map((project: any, idx: number) => {
                                        const job = project.job;
                                        const image = job.images?.[0];
                                        const location = job.location?.province || job.location?.city || 'Việt Nam';
                                        const salary = job.salary ? `${(job.salary.amount / 1_000_000).toFixed(0)}M/${job.salary.unit === 'day' ? 'ngày' : job.salary.unit === 'month' ? 'tháng' : job.salary.unit}` : null;
                                        const completedDate = project.completedAt ? new Date(project.completedAt).toLocaleDateString('vi-VN') : null;
                                        return (
                                            <div key={project.applicationId} className="flex gap-5 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all group">
                                                {/* Image */}
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-100 dark:border-slate-800">
                                                    {image ? (
                                                        <img src={image} alt={job.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-slate-300 text-3xl">construction</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="min-w-0">
                                                            <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight truncate group-hover:text-primary transition-colors">
                                                                {job.title}
                                                            </h4>
                                                            {job.hr && (
                                                                <p className="text-xs font-bold text-primary mt-0.5">{job.hr.name}</p>
                                                            )}
                                                        </div>
                                                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                            <span className="material-symbols-outlined text-[14px]">verified</span>
                                                            Hoàn thành
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                                                            {location}
                                                        </span>
                                                        {salary && (
                                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                                <span className="material-symbols-outlined text-[12px]">payments</span>
                                                                {salary} VNĐ
                                                            </span>
                                                        )}
                                                        {completedDate && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                                                                {completedDate}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {job.skills?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {job.skills.slice(0, 3).map((skill: string) => (
                                                                <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-black rounded-md">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            {job.skills.length > 3 && (
                                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[9px] font-black rounded-md">+{job.skills.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Portfolio / Công trình đã làm (Manual Uploads) */}
                        {!isHR && user.portfolios && user.portfolios.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-xl">construction</span>
                                        </div>
                                        Dự án tiêu biểu
                                    </h2>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.portfolios.length} dự án</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {user.portfolios.map((item: any, idx: number) => (
                                        <div key={idx} className="group overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-500">
                                            <div className="aspect-video overflow-hidden relative">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                    <p className="text-xs text-white/90 font-medium leading-relaxed line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-black text-slate-900 dark:text-white text-base mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {!isHR && completedProjects.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-slate-100 dark:border-slate-800"
                            >
                                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-300">
                                    <span className="material-symbols-outlined text-4xl">construction</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Chưa có công trình hoàn thành</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Người lao động này chưa có dự án nào hoàn thành trên hệ thống.</p>
                            </motion.div>
                        )}

                        {/* Profile Documents Gallery for Workers */}
                        {!isHR && user.profileDocumentImages && user.profileDocumentImages.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Hồ sơ năng lực cá nhân</p>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                            Tài liệu đã được xác minh
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        {user.profileDocumentImages.map((img: string, idx: number) => {
                                            const isPdf = img.toLowerCase().endsWith('.pdf');
                                            return (
                                                <a
                                                    key={idx}
                                                    href={img}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group overflow-hidden rounded-xl border-2 border-white dark:border-gray-800 bg-white relative block shadow-sm hover:shadow-xl transition-all hover:border-primary/50 hover:-translate-y-1"
                                                >
                                                    {isPdf ? (
                                                        <div className="w-24 h-32 flex flex-col items-center justify-center bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                                                            <span className="material-symbols-outlined text-4xl mb-1">picture_as_pdf</span>
                                                            <span className="text-[10px] font-black uppercase tracking-wider">PDF</span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={img}
                                                            alt={`Tài liệu ${idx + 1}`}
                                                            className="w-24 h-32 object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity scale-75 group-hover:scale-100 duration-300">visibility</span>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </div>

                    {/* Right Column: Skills & Info */}
                    <div className="space-y-8">

                        {/* Skills Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
                        >
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                <Award className="w-4 h-4 text-primary" />
                                Kỹ năng & Chuyên môn
                            </h3>
                            <div className="flex flex-col gap-3">
                                {(user.skills || cv?.skills || []).map((skill: string) => (
                                    <div key={skill} className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl text-sm font-bold border border-slate-100 dark:border-slate-700/50 leading-relaxed">
                                        {skill}
                                    </div>
                                ))}
                                {(!user.skills && !cv?.skills) && <span className="text-sm text-slate-400 italic">Chưa cập nhật kỹ năng</span>}
                            </div>
                        </motion.div>

                        {/* Contact Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl"
                        >
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Thông tin liên hệ
                            </h3>
                            <div className="space-y-6">
                                {user.email && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 pt-1">Email</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all leading-tight">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5 pt-1">Số điện thoại</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-all leading-tight">
                                                {user.phone}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                </div>

            </div>
        </div>
    );
}
