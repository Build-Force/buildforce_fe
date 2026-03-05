import { HRProfile } from "@/components/admin/types";
import { StatusBadge } from "@/components/admin/StatusBadge";

type HRDetailDrawerProps = {
  open: boolean;
  profile: HRProfile | null;
  onClose: () => void;
};

export function HRDetailDrawer({ open, profile, onClose }: HRDetailDrawerProps) {
  if (!open || !profile) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">HR Details</h3>
            <p className="text-sm text-slate-500">Employer profile and trust indicators</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close details"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Company Information</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Company:</span> {profile.companyName}</p>
              <p><span className="font-semibold">Tax Code:</span> {profile.taxCode}</p>
              <p><span className="font-semibold">Address:</span> {profile.address}</p>
              <p><span className="font-semibold">Contact Email:</span> {profile.contactEmail}</p>
              <p><span className="font-semibold">Phone:</span> {profile.phone}</p>
              <div className="pt-2">
                <StatusBadge status={profile.isBlacklisted ? "BLACKLISTED" : profile.verificationStatus} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Reputation Statistics</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><span className="font-semibold">Completed Projects:</span> {profile.completedProjects}</p>
              <p><span className="font-semibold">Workers Hired:</span> {profile.workersHired}</p>
              <p><span className="font-semibold">Completion Rate:</span> {profile.completionRate}%</p>
              <p><span className="font-semibold">Avg Rating:</span> {profile.avgRating.toFixed(1)}</p>
              <p><span className="font-semibold">Total Reports:</span> {profile.reportCount}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Payment Transparency (Aggregated)</h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Popular Payment Method:</span>{" "}
                {profile.popularPaymentMethod === "CASH" ? "Cash" : "Bank transfer"}
              </p>
              <p><span className="font-semibold">On-time Payment Rate:</span> {profile.onTimePaymentRate}%</p>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}
