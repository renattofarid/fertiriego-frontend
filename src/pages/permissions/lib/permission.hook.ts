// hooks/useUsers.ts
import { useEffect } from "react";
import { usePermissionStore } from "./permission.store";

export function usePermissions() {
  const { permissions, isLoading, error, fetchPermissions } =
    usePermissionStore();

  useEffect(() => {
    fetchPermissions();
  }, []);

  return {
    data: permissions,
    isLoading,
    error,
    refetch: fetchPermissions,
  };
}

export function useOptionsMenus() {
  const { optionMenus, isLoadingOption, error, fetchOptionMenus } =
    usePermissionStore();

  useEffect(() => {
    fetchOptionMenus();
  }, []);

  return {
    data: optionMenus,
    isLoadingOption,
    error,
    refetch: fetchOptionMenus,
  };
}
