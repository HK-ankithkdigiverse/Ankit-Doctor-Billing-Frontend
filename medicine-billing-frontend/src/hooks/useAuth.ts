import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginApi, logoutApi, verifyOtpApi } from "../api/auth.api";
import { ROUTES } from "../constants";
import { clearStoredToken, setStoredToken } from "../helpers/tokenStorage";
import { getLoginBlockReason } from "../utils/authAccess";
import { useAppDispatch } from "../store/hooks";
import { clearAuth, hydrateAuth, setToken, setUser } from "../store/slices/authSlice";
import type { User, VerifyOtpPayload, VerifyOtpResponse } from "../types";

const buildOptimisticUser = (
  apiUser: VerifyOtpResponse["user"] | undefined,
  email: string
): User | null => {
  if (!apiUser?._id || !apiUser?.role) return null;
  const fallbackName = email.split("@")[0]?.trim() || "User";

  return {
    _id: apiUser._id,
    role: apiUser.role,
    email,
    name: fallbackName,
    medicineId: apiUser.medicineId,
    medicalStoreId: apiUser.medicalStoreId ?? null,
  };
};

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
    onSuccess: (data: VerifyOtpResponse, variables: VerifyOtpPayload) => {
      if (!data?.token) return;

      setStoredToken(data.token);
      dispatch(setToken(data.token));
      queryClient.clear();

      const optimisticUser = buildOptimisticUser(data.user, variables.email);
      if (optimisticUser) {
        dispatch(setUser(optimisticUser));
      }

      dispatch(hydrateAuth())
        .unwrap()
        .then((hydratedUser) => {
          const loginBlockReason = getLoginBlockReason(hydratedUser);
          if (!loginBlockReason) return;

          clearAuthState();
          navigate(`${ROUTES.LOGIN}?reason=${loginBlockReason}`, { replace: true });
        })
        .catch(() => {
          // Route guards and API responses handle invalid sessions if hydration fails.
        });
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
