import React from "react";
import Link from "next/link";
import { JOBS } from "@/data/mockData";
import { SimilarJobCard } from "@/components/jobs/SimilarJobCard";

export function generateStaticParams() {
    return JOBS.map((job) => ({
        id: job.id.toString(),
    }));
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
    const jobId = Number(params.id);
    const job = JOBS.find((j) => j.id === jobId);

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-4xl font-black mb-4">Job Not Found</h1>
                <Link href="/jobs" className="text-primary font-bold hover:underline">
                    Back to all jobs
                </Link>
            </div>
        );
    }

    const similarJobs = JOBS.filter((j) => j.id !== jobId).slice(0, 3);

    return (
        <div className="bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-300 min-h-screen">
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                {/* Breadcrumbs */}
                <header className="mb-10">
                    <nav className="flex mb-6 text-base font-bold text-slate-400">
                        <Link href="/jobs" className="hover:text-primary transition-colors">Job Search</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-600 dark:text-slate-300">{job.title}</span>
                    </nav>

                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-5">
                                {job.verified && (
                                    <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/30 text-secondary text-sm font-black rounded-full border border-green-100 dark:border-green-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">verified</span> Verified Contractor
                                    </span>
                                )}
                                {job.urgent && (
                                    <span className="px-4 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-500 text-sm font-black rounded-full border border-red-100 dark:border-red-800">Urgent</span>
                                )}
                                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-primary text-sm font-black rounded-full border border-blue-100 dark:border-blue-800">{job.type}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{job.title}</h1>
                            <div className="flex items-center gap-5 text-lg text-slate-500 font-bold">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">location_on</span> {job.location}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">calendar_today</span> Posted {job.postedAt}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 text-center lg:min-w-[240px]">
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Hourly Pay Rate</p>
                            <p className="text-4xl md:text-5xl font-black text-secondary">
                                {job.compensation.split('/')[0]}
                                <span className="text-xl text-slate-400">/hr</span>
                            </p>
                            <p className="mt-1 text-slate-500 font-bold text-sm">Weekly Pay Cycle</p>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <article className="flex-1 space-y-10">
                        <section className="prose-custom">
                            <h2 className="text-2xl font-black mb-6 pb-3 border-b-4 border-primary/20 inline-block">Job Description</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                {job.description}
                            </p>

                            {job.responsibilities && (
                                <>
                                    <h3 className="text-2xl font-black mb-6">Key Responsibilities</h3>
                                    <ul className="text-lg text-slate-600 dark:text-slate-400 space-y-4">
                                        {job.responsibilities.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </section>

                        {job.requirements && (
                            <section className="prose-custom">
                                <h2 className="text-3xl font-black mb-8 pb-4 border-b-4 border-secondary/20 inline-block text-secondary">Requirements</h2>
                                <ul className="text-lg text-slate-600 dark:text-slate-400 space-y-4">
                                    {job.requirements.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {job.benefits && (
                            <section className="prose-custom">
                                <h2 className="text-2xl font-black mb-6 pb-3 border-b-4 border-primary/20 inline-block">Benefits</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {job.benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-5 rounded-xl">
                                            <span className="material-symbols-outlined text-primary text-2xl">{benefit.icon}</span>
                                            <span className="font-bold text-base">{benefit.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </article>

                    {/* Sidebar */}
                    <aside className="w-full lg:w-[400px] space-y-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-3xl">{job.contractor?.icon || 'architecture'}</span>
                                </div>
                                <div>
                                    <h4 className="text-xl font-black">{job.contractor?.name || job.company}</h4>
                                    <p className="text-slate-500 font-bold text-sm">{job.contractor?.type || 'Top Tier Contractor'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-green-800 text-center">
                                    <p className="text-2xl font-black text-secondary">{job.contractor?.onTimeRate || '100%'}</p>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">On-Time Payment</p>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-5 rounded-2xl border border-yellow-100 dark:border-yellow-800 text-center">
                                    <p className="text-2xl font-black text-yellow-600">{job.contractor?.rating || '4.9 / 5.0'}</p>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">Worker Rating</p>
                                </div>
                            </div>

                            <div className="rounded-3xl overflow-hidden h-48 mb-8 border border-slate-200 dark:border-slate-700 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1526772662000-3f88f10c053e?q=80&w=2000&auto=format&fit=crop"
                                    alt="Map Preview"
                                    className="w-full h-full object-cover grayscale opacity-50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg flex items-center gap-2 border border-slate-200">
                                        <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                                        <span className="font-black text-slate-800 text-base">{job.location}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full bg-[#EF4444] text-white py-6 rounded-2xl font-black text-2xl hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] mb-4">
                                Apply Now
                            </button>
                            <p className="text-center text-sm font-bold text-slate-400">Application takes approx. 3 minutes</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <h5 className="text-lg font-black mb-4">Why work here?</h5>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <span className="material-symbols-outlined text-secondary">verified_user</span>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">All payments are held in escrow and released weekly upon milestone completion.</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="material-symbols-outlined text-primary">support_agent</span>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">24/7 Support line available for all on-site workers.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Bottom Badges */}
                <section className="mt-24 pt-16 border-t-2 border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
                        <div className="flex gap-8 items-start bg-blue-50/50 dark:bg-blue-900/10 p-10 rounded-[3rem]">
                            <div className="w-20 h-20 shrink-0 bg-primary text-white rounded-3xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-5xl">gpp_good</span>
                            </div>
                            <div>
                                <h4 className="text-3xl font-black mb-4">Safety Standards</h4>
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                    This contractor is &quot;Safety First&quot; certified. They undergo bi-monthly site inspections and provide all necessary PPE on day one. Your safety is our primary metric for contractor evaluation.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-8 items-start bg-green-50/50 dark:bg-green-900/10 p-10 rounded-[3rem]">
                            <div className="w-20 h-20 shrink-0 bg-secondary text-white rounded-3xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-5xl">payments</span>
                            </div>
                            <div>
                                <h4 className="text-3xl font-black mb-4">Payment Security</h4>
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Workforce Connection guarantees that funds for this position are pre-deposited. We ensure 100% on-time payment release directly to your preferred bank account or digital wallet.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Similar Jobs */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h3 className="text-4xl font-black tracking-tight">Similar Job Opportunities</h3>
                            <Link href="/jobs" className="text-primary font-bold text-lg hover:underline flex items-center gap-2">
                                View all jobs <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {similarJobs.map((similarJob, idx) => (
                                <SimilarJobCard key={similarJob.id} job={similarJob} index={idx} />
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
