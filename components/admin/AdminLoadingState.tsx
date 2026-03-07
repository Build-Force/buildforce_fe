type AdminLoadingStateProps = {
  message?: string;
  colSpan?: number;
  asTableRow?: boolean;
};

export function AdminLoadingState({ message = "Đang tải dữ liệu...", colSpan = 1, asTableRow = false }: AdminLoadingStateProps) {
  if (asTableRow) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-slate-500">
          {message}
        </td>
      </tr>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
      {message}
    </div>
  );
}
