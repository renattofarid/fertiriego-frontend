import { useEffect } from "react";
import { useRoleStore } from "./role.store";

export function useRoles(params?: Record<string, unknown>) {
  const { roles, meta, isLoading, error, fetchRoles } =
    useRoleStore();

  useEffect(() => {
    if (!roles) fetchRoles(params);
  }, [roles, fetchRoles]);

  return {
    data: roles,
    meta,
    isLoading,
    error,
    refetch: fetchRoles,
  };
}

export function useAllRoles() {
  const {
    allRoles,
    fetchAllRoles,
  } = useRoleStore();

  useEffect(() => {
    if (!allRoles) {
      fetchAllRoles();
    }
  }, [allRoles, fetchAllRoles]);

  return allRoles;
}

export function useRoleById(id: number) {
  const {
    role,
    isFinding,
    error,
    fetchRoleById,
  } = useRoleStore();

  useEffect(() => {
    if (id) {
      fetchRoleById(id);
    }
  }, [id, fetchRoleById]);

  return {
    data: role,
    isFinding,
    error,
    refetch: () => fetchRoleById(id),
  };
}