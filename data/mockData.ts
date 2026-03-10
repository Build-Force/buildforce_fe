export const NAV_LINKS = [
    { label: "Tìm việc làm", href: "/jobs" },
    { label: "Tuyển nhân sự", href: "/post-job" },
    { label: "Trung tâm an toàn", href: "#" },
    { label: "Mạng xã hội", href: "/blog" },
];

export const JOBS = [
    {
        id: 1,
        title: "Thợ hàn kết cấu cao cấp",
        company: "Tập đoàn Hạ tầng Mainland",
        hrId: "hr_001",
        location: "Trung tâm Thành phố",
        compensation: "45$/giờ",
        urgent: true,
        postedAt: "2 ngày trước",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDU-EYHWyjtLgvdrXjpNsPGMwpAUTGZ-n5rv2X0uErMVWZJDr4Rgjrld_k8z2mw3adc4EK3Ba48eq9W4HyUKylIghnJo25Hzd9fIjUUmbUmE3T_n22XZeQkJUfdHlPxmLdjgpsy_JKhyftvU2b6BH8pxqkfPKzhNPhHRiiw0hmvR9nNH8f8la6U8ct4T8Cwcl2tvVq4Rd_b_HlokZRK1U8EKDmozcItyYYV8WEATSRr-Fz9coap3cKFSCeiI6J2u6Gb7BQayHArsUU",
        applicants: 12,
        verified: true,
        onTimePayment: true,
        type: "Toàn thời gian",
        description: "Chúng tôi đang tìm kiếm một Thợ hàn kết cấu có tay nghề cao cho dự án hạ tầng lớn tại Trung tâm Thành phố. Bạn sẽ chịu trách nhiệm gia công thép kết cấu phức tạp, hàn ở nhiều vị trí khác nhau và đảm bảo mọi công việc đều đáp ứng các tiêu chuẩn an toàn và chất lượng nghiêm ngặt.",
        responsibilities: [
            "Thực hiện các mối hàn chất lượng cao bằng quy trình GMAW, FCAW và SMAW trên thép kết cấu nặng.",
            "Đọc hiểu bản vẽ kỹ thuật và các ký hiệu hàn một cách chính xác.",
            "Phối hợp với đội ngũ kỹ thuật tại công trường để giải quyết các thách thức kỹ thuật về hàn.",
            "Tuân thủ nghiêm ngặt các quy chuẩn hàn kết cấu AWS D1.1.",
            "Hướng dẫn và kèm cặp các thợ hàn cấp dưới về kỹ thuật và an toàn."
        ],
        requirements: [
            "Chứng chỉ CWB hoặc AWS hợp lệ về hàn thép kết cấu.",
            "Ít nhất 8 năm kinh nghiệm trong các dự án hạ tầng hoặc công nghiệp nặng.",
            "Thành thạo đọc các bản vẽ kỹ thuật và thiết kế kết cấu phức tạp.",
            "Kỹ năng chuyên gia với nhiều quy trình hàn (Stick, MIG, Flux-Core).",
            "Phải vượt qua bài kiểm tra hàn và kiểm tra an toàn trước khi vào làm.",
            "Có phương tiện di chuyển ổn định đến công trường tại Trung tâm Thành phố."
        ],
        benefits: [
            { icon: "medical_services", label: "Bảo hiểm sức khỏe & Nha khoa cao cấp" },
            { icon: "savings", label: "Đóng bảo hiểm xã hội" },
            { icon: "commute", label: "Phụ cấp đi lại" },
            { icon: "apparel", label: "Hỗ trợ dụng cụ & Đồ bảo hộ" }
        ],
        contractor: {
            name: "Tập đoàn Hạ tầng Mainland",
            type: "Nhà thầu hàng đầu",
            onTimeRate: "100%",
            rating: "4.9 / 5.0",
            icon: "architecture"
        }
    },
    {
        id: 2,
        title: "Thợ điện thương mại (Bậc 2)",
        company: "Đối tác Phát triển Skyline",
        location: "Phía Bắc Riverside",
        compensation: "38$ - 42$/giờ",
        urgent: false,
        postedAt: "2 ngày trước",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiy3gwFmrZUh_0QoTVGghwY_VBHoXg-74ybI7TnOsVoBKh1JfcrwwcWCNT1wO7iWm6Ru9-IJ1tjg3hO2-bYd77KQdkYi6h3gvY0uqa4yY3dLUdmi2hRX1xf7jtKdDVEByGeRoPUxBrWX7pb1huDxHnKX94aY62bLLdaB3beJTKLGOT8LQD-r5OBZ9gPt8pW_01FNkW0gOt85cW3Wsz_oAH2fSjgCPl8xeiK0CQYdU5uIkbjhZM3zIu6A0iKMeJE5AhDCn_IP8AXR0",
        applicants: 8,
        verified: true,
        onTimePayment: true,
        type: "Toàn thời gian",
        description: "Gia nhập Đối tác Phát triển Skyline với tư cách là Thợ điện thương mại (Bậc 2). Bạn sẽ làm việc trong các dự án phát triển thương mại lớn, đảm bảo hệ thống điện được lắp đặt và bảo trì theo các tiêu chuẩn ngành cao nhất.",
        responsibilities: [
            "Lắp đặt, bảo trì và sửa chữa hệ thống điện trong các tòa nhà thương mại.",
            "Kiểm tra hệ thống điện bằng các công cụ chẩn đoán chuyên dụng.",
            "Đảm bảo tuân thủ tất cả các quy định an toàn và quy chuẩn xây dựng.",
            "Làm việc theo bản vẽ và sơ đồ kỹ thuật."
        ],
        requirements: [
            "Chứng chỉ thợ điện bậc thầy hoặc thợ lành nghề.",
            "Ít nhất 5 năm kinh nghiệm làm điện thương mại.",
            "Hiểu biết sâu sắc về mã điện quốc gia (NEC).",
            "Có khả năng làm việc độc lập hoặc theo nhóm."
        ],
        benefits: [
            { icon: "medical_services", label: "Chăm sóc sức khỏe & Thị lực" },
            { icon: "payments", label: "Thưởng hiệu suất" },
            { icon: "schedule", label: "Ca làm việc linh hoạt" }
        ],
        contractor: {
            name: "Đối tác Phát triển Skyline",
            type: "Nhà thầu đã xác minh",
            onTimeRate: "98%",
            rating: "4.7 / 5.0",
            icon: "domain"
        }
    },
];

