export type Locale = "vi" | "en";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
};

export type StatTrendTone = "positive" | "negative" | "neutral";

export type StatItem = {
  title: string;
  value: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  trend: string;
  trendTone: StatTrendTone;
  periodComparison?: string;
  sparkline?: number[];
};

export type ActivityStatus = "active" | "pending" | "matched";

export type ActivityRow = {
  id: string;
  laborer: string;
  laborerAvatar: string;
  hrPartner: string;
  jobType: string;
  location: string;
  status: ActivityStatus;
  payment: string;
};

export interface HRProfile {
  id: string;
  companyName: string;
  taxCode: string;
  region: string;
  address: string;
  contactEmail: string;
  phone: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  isBlacklisted: boolean;
  completedProjects: number;
  workersHired: number;
  completionRate: number;
  avgRating: number;
  reportCount: number;
  popularPaymentMethod: "CASH" | "BANK_TRANSFER";
  onTimePaymentRate: number;
  createdAt: string;
}

export type HRFilterStatus = "ALL" | HRProfile["verificationStatus"] | "BLACKLISTED";

export type UserRole = "USER" | "HR" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}
