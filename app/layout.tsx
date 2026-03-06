import type { Metadata } from "next";
import { Suspense } from "react";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { RootFrame } from "@/components/layout/RootFrame";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import { ChatWidgetWrapper } from "@/components/chat/ChatWidgetWrapper";

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  weight: ["400", "500", "600", "700"],
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
      <body className={`${barlow.variable} ${barlowCondensed.variable}`}>
        <Suspense fallback={null}>
          <PageTransitionLoader />
        </Suspense>
        <RootFrame>{children}</RootFrame>
        <ChatWidgetWrapper />
      </body>
    </html>
  );
}
