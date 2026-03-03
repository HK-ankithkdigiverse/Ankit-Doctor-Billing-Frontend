import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import { Provider } from "react-redux";
import App from "./App";
import { getAntdThemeConfig } from "./theme/antdTheme";
import { ThemeModeProvider, useThemeMode } from "./contexts/themeMode";
import { store } from "./store";
import { hydrateAuth } from "./store/slices/authSlice";
import "antd/dist/reset.css";
import "./index.css";

const queryClient = new QueryClient();
store.dispatch(hydrateAuth());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          {/* consume theme mode inside a component so hook rules are respected */}
          <ThemeConfigurator />
        </ThemeModeProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);

function ThemeConfigurator() {
  const { mode } = useThemeMode();
  return (
    <ConfigProvider theme={getAntdThemeConfig(mode)}>
      <AntdApp>
        <App />
      </AntdApp>
    </ConfigProvider>
  );
}
