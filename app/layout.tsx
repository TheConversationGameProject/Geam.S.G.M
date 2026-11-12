import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "کافه کاندیدا | محفل راویان",
  description: "دستیار اجرای بازی‌های گفتگو‌محور",
  applicationName: "کافه کاندیدا",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "کافه کاندیدا" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#171715",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
