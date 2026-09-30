import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMenuGroupStore } from "./menuGroup.store";
import { MENU_GROUP } from "./menuGroup.interface";
import { findMenuGroupById, getMenuGroups } from "./menuGroup.actions";

// Versiones con react-query (data fresca) para selects asíncronos.
export function useMenuGroupsQuery(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [MENU_GROUP.QUERY_KEY, params],
    queryFn: () => getMenuGroups({ params }),
    staleTime: 0,
  });
}

export function useMenuGroupQueryById(id: string) {
  return useQuery({
    queryKey: [MENU_GROUP.QUERY_KEY, "by-id", id],
    queryFn: () => findMenuGroupById(Number(id)),
    select: (response) => response.data,
    enabled: !!id,
  });
}

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
