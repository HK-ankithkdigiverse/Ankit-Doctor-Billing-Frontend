import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DEFAULT_API_ORIGIN = "https://ankit-doctor-billing-backend.vercel.app";
const DEFAULT_DEV_PROXY_TARGET = DEFAULT_API_ORIGIN;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawTarget = (
    env.VITE_PROXY_TARGET ||
    env.VITE_API_URL ||
    (mode === "development" ? DEFAULT_DEV_PROXY_TARGET : DEFAULT_API_ORIGIN)
  ).trim();
  const proxyTarget = rawTarget.replace(/\/+$/, "").replace(/\/api$/i, "");
  const isHttpsTarget = proxyTarget.startsWith("https://");

  return {
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1500,
    },
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: isHttpsTarget,
        },
      },
    },
  };
});
