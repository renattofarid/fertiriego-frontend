import { useEffect } from "react";
import { useMenuGroupStore } from "./menuGroup.store";

export function useMenuGroups(params?: Record<string, unknown>) {
  const { menuGroups, meta, isLoading, error, fetchMenuGroups } =
    useMenuGroupStore();

  useEffect(() => {
    if (!menuGroups) fetchMenuGroups(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuGroups, fetchMenuGroups]);

  return {
    data: menuGroups,
    meta,
    isLoading,
    error,
    refetch: fetchMenuGroups,
  };
}

export function useAllMenuGroups() {
  const { allMenuGroups, fetchAllMenuGroups } = useMenuGroupStore();

  useEffect(() => {
    if (!allMenuGroups) fetchAllMenuGroups();
  }, [allMenuGroups, fetchAllMenuGroups]);

  return allMenuGroups ?? [];
}

export function useMenuGroupById(id: number) {
  const { menuGroup, isFinding, error, fetchMenuGroupById } =
    useMenuGroupStore();

  useEffect(() => {
    if (id) fetchMenuGroupById(id);
  }, [id, fetchMenuGroupById]);

  return {
    data: menuGroup,
    isFinding,
    error,
    refetch: () => fetchMenuGroupById(id),
  };
}
