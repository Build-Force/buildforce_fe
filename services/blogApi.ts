import api from "@/utils/api";

export interface BlogAuthor {
    id: string;
    name: string;
    avatar?: string;
    role: string;
}

export interface BlogMedia {
    featuredImage: string;
    images?: string[];
    videos?: string[];
}

export interface BlogInteract {
    views: number;
    likes: string[];
    likesCount: number;
    commentsCount: number;
}

export interface CommentReply {
    _id: string;
    content: string;
    author: BlogAuthor;
    createdAt: string;
    likes: string[];
}

export interface BlogComment {
    _id: string;
    content: string;
    author: BlogAuthor;
    createdAt: string;
    likes: string[];
    replies: CommentReply[];
}

export interface Blog {
    _id: string;
    slug: string;
    title: string;
    content: string;
    author: BlogAuthor;
    media: BlogMedia;
    tags: string[];
    status: "draft" | "pending" | "approved" | "rejected" | "archived";
    interact: BlogInteract;
    commentsList: BlogComment[];
    publishedAt?: string;
    adminReview?: {
        reviewedBy?: string;
        reason?: string;
        at?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface BlogPagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface GetBlogsParams {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    sort?: "latest" | "popular" | "likes";
    authorId?: string;
    status?: string;
}

export const blogApi = {
    // Public
    getBlogs: (params?: GetBlogsParams) =>
        api.get<{ success: boolean; data: Blog[]; pagination: BlogPagination }>(
            "/api/blogs",
            { params }
        ),

    getBlogBySlug: (slug: string) =>
        api.get<{ success: boolean; data: Blog }>(`/api/blogs/${slug}`),

    // Auth required
    createBlog: (data: {
        title: string;
        content: string;
        media: BlogMedia;
        tags: string[];
    }) => api.post<{ success: boolean; data: Blog }>("/api/blogs", data),

    updateBlog: (id: string, data: Partial<Blog>) =>
        api.patch<{ success: boolean; data: Blog }>(`/api/blogs/${id}`, data),

    deleteBlog: (id: string) =>
        api.delete<{ success: boolean; message: string }>(`/api/blogs/${id}`),

    likeBlog: (id: string) =>
        api.post<{ success: boolean; likesCount: number; isLiked: boolean }>(
            `/api/blogs/${id}/like`
        ),

    commentBlog: (id: string, content: string) =>
        api.post<{ success: boolean; data: BlogComment }>(
            `/api/blogs/${id}/comment`,
            { content }
        ),

    updateComment: (id: string, commentId: string, content: string) =>
        api.patch<{ success: boolean; data: BlogComment }>(
            `/api/blogs/${id}/comment/${commentId}`,
            { content }
        ),

    deleteComment: (id: string, commentId: string) =>
        api.delete<{ success: boolean; message: string }>(
            `/api/blogs/${id}/comment/${commentId}`
        ),

    replyComment: (blogId: string, commentId: string, content: string) =>
        api.post<{ success: boolean; data: CommentReply }>(
            `/api/blogs/${blogId}/comment/${commentId}/reply`,
            { content }
        ),

    updateReply: (blogId: string, commentId: string, replyId: string, content: string) =>
        api.patch<{ success: boolean; data: CommentReply }>(
            `/api/blogs/${blogId}/comment/${commentId}/reply/${replyId}`,
            { content }
        ),

    deleteReply: (blogId: string, commentId: string, replyId: string) =>
        api.delete<{ success: boolean; message: string }>(
            `/api/blogs/${blogId}/comment/${commentId}/reply/${replyId}`
        ),

    // Media upload
    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append("image", file);
        return api.post<{ success: boolean; data: { url: string } }>(
            "/api/blogs/upload/image",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
    },

    uploadVideo: (file: File) => {
        const formData = new FormData();
        formData.append("video", file);
        return api.post<{ success: boolean; data: { url: string } }>(
            "/api/blogs/upload/video",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
    },

    // Admin
    approveBlog: (id: string) =>
        api.patch<{ success: boolean; data: Blog }>(`/api/blogs/${id}/approve`),

    rejectBlog: (id: string, reason: string) =>
        api.patch<{ success: boolean; data: Blog }>(`/api/blogs/${id}/reject`, {
            reason,
        }),
};
