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
    <html lang="en" className="dark h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Arimo:ital,wght@0,400..700;1,400..700&family=Cascadia+Code:ital,wght@0,200..700;1,200..700&family=Honk:MORF@15&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Outfit:wght@100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-black text-sark-ink">
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, opacity: 0.5, pointerEvents: 'none' }}>
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
        </div>
        <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
          <header className="home-header pointer-events-none">
            <div className="home-logo-wrap pointer-events-auto">
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
