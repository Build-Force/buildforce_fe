"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Blog } from "@/services/blogApi";
import { blogApi } from "@/services/blogApi";

interface BlogCardProps {
    blog: Blog;
    index?: number;
    currentUserId?: string;
    onLikeToggle?: (blogId: string, isLiked: boolean, count: number) => void;
    onEdit?: (blog: Blog) => void;
    onDelete?: (blogId: string) => void;
}

const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
};

const stripHtml = (html: string) => {
    const tmp = typeof document !== "undefined" ? document.createElement("div") : null;
    if (tmp) {
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }
    return html.replace(/<[^>]*>/g, "");
};

export const BlogCard: React.FC<BlogCardProps> = ({
    blog,
    index = 0,
    currentUserId,
    onLikeToggle,
    onEdit,
    onDelete,
}) => {
    const [liked, setLiked] = useState(
        currentUserId ? blog.interact.likes.includes(currentUserId) : false
    );
    const [likesCount, setLikesCount] = useState(blog.interact.likesCount);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync external changes (like from websockets) into local state
    useEffect(() => {
        setLikesCount(blog.interact.likesCount);
        if (currentUserId && blog.interact.likes) {
            setLiked(blog.interact.likes.includes(currentUserId));
        }
    }, [blog.interact.likesCount, blog.interact.likes, currentUserId]);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUserId) return;
        try {
            const res = await blogApi.likeBlog(blog._id);
            setLiked(res.data.isLiked);
            setLikesCount(res.data.likesCount);
            setLikeAnimating(true);
            setTimeout(() => setLikeAnimating(false), 600);
            onLikeToggle?.(blog._id, res.data.isLiked, res.data.likesCount);
        } catch {
            // handle
        }
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof navigator !== "undefined") {
            navigator.clipboard.writeText(
                `${window.location.origin}/blog/${blog.slug}`
            );
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
        setIsDeleting(true);
        try {
            await blogApi.deleteBlog(blog._id);
            onDelete?.(blog._id);
        } catch {
            alert("Xóa thất bại!");
        } finally {
            setIsDeleting(false);
        }
    };

    const contentPreview = stripHtml(blog.content).slice(0, 200);

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4 }}
            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300"
        >
            {/* Author header */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <Link
                    href={blog.author.role === 'hr' || blog.author.role === 'contractor' ? `/hr/${blog.author.id}/profile` : `/profile/${blog.author.id}`}
                    className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex-shrink-0 ring-2 ring-white dark:ring-slate-700 shadow-sm hover:opacity-80 transition-opacity"
                >
                    {blog.author.avatar ? (
                        <img
                            src={blog.author.avatar}
                            alt={blog.author.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {blog.author.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>
                <div className="flex-1 min-w-0">
                    <Link
                        href={blog.author.role === 'hr' || blog.author.role === 'contractor' ? `/hr/${blog.author.id}/profile` : `/profile/${blog.author.id}`}
                        className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight hover:text-primary transition-colors cursor-pointer"
                    >
                        {blog.author.name}
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {formatTimeAgo(blog.publishedAt || blog.createdAt)}
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="material-symbols-outlined text-[11px]">
                            public
                        </span>
                    </p>
                </div>

                {/* Status badge for non-approved */}
                {blog.status !== "approved" && (
                    <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${blog.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : blog.status === "rejected"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                            }`}
                    >
                        {blog.status === "pending"
                            ? "Chờ duyệt"
                            : blog.status === "rejected"
                                ? "Từ chối"
                                : blog.status}
                    </span>
                )}

                <div className="relative" ref={menuRef}>
                    {currentUserId === blog.author.id && (
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400"
                        >
                            <span className="material-symbols-outlined text-xl">more_horiz</span>
                        </button>
                    )}
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/50 py-1.5 z-10"
                            >
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowMenu(false);
                                        onEdit?.(blog);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                    Sửa bài viết
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    {isDeleting ? "Đang xóa..." : "Xóa bài viết"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content */}
            <Link href={`/blog/${blog.slug}`} className="block">
                {/* Text content */}
                <div className="px-5 pb-3">
                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                        {blog.title}
                    </h3>
                    {contentPreview && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {contentPreview}
                            {contentPreview.length >= 200 && (
                                <span className="text-primary font-semibold ml-1">
                                    ...xem thêm
                                </span>
                            )}
                        </p>
                    )}

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {blog.tags.slice(0, 5).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-primary text-xs font-semibold hover:underline cursor-pointer"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Featured Image */}
                {blog.media.featuredImage && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-700">
                        <img
                            src={blog.media.featuredImage}
                            alt={blog.title}
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
                            loading="lazy"
                        />
                    </div>
                )}
            </Link>

            {/* Stats row */}
            <div className="flex items-center justify-between px-5 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                    {likesCount > 0 && (
                        <>
                            <div className="flex -space-x-1">
                                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[10px]">
                                        thumb_up
                                    </span>
                                </span>
                                <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white text-[10px]">
                                        favorite
                                    </span>
                                </span>
                            </div>
                            <span className="ml-1 font-medium">{likesCount}</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {blog.interact.commentsCount > 0 && (
                        <span className="hover:underline cursor-pointer">
                            {blog.interact.commentsCount} bình luận
                        </span>
                    )}
                    {blog.interact.views > 0 && (
                        <span>{blog.interact.views} lượt xem</span>
                    )}
                </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center border-t border-slate-100 dark:border-slate-700/50 mx-3">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${liked
                        ? "text-primary"
                        : "text-slate-600 dark:text-slate-400"
                        }`}
                >
                    <motion.span
                        animate={likeAnimating ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ duration: 0.4 }}
                        className="material-symbols-outlined text-xl"
                        style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
                    >
                        thumb_up
                    </motion.span>
                    Thích
                </button>

                <Link
                    href={`/blog/${blog.slug}#comments`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">
                        chat_bubble_outline
                    </span>
                    Bình luận
                </Link>

                <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">share</span>
                    Chia sẻ
                </button>
            </div>
        </motion.article>
    );
};
