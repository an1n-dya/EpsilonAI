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

  // The map is stored as an uncompressed 24-bit BMP behind a blob URL.
  // Encoding a PNG took longer than computing the map, and a BMP is just a
  // header in front of the pixels.
  const stride = Math.ceil((w * 3) / 4) * 4;
  const buffer = new ArrayBuffer(54 + stride * h);
  const header = new DataView(buffer);
  header.setUint16(0, 0x424d); // "BM"
  header.setUint32(2, buffer.byteLength, true);
  header.setUint32(10, 54, true);
  header.setUint32(14, 40, true);
  header.setInt32(18, w, true);
  header.setInt32(22, -h, true); // negative height: rows run top to bottom
  header.setUint16(26, 1, true);
  header.setUint16(28, 24, true);
  // Clamped like canvas ImageData, so values round exactly as they used to.
  const pixels = new Uint8ClampedArray(buffer, 54);
  // Mid-grey everywhere is "no displacement", which covers the whole face.
  pixels.fill(128);
  const put = (x: number, y: number, dx: number, dy: number) => {
    const i = y * stride + x * 3; // BGR
    pixels[i + 1] = 128 + dy * 127;
    pixels[i + 2] = 128 + dx * 127;
  };

  const r = Math.min(radius, w / 2, h / 2);
  const hw = w / 2;
  const hh = h / 2;

  // The shape is symmetric about both axes, so work out the top-left
  // quadrant and mirror it, flipping the displacement on the far sides.
  for (let y = 0; y < Math.ceil(hh); y++) {
    for (let x = 0; x < Math.ceil(hw); x++) {
      const px = x + 0.5 - hw;
      const py = y + 0.5 - hh;
      const qx = Math.abs(px) - (hw - r);
      const qy = Math.abs(py) - (hh - r);
      // Signed distance to the rounded rectangle (negative inside).
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const dist = outside + Math.min(Math.max(qx, qy), 0) - r;
      const depth = -dist;
      if (!(depth > 0 && depth < bezel)) continue;

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
      const dx = -nx * mag;
      const dy = -ny * mag;

      const mx = w - 1 - x;
      const my = h - 1 - y;
      put(x, y, dx, dy);
      if (mx !== x) put(mx, y, -dx, dy);
      if (my !== y) put(x, my, dx, -dy);
      if (mx !== x && my !== y) put(mx, my, -dx, -dy);
    }
  }

  const url = URL.createObjectURL(new Blob([buffer], { type: "image/bmp" }));
  if (cache.size >= 16) {
    const [oldKey, oldUrl] = cache.entries().next().value as [string, string];
    cache.delete(oldKey);
    // Free it unless a lens on the page is still showing it.
    if (!document.querySelector(`[href="${oldUrl}"]`)) URL.revokeObjectURL(oldUrl);
  }
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
