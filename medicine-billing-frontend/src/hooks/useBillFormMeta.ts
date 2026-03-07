import { useMemo } from "react";
import { ROLE } from "../constants";
import { useAllCompanies } from "./useCompanies";
import { useMe } from "./useMe";
import { useAllUsers } from "./useUsers";
import { mapUsersToSelectOptions } from "../utils/billing";

export const useBillFormMeta = () => {
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const companiesQuery = useAllCompanies();
  const usersQuery = useAllUsers("all");

  const companies = companiesQuery.data?.companies ?? [];
  const users = useMemo(
    () => mapUsersToSelectOptions(usersQuery.data?.users, true),
    [usersQuery.data?.users]
  );

  return {
    isAdmin,
    companies,
    users,
    isLoading: companiesQuery.isLoading || (isAdmin && usersQuery.isLoading),
  };
};
