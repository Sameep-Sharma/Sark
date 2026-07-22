'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import dynamic from 'next/dynamic';

// ─── Props ───────────────────────────────────────────────────────────────────

export interface LightPillarProps {
  topColor?: string;
  bottomColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  pillarRotation?: number;
  scrollRotationEnabled?: boolean;
  scrollRotationFactor?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Shader source ───────────────────────────────────────────────────────────

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2  uResolution;
  uniform vec2  uMouse;
  uniform vec3  uTopColor;
  uniform vec3  uBottomColor;
  uniform float uIntensity;
  uniform bool  uInteractive;
  uniform float uGlowAmount;
  uniform float uPillarWidth;
  uniform float uPillarHeight;
  uniform float uNoiseIntensity;
  uniform float uRotCos;
  uniform float uRotSin;
  uniform float uPillarRotCos;
  uniform float uPillarRotSin;
  uniform float uWaveSin;
  uniform float uWaveCos;

  varying vec2 vUv;

  const int MAX_ITER  = 80;
  const int WAVE_ITER = 4;

  void main() {
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    uv = vec2(
      uPillarRotCos * uv.x - uPillarRotSin * uv.y,
      uPillarRotSin * uv.x + uPillarRotCos * uv.y
    );

    vec3 ro = vec3(0.0, 0.0, -10.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    float rotC = uRotCos;
    float rotS = uRotSin;
    if (uInteractive && (uMouse.x != 0.0 || uMouse.y != 0.0)) {
      float a = uMouse.x * 6.283185;
      rotC = cos(a);
      rotS = sin(a);
    }

    vec3 col = vec3(0.0);
    float t = 0.1;

    for (int i = 0; i < MAX_ITER; i++) {
      vec3 p = ro + rd * t;
      p.xz = vec2(rotC * p.x - rotS * p.z, rotS * p.x + rotC * p.z);

      vec3 q = p;
      q.y = p.y * uPillarHeight + uTime;

      float freq = 1.0;
      float amp  = 1.0;
      for (int j = 0; j < WAVE_ITER; j++) {
        q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z, uWaveSin * q.x + uWaveCos * q.z);
        q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;
        freq *= 2.0;
        amp  *= 0.5;
      }

      float d     = length(cos(q.xz)) - 0.2;
      float bound = length(p.xz) - uPillarWidth;
      float k     = 4.0;
      float h     = max(k - abs(d - bound), 0.0);
      d = max(d, bound) + h * h * 0.0625 / k;
      d = abs(d) * 0.15 + 0.01;

      float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);
      col += mix(uBottomColor, uTopColor, grad) / d;

      t += d;
      if (t > 50.0) break;
    }

    float widthNorm = uPillarWidth / 3.0;
    col = tanh(col * uGlowAmount / widthNorm);

    col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453)
           / 15.0 * uNoiseIntensity;

    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToVec3(hex: string): THREE.Vector3 {
  const c = new THREE.Color(hex);
  return new THREE.Vector3(c.r, c.g, c.b);
}

// ─── Scene component (raw THREE.js, client-only) ────────────────────────────

