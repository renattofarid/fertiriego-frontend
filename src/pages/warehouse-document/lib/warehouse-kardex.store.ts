import { create } from "zustand";
import {
  getWarehouseKardex,
  getKardexByProduct,
  getValuatedInventory,
} from "./warehouse-kardex.actions";
import type { Meta } from "@/lib/pagination.interface";
import type {
  WarehouseKardexResource,
  KardexByProductResource,
  ValuatedInventoryItem,
} from "./warehouse-kardex.interface";

interface WarehouseKardexStore {
  kardexList: WarehouseKardexResource[] | null;
  kardexByProduct: KardexByProductResource | null;
  valuatedInventory: ValuatedInventoryItem[] | null;
  meta?: Meta;
  isLoading: boolean;
  isLoadingProduct: boolean;
  isLoadingInventory: boolean;
  error?: string;
  fetchKardex: (params?: Record<string, any>) => Promise<void>;
  fetchKardexByProduct: (productId: number) => Promise<void>;
  fetchValuatedInventory: (params?: Record<string, any>) => Promise<void>;
}

export const useWarehouseKardexStore = create<WarehouseKardexStore>((set) => ({
  kardexList: null,
  kardexByProduct: null,
  valuatedInventory: null,
  meta: undefined,
  isLoading: false,
  isLoadingProduct: false,
  isLoadingInventory: false,
  error: undefined,

  fetchKardex: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: undefined});
    try {
      const { data, meta } = await getWarehouseKardex({ params });
      set({ kardexList: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar el kardex", isLoading: false });
    }
  },

  fetchKardexByProduct: async (productId: number) => {
    set({ isLoadingProduct: true, error: undefined});
    try {
      const { data } = await getKardexByProduct(productId);
      set({ kardexByProduct: data, isLoadingProduct: false });
    } catch (err) {
      set({
        error: "Error al cargar el kardex del producto",
        isLoadingProduct: false,
      });
    }
  },

  fetchValuatedInventory: async (params?: Record<string, any>) => {
    set({ isLoadingInventory: true, error: undefined});
    try {
      const { data, meta } = await getValuatedInventory(params);
      set({ valuatedInventory: data, meta: meta, isLoadingInventory: false });
    } catch (err) {
      set({
        error: "Error al cargar el inventario valorizado",
        isLoadingInventory: false,
      });
    }
  },
}));
