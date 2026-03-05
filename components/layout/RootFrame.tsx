"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type RootFrameProps = {
  children: React.ReactNode;
};

export function RootFrame({ children }: RootFrameProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="pt-28">{children}</main>
      <Footer />
    </>
  );
}
