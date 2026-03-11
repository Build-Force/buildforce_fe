"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, ExternalLink, Download } from 'lucide-react';
import api from '@/utils/api';

export default function PublicWorkerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const resolvedParams = React.use(params as Promise<{ id: string }>);
    const id = resolvedParams?.id;

    useEffect(() => {
        if (!id) return;
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/users/${id}/public-profile`);
                if (res.data.success) {
                    setData(res.data.data);
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
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#040816] pt-24 pb-12">
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
