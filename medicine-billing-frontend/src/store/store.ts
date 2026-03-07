import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";

export const createAppStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: import.meta.env.DEV,
  });

export const store = createAppStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
