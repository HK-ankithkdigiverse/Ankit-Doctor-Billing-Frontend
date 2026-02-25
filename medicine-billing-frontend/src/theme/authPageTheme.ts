import { theme as antdTheme, type ThemeConfig } from "antd";
import type { CSSProperties } from "react";

export const authPageTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#1f7a68",
    colorInfo: "#1f7a68",
    colorBgContainer: "#ffffff",
    colorText: "#102a43",
    colorTextPlaceholder: "#94a3b8",
    colorBorder: "#b9d1ca",
    borderRadius: 10,
  },
  components: {
    Card: {
      colorBgContainer: "#ffffff",
    },
    Input: {
      activeBorderColor: "#1f7a68",
      hoverBorderColor: "#2a8f79",
      colorBgContainer: "#ffffff",
      colorText: "#102a43",
      colorBorder: "#b9d1ca",
      colorTextPlaceholder: "#94a3b8",
    },
    Form: {
      labelColor: "#16324a",
    },
  },
};

export const authPageBackground: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(180deg, #0e4e59 0%, #1e7f6f 55%, #89c3b8 100%)",
  padding: 16,
};

export const authPageCardBase: CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid #cfe0db",
  background: "#ffffff",
  boxShadow: "0 20px 45px rgba(12, 52, 57, 0.28)",
};
