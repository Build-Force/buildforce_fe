"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Editor } from "@tinymce/tinymce-react";
import { blogApi } from "@/services/blogApi";

interface BlogFormProps {
    onSuccess?: () => void;
    initialData?: {
        _id?: string;
        title?: string;
        content?: string;
        tags?: string[];
        media?: {
            featuredImage: string;
            images?: string[];
            videos?: string[];
        };
    };
}

export const BlogForm: React.FC<BlogFormProps> = ({
    onSuccess,
    initialData,
}) => {
    const isEdit = !!initialData?._id;
    const [title, setTitle] = useState(initialData?.title || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [featuredImage, setFeaturedImage] = useState(
        initialData?.media?.featuredImage || ""
    );
    const [images, setImages] = useState<string[]>(
        initialData?.media?.images || []
    );
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const featuredInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<any>(null);

    const handleImageUpload = async (
        file: File,
        type: "featured" | "content"
    ) => {
        setUploading(true);
        try {
            const res = await blogApi.uploadImage(file);
            const url = res.data.data.url;
            if (type === "featured") {
                setFeaturedImage(url);
            } else {
                setImages((prev) => [...prev, url]);
            }
            return url;
        } catch (err: any) {
            setError(
                "Upload ảnh thất bại: " +
                (err?.response?.data?.message || err.message)
            );
            return "";
        } finally {
            setUploading(false);
        }
    };

    const handleFeaturedDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageUpload(file, "featured");
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 10) {
            setTags((prev) => [...prev, tag]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags((prev) => prev.filter((t) => t !== tagToRemove));
    };

    const handleSubmit = async () => {
        if (!title.trim()) return setError("Vui lòng nhập tiêu đề");

        const editorContent =
            editorRef.current?.getContent?.() || content;
        if (!editorContent.trim())
            return setError("Vui lòng nhập nội dung");
        if (!featuredImage)
            return setError("Vui lòng chọn ảnh đại diện");

        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await blogApi.updateBlog(initialData!._id!, {
                    title,
                    content: editorContent,
                    tags,
                    media: { featuredImage, images },
                } as any);
            } else {
                await blogApi.createBlog({
                    title,
                    content: editorContent,
                    tags,
                    media: { featuredImage, images },
                });
            }
            onSuccess?.();
        } catch (err: any) {
            setError(
                err?.response?.data?.message || "Có lỗi xảy ra khi đăng bài"
            );
        } finally {
            setLoading(false);
        }
    };

    // TinyMCE image upload handler — uploads to Cloudinary via our API
    const tinymceImageUploadHandler = (
        blobInfo: any,
        progress: (percent: number) => void
    ): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            try {
                progress(30);
                const file = blobInfo.blob();
                const res = await blogApi.uploadImage(file);
                const url = res.data.data.url;
                setImages((prev) => [...prev, url]);
                progress(100);
                resolve(url);
            } catch (err: any) {
                reject(
                    err?.response?.data?.message || "Upload thất bại"
                );
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">
                            {showPreview ? "edit" : "preview"}
                        </span>
                        {showPreview ? "Chỉnh sửa" : "Xem trước"}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
                    >
                        {loading && (
                            <span className="material-symbols-outlined animate-spin text-lg">
                                progress_activity
                            </span>
                        )}
                        {isEdit ? "Cập nhật" : "Đăng bài"}
                    </button>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">error</span>
                    {error}
                </motion.div>
            )}

            {showPreview ? (
                /* Preview Mode */
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
                >
                    {featuredImage && (
                        <div className="aspect-[21/9] rounded-xl overflow-hidden mb-8">
                            <img
                                src={featuredImage}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                        {title || "Tiêu đề bài viết"}
                    </h1>
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                            __html:
                                editorRef.current?.getContent?.() ||
                                content ||
                                "<p>Nội dung bài viết...</p>",
                        }}
                    />
                </motion.div>
            ) : (
                /* Edit Mode */
                <div className="space-y-6">
                    {/* Featured Image */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFeaturedDrop}
                        className="relative group"
                    >
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                            Ảnh đại diện <span className="text-red-500">*</span>
                        </label>
                        {featuredImage ? (
                            <div className="relative aspect-[21/9] rounded-xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-600">
                                <img
                                    src={featuredImage}
                                    alt="Featured"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => featuredInputRef.current?.click()}
                                        className="px-4 py-2 bg-white rounded-lg text-slate-900 font-bold hover:bg-slate-100 transition-colors"
                                    >
                                        Đổi ảnh
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => featuredInputRef.current?.click()}
                                className="aspect-[21/9] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                {uploading ? (
                                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                                        progress_activity
                                    </span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
                                            add_photo_alternate
                                        </span>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                                            Kéo thả hoặc click để chọn ảnh đại diện
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                        <input
                            ref={featuredInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, "featured");
                            }}
                        />
                    </div>

                    {/* Title */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề bài viết..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-lg font-semibold"
                        />
                    </div>

                    {/* TinyMCE Content Editor */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                            Nội dung <span className="text-red-500">*</span>
                        </label>
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                            <Editor
                                tinymceScriptSrc={
                                    process.env.NEXT_PUBLIC_TINYMCE_API_KEY
                                        ? undefined
                                        : "https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
                                }
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || undefined}
                                licenseKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY ? undefined : "gpl"}
                                onInit={(_evt, editor) => {
                                    editorRef.current = editor;
                                }}
                                initialValue={content}
                                init={{
                                    ...(process.env.NEXT_PUBLIC_TINYMCE_API_KEY
                                        ? {}
                                        : {
                                            base_url: "https://cdn.jsdelivr.net/npm/tinymce@6/",
                                            suffix: ".min",
                                          }),
                                    height: 500,
                                    menubar: true,
                                    plugins: [
                                        "advlist",
                                        "autolink",
                                        "lists",
                                        "link",
                                        "image",
                                        "charmap",
                                        "preview",
                                        "anchor",
                                        "searchreplace",
                                        "visualblocks",
                                        "code",
                                        "fullscreen",
                                        "insertdatetime",
                                        "media",
                                        "table",
                                        "help",
                                        "wordcount",
                                        "emoticons",
                                        "codesample",
                                    ],
                                    toolbar:
                                        "undo redo | blocks fontfamily fontsize | " +
                                        "bold italic underline strikethrough | forecolor backcolor | " +
                                        "alignleft aligncenter alignright alignjustify | " +
                                        "bullist numlist outdent indent | " +
                                        "link image media codesample emoticons | " +
                                        "table | removeformat fullscreen | help",
                                    content_style: `
                    body {
                      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                      font-size: 16px;
                      line-height: 1.7;
                      color: #334155;
                      padding: 16px;
                    }
                    img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
                    a { color: #0EA5E9; }
                    table { border-collapse: collapse; width: 100%; }
                    table td, table th { border: 1px solid #e2e8f0; padding: 8px 12px; }
                    blockquote { border-left: 4px solid #0EA5E9; padding-left: 16px; margin-left: 0; color: #64748b; }
                    pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
                    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
                  `,
                                    images_upload_handler: tinymceImageUploadHandler,
                                    automatic_uploads: true,
                                    file_picker_types: "image",
                                    image_advtab: true,
                                    image_caption: true,
                                    paste_data_images: true,
                                    branding: false,
                                    promotion: false,
                                    skin: "oxide",
                                    resize: true,
                                    placeholder: "Bắt đầu viết nội dung bài viết...",
                                    language: "vi",
                                }}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                            Tags
                        </label>
                        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold"
                                >
                                    #{tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            close
                                        </span>
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === ",") {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder={
                                    tags.length < 10 ? "Thêm tag..." : "Tối đa 10 tags"
                                }
                                disabled={tags.length >= 10}
                                className="flex-1 min-w-[120px] bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Nhấn Enter hoặc dấu phẩy để thêm tag
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
