"use client";

import {
  Fragment,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

/**
 * Real refraction for glass surfaces.
 *
 * We build a displacement map for the element's exact size and shape: inside
 * a band along the edge (the "bezel") each pixel stores a direction along the
 * surface normal, stronger towards the rim, like the curved edge of a thick
 * piece of glass. An SVG <feDisplacementMap> then bends the backdrop through
 * that map, and the result is applied with `backdrop-filter: url(#…)`.
 *
 * Only Chromium supports SVG filters in backdrop-filter, so everywhere else
 * this hook does nothing and the CSS frosted glass stands on its own.
 */

export type LensOptions = {
  /** Corner radius in px. Use a large number for pills and circles. */
  radius: number;
  /** Width of the refracting edge, in px. */
  bezel?: number;
  /** Maximum displacement at the rim, in px. */
  strength?: number;
  blur?: number;
  saturate?: number;
  /** Split the channels slightly at the rim, like real dispersion. */
  dispersion?: boolean;
};

type Navigator_ = Navigator & { userAgentData?: { brands?: { brand: string }[] } };

let supported: boolean | null = null;
function lensSupported() {
  if (supported === null) {
    const brands = (navigator as Navigator_).userAgentData?.brands ?? [];
    // Skip touch-first devices too: the filter is GPU-hungry and phones have
    // better things to spend battery on. They keep the frosted glass.
    supported =
      brands.some((b) => /chromium/i.test(b.brand)) &&
      !window.matchMedia("(pointer: coarse)").matches &&
      !window.matchMedia("(prefers-reduced-transparency: reduce)").matches;
  }
  return supported;
}

const cache = new Map<string, string>();

function displacementMap(w: number, h: number, radius: number, bezel: number) {
  const key = `${w}x${h}:${radius}:${bezel}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const r = Math.min(radius, w / 2, h / 2);
  const hw = w / 2;
  const hh = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r);
      const qy = Math.abs(py) - (hh - r);
      // Signed distance to the rounded rectangle (negative inside).
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const dist = outside + Math.min(Math.max(qx, qy), 0) - r;
      const depth = -dist;

      let dx = 0;
      let dy = 0;
      if (depth > 0 && depth < bezel) {
        let nx: number;
        let ny: number;
        if (qx > 0 && qy > 0) {
          const l = Math.hypot(qx, qy) || 1;
          nx = qx / l;
          ny = qy / l;
        } else if (qx > qy) {
          nx = 1;
          ny = 0;
        } else {
          nx = 0;
          ny = 1;
        }
        nx *= Math.sign(px) || 1;
        ny *= Math.sign(py) || 1;
        // Convex profile: steep at the rim, flat where the bezel meets the face.
        const t = depth / bezel;
        const mag = (1 - t) ** 2.4;
        dx = -nx * mag;
        dy = -ny * mag;
      }

      const i = (y * w + x) * 4;
      data[i] = 128 + dx * 127;
      data[i + 1] = 128 + dy * 127;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL("image/png");
  if (cache.size > 32) cache.delete(cache.keys().next().value as string);
  cache.set(key, url);
  return url;
}

const CHANNELS = [
  { scale: 1, matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { scale: 0.9, matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { scale: 0.8, matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" },
];

export function useLiquidLens<T extends HTMLElement>(
  options: LensOptions,
): { ref: RefObject<T | null>; filter: ReactNode; active: boolean } {
  const {
    radius,
    bezel = 18,
    strength = 22,
    blur = 4,
    saturate = 160,
    dispersion = false,
  } = options;
  const ref = useRef<T>(null);
  const id = `lens-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [map, setMap] = useState("");

  // Track the element's size.
  useEffect(() => {
    const el = ref.current;
    if (!el || !lensSupported()) return;
    let frame = 0;
    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const box = entry.borderBoxSize?.[0];
      const w = Math.round(box ? box.inlineSize : entry.contentRect.width);
      const h = Math.round(box ? box.blockSize : entry.contentRect.height);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setSize((s) => (s && s.w === w && s.h === h ? s : { w, h })),
      );
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, []);

  // Rebuild the map when the shape changes.
  useEffect(() => {
    if (!size || size.w < 4 || size.h < 4) return;
    setMap(displacementMap(size.w, size.h, radius, bezel));
  }, [size, radius, bezel]);

  // Hand the backdrop to the filter once it exists.
  useEffect(() => {
    const el = ref.current;
    if (!el || !map) return;
    const value = `url(#${id}) blur(${blur}px) saturate(${saturate}%)`;
    el.style.setProperty("backdrop-filter", value);
    el.dataset.lens = "on";
    return () => {
      el.style.removeProperty("backdrop-filter");
      delete el.dataset.lens;
    };
  }, [map, id, blur, saturate]);

  const filter =
    map && size ? (
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <filter
          id={id}
          x="0"
          y="0"
          width={size.w}
          height={size.h}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={map}
            x="0"
            y="0"
            width={size.w}
            height={size.h}
            preserveAspectRatio="none"
            result="map"
          />
          {dispersion ? (
            <>
              {CHANNELS.map((c, i) => (
                <Fragment key={c.matrix}>
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="map"
                    scale={strength * 2 * c.scale}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result={`d${i}`}
                  />
                  <feColorMatrix in={`d${i}`} type="matrix" values={c.matrix} result={`c${i}`} />
                </Fragment>
              ))}
              <feBlend in="c0" in2="c1" mode="screen" result="c01" />
              <feBlend in="c01" in2="c2" mode="screen" />
            </>
          ) : (
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={strength * 2}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          )}
        </filter>
      </svg>
    ) : null;

  return { ref, filter, active: Boolean(map) };
}
