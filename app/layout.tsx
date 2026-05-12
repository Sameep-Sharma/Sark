import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SARK",
    template: "%s | SARK",
  },
  description: "SARK college tech club web platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-sark-black text-sark-ink">{children}</body>
    </html>
  );
}
