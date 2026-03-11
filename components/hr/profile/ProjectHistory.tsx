"use client";

import React, { useState } from 'react';
import { Building, MapPin, Calendar, Users, DollarSign, Star, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    district: string;
    city: string;
    startDate: string;
    endDate: string;
    status: 'completed' | 'ongoing' | 'cancelled';
    workerTypes: { type: string; count: number }[];
    paymentStatus: 'on_time' | 'late' | 'partial';
    rating?: number;
    reviewSnippet?: string;
}

interface ProjectHistoryProps {
    projects: Project[];
}

export default function ProjectHistory({ projects }: ProjectHistoryProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed' | 'cancelled'>('all');

    const filteredProjects = projects.filter(p => {
        if (activeTab === 'all') return true;
        return p.status === activeTab;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hoàn thành
                    </span>
                );
            case 'ongoing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                        <span className="relative flex h-2 w-2 mr-0.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Đang thi công
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                        <XCircle className="w-3.5 h-3.5" />
                        Đã hủy
                    </span>
                );
            default:
                return null;
        }
    };

    const getPaymentBadge = (paymentStatus: string) => {
        if (paymentStatus === 'on_time') {
            return (
                <span className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-500">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Đúng hạn
                </span>
            );
        }
        return (
            <span className="inline-flex items-center text-sm font-medium text-amber-500">
                <Clock className="w-4 h-4 mr-1" /> Trễ
            </span>
        );
    };

    const calculateMonths = (start: string, end: string) => {
        const d1 = new Date(start);
        const d2 = new Date(end);
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 1 : months;
    };

    return (
        <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl inline-flex items-center font-bold text-gray-900 dark:text-gray-100">
                        Lịch sử công trình
                    </h2>
                </div>
                <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                    {projects.length} công trình
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'all'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                >
                    Tất cả ({projects.length})
                </button>
                <button
                    onClick={() => setActiveTab('ongoing')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'ongoing'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                >
                    Đang thi công ({projects.filter(p => p.status === 'ongoing').length})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'completed'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                >
                    Hoàn thành ({projects.filter(p => p.status === 'completed').length})
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'cancelled'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                        }`}
                >
                    Đã hủy ({projects.filter(p => p.status === 'cancelled').length})
                </button>
            </div>

            {/* Project List */}
            <div className="space-y-4">
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        {/* Status indicator line on the left edge */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${project.status === 'completed' ? 'bg-green-500' :
                            project.status === 'ongoing' ? 'bg-blue-500' : 'bg-red-500'
                            }`} />

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Building className="w-5 h-5 text-gray-400" />
                                        {project.name}
                                    </h3>
                                    {getStatusBadge(project.status)}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        {project.district}, {project.city}
                                    </span>
                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        {project.startDate} – {project.endDate} ({calculateMonths(project.startDate, project.endDate)} tháng)
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.workerTypes?.map((type, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 rounded text-xs border border-gray-100 dark:border-gray-700 font-medium"
                                        >
                                            {typeof type === 'string' ? type : type.type}
                                            {typeof type === 'object' && type.count && <span className="opacity-60 ml-1">×{type.count}</span>}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {project.paymentStatus && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Thanh toán:</span>
                                            {getPaymentBadge(project.paymentStatus)}
                                        </div>
                                    )}

                                    {project.rating && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Đánh giá chung:</span>
                                            <span className="inline-flex items-center text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {project.rating} <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 ml-1" />
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {project.reviewSnippet && (
                                    <div className="mt-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm italic text-gray-500 dark:text-gray-400">
                                            &quot;{project.reviewSnippet}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProjects.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 dark:bg-gray-800/50 dark:border-gray-700">
                        <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy công trình nào.</p>
                    </div>
                )}
            </div>

            {filteredProjects.length > 0 && projects.length > filteredProjects.length && (
                <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        Xem thêm công trình
                    </button>
                </div>
            )}
        </section>
    );
}
