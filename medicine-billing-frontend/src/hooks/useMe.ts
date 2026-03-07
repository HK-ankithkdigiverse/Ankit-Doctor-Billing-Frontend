import { selectAuthLoading, selectAuthUser, useAppSelector } from "../store";

export const useMe = () => {
  const data = useAppSelector(selectAuthUser);
  const isLoading = useAppSelector(selectAuthLoading);

  return {
    data,
    isLoading,
  };
};

