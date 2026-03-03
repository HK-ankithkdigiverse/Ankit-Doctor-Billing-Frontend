import { theme } from "antd";
import type { ThemeConfig } from "antd";

export const getAntdThemeConfig = (): ThemeConfig => ({
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#0891b2",
    colorLink: "#0ea5e9",
    borderRadius: 10,
    fontFamily: "\"Segoe UI\", \"Inter\", \"Roboto\", sans-serif",
  },
  components: {
    Layout: {
      bodyBg: "transparent",
      headerBg: "transparent",
      siderBg: "transparent",
    },
    Card: {
      borderRadiusLG: 14,
    },
    Button: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Input: {
      controlHeight: 42,
    },
    Select: {
      controlHeight: 42,
    },
    Table: {
      headerBg: "#f8fbff",
    },
    Statistic: {
      contentFontSize: 30,
    },
  },
});
