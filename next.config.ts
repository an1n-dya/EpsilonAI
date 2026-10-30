import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Epsilon is a front-end only build: every route is prerendered to static
  // HTML in `out/` and can be served from any static host.
  output: "export",
  // Emit `route/index.html` rather than `route.html`: the export also writes a
  // `route/` folder of RSC payloads, and many hosts resolve the folder first.
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
