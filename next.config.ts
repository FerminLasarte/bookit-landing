import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ikfxokmxmbzfcdzjefzf.supabase.co",
        pathname: "/storage/v1/object/public/assets/**",
      },
    ],
  },
  async redirects() {
    return [
      // Contrato #5: la URL que se está compartiendo hoy tiene que seguir resolviendo.
      // `statusCode: 301` en vez de `permanent: true` (que da 308): es un GET de
      // una página y 301 es lo que esperan los crawlers viejos y el criterio de aceptación.
      { source: "/lista-espera.html", destination: "/lista-espera", statusCode: 301 },
      { source: "/index.html", destination: "/", statusCode: 301 },
    ];
  },
  async headers() {
    return [
      // Contrato #1 y #2: los deep links dependen de que estos dos archivos
      // se sirvan como application/json. `vercel.json` también lo declara;
      // esto lo garantiza en `next start` y en cualquier host.
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
