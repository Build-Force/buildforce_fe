"use client";

import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import { getSocket, connectSocket } from "@/utils/socket";

interface Participant {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    companyName?: string;
}

interface ConversationItem {
    _id: string;
    participant: Participant;
    lastMessage?: {
        content: string;
        sender: string;
        createdAt: string;
    };
    unreadCount: number;
    updatedAt: string;
}

interface ConversationListProps {
    onSelectConversation: (conversationId: string, participant: Participant) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadConversations = async () => {
        try {
            const res = await api.get("/api/chat");
            if (res.data.success) setConversations(res.data.data);
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConversations();

        let socket: any;
        try {
            socket = connectSocket();
        } catch (err) {
            console.error("Socket error", err);
            socket = getSocket();
        }

        if (socket) {
            const handleUpdate = (data: { conversationId: string; lastMessage: any; unreadCount: number }) => {
                setConversations((prev) => {
                    const updated = prev.map((c) =>
                        c._id === data.conversationId
                            ? { ...c, lastMessage: data.lastMessage, unreadCount: data.unreadCount, updatedAt: new Date().toISOString() }
                            : c
                    );
                    return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                });
            };
            socket.on("conversation_updated", handleUpdate);
            return () => { socket.off("conversation_updated", handleUpdate); };
        }
    }, []);

    const formatTime = (ts?: string) => {
        if (!ts) return "";
        const d = new Date(ts);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        }
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">forum</span>
                <p className="text-sm text-slate-400">Chưa có cuộc hội thoại nào</p>
                <p className="text-xs text-slate-400 mt-1">Bắt đầu trò chuyện từ hồ sơ của HR hoặc ứng viên</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
                const p = conv.participant;
                const displayName = p ? `${p.firstName} ${p.lastName}` : "Người dùng";
                return (
                    <div
                        key={conv._id}
                        onClick={() => p && onSelectConversation(conv._id, p)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 transition-colors"
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                                {p?.avatar ? (
                                    <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    displayName.charAt(0).toUpperCase()
                                )}
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-[9px] text-white font-bold">
                                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                                    {displayName}
                                </p>
                                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                                    {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                {p?.role === "hr" && (
                                    <span className="text-[10px] bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                                        HR
                                    </span>
                                )}
                                <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-slate-600 dark:text-slate-300 font-medium" : "text-slate-400"}`}>
                                    {conv.lastMessage?.content || "Chưa có tin nhắn"}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
