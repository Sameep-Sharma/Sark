import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import "./globals.css";
import Image from "next/image";
import LightPillar from "@/components/LightPillar";


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
      <body className="min-h-full bg-black text-sark-ink">
        <LightPillar
          topColor="#ff272c"
          bottomColor="#ff9fa9"
          intensity={1}
          rotationSpeed={0.6}
          interactive={false}
          glowAmount={0.002}
          pillarWidth={6.5}
          pillarHeight={0.35}
          noiseIntensity={1}
          pillarRotation={45}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
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
                  style={{ width: "auto", height: "auto", maxWidth: 160 }}
                />
              </div>
            </header>
          </main>
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
