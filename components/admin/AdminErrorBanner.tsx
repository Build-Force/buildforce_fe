type AdminErrorBannerProps = {
  message: string;
  className?: string;
};

export function AdminErrorBanner({ message, className = "" }: AdminErrorBannerProps) {
  return (
    <div
      className={`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
}
