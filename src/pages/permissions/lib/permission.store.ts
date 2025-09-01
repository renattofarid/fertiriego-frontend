// stores/typeUserStore.ts
import { create } from "zustand";
import type { Meta } from "@/lib/pagination.interface";
import { ERROR_MESSAGE } from "@/lib/core.function";
import type { ModelInterface } from "@/lib/core.interface";
import type { TypeUserSchema } from "@/pages/type-users/lib/typeUser.schema";
import type { TypeUserResource } from "@/pages/type-users/lib/typeUser.interface";
import {
  getTypeUser,
  storeTypeUser,
  updateTypeUser,
} from "@/pages/type-users/lib/typeUser.actions";
import type { OptionMenuResource } from "./permission.interface";
import { getOptionsMenu } from "./permission.actions";

const MODEL: ModelInterface = {
  name: "Permiso",
  gender: false,
  plural: "Permisos",
};

interface TypeUserStore {
  optionMenus: OptionMenuResource[];
  permissions: TypeUserResource[] | null;
  meta: Meta | null;
  isLoading: boolean;
  isLoadingOption: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchPermissions: (params?: Record<string, any>) => Promise<void>;
  fetchOptionMenus: () => Promise<void>;
  createPermission: (data: TypeUserSchema) => Promise<void>;
  updatePermission: (id: number, data: TypeUserSchema) => Promise<void>;
}

export const usePermissionStore = create<TypeUserStore>((set) => ({
  optionMenus: [],
  permissions: null,
  meta: null,
  isLoading: false,
  isLoadingOption: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchPermissions: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getTypeUser({ params });
      set({ permissions: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar permisos", isLoading: false });
    }
  },

  fetchOptionMenus: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await getOptionsMenu({});
      set({ optionMenus: data, isLoadingOption: false });
    } catch (err) {
      set({
        error: "Error al cargar opciones de menú",
        isLoadingOption: false,
      });
    }
  },

  createPermission: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeTypeUser(data);
    } catch (err: any) {
      set({
        error: err.response.data.message ?? ERROR_MESSAGE(MODEL, "create"),
      });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatePermission: async (id: number, data: TypeUserSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateTypeUser(id, data);
    } catch (err: any) {
      set({
        error: err.response.data.message ?? ERROR_MESSAGE(MODEL, "update"),
      });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
