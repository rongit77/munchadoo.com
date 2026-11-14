import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
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
