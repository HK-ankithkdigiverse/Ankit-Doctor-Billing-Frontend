import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DEFAULT_API_ORIGIN = "https://ankit-doctor-billing-backend.vercel.app";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawTarget = (env.VITE_PROXY_TARGET || env.VITE_API_URL || DEFAULT_API_ORIGIN).trim();
  const proxyTarget = rawTarget.replace(/\/+$/, "").replace(/\/api$/i, "");

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
          secure: true,
        },
      },
    },
  };
});
