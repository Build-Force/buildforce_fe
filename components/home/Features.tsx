"use client";

import React from "react";
import { FEATURES } from "@/data/mockData";
import { motion } from "framer-motion";

export const Features = () => {
    return (
        <section className="py-32 px-6 bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-secondary font-bold uppercase tracking-[0.2em] text-base block mb-4"
                    >
                        Transparency First
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6"
                    >
                        HR Metrics You Can Trust
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-slate-600 dark:text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed"
                    >
                        We monitor reliability, payment punctuality, and skill proficiency for every member of our network.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {FEATURES.map((feature, idx) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-50 dark:bg-slate-800 p-12 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`w-16 h-16 ${feature.bgClass} rounded-2xl flex items-center justify-center mb-8`}>
                                <span className={`material-symbols-outlined ${feature.iconClass} text-4xl`}>{feature.icon}</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                            <p className={`text-xl font-bold ${feature.iconClass} mb-6`}>{feature.highlight}</p>
                            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                                {feature.description}
                            </p>

                            {feature.footer.type === "rating" && (
                                <div className="flex items-center gap-3 bg-white dark:bg-slate-700/50 p-4 rounded-xl inline-flex shadow-sm">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4].map(i => (
                                            <span key={i} className="material-symbols-outlined fill-current">star</span>
                                        ))}
                                        <span className="material-symbols-outlined">star_half</span>
                                    </div>
                                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{feature.footer.value}</span>
                                </div>
                            )}

                            {feature.footer.type === "progress" && (
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-4 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${feature.footer.value}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="bg-secondary h-full"
                                    />
                                </div>
                            )}

                            {feature.footer.type === "tags" && Array.isArray(feature.footer.value) && (
                                <div className="flex flex-wrap gap-3">
                                    {feature.footer.value.map(tag => (
                                        <span key={tag} className="px-5 py-2 bg-white dark:bg-slate-700 rounded-lg text-sm font-black text-slate-700 dark:text-slate-200 shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <a className="inline-flex items-center gap-3 text-primary font-bold text-xl hover:underline underline-offset-8 group" href="#">
                        How we verify
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">arrow_outward</span>
                    </a>
                </div>
            </div>
        </section>
    );
};
