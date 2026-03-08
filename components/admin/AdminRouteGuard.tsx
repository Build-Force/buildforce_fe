"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/utils/api";

type Props = {
  children: React.ReactNode;
};

export function AdminRouteGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        const res = await api.get("/api/auth/profile");
        const role = String(res.data?.data?.role || "").toUpperCase();

        if (role !== "ADMIN") {
          router.replace("/signin");
          return;
        }

        setAllowed(true);
      } catch {
        localStorage.removeItem("token");
        router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkAccess();
  }, [pathname, router]);

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
