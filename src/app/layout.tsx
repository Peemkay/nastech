import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description:
    "Sell or trade in your phone, laptop, tablet or smartwatch for instant cash, or shop certified refurbished devices — all in Naira, with Nigerian payment methods.",
  // Favicon/app icons come from the file-convention icons in this directory
  // (icon.svg, icon.png, apple-icon.png, favicon.ico) — Next.js picks these up
  // automatically, so no explicit `icons` override is needed here.
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} data-theme="light">
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
