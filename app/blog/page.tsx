"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { blogApi, Blog, GetBlogsParams } from "@/services/blogApi";
import { BlogCard } from "@/components/blog/BlogCard";
import { CreateBlogModal } from "@/components/blog/CreateBlogModal";
import Link from "next/link";
import { connectSocket } from "@/utils/socket";

const TRENDING_TAGS = [
    "xây dựng",
    "kinh nghiệm",
    "an toàn",
    "công nghệ",
    "vật liệu",
    "thiết kế",
    "thi công",
    "nhân sự",
    "mẹo hay",
    "dự án",
];

const BLOG_SOCIAL_LINKS = [
    { href: "https://facebook.com", label: "Facebook", icon: "facebook" },
    { href: "https://youtube.com", label: "YouTube", icon: "youtube" },
    { href: "https://linkedin.com", label: "LinkedIn", icon: "linkedin" },
    { href: "https://twitter.com", label: "X (Twitter)", icon: "x" },
] as const;

function BlogSocialIcon({ kind }: { kind: string }) {
    const size = 20;
    const className = "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors";
    switch (kind) {
        case "facebook":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            );
        case "youtube":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            );
        case "linkedin":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            );
        case "x":
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        default:
            return null;
    }
}

type FeedTab = "latest" | "popular" | "likes";

