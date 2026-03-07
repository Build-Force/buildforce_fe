import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootFrame } from "@/components/layout/RootFrame";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BuildForce | Nền tảng kết nối nhân lực xây dựng",
  description: "Kết nối những bàn tay lành nghề với các dự án tin cậy. Thị trường nhân lực uy tín nhất ngành xây dựng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light">
      <body className={`${inter.variable} ${inter.className}`}>
        <PageTransitionLoader />
        <RootFrame>{children}</RootFrame>
      </body>
    </html>
  );
}
