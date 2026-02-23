import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntdApp, ConfigProvider } from "antd";
import App from "./App";
import "antd/dist/reset.css";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#1E6F5C",
            colorInfo: "#1E6F5C",
            colorSuccess: "#2E8B57",
            colorWarning: "#D97706",
            colorError: "#C2410C",
            borderRadius: 12,
            fontSize: 14,
            colorBgLayout: "#EEF2F6",
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
              darkItemSelectedBg: "#1E6F5C",
              darkItemSelectedColor: "#ffffff",
              itemColor: "#dbeafe",
            },
            Table: {
              headerBg: "#F8FAFC",
            },
            Input: {
              activeBorderColor: "#1E6F5C",
              hoverBorderColor: "#2A7E6A",
              colorBorder: "#CBD5E1",
              colorBgContainer: "#FFFFFF",
              colorTextPlaceholder: "#94A3B8",
              controlHeight: 42,
              paddingInline: 12,
            },
            InputNumber: {
              activeBorderColor: "#1E6F5C",
              hoverBorderColor: "#2A7E6A",
              colorBorder: "#CBD5E1",
              controlHeight: 42,
            },
            Select: {
              activeBorderColor: "#1E6F5C",
              hoverBorderColor: "#2A7E6A",
              colorBorder: "#CBD5E1",
              controlHeight: 42,
              optionSelectedBg: "#E6F4F1",
            },
            DatePicker: {
              activeBorderColor: "#1E6F5C",
              hoverBorderColor: "#2A7E6A",
              colorBorder: "#CBD5E1",
              controlHeight: 42,
            },
            Form: {
              labelColor: "#334155",
              labelFontSize: 14,
            },
          },
        }}
      >
        <AntdApp>
        <App />
      </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
