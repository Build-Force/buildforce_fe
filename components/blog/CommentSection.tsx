"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { blogApi, BlogComment as CommentType, CommentReply } from "@/services/blogApi";

interface CommentSectionProps {
    blogId: string;
    comments: CommentType[];
    currentUserId?: string;
    onCommentAdded?: (comment: CommentType) => void;
    onReplyAdded?: (commentId: string, reply: CommentReply) => void;
    onCommentUpdated?: (comment: CommentType) => void;
    onCommentDeleted?: (commentId: string) => void;
    onReplyUpdated?: (commentId: string, reply: CommentReply) => void;
    onReplyDeleted?: (commentId: string, replyId: string) => void;
}

const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString("vi-VN");
};

import Link from "next/link";

const Avatar: React.FC<{ name: string; avatar?: string; size?: string; id?: string; role?: string }> = ({
    name,
    avatar,
    size = "w-10 h-10",
    id,
    role
}) => {
    const content = (
        <div
            className={`${size} rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
        >
            {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                    {name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    );

    if (id) {
        return (
            <Link href={`/profile/${id}`}>
                {content}
            </Link>
        );
    }
    return content;
};

export const CommentSection: React.FC<CommentSectionProps> = ({
    blogId,
    comments,
    currentUserId,
    onCommentAdded,
    onReplyAdded,
    onCommentUpdated,
    onCommentDeleted,
    onReplyUpdated,
    onReplyDeleted,
}) => {
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [replySubmitting, setReplySubmitting] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [editingReplyId, setEditingReplyId] = useState<{ commentId: string, replyId: string } | null>(null);
    const [editReplyContent, setEditReplyContent] = useState("");

    const handleSubmitComment = async () => {
        if (!newComment.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await blogApi.commentBlog(blogId, newComment.trim());
            onCommentAdded?.(res.data.data);
            setNewComment("");
        } catch {
            // handle error
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReply = async (commentId: string) => {
        if (!replyContent.trim() || replySubmitting) return;
        setReplySubmitting(true);
        try {
            const res = await blogApi.replyComment(
                blogId,
                commentId,
                replyContent.trim()
            );
            onReplyAdded?.(commentId, res.data.data);
            setReplyContent("");
            setReplyingTo(null);
        } catch {
            // handle error
        } finally {
            setReplySubmitting(false);
        }
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!editCommentContent.trim()) return;
        try {
            const res = await blogApi.updateComment(blogId, commentId, editCommentContent.trim());
            onCommentUpdated?.(res.data.data);
            setEditingCommentId(null);
            setEditCommentContent("");
        } catch {
            // handle error
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
        try {
            await blogApi.deleteComment(blogId, commentId);
            onCommentDeleted?.(commentId);
        } catch {
            // handle error
        }
    };

    const handleUpdateReply = async (commentId: string, replyId: string) => {
        if (!editReplyContent.trim()) return;
        try {
            const res = await blogApi.updateReply(blogId, commentId, replyId, editReplyContent.trim());
            onReplyUpdated?.(commentId, res.data.data);
            setEditingReplyId(null);
            setEditReplyContent("");
        } catch {
            // handle error
        }
    };

    const handleDeleteReply = async (commentId: string, replyId: string) => {
        if (!confirm("Bạn có chắc muốn xóa phản hồi này?")) return;
        try {
            await blogApi.deleteReply(blogId, commentId, replyId);
            onReplyDeleted?.(commentId, replyId);
        } catch {
            // handle error
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">forum</span>
                Bình luận ({comments.length})
            </h3>

            {/* New comment input */}
            {currentUserId && (
                <div className="flex gap-3 mb-8">
                    <Avatar name="Bạn" size="w-10 h-10" />
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Viết bình luận của bạn..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-none"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || submitting}
                                className="px-5 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {submitting && (
                                    <span className="material-symbols-outlined animate-spin text-sm">
                                        progress_activity
                                    </span>
                                )}
                                Gửi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comment list */}
            <div className="space-y-6">
                <AnimatePresence>
                    {comments.map((comment) => (
                        <motion.div
                            key={comment._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50"
                        >
                            {/* Comment */}
                            <div className="flex gap-3">
                                <Avatar
                                    name={comment.author.name}
                                    avatar={comment.author.avatar}
                                    id={comment.author.id}
                                    role={comment.author.role}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/profile/${comment.author.id}`}
                                                className="font-bold text-slate-900 dark:text-white text-sm hover:text-primary transition-colors"
                                            >
                                                {comment.author.name}
                                            </Link>
                                            <span className="text-xs text-slate-400">
                                                {formatTimeAgo(comment.createdAt)}
                                            </span>
                                        </div>
                                        {currentUserId === comment.author.id && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditingCommentId(comment._id); setEditCommentContent(comment.content); }} className="text-xs text-slate-500 hover:text-primary transition-colors">Sửa</button>
                                                <button onClick={() => handleDeleteComment(comment._id)} className="text-xs text-slate-500 hover:text-red-500 transition-colors">Xóa</button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === comment._id ? (
                                        <div className="mt-2 mb-2">
                                            <textarea
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 min-h-[60px] resize-none"
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Hủy</button>
                                                <button onClick={() => handleUpdateComment(comment._id)} disabled={!editCommentContent.trim()} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">Lưu</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                            {comment.content}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-2">
                                        <button className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1 font-medium">
                                            <span className="material-symbols-outlined text-sm">
                                                favorite
                                            </span>
                                            {comment.likes.length || ""}
                                        </button>
                                        {currentUserId && (
                                            <button
                                                onClick={() =>
                                                    setReplyingTo(
                                                        replyingTo === comment._id ? null : comment._id
                                                    )
                                                }
                                                className="text-xs text-slate-500 hover:text-primary transition-colors flex items-center gap-1 font-medium"
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    reply
                                                </span>
                                                Trả lời
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reply input */}
                            <AnimatePresence>
                                {replyingTo === comment._id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="ml-13 mt-3 overflow-hidden"
                                    >
                                        <div className="flex gap-2 pl-12">
                                            <input
                                                type="text"
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleSubmitReply(comment._id);
                                                }}
                                                placeholder="Viết phản hồi..."
                                                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                                            />
                                            <button
                                                onClick={() => handleSubmitReply(comment._id)}
                                                disabled={!replyContent.trim() || replySubmitting}
                                                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
                                            >
                                                Gửi
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-12 mt-4 space-y-3 pl-4 border-l-2 border-slate-100 dark:border-slate-700">
                                    {comment.replies.map((reply, replyIdx) => (
                                        <div key={reply._id || `reply-${replyIdx}`} className="flex gap-2">
                                            <Avatar
                                                name={reply.author.name}
                                                avatar={reply.author.avatar}
                                                size="w-7 h-7"
                                                id={reply.author.id}
                                                role={reply.author.role}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/profile/${reply.author.id}`}
                                                            className="font-bold text-slate-900 dark:text-white text-xs hover:text-primary transition-colors"
                                                        >
                                                            {reply.author.name}
                                                        </Link>
                                                        <span className="text-xs text-slate-400">
                                                            {formatTimeAgo(reply.createdAt)}
                                                        </span>
                                                    </div>
                                                    {currentUserId === reply.author.id && (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => { setEditingReplyId({ commentId: comment._id, replyId: reply._id! }); setEditReplyContent(reply.content); }} className="text-[11px] text-slate-500 hover:text-primary transition-colors">Sửa</button>
                                                            <button onClick={() => handleDeleteReply(comment._id, reply._id!)} className="text-[11px] text-slate-500 hover:text-red-500 transition-colors">Xóa</button>
                                                        </div>
                                                    )}
                                                </div>
                                                {editingReplyId?.commentId === comment._id && editingReplyId?.replyId === reply._id ? (
                                                    <div className="mt-1 mb-1">
                                                        <textarea
                                                            value={editReplyContent}
                                                            onChange={(e) => setEditReplyContent(e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30 min-h-[50px] resize-none"
                                                        />
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <button onClick={() => setEditingReplyId(null)} className="px-3 py-1 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Hủy</button>
                                                            <button onClick={() => handleUpdateReply(comment._id, reply._id!)} disabled={!editReplyContent.trim()} className="px-3 py-1 rounded-md text-[11px] font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">Lưu</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                                                        {reply.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {comments.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 block">
                            chat_bubble_outline
                        </span>
                        <p className="font-medium">Chưa có bình luận nào</p>
                        <p className="text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
