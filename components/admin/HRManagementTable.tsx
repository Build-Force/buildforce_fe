import { HRProfile } from "@/components/admin/types";
import { StatusBadge } from "@/components/admin/StatusBadge";

type HRManagementTableProps = {
  data: HRProfile[];
  onViewDetails: (hr: HRProfile) => void;
  onApprove: (hr: HRProfile) => void;
  onReject: (hr: HRProfile) => void;
  onBlacklist: (hr: HRProfile) => void;
  onReactivate: (hr: HRProfile) => void;
};

export function HRManagementTable({
  data,
  onViewDetails,
  onApprove,
  onReject,
  onBlacklist,
  onReactivate,
}: HRManagementTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1160px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              {[
                "Company Name",
                "Tax Code",
                "Region",
                "Verification Status",
                "Completed Projects",
                "Avg Rating",
                "Report Count",
                "Registration Date",
                "Actions",
              ].map((head) => (
                <th key={head} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((hr) => {
              const status = hr.isBlacklisted ? "BLACKLISTED" : hr.verificationStatus;

              return (
                <tr key={hr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-4 font-semibold">{hr.companyName}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{hr.taxCode}</td>
                  <td className="px-4 py-4 text-sm">{hr.region}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="px-4 py-4 text-sm">{hr.completedProjects}</td>
                  <td className="px-4 py-4 text-sm">{hr.avgRating.toFixed(1)}</td>
                  <td className="px-4 py-4 text-sm">{hr.reportCount}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{new Date(hr.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onViewDetails(hr)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        View Details
                      </button>

                      {hr.verificationStatus === "PENDING" && !hr.isBlacklisted && (
                        <button
                          onClick={() => onApprove(hr)}
                          className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}

                      {!hr.isBlacklisted && (
                        <button
                          onClick={() => onReject(hr)}
                          className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Reject
                        </button>
                      )}

                      {!hr.isBlacklisted ? (
                        <button
                          onClick={() => onBlacklist(hr)}
                          className="rounded-lg bg-red-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-800"
                        >
                          Blacklist
                        </button>
                      ) : (
                        <button
                          onClick={() => onReactivate(hr)}
                          className="rounded-lg bg-green-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-800"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
