import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
      <body>
        <Header />
        <main className="pt-28">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
