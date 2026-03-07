import { AdminUser } from "@/components/admin/types";
import { StatusBadge } from "@/components/admin/StatusBadge";

type UserManagementTableProps = {
  users: AdminUser[];
  onSuspend: (user: AdminUser) => void;
  onReactivate: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onRestore: (user: AdminUser) => void;
};

function roleBadgeClass(role: AdminUser["role"]) {
  if (role === "USER") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (role === "HR") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
}

export function UserManagementTable({ users, onSuspend, onReactivate, onDelete, onRestore }: UserManagementTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Registration Date</th>
            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => {
            const canSuspend = user.status === "ACTIVE";
            const canReactivate = user.status === "SUSPENDED";
            const canRestore = user.status === "DELETED";

            return (
              <tr key={user.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-900/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.fullName}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${roleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {canSuspend && (
                      <button
                        onClick={() => onSuspend(user)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-2.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                      >
                        Suspend
                      </button>
                    )}

                    {canReactivate && (
                      <button
                        onClick={() => onReactivate(user)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        Reactivate
                      </button>
                    )}

                    {canRestore && (
                      <button
                        onClick={() => onRestore(user)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                      >
                        Restore
                      </button>
                    )}

                    {user.status !== "DELETED" && (
                      <button
                        onClick={() => onDelete(user)}
                        className="inline-flex h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/30">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">1</span> to{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{users.length}</span> of{" "}
          <span className="font-semibold text-slate-900 dark:text-slate-100">248</span> users
        </p>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            Previous
          </button>
          <button className="h-9 w-9 rounded-lg bg-primary text-sm font-bold text-white">1</button>
          <button className="h-9 w-9 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
          <button className="h-9 w-9 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
