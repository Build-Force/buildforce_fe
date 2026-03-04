import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { RootFrame } from "@/components/layout/RootFrame";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";

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
  title: "Workforce Connection | Construction Talent Hub",
  description: "Connecting Skilled Hands to Reliable Projects. The industry's most reliable talent marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${barlow.variable} ${barlowCondensed.variable}`}>
        <PageTransitionLoader />
        <RootFrame>{children}</RootFrame>
      </body>
    </html>
  );
}
