type AdminToastProps = {
  type: "success" | "error";
  message: string;
};

export function AdminToast({ type, message }: AdminToastProps) {
  return (
    <div
      className={`absolute right-4 top-4 z-50 rounded-lg px-4 py-2 text-sm font-medium text-white shadow ${
        type === "success" ? "bg-emerald-600" : "bg-red-600"
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
