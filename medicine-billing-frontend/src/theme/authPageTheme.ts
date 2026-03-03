import type { CSSProperties } from "react";
import type { ThemeConfig } from "antd";

export const authPageTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1e8b7b",
    borderRadius: 10,
    fontFamily: "\"Segoe UI\", \"Inter\", \"Roboto\", sans-serif",
  },
  components: {
    Card: {
      borderRadiusLG: 16,
    },
    Button: {
      borderRadius: 10,
      controlHeight: 42,
      colorPrimary: "#1e8b7b",
      colorPrimaryHover: "#1b7e70",
      colorPrimaryActive: "#16695d",
    },
    Input: {
      controlHeight: 42,
      activeBorderColor: "#1e8b7b",
      hoverBorderColor: "#2a9c8b",
    },
    InputNumber: {
      activeBorderColor: "#1e8b7b",
      hoverBorderColor: "#2a9c8b",
    },
    Select: {
      activeBorderColor: "#1e8b7b",
      hoverBorderColor: "#2a9c8b",
    },
  },
};

export const authPageBackground: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px 16px",
  background: "linear-gradient(180deg, #0f5f66 0%, #1f7f7f 52%, #63ae9f 100%)",
};

export const authPageCardBase: CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid #d9e3ef",
  boxShadow: "0 10px 24px rgba(16, 42, 67, 0.08)",
};
