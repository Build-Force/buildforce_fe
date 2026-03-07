"use client";

import React, { useState, useRef, useEffect } from "react";
import api from "@/utils/api";
import { MessageBubble } from "./MessageBubble";

interface AIChatMessage {
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface AIChatSession {
    _id: string;
    title: string;
    lastMessage: string;
    messageCount: number;
    updatedAt: string;
}

export const AIChat: React.FC = () => {
    const [messages, setMessages] = useState<AIChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<AIChatSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadHistory = async () => {
        try {
            const res = await api.get("/api/ai/chat/history");
            if (res.data.success) setSessions(res.data.data);
        } catch (err) {
            console.error("Failed to load AI history", err);
        }
    };

    const loadSession = async (id: string) => {
        try {
            const res = await api.get(`/api/ai/chat/${id}`);
            if (res.data.success) {
                setChatId(id);
                setMessages(res.data.data.messages);
                setShowHistory(false);
            }
        } catch (err) {
            console.error("Failed to load session", err);
        }
    };

    const deleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.delete(`/api/ai/chat/${id}`);
            setSessions((prev) => prev.filter((s) => s._id !== id));
            if (chatId === id) startNewChat();
        } catch (err) {
            console.error("Failed to delete session", err);
        }
    };

    const startNewChat = () => {
        setChatId(null);
        setMessages([]);
        setShowHistory(false);
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg: AIChatMessage = { role: "user", content: text, createdAt: new Date().toISOString() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await api.post("/api/ai/chat", { message: text, chatId });
            if (res.data.success) {
                setChatId(res.data.data.chatId);
                const aiMsg: AIChatMessage = {
                    role: "assistant",
                    content: res.data.data.response,
                    createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, aiMsg]);
            }
        } catch (err: any) {
            const isRateLimit = err?.response?.status === 429;
            const errorMsg = isRateLimit
                ? "AI đang quá tải, vui lòng thử lại sau ít phút."
                : "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: errorMsg, createdAt: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (showHistory) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => setShowHistory(false)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                    </button>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Lịch sử trò chuyện</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-4xl mb-2">history</span>
                            <p>Chưa có lịch sử</p>
                        </div>
                    ) : (
                        sessions.map((s) => (
                            <div
                                key={s._id}
                                onClick={() => loadSession(s._id)}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-50 dark:border-slate-700/50"
                            >
                                <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{s.title}</p>
                                    <p className="text-xs text-slate-400 truncate">{s.lastMessage}</p>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(s._id, e)}
                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">AI Assistant</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { loadHistory(); setShowHistory(true); }}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Lịch sử"
                    >
                        <span className="material-symbols-outlined text-base text-slate-500">history</span>
                    </button>
                    <button
                        onClick={startNewChat}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Cuộc trò chuyện mới"
                    >
                        <span className="material-symbols-outlined text-base text-slate-500">add_comment</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                            <span className="material-symbols-outlined text-primary text-3xl">construction</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">BuildForce AI</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Hỏi tôi bất kỳ điều gì về việc làm xây dựng, kỹ năng, mức lương, hoặc cách sử dụng nền tảng!
                        </p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            content={msg.content}
                            isMine={msg.role === "user"}
                            senderName={msg.role === "assistant" ? "AI" : undefined}
                            timestamp={msg.createdAt}
                            showAvatar={msg.role === "assistant"}
                        />
                    ))
                )}
                {loading && (
                    <div className="flex gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-3 py-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-3 pb-3 pt-1">
                <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-700/50 rounded-2xl px-3 py-2 border border-slate-200 dark:border-slate-600 focus-within:border-primary transition-colors">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập câu hỏi..."
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-800 dark:text-white placeholder-slate-400 max-h-20"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="p-1.5 bg-primary text-white rounded-xl hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
