import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import "./globals.css";
import Image from "next/image";
import PixelBlast from "@/components/PixelBlast";

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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
          <PixelBlast
            variant="square"
            pixelSize={3}
            color="#f84242"
            patternScale={2}
            patternDensity={0.9}
            enableRipples={true}
            rippleSpeed={0.3}
            rippleThickness={0.1}
            rippleIntensityScale={1}
            speed={0.5}
            transparent={false}
            edgeFade={0.1}
            textOverlay={{
              text: "SARK",
              fontFamily: "SarkTitle, sans-serif",
              fontSizeVW: 18,
              maskMode: "fill",
              rippleFromText: true
            }}
          />
          {/* Dimming overlay so content on top is more legible */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', pointerEvents: 'none' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
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
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
