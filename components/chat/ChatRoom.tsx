"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "@/utils/api";
import { getSocket, connectSocket } from "@/utils/socket";
import { MessageBubble } from "./MessageBubble";

interface Participant {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    companyName?: string;
}

interface MessageData {
    _id: string;
    content: string;
    sender: { _id: string; firstName: string; lastName: string; avatar?: string };
    type: string;
    createdAt: string;
}

interface ChatRoomProps {
    conversationId: string;
    participant: Participant;
    currentUserId: string;
    onBack: () => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ conversationId, participant, currentUserId, onBack }) => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const res = await api.get(`/api/chat/${conversationId}/messages`);
                if (res.data.success) setMessages(res.data.data.messages);
            } catch (err) {
                console.error("Failed to load messages", err);
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
        api.put(`/api/chat/${conversationId}/read`).catch(() => { });

        let socket: any;
        try {
            socket = connectSocket();
        } catch (err) {
            console.error("Socket error", err);
            socket = getSocket();
        }

        if (socket) {
            socket.emit("join_conversation", conversationId);

            const handleNewMessage = (msg: MessageData) => {
                setMessages((prev) => {
                    if (prev.some((m) => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                if (msg.sender._id !== currentUserId) {
                    api.put(`/api/chat/${conversationId}/read`).catch(() => { });
                }
            };

            const handleTyping = (data: { userId: string }) => {
                if (data.userId !== currentUserId) setIsTyping(true);
            };

            const handleStopTyping = (data: { userId: string }) => {
                if (data.userId !== currentUserId) setIsTyping(false);
            };

            socket.on("new_message", handleNewMessage);
            socket.on("user_typing", handleTyping);
            socket.on("user_stop_typing", handleStopTyping);

            return () => {
                socket.emit("leave_conversation", conversationId);
                socket.off("new_message", handleNewMessage);
                socket.off("user_typing", handleTyping);
                socket.off("user_stop_typing", handleStopTyping);
                setIsTyping(false);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            };
        }
    }, [conversationId, currentUserId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        const socket = getSocket();
        if (socket) {
            socket.emit("typing", { conversationId });
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { conversationId });
            }, 2000);
        }
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text) return;

        setInput("");
        const socket = getSocket();
        if (socket) socket.emit("stop_typing", { conversationId });

        try {
            const res = await api.post(`/api/chat/${conversationId}`, { content: text });
            if (res.data.success) {
                const newMsg = res.data.data;
                setMessages((prev) => {
                    if (prev.some((m) => m._id === newMsg._id)) return prev;
                    return [...prev, newMsg];
                });
            }
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const displayName = `${participant.firstName} ${participant.lastName}`;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <button onClick={onBack} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                </button>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary overflow-hidden">
                    {participant.avatar ? (
                        <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                        displayName.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{displayName}</p>
                    {isTyping ? (
                        <p className="text-[10px] text-primary animate-pulse">Đang nhập...</p>
                    ) : participant.role === "hr" && participant.companyName ? (
                        <p className="text-[10px] text-slate-400 truncate">{participant.companyName}</p>
                    ) : null}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">waving_hand</span>
                        <p className="text-xs text-slate-400">Hãy bắt đầu cuộc trò chuyện!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg._id}
                            content={msg.content}
                            isMine={msg.sender._id === currentUserId}
                            senderName={`${msg.sender.firstName} ${msg.sender.lastName}`}
                            senderAvatar={msg.sender.avatar}
                            timestamp={msg.createdAt}
                        />
                    ))
                )}
                {isTyping && (
                    <div className="flex gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            {displayName.charAt(0).toUpperCase()}
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
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-800 dark:text-white placeholder-slate-400 max-h-20"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="p-1.5 bg-primary text-white rounded-xl hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
