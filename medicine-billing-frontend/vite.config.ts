import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const DEFAULT_API_ORIGIN = "https://ankit-doctor-billing-backend.vercel.app";
const DEFAULT_DEV_PROXY_TARGET = DEFAULT_API_ORIGIN;
const normalizeModuleId = (id: string) => id.replace(/\\/g, "/");

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
      rollupOptions: {
        output: {
          manualChunks(id) {
            const moduleId = normalizeModuleId(id);

            if (moduleId.includes("/node_modules/")) {
              if (
                moduleId.includes("/react/") ||
                moduleId.includes("/react-dom/") ||
                moduleId.includes("/react-router/")
              ) {
                return "vendor-react";
              }

              if (moduleId.includes("/@tanstack/")) {
                return "vendor-query";
              }

              if (
                moduleId.includes("/antd/") ||
                moduleId.includes("/@ant-design/")
              ) {
                return "vendor-antd";
              }

              if (
                moduleId.includes("/@reduxjs/") ||
                moduleId.includes("/react-redux/")
              ) {
                return "vendor-state";
              }
            }

            if (moduleId.includes("/src/api/")) {
              return "app-api";
            }

            if (
              moduleId.includes("/src/utils/") ||
              moduleId.includes("/src/constants/") ||
              moduleId.includes("/src/query/") ||
              moduleId.includes("/src/hooks/queryHelpers.ts")
            ) {
              return "app-shared";
            }

            return undefined;
          },
        },
      },
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
