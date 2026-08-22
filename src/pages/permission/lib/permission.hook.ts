import { useEffect } from "react";
import { usePermissionStore } from "./permission.store";

export function usePermissions(params?: Record<string, unknown>) {
  const { permissions, meta, isLoading, error, fetchPermissions } =
    usePermissionStore();

  useEffect(() => {
    if (!permissions) fetchPermissions(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions, fetchPermissions]);

  return {
    data: permissions,
    meta,
    isLoading,
    error,
    refetch: fetchPermissions,
  };
}

export function usePermissionById(id: number) {
  const { permission, isFinding, error, fetchPermissionById } =
    usePermissionStore();

  useEffect(() => {
    if (id) fetchPermissionById(id);
  }, [id, fetchPermissionById]);

  return {
    data: permission,
    isFinding,
    error,
    refetch: () => fetchPermissionById(id),
  };
}
