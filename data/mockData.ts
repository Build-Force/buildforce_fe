export const NAV_LINKS = [
    { label: "Find Jobs", href: "#" },
    { label: "Hire Talent", href: "#" },
    { label: "Safety Hub", href: "#" },
];

export const JOBS = [
    {
        id: 1,
        title: "Senior Structural Welder",
        company: "Mainland Infrastructure Group",
        location: "Downtown Metro",
        compensation: "$45/hr",
        urgent: true,
        postedAt: "2 days ago",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU-EYHWyjtLgvdrXjpNsPGMwpAUTGZ-n5rv2X0uErMVWZJDr4Rgjrld_k8z2mw3adc4EK3Ba48eq9W4HyUKylIghnJo25Hzd9fIjUUmbUmE3T_n22XZeQkJUfdHlPxmLdjgpsy_JKhyftvU2b6BH8pxqkfPKzhNPhHRiiw0hmvR9nNH8f8la6U8ct4T8Cwcl2tvVq4Rd_b_HlokZRK1U8EKDmozcItyYYV8WEATSRr-Fz9coap3cKFSCeiI6J2u6Gb7BQayHArsUU",
        applicants: 12,
        verified: true,
        onTimePayment: true,
    },
    {
        id: 2,
        title: "Commercial Electrician (L2)",
        company: "Skyline Dev Partners",
        location: "North Riverside",
        compensation: "$38 - $42/hr",
        urgent: false,
        postedAt: "2 days ago",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiy3gwFmrZUh_0QoTVGghwY_VBHoXg-74ybI7TnOsVoBKh1JfcrwwcWCNT1wO7iWm6Ru9-IJ1tjg3hO2-bYd77KQdkYi6h3gvY0uqa4yY3dLUdmi2hRX1xf7jtKdDVEByGeRoPUxBrWX7pb1huDxHnKX94aY62bLLdaB3beJTKLGOT8LQD-r5OBZ9gPt8pW_01FNkW0gOt85cW3Wsz_oAH2fSjgCPl8xeiK0CQYdU5uIkbjhZM3zIu6A0iKMeJE5AhDCn_IP8AXR0",
        applicants: 8,
        verified: true,
        onTimePayment: true,
    },
];

export const CONTRACTORS = [
    {
        id: 1,
        name: "Skyline Dev Partners",
        verifiedSince: 2021,
        projectsCount: 124,
        rating: 4.9,
        reliability: "Excellent",
        icon: "domain",
    },
    {
        id: 2,
        name: "Mainland Group",
        verifiedSince: 2019,
        projectsCount: 312,
        rating: 4.7,
        reliability: "100% On-Time",
        icon: "architecture",
    },
];

export const FEATURES = [
    {
        title: "Skill Verification",
        highlight: "All workers verified before hiring",
        description: "Every worker profile features third-party verification and peer-reviewed skill assessments.",
        icon: "verified_user",
        bgClass: "bg-blue-100 dark:bg-blue-900/40",
        iconClass: "text-primary",
        footer: {
            type: "rating",
            value: "4.8 Avg",
        },
    },
    {
        title: "Payment Punctuality",
        highlight: "98% on-time payment rate",
        description: "Our 'Reliability Score' shows how often contractors pay on time. Total transparency for workers.",
        icon: "payments",
        bgClass: "bg-green-100 dark:bg-green-900/40",
        iconClass: "text-secondary",
        footer: {
            type: "progress",
            value: 98,
        },
    },
    {
        title: "Safety First",
        highlight: "Certified projects only",
        description: "Digital vault for OSHA certifications and safety compliance records accessible instantly.",
        icon: "health_and_safety",
        bgClass: "bg-amber-100 dark:bg-amber-900/40",
        iconClass: "text-amber-500",
        footer: {
            type: "tags",
            value: ["OSHA-30", "HAZMAT"],
        },
    },
];

export const USER_PROFILE = {
    id: "user_123",
    name: "James Wilson",
    role: "Senior Structural Welder",
    specialty: "Fabrication Specialist",
    location: "Austin, Texas, US",
    email: "james.wilson@expert.com",
    phone: "+1 (512) 555-0123",
    avatar: "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=2071&auto=format&fit=crop",
    coverImage: "https://hinhcute.net/wp-content/uploads/2025/11/bo-anh-hinh-nen-facebook-dep-tuyet-voi-25-08-2025.jpg",
    stats: {
        completedProjects: 54,
        trustScore: 4.9,
        successRate: 98,
        experienceYears: 15,
    },
    bio: "Professional Senior Structural Welder with over 15 years of hands-on experience in high-pressure environments. Specialized in MIG, TIG, and Stick welding for major infrastructure projects including bridges, offshore platforms, and industrial skyscrapers. Committed to safety, precision, and delivering superior quality under tight deadlines.",
    skills: ["Structural Welding", "MIG/TIG", "Stick Welding", "Blueprint Reading", "Arc Welding", "Metal Fabrication", "Pipe Fitting"],
    certifications: [
        { title: "OSHA-30 Safety", validity: "Valid until 2026", type: "safety" },
        { title: "AWS D1.1 Structural", validity: "Master Level", type: "professional" }
    ],
    experience: [
        {
            period: "2021 - Present",
            title: "Senior Bridge Welder",
            company: "Mainland Infra Group",
            type: "Full-time",
            description: "Led a team of 12 welders for the Gulf Bridge Reconstruction Project. Zero safety incidents reported over 3 years."
        },
        {
            period: "2018 - 2021",
            title: "Industrial Fabricator",
            company: "Skyline Dev Partners",
            type: "Full-time",
            description: "Custom metal fabrication for high-rise steel structures. Specialized in complex blueprint interpretation."
        }
    ],
    notifications: [
        { id: 1, title: "Payment Received", detail: "$2,800.00 from Skyline Dev", icon: "payments", color: "blue" },
        { id: 2, title: "New Review Received", detail: "Robert Smith gave you 5 stars", icon: "star", color: "green" }
    ],
    walletBalance: 12450.00,
    walletGrowth: 12,
    profileStrength: 92
};
