import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App as AntdApp, ConfigProvider } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { Router } from "./routers/appRouter";
import { queryClient } from "./query";
import { hydrateAuth, store } from "./store";
import { getAntdThemeConfig } from "./theme/antdTheme";
import "antd/dist/reset.css";
import "./index.css";

store.dispatch(hydrateAuth());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={getAntdThemeConfig()}>
        <AntdApp>
          <Suspense fallback={<div className="p-6 text-center">Loading page...</div>}>
            <RouterProvider router={Router} />
          </Suspense>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  </Provider>
);

