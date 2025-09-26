import { create } from "zustand";
import {
  getUnitById,
  getUnits,
  createUnit,
  updateUnit,
} from "./unit.actions";
import type { UnitSchema } from "./unit.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { UnitResource } from "./unit.interface";

interface UnitStore {
  allUnits: UnitResource[] | null;
  units: UnitResource[] | null;
  unit: UnitResource | null;
  meta: Meta | null;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchAllUnits: () => Promise<void>;
  fetchUnits: (params?: Record<string, any>) => Promise<void>;
  fetchUnit: (id: number) => Promise<void>;
  createUnit: (data: UnitSchema) => Promise<void>;
  updateUnit: (id: number, data: UnitSchema) => Promise<void>;
}

export const useUnitStore = create<UnitStore>((set) => ({
  allUnits: null,
  unit: null,
  units: null,
  meta: null,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchUnits: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getUnits({ params });
      set({ units: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar unidades", isLoading: false });
    }
  },

  fetchAllUnits: async () => {
    set({ isLoadingAll: true, error: null });
    try {
      const { data } = await getUnits();
      set({ allUnits: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar unidades", isLoadingAll: false });
    }
  },

  fetchUnit: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await getUnitById(id);
      set({ unit: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar la unidad", isFinding: false });
    }
  },

  createUnit: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await createUnit(data);
    } catch (err) {
      set({ error: "Error al crear la Unidad" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateUnit: async (id: number, data: UnitSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateUnit(id, data);
    } catch (err) {
      set({ error: "Error al actualizar la Unidad" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));