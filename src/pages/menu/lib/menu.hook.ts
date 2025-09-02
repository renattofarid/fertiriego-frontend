// hooks/useUsers.ts
import { useEffect } from "react";
import { usePermissionStore } from "./menu.store";

export function useOptionsMenus() {
  const { optionMenus, isLoading, error, fetchOptionMenus } =
    usePermissionStore();

  useEffect(() => {
    fetchOptionMenus();
  }, []);

  return {
    data: optionMenus,
    isLoading,
    error,
    refetch: fetchOptionMenus,
  };
}
