import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutApi, verifyOtpApi } from "../modules/auth/api";
import { ROUTES } from "../constants";
import { clearStoredToken, setStoredToken } from "../common/helpers/tokenStorage";
import { useAppDispatch } from "../store/hooks";
import { clearAuth, hydrateAuth, setToken } from "../store/slices/authSlice";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
      await dispatch(hydrateAuth());
    },
  });

  const clearAuthState = () => {
    clearStoredToken();
    dispatch(clearAuth());
    queryClient.clear();
  };

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


