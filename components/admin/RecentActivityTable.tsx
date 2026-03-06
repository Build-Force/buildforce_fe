import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActivityRow } from "@/components/admin/types";

type RecentActivityTableProps = {
  rows: ActivityRow[];
};

export function RecentActivityTable({ rows }: RecentActivityTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
        <h3 className="text-lg font-bold">Hoạt động gần đây</h3>
        <button className="text-sm font-bold text-primary hover:underline">Xem tất cả</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50">
              {['Lao động', 'Đối tác HR', 'Loại việc', 'Khu vực', 'Trạng thái', 'Thanh toán'].map((head) => (
                <th
                  key={head}
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                    head === 'Thanh toán' ? 'text-right' : ''
                  }`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <img src={row.laborerAvatar} alt={row.laborer} className="h-full w-full object-cover" />
                    </div>
                    <span className="text-sm font-bold">{row.laborer}</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{row.hrPartner}</td>
                <td className="px-6 py-4 text-sm font-medium">{row.jobType}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{row.location}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold">{row.payment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
