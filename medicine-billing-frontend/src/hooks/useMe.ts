import { useAppSelector } from "../store/hooks";
import { selectAuthLoading, selectAuthUser } from "../store/slices/authSlice";

export const useMe = () => {
  const data = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);

  return {
    data,
    isLoading,
  };
};
