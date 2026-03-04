import React from "react";
import { JOBS } from "@/data/mockData";
import { JobCard } from "@/components/jobs/JobCard";

export const JobSection = () => {
    return (
        <section className="py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-20">
                    <div>
                        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Cơ hội việc làm nổi bật</h2>
                        <p className="text-slate-500 font-medium">Được sắp xếp theo mức độ phù hợp với hồ sơ của bạn</p>
                    </div>
                    <button className="hidden md:block bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        Xem tất cả 1,240 đầu việc
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {JOBS.map((job, idx) => (
                        <JobCard key={job.id} job={job} index={idx} variant="compact" />
                    ))}
                </div>
            </div>
        </section>
    );
};
