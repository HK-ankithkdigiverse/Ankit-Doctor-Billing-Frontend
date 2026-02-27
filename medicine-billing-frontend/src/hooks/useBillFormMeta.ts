import { useMemo } from "react";
import { ROLE } from "../constants";
import { useCompanies } from "./useCompanies";
import { useMe } from "./useMe";
import { useUsers } from "./useUsers";
import { mapUsersToSelectOptions } from "../utils/billing";

export const useBillFormMeta = () => {
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const companiesQuery = useCompanies(1, 1000, "");
  const usersQuery = useUsers(1, 1000, "", "all");

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
