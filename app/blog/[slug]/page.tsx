"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    blogApi,
    Blog,
    BlogComment as CommentType,
    CommentReply,
} from "@/services/blogApi";
import { CommentSection } from "@/components/blog/CommentSection";
import { CreateBlogModal } from "@/components/blog/CreateBlogModal";
import Link from "next/link";
import { useRouter } from "next/navigation";

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return formatDate(dateStr);
};

export default function BlogDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();
    const [copied, setCopied] = useState(false);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const fetchBlog = useCallback(async (silent: boolean = false) => {
        if (!slug) return;
        if (!silent) setLoading(true);
        try {
            const res = await blogApi.getBlogBySlug(slug);
            setBlog(res.data.data);
            setLikesCount(res.data.data.interact.likesCount);
            if (currentUserId) {
                setIsLiked(res.data.data.interact.likes.includes(currentUserId));
            }
            // Fetch related blogs by first tag
            if (res.data.data.tags && res.data.data.tags.length > 0) {
                blogApi
                    .getBlogs({ tag: res.data.data.tags[0], limit: 3 })
                    .then((r) =>
                        setRelatedBlogs(
                            r.data.data.filter((b) => b._id !== res.data.data._id).slice(0, 3)
                        )
                    )
                    .catch(() => { });
            }
        } catch {
            //
        } finally {
            setLoading(false);
        }
    }, [slug, currentUserId]);

    useEffect(() => {
        fetchBlog();
    }, [fetchBlog]);

    // Socket: Join room to listen for real-time interactions (likes/comments)
    useEffect(() => {
        if (!blog) return;
        try {
            import('@/utils/socket').then(({ connectSocket }) => {
                const socket = connectSocket();
                socket.emit('join_blog_room', blog._id);

                const handleBlogUpdated = () => {
                    // Refetch data silently when a like or comment happens
                    fetchBlog(true);
                };

                socket.on('blog_updated', handleBlogUpdated);

                return () => {
                    socket.off('blog_updated', handleBlogUpdated);
                    socket.emit('leave_blog_room', blog._id);
                };
            });
        } catch {
            // ignore
        }
    }, [blog?._id, fetchBlog]);

    const handleLike = async () => {
        if (!blog || !currentUserId) return;
        try {
            const res = await blogApi.likeBlog(blog._id);
            setIsLiked(res.data.isLiked);
            setLikesCount(res.data.likesCount);
            setLikeAnimating(true);
            setTimeout(() => setLikeAnimating(false), 600);
        } catch {
            //
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        if (!blog) return;
        if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
        setIsDeleting(true);
        try {
            await blogApi.deleteBlog(blog._id);
            router.push("/blog");
        } catch {
            alert("Xóa thất bại!");
            setIsDeleting(false);
        }
    };

    const handleCommentAdded = (comment: CommentType) => {
        if (!blog) return;
        setBlog({
            ...blog,
            commentsList: [...blog.commentsList, comment],
            interact: {
                ...blog.interact,
                commentsCount: blog.interact.commentsCount + 1,
            },
        });
    };

    const handleReplyAdded = (commentId: string, reply: CommentReply) => {
        if (!blog) return;
        setBlog({
            ...blog,
            commentsList: blog.commentsList.map((c) =>
                c._id === commentId ? { ...c, replies: [...c.replies, reply] } : c
            ),
            interact: {
                ...blog.interact,
                commentsCount: blog.interact.commentsCount + 1,
            },
        });
    };

    const handleCommentUpdated = (updatedComment: CommentType) => {
        if (!blog) return;
        setBlog({
            ...blog,
            commentsList: blog.commentsList.map(c => c._id === updatedComment._id ? updatedComment : c)
        });
    };

    const handleCommentDeleted = (commentId: string) => {
        if (!blog) return;
        setBlog({
            ...blog,
            commentsList: blog.commentsList.filter(c => c._id !== commentId),
            interact: {
                ...blog.interact,
                commentsCount: blog.interact.commentsCount - 1 - (blog.commentsList.find(c => c._id === commentId)?.replies.length || 0)
            }
        });
    };

    const handleReplyUpdated = (commentId: string, updatedReply: CommentReply) => {
        if (!blog) return;
        setBlog({
            ...blog,
            commentsList: blog.commentsList.map(c =>
                c._id === commentId ? {
                    ...c,
                    replies: c.replies.map(r => r._id === updatedReply._id ? updatedReply : r)
                } : c
            )
        });
    };

    const handleReplyDeleted = (commentId: string, replyId: string) => {
        if (!blog) return;
        setBlog({
            ...blog,
            commentsList: blog.commentsList.map(c =>
                c._id === commentId ? {
                    ...c,
                    replies: c.replies.filter(r => r._id !== replyId)
                } : c
            ),
            interact: {
                ...blog.interact,
                commentsCount: blog.interact.commentsCount - 1
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-background-dark">
                <div className="max-w-[680px] mx-auto px-4 py-8 animate-pulse">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            <div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                            </div>
                        </div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
                        <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-700 rounded-xl mb-6" />
                        <div className="space-y-3">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-4 bg-slate-200 dark:bg-slate-700 rounded"
                                    style={{ width: `${70 + Math.random() * 30}%` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-background-dark flex items-center justify-center">
                <div className="text-center bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-3 block">
                        article
                    </span>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Không tìm thấy bài viết
                    </h2>
                    <Link
                        href="/blog"
                        className="text-primary font-semibold hover:underline mt-4 inline-flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-lg">
                            arrow_back
                        </span>
                        Quay lại Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-background-dark transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto px-4 py-6">
                <div className="flex gap-6 justify-center">
                    {/* Main content */}
                    <article className="w-full max-w-[680px]">
                        {/* Back nav */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-primary transition-colors font-medium text-sm mb-4"
                        >
                            <span className="material-symbols-outlined text-lg">
                                arrow_back
                            </span>
                            Quay lại Bảng tin
                        </Link>

                        {/* Article card - Social style */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden"
                        >
                            {/* Author header */}
                            <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                                <Link
                                    href={blog.author.role === 'hr' || blog.author.role === 'contractor' ? `/hr/${blog.author.id}/profile` : `/profile/${blog.author.id}`}
                                    className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex-shrink-0 ring-2 ring-white dark:ring-slate-700 shadow-sm hover:opacity-80 transition-opacity"
                                >
                                    {blog.author.avatar ? (
                                        <img
                                            src={blog.author.avatar}
                                            alt={blog.author.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                                            {blog.author.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Link>
                                <div className="flex-1">
                                    <Link
                                        href={blog.author.role === 'hr' || blog.author.role === 'contractor' ? `/hr/${blog.author.id}/profile` : `/profile/${blog.author.id}`}
                                        className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {blog.author.name}
                                    </Link>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        {formatTimeAgo(blog.publishedAt || blog.createdAt)}
                                        <span className="text-slate-300 dark:text-slate-600">·</span>
                                        <span className="material-symbols-outlined text-[11px]">
                                            public
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-600 mx-0.5">·</span>
                                        {blog.interact.views} lượt xem
                                    </p>
                                </div>
                                <div className="relative" ref={menuRef}>
                                    {currentUserId === blog.author.id && (
                                        <button
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400"
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                more_horiz
                                            </span>
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
                                                        setShowCreateModal(true);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                    Sửa bài viết
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setShowMenu(false);
                                                        handleDelete();
                                                    }}
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

                            {/* Title */}
                            <div className="px-6 pb-3">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                                    {blog.title}
                                </h1>

                                {/* Tags */}
                                {blog.tags && blog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {blog.tags.map((tag) => (
                                            <Link
                                                key={tag}
                                                href={`/blog?tag=${tag}`}
                                                className="text-primary text-sm font-semibold hover:underline"
                                            >
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Featured Image */}
                            {blog.media.featuredImage && (
                                <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-700">
                                    <img
                                        src={blog.media.featuredImage}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div
                                className="px-6 py-5 prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-p:text-[15px] prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-blockquote:border-l-primary prose-blockquote:text-slate-500"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* Stats row */}
                            <div className="flex items-center justify-between px-6 py-2.5 text-xs text-slate-500 dark:text-slate-400">
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
                                <span>
                                    {blog.interact.commentsCount} bình luận
                                </span>
                            </div>

                            {/* Action bar */}
                            <div className="flex items-center border-t border-b border-slate-100 dark:border-slate-700/50 mx-4">
                                <button
                                    onClick={handleLike}
                                    disabled={!currentUserId}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 ${isLiked
                                        ? "text-primary"
                                        : "text-slate-600 dark:text-slate-400"
                                        }`}
                                >
                                    <motion.span
                                        animate={likeAnimating ? { scale: [1, 1.4, 1] } : {}}
                                        transition={{ duration: 0.4 }}
                                        className="material-symbols-outlined text-xl"
                                        style={
                                            isLiked
                                                ? { fontVariationSettings: "'FILL' 1" }
                                                : {}
                                        }
                                    >
                                        thumb_up
                                    </motion.span>
                                    Thích
                                </button>
                                <a
                                    href="#comments"
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        chat_bubble_outline
                                    </span>
                                    Bình luận
                                </a>
                                <button
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {copied ? "check" : "share"}
                                    </span>
                                    {copied ? "Đã sao chép" : "Chia sẻ"}
                                </button>
                            </div>

                            {/* Comments section */}
                            <div id="comments" className="px-6 pb-6">
                                <CommentSection
                                    blogId={blog._id}
                                    comments={blog.commentsList}
                                    currentUserId={currentUserId}
                                    onCommentAdded={handleCommentAdded}
                                    onReplyAdded={handleReplyAdded}
                                    onCommentUpdated={handleCommentUpdated}
                                    onCommentDeleted={handleCommentDeleted}
                                    onReplyUpdated={handleReplyUpdated}
                                    onReplyDeleted={handleReplyDeleted}
                                />
                            </div>
                        </motion.div>
                    </article>

                    {/* Right sidebar */}
                    <aside className="hidden lg:block w-[300px] flex-shrink-0 sticky top-6 self-start space-y-4">
                        {/* Related posts */}
                        {relatedBlogs.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">
                                        auto_awesome
                                    </span>
                                    Bài viết liên quan
                                </h3>
                                <div className="space-y-3">
                                    {relatedBlogs.map((rb) => (
                                        <Link
                                            key={rb._id}
                                            href={`/blog/${rb.slug}`}
                                            className="flex items-start gap-3 group"
                                        >
                                            {rb.media.featuredImage && (
                                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                                                    <img
                                                        src={rb.media.featuredImage}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                    {rb.title}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {rb.author.name}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Back to feed */}
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 hover:shadow-md transition-shadow text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary"
                        >
                            <span className="material-symbols-outlined text-lg">feed</span>
                            Quay lại Bảng tin
                        </Link>

                        {/* Footer */}
                        <div className="px-4 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                            <div className="flex flex-wrap gap-x-2 gap-y-1">
                                <Link href="/terms" className="hover:underline">
                                    Điều khoản
                                </Link>
                                <span>·</span>
                                <Link href="/privacy" className="hover:underline">
                                    Chính sách
                                </Link>
                            </div>
                            <p className="mt-2">© 2026 BuildForce</p>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Edit Blog Modal */}
            <CreateBlogModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    fetchBlog();
                }}
                initialData={blog}
            />
        </div>
    );
}
