"use client";

import React from "react";
import { FEATURES } from "@/data/mockData";
import { motion } from "framer-motion";
import { ShieldCheck, WalletCards, HardHat } from "lucide-react";

const useInViewOnce = <T extends HTMLElement>(): [React.RefObject<T>, boolean] => {
    const ref = React.useRef<T | null>(null);
    const [inView, setInView] = React.useState(false);

    React.useEffect(() => {
        if (!ref.current || inView) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.35 }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [inView]);

    return [ref, inView];
};

interface AnimatedCounterProps {
    value: number;
    durationMs?: number;
    decimals?: number;
    suffix?: string;
    className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    durationMs = 1500,
    decimals = 0,
    suffix,
    className,
}) => {
    const [ref, inView] = useInViewOnce<HTMLDivElement>();
    const [displayValue, setDisplayValue] = React.useState(0);

    React.useEffect(() => {
        if (!inView) return;

        let start: number | null = null;
        const startValue = 0;
        const diff = value - startValue;

        const step = (timestamp: number) => {
            if (start === null) start = timestamp;
            const progress = Math.min((timestamp - start) / durationMs, 1);
            const current = startValue + diff * progress;
            setDisplayValue(current);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        const frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
    }, [inView, value, durationMs]);

    const formatted =
        decimals > 0
            ? displayValue.toFixed(decimals)
            : new Intl.NumberFormat("vi-VN").format(Math.round(displayValue));

    return (
        <div
            ref={ref}
            className={className}
        >
            {formatted}
            {suffix}
        </div>
    );
};

export const Features = () => {
    return (
        <section className="pt-28 pb-32 bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                {/* SECTION HEADER */}
                <div className="text-center mb-14">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--primary)] mb-3"
                    >
                        TẠI SAO CHỌN BUILDFORCE
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[32px] md:text-[36px] font-display font-bold mb-4"
                    >
                        Minh bạch & đáng tin cậy cho cả thợ và HR
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto text-[15px] leading-relaxed text-[var(--text-secondary)]"
                    >
                        Số liệu thời gian thực về công trình, tỉ lệ hoàn thành và đánh giá giúp cả người lao động lẫn nhà thầu
                        ra quyết định nhanh hơn, tự tin hơn.
                    </motion.p>
                </div>

                {/* STATS ROW */}
                <div className="rounded-3xl bg-[color:rgba(15,23,42,0.02)] dark:bg-slate-900/40 border border-[var(--border)]/70 px-4 sm:px-8 py-8 sm:py-10 mb-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { labelTop: "Công", labelBottom: "trình đang tuyển", value: 1240, suffix: "+" },
                            { labelTop: "Tỷ lệ", labelBottom: "hoàn thành đúng hạn", value: 98, suffix: "%" },
                            { labelTop: "Đánh giá", labelBottom: "trung bình", value: 4.8, suffix: " ★", decimals: 1 },
                            { labelTop: "Tỉnh", labelBottom: "thành trên toàn quốc", value: 63 },
                        ].map((stat, idx) => (
                            <StatItem
                                key={idx}
                                index={idx}
                                {...stat}
                            />
                        ))}
                    </div>
                </div>

                {/* TRUST PILLARS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {FEATURES.map((feature, idx) => {
                        const IconComponent = idx === 0 ? ShieldCheck : idx === 1 ? WalletCards : HardHat;
                        const iconColor =
                            idx === 0
                                ? "text-[var(--primary)]"
                                : idx === 1
                                ? "text-[var(--success)]"
                                : "text-[var(--amber)]";

                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                                className="flex items-start gap-4 md:gap-5"
                            >
                                <div
                                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm ${idx === 0 ? "ring-2 ring-sky-100 dark:ring-sky-900/40" : idx === 1 ? "ring-2 ring-emerald-100 dark:ring-emerald-900/40" : "ring-2 ring-amber-100 dark:ring-amber-900/40"
                                        }`}
                                >
                                    <IconComponent className={`w-6 h-6 ${iconColor}`} />
                                </div>
                                <div>
                                    <h3 className="text-[16px] font-semibold mb-1.5">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[13px] font-semibold text-[var(--text-secondary)] mb-1.5 line-clamp-2">
                                        {feature.highlight}
                                    </p>
                                    <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

interface StatItemProps {
    labelTop: string;
    labelBottom: string;
    value: number;
    suffix?: string;
    decimals?: number;
    index: number;
}

const StatItem: React.FC<StatItemProps> = ({ labelTop, labelBottom, value, suffix, decimals = 0, index }) => {
    const [ref, inView] = useInViewOnce<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={`relative flex flex-col items-start md:items-center gap-1.5 md:gap-2 border-slate-200 dark:border-slate-700 ${
                index > 0 ? "md:border-l md:pl-6" : ""
            }`}
            style={{ transition: "opacity 0.5s ease, transform 0.5s ease", transitionDelay: `${index * 80}ms` }}
        >
            <AnimatedCounter
                value={value}
                decimals={decimals}
                suffix={suffix}
                className={`text-[32px] sm:text-[40px] md:text-[48px] font-extrabold leading-none text-sky-500`}
            />
            <p className="text-[13px] text-[var(--text-secondary)] leading-snug">
                {labelTop}
                <br />
                {labelBottom}
            </p>
        </div>
    );
};
