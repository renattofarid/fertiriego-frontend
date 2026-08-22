import { create } from "zustand";
import {
  getPermissions,
  findPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from "./permission.actions";
import type {
  PermissionResource,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "./permission.interface";
import type { Meta } from "@/lib/pagination.interface";

interface PermissionStore {
  permissions: PermissionResource[] | null;
  permission: PermissionResource | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;
  fetchPermissions: (params?: Record<string, unknown>) => Promise<void>;
  fetchPermissionById: (id: number) => Promise<void>;
  createPermission: (data: CreatePermissionRequest) => Promise<void>;
  updatePermission: (id: number, data: UpdatePermissionRequest) => Promise<void>;
  deletePermission: (id: number) => Promise<void>;
}

export const usePermissionStore = create<PermissionStore>((set) => ({
  permissions: null,
  permission: null,
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchPermissions: async (params) => {
    set({ isLoading: true, error: undefined });
    try {
      const { data, meta } = await getPermissions({ params });
      set({ permissions: data, meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar los permisos", isLoading: false });
    }
  },

  fetchPermissionById: async (id) => {
    set({ isFinding: true, error: undefined });
    try {
      const { data } = await findPermissionById(id);
      set({ permission: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar el permiso", isFinding: false });
    }
  },

  createPermission: async (data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await createPermission(data);
    } catch (err) {
      set({ error: "Error al crear el permiso" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePermission: async (id, data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await updatePermission(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el permiso" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deletePermission: async (id) => {
    set({ error: undefined });
    try {
      await deletePermission(id);
    } catch (err) {
      set({ error: "Error al eliminar el permiso" });
      throw err;
    }
  },
}));
