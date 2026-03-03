import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types";
import { clearStoredToken, getStoredToken } from "../../helpers/tokenStorage";
import { fetchCurrentUser } from "../../services/authService";
import type { RootState } from "../index";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type AuthState = {
  token: string;
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  initialized: boolean;
};

const initialToken = getStoredToken();

const initialState: AuthState = {
  token: initialToken,
  user: null,
  status: initialToken ? "loading" : "unauthenticated",
  isLoading: Boolean(initialToken),
  initialized: !initialToken,
};

export const hydrateAuth = createAsyncThunk<User | null>("auth/hydrate", async () => {
  const token = getStoredToken();
  if (!token) return null;

  const user = await fetchCurrentUser();
  if (!user) {
    clearStoredToken();
  }
  return user;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      if (action.payload) {
        state.status = "loading";
        state.isLoading = true;
        state.initialized = false;
      } else {
        state.user = null;
        state.status = "unauthenticated";
        state.isLoading = false;
        state.initialized = true;
      }
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.status = action.payload ? "authenticated" : "unauthenticated";
      state.isLoading = false;
      state.initialized = true;
    },
    clearAuth(state) {
      state.token = "";
      state.user = null;
      state.status = "unauthenticated";
      state.isLoading = false;
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.status = "loading";
        state.isLoading = true;
        state.initialized = false;
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload ? getStoredToken() : "";
        state.status = action.payload ? "authenticated" : "unauthenticated";
        state.isLoading = false;
        state.initialized = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.token = "";
        state.user = null;
        state.status = "unauthenticated";
        state.isLoading = false;
        state.initialized = true;
      });
  },
});

export const { setToken, setUser, clearAuth } = authSlice.actions;

export const selectAuthState = (state: RootState) => state.auth as AuthState;
export const selectAuthUser = (state: RootState) => (state.auth as AuthState).user;
export const selectIsAuthenticated = (state: RootState) => Boolean((state.auth as AuthState).user);
export const selectAuthLoading = (state: RootState) => (state.auth as AuthState).isLoading;
export const selectAuthInitialized = (state: RootState) => (state.auth as AuthState).initialized;

export default authSlice.reducer;