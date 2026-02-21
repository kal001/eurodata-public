import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// When frontend runs in Docker, proxy must target the backend service by name.
// When running Vite on the host, proxy targets localhost:8000.
const apiTarget = process.env.VITE_API_PROXY_TARGET || "http://localhost:8000";
// When backend uses API_VERSION (e.g. v1), proxy /api -> /v1/api so same-origin requests work (e.g. ngrok).
const apiProxyPrefix = (process.env.VITE_API_PROXY_PREFIX || "").trim();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appName = env.VITE_APP_NAME || "Bancos";
  const appDescription = env.VITE_APP_DESCRIPTION || "";
  const prefix = (env.VITE_API_PROXY_PREFIX || apiProxyPrefix || "").trim();

  return {
    plugins: [
      react(),
      {
        name: "pwa-manifest-and-html",
        transformIndexHtml(html) {
          let out = html
            .replace(/__VITE_APP_NAME__/g, appName)
            .replace(/__VITE_APP_DESCRIPTION__/g, appDescription);
          if (!appDescription) {
            out = out.replace(/\s*<meta name="description" content=""[^>]*\/>\n?/g, "\n");
          }
          return out;
        },
        writeBundle(options) {
          const outDir = options.dir || "dist";
          const manifest = {
            name: appName,
            short_name: appName,
            ...(appDescription ? { description: appDescription } : {}),
            start_url: "/",
            display: "standalone",
            background_color: "#FFFFFF",
            theme_color: "#2563EB",
            icons: [
              { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
              { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
            ],
          };
          fs.mkdirSync(outDir, { recursive: true });
          fs.writeFileSync(
            path.join(outDir, "manifest.json"),
            JSON.stringify(manifest, null, 2)
          );
        },
      },
    ],
    server: {
      allowedHosts: true, // allow ngrok and other tunnel hosts (URL changes each run)
      proxy: {
        "/api": prefix
          ? { target: apiTarget, rewrite: (path) => `/${prefix}${path}` }
          : apiTarget,
      },
    },
  };
});
