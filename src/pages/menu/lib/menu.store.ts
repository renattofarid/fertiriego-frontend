// stores/typeUserStore.ts
import { create } from "zustand";
import type { Meta } from "@/lib/pagination.interface";
import type { OptionMenuResource } from "./menu.interface";
import { getOptionsMenu, setAccessTypeUser } from "./menu.actions";

interface TypeUserStore {
  optionMenus: OptionMenuResource[];
  meta: Meta | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchOptionMenus: () => Promise<void>;
  setAccessTypeUser: (id: number, data: any) => Promise<void>;
}

export const usePermissionStore = create<TypeUserStore>((set) => ({
  optionMenus: [],
  permissions: null,
  meta: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchOptionMenus: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOptionsMenu({});
      set({ optionMenus: data, isLoading: false });
    } catch (err) {
      set({
        error: "Error al cargar opciones de menú",
        isLoading: false,
      });
    }
  },

  setAccessTypeUser: async (id: number, data: any) => {
    set({ isSubmitting: true, error: null });
    try {
      await setAccessTypeUser(id, data);
      set({ isSubmitting: false });
    } catch (err) {
      set({
        error: "Error al actualizar permisos",
        isSubmitting: false,
      });
    }
  },
}));
