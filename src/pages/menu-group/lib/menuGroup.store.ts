import { create } from "zustand";
import {
  getMenuGroups,
  getAllMenuGroups,
  findMenuGroupById,
  createMenuGroup,
  updateMenuGroup,
  deleteMenuGroup,
} from "./menuGroup.actions";
import type {
  MenuGroupResource,
  CreateMenuGroupRequest,
  UpdateMenuGroupRequest,
} from "./menuGroup.interface";
import type { Meta } from "@/lib/pagination.interface";

interface MenuGroupStore {
  menuGroups: MenuGroupResource[] | null;
  menuGroup: MenuGroupResource | null;
  allMenuGroups: MenuGroupResource[] | null;
  meta?: Meta;
  isLoading: boolean;
  isFinding: boolean;
  isSubmitting: boolean;
  error?: string;
  fetchMenuGroups: (params?: Record<string, unknown>) => Promise<void>;
  fetchAllMenuGroups: () => Promise<void>;
  fetchMenuGroupById: (id: number) => Promise<void>;
  createMenuGroup: (data: CreateMenuGroupRequest) => Promise<void>;
  updateMenuGroup: (id: number, data: UpdateMenuGroupRequest) => Promise<void>;
  deleteMenuGroup: (id: number) => Promise<void>;
}

export const useMenuGroupStore = create<MenuGroupStore>((set) => ({
  menuGroups: null,
  menuGroup: null,
  allMenuGroups: null,
  meta: undefined,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchMenuGroups: async (params) => {
    set({ isLoading: true, error: undefined });
    try {
      const { data, meta } = await getMenuGroups({ params });
      set({ menuGroups: data, meta, isLoading: false });
    } catch {
      set({ error: "Error al cargar los grupos de menú", isLoading: false });
    }
  },

  fetchAllMenuGroups: async () => {
    set({ error: undefined });
    try {
      const data = await getAllMenuGroups();
      set({ allMenuGroups: data });
    } catch {
      set({ error: "Error al cargar todos los grupos de menú" });
    }
  },

  fetchMenuGroupById: async (id) => {
    set({ isFinding: true, error: undefined });
    try {
      const { data } = await findMenuGroupById(id);
      set({ menuGroup: data, isFinding: false });
    } catch {
      set({ error: "Error al cargar el grupo de menú", isFinding: false });
    }
  },

  createMenuGroup: async (data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await createMenuGroup(data);
    } catch (err) {
      set({ error: "Error al crear el grupo de menú" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateMenuGroup: async (id, data) => {
    set({ isSubmitting: true, error: undefined });
    try {
      await updateMenuGroup(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el grupo de menú" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteMenuGroup: async (id) => {
    set({ error: undefined });
    try {
      await deleteMenuGroup(id);
    } catch (err) {
      set({ error: "Error al eliminar el grupo de menú" });
      throw err;
    }
  },
}));