function LightPillarScene({
  topColor = '#ff272c',
  bottomColor = '#ff9fa9',
  intensity = 1,
  rotationSpeed = 0.6,
  interactive = false,
  glowAmount = 0.001,
  pillarWidth = 6.5,
  pillarHeight = 0.35,
  noiseIntensity = 1,
  pillarRotation = 45,
  scrollRotationEnabled = true,
  scrollRotationFactor = 30,
  className,
  style,
}: LightPillarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const propsRef = useRef({
    topColor, bottomColor, intensity, rotationSpeed, interactive,
    glowAmount, pillarWidth, pillarHeight, noiseIntensity, pillarRotation,
    scrollRotationEnabled, scrollRotationFactor,
  });

  // Keep props ref in sync so the animation loop always uses latest values
  propsRef.current = {
    topColor, bottomColor, intensity, rotationSpeed, interactive,
    glowAmount, pillarWidth, pillarHeight, noiseIntensity, pillarRotation,
    scrollRotationEnabled, scrollRotationFactor,
  };

  // Reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Pointer handler (stable ref, only used when interactive)
  const handlePointerMove = useCallback((event: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);
  }, []);

  // Attach/detach pointer listener based on `interactive` prop
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !interactive) return;
    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => container.removeEventListener('pointermove', handlePointerMove);
  }, [interactive, handlePointerMove]);

  // Scroll rotation refs and listener
  const scrollTargetRef = useRef(0);
  const currentScrollRef = useRef(0);

  useEffect(() => {
    if (!scrollRotationEnabled || reducedMotion) return;

    const handleScroll = () => {
      // We calculate scroll relative to viewport height so the factor is exactly 'degrees per 100vh'
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const winHeight = window.innerHeight || 1;
      scrollTargetRef.current = scrollTop / winHeight;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollRotationEnabled, reducedMotion]);

  // Main WebGL setup + animation loop
  useEffect(() => {
    const container = containerRef.current;
    console.log('[LightPillar] useEffect fired, container:', container);
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    console.log('[LightPillar] container dimensions:', width, 'x', height);
    if (width === 0 || height === 0) return;

    // Scene + camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false,
      });
    } catch {
      return; // WebGL not supported
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    console.log('[LightPillar] WebGL renderer created, canvas:', renderer.domElement.width, 'x', renderer.domElement.height);

    // Shader material
    const pillarRotRad = (pillarRotation * Math.PI) / 180;

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: mouseRef.current },
        uTopColor: { value: hexToVec3(topColor) },
        uBottomColor: { value: hexToVec3(bottomColor) },
        uIntensity: { value: intensity },
        uInteractive: { value: interactive },
        uGlowAmount: { value: glowAmount },
        uPillarWidth: { value: pillarWidth },
        uPillarHeight: { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uRotCos: { value: 1.0 },
        uRotSin: { value: 0.0 },
        uPillarRotCos: { value: Math.cos(pillarRotRad) },
        uPillarRotSin: { value: Math.sin(pillarRotRad) },
        uWaveSin: { value: Math.sin(0.4) },
        uWaveCos: { value: Math.cos(0.4) },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    materialRef.current = material;

    // Full-screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    geometryRef.current = geometry;
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    let lastTime = performance.now();

    const animate = (now: number) => {
      const mat = materialRef.current;
      const ren = rendererRef.current;
      const scn = sceneRef.current;
      const cam = cameraRef.current;
      if (!mat || !ren || !scn || !cam) return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const p = propsRef.current;

      // Advance time (unless reduced motion)
      if (!reducedMotion) {
        timeRef.current += delta * p.rotationSpeed;
      }
      const t = timeRef.current;

      // Lerp scroll
      if (p.scrollRotationEnabled && !reducedMotion) {
        currentScrollRef.current += (scrollTargetRef.current - currentScrollRef.current) * (1 - Math.exp(-5.0 * delta));
      } else {
        currentScrollRef.current = scrollTargetRef.current; // No easing for reduced motion/disabled
      }

      // Calculate rotation: idle only (remove scroll-linked axial twist)
      const idleRotRad = t * 0.3;

      // Update all uniforms from current props
      const u = mat.uniforms;
      u.uTime.value = t;
      u.uRotCos.value = Math.cos(idleRotRad);
      u.uRotSin.value = Math.sin(idleRotRad);
      u.uTopColor.value.copy(hexToVec3(p.topColor));
      u.uBottomColor.value.copy(hexToVec3(p.bottomColor));
      u.uIntensity.value = p.intensity;
      u.uInteractive.value = p.interactive;
      u.uGlowAmount.value = p.glowAmount;

      // Scroll interpolation: both stop exactly at the same time (e.g., 1.5 viewport heights)
      const progress = Math.min(Math.max(currentScrollRef.current / 1.5, 0), 1.0);
      
      // Width expands to the final state
      const targetWidth = 10.0;
      u.uPillarWidth.value = p.pillarWidth + (targetWidth - p.pillarWidth) * progress;
      u.uPillarHeight.value = p.pillarHeight;
      u.uNoiseIntensity.value = p.noiseIntensity;

      // Rotation goes from initial (e.g., 45) to 0 (vertical)
      const currentRotDeg = p.pillarRotation * (1.0 - progress);
      const rad = (currentRotDeg * Math.PI) / 180;
      u.uPillarRotCos.value = Math.cos(rad);
      u.uPillarRotSin.value = Math.sin(rad);

      u.uMouse.value.copy(mouseRef.current);

      ren.render(scn, cam);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Resize handling
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      if (w === 0 || h === 0) return;
      rendererRef.current?.setSize(w, h);
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(w, h);
      }
    });
    ro.observe(container);

    // Cleanup
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        const domEl = rendererRef.current.domElement;
        if (container.contains(domEl)) {
          container.removeChild(domEl);
        }
      }
      materialRef.current?.dispose();
      geometryRef.current?.dispose();

      rendererRef.current = null;
      materialRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      geometryRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 9999,
        mixBlendMode: 'screen',
        ...style,
      }}
    />
  );
}

// ─── SSR-safe default export via next/dynamic ────────────────────────────────

const LightPillar = dynamic(
  () => Promise.resolve({ default: LightPillarScene }),
  { ssr: false },
);

export default LightPillar;
