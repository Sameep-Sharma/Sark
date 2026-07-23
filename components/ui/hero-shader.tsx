"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

// Dynamically require @paper-design/shaders-react if available, or fallback
let MeshGradient: any = null;
try {
  MeshGradient = require("@paper-design/shaders-react").MeshGradient;
} catch {
  // Fallback
}

interface ShaderBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
}

function DroppingStarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Star / Meteor definition
    interface Star {
      x: number;
      y: number;
      length: number;
      speed: number;
      size: number;
      opacity: number;
      color: string;
      trailWidth: number;
    }

    const starColors = ["#f84242", "#ffffff", "#ff6b6b", "#ff9b9b"];
    const stars: Star[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      length: Math.random() * 40 + 15,
      speed: Math.random() * 3 + 1.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      trailWidth: Math.random() * 1.5 + 0.5,
    }));

    // Ambient twinkling stars
    const staticStars = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      pulseDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render static twinkling stars
      staticStars.forEach((s) => {
        s.opacity += s.pulseSpeed * s.pulseDir;
        if (s.opacity >= 0.95) s.pulseDir = -1;
        if (s.opacity <= 0.15) s.pulseDir = 1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = "#f84242";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render dropping stars / meteors
      stars.forEach((s) => {
        s.y += s.speed;
        s.x += (s.speed * 0.15); // gentle diagonal trajectory

        // Draw meteor trail
        const gradient = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - s.length * 0.15,
          s.y - s.length,
        );
        gradient.addColorStop(0, s.color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length * 0.15, s.y - s.length);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = s.trailWidth;
        ctx.stroke();

        // Draw star glowing head
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Reset when star reaches bottom or side
        if (s.y > height + s.length || s.x > width + s.length) {
          s.y = -s.length - Math.random() * 50;
          s.x = Math.random() * width * 1.2 - width * 0.1;
          s.speed = Math.random() * 3 + 1.5;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
    />
  );
}

export function ShaderBackground({
  children,
  colors = ["#000000", "#f84242", "#ffffff", "#1e1b4b", "#7f1d1d"],
}: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="min-h-[650px] w-full relative overflow-hidden bg-black/80">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      {MeshGradient ? (
        <>
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-40"
            colors={colors}
            speed={0.3}
            backgroundColor="transparent"
          />
          <MeshGradient
            className="absolute inset-0 w-full h-full opacity-30"
            colors={["#000000", "#ffffff", "#f84242", "#000000"]}
            speed={0.2}
            wireframe="true"
            backgroundColor="transparent"
          />
        </>
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-black via-neutral-900 to-[#f84242]/20 opacity-40" />
      )}

      {/* Dropping Stars / Meteors Canvas */}
      <DroppingStarsCanvas />

      {children}
    </div>
  );
}
