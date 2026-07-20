import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import "./globals.css";
import Image from "next/image";


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
      <body className="min-h-full bg-sark-black text-sark-ink">
        <main className="home-page">
          <header className="home-header">
            <div className="home-logo-wrap">
              <div className="home-logo-glow" />
              <Image
                src="/SARK-LOGO.png"
                alt="SARK"
                width={160}
                height={130}
                priority
                className="home-logo"
                style={{ width: 160, height: "auto" }}
              />
            </div>
          </header>
        </main>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