export default function BlogPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<FeedTab>("latest");
    const [searchInput, setSearchInput] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [newBlogNotif, setNewBlogNotif] = useState<string | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    setCurrentUserId(payload.userId || payload._id);
                } catch {
                    //
                }
            }
        }
    }, []);

    // Load popular blogs for sidebar
    useEffect(() => {
        blogApi
            .getBlogs({ limit: 5, sort: "popular" })
            .then((res) => setPopularBlogs(res.data.data))
            .catch(() => { });
    }, []);

    const fetchBlogs = useCallback(
        async (resetList = false) => {
            if (resetList) setLoading(true);
            try {
                const currentPage = resetList ? 1 : page;
                const params: GetBlogsParams = {
                    page: currentPage,
                    limit: 8,
                    sort: activeTab,
                };
                if (search) params.search = search;
                if (selectedTag) params.tag = selectedTag;

                const res = await blogApi.getBlogs(params);
                if (resetList) {
                    setBlogs(res.data.data);
                    setPage(1);
                } else {
                    setBlogs((prev) =>
                        currentPage === 1 ? res.data.data : [...prev, ...res.data.data]
                    );
                }
                setTotalPages(res.data.pagination.pages);
                setHasMore(currentPage < res.data.pagination.pages);
            } catch {
                //
            } finally {
                setLoading(false);
            }
        },
        [page, search, selectedTag, activeTab]
    );

    useEffect(() => {
        fetchBlogs(page === 1);
    }, [activeTab, search, selectedTag]);

    useEffect(() => {
        if (page > 1) fetchBlogs();
    }, [page]);

    // Real-time new blog notification
    useEffect(() => {
        try {
            const socket = connectSocket();
            socket.on(
                "blog_approved",
                (data: { slug: string; title: string; author: string }) => {
                    setNewBlogNotif(data.title);
                    setTimeout(() => setNewBlogNotif(null), 8000);
                }
            );
            return () => {
                socket.off("blog_approved");
            };
        } catch {
            //
        }
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(value);
            setPage(1);
        }, 500);
    };

    const handleTagClick = (tag: string) => {
        setSelectedTag(selectedTag === tag ? null : tag);
        setPage(1);
    };

    const loadMore = () => {
        if (hasMore && !loading) setPage((p) => p + 1);
    };

    const feedTabs: { value: FeedTab; label: string; icon: string }[] = [
        { value: "latest", label: "Mới nhất", icon: "schedule" },
        { value: "popular", label: "Xu hướng", icon: "trending_up" },
        { value: "likes", label: "Yêu thích", icon: "favorite" },
    ];

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-background-dark transition-colors duration-300">
            {/* New blog notification toast */}
            <AnimatePresence>
                {newBlogNotif && (
                    <motion.div
                        initial={{ opacity: 0, y: -80 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -80 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded-2xl shadow-2xl shadow-primary/30 flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                            setNewBlogNotif(null);
                            setActiveTab("latest");
                            setPage(1);
                            fetchBlogs(true);
                        }}
                    >
                        <span className="material-symbols-outlined">notifications_active</span>
                        <span className="font-semibold text-sm">
                            Bài viết mới: {newBlogNotif}
                        </span>
                        <span className="text-xs text-white/70">Nhấn để xem</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* ========== LEFT SIDEBAR ========== */}
                    <aside className="hidden lg:block w-[280px] flex-shrink-0 sticky top-6 self-start space-y-4">
                        {/* Profile quick card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                            <div className="h-20 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
                            <div className="px-4 pb-4 -mt-8">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary ring-4 ring-white dark:ring-slate-800 flex items-center justify-center text-white text-xl font-bold shadow-lg mx-auto">
                                    {currentUserId ? "U" : "?"}
                                </div>
                                <div className="text-center mt-2">
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                                        {currentUserId ? "Trang cá nhân" : "Chào bạn!"}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {currentUserId
                                            ? "Chia sẻ kiến thức với cộng đồng"
                                            : "Đăng nhập để tương tác"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-2">
                            <Link
                                href="/blog"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary/10 text-primary"
                            >
                                <span className="material-symbols-outlined text-xl">home</span>
                                Bảng tin
                            </Link>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <span className="material-symbols-outlined text-xl">edit_square</span>
                                Viết bài
                            </button>
                            <Link
                                href="/blog?sort=popular"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            >
                                <span className="material-symbols-outlined text-xl">whatshot</span>
                                Nổi bật
                            </Link>
                        </nav>

                        {/* Trending tags */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">
                                    tag
                                </span>
                                Chủ đề thịnh hành
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {TRENDING_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${selectedTag === tag
                                            ? "bg-primary text-white shadow-md shadow-primary/25"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary"
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mạng xã hội */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">
                                    share
                                </span>
                                Mạng xã hội
                            </h3>
                            <div className="flex items-center justify-center gap-4" aria-label="Mạng xã hội BuildForce">
                                {BLOG_SOCIAL_LINKS.map((social) => (
                                    <a
                                        key={social.icon}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                        title={social.label}
                                        aria-label={social.label}
                                    >
                                        <BlogSocialIcon kind={social.icon} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* ========== MAIN FEED ========== */}
                    <main className="flex-1 min-w-0 max-w-[600px]">
                        {/* Create post CTA */}
                        <div onClick={() => setShowCreateModal(true)} className="block mb-4 cursor-pointer">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {currentUserId ? "U" : "?"}
                                    </div>
                                    <div className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 text-sm cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                        Bạn đang nghĩ gì? Chia sẻ kiến thức...
                                    </div>
                                </div>
                                <div className="flex items-center justify-around mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-green-500 text-xl">
                                            photo_library
                                        </span>
                                        <span className="font-medium">Ảnh/Video</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-amber-500 text-xl">
                                            article
                                        </span>
                                        <span className="font-medium">Viết bài</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
                                        <span className="material-symbols-outlined text-red-500 text-xl">
                                            sell
                                        </span>
                                        <span className="font-medium">Gắn thẻ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feed tabs */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 mb-4 overflow-hidden">
                            <div className="flex items-center">
                                {feedTabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => {
                                            setActiveTab(tab.value);
                                            setPage(1);
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all relative ${activeTab === tab.value
                                            ? "text-primary"
                                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                        {activeTab === tab.value && (
                                            <motion.div
                                                layoutId="feedTabIndicator"
                                                className="absolute bottom-0 left-2 right-2 h-[3px] bg-primary rounded-t-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search (mobile) */}
                        <div className="lg:hidden mb-4">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Tìm kiếm bài viết..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Selected tag indicator */}
                        {selectedTag && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-semibold text-sm"
                            >
                                <span className="material-symbols-outlined text-base">
                                    filter_alt
                                </span>
                                Lọc theo: #{selectedTag}
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className="ml-auto p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        close
                                    </span>
                                </button>
                            </motion.div>
                        )}

                        {/* Blog feed */}
                        {loading && page === 1 ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse border border-slate-200/80 dark:border-slate-700/50"
                                    >
                                        <div className="flex items-center gap-3 p-5">
                                            <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-700" />
                                            <div className="flex-1">
                                                <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-2" />
                                                <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                                            </div>
                                        </div>
                                        <div className="px-5 pb-3 space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
                                        </div>
                                        <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-700" />
                                        <div className="flex gap-4 p-4">
                                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
                                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
                                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : blogs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 py-16 text-center"
                            >
                                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3 block">
                                    feed
                                </span>
                                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">
                                    {search
                                        ? "Không tìm thấy bài viết"
                                        : "Chưa có bài viết nào"}
                                </h3>
                                <p className="text-slate-400 text-sm mb-5">
                                    Hãy là người đầu tiên chia sẻ kiến thức!
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        edit_note
                                    </span>
                                    Viết bài đầu tiên
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {blogs.map((blog, index) => (
                                        <BlogCard
                                            key={blog._id}
                                            blog={blog}
                                            index={index}
                                            currentUserId={currentUserId}
                                            onDelete={(id) => setBlogs(prev => prev.filter(b => b._id !== id))}
                                            onEdit={(b) => {
                                                setEditingBlog(b);
                                                setShowCreateModal(true);
                                            }}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* Load more */}
                                {hasMore && (
                                    <div className="text-center py-4">
                                        <button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="px-8 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary font-bold text-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined animate-spin text-base">
                                                        progress_activity
                                                    </span>
                                                    Đang tải...
                                                </span>
                                            ) : (
                                                "Xem thêm bài viết"
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>

                    {/* ========== RIGHT SIDEBAR ========== */}
                    <aside className="hidden xl:block w-[300px] flex-shrink-0 sticky top-6 self-start space-y-4">
                        {/* Search */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-3">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Tìm kiếm..."
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 outline-none text-sm focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </div>

                        {/* Popular posts */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500 text-lg">
                                    whatshot
                                </span>
                                Bài viết nổi bật
                            </h3>
                            <div className="space-y-3">
                                {popularBlogs.map((blog, i) => (
                                    <Link
                                        key={blog._id}
                                        href={`/blog/${blog.slug}`}
                                        className="flex items-start gap-3 group"
                                    >
                                        <span className="text-2xl font-black text-slate-200 dark:text-slate-700 leading-none mt-0.5 group-hover:text-primary transition-colors">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                {blog.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                                <span>{blog.author.name}</span>
                                                <span>·</span>
                                                <span className="flex items-center gap-0.5">
                                                    <span className="material-symbols-outlined text-[11px]">
                                                        favorite
                                                    </span>
                                                    {blog.interact.likesCount}
                                                </span>
                                            </div>
                                        </div>
                                        {blog.media.featuredImage && (
                                            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                                                <img
                                                    src={blog.media.featuredImage}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Footer links */}
                        <div className="px-4 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                            <div className="flex flex-wrap gap-x-2 gap-y-1">
                                <Link href="/terms" className="hover:underline">
                                    Điều khoản
                                </Link>
                                <span>·</span>
                                <Link href="/privacy" className="hover:underline">
                                    Chính sách
                                </Link>
                                <span>·</span>
                                <Link href="/" className="hover:underline">
                                    Giới thiệu
                                </Link>
                            </div>
                            <p className="mt-2">© 2026 BuildForce</p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Create / Edit Blog Modal */}
            <CreateBlogModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setTimeout(() => setEditingBlog(null), 300);
                }}
                onSuccess={() => {
                    setPage(1);
                    fetchBlogs(true);
                }}
                initialData={editingBlog}
            />
        </div>
    );
}
