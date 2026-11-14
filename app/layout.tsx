import type { Metadata, Viewport } from "next";
import "./globals.css";
export const viewport: Viewport = { themeColor: "#27352a" };
export const metadata: Metadata = {
  appleWebApp: { capable: true, title: "Munchadoo", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  title: "Munchadoo — a little less deciding, a lot more munching",
  description:
    "Find your next bite. A playful restaurant picker and little games for the wait.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
