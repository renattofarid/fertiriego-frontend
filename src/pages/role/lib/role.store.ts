import { create } from "zustand";
import {
  getRoles,
  getAllRoles,
  findRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "./role.actions";
import type {
  RoleResource,
  CreateRoleRequest,
  UpdateRoleRequest,
  GetRolesProps,
} from "./role.interface";
import type { Meta } from "@/lib/pagination.interface";

interface RoleStore {
  roles: RoleResource[] | null;
  role: RoleResource | null;
  allRoles: RoleResource[] | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;
  fetchRoles: (params: GetRolesProps) => Promise<void>;
  fetchAllRoles: () => Promise<void>;
  fetchRoleById: (id: number) => Promise<void>;
  createRole: (data: CreateRoleRequest) => Promise<void>;
  updateRole: (id: number, data: UpdateRoleRequest) => Promise<void>;
  deleteRole: (id: number) => Promise<void>;
  clearState: () => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  roles: null,
  role: null,
  allRoles: null,
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchRoles: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getRoles({ params });
      set({ roles: data, meta: meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar los roles", isLoading: false });
    }
  },

  fetchAllRoles: async () => {
    set({ error: undefined});
    try {
      const data = await getAllRoles();
      set({ allRoles: data });
    } catch {
      set({ error: "Error al cargar todos los roles" });
    }
  },

  fetchRoleById: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findRoleById(id);
      set({ role: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar el rol", isFinding: false });
    }
  },

  createRole: async (data: CreateRoleRequest) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await createRole(data);
    } catch (err) {
      set({ error: "Error al crear el rol" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateRole: async (id: number, data: UpdateRoleRequest) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateRole(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el rol" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteRole: async (id: number) => {
    set({ error: undefined});
    try {
      await deleteRole(id);
    } catch (err) {
      set({ error: "Error al eliminar el rol" });
      throw err;
    }
  },

  clearState: () => {
    set({
      roles: null,
      role: null,
      allRoles: null,
      meta: undefined,
      error: undefined,
    });
  },
}));