"use client";

import React, { useState } from 'react';
import {
    Building2, MapPin, CalendarDays, CheckCircle2,
    ShieldCheck, CreditCard, AlertTriangle, ChevronDown,
    ChevronUp, ExternalLink, Bookmark
} from 'lucide-react';

interface HRProps {
    id: string;
    name: string;
    logo: string | null;
    initials: string;
    verified: boolean;
    verifiedMST: boolean;
    verifiedAddress: boolean;
    joinedDate: string;
    location: string;
    industryType: string;
    description: string;
    badges: string[];
    warnings: string[];
    stats: {
        onTimePaymentRate: number;
        [key: string]: any;
    };
    activeJobs: any[];
}

export default function ProfileHeader({ hr }: { hr: HRProps }) {
    const [warningsExpanded, setWarningsExpanded] = useState(false);

    // Hash string to color
    const stringToColour = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let colour = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    };

    const getJoinedYears = (dateStr: string) => {
        const joinedYear = new Date(dateStr).getFullYear();
        const currentYear = new Date().getFullYear();
        const diff = currentYear - joinedYear;
        return diff > 0 ? diff : 1;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-500">

            {/* Warnings Banner */}
            {hr.warnings && hr.warnings.length > 0 && (
                <div className="mb-6 overflow-hidden rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <button
                        onClick={() => setWarningsExpanded(!warningsExpanded)}
                        className="w-full flex items-center justify-between p-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <p className="font-medium text-orange-800 dark:text-orange-400 text-sm">
                                Cảnh báo từ hệ thống: {hr.warnings[0]} {hr.warnings.length > 1 && `và ${hr.warnings.length - 1} cảnh báo khác`}
                            </p>
                        </div>
                        {warningsExpanded ? (
                            <ChevronUp className="w-5 h-5 text-orange-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-orange-500" />
                        )}
                    </button>

                    {warningsExpanded && (
                        <div className="px-4 pb-4 pt-0">
                            <div className="h-px w-full bg-orange-200/50 dark:bg-orange-800/50 mb-3 ml-8" />
                            <ul className="list-disc pl-14 text-sm text-orange-700 dark:text-orange-300 space-y-1">
                                {hr.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Main Header Form */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="flex-shrink-0 relative">
                    {hr.logo ? (
                        <img
                            src={hr.logo}
                            alt={hr.name}
                            className="w-20 h-20 rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
                        />
                    ) : (
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border border-gray-200 dark:border-gray-700"
                            style={{ backgroundColor: stringToColour(hr.name) }}
                        >
                            {hr.initials}
                        </div>
                    )}
                    {hr.verified && (
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 border shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                                {hr.name}
                            </h1>
                            {hr.verified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Đã xác minh
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Chưa xác minh đầy đủ
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {hr.location}
                            </span>
                            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                            <span className="flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                {hr.industryType}
                            </span>
                            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4 text-gray-400" />
                                Hoạt động {getJoinedYears(hr.joinedDate)} năm
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed max-w-2xl">
                        {hr.description}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button
                        onClick={() => document.getElementById('active-jobs')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20 hover:shadow-blue-600/40"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Xem việc đang tuyển ({hr.activeJobs.length})
                    </button>

                    <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 transition-all shadow-sm mb-2 md:mb-0">
                        <Bookmark className="w-4 h-4" />
                        Lưu nhà thầu
                    </button>
                </div>
            </div>

            <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-6" />

            {/* Trust Seals Strip */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <ShieldCheck className={`w-4 h-4 ${hr.verifiedMST ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${hr.verifiedMST ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
                        {hr.verifiedMST ? 'Xác minh MST' : 'Chưa xác minh MST'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <ShieldCheck className={`w-4 h-4 ${hr.verifiedAddress ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${hr.verifiedAddress ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
                        {hr.verifiedAddress ? 'Xác minh địa chỉ' : 'Chưa xác minh địa chỉ'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <CreditCard className={`w-4 h-4 ${hr.badges.includes('payment_good') ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${hr.badges.includes('payment_good') ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
                        Thanh toán {hr.stats.onTimePaymentRate}%
                    </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    <CheckCircle2 className={`w-4 h-4 ${hr.badges.includes('no_violations') ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${hr.badges.includes('no_violations') ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'}`}>
                        {hr.badges.includes('no_violations') ? 'Không vi phạm' : 'Có vi phạm'}
                    </span>
                </div>
            </div>
        </div>
    );
}
