import { create } from "zustand";
import {
  findBoxById,
  getAllBoxes,
  getBox,
  storeBox,
  updateBox,
} from "./box.actions";
import type { BoxSchema } from "./box.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { BoxResource } from "./box.interface";

interface BoxStore {
  allBoxes: BoxResource[] | null;
  boxes: BoxResource[] | null;
  box: BoxResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllBoxes: () => Promise<void>;
  fetchBoxes: (params?: Record<string, any>) => Promise<void>;
  fetchBox: (id: number) => Promise<void>;
  createBox: (data: BoxSchema) => Promise<void>;
  updateBox: (id: number, data: BoxSchema) => Promise<void>;
}

export const useBoxStore = create<BoxStore>((set) => ({
  allBoxes: null,
  box: null,
  boxes: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchBoxes: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getBox({ params });
      set({ boxes: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar cajas", isLoading: false });
    }
  },

  fetchAllBoxes: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const data = await getAllBoxes();
      set({ allBoxes: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar cajas", isLoadingAll: false });
    }
  },

  fetchBox: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findBoxById(id);
      set({ box: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la caja", isFinding: false });
    }
  },

  createBox: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await storeBox(data);
    } catch (err) {
      set({ error: "Error al crear la Caja" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateBox: async (id: number, data: BoxSchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateBox(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Caja" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));