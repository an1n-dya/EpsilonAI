"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The light behind the glass: ribbons of colour flowing through a
 * domain-warped noise field, rendered with a small WebGL fragment shader.
 *
 * It draws at a fraction of screen resolution (it's soft anyway), caps its
 * frame rate, pauses when the tab is hidden and renders one still frame when
 * the user prefers reduced motion. Without WebGL a CSS gradient stands in.
 */

type Mood = "vivid" | "calm";

const MOODS: Record<Mood, { intensity: number; speed: number; fps: number }> = {
  vivid: { intensity: 1, speed: 1, fps: 45 },
  calm: { intensity: 0.62, speed: 0.55, fps: 24 },
};

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uIntensity;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
    mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0)), f - vec2(1.0)), u.x),
    u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec3 dusk(float t) {
  vec3 iris  = vec3(0.486, 0.424, 1.000);
  vec3 rose  = vec3(1.000, 0.310, 0.482);
  vec3 ember = vec3(1.000, 0.416, 0.239);
  vec3 flare = vec3(1.000, 0.710, 0.278);
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(iris, rose, smoothstep(0.0, 0.38, t));
  c = mix(c, ember, smoothstep(0.38, 0.7, t));
  return mix(c, flare, smoothstep(0.7, 1.0, t));
}

// A silk ribbon: a lit band whose surface folds as it travels, with a bright
// rim on each edge and a soft halo of scattered light around it.
vec3 silk(float d, float halfWidth, float fold, vec3 tint) {
  float x = d / halfWidth;
  float body = smoothstep(1.0, 0.55, abs(x));
  float shade = 0.18 + 0.82 * pow(0.5 + 0.5 * sin(fold + x * 1.7), 2.2);
  // Squared by hand: pow() is undefined for a negative base, and some
  // mobile GPUs return NaN for it.
  float r = (abs(x) - 0.86) * 9.0;
  float rim = exp(-r * r) * 0.9;
  float halo = exp(-x * x * 0.22) * 0.11;
  return tint * (body * shade + rim * (0.35 + 0.65 * shade) + halo);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float s = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / s;
  vec2 m = (uPointer - 0.5) * uRes / s;
  float t = uTime;

  // The pointer is a faint gravity well in the current.
  vec2 toM = m - p;
  p += toM * 0.07 * exp(-dot(toM, toM) * 3.0);

  // Gentle, large-scale warp: long ribbons, not marble.
  float w1 = fbm(p * 0.55 + vec2(t * 0.045, -t * 0.03));
  float w2 = fbm(p * 0.9 + vec2(-t * 0.035, t * 0.05) + 4.0);
  float bend = 0.55 * w1 + 0.18 * w2 + 0.12 * sin(p.x * 1.6 + t * 0.21);

  // Ribbons sweep from lower left to upper right.
  float flow = p.y - p.x * 0.62 + bend;
  float along = p.x * 1.25 + p.y * 0.4;

  vec3 col = vec3(0.008, 0.009, 0.016);

  // Main ribbon: warm, wide, folding through rose, ember and flare.
  float hwA = 0.085 + 0.05 * sin(along * 1.3 - t * 0.17);
  col += silk(flow + 0.06, hwA, along * 3.2 - t * 0.35 + w2 * 4.0, dusk(0.25 + 0.6 * uv.x + 0.25 * w1)) * 1.1;

  // Counter ribbon: cool tide into iris.
  float hwB = 0.05 + 0.03 * cos(along * 1.7 + t * 0.13);
  vec3 cool = mix(vec3(0.27, 0.85, 1.0), vec3(0.49, 0.42, 1.0), smoothstep(0.2, 0.9, uv.x + w1 * 0.5));
  col += silk(flow + 0.5 + 0.1 * w2, hwB, along * 4.1 + t * 0.28, cool) * 0.9;

  // A thin filament of flare running ahead of the main ribbon.
  col += silk(flow - 0.32 - 0.08 * w1, 0.016, along * 6.0 - t * 0.5, dusk(0.92)) * 0.75;

  // Faint ambient bloom so the darkness isn't flat.
  col += dusk(0.3 + 0.3 * w1) * 0.03 * smoothstep(0.9, -0.2, abs(flow));

  float vig = smoothstep(1.35, 0.15, length((uv - vec2(0.58, 0.48)) * vec2(1.0, 1.25)));
  col *= mix(0.18, 1.0, vig) * uIntensity;

  col = 1.0 - exp(-col * 1.25);
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + t) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function LiquidBackdrop({ className }: { className?: string }) {
  const pathname = usePathname();
  const mood: Mood = pathname?.startsWith("/chat") ? "calm" : "vivid";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef(mood);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    moodRef.current = mood;
    redrawRef.current();
  }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const program = gl?.createProgram();
    if (!gl || !vs || !fs || !program) {
      fallbackRef.current?.removeAttribute("hidden");
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      fallbackRef.current?.removeAttribute("hidden");
      return;
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uIntensity = gl.getUniformLocation(program, "uIntensity");

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Eased towards the current mood, so page changes cross-fade the light.
    const live = { ...MOODS[moodRef.current] };

    // Soft content: render at roughly half resolution and let CSS upscale.
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };

    const pointer = { x: 0.62, y: 0.6, tx: 0.62, ty: 0.6 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth;
      pointer.ty = 1 - e.clientY / window.innerHeight;
    };

    // Start mid-flow so the first frame is already interesting.
    let time = 40;
    let raf = 0;
    let last = 0;

    const draw = (dt: number) => {
      const target = MOODS[moodRef.current];
      const k = reduceMotion ? 1 : Math.min(1, dt / 600);
      live.intensity += (target.intensity - live.intensity) * k;
      live.speed += (target.speed - live.speed) * k;
      live.fps = target.fps;
      time += (dt / 1000) * live.speed;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      gl.uniform1f(uIntensity, live.intensity);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = now - last;
      // A millisecond of slack: when the cap divides the refresh rate exactly
      // (45 fps at 90 Hz, 24 fps at 120 Hz) a strict test flips between
      // drawing every n-th and every n+1-th frame, and the motion judders.
      if (dt < 1000 / live.fps - 1) return;
      last = now;
      // Clamp so a long pause (hidden tab) doesn't jump the flow.
      draw(Math.min(dt, 100));
    };

    const start = () => {
      cancelAnimationFrame(raf);
      // Paint immediately so there's never a black first frame.
      draw(0);
      if (!reduceMotion) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    redrawRef.current = () => reduceMotion && draw(0);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };

    // Resizing clears the canvas, so repaint straight away rather than show a
    // blank frame until the loop's next turn.
    const ro = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    ro.observe(canvas);
    resize();
    start();
    canvas.dataset.ready = "true";

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      redrawRef.current = () => {};
    };
  }, []);

  return (
    // Sized to the large viewport, so a phone's toolbar sliding in and out
    // doesn't resize (and reallocate) the canvas mid-scroll.
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh", className)}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-[1200ms] data-[ready=true]:opacity-100"
      />
      <div
        ref={fallbackRef}
        hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 75% 35%, rgb(255 79 123 / .35), transparent 70%), radial-gradient(50% 45% at 20% 70%, rgb(70 216 255 / .25), transparent 70%), radial-gradient(70% 60% at 60% 90%, rgb(255 181 71 / .2), transparent 70%), #040508",
        }}
      />
    </div>
  );
}