export const CONTRACTORS = [
    {
        id: 1,
        name: "Đối tác Phát triển Skyline",
        verifiedSince: 2021,
        projectsCount: 124,
        rating: 4.9,
        reliability: "Xuất sắc",
        icon: "domain",
    },
    {
        id: 2,
        name: "Tập đoàn Mainland",
        verifiedSince: 2019,
        projectsCount: 312,
        rating: 4.7,
        reliability: "Trả lương 100% đúng hạn",
        icon: "architecture",
    },
];

export const FEATURES = [
    {
        title: "Xác minh kỹ năng",
        highlight: "Tất cả công nhân đều được xác minh trước khi thuê",
        description: "Mọi hồ sơ công nhân đều có xác minh từ bên thứ ba và đánh giá kỹ năng từ đồng nghiệp.",
        icon: "verified_user",
        bgClass: "bg-blue-100 dark:bg-blue-900/40",
        iconClass: "text-primary",
        footer: {
            type: "rating",
            value: "Trung bình 4.8",
        },
    },
    {
        title: "Đúng hạn thanh toán",
        highlight: "Tỷ lệ thanh toán đúng hạn 98%",
        description: "Chỉ số 'Tin cậy' của chúng tôi cho thấy tần suất nhà thầu trả lương đúng hạn. Minh bạch hoàn toàn cho công nhân.",
        icon: "payments",
        bgClass: "bg-green-100 dark:bg-green-900/40",
        iconClass: "text-secondary",
        footer: {
            type: "progress",
            value: 98,
        },
    },
    {
        title: "An toàn là trên hết",
        highlight: "Chỉ các dự án đã được chứng nhận",
        description: "Kho lưu trữ kỹ thuật số cho các chứng chỉ an toàn và hồ sơ tuân thủ có thể truy cập ngay lập tức.",
        icon: "health_and_safety",
        bgClass: "bg-amber-100 dark:bg-amber-900/40",
        iconClass: "text-amber-500",
        footer: {
            type: "tags",
            value: ["An toàn lao động", "Chứng chỉ nghề"],
        },
    },
];

export const USER_PROFILE = {
    id: "user_123",
    name: "Nguyễn Văn Hùng",
    role: "Thợ hàn kết cấu cao cấp",
    specialty: "Chuyên gia gia công thép",
    location: "Đà Nẵng, Việt Nam",
    email: "hung.nguyen@chuyengia.com",
    phone: "+84 912 345 678",
    avatar: "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=2071&auto=format&fit=crop",
    coverImage: "https://hinhcute.net/wp-content/uploads/2025/11/bo-anh-hinh-nen-facebook-dep-tuyet-voi-25-08-2025.jpg",
    stats: {
        completedProjects: 54,
        trustScore: 4.9,
        successRate: 98,
        experienceYears: 15,
    },
    bio: "Thợ hàn kết cấu cao cấp chuyên nghiệp với hơn 15 năm kinh nghiệm thực tế trong môi trường áp lực cao. Chuyên về hàn MIG, TIG và hàn que cho các dự án hạ tầng lớn bao gồm cầu, giàn khoan ngoài khơi và các tòa nhà chọc trời công nghiệp. Cam kết an toàn, độ chính xác và mang lại chất lượng vượt trội dưới thời hạn chặt chẽ.",
    skills: ["Hàn kết cấu", "Hàn MIG/TIG", "Hàn que", "Đọc bản vẽ", "Hàn hồ quang", "Gia công kim loại", "Lắp đặt đường ống"],
    certifications: [
        { title: "An toàn lao động", validity: "Hiệu lực đến 2026", type: "safety" },
        { title: "Chứng chỉ hàn kết cấu", validity: "Bậc thầy", type: "professional" }
    ],
    experience: [
        {
            period: "2021 - Hiện tại",
            title: "Thợ hàn cầu cao cấp",
            company: "Tập đoàn Hạ tầng Mainland",
            type: "Toàn thời gian",
            description: "Dẫn dắt đội ngũ 12 thợ hàn cho Dự án Tái thiết Cầu Vịnh. Không có sự cố an toàn nào được ghi nhận trong suốt 3 năm."
        },
        {
            period: "2018 - 2021",
            title: "Thợ gia công công nghiệp",
            company: "Đối tác Phát triển Skyline",
            type: "Toàn thời gian",
            description: "Gia công kim loại tùy chỉnh cho các kết cấu thép cao tầng. Chuyên sâu về giải mã các bản vẽ kỹ thuật phức tạp."
        }
    ],
    notifications: [
        { id: 1, title: "Nhận tiền thanh toán", detail: "2,800.00$ từ Skyline Dev", icon: "payments", color: "blue" },
        { id: 2, title: "Đánh giá mới", detail: "Robert Smith đã đánh giá bạn 5 sao", icon: "star", color: "green" }
    ],
    walletBalance: 12450.00,
    walletGrowth: 12,
    profileStrength: 92
};

