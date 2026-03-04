import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "thợ xây dựng Đà Nẵng";

    try {
        const serpRes = await axios.get("https://serpapi.com/search.json", {
            params: {
                engine: "google_jobs",
                q: q,
                hl: "vi",
                api_key: process.env.SERPAPI_KEY || process.env.NEXT_PUBLIC_SERPAPI_KEY,
            },
        });

        const jobs = serpRes.data.jobs_results || [];

        // Mapp job data + Geocode using Mapbox
        const mappedJobs = await Promise.all(
            jobs.map(async (job: any, index: number) => {
                let lat = 16.054 + (Math.random() - 0.5) * 0.1;
                let lng = 108.202 + (Math.random() - 0.5) * 0.1;
                let distance = (Math.random() * 10).toFixed(1);

                if (job.location) {
                    try {
                        const geoRes = await axios.get(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                                job.location
                            )}.json`,
                            {
                                params: {
                                    access_token: process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
                                    country: "vn",
                                    limit: 1,
                                },
                            }
                        );
                        if (geoRes.data.features && geoRes.data.features.length > 0) {
                            lng = geoRes.data.features[0].center[0];
                            lat = geoRes.data.features[0].center[1];
                        }
                    } catch (e) {
                        console.error("Mapbox Geocoding Error:", e);
                    }
                }

                return {
                    id: job.job_id || index.toString(),
                    title: job.title || "Công việc xây dựng",
                    company: job.company_name || "Công ty ẩn danh",
                    location: job.location || "Đà Nẵng",
                    lat,
                    lng,
                    distance: parseFloat(distance),
                    salary: "Thỏa thuận",
                    skill: job.title?.toLowerCase().includes("điện") ? "Thợ điện"
                         : job.title?.toLowerCase().includes("hàn") ? "Thợ hàn"
                         : job.title?.toLowerCase().includes("kỹ sư") ? "Kỹ sư"
                         : "Thợ xây",
                    workers: Math.floor(Math.random() * 10) + 1,
                    rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
                    urgent: Math.random() > 0.7,
                };
            })
        );

        return NextResponse.json(mappedJobs);
    } catch (error) {
        console.error("SerpAPI Error:", error);
        return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }
}
