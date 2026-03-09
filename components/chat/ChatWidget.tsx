"use client";

import React, { useState, useEffect } from "react";
import { AIChat } from "./AIChat";
import { ConversationList } from "./ConversationList";
import { ChatRoom } from "./ChatRoom";
import { connectSocket, disconnectSocket } from "@/utils/socket";
import api from "@/utils/api";

type Tab = "ai" | "messages";

interface Participant {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    companyName?: string;
}

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("ai");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [activeConversation, setActiveConversation] = useState<{ id: string; participant: Participant } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsLoggedIn(false);
                return;
            }
            try {
                const res = await api.get("/api/auth/profile");
                if (res.data.success) {
                    setIsLoggedIn(true);
                    setCurrentUserId(res.data.data._id);
                }
            } catch {
                setIsLoggedIn(false);
            }
        };

        checkAuth();

        const handleLogin = () => checkAuth();
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "token") checkAuth();
        };

        window.addEventListener("userLoggedIn", handleLogin);
        window.addEventListener("storage", handleStorage);
        return () => {
            window.removeEventListener("userLoggedIn", handleLogin);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    useEffect(() => {
        if (isLoggedIn && isOpen) {
            try {
                connectSocket();
            } catch {
                // token might be missing
            }
        }
    }, [isLoggedIn, isOpen]);

    if (!isLoggedIn) return null;

    const handleSelectConversation = (id: string, participant: Participant) => {
        setActiveConversation({ id, participant });
    };

    const handleBackFromChat = () => {
        setActiveConversation(null);
    };

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-primary text-white rounded-full shadow-xl hover:bg-sky-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                >
                    <span className="material-symbols-outlined text-2xl">chat</span>
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[9999] w-[380px] h-[560px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-primary to-sky-600 text-white">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">construction</span>
                            <span className="font-display font-bold text-sm">BuildForce Chat</span>
                        </div>
                        <button
                            onClick={() => { setIsOpen(false); setActiveConversation(null); }}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Tab bar (hidden when inside a chat room) */}
                    {!activeConversation && (
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab("ai")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative ${activeTab === "ai"
                                        ? "text-primary"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-base">smart_toy</span>
                                AI Assistant
                                {activeTab === "ai" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab("messages")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative ${activeTab === "messages"
                                        ? "text-primary"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-base">forum</span>
                                Tin nhắn
                                {activeTab === "messages" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeConversation ? (
                            <ChatRoom
                                conversationId={activeConversation.id}
                                participant={activeConversation.participant}
                                currentUserId={currentUserId}
                                onBack={handleBackFromChat}
                            />
                        ) : activeTab === "ai" ? (
                            <AIChat />
                        ) : (
                            <ConversationList onSelectConversation={handleSelectConversation} />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
