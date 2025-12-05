import { create } from "zustand";
import {
  findWarehouseById,
  getAllWarehouses,
  getWarehouse,
  storeWarehouse,
  updateWarehouse,
} from "./warehouse.actions";
import type { WarehouseSchema } from "./warehouse.schema";
import type { Meta } from "@/lib/pagination.interface";
import type { WarehouseResource } from "./warehouse.interface";

interface WarehouseStore {
  allWarehouses: WarehouseResource[] | null;
  warehouses: WarehouseResource[] | null;
  warehouse: WarehouseResource | null;
  meta?: Meta;
  isLoadingAll: boolean;
  isLoading: boolean;
  isFinding: boolean;
  error?: string;
  isSubmitting: boolean;
  fetchAllWarehouses: () => Promise<void>;
  fetchWarehouses: (params?: Record<string, any>) => Promise<void>;
  fetchWarehouse: (id: number) => Promise<void>;
  createWarehouse: (data: WarehouseSchema) => Promise<void>;
  updateWarehouse: (id: number, data: WarehouseSchema) => Promise<void>;
}

export const useWarehouseStore = create<WarehouseStore>((set) => ({
  allWarehouses: null,
  warehouse: null,
  warehouses: null,
  meta: undefined,
  isLoadingAll: false,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: undefined,

  fetchWarehouses: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getWarehouse({ params });
      set({ warehouses: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar almacenes", isLoading: false });
    }
  },

  fetchAllWarehouses: async () => {
    set({ isLoadingAll: true, error: undefined});
    try {
      const data = await getAllWarehouses();
      set({ allWarehouses: data, isLoadingAll: false });
    } catch (err) {
      set({ error: "Error al cargar almacenes", isLoadingAll: false });
    }
  },

  fetchWarehouse: async (id: number) => {
    set({ isFinding: true, error: undefined});
    try {
      const { data } = await findWarehouseById(id);
      set({ warehouse: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el almacén", isFinding: false });
    }
  },

  createWarehouse: async (data) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await storeWarehouse(data);
    } catch (err) {
      set({ error: "Error al crear el Almacén" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateWarehouse: async (id: number, data: WarehouseSchema) => {
    set({ isSubmitting: true, error: undefined});
    try {
      await updateWarehouse(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Almacén" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));