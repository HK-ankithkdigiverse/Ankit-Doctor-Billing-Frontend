import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react") || id.includes("scheduler")) return "react-vendor";
          if (id.includes("react-router")) return "router-vendor";
          if (id.includes("antd") || id.includes("@ant-design") || id.includes("rc-")) {
            return "antd-vendor";
          }
          if (id.includes("jspdf") || id.includes("html2pdf")) return "pdf-vendor";
          if (id.includes("axios")) return "http-vendor";
          if (id.includes("@tanstack/react-query")) return "query-vendor";

          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
