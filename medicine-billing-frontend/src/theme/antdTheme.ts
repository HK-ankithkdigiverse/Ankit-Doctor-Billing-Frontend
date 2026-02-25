import { theme as antdTheme, type ThemeConfig } from "antd";
import type { ThemeMode } from "../contexts/themeMode";

const commonToken = {
  borderRadius: 12,
  fontSize: 14,
};

export const getAntdThemeConfig = (mode: ThemeMode): ThemeConfig => {
  if (mode === "dark") {
    return {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        ...commonToken,
        colorPrimary: "#38BDF8",
        colorInfo: "#38BDF8",
        colorSuccess: "#34D399",
        colorWarning: "#F59E0B",
        colorError: "#F87171",
        colorBgLayout: "#0B1220",
        colorText: "#E2E8F0",
      },
      components: {
        Layout: {
          headerBg: "#0F172A",
          siderBg: "#0B1220",
        },
        Card: {
          colorBgContainer: "#111827",
        },
        Menu: {
          darkItemBg: "#0B1220",
          darkItemHoverBg: "#1E293B",
          darkItemSelectedBg: "#2563EB",
          darkItemSelectedColor: "#ffffff",
          itemColor: "#CBD5E1",
        },
        Table: {
          headerBg: "#1E293B",
        },
        Input: {
          activeBorderColor: "#38BDF8",
          hoverBorderColor: "#60A5FA",
          colorBorder: "#334155",
          colorBgContainer: "#0F172A",
          colorTextPlaceholder: "#64748B",
          controlHeight: 42,
          paddingInline: 12,
        },
        InputNumber: {
          activeBorderColor: "#38BDF8",
          hoverBorderColor: "#60A5FA",
          colorBorder: "#334155",
          controlHeight: 42,
        },
        Select: {
          activeBorderColor: "#38BDF8",
          hoverBorderColor: "#60A5FA",
          colorBorder: "#334155",
          controlHeight: 42,
          optionSelectedBg: "#0E3A52",
        },
        DatePicker: {
          activeBorderColor: "#38BDF8",
          hoverBorderColor: "#60A5FA",
          colorBorder: "#334155",
          controlHeight: 42,
        },
        Form: {
          labelColor: "#CBD5E1",
          labelFontSize: 14,
        },
      },
    };
  }

  return {
    algorithm: antdTheme.defaultAlgorithm,
    token: {
      ...commonToken,
      colorPrimary: "#0891B2",
      colorInfo: "#0891B2",
      colorSuccess: "#16A34A",
      colorWarning: "#D97706",
      colorError: "#C2410C",
      colorBgLayout: "#EEF2FF",
      colorText: "#1F2937",
    },
    components: {
      Layout: {
        headerBg: "#ffffff",
        siderBg: "#102A43",
      },
      Card: {
        colorBgContainer: "#ffffff",
      },
      Menu: {
        darkItemBg: "#102A43",
        darkItemHoverBg: "#1F3A56",
        darkItemSelectedBg: "#0891B2",
        darkItemSelectedColor: "#ffffff",
        itemColor: "#dbeafe",
      },
      Table: {
        headerBg: "#F8FAFC",
      },
      Input: {
        activeBorderColor: "#0891B2",
        hoverBorderColor: "#0EA5E9",
        colorBorder: "#CBD5E1",
        colorBgContainer: "#FFFFFF",
        colorTextPlaceholder: "#94A3B8",
        controlHeight: 42,
        paddingInline: 12,
      },
      InputNumber: {
        activeBorderColor: "#0891B2",
        hoverBorderColor: "#0EA5E9",
        colorBorder: "#CBD5E1",
        controlHeight: 42,
      },
      Select: {
        activeBorderColor: "#0891B2",
        hoverBorderColor: "#0EA5E9",
        colorBorder: "#CBD5E1",
        controlHeight: 42,
        optionSelectedBg: "#ECFEFF",
      },
      DatePicker: {
        activeBorderColor: "#0891B2",
        hoverBorderColor: "#0EA5E9",
        colorBorder: "#CBD5E1",
        controlHeight: 42,
      },
      Form: {
        labelColor: "#334155",
        labelFontSize: 14,
      },
    },
  };
};

