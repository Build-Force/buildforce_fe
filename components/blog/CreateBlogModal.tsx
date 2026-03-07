"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogForm } from "@/components/blog/BlogForm";

interface CreateBlogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: any;
}

export const CreateBlogModal: React.FC<CreateBlogModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    initialData,
}) => {
    const handleSuccess = () => {
        onSuccess?.();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25 }}
                        className="relative w-full max-w-[780px] my-6 mx-4"
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/50 overflow-hidden">
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700/50">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {initialData ? "Sửa bài viết" : "Tạo bài viết"}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        close
                                    </span>
                                </button>
                            </div>

                            {/* Modal body - scrollable */}
                            <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-6">
                                <BlogForm onSuccess={handleSuccess} initialData={initialData} />

                                {/* Info note */}
                                <div className="mt-6 flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                                    <span className="material-symbols-outlined text-amber-500 text-lg mt-0.5">
                                        info
                                    </span>
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        Bài viết sẽ được gửi đến admin để phê duyệt trước khi hiển
                                        thị công khai.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
