"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { blogApi, Blog } from "@/services/blogApi";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";
import { NavItem } from "@/components/admin/types";

type FilterStatus = "pending" | "approved" | "rejected" | "all";

const NAV_ITEMS: NavItem[] = [
    { label: "Tổng quan", href: "/admin", icon: "dashboard" },
    { label: "Người dùng", href: "/admin/users", icon: "group" },
    { label: "Quản lý HR", href: "/admin/hr", icon: "badge" },
    { label: "Việc làm", href: "/admin/jobs", icon: "work" },
    { label: "Thanh toán", href: "/admin/payments", icon: "payments" },
    { label: "Tranh chấp", href: "/admin/disputes", icon: "report_problem" },
    { label: "Blog", href: "/admin/blogs", icon: "article", active: true },
];

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>("pending");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rejectModal, setRejectModal] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 10 };
            if (filter !== "all") params.status = filter;
            const res = await blogApi.getBlogs(params);
            setBlogs(res.data.data);
            setTotalPages(res.data.pagination.pages);
        } catch {
            // handle error
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await blogApi.approveBlog(id);
            fetchBlogs();
        } catch {
            // handle error
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectReason.trim()) return;
        setActionLoading(rejectModal);
        try {
            await blogApi.rejectBlog(rejectModal, rejectReason.trim());
            setRejectModal(null);
            setRejectReason("");
            fetchBlogs();
        } catch {
            // handle error
        } finally {
            setActionLoading(null);
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
            archived: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
        };
        const labels: Record<string, string> = {
            pending: "Chờ duyệt",
            approved: "Đã duyệt",
            rejected: "Từ chối",
            draft: "Nháp",
            archived: "Đã lưu trữ",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || map.draft}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filterTabs: { value: FilterStatus; label: string; icon: string }[] = [
        { value: "pending", label: "Chờ duyệt", icon: "hourglass_top" },
        { value: "approved", label: "Đã duyệt", icon: "check_circle" },
        { value: "rejected", label: "Từ chối", icon: "cancel" },
        { value: "all", label: "Tất cả", icon: "list" },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100">
            <Sidebar navItems={NAV_ITEMS} />
            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Topbar locale="vi" />
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Quản lý Blog
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Phê duyệt, từ chối hoặc quản lý các bài viết blog
                            </p>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-2 mb-8 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                            {filterTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => {
                                        setFilter(tab.value);
                                        setPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${filter === tab.value
                                        ? "bg-primary text-white shadow-md"
                                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {tab.icon}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Blog list */}
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-white dark:bg-slate-800 rounded-xl animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : blogs.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3 block">
                                    inbox
                                </span>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Không có bài viết nào
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {blogs.map((blog) => (
                                        <motion.div
                                            key={blog._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                                                {blog.media.featuredImage && (
                                                    <img
                                                        src={blog.media.featuredImage}
                                                        alt={blog.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {statusBadge(blog.status)}
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    bởi {blog.author.name}
                                                </p>
                                                {blog.adminReview?.reason && (
                                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">
                                                            warning
                                                        </span>
                                                        Lý do: {blog.adminReview.reason}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">
                                                        visibility
                                                    </span>
                                                    {blog.interact.views}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">
                                                        favorite
                                                    </span>
                                                    {blog.interact.likesCount}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">
                                                        chat_bubble
                                                    </span>
                                                    {blog.interact.commentsCount}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {blog.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(blog._id)}
                                                            disabled={actionLoading === blog._id}
                                                            className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">
                                                                check
                                                            </span>
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal(blog._id)}
                                                            disabled={actionLoading === blog._id}
                                                            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-all flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">
                                                                close
                                                            </span>
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Reject Modal */}
                    <AnimatePresence>
                        {rejectModal && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setRejectModal(null)}
                            >
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.95 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                                >
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                        Từ chối bài viết
                                    </h3>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Nhập lý do từ chối..."
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-300 resize-none"
                                    />
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            onClick={() => {
                                                setRejectModal(null);
                                                setRejectReason("");
                                            }}
                                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={!rejectReason.trim() || actionLoading === rejectModal}
                                            className="px-5 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 transition-all"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
