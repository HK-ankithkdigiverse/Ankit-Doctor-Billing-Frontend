import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi, verifyOtpApi, logoutApi } from "../api/auth.api";
import { QUERY_KEYS, ROUTES, STORAGE_KEYS } from "../constants";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();


  const login = useMutation({
    mutationFn: loginApi,
  });

  const verifyOtp = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (data: any) => {
      if (!data?.token) return;

      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem("token", data.token);

      // 🔁 refetch logged-in user
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ME });

      navigate("/dashboard");
    },
  });

  const clearAuthState = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem("token");

    queryClient.removeQueries({ queryKey: QUERY_KEYS.ME });
    queryClient.removeQueries({ queryKey: QUERY_KEYS.PROFILE });
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
