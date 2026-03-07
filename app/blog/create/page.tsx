"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BlogForm } from "@/components/blog/BlogForm";
import Link from "next/link";

export default function CreateBlogPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-background-dark transition-colors duration-300">
            <div className="max-w-[780px] mx-auto px-4 py-6">
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

                {/* Editor card */}
                <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-6 md:p-8">
                    <BlogForm
                        onSuccess={() => {
                            router.push("/blog");
                        }}
                    />
                </div>

                {/* Info note */}
                <div className="mt-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-500 mt-0.5 text-xl">
                        info
                    </span>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                            Lưu ý khi đăng bài
                        </p>
                        <ul className="space-y-1">
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-xs text-primary mt-1">
                                    check_circle
                                </span>
                                Bài viết sẽ được gửi đến admin để phê duyệt trước khi hiển thị
                                công khai.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-xs text-primary mt-1">
                                    check_circle
                                </span>
                                Vui lòng đảm bảo nội dung phù hợp với cộng đồng.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-xs text-primary mt-1">
                                    check_circle
                                </span>
                                Hình ảnh tải lên sẽ được lưu trữ tự động trên Cloudinary.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
