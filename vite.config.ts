// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// Never set ssr.external or resolve.external: the Worker has no runtime module resolution, so
// the build fails. Never add compression (compressPublicAssets, vite-plugin-compression):
// hosting already compresses at the edge.
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      // Offline support. Registration lives only in src/lib/pwa-register.ts.
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        manifest: false, // public/manifest.webmanifest is the source of truth
        devOptions: { enabled: false },
        filename: "sw.js",
        outDir: "dist/client", // the folder the site is served from
        // Only hashed same-origin build assets and icons are precached.
        workbox: {
          globDirectory: "dist/client",
          globPatterns: ["**/*.{js,css,png,ico,svg,jpg,woff2,webmanifest}"],
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Pages: always try the network first, fall back to the saved copy offline.
              urlPattern: ({ request, url, sameOrigin }) =>
                sameOrigin &&
                !url.pathname.startsWith("/~oauth") &&
                (request.mode === "navigate" || ["/", "/train", "/predict", "/about"].includes(url.pathname)),
              handler: "NetworkFirst",
              options: { cacheName: "iris-pages", networkTimeoutSeconds: 4 },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
              handler: "StaleWhileRevalidate",
              options: { cacheName: "iris-fonts" },
            },
          ],
        },
      }),
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
