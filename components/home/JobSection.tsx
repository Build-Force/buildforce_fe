"use client";

import React from "react";
import { JOBS } from "@/data/mockData";
import { motion } from "framer-motion";

export const JobSection = () => {
    return (
        <section className="py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-20">
                    <div>
                        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Trending Opportunities</h2>
                        <p className="text-slate-500 font-medium">Sorted by relevance based on your profile</p>
                    </div>
                    <button className="hidden md:block bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        View All 1,240 Openings
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {JOBS.map((job, idx) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] flex flex-col lg:flex-row gap-10 border-2 border-slate-100 dark:border-slate-800 hover:border-primary transition-all shadow-xl shadow-slate-200/50 dark:shadow-none group"
                        >
                            <div className="w-full lg:w-48 h-48 rounded-[2rem] bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 shadow-inner">
                                <img
                                    alt={job.title}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                    src={job.image}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{job.title}</h4>
                                        <p className="text-xl text-slate-500 font-bold mb-4">{job.company}</p>
                                    </div>
                                    {job.urgent && (
                                        <div className="flex items-center gap-2 px-6 py-2 bg-blue-50 dark:bg-blue-900/30 text-primary font-black rounded-full text-sm uppercase tracking-widest">
                                            <span className="material-symbols-outlined text-sm">bolt</span> Urgent
                                        </div>
                                    )}
                                    {!job.urgent && (
                                        <div className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-full text-sm uppercase tracking-widest">
                                            {job.postedAt}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-xl font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                            <span className="material-symbols-outlined text-slate-400 text-2xl">location_on</span>
                                            {job.location}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Compensation</p>
                                        <p className="text-3xl font-black text-secondary">{job.compensation}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Contractor Trust</p>
                                        <div className="flex flex-col gap-1">
                                            {job.verified && (
                                                <span className="flex items-center gap-1 text-secondary font-black text-xs uppercase tracking-tighter">
                                                    <span className="material-symbols-outlined text-base">verified</span> Verified Contractor
                                                </span>
                                            )}
                                            {job.onTimePayment && (
                                                <span className="flex items-center gap-1 text-primary font-black text-xs uppercase tracking-tighter">
                                                    <span className="material-symbols-outlined text-base">history</span> On-time Payment History
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-4">
                                            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-300"></div>
                                            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-400"></div>
                                            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-500 flex items-center justify-center font-bold text-white text-sm">
                                                +{job.applicants}
                                            </div>
                                        </div>
                                        <span className="text-slate-500 font-bold">People already applied</span>
                                    </div>
                                    <button className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-95">
                                        Details & Apply
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
