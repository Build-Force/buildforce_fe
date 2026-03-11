"use client";

import React, { useState } from 'react';
import {
    Building2, MapPin, CalendarDays, CheckCircle2,
    ShieldCheck, CreditCard, AlertTriangle, ChevronDown,
    ChevronUp, ExternalLink, Bookmark, BookmarkCheck, Loader2
} from 'lucide-react';
import api from '@/utils/api';

interface HRProps {
    id: string;
    name: string;
    logo: string | null;
    profileDocumentImage?: string;
    profileDocumentImages?: string[];
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
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            // Fetch current user profile to check if saved
            api.get('/api/auth/profile').then(res => {
                if (res.data.success) {
                    const saved = res.data.data.savedContractors || [];
                    setIsSaved(saved.some((id: string) => id === hr.id));
                }
            }).catch(() => { });
        }
    }, [hr.id]);

    const handleToggleSave = async () => {
        if (!isLoggedIn) {
            alert("Vui lòng đăng nhập để lưu nhà thầu");
            return;
        }
        setSaving(true);
        try {
            const res = await api.post('/api/users/contractors/save', { contractorId: hr.id });
            if (res.data.success) {
                const nowSaved = res.data.saved;
                setIsSaved(nowSaved);
                if (nowSaved) {
                    const hideDialog = localStorage.getItem('hideSaveContractorDialog');
                    if (hideDialog !== 'true') {
                        setShowSuccessDialog(true);
                    }
                }
            }
        } catch (err) {
            console.error("Thao tác thất bại", err);
        } finally {
            setSaving(false);
        }
    };

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

                    <button
                        onClick={handleToggleSave}
                        disabled={saving}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border transition-all shadow-sm mb-2 md:mb-0 text-sm font-semibold ${isSaved
                            ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSaved ? (
                            <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" />
                        ) : (
                            <Bookmark className="w-4 h-4" />
                        )}
                        {isSaved ? "Đã lưu" : "Lưu nhà thầu"}
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

            {/* Profile Document Images */}
            {((hr.profileDocumentImages && hr.profileDocumentImages.length > 0) || hr.profileDocumentImage) && (
                <>
                    <div className="h-px w-full bg-gray-100 dark:bg-gray-700 my-6" />
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        {/* Images Gallery */}
                        <div className="flex flex-wrap gap-3 flex-shrink-0 justify-center md:justify-start">
                            {(hr.profileDocumentImages && hr.profileDocumentImages.length > 0
                                ? hr.profileDocumentImages
                                : hr.profileDocumentImage
                                ? [hr.profileDocumentImage]
                                : []
                            ).map((img, idx) => {
                                const isPdf = img.toLowerCase().endsWith('.pdf');
                                return (
                                <a
                                    key={idx}
                                    href={isPdf ? img : '#'}
                                    onClick={(e) => {
                                        if (!isPdf) {
                                            e.preventDefault();
                                            setSelectedImage(img);
                                        }
                                    }}
                                    target={isPdf ? "_blank" : undefined}
                                    rel={isPdf ? "noopener noreferrer" : undefined}
                                    className="group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white relative block shadow-sm hover:shadow-md transition-all hover:border-primary/30"
                                >
                                    {isPdf ? (
                                        <div className="w-24 h-32 flex flex-col items-center justify-center bg-red-50 text-red-500 group-hover:bg-red-100 transition-colors">
                                            <svg className="w-10 h-10 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                            <span className="text-[10px] font-black uppercase tracking-wider">PDF</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={img}
                                            alt={`Hồ sơ năng lực ${idx + 1}`}
                                            className="w-24 h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                        <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity scale-75 group-hover:scale-100 duration-300" />
                                    </div>
                                </a>
                                );
                            })}
                        </div>
                        
                        {/* Info */}
                        <div className="flex flex-col justify-center min-h-[8rem] text-center md:text-left">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">Hồ sơ năng lực</p>
                            <p className="text-sm font-black text-gray-900 dark:text-gray-100 mb-2">{hr.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-3">
                                Tài liệu năng lực đã được kiểm duyệt. Nhấp vào từng ảnh để mở lớn và xem chi tiết đầy đủ.
                            </p>
                        </div>
                    </div>
                </>
            )}

            {/* Success Dialog */}
            {showSuccessDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800 scale-in-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <BookmarkCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2 tracking-tight">Đã lưu nhà thầu!</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center text-sm font-medium leading-relaxed mb-8">
                            Bạn có thể vào <span className="font-bold text-slate-900 dark:text-white">Profile → Nhà thầu đã lưu</span> để xem lại bất cứ lúc nào.
                        </p>
                        <div
                            className="flex items-center justify-center gap-2 mb-8 cursor-pointer group select-none"
                            onClick={() => setDontShowAgain(!dontShowAgain)}
                        >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${dontShowAgain
                                    ? "bg-emerald-500 border-emerald-500 shadow-sm"
                                    : "border-slate-200 group-hover:border-slate-300"
                                }`}>
                                {dontShowAgain && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Đừng nhắc lại</span>
                        </div>
                        <button
                            onClick={() => {
                                if (dontShowAgain) {
                                    localStorage.setItem('hideSaveContractorDialog', 'true');
                                }
                                setShowSuccessDialog(false);
                            }}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}

            {/* Image Viewer Dialog */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 transition-opacity animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all rounded-full flex items-center justify-center z-10 backdrop-blur-md"
                    >
                        <span className="material-symbols-outlined text-white text-2xl font-light">close</span>
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Document Preview" 
                        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl relative select-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
