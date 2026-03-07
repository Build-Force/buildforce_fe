"use client";

import React from "react";

interface MessageBubbleProps {
    content: string;
    isMine: boolean;
    senderName?: string;
    senderAvatar?: string;
    timestamp?: string;
    showAvatar?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    content,
    isMine,
    senderName,
    senderAvatar,
    timestamp,
    showAvatar = true,
}) => {
    const formatTime = (ts?: string) => {
        if (!ts) return "";
        const d = new Date(ts);
        return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className={`flex gap-2 mb-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
            {showAvatar && !isMine && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-auto overflow-hidden">
                    {senderAvatar ? (
                        <img src={senderAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                        senderName?.charAt(0)?.toUpperCase() || "?"
                    )}
                </div>
            )}
            <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                {!isMine && senderName && (
                    <p className="text-[10px] text-slate-400 mb-0.5 px-1">{senderName}</p>
                )}
                <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isMine
                            ? "bg-primary text-white rounded-br-md"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-md"
                    }`}
                >
                    {content}
                </div>
                {timestamp && (
                    <p className={`text-[10px] text-slate-400 mt-0.5 px-1 ${isMine ? "text-right" : "text-left"}`}>
                        {formatTime(timestamp)}
                    </p>
                )}
            </div>
        </div>
    );
};
