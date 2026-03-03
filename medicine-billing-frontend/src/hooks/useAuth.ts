import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutApi, verifyOtpApi } from "../api/auth.api";
import { ROUTES } from "../constants";
import { clearStoredToken, setStoredToken } from "../helpers/tokenStorage";
import { getLoginBlockReason } from "../utils/authAccess";
import { useAppDispatch } from "../store/hooks";
import { clearAuth, hydrateAuth, setToken } from "../store/slices/authSlice";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const clearAuthState = () => {
    clearStoredToken();
    dispatch(clearAuth());
    queryClient.clear();
  };

  const login = useMutation({
    mutationFn: loginApi,
  });

  const verifyOtp = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: async (data: any) => {
      if (!data?.token) return;

      setStoredToken(data.token);
      dispatch(setToken(data.token));
      queryClient.clear();
      const hydratedUser = await dispatch(hydrateAuth()).unwrap();
      const loginBlockReason = getLoginBlockReason(hydratedUser);
      if (!loginBlockReason) return;

      clearAuthState();
      throw new Error(
        loginBlockReason === "store-inactive"
          ? "Your medical store is not active."
          : "Your account is not active."
      );
    },
  });

  const logout = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      clearAuthState();
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      // Even if server logout fails, clear local auth so user is signed out.
      clearAuthState();
      navigate(ROUTES.LOGIN);
    },
  });

  return {
    login: login.mutateAsync,
    verifyOtp: verifyOtp.mutateAsync,
    logout: logout.mutateAsync,
    loading: login.isPending || verifyOtp.isPending || logout.isPending,
  };
};

