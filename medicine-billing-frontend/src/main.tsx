import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import App from "./App";
import { ThemeModeProvider, useThemeMode } from "./contexts/themeMode";
import { getAntdThemeConfig } from "./theme/antdTheme";
import "antd/dist/reset.css";
import "./index.css";

const queryClient = new QueryClient();

const ThemedApp = () => {
  const { mode } = useThemeMode();

  return (
    <ConfigProvider theme={getAntdThemeConfig(mode)}>
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
